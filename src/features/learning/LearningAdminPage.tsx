/**
 * E-PTW Learning — Admin Management Page
 * Create, edit, and delete learning topics with media uploads
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    makeStyles,
    tokens,
    Text,
    Input,
    Button,
    Textarea,
    Spinner,
    Dialog,
    DialogTrigger,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Switch,
    Badge,
    Divider,
} from '@fluentui/react-components';
import {
    ArrowLeft24Regular,
    Add24Regular,
    Edit24Regular,
    Delete24Regular,
    Image24Regular,
    Video24Regular,
    Save24Regular,
    Dismiss24Regular,
    CheckmarkCircle24Regular,
    Eye24Regular,
} from '@fluentui/react-icons';
import toast from 'react-hot-toast';
import {
    getAllLearningAdmin,
    createLearning,
    updateLearning,
    deleteLearning,
    type LearningTopic,
} from '@/services/learning.service';

const useStyles = makeStyles({
    page: {
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto',
        '@media (max-width: 768px)': {
            padding: '16px',
        },
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        flexWrap: 'wrap',
        gap: '12px',
    },
    headerLeft: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    titleIcon: {
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '20px',
        boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)',
    },
    pageTitle: {
        fontSize: '24px',
        fontWeight: tokens.fontWeightBold,
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    /* ── Topic list ─────────────────────── */
    topicList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    topicCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px',
        borderRadius: '14px',
        backgroundColor: tokens.colorNeutralBackground1,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        transition: 'box-shadow 0.2s',
        ':hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        },
        '@media (max-width: 600px)': {
            flexDirection: 'column',
            alignItems: 'flex-start',
        },
    },
    topicThumb: {
        width: '120px',
        height: '68px',
        borderRadius: '8px',
        objectFit: 'cover',
        backgroundColor: '#e0e0e0',
        flexShrink: 0,
        '@media (max-width: 600px)': {
            width: '100%',
            height: 'auto',
            aspectRatio: '16/9',
        },
    },
    topicThumbPlaceholder: {
        width: '120px',
        height: '68px',
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #667eea44, #764ba244)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        flexShrink: 0,
        '@media (max-width: 600px)': {
            width: '100%',
            height: 'auto',
            aspectRatio: '16/9',
        },
    },
    topicInfo: {
        flex: 1,
        minWidth: 0,
    },
    topicTitle: {
        fontSize: '15px',
        fontWeight: tokens.fontWeightSemibold,
        marginBottom: '4px',
    },
    topicDesc: {
        fontSize: '13px',
        color: tokens.colorNeutralForeground3,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    topicActions: {
        display: 'flex',
        gap: '8px',
        flexShrink: 0,
    },
    /* ── Form ───────────────────────────── */
    formOverlay: {
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        backgroundColor: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    formPanel: {
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: '20px',
        width: '680px',
        maxWidth: '96vw',
        maxHeight: '92vh',
        overflow: 'auto',
        padding: '32px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        '@media (max-width: 768px)': {
            padding: '20px',
            borderRadius: '16px',
        },
    },
    formTitle: {
        fontSize: '22px',
        fontWeight: tokens.fontWeightBold,
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    formGrid: {
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
    },
    formRow: {
        display: 'flex',
        gap: '16px',
        '@media (max-width: 600px)': {
            flexDirection: 'column',
        },
    },
    formField: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    fieldLabel: {
        fontSize: '13px',
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground2,
    },
    fileUpload: {
        border: `2px dashed ${tokens.colorNeutralStroke2}`,
        borderRadius: '12px',
        padding: '20px',
        textAlign: 'center' as const,
        cursor: 'pointer',
        transitionProperty: 'all',
        transitionDuration: '0.2s',
    },
    filePreview: {
        maxWidth: '200px',
        maxHeight: '120px',
        borderRadius: '8px',
        objectFit: 'cover' as const,
        marginTop: '8px',
    },
    formActions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
        marginTop: '24px',
    },
    /* ── Empty / Loading ────────────────── */
    center: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 20px',
        flexDirection: 'column',
        gap: '16px',
    },
});

