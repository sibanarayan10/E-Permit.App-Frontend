/**
 * Permit-related TypeScript types and interfaces
 */

import type { UserSummary } from './user.types';

// Permit type enum
export enum PermitType {
    ELECTRICAL = 'electrical',
    MECHANICAL = 'mechanical',
    HOT_WORK = 'hot_work',
    CONFINED_SPACE = 'confined_space',
    HEIGHT_WORK = 'height_work',
    EXCAVATION = 'excavation',
    GENERAL = 'general',
}

// Permit status enum
export enum PermitStatus {
    PENDING = 'pending',
    APPROVED = 'approved',
    REJECTED = 'rejected',
    CANCELLED = 'cancelled',
    CLOSED = 'closed',
    EXPIRED = 'expired',
}

// Workflow stage enum
export enum WorkflowStage {
    INITIATION = 'initiation',
    EXECUTION = 'execution',
    ISSUER = 'issuer',
    ACTIVE = 'active',
    CLOSURE_INITIATED = 'closure_initiated',
    CLOSURE_EXECUTOR = 'closure_executor',
    CLOSURE_ISSUER = 'closure_issuer',
    CLOSED = 'closed',
}

// Cancellation reason enum
export enum CancellationReason {
    NOT_REQUIRED = 'Not Required Anymore',
    WRONG_DETAILS = 'Wrong Details Entered',
    DUPLICATE = 'Duplicate Permit',
    SAFETY_CONCERN = 'Safety Concern',
    OTHER = 'Other',
}

// Hazard type
export interface Hazard {
    type: string;
    description: string;
    precautions: string[];
}

// Safety measure type
export interface SafetyMeasure {
    measure: string;
    checked: boolean;
    remarks?: string;
}

// Permit location
export interface PermitLocation {
    area: string;
    subArea?: string;
    equipment?: string;
    description?: string;
}

// Permit validity
export interface PermitValidity {
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
}

// Closure data
export interface ClosureData {
    initiatorRemarks?: string;
    initiatorClosedAt?: string;
    executorRemarks?: string;
    executorChecklist?: SafetyMeasure[];
    executorClosedAt?: string;
    issuerRemarks?: string;
    issuerClosedAt?: string;
    finalClosedAt?: string;
}

// Cancellation data
export interface CancellationData {
    reason: CancellationReason;
    remarks?: string;
    cancelledBy: UserSummary;
    cancelledAt: string;
}

// Renewal data (legacy)
export interface RenewalData {
    renewedFrom: string;
    renewalCount: number;
    renewedAt: string;
    renewedBy: UserSummary;
    newEndDate: string;
}

// Pending Renewal Request data (new structure for period-only renewals)
export interface PendingRenewalData {
    from?: { date?: string; hrs?: string };
    to?: { date?: string; hrs?: string };
    renewalReason?: string;
    requestedBy?: UserSummary;
    requestedAt?: string;
    isActive?: boolean;
    executorApproval?: {
        approved?: boolean;
        approvedBy?: UserSummary;
        approvedAt?: string;
        comments?: string;
    };
}

// Base permit interface
export interface Permit {
    _id: string;
    permitNumber: string;
    type: PermitType;
    status: PermitStatus;
    stage: WorkflowStage;

    // Alternate naming from API
    permitStatus?: string;
    currentStage?: string;
    protocolNumber?: string;
    srNo?: string;

    // Personnel
    initiator: UserSummary;
    assignedExecutor?: UserSummary;
    assignedIssuer?: UserSummary;
    createdBy?: UserSummary;

    // Details
    title: string;
    description: string;
    location: PermitLocation;
    validity: PermitValidity;

    // Safety
    hazards: Hazard[];
    safetyMeasures: SafetyMeasure[];
    ppe: string[];

    // Pre-permit checks (dynamic object from API)
    prePermitChecks?: Record<string, boolean | string>;

    // Approval data
    executorApproval?: {
        approved: boolean;
        remarks?: string;
        approvedAt?: string;
        approvedBy?: UserSummary;
        signature?: string;
    };
    // Alias for executorApproval
    executionApproval?: {
        approved: boolean;
        comments?: string;
        approvedAt?: string;
        approvedBy?: UserSummary;
        signature?: string;
    };
    issuerApproval?: {
        approved: boolean;
        remarks?: string;
        comments?: string;
        approvedAt?: string;
        approvedBy?: UserSummary;
        signature?: string;
    };

    // Closure
    closure?: ClosureData;

    // Cancellation
    cancellation?: CancellationData;

    // Renewal (legacy)
    renewal?: RenewalData;

    // Pending Renewal Request (new - for period-only renewals)
    pendingRenewal?: PendingRenewalData;

    // HIRA Linkage
    isHiraRequired?: boolean;
    hiraId?: string | {
        _id: string;
        hiraNumber: string;
        jobHeader?: {
            area: string;
            jobType: string;
            jobDetails: string;
            preparedBy: string;
        };
        status?: string;
        isLocked?: boolean;
        rows?: any[];
    };

