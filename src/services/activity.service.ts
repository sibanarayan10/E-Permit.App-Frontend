/**
 * Activity Monitoring API Service
 * Handles login history, session monitoring, and heartbeat
 */

import axios from 'axios';
import { API_CONFIG } from '@/config/api';

// Create dedicated axios instance
const apiClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
    timeout: API_CONFIG.timeout,
});

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        throw new Error(
            error.response?.data?.message || 'An unexpected error occurred'
        );
    }
);

// ========================
//  TYPE DEFINITIONS
// ========================

export interface LoginRecord {
    _id: string;
    user: string;
    loginTime: string;
    logoutTime: string | null;
    status: 'success' | 'failed';
    ipAddress: string | null;
    userAgent: string | null;
    device: string | null;
    browser: string | null;
    os: string | null;
    failureReason: string | null;
    sessionId: string | null;
    createdAt: string;
}

export interface LoginStats {
    totalLogins: number;
    successLogins: number;
    failedLogins: number;
    lastLoginTime: string | null;
    lastLoginIp: string | null;
    lastLoginDevice: string | null;
    lastLoginBrowser: string | null;
}

export interface LoginHistoryResponse {
    records: LoginRecord[];
    stats: LoginStats;
    pagination: {
        current: number;
        total: number;
        count: number;
        totalRecords: number;
    };
}

export interface SessionInfo {
    _id: string;
    user: string;
    status: 'online' | 'offline' | 'expired';
    sessionStart: string;
    sessionExpiry: string;
    lastActivity: string;
    ipAddress: string | null;
    device: string | null;
    browser: string | null;
    os: string | null;
    logoutReason: string | null;
}

export interface AccountStatus {
    isActive: boolean;
    isLocked: boolean;
    failedAttemptsLast24h: number;
    lastLogin: string | null;
}

export interface SessionStatusResponse {
    isOnline: boolean;
    activeSession: SessionInfo | null;
    recentSessions: SessionInfo[];
    accountStatus: AccountStatus;
}

export interface ActiveSessionUser {
    _id: string;
    name: string;
    email: string;
    role: string;
    workflowStage: string;
    userId: string;
    profilePicture?: { url?: string } | string;
}

export interface ActiveSession extends Omit<SessionInfo, 'user'> {
    user: ActiveSessionUser;
}

export interface ActiveSessionsResponse {
    totalOnline: number;
    sessions: ActiveSession[];
}

export interface RecentLogin {
    _id: string;
    user: ActiveSessionUser;
    loginTime: string;
    logoutTime: string | null;
    status: 'success' | 'failed';
    ipAddress: string | null;
    device: string | null;
    browser: string | null;
    os: string | null;
}

export interface RecentLoginsResponse {
    logins: RecentLogin[];
    count: number;
}

// ========================
//  API CALLS
// ========================

/**
 * Send session heartbeat (keep session alive)
 */
export const sendHeartbeat = async (): Promise<void> => {
    try {
        await apiClient.post('/activity/heartbeat');
    } catch {
        // Silently fail – heartbeat is non-critical
    }
};

/**
 * Get login history for a specific user (admin only)
 */
export const getUserLoginHistory = async (
    userId: string,
    page = 1,
    limit = 20,
    status?: 'success' | 'failed'
): Promise<LoginHistoryResponse> => {
    try {
        let url = `/activity/login-history/${userId}?page=${page}&limit=${limit}`;
        if (status) url += `&status=${status}`;

        const res = await apiClient.get<{ data: LoginHistoryResponse }>(url);
        return res.data.data;
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to fetch login history');
    }
};

/**
 * Get session status for a specific user (admin only)
 */
export const getUserSessionStatus = async (
    userId: string
): Promise<SessionStatusResponse> => {
    try {
        const res = await apiClient.get<{ data: SessionStatusResponse }>(
            `/activity/session-status/${userId}`
        );
        return res.data.data;
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to fetch session status');
    }
};

/**
 * Get all active sessions (admin only)
 */
export const getActiveSessions = async (): Promise<ActiveSessionsResponse> => {
    try {
        const res = await apiClient.get<{ data: ActiveSessionsResponse }>(
            '/activity/sessions/active'
        );
        return res.data.data;
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to fetch active sessions');
    }
};

/**
 * Force logout a user (admin only)
 */
export const forceLogoutUser = async (
    userId: string
): Promise<{ sessionsTerminated: number }> => {
    try {
        const res = await apiClient.post<{
            data: { sessionsTerminated: number };
        }>(`/activity/force-logout/${userId}`);
        return res.data.data;
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to terminate user session');
    }
};

/**
 * Get recent logins across all users (admin only)
 */
export const getRecentLogins = async (
    limit = 10
): Promise<RecentLoginsResponse> => {
    try {
        const res = await apiClient.get<{ data: RecentLoginsResponse }>(
            `/activity/recent-logins?limit=${limit}`
        );
        return res.data.data;
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to fetch recent logins');
    }
};