interface FormState {
    title: string;
    shortDescription: string;
    detailedDescription: string;
    instructor: string;
    duration: string;
    category: string;
    isPublished: boolean;
}

const emptyForm: FormState = {
    title: '',
    shortDescription: '',
    detailedDescription: '',
    instructor: '',
    duration: '',
    category: 'General',
    isPublished: true,
};

const LearningAdminPage: React.FC = () => {
    const styles = useStyles();
    const navigate = useNavigate();

    const [topics, setTopics] = useState<LearningTopic[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
    const [videoPreviewName, setVideoPreviewName] = useState<string>('');

    // Delete
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const thumbnailRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLInputElement>(null);

    const fetchTopics = useCallback(async () => {
        try {
            setLoading(true);
            const res = await getAllLearningAdmin();
            setTopics(res.data || []);
        } catch {
            toast.error('Failed to load learning topics');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);

    const openCreateForm = () => {
        setEditId(null);
        setForm(emptyForm);
        setThumbnailFile(null);
        setVideoFile(null);
        setThumbnailPreview('');
        setVideoPreviewName('');
        setShowForm(true);
    };

    const openEditForm = (topic: LearningTopic) => {
        setEditId(topic._id);
        setForm({
            title: topic.title,
            shortDescription: topic.shortDescription,
            detailedDescription: topic.detailedDescription,
            instructor: topic.instructor || '',
            duration: topic.duration || '',
            category: topic.category || 'General',
            isPublished: topic.isPublished,
        });
        setThumbnailFile(null);
        setVideoFile(null);
        setThumbnailPreview(topic.thumbnail?.url || '');
        setVideoPreviewName(topic.video?.url ? 'Existing video' : '');
        setShowForm(true);
    };

    const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setThumbnailFile(file);
            const reader = new FileReader();
            reader.onload = () => setThumbnailPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setVideoFile(file);
            setVideoPreviewName(file.name);
        }
    };

    const handleSubmit = async () => {
        if (!form.title.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!form.shortDescription.trim()) {
            toast.error('Short description is required');
            return;
        }
        if (!form.detailedDescription.trim()) {
            toast.error('Detailed description is required');
            return;
        }

        try {
            setSaving(true);
            const fd = new FormData();
            fd.append('title', form.title);
            fd.append('shortDescription', form.shortDescription);
            fd.append('detailedDescription', form.detailedDescription);
            fd.append('instructor', form.instructor);
            fd.append('duration', form.duration);
            fd.append('category', form.category);
            fd.append('isPublished', String(form.isPublished));
            if (thumbnailFile) fd.append('thumbnail', thumbnailFile);
            if (videoFile) fd.append('video', videoFile);

            if (editId) {
                await updateLearning(editId, fd);
                toast.success('Topic updated successfully');
            } else {
                await createLearning(fd);
                toast.success('Topic created successfully');
            }
            setShowForm(false);
            fetchTopics();
        } catch (err: any) {
            let msg = err?.response?.data?.message || err?.message || 'Failed to save topic';
            // Show a friendlier message for timeout / network errors
            if (err?.code === 'ECONNABORTED' || msg.toLowerCase().includes('timeout')) {
                msg = 'Upload timed out. Please try with a smaller video file or check your internet connection.';
            } else if (msg.toLowerCase().includes('network error')) {
                msg = 'Network error. Please check your internet connection and try again.';
            }
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            setDeleting(true);
            await deleteLearning(deleteId);
            toast.success('Topic deleted successfully');
            setDeleteId(null);
            fetchTopics();
        } catch {
            toast.error('Failed to delete topic');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <Button
                        appearance="subtle"
                        icon={<ArrowLeft24Regular />}
                        onClick={() => navigate('/learning')}
                    />
                    <div className={styles.titleIcon}>⚙️</div>
                    <Text className={styles.pageTitle}>Manage Learning</Text>
                </div>
                <Button
                    appearance="primary"
                    icon={<Add24Regular />}
                    onClick={openCreateForm}
                    style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        borderRadius: '10px',
                    }}
                >
                    New Topic
                </Button>
            </div>

            {/* Topics List */}
            {loading ? (
                <div className={styles.center}>
                    <Spinner size="large" label="Loading..." />
                </div>
            ) : topics.length === 0 ? (
                <div className={styles.center}>
                    <Text size={500}>No topics yet. Create your first one!</Text>
                </div>
            ) : (
                <div className={styles.topicList}>
                    {topics.map((t) => (
                        <div key={t._id} className={styles.topicCard}>
                            {t.thumbnail?.url ? (
                                <img
                                    src={t.thumbnail.url}
                                    alt={t.title}
                                    className={styles.topicThumb}
                                />
                            ) : (
                                <div className={styles.topicThumbPlaceholder}>📹</div>
                            )}
                            <div className={styles.topicInfo}>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                                    <Text className={styles.topicTitle}>{t.title}</Text>
                                    {!t.isPublished && (
                                        <Badge appearance="outline" color="warning" size="small">
                                            Draft
                                        </Badge>
                                    )}
                                </div>
                                <Text className={styles.topicDesc}>{t.shortDescription}</Text>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: tokens.colorNeutralForeground3, marginTop: '4px' }}>
                                    <Eye24Regular style={{ fontSize: 14 }} />
                                    {(t.viewCount || 0).toLocaleString()} views
                                </div>
                            </div>
                            <div className={styles.topicActions}>
                                <Button
                                    appearance="subtle"
                                    icon={<Edit24Regular />}
                                    onClick={() => openEditForm(t)}
                                    title="Edit"
                                />
                                <Button
                                    appearance="subtle"
                                    icon={<Delete24Regular />}
                                    onClick={() => setDeleteId(t._id)}
                                    title="Delete"
                                    style={{ color: '#d13438' }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Create/Edit Form Overlay ───────── */}
            {showForm && (
                <div className={styles.formOverlay} onClick={() => !saving && setShowForm(false)}>
                    <div className={styles.formPanel} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.formTitle}>
                            <span>{editId ? 'Edit Topic' : 'Create New Topic'}</span>
                            <Button
                                appearance="subtle"
                                icon={<Dismiss24Regular />}
                                onClick={() => setShowForm(false)}
                                disabled={saving}
                            />
                        </div>

                        <div className={styles.formGrid}>
                            {/* Title */}
                            <div className={styles.formField}>
                                <Text className={styles.fieldLabel}>Title *</Text>
                                <Input
                                    value={form.title}
                                    onChange={(_, d) => setForm({ ...form, title: d.value })}
                                    placeholder="e.g. Safety Harness Training"
                                    id="learning-form-title"
                                />
                            </div>

                            {/* Short Description */}
                            <div className={styles.formField}>
                                <Text className={styles.fieldLabel}>Short Description *</Text>
                                <Textarea
                                    value={form.shortDescription}
                                    onChange={(_, d) => setForm({ ...form, shortDescription: d.value })}
                                    placeholder="Brief overview (2-3 lines)"
                                    rows={3}
                                    id="learning-form-short-desc"
                                />
                            </div>

                            {/* Detailed Description */}
                            <div className={styles.formField}>
                                <Text className={styles.fieldLabel}>Detailed Description *</Text>
                                <Textarea
                                    value={form.detailedDescription}
                                    onChange={(_, d) => setForm({ ...form, detailedDescription: d.value })}
                                    placeholder="Full explanation of the topic..."
                                    rows={6}
                                    id="learning-form-detail-desc"
                                />
                            </div>

                            {/* Row: Instructor + Duration */}
                            <div className={styles.formRow}>
                                <div className={styles.formField}>
                                    <Text className={styles.fieldLabel}>Instructor</Text>
                                    <Input
                                        value={form.instructor}
                                        onChange={(_, d) => setForm({ ...form, instructor: d.value })}
                                        placeholder="Name of instructor"
                                        id="learning-form-instructor"
                                    />
                                </div>
                                <div className={styles.formField}>
                                    <Text className={styles.fieldLabel}>Duration</Text>
                                    <Input
                                        value={form.duration}
                                        onChange={(_, d) => setForm({ ...form, duration: d.value })}
                                        placeholder="e.g. 15 mins"
                                        id="learning-form-duration"
                                    />
                                </div>
                            </div>

                            {/* Row: Category + Published */}
                            <div className={styles.formRow}>
                                <div className={styles.formField}>
                                    <Text className={styles.fieldLabel}>Category</Text>
                                    <Input
                                        value={form.category}
                                        onChange={(_, d) => setForm({ ...form, category: d.value })}
                                        placeholder="e.g. Height Safety"
                                        id="learning-form-category"
                                    />
                                </div>
                                <div className={styles.formField} style={{ justifyContent: 'center' }}>
                                    <Switch
                                        checked={form.isPublished}
                                        onChange={(_, d) => setForm({ ...form, isPublished: d.checked })}
                                        label={form.isPublished ? 'Published' : 'Draft'}
                                        id="learning-form-published"
                                    />
                                </div>
                            </div>

                            <Divider />

                            {/* Thumbnail Upload */}
                            <div className={styles.formField}>
                                <Text className={styles.fieldLabel}>Thumbnail Image</Text>
                                <input
                                    ref={thumbnailRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailSelect}
                                    style={{ display: 'none' }}
                                />
                                <div
                                    className={styles.fileUpload}
                                    onClick={() => thumbnailRef.current?.click()}
                                >
                                    <Image24Regular style={{ fontSize: 28, color: '#667eea' }} />
                                    <Text size={200} block style={{ marginTop: 6 }}>
                                        Click to select thumbnail
                                    </Text>
                                </div>
                                {thumbnailPreview && (
                                    <img
                                        src={thumbnailPreview}
                                        alt="Thumbnail preview"
                                        className={styles.filePreview}
                                    />
                                )}
                            </div>

                            {/* Video Upload */}
                            <div className={styles.formField}>
                                <Text className={styles.fieldLabel}>Video File</Text>
                                <input
                                    ref={videoRef}
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoSelect}
                                    style={{ display: 'none' }}
                                />
                                <div
                                    className={styles.fileUpload}
                                    onClick={() => videoRef.current?.click()}
                                >
                                    <Video24Regular style={{ fontSize: 28, color: '#667eea' }} />
                                    <Text size={200} block style={{ marginTop: 6 }}>
                                        Click to select video (max 100 MB)
                                    </Text>
                                </div>
                                {videoPreviewName && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                        <CheckmarkCircle24Regular style={{ color: '#28a745', fontSize: 18 }} />
                                        <Text size={200}>{videoPreviewName}</Text>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className={styles.formActions}>
                            <Button
                                appearance="secondary"
                                onClick={() => setShowForm(false)}
                                disabled={saving}
                            >
                                Cancel
                            </Button>
                            <Button
                                appearance="primary"
                                icon={saving ? <Spinner size="tiny" /> : <Save24Regular />}
                                onClick={handleSubmit}
                                disabled={saving}
                                style={{
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                    borderRadius: '10px',
                                }}
                            >
                                {saving ? 'Saving...' : editId ? 'Update Topic' : 'Create Topic'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Delete Confirmation Dialog ─────── */}
            <Dialog open={!!deleteId} onOpenChange={(_, data) => !data.open && setDeleteId(null)}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>Delete Learning Topic</DialogTitle>
                        <DialogContent>
                            Are you sure you want to delete this topic? This action cannot be undone
                            and will also remove the associated video and thumbnail.
                        </DialogContent>
                        <DialogActions>
                            <DialogTrigger disableButtonEnhancement>
                                <Button appearance="secondary" disabled={deleting}>
                                    Cancel
                                </Button>
                            </DialogTrigger>
                            <Button
                                appearance="primary"
                                onClick={handleDelete}
                                disabled={deleting}
                                style={{ backgroundColor: '#d13438' }}
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>
        </div>
    );
};

export default LearningAdminPage;
