/**
 * Axios API client with typed interceptors and error handling
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';
import { API_CONFIG } from '@/config/api';
import type { ApiResponse, ApiError } from '@/models';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_CONFIG.baseURL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: API_CONFIG.withCredentials,
    timeout: API_CONFIG.timeout,
});

const isBrowser = typeof window !== 'undefined';

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (isBrowser && error.response?.status === 401) {
            localStorage.removeItem('user');
            sessionStorage.removeItem('user');

            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

/**
 * Extract validation errors from API response
 */
const extractValidationErrors = (errors: unknown): string => {
    if (!errors) return '';
    if (Array.isArray(errors)) return errors.join(', ');
    if (typeof errors === 'object') {
        return Object.values(errors as Record<string, string[]>)
            .flat()
            .join(', ');
    }
    return '';
};

/**
 * Extract error message from API error
 */
export const extractErrorMessage = (
    error: unknown,
    fallbackMessage = 'An unexpected error occurred'
): string => {
    if (!error) return fallbackMessage;

    const axiosError = error as AxiosError<ApiError>;

    const serverMessage = axiosError.response?.data?.message;
    if (serverMessage) return serverMessage;

    const validationErrors = extractValidationErrors(
        axiosError.response?.data?.errors
    );
    if (validationErrors) return validationErrors;

    if (axiosError.message) return axiosError.message;

    return fallbackMessage;
};

/**
 * Handle API error - throws with extracted message
 */
export const handleApiError = (
    error: unknown,
    fallbackMessage?: string
): never => {
    throw new Error(extractErrorMessage(error, fallbackMessage));
};

/**
 * Format successful API response
 */
export const formatApiResponse = <T>(
    response: AxiosResponse<{ message?: string; data?: T }>,
    fallbackMessage = 'Request completed successfully'
): ApiResponse<T> => ({
    success: true,
    message: response?.data?.message ?? fallbackMessage,
    data: (response?.data?.data ?? response?.data) as T,
});

export default apiClient;
