/**
 * Constants - Route paths
 */

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password/:token',
    DASHBOARD: '/dashboard',
    PERMITS: '/permits',
    ADD_PERMIT: '/add-permit',
    SEARCH: '/search',
    USERS: '/users',
    EMAIL_TEMPLATES: '/email-templates',
    PROFILE: '/profile',
    SETTINGS: '/settings',
    HIRA: '/hira',
} as const;

export const PUBLIC_ROUTES = [
    ROUTES.HOME,
    ROUTES.LOGIN,
    ROUTES.FORGOT_PASSWORD,
];
