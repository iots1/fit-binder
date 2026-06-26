/**
 * TypeORM Query Builder Utility
 *
 * @version 1.0.2
 * @date 2026-03-11
 * @description Transforms REST API query parameters into TypeORM FindManyOptions.
 */

import { BadRequestException } from '@nestjs/common';

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import {
    And,
    Between,
    EntityMetadata,
    Equal,
    FindManyOptions,
    FindOperator,
    FindOptionsOrder,
    FindOptionsSelect,
    FindOptionsWhere,
    ILike,
    In,
    IsNull,
    LessThan,
    LessThanOrEqual,
    MoreThan,
    MoreThanOrEqual,
    Not,
    ObjectLiteral,
    Raw,
    Repository,
} from 'typeorm';

import { QueryParamsDTO } from '@lib/common/dto/query-params.dto';
import { InvalidParameterException } from '@lib/common/utils/http-exception/invalid-parameter.exception';

// ============================================================================
// DAYJS PLUGIN INITIALIZATION
// ============================================================================
dayjs.extend(utc);
dayjs.extend(timezone);

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type SearchOperator = '>' | '>=' | '<' | '<=' | '!=' | 'like' | 'in' | 'between';

type FilterOperator =
    | '$eq'
    | '$ne'
    | '$gt'
    | '$lt'
    | '$gte'
    | '$lte'
    | '$cont'
    | '$starts'
    | '$ends'
    | '$in'
    | '$notin'
    | '$isnull'
    | '$notnull'
    | '$between';

type ComparisonDirection = 'greater' | 'less' | 'equal';

const DATE_COLUMN_TYPES = [
    'timestamp',
    'timestamptz',
    'date',
    'datetime',
    'time',
    'time with time zone',
] as const;

// Operators whose value is compared directly against a date/timestamp column and must
// therefore be validated as a date. Null-checks, membership and text operators are excluded.
const DATE_COMPARISON_FILTER_OPERATORS = new Set<FilterOperator>([
    '$eq',
    '$ne',
    '$gt',
    '$lt',
    '$gte',
    '$lte',
]);
const DATE_COMPARISON_SEARCH_OPERATORS = new Set<SearchOperator>(['>', '>=', '<', '<=', '!=']);

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const VALID_RELATION_PATTERN = /^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*$/;
const DANGEROUS_PROTO_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

// ============================================================================
// MAIN CLASS
// ============================================================================

export class TypeOrmQueryBuilder<T extends ObjectLiteral> {
    private static readonly DEFAULT_TIMEZONE = 'Asia/Bangkok';
    private static readonly DEFAULT_LIMIT = 10;
    private static readonly MIN_LIMIT = 1;
    private static readonly MIN_PAGE = 1;

    private readonly query: QueryParamsDTO;
    private jsonbParamCounter = 0;

    constructor(
        private readonly repository: Repository<T>,
        query: QueryParamsDTO,
    ) {
        this.query = query ?? {};
    }

    build(allowedRelations: string[] = []): FindManyOptions<T> {
        const findOptions: FindManyOptions<T> = {};

        this.applyPagination(findOptions);
        this.applySorting(findOptions);
        this.applyFilters(findOptions);
        this.applyExclusions(findOptions);
        this.applyRelations(findOptions, allowedRelations);
        this.applyFieldSelection(findOptions);

        return findOptions;
    }

    // ========================================================================
    // PAGINATION
    // ========================================================================
    private applyPagination(findOptions: FindManyOptions<T>): void {
        const limit = this.parsePositiveInteger(
            this.query?.limit,
            TypeOrmQueryBuilder.DEFAULT_LIMIT,
            TypeOrmQueryBuilder.MIN_LIMIT,
        );

        const page = this.parsePositiveInteger(
            this.query?.page,
            TypeOrmQueryBuilder.MIN_PAGE,
            TypeOrmQueryBuilder.MIN_PAGE,
        );

        const offset = Number(this.query?.offset);

        findOptions.take = limit;
        findOptions.skip = this.isValidOffset(offset) ? offset : (page - 1) * limit;
    }

    private parsePositiveInteger(value: unknown, defaultValue: number, minValue: number): number {
        const parsed = Number(value);
        if (Number.isNaN(parsed)) return defaultValue;
        return Math.max(minValue, Math.floor(parsed));
    }

    private isValidOffset(offset: number): boolean {
        return !isNaN(offset) && offset >= 0;
    }

    // ========================================================================
    // SORTING
    // ========================================================================
    private applySorting(findOptions: FindManyOptions<T>): void {
        const sortString = this.query?.sort;

        if (!this.isNonEmptyString(sortString)) return;

        findOptions.order = this.parseSortString(sortString);
    }

