/**
 * Custom Hooks - useApi
 */

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

interface UseApiOptions {
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string;
}

interface UseApiReturn<T> {
    data: T | null;
    error: string | null;
    isLoading: boolean;
    execute: (...args: unknown[]) => Promise<T | null>;
    reset: () => void;
}

export function useApi<T>(
    apiFunction: (...args: unknown[]) => Promise<{ data: T; message?: string }>,
    options: UseApiOptions = {}
): UseApiReturn<T> {
    const {
        showSuccessToast = false,
        showErrorToast = true,
        successMessage,
    } = options;

    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const execute = useCallback(
        async (...args: unknown[]): Promise<T | null> => {
            try {
                setIsLoading(true);
                setError(null);

                const response = await apiFunction(...args);
                setData(response.data);

                if (showSuccessToast) {
                    toast.success(successMessage ?? response.message ?? 'Success');
                }

                return response.data;
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : 'An error occurred';
                setError(errorMessage);

                if (showErrorToast) {
                    toast.error(errorMessage);
                }

                return null;
            } finally {
                setIsLoading(false);
            }
        },
        [apiFunction, showSuccessToast, showErrorToast, successMessage]
    );

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setIsLoading(false);
    }, []);

    return {
        data,
        error,
        isLoading,
        execute,
        reset,
    };
}

export default useApi;
