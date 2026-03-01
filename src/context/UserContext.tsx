/**
 * UserContext - Typed context for user authentication and profile state
 */

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    useRef,
    type ReactNode,
} from 'react';
import { verifyUser, getMyProfileData } from '@/services/user.service';
import { sendHeartbeat } from '@/services/activity.service';
import type { User, UserContextType } from '@/models';

// Create context with undefined default
const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook to use the user context
export const useUser = (): UserContextType => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

// Props for UserProvider
interface UserProviderProps {
    children: ReactNode;
}

// Storage helper functions
const getStoredUser = (): User | null => {
    try {
        const stored =
            localStorage.getItem('user') || sessionStorage.getItem('user');
        return stored ? (JSON.parse(stored) as User) : null;
    } catch {
        return null;
    }
};

const getStorage = (): Storage => {
    const loginPreference =
        localStorage.getItem('loginPreference') ||
        sessionStorage.getItem('loginPreference');
    return loginPreference === 'local' ? localStorage : sessionStorage;
};

const saveUserToStorage = (userData: User): void => {
    const storage = getStorage();
    storage.setItem('user', JSON.stringify(userData));
};

const clearStorage = (): void => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    localStorage.removeItem('loginPreference');
    sessionStorage.removeItem('loginPreference');
};

// UserProvider component
export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [signature, setSignature] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Load user data from localStorage on initial mount
    useEffect(() => {
        const loadStoredUser = (): void => {
            try {
                const storedUser = getStoredUser();
                if (storedUser) {
                    setUser(storedUser);
                    // Handle both string and object format for profile picture
                    const profilePic = storedUser.profilePicture;
                    const sig = storedUser.signature;
                    setProfilePicture(
                        typeof profilePic === 'string' ? profilePic : (profilePic as any)?.url ?? null
                    );
                    setSignature(
                        typeof sig === 'string' ? sig : (sig as any)?.url ?? null
                    );
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Error loading stored user:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStoredUser();
    }, []);

    // Session heartbeat - sends every 5 minutes when authenticated
    const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
    useEffect(() => {
        if (isAuthenticated) {
            // Send initial heartbeat
            sendHeartbeat();
            // Set interval for every 5 minutes
            heartbeatRef.current = setInterval(() => {
                sendHeartbeat();
            }, 5 * 60 * 1000);
        }

        return () => {
            if (heartbeatRef.current) {
                clearInterval(heartbeatRef.current);
                heartbeatRef.current = null;
            }
        };
    }, [isAuthenticated]);

    // Load profile data from API
    const loadProfileData = useCallback(async (): Promise<void> => {
        try {
            const profileResponse = await getMyProfileData();
            if (profileResponse.data) {
                const {
                    profilePicture: profilePictureData,
                    signature: signatureData,
                } = profileResponse.data as any;

                // Backend returns objects with url property, extract the URL string
                const newProfilePicture = typeof profilePictureData === 'string'
                    ? profilePictureData
                    : profilePictureData?.url ?? null;
                const newSignature = typeof signatureData === 'string'
                    ? signatureData
                    : signatureData?.url ?? null;

                setProfilePicture(newProfilePicture);
                setSignature(newSignature);

                // Update stored user with profile data
                const storedUser = getStoredUser();
                if (storedUser) {
                    saveUserToStorage({
                        ...storedUser,
                        profilePicture: newProfilePicture ?? undefined,
                        signature: newSignature ?? undefined,
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load profile data:', error);
        }
    }, []);

    // Load fresh user data from API
    const loadUserData = useCallback(async (): Promise<User | undefined> => {
        try {
            setLoading(true);
            const authResponse = await verifyUser();
            if (authResponse.data) {
                setUser(authResponse.data);
                setIsAuthenticated(true);
                saveUserToStorage(authResponse.data);

                // Load profile data
                await loadProfileData();
                return authResponse.data;
            } else {
                clearUserData();
                return undefined;
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
            clearUserData();
            return undefined;
        } finally {
            setLoading(false);
        }
    }, [loadProfileData]);

    // Update profile picture
    const updateProfilePicture = useCallback((newProfilePicture: string): void => {
        setProfilePicture(newProfilePicture);

        // Also update the user object so components accessing user.profilePicture get the new value
        setUser(prevUser => {
            if (prevUser) {
                return {
                    ...prevUser,
                    profilePicture: newProfilePicture || undefined,
                } as User;
            }
            return prevUser;
        });

        const storedUser = getStoredUser();
        if (storedUser) {
            saveUserToStorage({
                ...storedUser,
                profilePicture: newProfilePicture || undefined,
            });
        }
    }, []);

    // Update signature
    const updateSignature = useCallback((newSignature: string): void => {
        setSignature(newSignature);

        // Also update the user object so components accessing user.signature get the new value
        setUser(prevUser => {
            if (prevUser) {
                return {
                    ...prevUser,
                    signature: newSignature || undefined,
                } as User;
            }
            return prevUser;
        });

        const storedUser = getStoredUser();
        if (storedUser) {
            saveUserToStorage({
                ...storedUser,
                signature: newSignature || undefined,
            });
        }
    }, []);

    // Set user data (called after login)
    const setUserData = useCallback(
        (userData: User): void => {
            setUser(userData);
            setIsAuthenticated(true);
            saveUserToStorage(userData);

            // Immediately load profile data after setting user
            void loadProfileData();
        },
        [loadProfileData]
    );

    // Clear user data
    const clearUserData = useCallback((): void => {
        setUser(null);
        setProfilePicture(null);
        setSignature(null);
        setIsAuthenticated(false);
        clearStorage();
    }, []);

    // Logout
    const logout = useCallback((): void => {
        clearUserData();
    }, [clearUserData]);

    // Context value
    const value: UserContextType = {
        user,
        profilePicture,
        signature,
        loading,
        isAuthenticated,
        updateProfilePicture,
        updateSignature,
        setUserData,
        logout,
        refreshUserData: loadUserData,
        loadProfileData,
    };

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserContext;
