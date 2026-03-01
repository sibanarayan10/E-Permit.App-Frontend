/**
 * Barrel export for all TypeScript types
 */

// User types
export * from './user.types';

// Permit types (exclude SignatoryDetails to avoid conflict with heightPermit.types)
export {
    PermitType,
    PermitStatus,
    WorkflowStage,
    CancellationReason,
    type Hazard,
    type SafetyMeasure,
    type PermitLocation,
    type PermitValidity,
    type ClosureData,
    type CancellationData,
    type RenewalData,
    type PendingRenewalData,
    type Permit,
    type PermitSummary,
    type CreatePermitPayload,
    type EditPermitPayload,
    type SubmitToExecutionPayload,
    type ExecutionApprovalPayload,
    type IssuerApprovalPayload,
    type CancelPermitPayload,
    type RenewPermitPayload,
    type InitiateClosurePayload,
    type ExecutorClosurePayload,
    type IssuerClosurePayload,
    type SearchPermitsPayload,
    type PermitStats,
    type PermitNumbersResponse,
} from './permit.types';

// Height Permit types (includes SignatoryDetails)
export * from './heightPermit.types';

// API types
export * from './api.types';
