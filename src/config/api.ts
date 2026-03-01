/**
 * API Configuration
 */

const resolveBaseUrl = (): string => {
    const envUrl = import.meta.env?.VITE_API_BASE_URL?.trim();
    if (envUrl) return envUrl.replace(/\/+$/, '');

    const isBrowser = typeof window !== 'undefined';
    const isLocalhost = isBrowser && window.location.origin.includes('localhost');

    if (isLocalhost) {
        return 'http://localhost:5000/api/v1';
    }

    if (isBrowser) {
        return `${window.location.origin.replace(/\/+$/, '')}/api/v1`;
    }

    return 'http://localhost:5000/api/v1';
};

export interface ApiConfig {
    baseURL: string;
    timeout: number;
    withCredentials: boolean;
}
//test
export const API_CONFIG: ApiConfig = {
    baseURL: resolveBaseUrl(),
    timeout: 60000,
    withCredentials: true,
};
