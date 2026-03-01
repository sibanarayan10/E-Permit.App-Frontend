/**
 * Main Application Component
 */

import React, { useState, Suspense, lazy } from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation,
} from 'react-router-dom';
import {
    FluentProvider,
} from '@fluentui/react-components';
import { Toaster as HotToaster } from 'react-hot-toast';

// Theme
import { lightTheme, darkTheme } from './theme';

// Context
import { UserProvider, useUser, ThemeProvider, useTheme } from '@/context';

// Common Components
import { Header, Sidebar, PageLoading } from '@/components/common';

// Lazy loaded pages
const HomePage = lazy(() => import('@/features/home/HomePage'));
const LoginPage = lazy(() => import('@/features/auth/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/features/auth/ResetPasswordPage'));
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'));
const PermitsTablePage = lazy(() => import('@/features/permits/PermitsTablePage'));
const AddPermitPage = lazy(() => import('@/features/permits/AddPermitFormPage'));
const SearchPage = lazy(() => import('@/features/search/SearchPage'));
const UserManagementPage = lazy(() => import('@/features/users/UserManagementPage'));
const EmailTemplatesPage = lazy(() => import('@/features/email-templates/EmailTemplatesPage'));
const ProfilePage = lazy(() => import('@/features/profile/ProfilePage'));
const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'));
const HiraListPage = lazy(() => import('@/features/hira/HiraListPage'));
const HiraFormPage = lazy(() => import('@/features/hira/HiraFormPage'));
const HiraViewPage = lazy(() => import('@/features/hira/HiraViewPage'));
const DataRequestListPage = lazy(() => import('@/features/data-request/DataRequestListPage'));
const DataRequestVerifyPage = lazy(() => import('@/features/data-request/DataRequestVerifyPage'));
const DataRequestApprovePage = lazy(() => import('@/features/data-request/DataRequestApprovePage'));
const LearningListPage = lazy(() => import('@/features/learning/LearningListPage'));
const LearningDetailPage = lazy(() => import('@/features/learning/LearningDetailPage'));
const LearningAdminPage = lazy(() => import('@/features/learning/LearningAdminPage'));

// Styles
import '@/styles/global.css';

/**
 * Layout wrapper for pages with sidebar
 */
interface AppLayoutProps {
    children: React.ReactNode;
    hasSidebar?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, hasSidebar = true }) => {
    return (
        <div className="app-layout">
            <div className={`main-content ${hasSidebar ? '' : 'full-width'}`}>
                {children}
            </div>
        </div>
    );
};

/**
 * Sidebar wrapper component
 */
interface AppSidebarProps {
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({
    isSidebarOpen,
    toggleSidebar,
}) => {
    const location = useLocation();
    const { user } = useUser();

    const publicRoutes = ['/', '/login', '/forgot-password'];
    const isPublicRoute =
        publicRoutes.includes(location.pathname) ||
        location.pathname.startsWith('/reset-password') ||
        location.pathname.startsWith('/data-request/verify') ||
        location.pathname.startsWith('/data-request/approve');

    if (isPublicRoute || !user) {
        return null;
    }

    return (
        <Sidebar
            user={user}
            currentPath={location.pathname}
            isOpen={isSidebarOpen}
            onClose={toggleSidebar}
        />
    );
};

/**
 * Protected Route - requires authentication
 */
interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { user, loading } = useUser();

    if (loading) {
        return <PageLoading label="Checking authentication..." />;
    }

    return user ? <>{children}</> : <Navigate to="/login" replace />;
};

/**
 * Public Route - redirects to dashboard if authenticated
 */
interface PublicRouteProps {
    children: React.ReactNode;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
    const { user, loading } = useUser();

    if (loading) {
        return <PageLoading label="Loading..." />;
    }

    return user ? <Navigate to="/dashboard" replace /> : <>{children}</>;
};

/**
 * Main App Content
 */
