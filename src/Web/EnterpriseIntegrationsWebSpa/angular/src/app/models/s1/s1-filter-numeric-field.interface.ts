export interface S1FilterNumericFieldInput {
    description: string;
    minTitle: string;
    minPlaceholder: string;
    maxTitle: string;
    maxPlaceholder: string;
    min: number;
    max: number;
}

export interface S1FilterNumericFieldOutput {
    min: number;
    max: number;
}