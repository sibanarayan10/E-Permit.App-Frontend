/**
 * Notification API Service
 */

import apiClient, { extractErrorMessage } from './api';
import type { Notification, ApiResponse, PaginatedResponse } from '@/models';

/**
 * Get notifications for current user
 */
export const getMyNotifications = async (
    page = 1,
    limit = 10
): Promise<ApiResponse<PaginatedResponse<Notification>>> => {
    try {
        const response = await apiClient.get<{
            message: string;
            data: PaginatedResponse<Notification>;
        }>(`/notifications?page=${page}&limit=${limit}`);
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, 'Failed to fetch notifications')
        );
    }
};

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (
    notificationId: string
): Promise<ApiResponse<Notification>> => {
    try {
        const response = await apiClient.put<{
            message: string;
            data: Notification;
        }>(`/notifications/${notificationId}/read`);
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, 'Failed to mark notification as read')
        );
    }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<
    ApiResponse<null>
> => {
    try {
        const response = await apiClient.put<{ message: string }>(
            '/notifications/mark-all-read'
        );
        return {
            success: true,
            message: response.data.message,
            data: null,
        };
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, 'Failed to mark all notifications as read')
        );
    }
};

/**
 * Get unread notification count
 */
export const getUnreadNotificationCount = async (): Promise<
    ApiResponse<{ count: number }>
> => {
    try {
        const response = await apiClient.get<{
            message: string;
            data: { count: number };
        }>('/notifications/unread-count');
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, 'Failed to fetch unread notification count')
        );
    }
};
