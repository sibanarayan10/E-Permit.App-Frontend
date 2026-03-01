/**
 * Height Permit Service
 * API calls for Height Permit management
 */

import api from './api';
import type { HeightPermitCreateInput, HeightPermitStats } from '@/models';

// Get next height permit numbers (auto-generated)
export const getNextHeightPermitNumbers = async () => {
    const response = await api.get('/height-permits/next-numbers');
    return response.data;
};

// Get available executors
export const getAvailableHeightPermitExecutors = async () => {
    const response = await api.get('/height-permits/executors');
    return response.data;
};

// Get available issuers
export const getAvailableHeightPermitIssuers = async () => {
    const response = await api.get('/height-permits/issuers');
    return response.data;
};

// Get my height permits
export const getMyHeightPermits = async (params?: { page?: number; limit?: number; status?: string }) => {
    const response = await api.get('/height-permits/my-permits', { params });
    return response.data;
};

// Get all height permits with filtering
export const getHeightPermits = async (
    workflowStage?: string | null,
    status?: string | null,
    page: number = 1,
    limit: number = 10
) => {
    const params: Record<string, any> = { page, limit };
    if (workflowStage) params.workflowStage = workflowStage;
    if (status) params.status = status;
    const response = await api.get('/height-permits', { params });
    return response.data;
};

// Get height permit by ID
export const getHeightPermitById = async (id: string) => {
    const response = await api.get(`/height-permits/${id}`);
    return response.data;
};

// Get height permit statistics
export const getHeightPermitStats = async (): Promise<{ success: boolean; data: HeightPermitStats }> => {
    const response = await api.get('/height-permits/stats');
    return response.data;
};

// Create height permit
export const createHeightPermit = async (data: HeightPermitCreateInput) => {
    const response = await api.post('/height-permits', data);
    return response.data;
};

// Update height permit
export const updateHeightPermit = async (id: string, data: Partial<HeightPermitCreateInput>) => {
    const response = await api.put(`/height-permits/${id}`, data);
    return response.data;
};

// Delete height permit
export const deleteHeightPermit = async (id: string) => {
    const response = await api.delete(`/height-permits/${id}`);
    return response.data;
};

// Submit height permit to execution
export const submitHeightPermitToExecution = async (id: string, assignedExecutorId: string) => {
    const response = await api.post(`/height-permits/${id}/submit`, { assignedExecutorId });
    return response.data;
};

// Execution approve height permit
export const executionApproveHeightPermit = async (id: string, data: { assignedIssuerId: string;[key: string]: any }) => {
    const response = await api.post(`/height-permits/${id}/execute-approve`, data);
    return response.data;
};

// Execution return height permit
export const executionReturnHeightPermit = async (id: string, returnReason: string) => {
    const response = await api.post(`/height-permits/${id}/execute-return`, { returnReason });
    return response.data;
};

// Issuer approve height permit
export const issuerApproveHeightPermit = async (id: string, data: any) => {
    const response = await api.post(`/height-permits/${id}/issuer-approve`, data);
    return response.data;
};

// Issuer return height permit
export const issuerReturnHeightPermit = async (id: string, returnReason: string, returnToStage?: string) => {
    const response = await api.post(`/height-permits/${id}/issuer-return`, { returnReason, returnToStage });
    return response.data;
};

// Initiate height permit closure
export const initiateHeightPermitClosure = async (id: string, data: { initiatorDetails?: any }) => {
    const response = await api.post(`/height-permits/${id}/initiate-close`, data);
    return response.data;
};

// Executor approve height permit closure
export const executorApproveHeightPermitClosure = async (id: string) => {
    const response = await api.post(`/height-permits/${id}/executor-close`);
    return response.data;
};

// Issuer approve height permit closure (final)
export const issuerApproveHeightPermitClosure = async (id: string, data: { checklist: { allWorkCompleted: string; jobCompletionReported: string } }) => {
    const response = await api.post(`/height-permits/${id}/issuer-close`, data);
    return response.data;
};

// Renew height permit
export const renewHeightPermit = async (id: string, data: { from: any; to: any; renewalReason: string }) => {
    const response = await api.post(`/height-permits/${id}/renew`, data);
    return response.data;
};

// Cancel height permit (same as General Permit)
export const cancelHeightPermit = async (id: string, data: { reason: string; comments?: string }) => {
    const response = await api.post(`/height-permits/${id}/cancel`, data);
    return response.data;
};

// Download height permit PDF (backend generated)
export const downloadHeightPermitPDF = async (id: string) => {
    const response = await api.get(`/height-permits/${id}/download-pdf`, {
        responseType: 'blob',
    });
    return response.data;
};