    // Timestamps
    createdAt: string;
    updatedAt: string;
}

// Permit for list display (minimal)
export interface PermitSummary {
    _id: string;
    permitNumber: string;
    permitType?: string;
    type: PermitType;
    status: PermitStatus;
    stage: WorkflowStage;
    title?: string;
    initiator: UserSummary;
    createdBy?: string;
    assignedExecutor?: UserSummary;
    assignedIssuer?: UserSummary;
    validity?: PermitValidity;
    createdAt: string;
}

// Create permit payload
export interface CreatePermitPayload {
    type: PermitType;
    title: string;
    description: string;
    location: PermitLocation;
    validity: PermitValidity;
    hazards: Hazard[];
    safetyMeasures: SafetyMeasure[];
    ppe: string[];
}

// Edit permit payload
export interface EditPermitPayload {
    title?: string;
    description?: string;
    location?: PermitLocation;
    validity?: PermitValidity;
    hazards?: Hazard[];
    safetyMeasures?: SafetyMeasure[];
    ppe?: string[];
}

// Submit to execution payload
export interface SubmitToExecutionPayload {
    assignedExecutorId: string;
}

// Signatory details structure (used in execution approval)
export interface SignatoryDetails {
    name: string;
    signature: string;
    date: Date | string;
    time: string;
}

// Execution approval payload
export interface ExecutionApprovalPayload {
    assignedIssuerId: string;
    comments?: string;
    executingAgency: {
        specialPPEsToolsEquipment?: string[];
        numberOfPersonsAttached?: number;
        nameOfPersons?: string[];
        attachSeparateList?: boolean;
        acceptorName: string;
        acceptorSignature: SignatoryDetails;
        holderName?: string;
        holderSignature?: SignatoryDetails;
        acceptanceDate: Date | string;
        acceptanceTime: string;
    };
    preExecutionChecks: {
        jobSpecificSafetyTalk?: string;
        sparkGeneratingWork?: string;
        combustibleMaterialRemoved?: string;
        barriersGuardsUsed?: string;
        barricadingRequired?: string;
        fireExtinguisherLocationKnown?: string;
        additionalIlluminationRequired?: string;
        additionalSupplyPointsRequired?: string;
        gasTestingRequired?: string;
        periodicGasMonitoringRequired?: string;
        repDetails: SignatoryDetails;
    };
}

// Issuer approval payload
export interface IssuerApprovalPayload {
    approved: boolean;
    remarks?: string;
    signature?: string;
}

// Cancel permit payload
export interface CancelPermitPayload {
    reason: string; // Can be enum value or custom string like 'CHANGE_OF_SCOPE'
    remarks?: string;
    comments?: string; // Alternative to remarks
}

// Renew permit payload
export interface RenewPermitPayload {
    newEndDate: string;
    remarks?: string;
}

// Closure payloads
export interface InitiateClosurePayload {
    initiatorDetails: {
        name: string;
        signature: string;
        date: string;
        time: string;
    };
    executingAgencyRepSignature?: string;
    remarks?: string;
}

export interface ExecutorClosurePayload {
    checklist: {
        isWorkCompleted?: string;
        equipmentRemoved?: string;
        personnelMovedToSafe?: string;
        locksRemoved?: string;
        workAreaCleaned?: string;
        testRunRequired?: string;
        testingProcedureAgreed?: string;
    };
    executingAgencyRepDetails?: {
        name: string;
        signature: string;
        date?: string;
        time?: string;
    };
    assignedIssuerId?: string;
    remarks?: string;
}

export interface IssuerClosurePayload {
    checklist: {
        multiplePermitsIssued?: string;
        allWorkCompleted?: string;
        isolationCertificatesReturned?: string;
        testRunRequired?: string;
        equipmentMovedToSafe?: string;
        emergencyProceduresInPlace?: string;
    };
    isolationRemovalDetails?: Array<{
        description: string;
        removedBy: string;
        date: string;
    }>;
    finalCertification?: {
        allIsolationsRestored: boolean;
    };
    issuerDetails?: {
        name: string;
        signature: string;
        date?: string;
        time?: string;
    };
    remarks?: string;
}

// Search permits payload
export interface SearchPermitsPayload {
    permitNumber?: string;
    type?: PermitType;
    status?: PermitStatus;
    stage?: WorkflowStage;
    initiatorId?: string;
    executorId?: string;
    issuerId?: string;
    startDate?: string;
    endDate?: string;
    searchText?: string;
}

// Permit statistics
export interface PermitStats {
    totalPermits: number;
    activePermits: number;
    pendingPermits: number;
    closedPermits: number;
    cancelledPermits: number;
    draftPermits?: number;
    permitsByType?: Record<string, number>;
    permitsByStatus?: Record<string, number>;
}

// Permit numbers response (matches actual API: GET /permits/next-numbers)
export interface PermitNumbersResponse {
    permitNumber: string;
    protocolNumber: string;
    srNo: string;
}
