/**
 * User API Service - Typed API calls for user operations
 */

import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import type {
    User,
    LoginCredentials,
    CreateUserPayload,
    UpdateUserPayload,
    UpdateProfilePayload,
    UserStats,
    ApiResponse,
    PaginatedUsersResponse,
    FileUploadResponse,
} from '@/models';

// Create dedicated axios instance for user API
const apiClient = axios.create({
    baseURL: API_CONFIG.baseURL,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
    timeout: API_CONFIG.timeout,
});

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        throw new Error(
            error.response?.data?.message || 'An unexpected error occurred'
        );
    }
);

/**
 * Login user
 */
export const loginUser = async (
    email: string,
    password: string
): Promise<ApiResponse<User>> => {
    try {
        const credentials: LoginCredentials = { email, password };
        const res = await apiClient.post<{ message: string; data: User }>(
            '/users/login',
            credentials
        );
        return {
            success: true,
            message: res.data.message,
            data: res.data.data,
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Unable to login');
    }
};

/**
 * Logout user
 */
export const logoutUser = async (): Promise<{ message: string }> => {
    try {
        const res = await apiClient.post<{ message: string }>('/users/logout');
        return res.data;
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Unable to logout');
    }
};

/**
 * Verify current user session
 */
export const verifyUser = async (): Promise<ApiResponse<User>> => {
    try {
        const res = await apiClient.get<{ message: string; data: User }>(
            '/users/verify'
        );
        return {
            success: true,
            message: res.data.message,
            data: res.data.data,
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Unable to verify user');
    }
};

/**
 * Get user profile
 */
export const getUserProfile = async (): Promise<ApiResponse<User>> => {
    try {
        const res = await apiClient.get<{ message: string; data: User }>(
            '/users/profile'
        );
        return {
            success: true,
            message: res.data.message,
            data: res.data.data,
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Unable to fetch user profile');
    }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
    updates: UpdateProfilePayload
): Promise<ApiResponse<User>> => {
    try {
        const res = await apiClient.put<{ message: string; data: User }>(
            '/users/profile',
            updates
        );
        return {
            success: true,
            message: res.data.message,
            data: res.data.data,
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Unable to update profile');
    }
};

// ===========================
//      ADMIN FUNCTIONS
// ===========================

/**
 * Create new user (Admin only)
 */
export const createUser = async (
    userData: CreateUserPayload
): Promise<ApiResponse<User>> => {
    try {
        const res = await apiClient.post<{ message: string; data: User }>(
            '/users',
            userData
        );
        return {
            success: true,
            message: res.data.message,
            data: res.data.data,
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to create user');
    }
};

/**
 * Get all users with pagination (Admin only)
 */
export const getAllUsers = async (
    page = 1,
    limit = 10
): Promise<ApiResponse<PaginatedUsersResponse<User>>> => {
    try {
        const res = await apiClient.get<{
            message: string;
            data: PaginatedUsersResponse<User>;
        }>(`/users?page=${page}&limit=${limit}`);
        return {
            success: true,
            message: res.data.message,
            data: res.data.data,
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to fetch users');
    }
};

/**
 * Update user by ID (Admin only)
 */
export const updateUser = async (
    userId: string,
    updates: UpdateUserPayload
): Promise<ApiResponse<User>> => {
    try {
        const res = await apiClient.put<{ message: string; data: User }>(
            `/users/${userId}`,
            updates
        );
        return {
            success: true,
            message: res.data.message,
            data: res.data.data,
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to update user');
    }
};

/**
 * Delete user by ID (Admin only)
 */
export const deleteUser = async (
    userId: string
): Promise<ApiResponse<null>> => {
    try {
        const res = await apiClient.delete<{ message: string }>(`/users/${userId}`);
        return {
            success: true,
            message: res.data.message,
            data: null,
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to delete user');
    }
};

/**
 * Get user statistics (Admin only)
 */
export const getUserStats = async (): Promise<ApiResponse<UserStats>> => {
    try {
        const res = await apiClient.get<{ message: string; data: UserStats }>(
            '/users/stats'
        );
        return {
            success: true,
            message: res.data.message,
            data: res.data.data,
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to fetch user statistics');
    }
};

// ===========================
//    PROFILE PICTURE APIs
// ===========================

/**
 * Upload profile picture
 */
export const uploadProfilePicture = async (
    file: File
): Promise<ApiResponse<FileUploadResponse>> => {
    try {
        const formData = new FormData();
        formData.append('profilePicture', file);

        const response = await apiClient.post<{
            message: string;
            data: FileUploadResponse;
        }>('/profile/profile-picture/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to upload profile picture');
    }
};

/**
 * Delete profile picture
 */
export const deleteProfilePicture = async (): Promise<ApiResponse<null>> => {
    try {
        const response = await apiClient.delete<{ message: string }>(
            '/profile/profile-picture/delete'
        );
        return {
            success: true,
            message: response.data.message,
            data: null,
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to delete profile picture');
    }
};

/**
 * Get current user's profile picture
 */
export const getMyProfilePicture = async (): Promise<
    ApiResponse<{ profilePicture: string | null }>
> => {
    try {
        const response = await apiClient.get<{
            message: string;
            data: { profilePicture: string | null };
        }>('/profile/profile-picture/my-picture');
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to fetch profile picture');
    }
};

// ===========================
//      SIGNATURE APIs
// ===========================

/**
 * Upload signature
 */
export const uploadSignature = async (
    file: File
): Promise<ApiResponse<FileUploadResponse>> => {
    try {
        const formData = new FormData();
        formData.append('signature', file);

        const response = await apiClient.post<{
            message: string;
            data: FileUploadResponse;
        }>('/profile/signature/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to upload signature');
    }
};

/**
 * Delete signature
 */
export const deleteSignature = async (): Promise<ApiResponse<null>> => {
    try {
        const response = await apiClient.delete<{ message: string }>(
            '/profile/signature/delete'
        );
        return {
            success: true,
            message: response.data.message,
            data: null,
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to delete signature');
    }
};

/**
 * Get current user's signature
 */
export const getMySignature = async (): Promise<
    ApiResponse<{ signature: string | null }>
> => {
    try {
        const response = await apiClient.get<{
            message: string;
            data: { signature: string | null };
        }>('/profile/signature/my-signature');
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to fetch signature');
    }
};

/**
 * Get current user's profile data (picture + signature)
 */
export const getMyProfileData = async (): Promise<
    ApiResponse<{ profilePicture: string | null; signature: string | null }>
> => {
    try {
        const response = await apiClient.get<{
            message: string;
            data: { profilePicture: string | null; signature: string | null };
        }>('/profile/my-profile-data');
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to fetch profile data');
    }
};

// ===========================
//    PASSWORD RESET APIs
// ===========================

/**
 * Request password reset email
 */
export const forgotPassword = async (
    email: string
): Promise<ApiResponse<null>> => {
    try {
        const res = await apiClient.post<{ message: string }>(
            '/users/forgot-password',
            { email }
        );
        return {
            success: true,
            message: res.data.message,
            data: null,
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to send password reset email');
    }
};

/**
 * Reset password with token
 */
export const resetPassword = async (
    token: string,
    password: string,
    confirmPassword: string
): Promise<ApiResponse<null>> => {
    try {
        const res = await apiClient.post<{ message: string }>(
            `/users/reset-password/${token}`,
            { password, confirmPassword }
        );
        return {
            success: true,
            message: res.data.message,
            data: null,
        };
    } catch (error) {
        const err = error as Error;
        throw new Error(err.message || 'Failed to reset password');
    }
};
