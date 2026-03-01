/**
 * E-PTW Learning — Course List Page
 * Modern card-based grid layout for learning/training content
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    makeStyles,
    tokens,
    Text,
    Input,
    Button,
    Spinner,
    Badge,
    mergeClasses,
    shorthands,
} from '@fluentui/react-components';
import {
    Search24Regular,
    Add24Regular,
    Clock24Regular,
    Person24Regular,
    BookOpen24Regular,
    Eye24Regular,
} from '@fluentui/react-icons';
import { useUser } from '@/context';
import {
    getAllLearning,
    type LearningTopic,
} from '@/services/learning.service';

const useStyles = makeStyles({
    page: {
        padding: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
        '@media (max-width: 768px)': {
            padding: '16px',
        },
    },
    /* ── Header ─────────────────────────── */
    header: {
        marginBottom: '32px',
    },
    headerTop: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px',
        flexWrap: 'wrap',
        gap: '12px',
    },
    titleRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
    },
    titleIcon: {
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '22px',
        flexShrink: 0,
        boxShadow: '0 4px 14px rgba(102, 126, 234, 0.35)',
    },
    pageTitle: {
        fontSize: '28px',
        fontWeight: tokens.fontWeightBold,
        letterSpacing: '-0.5px',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        '@media (max-width: 768px)': {
            fontSize: '22px',
        },
    },
    subtitle: {
        color: tokens.colorNeutralForeground3,
        fontSize: '14px',
        marginTop: '2px',
    },
    searchBar: {
        display: 'flex',
        gap: '12px',
        marginTop: '20px',
        flexWrap: 'wrap',
    },
    searchInput: {
        minWidth: '280px',
        flex: 1,
        '@media (max-width: 768px)': {
            minWidth: '100%',
        },
    },
    /* ── Grid ───────────────────────────── */
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '20px',
        '@media (max-width: 600px)': {
            gridTemplateColumns: '1fr',
            gap: '14px',
        },
    },
    /* ── Card ───────────────────────────── */
    card: {
        position: 'relative',
        ...shorthands.borderRadius('12px'),
        overflow: 'hidden',
        backgroundColor: tokens.colorNeutralBackground1,
        ...shorthands.border('1px', 'solid', tokens.colorNeutralStroke2),
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        ':hover': {
            transform: 'translateY(-6px)',
            boxShadow: '0 12px 32px rgba(102, 126, 234, 0.18)',
            ...shorthands.borderColor('#667eea'),
        },
    },
    thumbnailWrap: {
        position: 'relative',
        width: '100%',
        aspectRatio: '3 / 2',
        overflow: 'hidden',
        backgroundColor: '#1a1a2e',
    },
    thumbnail: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transition: 'transform 0.4s ease',
    },
    thumbnailHover: {
        ':hover img': {
            transform: 'scale(1.05)',
        },
    },
    thumbnailPlaceholder: {
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        fontSize: '48px',
    },
    categoryBadge: {
        position: 'absolute',
        top: '8px',
        left: '8px',
        zIndex: 2,
    },
    durationBadge: {
        position: 'absolute',
        bottom: '8px',
        right: '8px',
        backgroundColor: 'rgba(0,0,0,0.72)',
        color: '#fff',
        borderRadius: '5px',
        padding: '3px 8px',
        fontSize: '11px',
        fontWeight: tokens.fontWeightSemibold,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        zIndex: 2,
    },
    cardBody: {
        padding: '12px 14px 16px',
    },
    cardTitle: {
        fontSize: '15px',
        fontWeight: tokens.fontWeightSemibold,
        lineHeight: '1.35',
        marginBottom: '6px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
    },
    cardDesc: {
        fontSize: '12.5px',
        color: tokens.colorNeutralForeground3,
        lineHeight: '1.5',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        marginBottom: '10px',
    },
    cardMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '11.5px',
        color: tokens.colorNeutralForeground4,
    },
    /* ── Empty state ────────────────────── */
    empty: {
        textAlign: 'center',
        padding: '80px 20px',
    },
    emptyIcon: {
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea33, #764ba233)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
        fontSize: '36px',
    },
    loading: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '100px 0',
    },
});

