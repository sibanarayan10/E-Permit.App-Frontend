/**
 * Location API Service
 */

import apiClient, { extractErrorMessage } from './api';
import type { Location, LocationType, ApiResponse } from '@/models';

/**
 * Get all locations
 */
export const getAllLocations = async (): Promise<ApiResponse<Location[]>> => {
    try {
        const response = await apiClient.get<{
            message: string;
            data: Location[];
        }>('/locations');
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to fetch locations'));
    }
};

// Alias for backwards compatibility
export const getLocations = getAllLocations;

/**
 * Get sub-locations by parent location name
 */
export const getSubLocations = async (
    location: string
): Promise<ApiResponse<string[]>> => {
    try {
        if (!location) {
            throw new Error('Location is required');
        }
        const response = await apiClient.get<{
            message: string;
            data: string[];
        }>(`/locations/${encodeURIComponent(location)}/sub-locations`);
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to fetch sub-locations'));
    }
};

/**
 * Get locations by type
 */
export const getLocationsByType = async (
    type: LocationType
): Promise<ApiResponse<Location[]>> => {
    try {
        const response = await apiClient.get<{
            message: string;
            data: Location[];
        }>(`/locations/type/${type}`);
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, 'Failed to fetch locations by type')
        );
    }
};

/**
 * Get location by ID
 */
export const getLocationById = async (
    locationId: string
): Promise<ApiResponse<Location>> => {
    try {
        const response = await apiClient.get<{
            message: string;
            data: Location;
        }>(`/locations/${locationId}`);
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to fetch location'));
    }
};

/**
 * Get child locations
 */
export const getChildLocations = async (
    parentId: string
): Promise<ApiResponse<Location[]>> => {
    try {
        const response = await apiClient.get<{
            message: string;
            data: Location[];
        }>(`/locations/${parentId}/children`);
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(
            extractErrorMessage(error, 'Failed to fetch child locations')
        );
    }
};

/**
 * Create location (Admin only)
 */
export const createLocation = async (locationData: {
    name: string;
    code: string;
    type: LocationType;
    parent?: string;
}): Promise<ApiResponse<Location>> => {
    try {
        const response = await apiClient.post<{
            message: string;
            data: Location;
        }>('/locations', locationData);
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to create location'));
    }
};

/**
 * Update location (Admin only)
 */
export const updateLocation = async (
    locationId: string,
    updates: Partial<Location>
): Promise<ApiResponse<Location>> => {
    try {
        const response = await apiClient.put<{
            message: string;
            data: Location;
        }>(`/locations/${locationId}`, updates);
        return {
            success: true,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to update location'));
    }
};

/**
 * Delete location (Admin only)
 */
export const deleteLocation = async (
    locationId: string
): Promise<ApiResponse<null>> => {
    try {
        const response = await apiClient.delete<{ message: string }>(
            `/locations/${locationId}`
        );
        return {
            success: true,
            message: response.data.message,
            data: null,
        };
    } catch (error) {
        throw new Error(extractErrorMessage(error, 'Failed to delete location'));
    }
};
