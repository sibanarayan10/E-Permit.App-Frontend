/**
 * Professional Profile Page - User profile management with modern UI
 * Features: Profile picture upload, signature management, account info, security settings
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    makeStyles,
    tokens,
    Card,
    Text,
    Button,
    Input,
    Label,
    Spinner,
    Avatar,
    Badge,
    Divider,
    Tab,
    TabList,
    Tooltip,
    Dialog,
    DialogSurface,
    DialogBody,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@fluentui/react-components';
import {
    Person24Regular,
    Person24Filled,
    Mail24Regular,
    Shield24Regular,
    Edit24Regular,
    Save24Regular,
    Dismiss24Regular,
    Camera24Regular,
    CheckmarkCircle24Regular,
    CalendarLtr24Regular,
    Layer24Regular,
    Key24Regular,
    Image24Regular,
    Signature24Regular,
    Delete24Regular,
    ArrowUpload24Regular,
    Eye24Regular,
    EyeOff24Regular,
    Info24Regular,
    Sparkle24Regular,
    DocumentBulletList24Regular,
    Clock24Regular,
    LockClosed24Regular,
    Phone24Regular,
    Certificate24Regular,
} from '@fluentui/react-icons';
import { useUser } from '@/context';
import {
    getUserProfile,
    updateUserProfile,
    uploadProfilePicture,
    deleteProfilePicture,
    uploadSignature,
    deleteSignature,
    getMyProfileData,
} from '@/services';
import { PageLoading } from '@/components/common';
import toast from 'react-hot-toast';
import type { User } from '@/models';

const useStyles = makeStyles({
    container: {
        minHeight: 'calc(100vh - 120px)',
        backgroundColor: tokens.colorNeutralBackground2,
    },
    // Hero Section
    hero: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: `${tokens.spacingVerticalXXL} ${tokens.spacingHorizontalL}`,
        marginBottom: tokens.spacingVerticalXL,
        position: 'relative',
        overflow: 'hidden',
    },
    heroPattern: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        opacity: 0.1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    },
    heroContent: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXL,
        maxWidth: '1000px',
        margin: '0 auto',
        flexWrap: 'wrap',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: '150px',
        height: '150px',
        border: '4px solid rgba(255,255,255,0.3)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        borderRadius: '50%',
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    avatarImage: {
        width: '150px',
        height: '150px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '4px solid rgba(255,255,255,0.3)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
    },
    avatarEditBtn: {
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        minWidth: '40px',
        width: '40px',
        height: '40px',
        padding: 0,
        borderRadius: tokens.borderRadiusCircular,
        boxShadow: tokens.shadow16,
    },
    avatarDeleteBtn: {
        position: 'absolute',
        top: '8px',
        right: '8px',
        minWidth: '32px',
        width: '32px',
        height: '32px',
        padding: 0,
        borderRadius: tokens.borderRadiusCircular,
        backgroundColor: '#dc3545',
    },
    heroInfo: {
        textAlign: 'left',
        color: 'white',
        flex: 1,
        minWidth: '250px',
        '@media (max-width: 600px)': {
            textAlign: 'center',
        },
    },
    heroName: {
        fontSize: '32px',
        fontWeight: '700',
        marginBottom: tokens.spacingVerticalXS,
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    heroEmail: {
        fontSize: tokens.fontSizeBase400,
        opacity: 0.9,
        marginBottom: tokens.spacingVerticalM,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        color: 'white',
    },
    heroBadges: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
        flexWrap: 'wrap',
    },
    heroStats: {
        display: 'flex',
        gap: tokens.spacingHorizontalL,
        marginTop: tokens.spacingVerticalM,
        paddingTop: tokens.spacingVerticalM,
        borderTop: '1px solid rgba(255,255,255,0.2)',
    },
    heroStat: {
        textAlign: 'center',
    },
    heroStatValue: {
        fontSize: tokens.fontSizeBase500,
        fontWeight: '700',
        color: 'white',
        display: 'block',
    },
    heroStatLabel: {
        fontSize: tokens.fontSizeBase200,
        opacity: 0.8,
        color: 'white',
    },
    heroActions: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
        marginTop: tokens.spacingVerticalM,
        '@media (max-width: 600px)': {
            justifyContent: 'center',
        },
    },
    // Content Section
    content: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: `0 ${tokens.spacingHorizontalL} ${tokens.spacingVerticalXXL}`,
    },
    tabsContainer: {
        marginBottom: tokens.spacingVerticalL,
        overflowX: 'auto',
        paddingBottom: tokens.spacingVerticalXS,
        '@media (max-width: 600px)': {
            marginLeft: `-${tokens.spacingHorizontalL}`,
            marginRight: `-${tokens.spacingHorizontalL}`,
            paddingLeft: tokens.spacingHorizontalL,
            paddingRight: tokens.spacingHorizontalL,
        },
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: tokens.spacingHorizontalL,
        '@media (max-width: 600px)': {
            gridTemplateColumns: '1fr',
        },
    },
    // Card Styles
    card: {
        padding: tokens.spacingHorizontalL,
        borderRadius: tokens.borderRadiusLarge,
        boxShadow: tokens.shadow4,
        transition: 'box-shadow 0.2s ease',
        ':hover': {
            boxShadow: tokens.shadow8,
        },
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: tokens.spacingVerticalL,
    },
    cardHeaderLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
    },
    cardIcon: {
        width: '48px',
        height: '48px',
        borderRadius: tokens.borderRadiusMedium,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '24px',
    },
    cardTitle: {
        fontSize: tokens.fontSizeBase500,
        fontWeight: tokens.fontWeightSemibold,
    },
    cardSubtitle: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
    },
    // Info Grid
    infoGrid: {
        display: 'grid',
        gap: tokens.spacingVerticalM,
    },
    infoItem: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
        padding: tokens.spacingVerticalM,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground3,
        transition: 'background-color 0.2s ease',
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground4,
        },
    },
    infoIcon: {
        color: tokens.colorBrandForeground1,
        fontSize: '20px',
        flexShrink: 0,
    },
    infoContent: {
        flex: 1,
        minWidth: 0,
    },
    infoLabel: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
        display: 'block',
    },
    infoValue: {
        fontSize: tokens.fontSizeBase300,
        fontWeight: tokens.fontWeightMedium,
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    // Form Styles
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalL,
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXS,
    },
    fieldHint: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
    },
    formButtons: {
        display: 'flex',
        gap: tokens.spacingHorizontalM,
        marginTop: tokens.spacingVerticalM,
    },
    // Signature Section
    signatureSection: {
        marginTop: tokens.spacingVerticalL,
    },
    signatureContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalL,
        padding: tokens.spacingVerticalM,
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: tokens.borderRadiusMedium,
        border: `2px dashed ${tokens.colorNeutralStroke2}`,
    },
    signaturePreview: {
        width: '200px',
        height: '80px',
        objectFit: 'contain',
        backgroundColor: 'white',
        borderRadius: tokens.borderRadiusMedium,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    signaturePlaceholder: {
        width: '200px',
        height: '80px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: tokens.borderRadiusMedium,
        border: `2px dashed ${tokens.colorNeutralStroke2}`,
        color: tokens.colorNeutralForeground3,
        gap: tokens.spacingVerticalXS,
    },
    signatureActions: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
    },
    // Activity Section
    activityList: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
    },
    activityItem: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
        padding: tokens.spacingVerticalS,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground3,
    },
    activityIcon: {
        width: '36px',
        height: '36px',
        borderRadius: tokens.borderRadiusMedium,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        flexShrink: 0,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: tokens.fontSizeBase300,
        fontWeight: tokens.fontWeightMedium,
    },
    activityTime: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
    },
    // Security Section
    securityItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: tokens.spacingVerticalM,
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: tokens.borderRadiusMedium,
        marginBottom: tokens.spacingVerticalS,
    },
    securityInfo: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
    },
    securityIcon: {
        color: tokens.colorBrandForeground1,
        fontSize: '20px',
    },
    // Upload Area
    uploadArea: {
        border: `2px dashed ${tokens.colorNeutralStroke2}`,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingVerticalXL,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: tokens.colorNeutralBackground1,
        ':hover': {
            border: `2px dashed ${tokens.colorBrandStroke1}`,
            backgroundColor: tokens.colorBrandBackground2,
        },
    },
    hiddenInput: {
        display: 'none',
    },
    // Progress
    uploadProgress: {
        marginTop: tokens.spacingVerticalM,
    },
});

export const ProfilePage: React.FC = () => {
    const styles = useStyles();
    const { user: contextUser, updateProfilePicture: contextUpdateProfilePicture, updateSignature: contextUpdateSignature } = useUser();

    // Refs for file inputs
    const profilePictureInputRef = useRef<HTMLInputElement>(null);
    const signatureInputRef = useRef<HTMLInputElement>(null);

    // State
    const [profile, setProfile] = useState<User | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ name: '' });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [uploadingPicture, setUploadingPicture] = useState(false);
    const [uploadingSignature, setUploadingSignature] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    // Local state for profile picture and signature URLs
    const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);
    const [signatureUrl, setSignatureUrl] = useState<string | null>(null);

    // Load profile
    const loadProfile = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getUserProfile();
            if (response.data) {
                setProfile(response.data);
                setFormData({ name: response.data.name ?? '' });
                // Handle both string and object format for profilePicture/signature
                const profileData = response.data as any;
                const ppUrl = typeof profileData.profilePicture === 'string'
                    ? profileData.profilePicture
                    : profileData.profilePicture?.url;
                const sigUrl = typeof profileData.signature === 'string'
                    ? profileData.signature
                    : profileData.signature?.url;
                setProfilePictureUrl(ppUrl || null);
                setSignatureUrl(sigUrl || null);
            }

            // Also load profile data (picture + signature) for more accurate data
            try {
                const profileDataResponse = await getMyProfileData();
                if (profileDataResponse.data) {
                    const data = profileDataResponse.data as any;
                    const ppUrl = typeof data.profilePicture === 'string'
                        ? data.profilePicture
                        : data.profilePicture?.url;
                    const sigUrl = typeof data.signature === 'string'
                        ? data.signature
                        : data.signature?.url;
                    if (ppUrl) setProfilePictureUrl(ppUrl);
                    if (sigUrl) setSignatureUrl(sigUrl);
                }
            } catch {
                // Ignore - profile data fetch is optional
            }
        } catch (error) {
            console.error('Failed to load profile:', error);
            // Fallback to context user
            if (contextUser) {
                setProfile(contextUser);
                setFormData({ name: contextUser.name ?? '' });
                // Handle both formats
                const ppUrl = typeof contextUser.profilePicture === 'string'
                    ? contextUser.profilePicture
                    : (contextUser.profilePicture as any)?.url;
                const sigUrl = typeof contextUser.signature === 'string'
                    ? contextUser.signature
                    : (contextUser.signature as any)?.url;
                setProfilePictureUrl(ppUrl || null);
                setSignatureUrl(sigUrl || null);
            }
        } finally {
            setIsLoading(false);
        }
    }, [contextUser]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    // Handle profile save
    const handleSave = async () => {
        try {
            setIsSaving(true);
            const response = await updateUserProfile(formData);
            if (response.data) {
                setProfile(response.data);
                setIsEditing(false);
                toast.success('Profile updated successfully!');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update profile';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({ name: profile?.name ?? '' });
        setIsEditing(false);
    };

    // Handle profile picture upload
    const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        try {
            setUploadingPicture(true);
            const response = await uploadProfilePicture(file);
            // Backend returns: { data: { profilePicture: { url, publicId, uploadedAt } } }
            const responseData = response.data as any;
            const uploadedUrl = responseData?.url || responseData?.profilePicture?.url;
            if (uploadedUrl) {
                setProfilePictureUrl(uploadedUrl);
                contextUpdateProfilePicture(uploadedUrl);
                toast.success('Profile picture updated!');
            } else {
                toast.error('Upload succeeded but no URL returned');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to upload profile picture';
            toast.error(message);
        } finally {
            setUploadingPicture(false);
            if (profilePictureInputRef.current) {
                profilePictureInputRef.current.value = '';
            }
        }
    };

    // Handle profile picture delete
    const handleDeleteProfilePicture = async () => {
        if (!window.confirm('Are you sure you want to delete your profile picture?')) return;

        try {
            setUploadingPicture(true);
            await deleteProfilePicture();
            setProfilePictureUrl(null);
            contextUpdateProfilePicture('');
            toast.success('Profile picture deleted!');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete profile picture';
            toast.error(message);
        } finally {
            setUploadingPicture(false);
        }
    };

    // Handle signature upload
    const handleSignatureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            toast.error('Signature image size must be less than 2MB');
            return;
        }

        try {
            setUploadingSignature(true);
            const response = await uploadSignature(file);
            // Backend returns: { data: { signature: { url, publicId, uploadedAt } } }
            const responseData = response.data as any;
            const uploadedUrl = responseData?.url || responseData?.signature?.url;
            if (uploadedUrl) {
                setSignatureUrl(uploadedUrl);
                contextUpdateSignature(uploadedUrl);
                toast.success('Signature updated!');
            } else {
                toast.error('Upload succeeded but no URL returned');
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to upload signature';
            toast.error(message);
        } finally {
            setUploadingSignature(false);
            if (signatureInputRef.current) {
                signatureInputRef.current.value = '';
            }
        }
    };

    // Handle signature delete
    const handleDeleteSignature = async () => {
        if (!window.confirm('Are you sure you want to delete your signature?')) return;

        try {
            setUploadingSignature(true);
            await deleteSignature();
            setSignatureUrl(null);
            contextUpdateSignature('');
            toast.success('Signature deleted!');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete signature';
            toast.error(message);
        } finally {
            setUploadingSignature(false);
        }
    };

    // Badge colors
    const getRoleBadgeColor = (role: string): 'danger' | 'brand' | 'informative' => {
        switch (role) {
            case 'ADMIN': return 'danger';
            case 'SUBADMIN': return 'danger';
            case 'CLIENT': return 'brand';
            default: return 'informative';
        }
    };

    const getStageColor = (stage?: string): string => {
        switch (stage) {
            case 'Initiator': return '#10b981';
            case 'Execution': return '#f59e0b';
            case 'Issuer': return '#3b82f6';
            default: return '#6b7280';
        }
    };

    if (isLoading) {
        return <PageLoading label="Loading profile..." />;
    }

    if (!profile) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
                <Person24Regular style={{ fontSize: '64px', color: tokens.colorNeutralForeground3 }} />
                <Text as="h4">Please log in to view your profile</Text>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <div className={styles.hero}>
                <div className={styles.heroPattern} />
                <div className={styles.heroContent}>
                    <div className={styles.avatarContainer}>
                        {profilePictureUrl ? (
                            <img
                                src={profilePictureUrl}
                                alt={profile.name}
                                className={styles.avatarImage}
                            />
                        ) : (
                            <Avatar
                                name={profile.name}
                                size={128}
                                className={styles.avatar}
                            />
                        )}
                        <input
                            type="file"
                            ref={profilePictureInputRef}
                            className={styles.hiddenInput}
                            accept="image/*"
                            onChange={handleProfilePictureUpload}
                        />
                        <Tooltip content="Change profile picture" relationship="label">
                            <Button
                                className={styles.avatarEditBtn}
                                icon={uploadingPicture ? <Spinner size="tiny" /> : <Camera24Regular />}
                                appearance="primary"
                                onClick={() => profilePictureInputRef.current?.click()}
                                disabled={uploadingPicture}
                            />
                        </Tooltip>
                        {profilePictureUrl && (
                            <Tooltip content="Remove picture" relationship="label">
                                <Button
                                    className={styles.avatarDeleteBtn}
                                    icon={<Delete24Regular />}
                                    appearance="primary"
                                    size="small"
                                    onClick={handleDeleteProfilePicture}
                                    disabled={uploadingPicture}
                                />
                            </Tooltip>
                        )}
                    </div>
                    <div className={styles.heroInfo}>
                        <div className={styles.heroName}>
                            <Sparkle24Regular />
                            {profile.name}
                        </div>
                        <div className={styles.heroEmail}>
                            <Mail24Regular />
                            {profile.email}
                        </div>
                        <div className={styles.heroBadges}>
                            <Badge appearance="filled" color={getRoleBadgeColor(profile.role)}>
                                {profile.role}
                            </Badge>
                            {profile.workflowStage && (
                                <Badge
                                    appearance="filled"
                                    style={{ backgroundColor: getStageColor(profile.workflowStage) }}
                                >
                                    {profile.workflowStage}
                                </Badge>
                            )}
                            <Badge appearance="filled" color="success">
                                <CheckmarkCircle24Regular style={{ marginRight: '4px' }} />
                                Active
                            </Badge>
                        </div>
                        <div className={styles.heroStats}>
                            <div className={styles.heroStat}>
                                <span className={styles.heroStatValue}>
                                    {profile.createdAt
                                        ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                                        : '2024'}
                                </span>
                                <span className={styles.heroStatLabel}>Member Since</span>
                            </div>
                            <div className={styles.heroStat}>
                                <span className={styles.heroStatValue}>{profile.workflowStage || 'N/A'}</span>
                                <span className={styles.heroStatLabel}>Current Role</span>
                            </div>
                            <div className={styles.heroStat}>
                                <span className={styles.heroStatValue}>
                                    {signatureUrl ? '✓' : '✗'}
                                </span>
                                <span className={styles.heroStatLabel}>Signature</span>
                            </div>
                        </div>
                        <div className={styles.heroActions}>
                            <Button
                                appearance="secondary"
                                icon={<Edit24Regular />}
                                onClick={() => { setActiveTab('profile'); setIsEditing(true); }}
                                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                            >
                                Edit Profile
                            </Button>
                            <Button
                                appearance="secondary"
                                icon={<Signature24Regular />}
                                onClick={() => setActiveTab('signature')}
                                style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}
                            >
                                Manage Signature
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className={styles.content}>
                {/* Tabs */}
                <div className={styles.tabsContainer}>
                    <TabList
                        selectedValue={activeTab}
                        onTabSelect={(_, data) => setActiveTab(data.value as string)}
                    >
                        <Tab value="profile" icon={<Person24Filled />}>Profile</Tab>
                        <Tab value="signature" icon={<Signature24Regular />}>Signature</Tab>
                        <Tab value="security" icon={<Shield24Regular />}>Security</Tab>
                        <Tab value="activity" icon={<Clock24Regular />}>Activity</Tab>
                    </TabList>
                </div>

                {/* Tab Content */}
                {activeTab === 'profile' && (
                    <div className={styles.grid}>
                        {/* Personal Information Card */}
                        <Card className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardHeaderLeft}>
                                    <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                        <Person24Regular />
                                    </div>
                                    <div>
                                        <Text className={styles.cardTitle}>Personal Information</Text>
                                        <Text className={styles.cardSubtitle}>Manage your basic info</Text>
                                    </div>
                                </div>
                                {!isEditing && (
                                    <Button
                                        appearance="outline"
                                        icon={<Edit24Regular />}
                                        onClick={() => setIsEditing(true)}
                                    >
                                        Edit
                                    </Button>
                                )}
                            </div>

                            {isEditing ? (
                                <div className={styles.form}>
                                    <div className={styles.field}>
                                        <Label htmlFor="name" weight="semibold">Full Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(_, data) => setFormData({ name: data.value })}
                                            contentBefore={<Person24Regular />}
                                            size="large"
                                        />
                                    </div>
                                    <div className={styles.field}>
                                        <Label weight="semibold">Email Address</Label>
                                        <Input
                                            value={profile.email}
                                            disabled
                                            contentBefore={<Mail24Regular />}
                                            size="large"
                                        />
                                        <Text className={styles.fieldHint}>
                                            <Info24Regular style={{ fontSize: '14px', marginRight: '4px', verticalAlign: 'middle' }} />
                                            Email cannot be changed for security reasons
                                        </Text>
                                    </div>
                                    <div className={styles.formButtons}>
                                        <Button
                                            appearance="primary"
                                            icon={isSaving ? <Spinner size="tiny" /> : <Save24Regular />}
                                            onClick={handleSave}
                                            disabled={isSaving}
                                        >
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </Button>
                                        <Button
                                            appearance="outline"
                                            icon={<Dismiss24Regular />}
                                            onClick={handleCancel}
                                            disabled={isSaving}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.infoGrid}>
                                    <div className={styles.infoItem}>
                                        <Person24Regular className={styles.infoIcon} />
                                        <div className={styles.infoContent}>
                                            <span className={styles.infoLabel}>Full Name</span>
                                            <span className={styles.infoValue}>{profile.name}</span>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Certificate24Regular className={styles.infoIcon} />
                                        <div className={styles.infoContent}>
                                            <span className={styles.infoLabel}>User ID</span>
                                            <Badge appearance="tint" color="brand">
                                                {profile.userId || 'Not Set'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Mail24Regular className={styles.infoIcon} />
                                        <div className={styles.infoContent}>
                                            <span className={styles.infoLabel}>Email</span>
                                            <span className={styles.infoValue}>{profile.email}</span>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Shield24Regular className={styles.infoIcon} />
                                        <div className={styles.infoContent}>
                                            <span className={styles.infoLabel}>Role</span>
                                            <span className={styles.infoValue}>{profile.role}</span>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Layer24Regular className={styles.infoIcon} />
                                        <div className={styles.infoContent}>
                                            <span className={styles.infoLabel}>Workflow Stage</span>
                                            <span className={styles.infoValue}>{profile.workflowStage ?? 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className={styles.infoItem}>
                                        <Phone24Regular className={styles.infoIcon} />
                                        <div className={styles.infoContent}>
                                            <span className={styles.infoLabel}>Phone Number</span>
                                            <span className={styles.infoValue}>{(profile as any).phone ?? 'Not set'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Account Overview Card */}
                        <Card className={styles.card}>
                            <div className={styles.cardHeader}>
                                <div className={styles.cardHeaderLeft}>
                                    <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
                                        <CheckmarkCircle24Regular />
                                    </div>
                                    <div>
                                        <Text className={styles.cardTitle}>Account Overview</Text>
                                        <Text className={styles.cardSubtitle}>Your account status & info</Text>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.infoGrid}>
                                <div className={styles.infoItem}>
                                    <CheckmarkCircle24Regular className={styles.infoIcon} style={{ color: '#10b981' }} />
                                    <div className={styles.infoContent}>
                                        <span className={styles.infoLabel}>Account Status</span>
                                        <Badge appearance="filled" color="success">Active</Badge>
                                    </div>
                                </div>
                                <div className={styles.infoItem}>
                                    <CalendarLtr24Regular className={styles.infoIcon} />
                                    <div className={styles.infoContent}>
                                        <span className={styles.infoLabel}>Member Since</span>
                                        <span className={styles.infoValue}>
                                            {profile.createdAt
                                                ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                                                    month: 'long',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                })
                                                : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.infoItem}>
                                    <Image24Regular className={styles.infoIcon} />
                                    <div className={styles.infoContent}>
                                        <span className={styles.infoLabel}>Profile Picture</span>
                                        <span className={styles.infoValue}>
                                            {profilePictureUrl ? 'Uploaded' : 'Not set'}
                                        </span>
                                    </div>
                                </div>
                                <div className={styles.infoItem}>
                                    <Signature24Regular className={styles.infoIcon} />
                                    <div className={styles.infoContent}>
                                        <span className={styles.infoLabel}>Digital Signature</span>
                                        <span className={styles.infoValue}>
                                            {signatureUrl ? 'Uploaded' : 'Not set'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}

                {activeTab === 'signature' && (
                    <Card className={styles.card} style={{ maxWidth: '600px' }}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardHeaderLeft}>
                                <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' }}>
                                    <Signature24Regular />
                                </div>
                                <div>
                                    <Text className={styles.cardTitle}>Digital Signature</Text>
                                    <Text className={styles.cardSubtitle}>Your signature for permit approvals</Text>
                                </div>
                            </div>
                        </div>

                        <Divider style={{ marginBottom: tokens.spacingVerticalL }} />

                        <input
                            type="file"
                            ref={signatureInputRef}
                            className={styles.hiddenInput}
                            accept="image/*"
                            onChange={handleSignatureUpload}
                        />

                        {signatureUrl ? (
                            <div className={styles.signatureContainer}>
                                <img
                                    src={signatureUrl}
                                    alt="Your signature"
                                    className={styles.signaturePreview}
                                />
                                <div className={styles.signatureActions}>
                                    <Button
                                        icon={uploadingSignature ? <Spinner size="tiny" /> : <ArrowUpload24Regular />}
                                        onClick={() => signatureInputRef.current?.click()}
                                        disabled={uploadingSignature}
                                    >
                                        Replace
                                    </Button>
                                    <Button
                                        icon={<Delete24Regular />}
                                        appearance="subtle"
                                        onClick={handleDeleteSignature}
                                        disabled={uploadingSignature}
                                        style={{ color: '#dc3545' }}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div
                                className={styles.uploadArea}
                                onClick={() => signatureInputRef.current?.click()}
                            >
                                {uploadingSignature ? (
                                    <Spinner size="medium" label="Uploading..." />
                                ) : (
                                    <>
                                        <Signature24Regular style={{ fontSize: '48px', color: tokens.colorBrandForeground1, marginBottom: tokens.spacingVerticalS }} />
                                        <Text weight="semibold">Click to upload your signature</Text>
                                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                                            PNG, JPG up to 2MB
                                        </Text>
                                    </>
                                )}
                            </div>
                        )}

                        <div style={{ marginTop: tokens.spacingVerticalL, padding: tokens.spacingHorizontalM, backgroundColor: tokens.colorNeutralBackground3, borderRadius: tokens.borderRadiusMedium }}>
                            <Text weight="semibold" style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS, marginBottom: tokens.spacingVerticalS }}>
                                <Info24Regular style={{ color: tokens.colorBrandForeground1 }} />
                                Why is my signature important?
                            </Text>
                            <Text size={200} style={{ color: tokens.colorNeutralForeground2 }}>
                                Your digital signature is used to authenticate your approvals on work permits.
                                It appears on official documents and serves as your electronic authorization.
                            </Text>
                        </div>
                    </Card>
                )}

                {activeTab === 'security' && (
                    <Card className={styles.card} style={{ maxWidth: '600px' }}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardHeaderLeft}>
                                <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                                    <Shield24Regular />
                                </div>
                                <div>
                                    <Text className={styles.cardTitle}>Security Settings</Text>
                                    <Text className={styles.cardSubtitle}>Manage your account security</Text>
                                </div>
                            </div>
                        </div>

                        <Divider style={{ marginBottom: tokens.spacingVerticalL }} />

                        <div className={styles.securityItem}>
                            <div className={styles.securityInfo}>
                                <Key24Regular className={styles.securityIcon} />
                                <div>
                                    <Text weight="semibold">Password</Text>
                                    <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: 'block' }}>
                                        Last changed: Unknown
                                    </Text>
                                </div>
                            </div>
                            <Button
                                appearance="outline"
                                onClick={() => setShowPasswordDialog(true)}
                            >
                                Change Password
                            </Button>
                        </div>

                        <div className={styles.securityItem}>
                            <div className={styles.securityInfo}>
                                <LockClosed24Regular className={styles.securityIcon} />
                                <div>
                                    <Text weight="semibold">Two-Factor Authentication</Text>
                                    <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: 'block' }}>
                                        Add extra security to your account
                                    </Text>
                                </div>
                            </div>
                            <Badge appearance="outline">Coming Soon</Badge>
                        </div>

                        <div className={styles.securityItem}>
                            <div className={styles.securityInfo}>
                                <DocumentBulletList24Regular className={styles.securityIcon} />
                                <div>
                                    <Text weight="semibold">Login Sessions</Text>
                                    <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: 'block' }}>
                                        Manage your active sessions
                                    </Text>
                                </div>
                            </div>
                            <Badge appearance="outline">Coming Soon</Badge>
                        </div>
                    </Card>
                )}

                {activeTab === 'activity' && (
                    <Card className={styles.card} style={{ maxWidth: '600px' }}>
                        <div className={styles.cardHeader}>
                            <div className={styles.cardHeaderLeft}>
                                <div className={styles.cardIcon} style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)' }}>
                                    <Clock24Regular />
                                </div>
                                <div>
                                    <Text className={styles.cardTitle}>Recent Activity</Text>
                                    <Text className={styles.cardSubtitle}>Your recent account activities</Text>
                                </div>
                            </div>
                        </div>

                        <Divider style={{ marginBottom: tokens.spacingVerticalL }} />

                        <div className={styles.activityList}>
                            <div className={styles.activityItem}>
                                <div className={styles.activityIcon} style={{ backgroundColor: '#10b981' }}>
                                    <CheckmarkCircle24Regular />
                                </div>
                                <div className={styles.activityContent}>
                                    <Text className={styles.activityTitle}>Logged in successfully</Text>
                                    <Text className={styles.activityTime}>Just now</Text>
                                </div>
                            </div>
                            <div className={styles.activityItem}>
                                <div className={styles.activityIcon} style={{ backgroundColor: '#3b82f6' }}>
                                    <Person24Regular />
                                </div>
                                <div className={styles.activityContent}>
                                    <Text className={styles.activityTitle}>Profile viewed</Text>
                                    <Text className={styles.activityTime}>Just now</Text>
                                </div>
                            </div>
                            {profile.createdAt && (
                                <div className={styles.activityItem}>
                                    <div className={styles.activityIcon} style={{ backgroundColor: '#8b5cf6' }}>
                                        <Sparkle24Regular />
                                    </div>
                                    <div className={styles.activityContent}>
                                        <Text className={styles.activityTitle}>Account created</Text>
                                        <Text className={styles.activityTime}>
                                            {new Date(profile.createdAt).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </Text>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                )}
            </div>

            {/* Change Password Dialog */}
            <Dialog open={showPasswordDialog} onOpenChange={(_, data) => setShowPasswordDialog(data.open)}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>Change Password</DialogTitle>
                        <DialogContent>
                            <div className={styles.form}>
                                <div className={styles.field}>
                                    <Label htmlFor="currentPassword" weight="semibold">Current Password</Label>
                                    <Input
                                        id="currentPassword"
                                        type={showCurrentPassword ? 'text' : 'password'}
                                        value={passwordForm.currentPassword}
                                        onChange={(_, data) => setPasswordForm(prev => ({ ...prev, currentPassword: data.value }))}
                                        contentAfter={
                                            <Button
                                                appearance="transparent"
                                                icon={showCurrentPassword ? <EyeOff24Regular /> : <Eye24Regular />}
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                size="small"
                                            />
                                        }
                                    />
                                </div>
                                <div className={styles.field}>
                                    <Label htmlFor="newPassword" weight="semibold">New Password</Label>
                                    <Input
                                        id="newPassword"
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={passwordForm.newPassword}
                                        onChange={(_, data) => setPasswordForm(prev => ({ ...prev, newPassword: data.value }))}
                                        contentAfter={
                                            <Button
                                                appearance="transparent"
                                                icon={showNewPassword ? <EyeOff24Regular /> : <Eye24Regular />}
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                size="small"
                                            />
                                        }
                                    />
                                </div>
                                <div className={styles.field}>
                                    <Label htmlFor="confirmPassword" weight="semibold">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={passwordForm.confirmPassword}
                                        onChange={(_, data) => setPasswordForm(prev => ({ ...prev, confirmPassword: data.value }))}
                                    />
                                </div>
                            </div>
                        </DialogContent>
                        <DialogActions>
                            <Button appearance="secondary" onClick={() => setShowPasswordDialog(false)}>
                                Cancel
                            </Button>
                            <Button
                                appearance="primary"
                                onClick={() => {
                                    toast.error('Password change functionality coming soon!');
                                    setShowPasswordDialog(false);
                                }}
                            >
                                Update Password
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </div>
    );
};

export default ProfilePage;
