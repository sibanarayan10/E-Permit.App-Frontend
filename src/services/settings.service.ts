/**
 * Settings API Service
 */

import apiClient, { extractErrorMessage } from './api';
import type { AppSettings, ApiResponse } from '@/models';

// Backend response type (flat structure)
interface BackendSettings {
    emailNotificationsEnabled: boolean;
    smsNotificationsEnabled: boolean;
    updatedAt?: string;
}

// Transform backend response to frontend AppSettings
const transformToAppSettings = (backendData: BackendSettings): AppSettings => ({
    permitValidity: {
        defaultDurationHours: 24,
        maxRenewalCount: 3,
    },
    notifications: {
        emailEnabled: backendData.emailNotificationsEnabled ?? true,
        smsEnabled: backendData.smsNotificationsEnabled ?? false,
        pushEnabled: false,
    },
    system: {
        maintenanceMode: false,
    },
});

// Transform frontend AppSettings to backend payload
const transformToBackendSettings = (updates: Partial<AppSettings>): Record<string, boolean> => {
    const payload: Record<string, boolean> = {};

    if (updates.notifications?.emailEnabled !== undefined) {
        payload.emailNotificationsEnabled = updates.notifications.emailEnabled;
    }
    if (updates.notifications?.smsEnabled !== undefined) {
        payload.smsNotificationsEnabled = updates.notifications.smsEnabled;
    }

    return payload;
};

/**
 * Get application settings
 */
export const getSettings = async (): Promise<ApiResponse<AppSettings>> => {
    try {
        const response = await apiClient.get<{
            message: string;
            data: BackendSettings;
        }>('/settings');
        return {
            success: true,
            message: response.data.message,
            data: transformToAppSettings(response.data.data),
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to fetch settings'));
    }
};

/**
 * Update application settings (Admin only)
 */
export const updateSettings = async (
    updates: Partial<AppSettings>
): Promise<ApiResponse<AppSettings>> => {
    try {
        const backendPayload = transformToBackendSettings(updates);
        const response = await apiClient.put<{
            message: string;
            data: BackendSettings;
        }>('/settings', backendPayload);
        return {
            success: true,
            message: response.data.message,
            data: transformToAppSettings(response.data.data),
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to update settings'));
    }
};
