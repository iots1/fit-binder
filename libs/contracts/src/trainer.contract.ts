import type { IAuditFields, Gender } from './common.contract';

export type TrainerStatus = 'active' | 'inactive' | 'suspended';

export type TrainerSpecialty =
    | 'weight_loss'
    | 'muscle_gain'
    | 'strength'
    | 'cardio'
    | 'yoga'
    | 'pilates'
    | 'rehabilitation'
    | 'nutrition';

/** Trainer resource as returned by the trainer-bc API. */
export interface ITrainer extends IAuditFields {
    first_name: string;
    last_name: string;
    email: string;
    phone: string | null;
    gender: Gender | null;
    specialties: TrainerSpecialty[];
    bio: string | null;
    status: TrainerStatus;
}
