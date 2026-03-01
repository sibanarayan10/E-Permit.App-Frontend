/**
 * Data Request API Service - Typed API calls for data request operations
 */

import apiClient, { extractErrorMessage } from './api';
import type { ApiResponse } from '@/models';

// Data Request Types
export interface DataRequest {
    _id: string;
    dataRequestId: string;
    permitId: string;
    permitNumber: string;
    permitType: 'general' | 'height';
    permitModel: string;
    status: 'draft' | 'pending_executor' | 'executor_approved' | 'pending_issuer' | 'approved' | 'rejected';
    createdBy: {
        _id: string;
        name: string;
        email: string;
    };
    assignedExecutor?: {
        _id: string;
        name: string;
        email: string;
    };
    assignedIssuer?: {
        _id: string;
        name: string;
        email: string;
    };
    executorApproval?: {
        approved: boolean;
        approvedAt?: string;
        comments?: string;
    };
    issuerApproval?: {
        approved: boolean;
        approvedAt?: string;
        comments?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface DataRequestListResponse {
    dataRequests: DataRequest[];
    pagination: {
        total: number;
        page: number;
        pages: number;
        limit: number;
    };
}

export interface TokenVerifyResponse {
    dataRequestId: string;
    permitNumber: string;
    permitType: string;
    type: 'executor' | 'issuer';
    user: {
        name: string;
        email: string;
        hasPhone: boolean;
    };
}

export interface OtpVerifyResponse {
    dataRequestId: string;
    dataRequestNumber: string;
    permitNumber: string;
    permitType: string;
    type: 'executor' | 'issuer';
    user: {
        id: string;
        name: string;
        email: string;
        signature?: string;
    };
    token: string;
}

// ===========================
//    DATA REQUEST CRUD
// ===========================

/**
 * Create a new data request
 */
export const createDataRequest = async (
    permitId: string,
    permitType: 'general' | 'height'
): Promise<ApiResponse<DataRequest>> => {
    try {
        const response = await apiClient.post<{ message: string; data: DataRequest }>(
            '/data-requests',
            { permitId, permitType }
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to create data request'));
    }
};

/**
 * Get all data requests with pagination
 */
export const getAllDataRequests = async (
    page = 1,
    limit = 10,
    status?: string
): Promise<ApiResponse<DataRequestListResponse>> => {
    try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());
        if (status) params.append('status', status);

        const response = await apiClient.get<{ message: string; data: DataRequestListResponse }>(
            `/data-requests?${params.toString()}`
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to fetch data requests'));
    }
};

/**
 * Get data request by ID
 */
export const getDataRequestById = async (
    id: string
): Promise<ApiResponse<DataRequest>> => {
    try {
        const response = await apiClient.get<{ message: string; data: DataRequest }>(
            `/data-requests/${id}`
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to fetch data request'));
    }
};

/**
 * Delete data request
 */
export const deleteDataRequest = async (
    id: string
): Promise<ApiResponse<null>> => {
    try {
        const response = await apiClient.delete<{ message: string }>(
            `/data-requests/${id}`
        );
        return {
            success: true,
            message: response.data.message,
            data: null,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to delete data request'));
    }
};

// ===========================
//    EXECUTOR FLOW
// ===========================

/**
 * Send data request to executor
 */
export const sendToExecutor = async (
    dataRequestId: string,
    executorId: string
): Promise<ApiResponse<DataRequest>> => {
    try {
        const response = await apiClient.post<{ message: string; data: DataRequest }>(
            `/data-requests/${dataRequestId}/send-to-executor`,
            { executorId }
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to send to executor'));
    }
};

// ===========================
//    ISSUER FLOW
// ===========================

/**
 * Send data request to issuer
 */
export const sendToIssuer = async (
    dataRequestId: string,
    issuerId: string
): Promise<ApiResponse<DataRequest>> => {
    try {
        const response = await apiClient.post<{ message: string; data: DataRequest }>(
            `/data-requests/${dataRequestId}/send-to-issuer`,
            { issuerId }
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to send to issuer'));
    }
};

// ===========================
//    PUBLIC VERIFICATION APIS
// ===========================

/**
 * Verify secure token from email link
 */
export const verifySecureToken = async (
    token: string,
    type: 'executor' | 'issuer'
): Promise<ApiResponse<TokenVerifyResponse>> => {
    try {
        const response = await apiClient.post<{ message: string; data: TokenVerifyResponse }>(
            '/data-requests/verify-token',
            { token, type }
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to verify token'));
    }
};

/**
 * Request OTP via email or SMS
 */
export const requestOtp = async (
    token: string,
    type: 'executor' | 'issuer',
    method: 'email' | 'sms'
): Promise<ApiResponse<{ method: string; expiresAt: string }>> => {
    try {
        const response = await apiClient.post<{ message: string; data: { method: string; expiresAt: string } }>(
            '/data-requests/request-otp',
            { token, type, method }
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to request OTP'));
    }
};

/**
 * Verify OTP
 */
export const verifyOtp = async (
    token: string,
    type: 'executor' | 'issuer',
    otp: string
): Promise<ApiResponse<OtpVerifyResponse>> => {
    try {
        const response = await apiClient.post<{ message: string; data: OtpVerifyResponse }>(
            '/data-requests/verify-otp',
            { token, type, otp }
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to verify OTP'));
    }
};

/**
 * Submit executor approval
 */
export const submitExecutorApproval = async (
    dataRequestId: string,
    token: string,
    data: {
        executingAgency: any;
        preExecutionChecks: any;
        comments?: string;
        issuerId?: string; // Optional: assign issuer during approval
    }
): Promise<ApiResponse<DataRequest & { issuerAssigned?: boolean }>> => {
    try {
        const response = await apiClient.post<{ message: string; data: DataRequest; issuerAssigned?: boolean }>(
            `/data-requests/${dataRequestId}/executor-approve`,
            { token, ...data }
        );
        return {
            success: true,
            message: response.data.message,
            data: { ...response.data.data, issuerAssigned: response.data.issuerAssigned },
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to submit executor approval'));
    }
};

/**
 * Submit issuer approval
 */
export const submitIssuerApproval = async (
    dataRequestId: string,
    token: string,
    data: {
        issuerDetails: any;
        comments?: string;
        verifiedAndFoundSatisfactory: boolean;
    }
): Promise<ApiResponse<DataRequest>> => {
    try {
        const response = await apiClient.post<{ message: string; data: DataRequest }>(
            `/data-requests/${dataRequestId}/issuer-approve`,
            { token, ...data }
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to submit issuer approval'));
    }
};
