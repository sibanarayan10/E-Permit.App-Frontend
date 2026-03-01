/**
 * Fluent UI Theme Configuration
 * 
 * Custom theme with brand colors and dark mode support
 */

import {
    createLightTheme,
    createDarkTheme,
    type BrandVariants,
    type Theme,
} from '@fluentui/react-components';

/**
 * Brand color palette
 * Using a professional blue as primary brand color with proper contrast
 */
const brandColors: BrandVariants = {
    10: '#020508',
    20: '#0d1a2a',
    30: '#112845',
    40: '#13355e',
    50: '#134377',
    60: '#0e5191',
    70: '#0060ab',
    80: '#006fc5',  // Primary brand color
    90: '#2e80c9',
    100: '#4991ce',
    110: '#5fa2d3',
    120: '#74b3d8',
    130: '#89c4de',
    140: '#9ed5e4',
    150: '#b4e6ea',
    160: '#cbf7f1',
};

/**
 * Light theme based on brand colors
 */
export const lightTheme: Theme = {
    ...createLightTheme(brandColors),
};

/**
 * Dark theme based on brand colors
 */
export const darkTheme: Theme = {
    ...createDarkTheme(brandColors),
};

/**
 * Custom color tokens for specific use cases
 */
export const customTokens = {
    // Status colors
    statusPending: '#FFA500',
    statusApproved: '#28a745',
    statusRejected: '#dc3545',
    statusCancelled: '#6c757d',
    statusClosed: '#17a2b8',
    statusExpired: '#856404',

    // Workflow stage colors
    stageInitiation: '#007bff',
    stageExecution: '#fd7e14',
    stageIssuer: '#6f42c1',
    stageActive: '#28a745',
    stageClosure: '#17a2b8',
    stageClosed: '#6c757d',

    // Permit type colors
    permitElectrical: '#ffc107',
    permitMechanical: '#17a2b8',
    permitHotWork: '#dc3545',
    permitConfinedSpace: '#6610f2',
    permitHeightWork: '#fd7e14',
    permitExcavation: '#795548',
    permitGeneral: '#6c757d',
};

/**
 * Typography customizations
 */
export const typography = {
    fontFamilyBase: "'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif",
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightSemibold: 600,
    fontWeightBold: 700,
};

/**
 * Spacing scale
 */
export const spacing = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
};

/**
 * Border radius scale
 */
export const borderRadius = {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    round: '50%',
};

/**
 * Shadow scale
 */
export const shadows = {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
};

/**
 * Breakpoints for responsive design
 */
export const breakpoints = {
    xs: '320px',
    sm: '576px',
    md: '768px',
    lg: '992px',
    xl: '1200px',
    xxl: '1400px',
};

/**
 * Z-index scale
 */
export const zIndex = {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
};
