// Vendors
import { useCallback, useState } from 'react';

// Types
import { Schema, SchemaErrors, SchemaFields } from './types';

/*
 * @param {object} schema - Body of the validation logic
 * @param {object} schema.fields - Fields to handle
 * @param {object} schema.errors - Your error messages (has to be identical to schema.fields keys
 * @param {object} schema.validators - Functions to handle validations rules (has to be identical to schema.errors keys)
 * @param {function} callback - Will be fired when all errors are solved (or there's no errors directly).
 */
export const useValidatedForm = (schema: Schema, callback: CallableFunction) => {
    const [fields, setFields] = useState<SchemaFields>(schema.fields);
    const [errors, setErrors] = useState<SchemaErrors>({});
    const isDisabled: boolean = Object.keys(schema.errors).some((key: keyof SchemaFields)=> !fields[key]);
    let tempErrors: SchemaErrors = {};

    const handleReset = (clearState: SchemaFields) => {
        setFields({ ...clearState });
    };

    const handleChange = useCallback((field: keyof SchemaFields) => {
        return (value: string) => {
            // If is a boolean input (Checkbox, Radio button, etc...)
            if (value === null) {
                return setFields((oldState: SchemaFields) => ({
                    ...oldState,
                    [field]: !oldState[field]
                }));
            }

            setFields(oldState => ({
                ...oldState,
                [field]: value
            }));
        };
    }, [fields]);

    const handleValidate = (e: any) => {
        e.preventDefault();

        const handleErrors = (field: keyof SchemaFields, message: string) => {
            setErrors((oldErrors: SchemaErrors) => ({
                ...oldErrors,
                [field]: message
            }));

            tempErrors = {
                ...tempErrors,
                [field]: message
            };
        };

        Object.keys(fields).forEach((key: keyof SchemaFields) => {
            const setValidator = schema.validators[key];
            const field = fields[key];

            if (setValidator) {
                const validatorValue = schema.validators[key](field);

                if (Array.isArray(validatorValue)) {
                    let index = null;

                    validatorValue.some((validator: boolean, idx: number) => {
                        if (validator) {
                            index = idx;
                            return true;
                        }

                        return false;
                    });

                    if (index === null) {
                        return handleErrors(key, '');
                    }

                    return handleErrors(key, schema.errors[key][index]);
                }

                if (setValidator(field)) {
                    return handleErrors(key, schema.errors[key]);
                }

                handleErrors(key, '');
            }
        });

        const isValid = !Object.keys(tempErrors).some((key: keyof SchemaErrors) => {
            return tempErrors[key].length > 0;
        });

        if (isValid) {
            const returned = callback();

            // TODO: This can be used for other things.
            if (!returned) { return; }

            if (typeof returned === 'function') {
                returned(setFields);
            } else {
                throw new SyntaxError('Returned value should be a function.');
            }
        }
    };

    return {
        fields,
        errors,
        isDisabled,
        handleValidate,
        handleChange,
        handleReset
    };
};