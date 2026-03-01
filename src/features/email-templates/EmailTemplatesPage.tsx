/**
 * Email Templates Management Page - Professional Admin email template CRUD
 * Features: Template listing, create/edit/delete, preview, placeholders
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    makeStyles,
    tokens,
    Card,
    Text,
    Button,
    Input,
    Textarea,
    Badge,
    Spinner,
    Table,
    TableHeader,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    Drawer,
    DrawerBody,
    DrawerHeader,
    DrawerHeaderTitle,
    Field,
    Switch,
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
    Mail24Regular,
    Mail24Filled,
    Add24Regular,
    Edit24Regular,
    Delete24Regular,
    ArrowClockwise24Regular,
    Eye24Regular,
    Info24Regular,
    Dismiss24Regular,
    Checkmark24Regular,
    Code24Regular,
    TextBold24Regular,
    ToggleLeft24Regular,
    ToggleRight24Regular,
    Shield24Regular,
} from '@fluentui/react-icons';
import { useUser } from '@/context';
import {
    getAllEmailTemplates,
    createEmailTemplate,
    updateEmailTemplate,
    toggleEmailTemplateStatus,
    deleteEmailTemplate,
    getAvailablePlaceholders,
} from '@/services';
import { PageLoading } from '@/components/common';
import type { EmailTemplate } from '@/models';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    container: {
        minHeight: 'calc(100vh - 120px)',
        backgroundColor: tokens.colorNeutralBackground2,
    },
    hero: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: `${tokens.spacingVerticalXL} ${tokens.spacingHorizontalL}`,
        marginBottom: tokens.spacingVerticalL,
    },
    heroContent: {
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: tokens.spacingHorizontalM,
    },
    heroTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
        color: 'white',
    },
    heroTitleText: {
        fontSize: '24px',
        fontWeight: '700',
        color: 'white',
    },
    heroSubtitle: {
        fontSize: tokens.fontSizeBase300,
        opacity: 0.9,
        color: 'white',
    },
    heroActions: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
    },
    content: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: `0 ${tokens.spacingHorizontalL} ${tokens.spacingVerticalXL}`,
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: tokens.spacingHorizontalM,
        marginBottom: tokens.spacingVerticalL,
        '@media (max-width: 600px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
        },
    },
    statCard: {
        padding: tokens.spacingHorizontalM,
        cursor: 'pointer',
        transition: 'box-shadow 0.2s, transform 0.2s',
        ':hover': {
            boxShadow: tokens.shadow8,
            transform: 'translateY(-2px)',
        },
    },
    statContent: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    statIcon: {
        width: '40px',
        height: '40px',
        borderRadius: tokens.borderRadiusMedium,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    statInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    statValue: {
        fontSize: tokens.fontSizeBase500,
        fontWeight: tokens.fontWeightBold,
        lineHeight: 1,
    },
    statLabel: {
        fontSize: tokens.fontSizeBase100,
        color: tokens.colorNeutralForeground3,
    },
    legendCard: {
        padding: tokens.spacingHorizontalM,
        marginBottom: tokens.spacingVerticalL,
        backgroundColor: tokens.colorNeutralBackground1,
    },
    legendTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        marginBottom: tokens.spacingVerticalM,
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorBrandForeground1,
    },
    legendGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: tokens.spacingHorizontalS,
    },
    legendItem: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        padding: tokens.spacingVerticalXS,
    },
    tableCard: {
        padding: 0,
        overflow: 'hidden',
        borderRadius: tokens.borderRadiusLarge,
    },
    table: {
        width: '100%',
    },
    tableRow: {
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground1Hover,
        },
    },
    emptyState: {
        textAlign: 'center',
        padding: tokens.spacingVerticalXXL,
        color: tokens.colorNeutralForeground3,
    },
    templateInfo: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
    },
    templateTitle: {
        fontWeight: tokens.fontWeightMedium,
    },
    templateSubject: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
        maxWidth: '250px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    actionButtons: {
        display: 'flex',
        gap: tokens.spacingHorizontalXS,
    },
    // Desktop table - hidden on mobile
    desktopTable: {
        '@media (max-width: 768px)': {
            display: 'none',
        },
    },
    // Mobile card list
    mobileCardList: {
        display: 'none',
        '@media (max-width: 768px)': {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalS,
            padding: tokens.spacingHorizontalM,
        },
    },
    mobileCard: {
        padding: tokens.spacingHorizontalM,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground1,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
        boxShadow: tokens.shadow2,
    },
    mobileCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: tokens.spacingHorizontalS,
    },
    mobileCardFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: tokens.spacingHorizontalXS,
        paddingTop: tokens.spacingVerticalS,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    // Hide on tablet
    hideOnTablet: {
        '@media (max-width: 900px)': {
            display: 'none',
        },
    },
    paginationContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: tokens.spacingHorizontalL,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
        flexWrap: 'wrap',
        gap: tokens.spacingHorizontalM,
    },
    drawerBody: {
        padding: tokens.spacingVerticalL,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalM,
    },
    drawerSection: {
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingVerticalM,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    drawerSectionTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        fontWeight: tokens.fontWeightSemibold,
        marginBottom: tokens.spacingVerticalM,
        color: tokens.colorBrandForeground1,
    },
    drawerFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: tokens.spacingHorizontalM,
        padding: tokens.spacingVerticalL,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    },
    placeholderSection: {
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingVerticalM,
    },
    placeholderBadges: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: tokens.spacingHorizontalXS,
        marginTop: tokens.spacingVerticalS,
    },
    placeholderBadge: {
        cursor: 'pointer',
    },
    preview: {
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingHorizontalM,
        minHeight: '200px',
        backgroundColor: 'white',
    },
    previewSubject: {
        padding: tokens.spacingVerticalS,
        borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
        marginBottom: tokens.spacingVerticalS,
        fontWeight: tokens.fontWeightSemibold,
    },
});

interface TemplateFormData {
    templateNo: string;
    title: string;
    subject: string;
    body: string;
    isActive: boolean;
}

interface Placeholder {
    name: string;
    description: string;
}

const defaultFormData: TemplateFormData = {
    templateNo: '',
    title: '',
    subject: '',
    body: '',
    isActive: true,
};

const templateLegend = [
    { no: 1, desc: 'Permit Created', color: '#10b981' },
    { no: 2, desc: 'Assigned to Executor', color: '#f59e0b' },
    { no: 3, desc: 'Assigned to Issuer', color: '#3b82f6' },
    { no: 4, desc: 'Executor Approved', color: '#8b5cf6' },
    { no: 5, desc: 'Issuer Approved', color: '#06b6d4' },
    { no: 6, desc: 'Permit Closed', color: '#6b7280' },
];

export const EmailTemplatesPage: React.FC = () => {
    const styles = useStyles();
    const { user } = useUser();

    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [placeholders, setPlaceholders] = useState<Placeholder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDrawer, setShowDrawer] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [deletingTemplate, setDeletingTemplate] = useState<EmailTemplate | null>(null);
    const [formData, setFormData] = useState<TemplateFormData>(defaultFormData);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('editor');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const [showPreview, setShowPreview] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

    // Open template preview
    const openPreview = (template: EmailTemplate) => {
        setPreviewTemplate(template);
        setShowPreview(true);
    };

    const loadTemplates = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getAllEmailTemplates();
            setTemplates(response.data ?? []);
        } catch (error) {
            toast.error('Failed to load email templates');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const loadPlaceholders = useCallback(async () => {
        try {
            const response = await getAvailablePlaceholders();
            setPlaceholders(response.data ?? []);
        } catch (error) {
            console.error('Failed to load placeholders');
        }
    }, []);

    useEffect(() => {
        loadTemplates();
        loadPlaceholders();
    }, [loadTemplates, loadPlaceholders]);

    // Check admin access
    if (user?.role !== 'ADMIN') {
        return (
            <div className={styles.container}>
                <div className={styles.content}>
                    <Card style={{ padding: tokens.spacingVerticalXXL, textAlign: 'center' }}>
                        <Shield24Regular style={{ fontSize: '48px', color: tokens.colorNeutralForeground3, marginBottom: '16px' }} />
                        <Text size={500} weight="semibold" block>Access Denied</Text>
                        <Text style={{ color: tokens.colorNeutralForeground3 }}>
                            You don't have permission to access email templates.
                        </Text>
                    </Card>
                </div>
            </div>
        );
    }

    const openDrawer = (template?: EmailTemplate) => {
        if (template) {
            setEditingTemplate(template);
            setFormData({
                templateNo: template.templateNo?.toString() ?? '',
                title: template.title ?? '',
                subject: template.subject ?? '',
                body: template.body ?? '',
                isActive: template.isActive ?? true,
            });
        } else {
            setEditingTemplate(null);
            setFormData(defaultFormData);
        }
        setErrors({});
        setActiveTab('editor');
        setShowDrawer(true);
    };

    const closeDrawer = () => {
        setShowDrawer(false);
        setEditingTemplate(null);
        setFormData(defaultFormData);
        setErrors({});
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!editingTemplate && !formData.templateNo.trim()) {
            newErrors.templateNo = 'Template number is required';
        }
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        }
        if (!formData.body.trim()) {
            newErrors.body = 'Body is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            setIsSaving(true);
            const payload = {
                title: formData.title.trim(),
                subject: formData.subject.trim(),
                body: formData.body,
                isActive: formData.isActive,
            };

            if (editingTemplate) {
                await updateEmailTemplate(editingTemplate._id ?? '', payload);
                toast.success('Template updated successfully');
            } else {
                await createEmailTemplate({
                    ...payload,
                    templateNo: parseInt(formData.templateNo),
                });
                toast.success('Template created successfully');
            }

            closeDrawer();
            await loadTemplates();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to save template';
            toast.error(message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleStatus = async (template: EmailTemplate) => {
        try {
            await toggleEmailTemplateStatus(template._id ?? '');
            toast.success(`Template ${template.isActive ? 'disabled' : 'enabled'}`);
            await loadTemplates();
        } catch (error) {
            toast.error('Failed to toggle status');
        }
    };

    const handleDelete = async () => {
        if (!deletingTemplate) return;

        try {
            setIsSaving(true);
            await deleteEmailTemplate(deletingTemplate._id ?? '');
            toast.success('Template deleted');
            setShowDeleteDialog(false);
            setDeletingTemplate(null);
            await loadTemplates();
        } catch (error) {
            toast.error('Failed to delete template');
        } finally {
            setIsSaving(false);
        }
    };

    const openDeleteDialog = (template: EmailTemplate) => {
        setDeletingTemplate(template);
        setShowDeleteDialog(true);
    };

    const insertPlaceholder = (name: string, target: 'subject' | 'body') => {
        setFormData((prev) => ({
            ...prev,
            [target]: prev[target] + `{{${name}}}`,
        }));
    };

    // Stats
    const stats = {
        total: templates.length,
        active: templates.filter((t) => t.isActive).length,
        inactive: templates.filter((t) => !t.isActive).length,
    };

    if (isLoading) {
        return <PageLoading label="Loading templates..." />;
    }

    return (
        <div className={styles.container}>
            {/* Hero Section */}
            <div className={styles.hero}>
                <div className={styles.heroContent}>
                    <div className={styles.heroTitle}>
                        <Mail24Filled style={{ fontSize: '32px' }} />
                        <div>
                            <Text className={styles.heroTitleText}>Email Templates</Text>
                            <Text className={styles.heroSubtitle}>Manage notification email templates</Text>
                        </div>
                    </div>
                    <div className={styles.heroActions}>
                        <Button
                            icon={<ArrowClockwise24Regular />}
                            appearance="secondary"
                            onClick={loadTemplates}
                        >
                            Refresh
                        </Button>
                        <Button
                            icon={<Add24Regular />}
                            appearance="primary"
                            onClick={() => openDrawer()}
                        >
                            Create Template
                        </Button>
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                {/* Stats Cards */}
                <div className={styles.statsGrid}>
                    <Card className={styles.statCard}>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon} style={{ backgroundColor: '#e0f2fe' }}>
                                <Mail24Regular style={{ color: '#0284c7' }} />
                            </div>
                            <div className={styles.statInfo}>
                                <Text className={styles.statValue}>{stats.total}</Text>
                                <Text className={styles.statLabel}>Total</Text>
                            </div>
                        </div>
                    </Card>
                    <Card className={styles.statCard}>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon} style={{ backgroundColor: '#dcfce7' }}>
                                <ToggleRight24Regular style={{ color: '#10b981' }} />
                            </div>
                            <div className={styles.statInfo}>
                                <Text className={styles.statValue}>{stats.active}</Text>
                                <Text className={styles.statLabel}>Active</Text>
                            </div>
                        </div>
                    </Card>
                    <Card className={styles.statCard}>
                        <div className={styles.statContent}>
                            <div className={styles.statIcon} style={{ backgroundColor: '#f3f4f6' }}>
                                <ToggleLeft24Regular style={{ color: '#6b7280' }} />
                            </div>
                            <div className={styles.statInfo}>
                                <Text className={styles.statValue}>{stats.inactive}</Text>
                                <Text className={styles.statLabel}>Inactive</Text>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Template Legend */}
                <Card className={styles.legendCard}>
                    <Text className={styles.legendTitle}>
                        <Info24Regular />
                        Template Number Reference
                    </Text>
                    <div className={styles.legendGrid}>
                        {templateLegend.map((item) => (
                            <div key={item.no} className={styles.legendItem}>
                                <Badge appearance="filled" style={{ backgroundColor: item.color }}>
                                    #{item.no}
                                </Badge>
                                <Text size={200}>{item.desc}</Text>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Templates Table */}
                <Card className={styles.tableCard}>
                    {templates.length === 0 ? (
                        <div className={styles.emptyState}>
                            <Mail24Regular style={{ fontSize: '48px', marginBottom: '16px' }} />
                            <Text weight="semibold" block>No Email Templates</Text>
                            <Text size={200}>Create your first template to get started</Text>
                        </div>
                    ) : (
                        <>
                            {/* Desktop Table */}
                            <div className={styles.desktopTable}>
                                <Table className={styles.table}>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHeaderCell style={{ width: '80px' }}>#</TableHeaderCell>
                                            <TableHeaderCell>Template</TableHeaderCell>
                                            <TableHeaderCell>Status</TableHeaderCell>
                                            <TableHeaderCell className={styles.hideOnTablet}>Last Updated</TableHeaderCell>
                                            <TableHeaderCell style={{ width: '140px' }}>Actions</TableHeaderCell>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {templates
                                            .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                            .map((template) => (
                                                <TableRow key={template._id} className={styles.tableRow}>
                                                    <TableCell>
                                                        <Badge appearance="filled" color="brand">
                                                            #{template.templateNo}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className={styles.templateInfo} style={{ cursor: 'pointer' }} onClick={() => openPreview(template)}>
                                                            <Text className={styles.templateTitle} style={{ color: tokens.colorBrandForeground1 }}>{template.title}</Text>
                                                            <Text className={styles.templateSubject}>{template.subject}</Text>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            appearance="filled"
                                                            color={template.isActive ? 'success' : 'subtle'}
                                                        >
                                                            {template.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className={styles.hideOnTablet}>
                                                        <Text size={200}>
                                                            {template.updatedAt
                                                                ? new Date(template.updatedAt).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                })
                                                                : 'N/A'}
                                                        </Text>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className={styles.actionButtons}>
                                                            <Tooltip content="Preview" relationship="label">
                                                                <Button
                                                                    icon={<Eye24Regular />}
                                                                    appearance="subtle"
                                                                    size="small"
                                                                    onClick={() => openPreview(template)}
                                                                />
                                                            </Tooltip>
                                                            <Tooltip content="Edit" relationship="label">
                                                                <Button
                                                                    icon={<Edit24Regular />}
                                                                    appearance="subtle"
                                                                    size="small"
                                                                    onClick={() => openDrawer(template)}
                                                                />
                                                            </Tooltip>
                                                            <Tooltip content={template.isActive ? 'Disable' : 'Enable'} relationship="label">
                                                                <Button
                                                                    icon={template.isActive ? <ToggleRight24Regular /> : <ToggleLeft24Regular />}
                                                                    appearance="subtle"
                                                                    size="small"
                                                                    onClick={() => handleToggleStatus(template)}
                                                                />
                                                            </Tooltip>
                                                            <Tooltip content="Delete" relationship="label">
                                                                <Button
                                                                    icon={<Delete24Regular />}
                                                                    appearance="subtle"
                                                                    size="small"
                                                                    onClick={() => openDeleteDialog(template)}
                                                                />
                                                            </Tooltip>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile Card View */}
                            <div className={styles.mobileCardList}>
                                {templates
                                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                                    .map((template) => (
                                        <div key={template._id} className={styles.mobileCard}>
                                            <div className={styles.mobileCardHeader}>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                                        <Badge appearance="filled" color="brand">
                                                            #{template.templateNo}
                                                        </Badge>
                                                        <Badge
                                                            appearance="filled"
                                                            color={template.isActive ? 'success' : 'subtle'}
                                                            size="small"
                                                        >
                                                            {template.isActive ? 'Active' : 'Inactive'}
                                                        </Badge>
                                                    </div>
                                                    <Text weight="semibold" block>{template.title}</Text>
                                                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                                                        {template.subject}
                                                    </Text>
                                                </div>
                                            </div>
                                            <div className={styles.mobileCardFooter}>
                                                <Button
                                                    icon={<Eye24Regular />}
                                                    appearance="subtle"
                                                    size="small"
                                                    onClick={() => openPreview(template)}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    icon={<Edit24Regular />}
                                                    appearance="subtle"
                                                    size="small"
                                                    onClick={() => openDrawer(template)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    icon={template.isActive ? <ToggleRight24Regular /> : <ToggleLeft24Regular />}
                                                    appearance="subtle"
                                                    size="small"
                                                    onClick={() => handleToggleStatus(template)}
                                                >
                                                    {template.isActive ? 'Off' : 'On'}
                                                </Button>
                                                <Button
                                                    icon={<Delete24Regular />}
                                                    appearance="subtle"
                                                    size="small"
                                                    onClick={() => openDeleteDialog(template)}
                                                >
                                                    Del
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                            </div>

                            {/* Pagination */}
                            <div className={styles.paginationContainer}>
                                <Text style={{ color: tokens.colorNeutralForeground3, fontSize: tokens.fontSizeBase200 }}>
                                    Page {currentPage} of {Math.ceil(templates.length / itemsPerPage)} ({templates.length} templates)
                                </Text>
                                <div style={{ display: 'flex', gap: tokens.spacingHorizontalS }}>
                                    <Button
                                        appearance="subtle"
                                        size="small"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                    >
                                        ← Previous
                                    </Button>
                                    <Button
                                        appearance="subtle"
                                        size="small"
                                        disabled={currentPage >= Math.ceil(templates.length / itemsPerPage)}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                    >
                                        Next →
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </Card>
            </div>

            {/* Create/Edit Drawer */}
            <Drawer
                open={showDrawer}
                onOpenChange={(_, data) => !data.open && closeDrawer()}
                position="end"
                size="large"
            >
                <DrawerHeader style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
                    <DrawerHeaderTitle
                        action={
                            <Button
                                appearance="subtle"
                                icon={<Dismiss24Regular />}
                                onClick={closeDrawer}
                                style={{ color: 'white' }}
                            />
                        }
                    >
                        <Mail24Regular style={{ marginRight: '8px' }} />
                        {editingTemplate ? `Edit Template #${editingTemplate.templateNo}` : 'Create Email Template'}
                    </DrawerHeaderTitle>
                </DrawerHeader>

                <DrawerBody className={styles.drawerBody}>
                    {/* Basic Info */}
                    <div className={styles.drawerSection}>
                        <Text className={styles.drawerSectionTitle}>
                            <TextBold24Regular />
                            Basic Information
                        </Text>

                        <div style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '12px', marginBottom: '12px' }}>
                            <Field
                                label="Template #"
                                required={!editingTemplate}
                                validationMessage={errors.templateNo}
                                validationState={errors.templateNo ? 'error' : 'none'}
                            >
                                <Input
                                    type="number"
                                    value={formData.templateNo}
                                    onChange={(_, data) => setFormData({ ...formData, templateNo: data.value })}
                                    disabled={!!editingTemplate}
                                    placeholder="1-6"
                                />
                            </Field>
                            <Field
                                label="Title"
                                required
                                validationMessage={errors.title}
                                validationState={errors.title ? 'error' : 'none'}
                            >
                                <Input
                                    value={formData.title}
                                    onChange={(_, data) => setFormData({ ...formData, title: data.value })}
                                    placeholder="e.g., Permit Assigned to Executor"
                                />
                            </Field>
                        </div>

                        <Field
                            label="Email Subject"
                            required
                            validationMessage={errors.subject}
                            validationState={errors.subject ? 'error' : 'none'}
                        >
                            <Input
                                value={formData.subject}
                                onChange={(_, data) => setFormData({ ...formData, subject: data.value })}
                                placeholder="e.g., Permit {{permitNo}} has been assigned to you"
                            />
                        </Field>
                    </div>

                    {/* Placeholders */}
                    <div className={styles.placeholderSection}>
                        <Text weight="semibold" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Code24Regular />
                            Available Placeholders
                        </Text>
                        <Text size={200} style={{ color: tokens.colorNeutralForeground3, marginBottom: '8px', display: 'block' }}>
                            Click to insert into subject or body
                        </Text>
                        <div className={styles.placeholderBadges}>
                            {placeholders.map((p) => (
                                <Tooltip key={p.name} content={p.description} relationship="description">
                                    <Badge
                                        appearance="outline"
                                        className={styles.placeholderBadge}
                                        onClick={() => insertPlaceholder(p.name, 'body')}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        {`{{${p.name}}}`}
                                    </Badge>
                                </Tooltip>
                            ))}
                        </div>
                    </div>

                    {/* Email Body with Tabs */}
                    <div className={styles.drawerSection}>
                        <TabList
                            selectedValue={activeTab}
                            onTabSelect={(_, data) => setActiveTab(data.value as string)}
                            style={{ marginBottom: '12px' }}
                        >
                            <Tab value="editor" icon={<Edit24Regular />}>Editor</Tab>
                            <Tab value="preview" icon={<Eye24Regular />}>Preview</Tab>
                        </TabList>

                        {activeTab === 'editor' ? (
                            <Field
                                label="Email Body"
                                required
                                validationMessage={errors.body}
                                validationState={errors.body ? 'error' : 'none'}
                            >
                                <Textarea
                                    value={formData.body}
                                    onChange={(_, data) => setFormData({ ...formData, body: data.value })}
                                    rows={12}
                                    placeholder="Write your email body here. Use placeholders like {{permitNo}}, {{initiatorName}}, etc."
                                    style={{ fontFamily: 'monospace' }}
                                />
                            </Field>
                        ) : (
                            <div className={styles.preview}>
                                <div className={styles.previewSubject}>
                                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>Subject:</Text><br />
                                    <Text weight="semibold">{formData.subject || '(No subject)'}</Text>
                                </div>
                                <div style={{ padding: tokens.spacingHorizontalM }}>
                                    <Text size={200} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginBottom: '8px' }}>Body:</Text>
                                    {formData.body ? (
                                        <div
                                            style={{ fontSize: '14px', lineHeight: 1.6 }}
                                            dangerouslySetInnerHTML={{ __html: formData.body }}
                                        />
                                    ) : (
                                        <Text style={{ color: tokens.colorNeutralForeground3 }}>(No content)</Text>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status Toggle */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Switch
                            checked={formData.isActive}
                            onChange={(_, data) => setFormData({ ...formData, isActive: data.checked })}
                        />
                        <Text>Template is {formData.isActive ? 'Active' : 'Inactive'}</Text>
                    </div>
                </DrawerBody>

                <div className={styles.drawerFooter}>
                    <Button appearance="secondary" onClick={closeDrawer} disabled={isSaving}>
                        Cancel
                    </Button>
                    <Button
                        appearance="primary"
                        onClick={handleSubmit}
                        disabled={isSaving}
                        icon={isSaving ? <Spinner size="tiny" /> : <Checkmark24Regular />}
                    >
                        {isSaving ? 'Saving...' : editingTemplate ? 'Update Template' : 'Create Template'}
                    </Button>
                </div>
            </Drawer>

            {/* Delete Confirmation Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={(_, data) => setShowDeleteDialog(data.open)}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>Delete Template</DialogTitle>
                        <DialogContent>
                            <Text>
                                Are you sure you want to delete template <strong>#{deletingTemplate?.templateNo} - {deletingTemplate?.title}</strong>?
                                This action cannot be undone.
                            </Text>
                        </DialogContent>
                        <DialogActions>
                            <Button appearance="secondary" onClick={() => setShowDeleteDialog(false)}>
                                Cancel
                            </Button>
                            <Button
                                appearance="primary"
                                onClick={handleDelete}
                                disabled={isSaving}
                                style={{ backgroundColor: '#dc3545' }}
                            >
                                {isSaving ? 'Deleting...' : 'Delete Template'}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            {/* Preview Drawer */}
            <Drawer
                open={showPreview}
                onOpenChange={(_, data) => {
                    if (!data.open) {
                        setShowPreview(false);
                        setPreviewTemplate(null);
                    }
                }}
                position="end"
                size="medium"
            >
                <DrawerHeader style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                    <DrawerHeaderTitle
                        action={
                            <Button
                                appearance="subtle"
                                icon={<Dismiss24Regular />}
                                onClick={() => {
                                    setShowPreview(false);
                                    setPreviewTemplate(null);
                                }}
                                style={{ color: 'white' }}
                            />
                        }
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Eye24Regular />
                            <div>
                                <Text style={{ fontSize: tokens.fontSizeBase400, fontWeight: tokens.fontWeightBold, color: 'white' }}>
                                    Template Preview
                                </Text>
                                {previewTemplate && (
                                    <Text style={{ fontSize: tokens.fontSizeBase200, color: 'rgba(255,255,255,0.8)', display: 'block' }}>
                                        #{previewTemplate.templateNo} - {previewTemplate.title}
                                    </Text>
                                )}
                            </div>
                        </div>
                    </DrawerHeaderTitle>
                </DrawerHeader>
                <DrawerBody className={styles.drawerBody}>
                    {previewTemplate && (
                        <>
                            {/* Template Info */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: tokens.spacingHorizontalM,
                                padding: tokens.spacingHorizontalM,
                                backgroundColor: tokens.colorNeutralBackground3,
                                borderRadius: tokens.borderRadiusMedium,
                            }}>
                                <Badge appearance="filled" color="brand" size="large">
                                    #{previewTemplate.templateNo}
                                </Badge>
                                <div style={{ flex: 1 }}>
                                    <Text weight="semibold" block>{previewTemplate.title}</Text>
                                    <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                                        {templateLegend.find(l => l.no === previewTemplate.templateNo)?.desc || 'Custom Template'}
                                    </Text>
                                </div>
                                <Badge
                                    appearance="filled"
                                    color={previewTemplate.isActive ? 'success' : 'subtle'}
                                >
                                    {previewTemplate.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>

                            {/* Email Preview */}
                            <div className={styles.drawerSection}>
                                <Text className={styles.drawerSectionTitle}>
                                    <Mail24Regular />
                                    Email Preview
                                </Text>

                                {/* Subject */}
                                <div style={{
                                    padding: tokens.spacingHorizontalM,
                                    backgroundColor: tokens.colorNeutralBackground3,
                                    borderRadius: tokens.borderRadiusMedium,
                                    marginBottom: tokens.spacingVerticalM,
                                }}>
                                    <Text size={100} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginBottom: '4px' }}>
                                        Subject:
                                    </Text>
                                    <Text weight="semibold">{previewTemplate.subject}</Text>
                                </div>

                                {/* Body */}
                                <div style={{
                                    padding: tokens.spacingHorizontalM,
                                    backgroundColor: 'white',
                                    border: `1px solid ${tokens.colorNeutralStroke1}`,
                                    borderRadius: tokens.borderRadiusMedium,
                                    minHeight: '300px',
                                    maxHeight: '400px',
                                    overflowY: 'auto',
                                }}>
                                    <Text size={100} style={{ color: tokens.colorNeutralForeground3, display: 'block', marginBottom: '8px' }}>
                                        Body:
                                    </Text>
                                    <div
                                        style={{ fontSize: '14px', lineHeight: 1.6 }}
                                        dangerouslySetInnerHTML={{ __html: previewTemplate.body || '' }}
                                    />
                                </div>
                            </div>

                            {/* Placeholders Used */}
                            <div className={styles.placeholderSection}>
                                <Text weight="semibold" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                    <Code24Regular />
                                    Placeholders Used
                                </Text>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: tokens.spacingHorizontalXS }}>
                                    {(previewTemplate.body?.match(/\{\{[^}]+\}\}/g) || []).map((placeholder, idx) => (
                                        <Badge key={idx} appearance="outline">
                                            {placeholder}
                                        </Badge>
                                    ))}
                                    {!(previewTemplate.body?.match(/\{\{[^}]+\}\}/g) || []).length && (
                                        <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                                            No placeholders used
                                        </Text>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: tokens.spacingHorizontalM, marginTop: 'auto', paddingTop: tokens.spacingVerticalL }}>
                                <Button
                                    appearance="primary"
                                    icon={<Edit24Regular />}
                                    onClick={() => {
                                        setShowPreview(false);
                                        openDrawer(previewTemplate);
                                    }}
                                    style={{ flex: 1 }}
                                >
                                    Edit Template
                                </Button>
                                <Button
                                    appearance="secondary"
                                    icon={previewTemplate.isActive ? <ToggleRight24Regular /> : <ToggleLeft24Regular />}
                                    onClick={() => {
                                        handleToggleStatus(previewTemplate);
                                        setShowPreview(false);
                                    }}
                                >
                                    {previewTemplate.isActive ? 'Disable' : 'Enable'}
                                </Button>
                            </div>
                        </>
                    )}
                </DrawerBody>
            </Drawer>
        </div>
    );
};

export default EmailTemplatesPage;
