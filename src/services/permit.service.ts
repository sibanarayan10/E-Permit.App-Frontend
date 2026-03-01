/**
 * Permit API Service - Typed API calls for permit operations
 */

import apiClient, { extractErrorMessage } from './api';
import type {
    Permit,
    PermitSummary,
    PermitStats,
    PermitNumbersResponse,
    CreatePermitPayload,
    EditPermitPayload,
    SubmitToExecutionPayload,
    ExecutionApprovalPayload,
    IssuerApprovalPayload,
    CancelPermitPayload,
    RenewPermitPayload,
    InitiateClosurePayload,
    ExecutorClosurePayload,
    IssuerClosurePayload,
    SearchPermitsPayload,
    PermitStatus,
    WorkflowStage,
    ApiResponse,
    PaginatedResponse,
    UserSummary,
} from '@/models';

// ===========================
//    PERMIT NUMBERS
// ===========================

/**
 * Get next permit numbers for all types
 */
export const getNextPermitNumbers = async (): Promise<
    ApiResponse<PermitNumbersResponse>
> => {
    try {
        const response = await apiClient.get<{
            message: string;
            data: PermitNumbersResponse;
        }>('/permits/next-numbers');
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to get permit numbers'));
    }
};

// ===========================
//    PERMIT CRUD
// ===========================

/**
 * Create new permit
 */
export const createPermit = async (
    permitData: CreatePermitPayload
): Promise<ApiResponse<Permit>> => {
    try {
        const response = await apiClient.post<{ message: string; data: Permit }>(
            '/permits',
            permitData
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to create permit'));
    }
};

/**
 * Get permits for current user with optional filtering
 */
export const getMyPermits = async (
    stage: WorkflowStage | null = null,
    status: PermitStatus | null = null,
    page = 1,
    limit = 10
): Promise<ApiResponse<PaginatedResponse<PermitSummary>>> => {
    try {
        const params = new URLSearchParams();
        if (stage) params.append('stage', stage);
        if (status) params.append('status', status);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const response = await apiClient.get<{
            message: string;
            data: PaginatedResponse<PermitSummary>;
        }>(`/permits/my-permits?${params.toString()}`);

        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to fetch permits'));
    }
};

/**
 * Get permit by ID
 */
export const getPermitById = async (
    permitId: string
): Promise<ApiResponse<Permit>> => {
    try {
        const response = await apiClient.get<{ message: string; data: Permit }>(
            `/permits/${permitId}`
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to fetch permit'));
    }
};

/**
 * Edit permit details
 */
export const editPermitDetails = async (
    permitId: string,
    updates: EditPermitPayload
): Promise<ApiResponse<Permit>> => {
    try {
        const response = await apiClient.put<{ message: string; data: Permit }>(
            `/permits/${permitId}`,
            updates
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to update permit'));
    }
};

/**
 * Delete permit
 */
export const deletePermit = async (
    permitId: string
): Promise<ApiResponse<null>> => {
    try {
        const response = await apiClient.delete<{ message: string }>(
            `/permits/${permitId}`
        );
        return {
            success: true,
            message: response.data.message,
            data: null,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to delete permit'));
    }
};

/**
 * Search permits with filters
 */
export const searchPermits = async (
    searchParams: SearchPermitsPayload
): Promise<ApiResponse<PaginatedResponse<PermitSummary>>> => {
    try {
        const response = await apiClient.get<{
            message: string;
            data: PaginatedResponse<PermitSummary>;
        }>('/permits/my-permits', { params: searchParams });
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to search permits'));
    }
};

/**
 * Get permit statistics
 */
export const getPermitStats = async (): Promise<ApiResponse<PermitStats>> => {
    try {
        const response = await apiClient.get<{ message: string; data: PermitStats }>(
            '/permits/stats'
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, 'Failed to fetch permit statistics')
        );
    }
};

/**
 * Get ALL permits (General + Height) for current user
 * This is the combined API that returns both permit types
 */
export const getAllPermits = async (
    stage: WorkflowStage | null = null,
    status: PermitStatus | null = null,
    page = 1,
    limit = 10
): Promise<ApiResponse<PaginatedResponse<PermitSummary>>> => {
    try {
        const params = new URLSearchParams();
        if (stage) params.append('stage', stage);
        if (status) params.append('status', status);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const response = await apiClient.get<{
            message: string;
            data: PaginatedResponse<PermitSummary>;
        }>(`/permits/all-permits?${params.toString()}`);

        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to fetch all permits'));
    }
};

/**
 * Get combined permit statistics (General + Height)
 */
export const getAllPermitStats = async (): Promise<ApiResponse<PermitStats & { totalGeneral: number; totalHeight: number }>> => {
    try {
        const response = await apiClient.get<{ message: string; data: PermitStats & { totalGeneral: number; totalHeight: number } }>(
            '/permits/all-stats'
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, 'Failed to fetch combined permit statistics')
        );
    }
};

// ===========================
//    EXECUTOR ASSIGNMENT
// ===========================

/**
 * Get available executors for assignment
 */
export const getAvailableExecutors = async (): Promise<
    ApiResponse<UserSummary[]>
> => {
    try {
        const response = await apiClient.get<{
            message: string;
            data: UserSummary[];
        }>('/permits/available-executors');
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, 'Failed to fetch available executors')
        );
    }
};

/**
 * Get available issuers for assignment
 */
export const getAvailableIssuers = async (): Promise<
    ApiResponse<UserSummary[]>
> => {
    try {
        const response = await apiClient.get<{
            message: string;
            data: UserSummary[];
        }>('/permits/available-issuers');
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, 'Failed to fetch available issuers')
        );
    }
};

/**
 * Submit permit to execution stage
 */
