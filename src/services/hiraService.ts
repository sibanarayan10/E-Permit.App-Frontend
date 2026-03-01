/**
 * HIRA JSA Service
 * 
 * API service for HIRA (Hazard Identification & Risk Assessment) operations.
 * All risk calculations are performed by the backend - this service only handles API communication.
 */

import api from './api';
import {
    HiraApiResponse,
    HiraListResponse,
    CreateHiraRequest,
    UpdateHiraRequest,
    AddHiraRowRequest,
    RiskMatrixData
} from '../models/hiraJsa.types';

const BASE_URL = '/hira';

// ============================================
//   CRUD OPERATIONS
// ============================================

/**
 * Create a new HIRA JSA record
 * POST /api/v1/hira
 */
export const createHira = async (data: CreateHiraRequest): Promise<HiraApiResponse> => {
    const response = await api.post<HiraApiResponse>(BASE_URL, data);
    return response.data;
};

/**
 * Get all HIRA records with pagination
 * GET /api/v1/hira
 */
export const getAllHiras = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    area?: string;
    search?: string;
}): Promise<HiraListResponse> => {
    const response = await api.get<HiraListResponse>(BASE_URL, { params });
    return response.data;
};

/**
 * Get a single HIRA by ID
 * GET /api/v1/hira/:id
 */
export const getHiraById = async (id: string): Promise<HiraApiResponse> => {
    const response = await api.get<HiraApiResponse>(`${BASE_URL}/${id}`);
    return response.data;
};

/**
 * Update a HIRA record
 * PUT /api/v1/hira/:id
 */
export const updateHira = async (id: string, data: UpdateHiraRequest): Promise<HiraApiResponse> => {
    const response = await api.put<HiraApiResponse>(`${BASE_URL}/${id}`, data);
    return response.data;
};

/**
 * Delete a HIRA record
 * DELETE /api/v1/hira/:id
 */
export const deleteHira = async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete<{ success: boolean; message: string }>(`${BASE_URL}/${id}`);
    return response.data;
};

// ============================================
//   WORKFLOW OPERATIONS
// ============================================

/**
 * Submit a HIRA record
 * POST /api/v1/hira/:id/submit
 * 
 * Validates ACM requirements for Medium+ risk levels
 */
export const submitHira = async (id: string): Promise<HiraApiResponse> => {
    const response = await api.post<HiraApiResponse>(`${BASE_URL}/${id}/submit`);
    return response.data;
};

/**
 * Lock a HIRA record (makes it read-only)
 * POST /api/v1/hira/:id/lock
 */
export const lockHira = async (id: string): Promise<HiraApiResponse> => {
    const response = await api.post<HiraApiResponse>(`${BASE_URL}/${id}/lock`);
    return response.data;
};

/**
 * Clone an existing HIRA as a template
 * POST /api/v1/hira/:id/clone
 */
export const cloneHira = async (id: string): Promise<HiraApiResponse> => {
    const response = await api.post<HiraApiResponse>(`${BASE_URL}/${id}/clone`);
    return response.data;
};

/**
 * Set a HIRA as the default template for permits (toggles on/off)
 * POST /api/v1/hira/:id/set-default
 */
export const setDefaultHira = async (id: string): Promise<HiraApiResponse> => {
    const response = await api.post<HiraApiResponse>(`${BASE_URL}/${id}/set-default`);
    return response.data;
};

/**
 * Get the default HIRA template
 * GET /api/v1/hira/default
 */
export const getDefaultHira = async (): Promise<HiraApiResponse> => {
    const response = await api.get<HiraApiResponse>(`${BASE_URL}/default`);
    return response.data;
};

// ============================================
//   ROW MANAGEMENT
// ============================================

/**
 * Add a new row to an existing HIRA
 * POST /api/v1/hira/:id/rows
 */
