/**
 * Learning Service
 * API calls for E-PTW Learning module
 */

import api from './api';

export interface LearningTopic {
    _id: string;
    title: string;
    shortDescription: string;
    detailedDescription: string;
    video: { url: string; publicId: string };
    thumbnail: { url: string; publicId: string };
    instructor: string;
    duration: string;
    category: string;
    isPublished: boolean;
    order: number;
    viewCount: number;
    createdBy: { _id: string; name: string; email: string } | null;
    createdAt: string;
    updatedAt: string;
}

export interface LearningListResponse {
    success: boolean;
    data: LearningTopic[];
    pagination?: {
        total: number;
        page: number;
        limit: number;
        pages: number;
    };
}

// Get all published learning topics
export const getAllLearning = async (params?: {
    category?: string;
    search?: string;
    page?: number;
    limit?: number;
}): Promise<LearningListResponse> => {
    const response = await api.get('/learning', { params });
    return response.data;
};

// Get all learning topics (admin view, includes unpublished)
export const getAllLearningAdmin = async (): Promise<LearningListResponse> => {
    const response = await api.get('/learning/admin');
    return response.data;
};

// Get a single learning topic by ID
export const getLearningById = async (id: string): Promise<{ success: boolean; data: LearningTopic }> => {
    const response = await api.get(`/learning/${id}`);
    return response.data;
};

// Longer timeout for media uploads (5 minutes) — videos can be large
const UPLOAD_TIMEOUT = 5 * 60 * 1000;

// Create a new learning topic (admin only, uses FormData for file uploads)
export const createLearning = async (formData: FormData): Promise<{ success: boolean; message: string; data: LearningTopic }> => {
    const response = await api.post('/learning', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: UPLOAD_TIMEOUT,
    });
    return response.data;
};

// Update a learning topic (admin only, uses FormData for file uploads)
export const updateLearning = async (id: string, formData: FormData): Promise<{ success: boolean; message: string; data: LearningTopic }> => {
    const response = await api.put(`/learning/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: UPLOAD_TIMEOUT,
    });
    return response.data;
};

// Delete a learning topic (admin only)
export const deleteLearning = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/learning/${id}`);
    return response.data;
};

// Record a view for a learning topic
export const recordView = async (id: string): Promise<{ success: boolean; data: { viewCount: number } }> => {
    const response = await api.patch(`/learning/${id}/view`);
    return response.data;
};
