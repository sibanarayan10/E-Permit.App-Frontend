/**
 * E-PTW Learning — Detail Page
 * Split layout: video (left half) + title & info (right half), description below
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    makeStyles,
    tokens,
    Text,
    Button,
    Spinner,
    Divider,
    Badge,
} from '@fluentui/react-components';
import {
    ArrowLeft24Regular,
    Clock24Regular,
    Person24Regular,
    Calendar24Regular,
    Play24Filled,
    BookOpen24Regular,
    Eye24Regular,
} from '@fluentui/react-icons';
import { getLearningById, recordView, type LearningTopic } from '@/services/learning.service';

const useStyles = makeStyles({
    page: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '24px',
        '@media (max-width: 768px)': {
            padding: '12px',
        },
    },
    backBtn: {
        marginBottom: '20px',
    },
    /* ── Split Row: Video + Info ─────── */
    splitRow: {
        display: 'flex',
        gap: '24px',
        marginBottom: '32px',
        '@media (max-width: 768px)': {
            flexDirection: 'column',
            gap: '16px',
        },
    },
    /* ── Video Section (left half) ────── */
    videoSection: {
        flex: '1 1 50%',
        backgroundColor: '#000',
        minHeight: '320px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        '@media (max-width: 768px)': {
            flex: '1 1 auto',
            minHeight: '220px',
        },
    },
    videoPlayer: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        display: 'block',
    },
    videoPlaceholder: {
        width: '100%',
        height: '100%',
        minHeight: '320px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        color: 'rgba(255,255,255,0.6)',
        gap: '12px',
    },
    playIcon: {
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.4)',
    },
    /* ── Info Panel (right half) ──────── */
    infoPanel: {
        flex: '1 1 50%',
        backgroundColor: tokens.colorNeutralBackground1,
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: '16px',
        borderRadius: '16px',
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
        '@media (max-width: 768px)': {
            flex: '1 1 auto',
            padding: '20px',
            borderRadius: '12px',
        },
    },
    categoryBadge: {
        alignSelf: 'flex-start',
    },
    title: {
        fontSize: '24px',
        fontWeight: tokens.fontWeightBold,
        lineHeight: '1.3',
        letterSpacing: '-0.3px',
        '@media (max-width: 768px)': {
            fontSize: '20px',
        },
    },
    metaList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '4px',
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '13.5px',
        color: tokens.colorNeutralForeground3,
    },
    metaIcon: {
        fontSize: '18px',
        color: '#667eea',
    },
    /* ── Description Section (below) ──── */
    descriptionSection: {
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: '16px',
        padding: '32px',
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        '@media (max-width: 768px)': {
            padding: '20px',
            borderRadius: '12px',
        },
    },
    descriptionLabel: {
        fontSize: '18px',
        fontWeight: tokens.fontWeightSemibold,
        marginBottom: '16px',
        display: 'block',
    },
    description: {
        fontSize: '15px',
        lineHeight: '1.75',
        color: tokens.colorNeutralForeground2,
        whiteSpace: 'pre-wrap',
    },
    /* ── Loading / Error ────────────────── */
    center: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '120px 20px',
        flexDirection: 'column',
        gap: '16px',
    },
    errorIcon: {
        width: '72px',
        height: '72px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #ff626233, #ff414133)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
    },
});

const LearningDetailPage: React.FC = () => {
    const styles = useStyles();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [topic, setTopic] = useState<LearningTopic | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewCount, setViewCount] = useState(0);
    const viewRecorded = useRef(false);

    useEffect(() => {
        if (!id) return;
        const fetchTopic = async () => {
            try {
                setLoading(true);
                const res = await getLearningById(id);
                setTopic(res.data);
                setViewCount(res.data.viewCount || 0);
            } catch {
                setError('Failed to load the learning topic.');
            } finally {
                setLoading(false);
            }
        };
        fetchTopic();
    }, [id]);

    // Record a view once per page visit
    useEffect(() => {
        if (!id || viewRecorded.current) return;
        viewRecorded.current = true;
        recordView(id)
            .then((res) => {
                if (res.success) setViewCount(res.data.viewCount);
            })
            .catch(() => { /* silently ignore */ });
    }, [id]);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className={styles.center}>
                <Spinner size="large" label="Loading..." />
            </div>
        );
    }

    if (error || !topic) {
        return (
            <div className={styles.center}>
                <div className={styles.errorIcon}>❌</div>
                <Text size={500} weight="semibold">
                    {error || 'Topic not found'}
                </Text>
                <Button
                    appearance="primary"
                    onClick={() => navigate('/learning')}
                    style={{
                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                        borderRadius: '10px',
                    }}
                >
                    Back to Learning
                </Button>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {/* Back button */}
            <Button
                className={styles.backBtn}
                appearance="subtle"
                icon={<ArrowLeft24Regular />}
                onClick={() => navigate('/learning')}
            >
                Back to Learning
            </Button>

            {/* ── Split Row: Video (left) + Title & Info (right) ── */}
            <div className={styles.splitRow}>
                {/* Video — left half */}
                <div className={styles.videoSection}>
                    {topic.video?.url ? (
                        <video
                            className={styles.videoPlayer}
                            src={topic.video.url}
                            controls
                            muted
                            preload="metadata"
                            poster={topic.thumbnail?.url || undefined}
                            id="learning-video-player"
                        />
                    ) : (
                        <div className={styles.videoPlaceholder}>
                            <div className={styles.playIcon}>
                                <Play24Filled style={{ fontSize: 32, color: '#fff' }} />
                            </div>
                            <Text style={{ color: 'rgba(255,255,255,0.5)' }}>
                                No video available
                            </Text>
                        </div>
                    )}
                </div>

                {/* Title & Info — right half */}
                <div className={styles.infoPanel}>
                    {topic.category && (
                        <Badge
                            className={styles.categoryBadge}
                            appearance="filled"
                            color="brand"
                            size="medium"
                        >
                            {topic.category}
                        </Badge>
                    )}

                    <Text className={styles.title}>{topic.title}</Text>

                    <Divider />

                    <div className={styles.metaList}>
                        {topic.instructor && (
                            <div className={styles.metaItem}>
                                <Person24Regular className={styles.metaIcon} />
                                {topic.instructor}
                            </div>
                        )}
                        {topic.duration && (
                            <div className={styles.metaItem}>
                                <Clock24Regular className={styles.metaIcon} />
                                {topic.duration}
                            </div>
                        )}
                        <div className={styles.metaItem}>
                            <Calendar24Regular className={styles.metaIcon} />
                            {formatDate(topic.createdAt)}
                        </div>
                        {topic.createdBy && (
                            <div className={styles.metaItem}>
                                <BookOpen24Regular className={styles.metaIcon} />
                                Added by {topic.createdBy.name}
                            </div>
                        )}
                        <div className={styles.metaItem}>
                            <Eye24Regular className={styles.metaIcon} />
                            {viewCount.toLocaleString()} {viewCount === 1 ? 'view' : 'views'}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Description Section (below) ── */}
            <div className={styles.descriptionSection}>
                <Text className={styles.descriptionLabel}>Description</Text>
                <Text className={styles.description}>
                    {topic.detailedDescription}
                </Text>
            </div>
        </div>
    );
};

export default LearningDetailPage;


