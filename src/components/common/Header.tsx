/**
 * Header Component - Clean professional design with Fluent UI
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    makeStyles,
    tokens,
    Button,
    Avatar,
    Menu,
    MenuTrigger,
    MenuPopover,
    MenuList,
    MenuItem,
    MenuDivider,
    Badge,
    Text,
    Drawer,
    DrawerHeader,
    DrawerHeaderTitle,
    DrawerBody,
    Spinner,
} from '@fluentui/react-components';
import {
    Navigation24Regular,
    PersonCircle24Regular,
    SignOut24Regular,
    Alert24Regular,
    Checkmark24Regular,
    Dismiss24Regular,
} from '@fluentui/react-icons';
import { useUser } from '@/context';
import { logoutUser, getMyNotifications, markNotificationAsRead, markAllNotificationsAsRead, getPermitById, getHeightPermitById } from '@/services';
import { PermitDetails, HeightPermitDetails } from '@/components/permits';
import toast from 'react-hot-toast';
import sailLogo from '@/assets/Sail_Logo.jpeg';

const useStyles = makeStyles({
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 ${tokens.spacingHorizontalL}`,
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: '64px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        '@media (max-width: 768px)': {
            padding: `0 ${tokens.spacingHorizontalM}`,
            height: '56px',
        },
    },
    left: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
    },
    menuBtn: {
        color: 'white',
        minWidth: '36px',
        display: 'flex',
        '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.1)',
        },
        '@media (min-width: 992px)': {
            display: 'none',
        },
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
        cursor: 'pointer',
        padding: '6px 12px',
        borderRadius: tokens.borderRadiusMedium,
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.08)',
        },
    },
    logoImg: {
        width: '44px',
        height: '44px',
        borderRadius: '10px',
        border: '2px solid rgba(255,255,255,0.2)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        '@media (max-width: 768px)': {
            width: '36px',
            height: '36px',
        },
    },
    brand: {
        display: 'flex',
        flexDirection: 'column',
    },
    brandName: {
        fontSize: tokens.fontSizeBase400,
        fontWeight: tokens.fontWeightBold,
        color: 'white',
        lineHeight: 1.2,
        letterSpacing: '0.3px',
        '@media (max-width: 768px)': {
            fontSize: tokens.fontSizeBase300,
        },
    },
    brandSub: {
        fontSize: tokens.fontSizeBase100,
        color: 'rgba(255,255,255,0.75)',
        letterSpacing: '0.5px',
    },
    right: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
        '@media (max-width: 768px)': {
            gap: tokens.spacingHorizontalS,
        },
    },
    notifBtn: {
        position: 'relative',
        color: 'white',
        minWidth: '40px',
        height: '40px',
        borderRadius: '50%',
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.15)',
            transform: 'scale(1.05)',
        },
    },
    notifBadge: {
        position: 'absolute',
        top: '4px',
        right: '4px',
        minWidth: '18px',
        height: '18px',
        backgroundColor: '#ef4444',
        color: 'white',
        fontSize: '10px',
        fontWeight: tokens.fontWeightBold,
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #1e3a5f',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    },
    userBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        padding: '6px 12px',
        borderRadius: tokens.borderRadiusLarge,
        cursor: 'pointer',
        border: '1px solid rgba(255,255,255,0.15)',
        backgroundColor: 'rgba(255,255,255,0.08)',
        transition: 'all 0.2s ease',
        '&:hover': {
            backgroundColor: 'rgba(255,255,255,0.15)',
            border: '1px solid rgba(255,255,255,0.3)',
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
        },
        '@media (max-width: 640px)': {
            padding: '4px',
            gap: 0,
        },
    },
    userInfo: {
        display: 'flex',
        flexDirection: 'column',
        '@media (max-width: 640px)': {
            display: 'none',
        },
    },
    userName: {
        color: 'white',
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightSemibold,
    },
    userRole: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: tokens.fontSizeBase100,
    },
    drawerHeader: {
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)',
        color: 'white' as const,
        padding: tokens.spacingVerticalM,
    },
    drawerHeaderContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    notifList: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXS,
        padding: tokens.spacingHorizontalS,
    },
    notifItem: {
        padding: tokens.spacingHorizontalM,
        cursor: 'pointer',
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground1,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground1Hover,
            transform: 'translateX(-2px)',
            boxShadow: tokens.shadow4,
        },
    },
    notifUnread: {
        backgroundColor: tokens.colorNeutralBackground3,
        borderLeft: `4px solid ${tokens.colorBrandBackground}`,
    },
    notifHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: tokens.spacingVerticalXS,
        gap: tokens.spacingHorizontalS,
    },
    notifIcon: {
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tokens.colorBrandBackground,
        color: 'white',
        flexShrink: 0,
    },
    notifContent: {
        flex: 1,
        minWidth: 0,
    },
    notifTitle: {
        fontWeight: tokens.fontWeightSemibold,
        fontSize: tokens.fontSizeBase300,
        color: tokens.colorNeutralForeground1,
        marginBottom: tokens.spacingVerticalXXS,
    },
    notifMessage: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
        lineHeight: 1.4,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
    },
    notifTime: {
        fontSize: tokens.fontSizeBase100,
        color: tokens.colorNeutralForeground4,
        marginTop: tokens.spacingVerticalXS,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXS,
    },
    empty: {
        textAlign: 'center',
        padding: tokens.spacingVerticalXXL,
        color: tokens.colorNeutralForeground3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: tokens.spacingVerticalM,
    },
    emptyIcon: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: tokens.colorNeutralBackground3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: tokens.spacingVerticalS,
    },
});

interface Notification {
    _id: string;
    title?: string;
    message?: string;
    type?: string;
    permitId?: string;
    permitNumber?: string;
    permitType?: 'general' | 'height';
    isRead?: boolean;
    createdAt?: string;
}

interface HeaderProps {
    toggleSidebar: () => void;
    isSidebarOpen: boolean;
}

export const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
    const styles = useStyles();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, profilePicture, logout } = useUser();

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    // Permit details state
    const [selectedPermit, setSelectedPermit] = useState<any>(null);
    const [permitType, setPermitType] = useState<'general' | 'height' | null>(null);
    const [showPermitDetails, setShowPermitDetails] = useState(false);
    const [loadingPermit, setLoadingPermit] = useState(false);

    // Handle window resize for mobile detection
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (user) loadNotifications();
    }, [user]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const res = await getMyNotifications();
            // Handle both direct array and object with notifications property
            const data = res.data as any;
            const notifList = data?.notifications || data?.data || [];
            setNotifications(notifList);
            // Calculate unread count from notifications or use provided value
            const unread = data?.unreadCount ?? notifList.filter((n: any) => !n?.isRead).length;
            setUnreadCount(unread);
        } catch { /* ignore */ } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logoutUser();
        } catch { /* ignore */ }
        logout();
        toast.success('Logged out');
        navigate('/login');
    };

    const handleMarkRead = async (id: string) => {
        await markNotificationAsRead(id);
        loadNotifications();
    };

    const handleMarkAllRead = async () => {
        await markAllNotificationsAsRead();
        loadNotifications();
    };

    const formatTime = (date?: string) => {
        if (!date) return '';
        const d = new Date(date);
        const diff = Date.now() - d.getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(diff / 3600000);
        if (hrs < 24) return `${hrs}h ago`;
        return d.toLocaleDateString();
    };

    // Handle notification click - fetch and show permit details
    const handleNotificationClick = async (n: Notification) => {
        if (!n.isRead) handleMarkRead(n._id);

        if (n.permitId) {
            setLoadingPermit(true);
            setShowNotifications(false);

            try {
                // Determine permit type from notification or permit number prefix
                const isHeightPermit = n.permitType === 'height' ||
                    (n.permitNumber && n.permitNumber.startsWith('HT-'));

                if (isHeightPermit) {
                    const response = await getHeightPermitById(n.permitId);
                    setSelectedPermit(response.data);
                    setPermitType('height');
                } else {
                    const response = await getPermitById(n.permitId);
                    setSelectedPermit(response.data);
                    setPermitType('general');
                }
                setShowPermitDetails(true);
            } catch (error) {
                toast.error('Failed to load permit details');
                console.error('Error loading permit:', error);
            } finally {
                setLoadingPermit(false);
            }
        } else {
            setShowNotifications(false);
        }
    };

    const closePermitDetails = () => {
        setShowPermitDetails(false);
        setSelectedPermit(null);
        setPermitType(null);
    };

    const isPublic = ['/', '/login', '/forgot-password'].includes(location.pathname) ||
        location.pathname.startsWith('/data-request/verify') ||
        location.pathname.startsWith('/data-request/approve');

    return (
        <>
            <header className={styles.header}>
                <div className={styles.left}>
                    {user && !isPublic && (
                        <Button
                            className={styles.menuBtn}
                            icon={<Navigation24Regular />}
                            appearance="subtle"
                            onClick={toggleSidebar}
                        />
                    )}
                    <div className={styles.logo} onClick={() => navigate(user ? '/dashboard' : '/')}>
                        <img src={sailLogo} alt="SAIL" className={styles.logoImg} />
                        <div className={styles.brand}>
                            <Text className={styles.brandName}>BHILAI STEEL PLANT</Text>
                            <Text className={styles.brandSub}>E-Permit System • SAIL</Text>
                        </div>
                    </div>
                </div>

                <div className={styles.right}>
                    {user ? (
                        <>
                            <Button
                                className={styles.notifBtn}
                                icon={<Alert24Regular />}
                                appearance="subtle"
                                onClick={() => setShowNotifications(true)}
                            >
                                {unreadCount > 0 && (
                                    <span className={styles.notifBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
                                )}
                            </Button>

                            <Menu>
                                <MenuTrigger disableButtonEnhancement>
                                    <div className={styles.userBtn}>
                                        <Avatar
                                            image={profilePicture ? { src: profilePicture } : undefined}
                                            name={user.name}
                                            size={36}
                                            badge={{ status: 'available', size: 'small' }}
                                        />
                                        <div className={styles.userInfo}>
                                            <Text className={styles.userName}>{user.name}</Text>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <Text className={styles.userRole}>{user.workflowStage || user.role}</Text>
                                            </div>
                                        </div>
                                    </div>
                                </MenuTrigger>
                                <MenuPopover>
                                    <MenuList>
                                        <MenuItem icon={<PersonCircle24Regular />} onClick={() => navigate('/profile')}>
                                            Profile
                                        </MenuItem>
                                        <MenuDivider />
                                        <MenuItem icon={<SignOut24Regular />} onClick={handleLogout}>
                                            Sign Out
                                        </MenuItem>
                                    </MenuList>
                                </MenuPopover>
                            </Menu>
                        </>
                    ) : (
                        <></>
                        // <Button appearance="primary" onClick={() => navigate('/login')}>Login</Button>
                    )}
                </div>
            </header>

            {/* Notifications Drawer */}
            <Drawer
                open={showNotifications}
                onOpenChange={(_, { open }) => setShowNotifications(open)}
                position="end"
                size={isMobile ? 'full' : 'medium'}
                style={{ marginTop: isMobile ? 0 : '64px' }}
            >
                <DrawerHeader className={styles.drawerHeader}>
                    <DrawerHeaderTitle
                        action={
                            <Button
                                appearance="subtle"
                                icon={<Dismiss24Regular />}
                                onClick={() => setShowNotifications(false)}
                                style={{ color: 'white' }}
                            />
                        }
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
                            <div style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(255,255,255,0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Alert24Regular />
                            </div>
                            <div>
                                <Text style={{ fontSize: tokens.fontSizeBase400, fontWeight: tokens.fontWeightBold, color: 'white' }}>
                                    Notifications
                                </Text>
                                {unreadCount > 0 && (
                                    <Text style={{ fontSize: tokens.fontSizeBase200, color: 'rgba(255,255,255,0.8)', display: 'block' }}>
                                        {unreadCount} unread
                                    </Text>
                                )}
                            </div>
                        </div>
                    </DrawerHeaderTitle>
                    {unreadCount > 0 && (
                        <Button
                            appearance="outline"
                            size="small"
                            icon={<Checkmark24Regular />}
                            onClick={handleMarkAllRead}
                            style={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)', marginTop: tokens.spacingVerticalS }}
                        >
                            Mark all as read
                        </Button>
                    )}
                </DrawerHeader>
                <DrawerBody style={{ padding: 0, backgroundColor: tokens.colorNeutralBackground2 }}>
                    {loading ? (
                        <div className={styles.empty}>
                            <Spinner size="large" label="Loading notifications..." />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className={styles.empty}>
                            <div className={styles.emptyIcon}>
                                <Alert24Regular style={{ fontSize: '32px', color: tokens.colorNeutralForeground4 }} />
                            </div>
                            <Text weight="semibold" size={400}>All caught up!</Text>
                            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                                You have no new notifications
                            </Text>
                        </div>
                    ) : (
                        <div className={styles.notifList}>
                            {notifications.map((n) => (
                                <div
                                    key={n._id}
                                    className={`${styles.notifItem} ${!n.isRead ? styles.notifUnread : ''}`}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    <div style={{ display: 'flex', gap: tokens.spacingHorizontalM }}>
                                        <div className={styles.notifIcon} style={{
                                            backgroundColor: n.type === 'warning' ? '#f59e0b' :
                                                n.type === 'error' ? '#ef4444' :
                                                    n.type === 'success' ? '#10b981' : '#3b82f6'
                                        }}>
                                            <Alert24Regular style={{ fontSize: '16px' }} />
                                        </div>
                                        <div className={styles.notifContent}>
                                            <div className={styles.notifHeader}>
                                                <Text className={styles.notifTitle}>{n.title}</Text>
                                                {!n.isRead && <Badge size="small" color="brand" appearance="filled">NEW</Badge>}
                                            </div>
                                            <Text className={styles.notifMessage}>{n.message}</Text>
                                            <div className={styles.notifTime}>
                                                <span>🕐</span>
                                                <span>{formatTime(n.createdAt)}</span>
                                                {n.permitNumber && (
                                                    <>
                                                        <span>•</span>
                                                        <Badge size="small" appearance="outline">{n.permitNumber}</Badge>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DrawerBody>
            </Drawer>

            {/* Permit Details Dialog */}
            {loadingPermit && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: tokens.spacingHorizontalXXL,
                        borderRadius: tokens.borderRadiusLarge,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: tokens.spacingVerticalM,
                    }}>
                        <Spinner size="large" />
                        <Text weight="semibold">Loading permit details...</Text>
                    </div>
                </div>
            )}

            {/* Permit Details Drawer */}
            <Drawer
                open={showPermitDetails}
                onOpenChange={(_, { open }) => {
                    if (!open) closePermitDetails();
                }}
                position="end"
                size="large"
                style={{ marginTop: isMobile ? 0 : '64px' }}
            >
                <DrawerHeader style={{
                    background: permitType === 'height'
                        ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                        : 'linear-gradient(135deg, #1e3a5f 0%, #2d4a6f 100%)',
                    color: 'white',
                }}>
                    <DrawerHeaderTitle
                        action={
                            <Button
                                appearance="subtle"
                                icon={<Dismiss24Regular />}
                                onClick={closePermitDetails}
                                style={{ color: 'white' }}
                            />
                        }
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
                            <Text style={{ fontSize: tokens.fontSizeBase400, fontWeight: tokens.fontWeightBold, color: 'white' }}>
                                {permitType === 'height' ? 'Height Work Permit' : 'General Work Permit'}
                            </Text>
                            {selectedPermit?.permitNumber && (
                                <Badge appearance="tint" color="brand">
                                    {selectedPermit.permitNumber}
                                </Badge>
                            )}
                        </div>
                    </DrawerHeaderTitle>
                </DrawerHeader>
                <DrawerBody style={{ padding: 0, overflow: 'auto' }}>
                    {selectedPermit && permitType === 'height' && (
                        <HeightPermitDetails permit={selectedPermit} canDownload={true} />
                    )}
                    {selectedPermit && permitType === 'general' && (
                        <PermitDetails permit={selectedPermit} canDownload={true} />
                    )}
                </DrawerBody>
            </Drawer>
        </>
    );
};

export default Header;
