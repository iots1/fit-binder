module.exports = {
    semi: true,
    trailingComma: 'all',
    singleQuote: true,
    printWidth: 100,
    tabWidth: 4,
    arrowParens: 'always',

    plugins: ['@ianvs/prettier-plugin-sort-imports'],

    importOrder: [
        '^@nestjs/(.*)$',
        '',
        '<THIRD_PARTY_MODULES>',
        '',
        '^@lib/(.*)$',
        '',
        '^@apps/(.*)$',
        '',
        '^[./]',
    ],
    importOrderParserPlugins: ['typescript', 'decorators-legacy'],
};
