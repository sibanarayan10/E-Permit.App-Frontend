/**
 * Custom Hooks - useAuth
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context';
import { loginUser, logoutUser } from '@/services';
import toast from 'react-hot-toast';

interface UseAuthReturn {
    user: ReturnType<typeof useUser>['user'];
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string, rememberMe?: boolean) => Promise<boolean>;
    logout: () => Promise<void>;
    refreshUser: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
    const navigate = useNavigate();
    const {
        user,
        isAuthenticated,
        loading: isLoading,
        setUserData,
        logout: contextLogout,
        refreshUserData,
    } = useUser();

    const login = useCallback(
        async (email: string, password: string, rememberMe = false): Promise<boolean> => {
            try {
                // Set login preference
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('loginPreference', rememberMe ? 'local' : 'session');

                const response = await loginUser(email, password);

                if (response.success && response.data) {
                    setUserData(response.data);
                    toast.success('Login successful!');
                    return true;
                }
                return false;
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Login failed';
                toast.error(message);
                return false;
            }
        },
        [setUserData]
    );

    const logout = useCallback(async (): Promise<void> => {
        try {
            await logoutUser();
            toast.success('Logged out successfully');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            contextLogout();
            navigate('/login');
        }
    }, [contextLogout, navigate]);

    const refreshUser = useCallback(async (): Promise<void> => {
        await refreshUserData();
    }, [refreshUserData]);

    return {
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
    };
};

export default useAuth;
