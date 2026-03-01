/**
 * Utility - Helper functions
 */

/**
 * Format date to locale string
 */
export const formatDate = (
    dateString: string | Date,
    options?: Intl.DateTimeFormatOptions
): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...options,
    });
};

/**
 * Format date and time
 */
export const formatDateTime = (dateString: string | Date): string => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
    const words = name.trim().split(' ');
    if (words.length >= 2) {
        return `${words[0]?.[0] ?? ''}${words[1]?.[0] ?? ''}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

/**
 * Capitalize first letter
 */
export const capitalize = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Title case string
 */
export const titleCase = (str: string): string => {
    return str
        .toLowerCase()
        .split(' ')
        .map((word) => capitalize(word))
        .join(' ');
};

/**
 * Truncate string with ellipsis
 */
export const truncate = (str: string, maxLength: number): string => {
    if (str.length <= maxLength) return str;
    return `${str.substring(0, maxLength - 3)}...`;
};

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => void>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<T>) => {
        if (timeout) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

/**
 * Generate unique ID
 */
export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 */
export const isEmpty = (value: unknown): boolean => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Sleep for specified milliseconds
 */
export const sleep = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * Parse query string parameters
 */
export const parseQueryParams = (
    search: string
): Record<string, string> => {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
        result[key] = value;
    });
    return result;
};

/**
 * Build query string from object
 */
export const buildQueryString = (
    params: Record<string, string | number | boolean | undefined>
): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
        }
    });
    return searchParams.toString();
};