export const submitToExecution = async (
    permitId: string,
    assignedExecutorId: string
): Promise<ApiResponse<Permit>> => {
    try {
        const payload: SubmitToExecutionPayload = { assignedExecutorId };
        const response = await apiClient.put<{ message: string; data: Permit }>(
            `/permits/${permitId}/submit-to-execution`,
            payload
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, 'Failed to submit permit to execution')
        );
    }
};

// ===========================
//    EXECUTION WORKFLOW
// ===========================

/**
 * Executor approves permit
 */
export const executionApprove = async (
    permitId: string,
    data: ExecutionApprovalPayload
): Promise<ApiResponse<Permit>> => {
    try {
        const response = await apiClient.put<{ message: string; data: Permit }>(
            `/permits/${permitId}/execution-approve`,
            data
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to approve permit'));
    }
};

/**
 * Executor returns permit to initiator
 */
export const executionReturn = async (
    permitId: string,
    data: { returnedReason: string; comments?: string }
): Promise<ApiResponse<Permit>> => {
    try {
        const response = await apiClient.put<{ message: string; data: Permit }>(
            `/permits/${permitId}/execution-return`,
            data
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to return permit'));
    }
};

// ===========================
//    ISSUER WORKFLOW
// ===========================

/**
 * Issuer approves permit
 */
export const issuerApprove = async (
    permitId: string,
    data: IssuerApprovalPayload
): Promise<ApiResponse<Permit>> => {
    try {
        const response = await apiClient.put<{ message: string; data: Permit }>(
            `/permits/${permitId}/issuer-approve`,
            data
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to approve permit'));
    }
};

/**
 * Issuer returns permit
 */
export const issuerReturn = async (
    permitId: string,
    data: { returnedReason: string; comments?: string }
): Promise<ApiResponse<Permit>> => {
    try {
        const response = await apiClient.put<{ message: string; data: Permit }>(
            `/permits/${permitId}/issuer-return`,
            data
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to return permit'));
    }
};

// ===========================
//    CANCEL & RENEW
// ===========================

/**
 * Cancel permit
 */
export const cancelPermit = async (
    permitId: string,
    data: CancelPermitPayload
): Promise<ApiResponse<Permit>> => {
    try {
        const response = await apiClient.post<{ message: string; data: Permit }>(
            `/permits/${permitId}/cancel`,
            data
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to cancel permit'));
    }
};

/**
 * Renew permit
 */
export const renewPermit = async (
    permitId: string,
    data: RenewPermitPayload
): Promise<ApiResponse<Permit>> => {
    try {
        const response = await apiClient.post<{ message: string; data: Permit }>(
            `/permits/${permitId}/renew`,
            data
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to renew permit'));
    }
};

// ===========================
//    CLOSURE WORKFLOW
// ===========================

/**
 * Initiator initiates permit closure
 */
export const initiateClose = async (
    permitId: string,
    data: InitiateClosurePayload
): Promise<ApiResponse<Permit>> => {
    try {
        const response = await apiClient.put<{ message: string; data: Permit }>(
            `/permits/${permitId}/initiate-closure`,
            data
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, 'Failed to initiate permit closure')
        );
    }
};

/**
 * Executor approves closure with handover checklist
 */
export const executorApproveClosure = async (
    permitId: string,
    data: ExecutorClosurePayload
): Promise<ApiResponse<Permit>> => {
    try {
        const response = await apiClient.put<{ message: string; data: Permit }>(
            `/permits/${permitId}/executor-approve-closure`,
            data
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, 'Failed to approve closure as executor')
        );
    }
};

/**
 * Issuer final closure approval
 */
export const issuerApproveClosure = async (
    permitId: string,
    data: IssuerClosurePayload
): Promise<ApiResponse<Permit>> => {
    try {
        const response = await apiClient.put<{ message: string; data: Permit }>(
            `/permits/${permitId}/issuer-approve-closure`,
            data
        );
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, 'Failed to approve closure as issuer')
        );
    }
};

// ===========================
//    UTILITY FUNCTIONS
// ===========================

/**
 * Get permit status options for dropdowns
 */
export const getPermitStatusOptions = (): Array<{
    value: string;
    label: string;
}> => [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'closed', label: 'Closed' },
        { value: 'expired', label: 'Expired' },
    ];

/**
 * Get permit type options for dropdowns
 */
export const getPermitTypeOptions = (): Array<{
    value: string;
    label: string;
}> => [
        { value: 'electrical', label: 'Electrical' },
        { value: 'mechanical', label: 'Mechanical' },
        { value: 'hot_work', label: 'Hot Work' },
        { value: 'confined_space', label: 'Confined Space' },
        { value: 'height_work', label: 'Height Work' },
        { value: 'excavation', label: 'Excavation' },
        { value: 'general', label: 'General' },
    ];

/**
 * Get workflow stage options for dropdowns
 */
export const getWorkflowStageOptions = (): Array<{
    value: string;
    label: string;
}> => [
        { value: 'initiation', label: 'Initiation' },
        { value: 'execution', label: 'Execution' },
        { value: 'issuer', label: 'Issuer' },
        { value: 'active', label: 'Active' },
        { value: 'closure_initiated', label: 'Closure Initiated' },
        { value: 'closed', label: 'Closed' },
    ];

/**
 * Get cancellation reason options for dropdowns
 */
export const getCancellationReasonOptions = (): Array<{
    value: string;
    label: string;
}> => [
        { value: 'not_required', label: 'Not Required Anymore' },
        { value: 'wrong_details', label: 'Wrong Details Entered' },
        { value: 'duplicate', label: 'Duplicate Permit' },
        { value: 'safety_concern', label: 'Safety Concern' },
        { value: 'other', label: 'Other' },
    ];

