/**
 * API-related TypeScript types and interfaces
 */

// Generic API response wrapper
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data: T;
}

// Paginated response
export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
        itemsPerPage: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

// Paginated users response (backend returns 'users' key instead of 'data')
export interface PaginatedUsersResponse<T> {
    users: T[];
    pagination: {
        current: number;
        total: number;
        count: number;
        totalRecords: number;
    };
}

// API error response
export interface ApiError {
    success: false;
    message: string;
    errors?: Record<string, string[]>;
    statusCode?: number;
}

// API configuration
export interface ApiConfig {
    baseURL: string;
    timeout: number;
    withCredentials: boolean;
}

// Request options
export interface RequestOptions {
    showErrorToast?: boolean;
    showSuccessToast?: boolean;
    successMessage?: string;
}

// File upload response
export interface FileUploadResponse {
    url: string;
    publicId?: string;
    fileName?: string;
}

// Notification types
export interface Notification {
    _id: string;
    type: NotificationType;
    title: string;
    message: string;
    permitId?: string;
    userId: string;
    isRead: boolean;
    createdAt: string;
}

export enum NotificationType {
    PERMIT_CREATED = 'permit_created',
    PERMIT_APPROVED = 'permit_approved',
    PERMIT_REJECTED = 'permit_rejected',
    PERMIT_ASSIGNED = 'permit_assigned',
    PERMIT_CANCELLED = 'permit_cancelled',
    PERMIT_RENEWED = 'permit_renewed',
    CLOSURE_INITIATED = 'closure_initiated',
    CLOSURE_APPROVED = 'closure_approved',
    SYSTEM = 'system',
}

// Location types
export interface Location {
    _id: string;
    name: string;
    code: string;
    type: LocationType;
    parent?: string;
    children?: Location[];
    isActive: boolean;
}

export enum LocationType {
    PLANT = 'plant',
    AREA = 'area',
    SUB_AREA = 'sub_area',
    EQUIPMENT = 'equipment',
}

// Email template types
export interface EmailTemplate {
    _id?: string;
    templateNo?: number;
    name?: string;
    title?: string;
    subject: string;
    body: string;
    type?: EmailTemplateType;
    variables?: string[];
    placeholders?: string[];
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export enum EmailTemplateType {
    PERMIT_CREATED = 'permit_created',
    PERMIT_APPROVED = 'permit_approved',
    PERMIT_REJECTED = 'permit_rejected',
    PERMIT_ASSIGNED = 'permit_assigned',
    PERMIT_CANCELLED = 'permit_cancelled',
    PERMIT_RENEWED = 'permit_renewed',
    PASSWORD_RESET = 'password_reset',
    USER_CREATED = 'user_created',
}

// Settings types
export interface AppSettings {
    permitValidity: {
        defaultDurationHours: number;
        maxRenewalCount: number;
    };
    notifications: {
        emailEnabled: boolean;
        smsEnabled: boolean;
        pushEnabled: boolean;
    };
    system: {
        maintenanceMode: boolean;
        maintenanceMessage?: string;
    };
}
