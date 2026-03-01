/**
 * Settings Page - Professional Admin Settings with Modern UI
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    makeStyles,
    tokens,
    Card,
    Text,
    Switch,
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    Dropdown,
    Option,
    Badge,
} from '@fluentui/react-components';
import {
    Settings24Filled,
    Mail24Regular,
    Mail24Filled,
    WeatherMoon24Regular,
    Phone24Regular,
    Phone24Filled,
    Shield24Regular,
    Info16Regular,
    CheckmarkCircle16Filled,
    DismissCircle16Filled,
} from '@fluentui/react-icons';
import { getSettings, updateSettings } from '@/services';
import { useTheme } from '@/context';
import { PageLoading } from '@/components/common';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    // Page container
    page: {
        minHeight: '100%',
        backgroundColor: tokens.colorNeutralBackground2,
        padding: `${tokens.spacingVerticalL} ${tokens.spacingHorizontalL}`,
    },
    container: {
        maxWidth: '100%',
        margin: '0',
    },

    // Page header
    pageHeader: {
        marginBottom: tokens.spacingVerticalXXL,
    },
    pageHeaderTop: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
        marginBottom: tokens.spacingVerticalS,
    },
    pageIcon: {
        width: '48px',
        height: '48px',
        borderRadius: tokens.borderRadiusLarge,
        background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '24px',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    },
    pageTitleGroup: {},
    pageTitle: {
        fontSize: tokens.fontSizeBase600,
        fontWeight: tokens.fontWeightBold,
        color: tokens.colorNeutralForeground1,
        display: 'block',
    },
    pageSubtitle: {
        fontSize: tokens.fontSizeBase300,
        color: tokens.colorNeutralForeground3,
        marginTop: tokens.spacingVerticalXXS,
    },

    // Settings grid
    settingsGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalL,
    },

    // Card styling
    card: {
        padding: '0',
        borderRadius: tokens.borderRadiusXLarge,
        boxShadow: tokens.shadow4,
        overflow: 'hidden',
        border: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    cardHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: tokens.spacingHorizontalL,
        backgroundColor: tokens.colorNeutralBackground1,
        borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    cardHeaderLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
    },
    cardIconWrapper: {
        width: '40px',
        height: '40px',
        borderRadius: tokens.borderRadiusMedium,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
    },
    cardTitleGroup: {},
    cardTitle: {
        fontSize: tokens.fontSizeBase500,
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground1,
        display: 'block',
    },
    cardDescription: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
        marginTop: '2px',
    },
    cardBody: {
        padding: tokens.spacingHorizontalL,
        backgroundColor: tokens.colorNeutralBackground1,
    },

    // Setting row
    settingRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: tokens.spacingVerticalM,
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: tokens.borderRadiusMedium,
        marginBottom: tokens.spacingVerticalS,
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground4,
        },
    },
    settingRowLast: {
        marginBottom: 0,
    },
    settingInfo: {
        flex: 1,
        paddingRight: tokens.spacingHorizontalL,
    },
    settingLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        fontSize: tokens.fontSizeBase400,
        fontWeight: tokens.fontWeightMedium,
        color: tokens.colorNeutralForeground1,
        marginBottom: tokens.spacingVerticalXXS,
    },
    settingHint: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
        lineHeight: '1.5',
    },
    settingControl: {
        flexShrink: 0,
    },

    // Status badges
    statusBadge: {
        marginLeft: tokens.spacingHorizontalS,
    },

    // Theme dropdown
    themeDropdown: {
        minWidth: '140px',
    },

    // Message bar styling
    messageBar: {
        marginTop: tokens.spacingVerticalM,
        borderRadius: tokens.borderRadiusMedium,
    },

    // Info section
    infoSection: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: tokens.spacingHorizontalS,
        padding: tokens.spacingVerticalS,
        backgroundColor: tokens.colorNeutralBackground4,
        borderRadius: tokens.borderRadiusMedium,
        marginTop: tokens.spacingVerticalM,
    },
    infoIcon: {
        color: tokens.colorNeutralForeground3,
        marginTop: '2px',
    },
    infoText: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
        lineHeight: '1.5',
    },

    // Footer
    pageFooter: {
        marginTop: tokens.spacingVerticalXXL,
        padding: tokens.spacingVerticalL,
        textAlign: 'center',
    },
    footerText: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground4,
    },
});

interface LocalSettingsState {
    emailEnabled: boolean;
    smsEnabled: boolean;
    updatedAt?: string;
}

export const SettingsPage: React.FC = () => {
    const styles = useStyles();
    const { themeMode, setThemeMode } = useTheme();

    const [settings, setSettings] = useState<LocalSettingsState | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const loadSettings = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getSettings();
            if (response.data) {
                setSettings({
                    emailEnabled: response.data.notifications?.emailEnabled ?? true,
                    smsEnabled: response.data.notifications?.smsEnabled ?? false,
                    updatedAt: undefined,
                });
            }
        } catch (error) {
            toast.error('Failed to load settings');
            setSettings({ emailEnabled: true, smsEnabled: false });
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadSettings();
    }, [loadSettings]);

    const handleToggleEmailNotifications = async () => {
        if (!settings) return;
        const newValue = !settings.emailEnabled;

        // Optimistic update - update UI immediately
        setSettings(prev => prev ? { ...prev, emailEnabled: newValue } : prev);

        try {
            setIsSaving(true);
            const response = await updateSettings({
                notifications: { emailEnabled: newValue, smsEnabled: settings.smsEnabled, pushEnabled: false }
            });
            if (response.data) {
                // Sync both values from response
                setSettings(prev => prev ? {
                    ...prev,
                    emailEnabled: response.data.notifications?.emailEnabled ?? newValue,
                    smsEnabled: response.data.notifications?.smsEnabled ?? prev.smsEnabled,
                } : prev);
                toast.success(newValue ? 'Email notifications enabled' : 'Email notifications disabled');
            }
        } catch (error) {
            // Rollback on error
            setSettings(prev => prev ? { ...prev, emailEnabled: !newValue } : prev);
            toast.error('Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleSmsNotifications = async () => {
        if (!settings) return;
        const newValue = !settings.smsEnabled;

        // Optimistic update - update UI immediately
        setSettings(prev => prev ? { ...prev, smsEnabled: newValue } : prev);

        try {
            setIsSaving(true);
            const response = await updateSettings({
                notifications: { emailEnabled: settings.emailEnabled, smsEnabled: newValue, pushEnabled: false }
            });
            if (response.data) {
                // Sync both values from response
                setSettings(prev => prev ? {
                    ...prev,
                    emailEnabled: response.data.notifications?.emailEnabled ?? prev.emailEnabled,
                    smsEnabled: response.data.notifications?.smsEnabled ?? newValue,
                } : prev);
                toast.success(newValue ? 'SMS notifications enabled' : 'SMS notifications disabled');
            }
        } catch (error) {
            // Rollback on error
            setSettings(prev => prev ? { ...prev, smsEnabled: !newValue } : prev);
            toast.error('Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleThemeChange = (_: any, data: any) => {
        const newMode = data.optionValue as 'light' | 'dark' | 'system';
        setThemeMode(newMode);
        toast.success(`Theme changed to ${newMode === 'system' ? 'System default' : newMode === 'dark' ? 'Dark mode' : 'Light mode'}`);
    };

    if (isLoading) {
        return <PageLoading label="Loading settings..." />;
    }

    return (
        <div className={styles.page}>
            <div className={styles.container}>
                {/* Page Header */}
                <div className={styles.pageHeader}>
                    <div className={styles.pageHeaderTop}>
                        <div className={styles.pageIcon}>
                            <Settings24Filled />
                        </div>
                        <div className={styles.pageTitleGroup}>
                            <Text className={styles.pageTitle}>System Settings</Text>
                            <Text className={styles.pageSubtitle}>
                                Configure application preferences and notification settings
                            </Text>
                        </div>
                    </div>
                </div>

                {/* Settings Cards */}
                <div className={styles.settingsGrid}>
                    {/* Appearance Card */}
                    <Card className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardHeaderLeft}>
                                <div className={styles.cardIconWrapper} style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                    <WeatherMoon24Regular />
                                </div>
                                <div className={styles.cardTitleGroup}>
                                    <Text className={styles.cardTitle}>Appearance</Text>
                                    <Text className={styles.cardDescription}>Customize the look and feel</Text>
                                </div>
                            </div>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={`${styles.settingRow} ${styles.settingRowLast}`}>
                                <div className={styles.settingInfo}>
                                    <Text className={styles.settingLabel}>
                                        Theme Mode
                                    </Text>
                                    <Text className={styles.settingHint}>
                                        Choose between light and dark mode. System option follows your device preference.
                                    </Text>
                                </div>
                                <div className={styles.settingControl}>
                                    <Dropdown
                                        className={styles.themeDropdown}
                                        value={themeMode === 'light' ? 'Light' : themeMode === 'dark' ? 'Dark' : 'System'}
                                        selectedOptions={[themeMode]}
                                        onOptionSelect={handleThemeChange}
                                    >
                                        <Option value="light">☀️ Light</Option>
                                        <Option value="dark">🌙 Dark</Option>
                                        <Option value="system">💻 System</Option>
                                    </Dropdown>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Email Notifications Card */}
                    <Card className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardHeaderLeft}>
                                <div className={styles.cardIconWrapper} style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                    {settings?.emailEnabled ? <Mail24Filled /> : <Mail24Regular />}
                                </div>
                                <div className={styles.cardTitleGroup}>
                                    <Text className={styles.cardTitle}>Email Notifications</Text>
                                    <Text className={styles.cardDescription}>Manage email alert settings</Text>
                                </div>
                            </div>
                            <Badge
                                appearance="filled"
                                color={settings?.emailEnabled ? 'success' : 'warning'}
                                icon={settings?.emailEnabled ? <CheckmarkCircle16Filled /> : <DismissCircle16Filled />}
                            >
                                {settings?.emailEnabled ? 'Active' : 'Disabled'}
                            </Badge>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={`${styles.settingRow} ${styles.settingRowLast}`}>
                                <div className={styles.settingInfo}>
                                    <Text className={styles.settingLabel}>
                                        Email Notifications
                                    </Text>
                                    <Text className={styles.settingHint}>
                                        When enabled, permit approvals, assignments, and closures will trigger email notifications to relevant users.
                                    </Text>
                                </div>
                                <div className={styles.settingControl}>
                                    <Switch
                                        checked={settings?.emailEnabled ?? true}
                                        onChange={handleToggleEmailNotifications}
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            {settings && !settings.emailEnabled && (
                                <MessageBar intent="warning" className={styles.messageBar}>
                                    <MessageBarBody>
                                        <MessageBarTitle>Notifications Disabled</MessageBarTitle>
                                        No emails will be sent for permit actions while this is disabled.
                                    </MessageBarBody>
                                </MessageBar>
                            )}
                        </div>
                    </Card>

                    {/* SMS Notifications Card */}
                    <Card className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardHeaderLeft}>
                                <div className={styles.cardIconWrapper} style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                                    {settings?.smsEnabled ? <Phone24Filled /> : <Phone24Regular />}
                                </div>
                                <div className={styles.cardTitleGroup}>
                                    <Text className={styles.cardTitle}>SMS Notifications</Text>
                                    <Text className={styles.cardDescription}>Twilio SMS integration settings</Text>
                                </div>
                            </div>
                            <Badge
                                appearance="filled"
                                color={settings?.smsEnabled ? 'success' : 'warning'}
                                icon={settings?.smsEnabled ? <CheckmarkCircle16Filled /> : <DismissCircle16Filled />}
                            >
                                {settings?.smsEnabled ? 'Active' : 'Disabled'}
                            </Badge>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.settingRow}>
                                <div className={styles.settingInfo}>
                                    <Text className={styles.settingLabel}>
                                        SMS Notifications
                                    </Text>
                                    <Text className={styles.settingHint}>
                                        Send SMS alerts to users' registered phone numbers for permit actions.
                                    </Text>
                                </div>
                                <div className={styles.settingControl}>
                                    <Switch
                                        checked={settings?.smsEnabled ?? false}
                                        onChange={handleToggleSmsNotifications}
                                        disabled={isSaving}
                                    />
                                </div>
                            </div>

                            <div className={styles.infoSection}>
                                <Info16Regular className={styles.infoIcon} />
                                <Text className={styles.infoText}>
                                    SMS notifications require a valid Twilio configuration. Ensure your Twilio account is properly set up before enabling.
                                </Text>
                            </div>

                            {settings?.smsEnabled && (
                                <MessageBar intent="success" className={styles.messageBar}>
                                    <MessageBarBody>
                                        <MessageBarTitle>SMS Active</MessageBarTitle>
                                        Users with valid phone numbers will receive SMS alerts for permit events.
                                    </MessageBarBody>
                                </MessageBar>
                            )}
                        </div>
                    </Card>

                    {/* Security Info Card */}
                    <Card className={styles.card}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardHeaderLeft}>
                                <div className={styles.cardIconWrapper} style={{ backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1' }}>
                                    <Shield24Regular />
                                </div>
                                <div className={styles.cardTitleGroup}>
                                    <Text className={styles.cardTitle}>Security & Privacy</Text>
                                    <Text className={styles.cardDescription}>Application security information</Text>
                                </div>
                            </div>
                        </div>
                        <div className={styles.cardBody}>
                            <div className={styles.infoSection} style={{ marginTop: 0 }}>
                                <Info16Regular className={styles.infoIcon} />
                                <Text className={styles.infoText}>
                                    All data is encrypted in transit and at rest. User sessions are secured with JWT tokens
                                    and automatically expire after 24 hours of inactivity. For security concerns, contact your system administrator.
                                </Text>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Footer */}
                <div className={styles.pageFooter}>
                    <Text className={styles.footerText}>
                        E-Permit System v2.0 • SAIL Bhilai Steel Plant • Settings are saved automatically
                    </Text>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