const AppContent: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <Routes>
            {/* Full-screen public route - No header/sidebar */}
            <Route
                path="/"
                element={
                    <Suspense fallback={<PageLoading />}>
                        <HomePage />
                    </Suspense>
                }
            />

            {/* All other routes with app layout */}
            <Route
                path="*"
                element={
                    <div className="app">
                        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

                        <div className="app-body">
                            <AppSidebar
                                isSidebarOpen={isSidebarOpen}
                                toggleSidebar={toggleSidebar}
                            />

                            <main className="app-main">
                                <Suspense fallback={<PageLoading />}>
                                    <Routes>
                                        <Route
                                            path="/login"
                                            element={
                                                <PublicRoute>
                                                    <LoginPage />
                                                </PublicRoute>
                                            }
                                        />

                                        <Route
                                            path="/forgot-password"
                                            element={
                                                <PublicRoute>
                                                    <ForgotPasswordPage />
                                                </PublicRoute>
                                            }
                                        />

                                        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                                        {/* Protected Routes */}
                                        <Route
                                            path="/dashboard"
                                            element={
                                                <ProtectedRoute>
                                                    <AppLayout>
                                                        <DashboardPage />
                                                    </AppLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/permits"
                                            element={
                                                <ProtectedRoute>
                                                    <AppLayout>
                                                        <PermitsTablePage />
                                                    </AppLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/add-permit"
                                            element={
                                                <ProtectedRoute>
                                                    <AppLayout>
                                                        <AddPermitPage />
                                                    </AppLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/edit-permit/:id"
                                            element={
                                                <ProtectedRoute>
                                                    <AppLayout>
                                                        <AddPermitPage />
                                                    </AppLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/search"
                                            element={
                                                <ProtectedRoute>
                                                    <AppLayout>
                                                        <SearchPage />
                                                    </AppLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/users"
                                            element={
                                                <ProtectedRoute>
                                                    <AppLayout>
                                                        <UserManagementPage />
                                                    </AppLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/email-templates"
                                            element={
                                                <ProtectedRoute>
                                                    <AppLayout>
                                                        <EmailTemplatesPage />
                                                    </AppLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/profile"
                                            element={
                                                <ProtectedRoute>
                                                    <AppLayout>
                                                        <ProfilePage />
                                                    </AppLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/settings"
                                            element={
                                                <ProtectedRoute>
                                                    <AppLayout>
                                                        <SettingsPage />
                                                    </AppLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/hira"
                                            element={
                                                <ProtectedRoute>
                                                    <AppLayout>
                                                        <HiraListPage />
                                                    </AppLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/hira/new"
                                            element={
                                                <ProtectedRoute>
                                                    <AppLayout>
                                                        <HiraFormPage />
                                                    </AppLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/hira/:id"
                                            element={
                                                <ProtectedRoute>
                                                    <AppLayout>
                                                        <HiraViewPage />
                                                    </AppLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/hira/:id/edit"
                                            element={
                                                <ProtectedRoute>
                                                    <AppLayout>
                                                        <HiraFormPage />
                                                    </AppLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* Data Request Routes */}
                                        <Route
                                            path="/data-requests"
                                            element={
                                                <ProtectedRoute>
                                                    <AppLayout>
                                                        <DataRequestListPage />
                                                    </AppLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* Public routes for external verification */}
                                        <Route
                                            path="/data-request/verify/:token"
                                            element={<DataRequestVerifyPage />}
                                        />

                                        <Route
                                            path="/data-request/approve/:id"
                                            element={<DataRequestApprovePage />}
                                        />

                                        {/* Learning Routes */}
                                        <Route
                                            path="/learning"
                                            element={
                                                <ProtectedRoute>
                                                    <AppLayout>
                                                        <LearningListPage />
                                                    </AppLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/learning/admin"
                                            element={
                                                <ProtectedRoute>
                                                    <AppLayout>
                                                        <LearningAdminPage />
                                                    </AppLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        <Route
                                            path="/learning/:id"
                                            element={
                                                <ProtectedRoute>
                                                    <AppLayout>
                                                        <LearningDetailPage />
                                                    </AppLayout>
                                                </ProtectedRoute>
                                            }
                                        />

                                        {/* Catch all */}
                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </Suspense>
                            </main>
                        </div>

                        {/* Toast notifications */}
                        <HotToaster
                            position="top-right"
                            toastOptions={{
                                duration: 3000,
                                style: {
                                    background: '#363636',
                                    color: '#fff',
                                    borderRadius: '8px',
                                },
                                success: {
                                    duration: 3000,
                                    style: {
                                        background: '#28a745',
                                    },
                                },
                                error: {
                                    duration: 4000,
                                    style: {
                                        background: '#dc3545',
                                    },
                                },
                            }}
                        />
                    </div>
                }
            />
        </Routes>
    );
};

/**
 * Themed App wrapper - applies theme from context
 */
const ThemedApp: React.FC = () => {
    const { isDarkMode } = useTheme();
    const theme = isDarkMode ? darkTheme : lightTheme;

    return (
        <FluentProvider theme={theme}>
            <UserProvider>
                <Router>
                    <AppContent />
                </Router>
            </UserProvider>
        </FluentProvider>
    );
};

/**
 * Root App Component with Providers
 */
const App: React.FC = () => {
    return (
        <ThemeProvider>
            <ThemedApp />
        </ThemeProvider>
    );
};

export default App;
