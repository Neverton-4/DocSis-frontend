import { useState, useCallback, useMemo } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface FieldConfig {
  [fieldName: string]: ValidationRule;
}

export interface ValidationState {
  [fieldName: string]: {
    error: string | null;
    isValid: boolean;
    touched: boolean;
  };
}

export const useFormValidation = (fieldConfigs: FieldConfig) => {
  const [validationState, setValidationState] = useState<ValidationState>(() => {
    const initialState: ValidationState = {};
    Object.keys(fieldConfigs).forEach(fieldName => {
      initialState[fieldName] = {
        error: null,
        isValid: false,
        touched: false
      };
    });
    return initialState;
  });

  const validateField = useCallback((fieldName: string, value: any): string | null => {
    const config = fieldConfigs[fieldName];
    if (!config) return null;

    // Required validation
    if (config.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return 'Este campo é obrigatório';
    }

    // Skip other validations if field is empty and not required
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return null;
    }

    // String validations
    if (typeof value === 'string') {
      // Min length validation
      if (config.minLength && value.length < config.minLength) {
        return `Mínimo de ${config.minLength} caracteres`;
      }

      // Max length validation
      if (config.maxLength && value.length > config.maxLength) {
        return `Máximo de ${config.maxLength} caracteres`;
      }

      // Pattern validation
      if (config.pattern && !config.pattern.test(value)) {
        return 'Formato inválido';
      }
    }

    // Custom validation
    if (config.custom) {
      const customError = config.custom(value);
      if (customError) return customError;
    }

    return null;
  }, [fieldConfigs]);

  const validateSingleField = useCallback((fieldName: string, value: any, markAsTouched = true) => {
    const error = validateField(fieldName, value);
    const isValid = error === null;

    setValidationState(prev => ({
      ...prev,
      [fieldName]: {
        error,
        isValid,
        touched: markAsTouched ? true : prev[fieldName]?.touched || false
      }
    }));

    return { error, isValid };
  }, [validateField]);

  const validateAllFields = useCallback((values: Record<string, any>) => {
    const newValidationState: ValidationState = {};
    let hasErrors = false;

    Object.keys(fieldConfigs).forEach(fieldName => {
      const value = values[fieldName];
      const error = validateField(fieldName, value);
      const isValid = error === null;

      newValidationState[fieldName] = {
        error,
        isValid,
        touched: true
      };

      if (error) hasErrors = true;
    });

    setValidationState(newValidationState);
    return !hasErrors;
  }, [fieldConfigs, validateField]);

  const resetValidation = useCallback(() => {
    const resetState: ValidationState = {};
    Object.keys(fieldConfigs).forEach(fieldName => {
      resetState[fieldName] = {
        error: null,
        isValid: false,
        touched: false
      };
    });
    setValidationState(resetState);
  }, [fieldConfigs]);

  const markFieldAsTouched = useCallback((fieldName: string) => {
    setValidationState(prev => ({
      ...prev,
      [fieldName]: {
        ...prev[fieldName],
        touched: true
      }
    }));
  }, []);

  const isFormValid = useMemo(() => {
    return Object.values(validationState).every(field => field.isValid);
  }, [validationState]);

  const hasErrors = useMemo(() => {
    return Object.values(validationState).some(field => field.error !== null && field.touched);
  }, [validationState]);

  const getFieldError = useCallback((fieldName: string): string | undefined => {
    const field = validationState[fieldName];
    return field?.touched && field?.error ? field.error : undefined;
  }, [validationState]);

  const getFieldSuccess = useCallback((fieldName: string): boolean => {
    const field = validationState[fieldName];
    return field?.touched && field?.isValid || false;
  }, [validationState]);

  return {
    validationState,
    validateSingleField,
    validateAllFields,
    resetValidation,
    markFieldAsTouched,
    isFormValid,
    hasErrors,
    getFieldError,
    getFieldSuccess
  };
};