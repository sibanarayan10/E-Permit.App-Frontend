/**
 * Email Template API Service
 * Matches the original JS email-template-api.js behavior
 */

import apiClient from './api';
import type { EmailTemplate } from '@/models';

// Response type matching backend structure
interface BackendResponse<T> {
    success: boolean;
    message?: string;
    data: T;
    count?: number;
}

/**
 * Get all email templates
 */
export const getAllEmailTemplates = async (): Promise<BackendResponse<EmailTemplate[]>> => {
    const response = await apiClient.get<BackendResponse<EmailTemplate[]>>('/email-templates');
    return response.data;
};

/**
 * Get email template by ID
 */
export const getEmailTemplateById = async (id: string): Promise<BackendResponse<EmailTemplate>> => {
    const response = await apiClient.get<BackendResponse<EmailTemplate>>(`/email-templates/${id}`);
    return response.data;
};

/**
 * Get email template by template number
 */
export const getEmailTemplateByNo = async (templateNo: number): Promise<BackendResponse<EmailTemplate>> => {
    const response = await apiClient.get<BackendResponse<EmailTemplate>>(`/email-templates/by-number/${templateNo}`);
    return response.data;
};

/**
 * Send email with PDF attachment
 */
export const sendEmailWithPDF = async (params: {
    templateNo: number;
    recipientEmail: string;
    recipientName: string;
    permitData: Record<string, unknown>;
    pdfBase64: string;
    pdfFilename: string;
}): Promise<{ success: boolean; message: string; messageId?: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string; messageId?: string }>(
        '/email-templates/send-with-pdf',
        params
    );
    return response.data;
};

/**
 * Create new email template
 */
export const createEmailTemplate = async (
    templateData: {
        templateNo: number;
        title: string;
        subject: string;
        body: string;
        placeholders?: string[];
    }
): Promise<BackendResponse<EmailTemplate>> => {
    const response = await apiClient.post<BackendResponse<EmailTemplate>>('/email-templates', templateData);
    return response.data;
};

/**
 * Update email template
 */
export const updateEmailTemplate = async (
    id: string,
    templateData: {
        title?: string;
        subject?: string;
        body?: string;
        placeholders?: string[];
        isActive?: boolean;
    }
): Promise<BackendResponse<EmailTemplate>> => {
    const response = await apiClient.put<BackendResponse<EmailTemplate>>(`/email-templates/${id}`, templateData);
    return response.data;
};

/**
 * Toggle email template active status
 */
export const toggleEmailTemplateStatus = async (id: string): Promise<BackendResponse<EmailTemplate>> => {
    const response = await apiClient.patch<BackendResponse<EmailTemplate>>(`/email-templates/${id}/toggle`);
    return response.data;
};

/**
 * Delete email template
 */
export const deleteEmailTemplate = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/email-templates/${id}`);
    return response.data;
};

/**
 * Get available placeholders
 */
export const getAvailablePlaceholders = async (): Promise<BackendResponse<Array<{ name: string; description: string }>>> => {
    const response = await apiClient.get<BackendResponse<Array<{ name: string; description: string }>>>('/email-templates/placeholders');
    return response.data;
};
