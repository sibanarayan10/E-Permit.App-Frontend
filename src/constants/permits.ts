/**
 * Constants - Permit-related constants
 */

// Types imported for documentation/reference purposes

export const PERMIT_TYPE_LABELS: Record<string, string> = {
    electrical: 'Electrical',
    mechanical: 'Mechanical',
    hot_work: 'Hot Work',
    confined_space: 'Confined Space',
    height_work: 'Height Work',
    excavation: 'Excavation',
    general: 'General',
};

export const PERMIT_STATUS_LABELS: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
    closed: 'Closed',
    expired: 'Expired',
};

export const WORKFLOW_STAGE_LABELS: Record<string, string> = {
    initiation: 'Initiation',
    execution: 'Execution',
    issuer: 'Issuer Review',
    active: 'Active',
    closure_initiated: 'Closure Initiated',
    closure_executor: 'Executor Closure',
    closure_issuer: 'Issuer Closure',
    closed: 'Closed',
};

export const STATUS_COLORS: Record<string, string> = {
    pending: '#ffc107',
    approved: '#28a745',
    rejected: '#dc3545',
    cancelled: '#6c757d',
    closed: '#17a2b8',
    expired: '#856404',
    active: '#28a745',
};

export const PERMIT_TYPE_COLORS: Record<string, string> = {
    electrical: '#ffc107',
    mechanical: '#17a2b8',
    hot_work: '#dc3545',
    confined_space: '#6610f2',
    height_work: '#fd7e14',
    excavation: '#795548',
    general: '#6c757d',
};

export const DEFAULT_PPE_LIST = [
    'Safety Helmet',
    'Safety Glasses',
    'Safety Shoes',
    'High Visibility Vest',
    'Gloves',
    'Ear Protection',
    'Face Shield',
    'Fall Protection Harness',
];

export const DEFAULT_HAZARDS = [
    'Electrical Shock',
    'Fire',
    'Explosion',
    'Fall from Height',
    'Confined Space',
    'Hot Surfaces',
    'Moving Machinery',
    'Chemical Exposure',
];