export const addHiraRow = async (hiraId: string, row: AddHiraRowRequest): Promise<HiraApiResponse> => {
    const response = await api.post<HiraApiResponse>(`${BASE_URL}/${hiraId}/rows`, row);
    return response.data;
};

/**
 * Update a specific row in HIRA
 * PUT /api/v1/hira/:id/rows/:rowId
 */
export const updateHiraRow = async (
    hiraId: string,
    rowId: string,
    row: AddHiraRowRequest
): Promise<HiraApiResponse> => {
    const response = await api.put<HiraApiResponse>(`${BASE_URL}/${hiraId}/rows/${rowId}`, row);
    return response.data;
};

/**
 * Delete a specific row from HIRA
 * DELETE /api/v1/hira/:id/rows/:rowId
 */
export const deleteHiraRow = async (hiraId: string, rowId: string): Promise<HiraApiResponse> => {
    const response = await api.delete<HiraApiResponse>(`${BASE_URL}/${hiraId}/rows/${rowId}`);
    return response.data;
};

// ============================================
//   REFERENCE DATA
// ============================================

/**
 * Get the next available HIRA number
 * GET /api/v1/hira/next-number
 */
export const getNextHiraNumber = async (): Promise<{ success: boolean; data: { hiraNumber: string } }> => {
    const response = await api.get<{ success: boolean; data: { hiraNumber: string } }>(`${BASE_URL}/next-number`);
    return response.data;
};

/**
 * Get risk matrix reference data
 * GET /api/v1/hira/risk-matrix
 * 
 * This returns the severity definitions, likelihood definitions,
 * risk levels, and other reference data for display purposes.
 */
export const getRiskMatrixData = async (): Promise<{ success: boolean; data: RiskMatrixData }> => {
    const response = await api.get<{ success: boolean; data: RiskMatrixData }>(`${BASE_URL}/risk-matrix`);
    return response.data;
};

// ============================================
//   EXPORT OPERATIONS
// ============================================

/**
 * Export HIRA to PDF
 * GET /api/v1/hira/:id/export/pdf
 */
export const exportHiraToPdf = async (id: string): Promise<Blob> => {
    const response = await api.get(`${BASE_URL}/${id}/export/pdf`, {
        responseType: 'blob'
    });
    return response.data;
};

/**
 * Export HIRA to Excel
 * GET /api/v1/hira/:id/export/excel
 */
export const exportHiraToExcel = async (id: string): Promise<Blob> => {
    const response = await api.get(`${BASE_URL}/${id}/export/excel`, {
        responseType: 'blob'
    });
    return response.data;
};

/**
 * Download exported file
 * Helper function to trigger browser download
 */
export const downloadFile = (blob: Blob, filename: string): void => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

/**
 * Export and download HIRA as PDF
 */
export const downloadHiraPdf = async (id: string, hiraNumber: string): Promise<void> => {
    const blob = await exportHiraToPdf(id);
    downloadFile(blob, `HIRA_${hiraNumber}.pdf`);
};

/**
 * Export and download HIRA as Excel
 */
export const downloadHiraExcel = async (id: string, hiraNumber: string): Promise<void> => {
    const blob = await exportHiraToExcel(id);
    downloadFile(blob, `HIRA_${hiraNumber}.xlsx`);
};

// ============================================
//   DEFAULT EXPORT
// ============================================

const hiraService = {
    // CRUD
    createHira,
    getAllHiras,
    getHiraById,
    updateHira,
    deleteHira,

    // Workflow
    submitHira,
    lockHira,
    cloneHira,
    setDefaultHira,
    getDefaultHira,

    // Row Management
    addHiraRow,
    updateHiraRow,
    deleteHiraRow,

    // Reference Data
    getNextHiraNumber,
    getRiskMatrixData,

    // Export
    exportHiraToPdf,
    exportHiraToExcel,
    downloadHiraPdf,
    downloadHiraExcel,
    downloadFile
};

export default hiraService;
