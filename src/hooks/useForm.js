// hooks/useForm.js
import { useState } from 'react';

export const useForm = (initialValues = {}, validate = null) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (callback) => {
        setIsSubmitting(true);
        
        if (validate) {
            const validationErrors = validate(values);
            if (Object.keys(validationErrors).length > 0) {
                setErrors(validationErrors);
                setIsSubmitting(false);
                return;
            }
        }
        
        try {
            await callback(values);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setValues(initialValues);
        setErrors({});
        setIsSubmitting(false);
    };

    const setFieldValue = (name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
    };

    const setFieldError = (name, error) => {
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    return {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
        resetForm,
        setFieldValue,
        setFieldError,
    };
};