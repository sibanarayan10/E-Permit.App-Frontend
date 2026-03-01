/**
 * Dashboard API Service - API calls for dashboard data
 */

import apiClient, { extractErrorMessage } from './api';
import type { ApiResponse } from '@/models';

// Dashboard Stats Interface
export interface DashboardStats {
    activePermits: number;
    expiringSoon: number;
    needValidation: number;
    pendingExecution: number;
    pendingIssuer: number;
    draftPermits: number;
    returnedPermits: number;
    closedPermits: number;
    totalPermits: number;
    totalGeneral: number;
    totalHeight: number;
}

// Dashboard Permit Interface
export interface DashboardPermit {
    _id: string;
    permitNumber: string;
    protocolNumber?: string;
    permitType: 'general' | 'height';
    status: string;
    currentStage: string;
    description: string;
    createdBy?: {
        _id: string;
        name: string;
        email: string;
        workflowStage?: string;
        profilePicture?: string;
    };
    assignedExecutor?: {
        _id: string;
        name: string;
        email: string;
        profilePicture?: string;
    };
    assignedIssuer?: {
        _id: string;
        name: string;
        email: string;
        profilePicture?: string;
    };
    period?: {
        from: string;
        to: string;
    };
    createdAt: string;
    updatedAt: string;
}

// User Activity Interface
export interface UserActivity {
    user: {
        _id: string;
        name: string;
        email: string;
        workflowStage?: string;
        profilePicture?: string;
    };
    recentActions: {
        action: string;
        actionLabel: string;
        permitNumber: string;
        permitType: string;
        timestamp: string;
    }[];
    totalPermits: number;
}

// Validation Queue Interface
export interface ValidationQueue {
    stats: {
        pendingExecution: number;
        pendingIssuer: number;
        returned: number;
        closurePending: number;
        total: number;
    };
    recentNotifications: {
        _id: string;
        type: string;
        title: string;
        message: string;
        createdAt: string;
        createdBy?: {
            name: string;
            email: string;
        };
        permitId?: {
            permitNumber: string;
        };
    }[];
}

// Pagination Interface
export interface DashboardPagination {
    current: number;
    total: number;
    count: number;
    totalRecords: number;
    hasNext: boolean;
    hasPrev: boolean;
}

/**
 * Get dashboard statistics
 */
export const getDashboardStats = async (): Promise<ApiResponse<DashboardStats>> => {
    try {
        const response = await apiClient.get<{
            message: string;
            data: DashboardStats;
        }>('/dashboard/stats');
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to fetch dashboard statistics'));
    }
};

/**
 * Get all permits for dashboard
 */
export const getDashboardPermits = async (
    page = 1,
    limit = 10,
    search?: string,
    sortBy = 'createdAt',
    sortOrder = 'desc'
): Promise<ApiResponse<{ permits: DashboardPermit[]; pagination: DashboardPagination }>> => {
    try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (search) params.append('search', search);
        params.append('sortBy', sortBy);
        params.append('sortOrder', sortOrder);

        const response = await apiClient.get<{
            message: string;
            data: { permits: DashboardPermit[]; pagination: DashboardPagination };
        }>(`/dashboard/permits?${params.toString()}`);
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to fetch dashboard permits'));
    }
};

/**
 * Get recent user activity
 */
export const getRecentUserActivity = async (
    limit = 5
): Promise<ApiResponse<UserActivity[]>> => {
    try {
        const response = await apiClient.get<{
            message: string;
            data: UserActivity[];
        }>(`/dashboard/recent-activity?limit=${limit}`);
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to fetch recent user activity'));
    }
};

/**
 * Get validation queue
 */
export const getValidationQueue = async (
    limit = 10
): Promise<ApiResponse<ValidationQueue>> => {
    try {
        const response = await apiClient.get<{
            message: string;
            data: ValidationQueue;
        }>(`/dashboard/validation-queue?limit=${limit}`);
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to fetch validation queue'));
    }
};
