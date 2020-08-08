export type Schema = {
    fields: SchemaFields;
    errors: SchemaErrors;
    validators: SchemaValidators;
}

export type SchemaFields = {
    [field: string]: string | boolean;
};

export type SchemaErrors = {
    [field: string]: string
}

export type SchemaValidators = {
    [field: string]: (key: string | boolean) => boolean[] | boolean;
}