const LearningListPage: React.FC = () => {
    const styles = useStyles();
    const navigate = useNavigate();
    const { user } = useUser();
    const isAdmin = ['ADMIN', 'SUBADMIN'].includes(user?.role || '');

    const [topics, setTopics] = useState<LearningTopic[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchTopics = useCallback(async () => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};
            if (search.trim()) params.category = search.trim();
            const res = await getAllLearning(params);
            setTopics(res.data || []);
        } catch {
            setTopics([]);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        const timer = setTimeout(fetchTopics, 300);
        return () => clearTimeout(timer);
    }, [fetchTopics]);

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerTop}>
                    <div className={styles.titleRow}>
                        <div className={styles.titleIcon}>
                            <BookOpen24Regular />
                        </div>
                        <div>
                            <Text className={styles.pageTitle}>E-PTW Learning</Text>
                            <Text className={styles.subtitle}>
                                Explore training modules and safety courses
                            </Text>
                        </div>
                    </div>

                    {isAdmin && (
                        <Button
                            appearance="primary"
                            icon={<Add24Regular />}
                            onClick={() => navigate('/learning/admin')}
                            style={{
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                borderRadius: '10px',
                            }}
                        >
                            Manage Topics
                        </Button>
                    )}
                </div>

                <div className={styles.searchBar}>
                    <Input
                        className={styles.searchInput}
                        placeholder="Search by category..."
                        contentBefore={<Search24Regular />}
                        value={search}
                        onChange={(_, d) => setSearch(d.value)}
                        id="learning-search"
                    />
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className={styles.loading}>
                    <Spinner size="large" label="Loading learning topics..." />
                </div>
            ) : topics.length === 0 ? (
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>📚</div>
                    <Text size={500} weight="semibold" block>
                        {search ? 'No results found' : 'No learning topics available'}
                    </Text>
                    <Text
                        size={300}
                        style={{ color: tokens.colorNeutralForeground3, marginTop: 8 }}
                        block
                    >
                        {search
                            ? 'Try a different search term.'
                            : 'Check back later for new training content.'}
                    </Text>
                </div>
            ) : (
                <div className={styles.grid}>
                    {topics.map((topic) => (
                        <div
                            key={topic._id}
                            className={mergeClasses(styles.card, styles.thumbnailHover)}
                            onClick={() => navigate(`/learning/${topic._id}`)}
                            id={`learning-card-${topic._id}`}
                        >
                            {/* Thumbnail */}
                            <div className={styles.thumbnailWrap}>
                                {topic.thumbnail?.url ? (
                                    <img
                                        src={topic.thumbnail.url}
                                        alt={topic.title}
                                        className={styles.thumbnail}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className={styles.thumbnailPlaceholder}>
                                        <BookOpen24Regular />
                                    </div>
                                )}
                                {topic.category && (
                                    <div className={styles.categoryBadge}>
                                        <Badge
                                            appearance="filled"
                                            color="brand"
                                            size="small"
                                        >
                                            {topic.category}
                                        </Badge>
                                    </div>
                                )}
                                {topic.duration && (
                                    <div className={styles.durationBadge}>
                                        <Clock24Regular style={{ fontSize: 14 }} />
                                        {topic.duration}
                                    </div>
                                )}
                            </div>

                            {/* Body */}
                            <div className={styles.cardBody}>
                                <Text className={styles.cardTitle}>{topic.title}</Text>
                                <Text className={styles.cardDesc}>
                                    {topic.shortDescription}
                                </Text>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                    {topic.instructor && (
                                        <div className={styles.cardMeta}>
                                            <Person24Regular style={{ fontSize: 14 }} />
                                            {topic.instructor}
                                        </div>
                                    )}
                                    <div className={styles.cardMeta}>
                                        <Eye24Regular style={{ fontSize: 14 }} />
                                        {(topic.viewCount || 0).toLocaleString()} views
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LearningListPage;
