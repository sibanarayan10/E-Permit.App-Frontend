/**
 * Sidebar Component - Clean navigation with Fluent UI
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    makeStyles,
    mergeClasses,
    tokens,
    Button,
    Text,
    Tooltip,
} from '@fluentui/react-components';
import {
    Home24Regular,
    Home24Filled,
    DocumentBulletList24Regular,
    DocumentBulletList24Filled,
    Search24Regular,
    Search24Filled,
    People24Regular,
    People24Filled,
    Person24Regular,
    Person24Filled,
    Mail24Regular,
    Mail24Filled,
    Settings24Regular,
    Settings24Filled,
    Dismiss24Regular,
    ChevronLeft24Regular,
    ChevronRight24Regular,
    Warning24Regular,
    Warning24Filled,
    DocumentData24Regular,
    DocumentData24Filled,
    BookOpen24Regular,
    BookOpen24Filled,
} from '@fluentui/react-icons';
import type { User } from '@/models';

const useStyles = makeStyles({
    overlay: {
        position: 'fixed',
        inset: 0,
        top: '60px',
        backgroundColor: 'rgba(0,0,0,0.4)',
        zIndex: 999,
    },
    sidebar: {
        position: 'fixed',
        top: '60px',
        left: 0,
        width: '240px',
        height: 'calc(100vh - 60px)',
        backgroundColor: tokens.colorNeutralBackground1,
        borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        zIndex: 1001,
        transform: 'translateX(-100%)',
        transition: 'transform 0.2s, width 0.2s',
        '@media (min-width: 992px)': {
            position: 'relative',
            transform: 'translateX(0)',
            zIndex: 10,
            flexShrink: 0,
            top: 0,
        },
    },
    open: {
        transform: 'translateX(0)',
    },
    collapsed: {
        width: '60px',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: tokens.spacingHorizontalM,
        borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
        height: '56px',
    },
    brand: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    brandIcon: {
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #1e3a5f, #2d4a6f)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
    },
    brandText: {
        fontWeight: tokens.fontWeightSemibold,
        fontSize: tokens.fontSizeBase300,
    },
    nav: {
        flex: 1,
        padding: tokens.spacingVerticalS,
        overflowY: 'auto',
    },
    navItem: {
        width: '100%',
        justifyContent: 'flex-start',
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
        marginBottom: '2px',
        borderRadius: tokens.borderRadiusMedium,
    },
    navActive: {
        backgroundColor: tokens.colorBrandBackground2,
        color: tokens.colorBrandForeground1,
    },
    navCollapsed: {
        justifyContent: 'center',
        padding: tokens.spacingVerticalS,
    },
    footer: {
        padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
        textAlign: 'center',
        marginTop: 'auto',
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: '12px',
        margin: tokens.spacingHorizontalS,
        marginBottom: tokens.spacingVerticalS,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    footerText: {
        fontSize: '11px',
        color: tokens.colorNeutralForeground2,
        lineHeight: 1.4,
    },
    toggleBtn: {
        minWidth: '28px',
    },
    mobileOnly: {
        '@media (min-width: 992px)': { display: 'none' },
    },
    desktopOnly: {
        display: 'none',
        '@media (min-width: 992px)': { display: 'flex' },
    },
});

interface NavItem {
    path: string;
    label: string;
    icon: React.ReactElement;
    activeIcon: React.ReactElement;
    roles: string[];
    workflowStage?: string;
}

const menuItems: NavItem[] = [
    { path: '/dashboard', label: 'Dashboard', icon: <Home24Regular />, activeIcon: <Home24Filled />, roles: ['ADMIN', 'SUBADMIN', 'CLIENT'] },
    { path: '/permits', label: 'Permits', icon: <DocumentBulletList24Regular />, activeIcon: <DocumentBulletList24Filled />, roles: ['ADMIN', 'SUBADMIN', 'CLIENT'] },
    { path: '/hira', label: 'HIRA JSA', icon: <Warning24Regular />, activeIcon: <Warning24Filled />, roles: ['ADMIN', 'SUBADMIN', 'CLIENT'], workflowStage: 'Initiator' },
    { path: '/data-requests', label: 'Permit Request', icon: <DocumentData24Regular />, activeIcon: <DocumentData24Filled />, roles: ['ADMIN', 'SUBADMIN', 'CLIENT'] },
    { path: '/learning', label: 'Safety e-Learning', icon: <BookOpen24Regular />, activeIcon: <BookOpen24Filled />, roles: ['ADMIN', 'SUBADMIN', 'CLIENT'] },
    { path: '/search', label: 'Search', icon: <Search24Regular />, activeIcon: <Search24Filled />, roles: ['ADMIN', 'SUBADMIN', 'CLIENT'] },
    { path: '/users', label: 'Users', icon: <People24Regular />, activeIcon: <People24Filled />, roles: ['ADMIN', 'SUBADMIN'] },
    { path: '/email-templates', label: 'Email Templates', icon: <Mail24Regular />, activeIcon: <Mail24Filled />, roles: ['ADMIN'] },
    { path: '/profile', label: 'Profile', icon: <Person24Regular />, activeIcon: <Person24Filled />, roles: ['ADMIN', 'SUBADMIN', 'CLIENT'] },
    { path: '/settings', label: 'Settings', icon: <Settings24Regular />, activeIcon: <Settings24Filled />, roles: ['ADMIN'] },
];

interface SidebarProps {
    user: User | null;
    currentPath: string;
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ user, isOpen, onClose }) => {
    const styles = useStyles();
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 992);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const filteredItems = menuItems.filter((item) => {
        const hasRole = item.roles.includes(user?.role || '');
        // ADMIN/SUBADMIN users can see all items; for others, check workflowStage if specified
        const isAdmin = ['ADMIN', 'SUBADMIN'].includes(user?.role || '');
        const hasStage = isAdmin || !item.workflowStage || user?.workflowStage === item.workflowStage;
        return hasRole && hasStage;
    });

    const handleNav = (path: string) => {
        navigate(path);
        if (isMobile) onClose();
    };

    if (isMobile && !isOpen) return null;

    return (
        <>
            {isMobile && isOpen && <div className={styles.overlay} onClick={onClose} />}

            <aside className={mergeClasses(
                styles.sidebar,
                isOpen && styles.open,
                collapsed && !isMobile && styles.collapsed
            )}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.brand}>
                        <div className={styles.brandIcon}>🛡️</div>
                        {!collapsed && <Text className={styles.brandText}>e-PTW</Text>}
                    </div>

                    {isMobile ? (
                        <Button
                            className={styles.mobileOnly}
                            icon={<Dismiss24Regular />}
                            appearance="subtle"
                            onClick={onClose}
                        />
                    ) : (
                        <Button
                            className={mergeClasses(styles.toggleBtn, styles.desktopOnly)}
                            icon={collapsed ? <ChevronRight24Regular /> : <ChevronLeft24Regular />}
                            appearance="subtle"
                            onClick={() => setCollapsed(!collapsed)}
                        />
                    )}
                </div>

                {/* Navigation */}
                <nav className={styles.nav}>
                    {filteredItems.map((item) => {
                        const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
                        const btn = (
                            <Button
                                key={item.path}
                                className={mergeClasses(
                                    styles.navItem,
                                    active && styles.navActive,
                                    collapsed && styles.navCollapsed
                                )}
                                appearance="subtle"
                                icon={active ? item.activeIcon : item.icon}
                                onClick={() => handleNav(item.path)}
                            >
                                {!collapsed && item.label}
                            </Button>
                        );
                        return collapsed ? (
                            <Tooltip key={item.path} content={item.label} relationship="label" positioning="after">
                                {btn}
                            </Tooltip>
                        ) : btn;
                    })}
                </nav>

                {/* Footer */}
                {!collapsed && (
                    <div className={styles.footer}>
                        <Text className={styles.footerText}>
                            Designed by <strong>Venkatpati Raju</strong>
                            <br />AM (Safety) • SAIL BSP
                        </Text><br></br>
                        <Text className={styles.footerText}>
                            Developed by <a href="https://rahul-mahto-portfolio.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}><strong>Rahul Kumar Mahto</strong></a>
                            <br />Software Engineer
                        </Text>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