    private parseSortString(sortString: string): FindOptionsOrder<T> {
        const order: Record<string, 'ASC' | 'DESC'> = {};
        const fields = sortString.split(',');
        const fieldsToValidate: string[] = [];

        for (const field of fields) {
            const [key, direction] = this.parseSortField(field);
            if (key !== null) {
                fieldsToValidate.push(key);
                order[key] = direction;
            }
        }

        // Validate all sort fields to prevent DB 500 errors
        if (fieldsToValidate.length > 0) {
            this.validateFieldNamesRecursive(fieldsToValidate);
        }

        return order as FindOptionsOrder<T>;
    }

    private parseSortField(field: string): [string | null, 'ASC' | 'DESC'] {
        const parts = field.split(':');
        const key = parts[0]?.trim();

        if (key === undefined || key === '') return [null, 'ASC'];

        const rawDirection = parts[1]?.trim()?.toUpperCase();
        const direction = rawDirection === 'DESC' ? 'DESC' : 'ASC';

        return [key, direction];
    }

    // ========================================================================
    // FILTERING
    // ========================================================================
    private applyFilters(findOptions: FindManyOptions<T>): void {
        const searchConditions = this.parseSearchParameter();
        const filterConditions = this.parseFilterParameter();
        const orConditions = this.parseOrParameter();

        const andConditions = this.deepMerge(searchConditions, filterConditions);
        const transformedAndConditions = this.transformNullValues(andConditions);

        findOptions.where = this.combineAndOrConditions(transformedAndConditions, orConditions);
    }

    private combineAndOrConditions(
        andConditions: FindOptionsWhere<T>,
        orConditions: FindOptionsWhere<T>[],
    ): FindOptionsWhere<T> | FindOptionsWhere<T>[] {
        const hasAndConditions = Object.keys(andConditions).length > 0;
        const hasOrConditions = orConditions.length > 0;

        if (!hasAndConditions && !hasOrConditions) return {};
        if (!hasOrConditions) return andConditions;
        if (!hasAndConditions) return orConditions;

        return orConditions.map((orCondition) => this.deepMerge(andConditions, orCondition));
    }

    private deepMerge(
        target: FindOptionsWhere<T>,
        source: FindOptionsWhere<T>,
    ): FindOptionsWhere<T> {
        const result: Record<string, unknown> = { ...target };

        for (const key of Object.keys(source)) {
            const sourceValue = source[key as keyof T];
            const targetValue = result[key];

            if (targetValue === undefined) {
                result[key] = sourceValue;
                continue;
            }

            if (
                this.isPlainObject(sourceValue) &&
                this.isPlainObject(targetValue) &&
                !this.isTypeOrmOperator(sourceValue) &&
                !this.isTypeOrmOperator(targetValue)
            ) {
                result[key] = this.deepMerge(
                    targetValue as FindOptionsWhere<T>,
                    sourceValue as FindOptionsWhere<T>,
                );
                continue;
            }

            result[key] = And(
                this.ensureFindOperator(targetValue),
                this.ensureFindOperator(sourceValue),
            );
        }

        return result as FindOptionsWhere<T>;
    }

    private isPlainObject(value: unknown): boolean {
        return typeof value === 'object' && value !== null && !Array.isArray(value);
    }

    private isTypeOrmOperator(value: unknown): value is FindOperator<unknown> {
        if (!this.isPlainObject(value)) return false;
        const obj = value as Record<string, unknown>;
        return '_type' in obj || '_value' in obj || '_getSql' in obj;
    }

    private ensureFindOperator(value: unknown): FindOperator<unknown> {
        if (this.isTypeOrmOperator(value)) {
            return value;
        }
        return Equal(value);
    }

    // --- Search Parameter ('s') ---
    private parseSearchParameter(): FindOptionsWhere<T> {
        const searchParam = this.query?.s;

        if (searchParam === undefined || searchParam === null) {
            return {};
        }

        if (typeof searchParam !== 'string' && typeof searchParam !== 'object') {
            return {};
        }

        try {
            const conditions = this.parseSearchConditions(searchParam);
            return this.buildSearchWhereClause(conditions);
        } catch (error: unknown) {
            if (error instanceof InvalidParameterException) {
                throw error;
            }
            throw new InvalidParameterException([
                {
                    field: 's',
                    message: 'Invalid search parameter format. Must be a valid JSON string.',
                },
            ]);
        }
    }

    private parseSearchConditions(searchParam: string | object): Record<string, unknown> {
        const parsed =
            typeof searchParam === 'object'
                ? (searchParam as Record<string, unknown>)
                : (JSON.parse(searchParam) as Record<string, unknown>);

        return this.stripDangerousKeys(parsed);
    }

    private stripDangerousKeys(obj: Record<string, unknown>): Record<string, unknown> {
        const sanitized: Record<string, unknown> = {};

        for (const key of Object.keys(obj)) {
            if (DANGEROUS_PROTO_KEYS.has(key)) continue;

            const value = obj[key];
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                sanitized[key] = this.stripDangerousKeys(value as Record<string, unknown>);
            } else {
                sanitized[key] = value;
            }
        }

