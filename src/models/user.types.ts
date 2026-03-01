/**
 * User-related TypeScript types and interfaces
 */

// User roles - using string literal type for flexibility
export type UserRole = 'ADMIN' | 'SUBADMIN' | 'CLIENT' | 'admin' | 'initiator' | 'executor' | 'issuer';

// User status enum
export enum UserStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    SUSPENDED = 'suspended',
}

// Base user interface
export interface User {
    _id?: string;
    id?: string;
    userId?: string; // 6-digit user ID
    email: string;
    name: string;
    role: UserRole;
    workflowStage?: string;
    department?: string;
    designation?: string;
    employeeId?: string;
    phone?: string;
    location?: string;
    subLocation?: string;
    profilePicture?: string;
    signature?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

// User for display in lists (minimal info)
export interface UserSummary {
    _id: string;
    name: string;
    email: string;
    role: UserRole;
    department: string;
    profilePicture?: string;
}

// Login credentials
export interface LoginCredentials {
    email: string;
    password: string;
}

// Login response
export interface LoginResponse {
    success: boolean;
    message: string;
    data: User;
}

// User creation/update payload
export interface CreateUserPayload {
    name: string;
    userId: string; // 6-digit user ID
    email: string;
    password: string;
    role: UserRole;
    workflowStage?: string;
    department?: string;
    designation?: string;
    employeeId?: string;
    phone?: string;
    location?: string;
    subLocation?: string;
}

export interface UpdateUserPayload {
    name?: string;
    userId?: string; // 6-digit user ID
    email?: string;
    role?: UserRole;
    workflowStage?: string;
    department?: string;
    designation?: string;
    employeeId?: string;
    phone?: string;
    location?: string;
    subLocation?: string;
    isActive?: boolean;
}

// Profile update payload
export interface UpdateProfilePayload {
    name?: string;
    phone?: string;
    designation?: string;
}

// Password reset payloads
export interface ForgotPasswordPayload {
    email: string;
}

export interface ResetPasswordPayload {
    password: string;
    confirmPassword: string;
}

// User statistics
export interface UserStats {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    usersByRole: Record<UserRole, number>;
}

// User context state
export interface UserContextState {
    user: User | null;
    profilePicture: string | null;
    signature: string | null;
    loading: boolean;
    isAuthenticated: boolean;
}

// User context actions
export interface UserContextActions {
    setUserData: (userData: User) => void;
    logout: () => void;
    refreshUserData: () => Promise<User | undefined>;
    loadProfileData: () => Promise<void>;
    updateProfilePicture: (newProfilePicture: string) => void;
    updateSignature: (newSignature: string) => void;
}

// Full user context type
export type UserContextType = UserContextState & UserContextActions;