        return sanitized;
    }

    private buildSearchWhereClause(conditions: Record<string, unknown>): FindOptionsWhere<T> {
        this.validateFieldNamesRecursive(Object.keys(conditions));

        let where: FindOptionsWhere<T> = {};

        for (const key of Object.keys(conditions)) {
            const condition = conditions[key];

            if (this.isJsonbPath(key)) {
                const extracted = this.extractJsonbColumnAndPath(key);
                if (extracted) {
                    const { column, jsonPath } = extracted;
                    const conditionValue = this.buildJsonbSearchCondition(
                        column,
                        jsonPath,
                        condition,
                    );
                    const singleCondition: Record<string, unknown> = {
                        [column]: conditionValue,
                    };
                    where = this.deepMerge(where, singleCondition as FindOptionsWhere<T>);
                }
                continue;
            }

            const isDateColumn = this.isDateColumnRecursive(key);

            const conditionValue = this.buildConditionValue(condition, isDateColumn);

            if (key.includes('.')) {
                this.setNestedValue(
                    where,
                    key,
                    conditionValue,
                );
            } else {
                (where as Record<string, unknown>)[key] = conditionValue;
            }
        }

        return where;
    }

    private setNestedValue(obj: Record<string, unknown>, path: string, value: unknown): void {
        const parts = path.split('.');
        let current = obj;

        for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            if (!(part in current) || !this.isPlainObject(current[part])) {
                current[part] = {};
            }
            current = current[part] as Record<string, unknown>;
        }

        const lastPart = parts[parts.length - 1];
        current[lastPart] = value;
    }

    private buildConditionValue(condition: unknown, isDateColumn: boolean): unknown {
        if (this.isOperatorObject(condition)) {
            return this.processOperatorCondition(
                condition as Record<string, unknown>,
                isDateColumn,
            );
        }

        if (isDateColumn) {
            return this.processDateValue(condition, 'equal');
        }

        return condition;
    }

    private isOperatorObject(condition: unknown): boolean {
        return typeof condition === 'object' && condition !== null && !Array.isArray(condition);
    }

    private processOperatorCondition(
        operatorObj: Record<string, unknown>,
        isDateColumn: boolean,
    ): unknown {
        const operator = Object.keys(operatorObj)[0] as SearchOperator;
        let value = operatorObj[operator];

        if (isDateColumn) {
            if (operator === 'between') {
                value = this.processDateRangeValue(value);
            } else if (DATE_COMPARISON_SEARCH_OPERATORS.has(operator)) {
                // Only comparison operators compare the value against the timestamp column.
                // Operators like 'like'/'in' must not be date-validated here.
                const direction = this.mapSearchOperatorToDirection(operator);
                value = this.processDateValue(value, direction);
            }
        }

        return this.applySearchOperator(operator, value);
    }

    private processDateRangeValue(value: unknown): unknown {
        if (!Array.isArray(value) || value.length !== 2) {
            return value;
        }

        const [start, end] = value as [unknown, unknown];
        const processedStart = this.processDateValue(start, 'greater');
        const processedEnd = this.processDateValue(end, 'less');

        return [processedStart, processedEnd];
    }

    private mapSearchOperatorToDirection(operator: SearchOperator): ComparisonDirection {
        switch (operator) {
            case '>':
            case '>=':
                return 'greater';
            case '<':
            case '<=':
                return 'less';
            default:
                return 'equal';
        }
    }

    private applySearchOperator(operator: SearchOperator, value: unknown): unknown {
        switch (operator) {
            case '>':
                return MoreThan(value);
            case '>=':
                return MoreThanOrEqual(value);
            case '<':
                return LessThan(value);
            case '<=':
                return LessThanOrEqual(value);
            case '!=':
                return Not(value);
            case 'like':
                return ILike(`%${String(value)}%`);
            case 'in':
                return In(Array.isArray(value) ? value : [value]);
            case 'between':
                return this.createBetweenOperator(value);
            default:
                return value;
        }
    }

    private createBetweenOperator(value: unknown): ReturnType<typeof Between> {
        if (!Array.isArray(value) || value.length !== 2) {
            throw new InvalidParameterException([
                {
                    field: 'between',
                    message:
                        'Between operator requires an array with exactly 2 values: [start, end]',
                },
            ]);
        }

        const [start, end] = value as [unknown, unknown];
        return Between(start, end);
    }

    // --- Filter Parameter ---
    private parseFilterParameter(): FindOptionsWhere<T> {
        const filters = this.normalizeFilterInput();

        if (filters.length === 0) return {};

        const parsedFilters = this.parseFilterStrings(filters);

        const fieldNames = parsedFilters.map((f) => f.field);
        this.validateFieldNamesRecursive(fieldNames);

        return this.buildFilterWhereClause(parsedFilters);
    }

    private parseOrParameter(): FindOptionsWhere<T>[] {
        const orFilters = this.normalizeOrInput();

        if (orFilters.length === 0) return [];

        const parsedFilters = this.parseFilterStrings(orFilters);

        if (parsedFilters.length === 0) return [];

        const fieldNames = parsedFilters.map((f) => f.field);
        this.validateFieldNamesRecursive(fieldNames);

        return this.buildOrWhereClause(parsedFilters);
    }

    private normalizeOrInput(): string[] {
        const orParam = this.query?.or as unknown;

        if (orParam === undefined || orParam === null) return [];
        if (typeof orParam === 'string') return orParam.trim().length > 0 ? [orParam] : [];
        if (Array.isArray(orParam)) {
            return orParam.filter((f): f is string => typeof f === 'string' && f.trim().length > 0);
        }

        return [];
    }

    private buildOrWhereClause(
        filters: Array<{ field: string; operator: FilterOperator; value: string }>,
    ): FindOptionsWhere<T>[] {
        const orConditions: FindOptionsWhere<T>[] = [];

        for (const { field, operator, value } of filters) {
            const condition: Record<string, unknown> = {};

            if (this.isJsonbPath(field)) {
                const extracted = this.extractJsonbColumnAndPath(field);
                if (extracted) {
                    const { column, jsonPath } = extracted;
                    condition[column] = this.buildJsonbRawCondition(
                        column,
                        jsonPath,
                        operator,
                        value,
                    );
                }
                const transformedCondition = this.transformNullValues(
                    condition as FindOptionsWhere<T>,
                );
                orConditions.push(transformedCondition);
                continue;
            }

            const isDateColumn = this.isDateColumnRecursive(field);
            const processedValue = isDateColumn
                ? this.processDateValueForFilter(value, operator)
                : value;

            const operatorValue = this.applyFilterOperator(operator, processedValue);

            if (field.includes('.')) {
                this.setNestedValue(condition, field, operatorValue);
            } else {
                condition[field] = operatorValue;
            }

            const transformedCondition = this.transformNullValues(condition as FindOptionsWhere<T>);
            orConditions.push(transformedCondition);
        }

        return orConditions;
    }

    private normalizeFilterInput(): string[] {
        const filter = this.query?.filter as unknown;

        if (filter === undefined || filter === null) return [];
        if (typeof filter === 'string') return filter.trim().length > 0 ? [filter] : [];
        if (Array.isArray(filter)) {
            return filter.filter((f): f is string => typeof f === 'string' && f.trim().length > 0);
        }

        return [];
    }

    private parseFilterStrings(filters: string[]): Array<{
        field: string;
        operator: FilterOperator;
        value: string;
    }> {
        const parsed: Array<{
            field: string;
            operator: FilterOperator;
            value: string;
        }> = [];

        for (const filter of filters) {
            const parts = filter.split('||');

            // Must have at least 3 parts
            if (parts.length < 3) continue;

            const field = parts[0];
            const operator = parts[1];
            // Join the rest in case the value itself contains '||'
            const value = parts.slice(2).join('||');

            const trimmedField = field?.trim() ?? '';
            const trimmedOperator = operator?.trim() ?? '';
            if (trimmedField.length === 0 || trimmedOperator.length === 0) continue;

            parsed.push({
                field: trimmedField,
                operator: trimmedOperator as FilterOperator,
                value: value ?? '',
            });
        }

        return parsed;
    }

    private buildFilterWhereClause(
        filters: Array<{ field: string; operator: FilterOperator; value: string }>,
    ): FindOptionsWhere<T> {
        let where: FindOptionsWhere<T> = {};

        for (const { field, operator, value } of filters) {
            if (this.isJsonbPath(field)) {
                const extracted = this.extractJsonbColumnAndPath(field);
                if (extracted) {
                    const { column, jsonPath } = extracted;
                    const operatorValue = this.buildJsonbRawCondition(
                        column,
                        jsonPath,
                        operator,
                        value,
                    );
                    const singleCondition: Record<string, unknown> = {
                        [column]: operatorValue,
                    };
                    where = this.deepMerge(where, singleCondition as FindOptionsWhere<T>);
                }
                continue;
            }

            const isDateColumn = this.isDateColumnRecursive(field);
            const processedValue = isDateColumn
                ? this.processDateValueForFilter(value, operator)
                : value;

            const operatorValue = this.applyFilterOperator(operator, processedValue);

            // Construct single condition for deepMerge
            const singleCondition: Record<string, unknown> = {};

            if (field.includes('.')) {
                this.setNestedValue(singleCondition, field, operatorValue);
            } else {
                singleCondition[field] = operatorValue;
            }

            // Use deepMerge to properly combine conditions on the same field
            where = this.deepMerge(where, singleCondition as FindOptionsWhere<T>);
        }

        return where;
    }

    private processDateValueForFilter(value: string, operator: FilterOperator): string {
        if (operator === '$between') {
            return this.processDateRangeString(value);
        }

        // Only comparison operators compare the value against the timestamp column.
        // Null-checks ($isnull/$notnull) and membership/text operators must not be date-validated.
        if (!DATE_COMPARISON_FILTER_OPERATORS.has(operator)) {
            return value;
        }

        const direction = this.mapFilterOperatorToDirection(operator);
        const processed = this.processDateValue(value, direction);
        return typeof processed === 'string' ? processed : value;
    }

    private processDateRangeString(value: string): string {
        const parts = value.split(',').map((v) => v.trim());

        if (parts.length !== 2) {
            return value;
        }

        const [start, end] = parts;

        const processedStart = this.processDateValue(start, 'greater');
        const processedEnd = this.processDateValue(end, 'less');

        const startStr = typeof processedStart === 'string' ? processedStart : start;
        const endStr = typeof processedEnd === 'string' ? processedEnd : end;

        return `${startStr},${endStr}`;
    }

    private mapFilterOperatorToDirection(operator: FilterOperator): ComparisonDirection {
        switch (operator) {
            case '$gt':
            case '$gte':
                return 'greater';
            case '$lt':
            case '$lte':
                return 'less';
            default:
                return 'equal';
        }
    }

    private applyFilterOperator(operator: FilterOperator, value: string): unknown {
        switch (operator) {
            case '$eq':
                return value;
            case '$ne':
                return Not(value);
            case '$gt':
                return MoreThan(value);
            case '$lt':
                return LessThan(value);
            case '$gte':
                return MoreThanOrEqual(value);
            case '$lte':
                return LessThanOrEqual(value);
            case '$cont':
                return ILike(`%${value}%`);
            case '$starts':
                return ILike(`${value}%`);
            case '$ends':
                return ILike(`%${value}`);
            case '$in':
                return In(this.parseCommaSeparatedValues(value));
            case '$notin':
                return Not(In(this.parseCommaSeparatedValues(value)));
            case '$isnull':
                return value.toLowerCase() === 'false' ? Not(IsNull()) : IsNull();
            case '$notnull':
                return value.toLowerCase() === 'false' ? IsNull() : Not(IsNull());
            case '$between':
                return this.createBetweenFromString(value);
            default:
                return value;
        }
    }

    private createBetweenFromString(value: string): ReturnType<typeof Between> {
        const parts = this.parseCommaSeparatedValues(value);

        if (parts.length !== 2) {
            throw new InvalidParameterException([
                {
                    field: '$between',
                    message:
                        'Between operator requires exactly 2 comma-separated values: start,end',
                },
            ]);
        }

        const [start, end] = parts;
        return Between(start, end);
    }

    private parseCommaSeparatedValues(value: string): string[] {
        return value
            .split(',')
            .map((v) => v.trim())
            .filter((v) => v.length > 0);
    }

    private transformNullValues(conditions: FindOptionsWhere<T>): FindOptionsWhere<T> {
        const transformed: Record<string, unknown> = {};

        for (const key of Object.keys(conditions)) {
            const value = conditions[key as keyof T];

            if (value === undefined || value === '') {
                transformed[key] = IsNull();
            } else if (this.isPlainObject(value) && !this.isTypeOrmOperator(value)) {
                transformed[key] = this.transformNullValues(value as FindOptionsWhere<T>);
            } else {
                transformed[key] = value;
            }
        }

        return transformed as FindOptionsWhere<T>;
    }

    // ========================================================================
    // DATE PROCESSING
    // ========================================================================
    private get timezone(): string {
        return this.query?.timezone ?? TypeOrmQueryBuilder.DEFAULT_TIMEZONE;
    }

    private isDateColumn(columnName: string): boolean {
        const column = this.repository.metadata.findColumnWithPropertyName(columnName);
        if (column === undefined || column === null) return false;

        return DATE_COLUMN_TYPES.includes(column.type as (typeof DATE_COLUMN_TYPES)[number]);
    }

    private isDateColumnRecursive(fieldPath: string): boolean {
        if (!fieldPath.includes('.')) {
            return this.isDateColumn(fieldPath);
        }

        const parts = fieldPath.split('.');
        let currentMetadata: EntityMetadata = this.repository.metadata;

        for (let i = 0; i < parts.length - 1; i++) {
            const relationName = parts[i];
            const relation = currentMetadata.findRelationWithPropertyPath(relationName);

            if (!relation) return false;

            currentMetadata = relation.inverseEntityMetadata;
        }

        const columnName = parts[parts.length - 1];
        const column = currentMetadata.findColumnWithPropertyName(columnName);

        if (!column) return false;

        return DATE_COLUMN_TYPES.includes(column.type as (typeof DATE_COLUMN_TYPES)[number]);
    }

    private processDateValue(value: unknown, direction: ComparisonDirection): unknown {
        if (typeof value !== 'string') {
            return value;
        }

        // Empty string is converted to IS NULL downstream by transformNullValues — let it pass through.
        if (value.trim() === '') {
            return value;
        }

        const isDateOnly = DATE_ONLY_REGEX.test(value);

        if (isDateOnly) {
            return this.expandDateOnlyValue(value, direction);
        }

        if (dayjs(value).isValid() === true) {
            const hasTimezone = value.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(value);

            if (hasTimezone) {
                return dayjs(value).toISOString();
            }

            return dayjs.tz(value, this.timezone).toISOString();
        }

        // Field targets a date column but the value is not a parseable date.
        // Reject as 400 here instead of letting Postgres throw 22007 (500 + error-level log flood).
        throw new InvalidParameterException([
            {
                field: 'date',
                message: `Invalid date value: '${value}'. Expected an ISO date or datetime string.`,
            },
        ]);
    }

    private expandDateOnlyValue(dateString: string, direction: ComparisonDirection): string {
        const localDate = dayjs.tz(dateString, this.timezone);

        switch (direction) {
            case 'greater':
                return localDate.startOf('day').toISOString();
            case 'less':
                return localDate.endOf('day').toISOString();
            case 'equal':
            default:
                return localDate.startOf('day').toISOString();
        }
    }

    // ========================================================================
    // RELATION LOADING
    // ========================================================================
    private applyRelations(findOptions: FindManyOptions<T>, allowedRelations: string[]): void {
        const relationsParam = this.query?.relations;

        if (!this.isNonEmptyString(relationsParam)) return;

        findOptions.relations = this.validateAndParseRelations(relationsParam, allowedRelations);
    }

    private validateAndParseRelations(
        relationsString: string,
        allowedRelations: string[],
    ): string[] {
        const requested = this.parseCommaSeparatedValues(relationsString);

        if (allowedRelations.length === 0 && requested.length > 0) {
            throw new BadRequestException('No relations are allowed for this endpoint.');
        }

        for (const relation of requested) {
            if (!VALID_RELATION_PATTERN.test(relation)) {
                throw new BadRequestException(
                    `Invalid characters in requested relation: '${relation}'`,
                );
            }

            if (!allowedRelations.includes(relation)) {
                throw new BadRequestException(`Relation not allowed: '${relation}'`);
            }
        }

        return requested;
    }

    // ========================================================================
    // FIELD SELECTION
    // ========================================================================
    private applyFieldSelection(findOptions: FindManyOptions<T>): void {
        const fieldsParam = this.query?.fields;

        if (!this.isNonEmptyString(fieldsParam)) return;

        findOptions.select = this.parseAndValidateFields(fieldsParam) as FindOptionsSelect<T>;
    }

    private parseAndValidateFields(
        fieldsString: string,
    ): Record<string, boolean | Record<string, unknown>> {
        const requestedFields = this.parseCommaSeparatedValues(fieldsString);

        const rootPrimaryColumns = this.repository.metadata.primaryColumns.map(
            (col) => col.propertyName,
        );
        for (const pk of rootPrimaryColumns) {
            if (!requestedFields.includes(pk)) {
                requestedFields.push(pk);
            }
        }

        const selectObject: Record<string, boolean | Record<string, unknown>> = {};

        for (const fieldPath of requestedFields) {
            if (!fieldPath.includes('.')) {
                if (this.isValidColumn(this.repository.metadata, fieldPath)) {
                    selectObject[fieldPath] = true;
                    continue;
                }
                throw new InvalidParameterException([
                    { field: 'fields', message: `Invalid column: '${fieldPath}'` },
                ]);
            }

            this.buildNestedSelect(selectObject, fieldPath);
        }

        return selectObject;
    }

    private buildNestedSelect(
        currentSelect: Record<string, boolean | Record<string, unknown>>,
        path: string,
    ): void {
        const parts = path.split('.');
        let currentMetadata: EntityMetadata = this.repository.metadata;
        let currentLevel: Record<string, unknown> = currentSelect;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLast = i === parts.length - 1;

            if (isLast) {
                if (!this.isValidColumn(currentMetadata, part)) {
                    throw new InvalidParameterException([
                        {
                            field: 'fields',
                            message: `Invalid nested column: '${part}' in path '${path}'`,
                        },
                    ]);
                }
                currentLevel[part] = true;
            } else {
                const relation = currentMetadata.findRelationWithPropertyPath(part);
                if (!relation) {
                    throw new InvalidParameterException([
                        {
                            field: 'fields',
                            message: `Invalid relation: '${part}' in path '${path}'`,
                        },
                    ]);
                }

                if (currentLevel[part] === true) {
                    continue;
                } else if (typeof currentLevel[part] !== 'object' || currentLevel[part] === null) {
                    currentLevel[part] = {};
                }

                const relationMetadata = relation.inverseEntityMetadata;
                const relationPks = relationMetadata.primaryColumns.map((col) => col.propertyName);

                for (const pk of relationPks) {
                    (currentLevel[part] as Record<string, unknown>)[pk] = true;
                }

                currentLevel = currentLevel[part] as Record<string, unknown>;
                currentMetadata = relation.inverseEntityMetadata;
            }
        }
    }

    private isValidColumn(metadata: EntityMetadata, columnName: string): boolean {
        return !!metadata.findColumnWithPropertyName(columnName);
    }

    // ========================================================================
    // VALIDATION HELPERS
    // ========================================================================
    private validateFieldNamesRecursive(fields: string[]): void {
        for (const fieldPath of fields) {
            if (this.isJsonbPath(fieldPath)) {
                continue;
            }

            if (!fieldPath.includes('.')) {
                const validFields = this.getEntityPropertyNames();
                if (!validFields.includes(fieldPath)) {
                    throw new InvalidParameterException([
                        {
                            field: fieldPath,
                            message: `Invalid filter field: '${fieldPath}'. Allowed fields are: [${validFields.join(', ')}]`,
                        },
                    ]);
                }
                continue;
            }

            const parts = fieldPath.split('.');
            let currentMetadata: EntityMetadata = this.repository.metadata;

            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                const isLast = i === parts.length - 1;

                if (isLast) {
                    const column = currentMetadata.findColumnWithPropertyName(part);
                    if (!column) {
                        const validColumns = currentMetadata.columns.map((col) => col.propertyName);
                        throw new InvalidParameterException([
                            {
                                field: fieldPath,
                                message: `Invalid nested column: '${part}' in path '${fieldPath}'. Allowed columns are: [${validColumns.join(', ')}]`,
                            },
                        ]);
                    }
                } else {
                    const relation = currentMetadata.findRelationWithPropertyPath(part);
                    if (!relation) {
                        const validRelations = currentMetadata.relations.map(
                            (rel) => rel.propertyPath,
                        );
                        throw new InvalidParameterException([
                            {
                                field: fieldPath,
                                message: `Invalid relation: '${part}' in path '${fieldPath}'. Allowed relations are: [${validRelations.join(', ')}]`,
                            },
                        ]);
                    }
                    currentMetadata = relation.inverseEntityMetadata;
                }
            }
        }
    }

    private getEntityPropertyNames(): string[] {
        return this.repository.metadata.columns.map((col) => col.propertyName);
    }

    private isNonEmptyString(value: unknown): value is string {
        return typeof value === 'string' && value.length > 0;
    }

    // ========================================================================
    // JSONB HELPERS
    // ========================================================================

    private isJsonbColumn(propertyName: string): boolean {
        const column = this.repository.metadata.findColumnWithPropertyName(propertyName);
        if (!column) return false;
        return column.type === 'jsonb' || column.type === 'json';
    }

    private isJsonbPath(fieldPath: string): boolean {
        const firstSegment = fieldPath.split('.')[0];
        return (
            firstSegment !== undefined &&
            firstSegment.length > 0 &&
            this.isJsonbColumn(firstSegment)
        );
    }

    private extractJsonbColumnAndPath(
        fieldPath: string,
    ): { column: string; jsonPath: string[] } | null {
        const parts = fieldPath.split('.');
        if (parts.length < 2) return null;
        const [column, ...jsonPath] = parts;
        if (!this.isJsonbColumn(column)) return null;
        return { column, jsonPath };
    }

    private buildJsonbRawCondition(
        column: string,
        jsonPath: string[],
        operator: FilterOperator,
        value: string,
    ): FindOperator<unknown> {
        const paramPrefix = `jsonb_${this.jsonbParamCounter++}_`;

        const sqlPath = jsonPath
            .map((segment, index) => {
                const isLast = index === jsonPath.length - 1;
                const safeSegment = segment.replace(/'/g, "''");
                return isLast ? `->>'${safeSegment}'` : `->'${safeSegment}'`;
            })
            .join('');

        const fullAlias = (alias: string): string => {
            const dotIndex = alias.indexOf('.');
            if (dotIndex > 0) {
                const tableAlias = alias.substring(0, dotIndex);
                return `"${tableAlias}"."${column}"${sqlPath}`;
            }
            return `"${column}"${sqlPath}`;
        };

        // Empty string semantics mirror regular columns (IS NULL)
        if ((operator === '$eq' || operator === '$ne') && value === '') {
            if (operator === '$eq') {
                return Raw((alias) => `${fullAlias(alias)} IS NULL`);
            }
            return Raw((alias) => `${fullAlias(alias)} IS NOT NULL`);
        }

        switch (operator) {
            case '$eq': {
                const paramName = `${paramPrefix}v`;
                return Raw((alias) => `${fullAlias(alias)} = :${paramName}`, {
                    [paramName]: value,
                });
            }
            case '$ne': {
                const paramName = `${paramPrefix}v`;
                return Raw((alias) => `${fullAlias(alias)} != :${paramName}`, {
                    [paramName]: value,
                });
            }
            case '$cont': {
                const paramName = `${paramPrefix}v`;
                return Raw((alias) => `${fullAlias(alias)} ILIKE :${paramName}`, {
                    [paramName]: `%${value}%`,
                });
            }
            case '$starts': {
                const paramName = `${paramPrefix}v`;
                return Raw((alias) => `${fullAlias(alias)} ILIKE :${paramName}`, {
                    [paramName]: `${value}%`,
                });
            }
            case '$ends': {
                const paramName = `${paramPrefix}v`;
                return Raw((alias) => `${fullAlias(alias)} ILIKE :${paramName}`, {
                    [paramName]: `%${value}`,
                });
            }
            case '$in': {
                const values = this.parseCommaSeparatedValues(value);
                if (values.length === 0) {
                    return Raw(() => '1 = 0');
                }
                const params: Record<string, string> = {};
                const placeholders = values.map((v, i) => {
                    const pName = `${paramPrefix}i${i}`;
                    params[pName] = v;
                    return `:${pName}`;
                });
                return Raw((alias) => `${fullAlias(alias)} IN (${placeholders.join(',')})`, params);
            }
            case '$isnull': {
                if (value.toLowerCase() === 'false') {
                    return Raw((alias) => `${fullAlias(alias)} IS NOT NULL`);
                }
                return Raw((alias) => `${fullAlias(alias)} IS NULL`);
            }
            case '$notnull': {
                if (value.toLowerCase() === 'false') {
                    return Raw((alias) => `${fullAlias(alias)} IS NULL`);
                }
                return Raw((alias) => `${fullAlias(alias)} IS NOT NULL`);
            }
            default:
                throw new InvalidParameterException([
                    {
                        field: column,
                        message: `Operator '${operator}' is not supported for JSONB fields in this version. Supported: $eq, $ne, $cont, $starts, $ends, $in, $isnull, $notnull.`,
                    },
                ]);
        }
    }

    private buildJsonbSearchCondition(
        column: string,
        jsonPath: string[],
        condition: unknown,
    ): unknown {
        if (this.isOperatorObject(condition)) {
            const operatorObj = condition as Record<string, unknown>;
            const operator = Object.keys(operatorObj)[0] as SearchOperator;
            const rawValue = operatorObj[operator];

            const filterOperator = this.mapSearchOperatorToFilterOperator(operator);
            return this.buildJsonbRawCondition(column, jsonPath, filterOperator, String(rawValue));
        }
        // Plain value -> treat as $eq
        return this.buildJsonbRawCondition(column, jsonPath, '$eq', String(condition));
    }

    private mapSearchOperatorToFilterOperator(operator: SearchOperator): FilterOperator {
        switch (operator) {
            case '!=':
                return '$ne';
            case 'like':
                return '$cont';
            case 'in':
                return '$in';
            default:
                throw new InvalidParameterException([
                    {
                        field: 's',
                        message: `Search operator '${operator}' is not supported for JSONB fields. Supported: !=, like, in.`,
                    },
                ]);
        }
    }

    // ========================================================================
    // EXCLUSIONS
    // ========================================================================
    private applyExclusions(findOptions: FindManyOptions<T>): void {
        const rawExcludeIds = this.query?.exclude_ids;

        if (rawExcludeIds === undefined || rawExcludeIds === null || rawExcludeIds === '') {
            return;
        }

        let excludeIds: string[];
        if (typeof rawExcludeIds === 'string') {
            excludeIds = rawExcludeIds
                .split(',')
                .map((id) => id.trim())
                .filter((id) => id.length > 0);
        } else if (Array.isArray(rawExcludeIds)) {
            excludeIds = (rawExcludeIds as string[]).filter(
                (id: string) => typeof id === 'string' && id.length > 0,
            );
        } else {
            return;
        }

        if (excludeIds.length === 0) {
            return;
        }

        const primaryColumn = this.repository.metadata.primaryColumns[0] as
            | (typeof this.repository.metadata.primaryColumns)[number]
            | undefined;
        if (primaryColumn === undefined) return;
        const pkName = primaryColumn.propertyName;

        const exclusionCondition = {
            [pkName]: Not(In(excludeIds)),
        } as FindOptionsWhere<T>;

        if (!findOptions.where) {
            findOptions.where = exclusionCondition;
        } else if (Array.isArray(findOptions.where)) {
            findOptions.where = findOptions.where.map((cond) =>
                this.deepMerge(cond, exclusionCondition),
            );
        } else {
            findOptions.where = this.deepMerge(findOptions.where, exclusionCondition);
        }
    }
}
