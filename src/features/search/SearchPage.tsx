/**
 * Advanced Search Page - Professional permit search with modern UI
 * Features: Debounced search, quick filters, advanced filters, results with actions
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    makeStyles,
    tokens,
    Card,
    Text,
    Button,
    Input,
    Dropdown,
    Option,
    Badge,
    Spinner,
    Table,
    TableHeader,
    TableRow,
    TableHeaderCell,
    TableBody,
    TableCell,
    TableCellLayout,
    Tooltip,
    mergeClasses,
} from '@fluentui/react-components';
import {
    Search24Regular,
    Search24Filled,
    Eye24Regular,
    DocumentArrowDown24Regular,
    Filter24Regular,
    FilterDismiss24Regular,
    CalendarLtr24Regular,
    DocumentBulletList24Regular,
    Clock24Regular,
    CheckmarkCircle24Regular,
    Warning24Regular,
    DismissCircle24Regular,
    ArrowSync24Regular,
    ChevronDown24Regular,
    ChevronUp24Regular,
    History24Regular,
    Sparkle24Regular,
    Info24Regular,
} from '@fluentui/react-icons';
import { searchPermits, getAllPermits } from '@/services';
import { PERMIT_STATUS_LABELS } from '@/constants';
import type { PermitSummary } from '@/models';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    container: {
        maxWidth: '1400px',
        margin: '0 auto',
        padding: tokens.spacingHorizontalXL,
        minHeight: 'calc(100vh - 200px)',
        '@media (max-width: 768px)': {
            padding: tokens.spacingHorizontalM,
        },
    },
    // Hero Section
    heroSection: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: tokens.borderRadiusXLarge,
        padding: tokens.spacingHorizontalXXL,
        marginBottom: tokens.spacingVerticalXL,
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(102, 126, 234, 0.3)',
        '@media (max-width: 768px)': {
            padding: tokens.spacingHorizontalL,
            borderRadius: tokens.borderRadiusLarge,
        },
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
        position: 'relative',
        zIndex: 1,
    },
    heroTitle: {
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: tokens.spacingVerticalS,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
    },
    heroSubtitle: {
        fontSize: tokens.fontSizeBase400,
        opacity: 0.9,
        marginBottom: tokens.spacingVerticalL,
    },
    // Main Search Input
    mainSearchContainer: {
        position: 'relative',
        maxWidth: '700px',
    },
    mainSearchInput: {
        width: '100%',
        '& input': {
            padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalL}`,
            paddingLeft: '48px',
            paddingRight: '120px',
            fontSize: tokens.fontSizeBase400,
            borderRadius: tokens.borderRadiusLarge,
            border: 'none',
            backgroundColor: 'rgba(255,255,255,0.95)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            '&::placeholder': {
                color: tokens.colorNeutralForeground3,
            },
        },
    },
    searchIcon: {
        position: 'absolute',
        left: '16px',
        top: '50%',
        transform: 'translateY(-50%)',
        color: tokens.colorBrandForeground1,
        fontSize: '20px',
        zIndex: 1,
    },
    searchButton: {
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        borderRadius: tokens.borderRadiusMedium,
    },
    // Quick Filters Section
    quickFiltersSection: {
        marginTop: tokens.spacingVerticalL,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        flexWrap: 'wrap',
    },
    quickFilterLabel: {
        fontSize: tokens.fontSizeBase200,
        opacity: 0.8,
        marginRight: tokens.spacingHorizontalS,
    },
    quickFilterChip: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        border: '1px solid rgba(255,255,255,0.3)',
        color: 'white',
        borderRadius: tokens.borderRadiusCircular,
        padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
        cursor: 'pointer',
        fontSize: tokens.fontSizeBase200,
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXS,
        ':hover': {
            backgroundColor: 'rgba(255,255,255,0.3)',
            transform: 'translateY(-1px)',
        },
    },
    quickFilterChipActive: {
        backgroundColor: 'rgba(255,255,255,0.95)',
        color: '#667eea',
        fontWeight: tokens.fontWeightSemibold,
    },
    // Advanced Filters Card
    advancedFiltersCard: {
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: tokens.borderRadiusLarge,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        marginBottom: tokens.spacingVerticalL,
        overflow: 'hidden',
        boxShadow: tokens.shadow4,
    },
    advancedFiltersHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: tokens.spacingHorizontalM,
        backgroundColor: tokens.colorNeutralBackground2,
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground3,
        },
    },
    advancedFiltersTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        fontSize: tokens.fontSizeBase300,
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground1,
    },
    advancedFiltersBody: {
        padding: tokens.spacingHorizontalL,
    },
    filterGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: tokens.spacingHorizontalM,
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
        },
    },
    filterField: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXS,
    },
    filterLabel: {
        fontSize: tokens.fontSizeBase200,
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground2,
    },
    filterActions: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
        justifyContent: 'flex-end',
        marginTop: tokens.spacingVerticalL,
        paddingTop: tokens.spacingVerticalM,
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    // Results Section
    resultsSection: {
        marginTop: tokens.spacingVerticalL,
    },
    resultsHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: tokens.spacingVerticalM,
    },
    resultsCount: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        fontSize: tokens.fontSizeBase300,
        color: tokens.colorNeutralForeground2,
    },
    resultsActions: {
        display: 'flex',
        gap: tokens.spacingHorizontalS,
    },
    resultsCard: {
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: tokens.borderRadiusLarge,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        overflow: 'hidden',
        boxShadow: tokens.shadow4,
    },
    tableContainer: {
        overflowX: 'auto',
        '@media (max-width: 768px)': {
            overflowX: 'visible',
        },
    },
    table: {
        '@media (max-width: 768px)': {
            display: 'none',
        },
    },
    // Hide on tablet (< 1024px)
    hideOnTablet: {
        '@media (max-width: 1024px)': {
            display: 'none',
        },
    },
    // Hide on small tablet (< 900px)
    hideOnSmallTablet: {
        '@media (max-width: 900px)': {
            display: 'none',
        },
    },
    tableRow: {
        transition: 'background-color 0.15s ease',
        ':hover': {
            backgroundColor: tokens.colorNeutralBackground2,
        },
    },
    permitNumber: {
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorBrandForeground1,
        cursor: 'pointer',
        ':hover': {
            textDecoration: 'underline',
        },
    },
    descriptionCell: {
        maxWidth: '250px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    actionButtons: {
        display: 'flex',
        gap: tokens.spacingHorizontalXS,
    },
    // Empty State
    emptyState: {
        textAlign: 'center',
        padding: tokens.spacingVerticalXXL,
    },
    emptyStateIcon: {
        fontSize: '64px',
        color: tokens.colorNeutralForeground4,
        marginBottom: tokens.spacingVerticalM,
    },
    emptyStateTitle: {
        fontSize: tokens.fontSizeBase500,
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground1,
        marginBottom: tokens.spacingVerticalS,
    },
    emptyStateDescription: {
        fontSize: tokens.fontSizeBase300,
        color: tokens.colorNeutralForeground3,
        maxWidth: '400px',
        margin: '0 auto',
    },
    // Loading State
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: tokens.spacingVerticalXXL,
        gap: tokens.spacingVerticalM,
    },
    // Search History / Suggestions
    searchSuggestions: {
        marginTop: tokens.spacingVerticalL,
        padding: tokens.spacingHorizontalL,
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: tokens.borderRadiusLarge,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
    },
    suggestionTitle: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
        marginBottom: tokens.spacingVerticalS,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
    },
    suggestionChips: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: tokens.spacingHorizontalS,
    },
    suggestionChip: {
        backgroundColor: tokens.colorNeutralBackground3,
        padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
        borderRadius: tokens.borderRadiusMedium,
        fontSize: tokens.fontSizeBase200,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
            backgroundColor: tokens.colorBrandBackground2,
            color: tokens.colorBrandForeground1,
        },
    },
    // Stats Row
    statsRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: tokens.spacingHorizontalM,
        marginBottom: tokens.spacingVerticalL,
        '@media (max-width: 600px)': {
            gridTemplateColumns: 'repeat(2, 1fr)',
        },
    },
    statCard: {
        backgroundColor: tokens.colorNeutralBackground1,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingHorizontalM,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalS,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ':hover': {
            boxShadow: tokens.shadow8,
            transform: 'translateY(-2px)',
        },
    },
    statCardActive: {
        border: `1px solid ${tokens.colorBrandStroke1}`,
        backgroundColor: tokens.colorBrandBackground2,
    },
    statIcon: {
        width: '36px',
        height: '36px',
        borderRadius: tokens.borderRadiusMedium,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '18px',
    },
    statInfo: {
        display: 'flex',
        flexDirection: 'column',
    },
    statValue: {
        fontSize: tokens.fontSizeBase400,
        fontWeight: tokens.fontWeightBold,
        lineHeight: 1.2,
    },
    statLabel: {
        fontSize: tokens.fontSizeBase100,
        color: tokens.colorNeutralForeground3,
    },
    // Pagination
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
        padding: tokens.spacingVerticalL,
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
        flexWrap: 'wrap',
    },
    // Mobile Card List
    mobileCardList: {
        display: 'none',
        '@media (max-width: 768px)': {
            display: 'flex',
            flexDirection: 'column',
            gap: tokens.spacingVerticalS,
        },
    },
    mobileCard: {
        padding: tokens.spacingHorizontalM,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground2,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalS,
    },
    mobileCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: tokens.spacingHorizontalS,
    },
    mobileCardTitle: {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        flex: 1,
    },
    mobileCardBody: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXS,
    },
    mobileCardRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: tokens.fontSizeBase200,
    },
    mobileCardLabel: {
        color: tokens.colorNeutralForeground3,
        fontWeight: tokens.fontWeightSemibold,
        minWidth: '80px',
    },
    mobileCardValue: {
        color: tokens.colorNeutralForeground1,
        textAlign: 'right' as const,
        flex: 1,
    },
    mobileCardFooter: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: tokens.spacingHorizontalXS,
        marginTop: tokens.spacingVerticalXS,
        paddingTop: tokens.spacingVerticalS,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    },
});

interface SearchFilters {
    query: string;
    permitNumber: string;
    protocolNumber: string;
    status: string;
    permitType: string;
    fromDate: string;
    toDate: string;
    createdBy: string;
}

const initialFilters: SearchFilters = {
    query: '',
    permitNumber: '',
    protocolNumber: '',
    status: '',
    permitType: '',
    fromDate: '',
    toDate: '',
    createdBy: '',
};

const statusOptions = [
    { key: '', text: 'All Statuses', icon: <DocumentBulletList24Regular />, color: '#6c757d' },
    { key: 'Draft', text: 'Draft', icon: <Clock24Regular />, color: '#6c757d' },
    { key: 'Pending_Execution', text: 'Pending Execution', icon: <Warning24Regular />, color: '#ffc107' },
    { key: 'Pending_Issuer', text: 'Pending Issuer', icon: <Warning24Regular />, color: '#17a2b8' },
    { key: 'Approved', text: 'Approved', icon: <CheckmarkCircle24Regular />, color: '#28a745' },
    { key: 'Returned', text: 'Returned', icon: <ArrowSync24Regular />, color: '#dc3545' },
    { key: 'Closed', text: 'Closed', icon: <DismissCircle24Regular />, color: '#6c757d' },
    { key: 'Cancelled', text: 'Cancelled', icon: <DismissCircle24Regular />, color: '#dc3545' },
];

const permitTypeOptions = [
    { key: '', text: 'All Types' },
    { key: 'general', text: 'General Work Permit' },
    { key: 'height', text: 'Height Work Permit' },
    { key: 'electrical', text: 'Electrical Work' },
    { key: 'hot_work', text: 'Hot Work' },
    { key: 'confined_space', text: 'Confined Space' },
];

const quickFilters = [
    { key: 'Approved', label: 'Approved', icon: <CheckmarkCircle24Regular /> },
    { key: 'Pending_Execution', label: 'Pending Exec', icon: <Warning24Regular /> },
    { key: 'Pending_Issuer', label: 'Pending Issuer', icon: <Warning24Regular /> },
    { key: 'Draft', label: 'Drafts', icon: <Clock24Regular /> },
];

const recentSearches = [
    'Electrical permits this month',
    'Approved height work',
    'Pending execution',
];

export const SearchPage: React.FC = () => {
    const styles = useStyles();
    const navigate = useNavigate();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [filters, setFilters] = useState<SearchFilters>(initialFilters);
    const [results, setResults] = useState<PermitSummary[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [totalResults, setTotalResults] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);

    // Stats for quick filter counts
    const [stats, setStats] = useState({
        total: 0,
        Draft: 0,
        Pending_Execution: 0,
        Pending_Issuer: 0,
        Approved: 0,
        Returned: 0,
        Closed: 0,
    });

    // Fetch initial stats
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await getAllPermits(null, null, 1, 1);
                const pagination = (response.data as any)?.pagination || response.data?.pagination;
                if (pagination) {
                    setStats(prev => ({ ...prev, total: pagination.total || 0 }));
                }
            } catch {
                // Silently fail
            }
        };
        fetchStats();
    }, []);

    // Debounced search function
    const performSearch = useCallback(async (searchFilters: SearchFilters, page = 1) => {
        try {
            setIsSearching(true);
            setHasSearched(true);

            const searchParams: Record<string, string> = {};

            // Build search params
            if (searchFilters.query) {
                searchParams.search = searchFilters.query;
            }
            if (searchFilters.permitNumber) {
                searchParams.permitNumber = searchFilters.permitNumber;
            }
            if (searchFilters.protocolNumber) {
                searchParams.protocolNumber = searchFilters.protocolNumber;
            }
            if (searchFilters.status) {
                searchParams.status = searchFilters.status;
            }
            if (searchFilters.permitType) {
                searchParams.permitType = searchFilters.permitType;
            }
            if (searchFilters.fromDate) {
                searchParams.fromDate = searchFilters.fromDate;
            }
            if (searchFilters.toDate) {
                searchParams.toDate = searchFilters.toDate;
            }

            // Use searchPermits with filters, fallback to getAllPermits
            let response;
            if (Object.keys(searchParams).length > 0) {
                response = await searchPermits({ ...searchParams, page: page.toString(), limit: '10' } as any);
            } else {
                response = await getAllPermits(null, null, page, 10);
            }

            const responseData = response.data as any;
            const data = responseData?.data || responseData?.permits || [];
            const pagination = responseData?.pagination;

            setResults(data);
            setTotalResults(pagination?.total || data.length);
            setTotalPages(pagination?.totalPages || Math.ceil((pagination?.total || data.length) / 10));
            setCurrentPage(page);
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Search failed. Please try again.');
            setResults([]);
            setTotalResults(0);
        } finally {
            setIsSearching(false);
        }
    }, []);

    // Handle main search input change with debounce
    const handleSearchInputChange = (value: string) => {
        setFilters(prev => ({ ...prev, query: value }));

        // Clear existing debounce
        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        // Debounce search
        debounceRef.current = setTimeout(() => {
            if (value.trim().length >= 2 || value.trim().length === 0) {
                performSearch({ ...filters, query: value });
            }
        }, 500);
    };

    // Handle quick filter click
    const handleQuickFilterClick = (statusKey: string) => {
        if (activeQuickFilter === statusKey) {
            // Deselect
            setActiveQuickFilter(null);
            setFilters(prev => ({ ...prev, status: '' }));
            performSearch({ ...filters, status: '' });
        } else {
            // Select
            setActiveQuickFilter(statusKey);
            setFilters(prev => ({ ...prev, status: statusKey }));
            performSearch({ ...filters, status: statusKey });
        }
    };

    // Handle filter change
    const handleFilterChange = (field: keyof SearchFilters, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // Apply advanced filters
    const handleApplyFilters = () => {
        setActiveQuickFilter(filters.status || null);
        performSearch(filters);
    };

    // Clear all filters
    const handleClearFilters = () => {
        setFilters(initialFilters);
        setActiveQuickFilter(null);
        setResults([]);
        setHasSearched(false);
        setTotalResults(0);
    };

    // Handle search button click
    const handleSearchClick = () => {
        performSearch(filters);
    };

    // Handle page change
    const handlePageChange = (newPage: number) => {
        performSearch(filters, newPage);
    };

    // View permit details
    const handleViewPermit = (permitId: string) => {
        navigate(`/permits?view=${permitId}`);
    };

    // Get status badge
    const getStatusBadge = (status: string) => {
        const statusConfig = statusOptions.find(s => s.key === status);
        const color: 'success' | 'warning' | 'danger' | 'informative' =
            status === 'Approved' ? 'success' :
                status.includes('Pending') ? 'warning' :
                    status === 'Returned' || status === 'Cancelled' ? 'danger' :
                        'informative';

        return (
            <Badge appearance="filled" color={color}>
                {statusConfig?.text || PERMIT_STATUS_LABELS[status.toLowerCase()] || status.replace(/_/g, ' ')}
            </Badge>
        );
    };

    // Focus search input on mount
    useEffect(() => {
        searchInputRef.current?.focus();
    }, []);

    return (
        <div className={styles.container}>
            {/* Hero Section with Main Search */}
            <div className={styles.heroSection}>
                <div className={styles.heroPattern} />
                <div className={styles.heroContent}>
                    <div className={styles.heroTitle}>
                        <Sparkle24Regular />
                        Advanced Permit Search
                    </div>
                    <div className={styles.heroSubtitle}>
                        Find permits quickly by number, status, type, or date range
                    </div>

                    {/* Main Search Input */}
                    <div className={styles.mainSearchContainer}>
                        <Search24Filled className={styles.searchIcon} />
                        <Input
                            ref={searchInputRef}
                            className={styles.mainSearchInput}
                            placeholder="Search by permit number, protocol, description..."
                            value={filters.query}
                            onChange={(_, data) => handleSearchInputChange(data.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                        />
                        <Button
                            className={styles.searchButton}
                            appearance="primary"
                            onClick={handleSearchClick}
                            disabled={isSearching}
                            icon={isSearching ? <Spinner size="tiny" /> : <Search24Regular />}
                        >
                            Search
                        </Button>
                    </div>

                    {/* Quick Filters */}
                    <div className={styles.quickFiltersSection}>
                        <span className={styles.quickFilterLabel}>Quick filters:</span>
                        {quickFilters.map((filter) => (
                            <div
                                key={filter.key}
                                className={mergeClasses(
                                    styles.quickFilterChip,
                                    activeQuickFilter === filter.key && styles.quickFilterChipActive
                                )}
                                onClick={() => handleQuickFilterClick(filter.key)}
                            >
                                {filter.icon}
                                {filter.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className={styles.statsRow}>
                <div
                    className={mergeClasses(styles.statCard, !activeQuickFilter && styles.statCardActive)}
                    onClick={() => { setActiveQuickFilter(null); setFilters(prev => ({ ...prev, status: '' })); performSearch({ ...filters, status: '' }); }}
                >
                    <div className={styles.statIcon} style={{ backgroundColor: '#0078d415', color: '#0078d4' }}>
                        <DocumentBulletList24Regular />
                    </div>
                    <div className={styles.statInfo}>
                        <Text className={styles.statValue} style={{ color: '#0078d4' }}>{stats.total}</Text>
                        <Text className={styles.statLabel}>All Permits</Text>
                    </div>
                </div>
                {statusOptions.slice(1, 6).map((status) => (
                    <div
                        key={status.key}
                        className={mergeClasses(styles.statCard, activeQuickFilter === status.key && styles.statCardActive)}
                        onClick={() => handleQuickFilterClick(status.key)}
                    >
                        <div className={styles.statIcon} style={{ backgroundColor: `${status.color}15`, color: status.color }}>
                            {status.icon}
                        </div>
                        <div className={styles.statInfo}>
                            <Text className={styles.statValue} style={{ color: status.color }}>
                                {(stats as any)[status.key] || '-'}
                            </Text>
                            <Text className={styles.statLabel}>{status.text}</Text>
                        </div>
                    </div>
                ))}
            </div>

            {/* Advanced Filters */}
            <div className={styles.advancedFiltersCard}>
                <div
                    className={styles.advancedFiltersHeader}
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                    <div className={styles.advancedFiltersTitle}>
                        <Filter24Regular />
                        Advanced Filters
                        {(filters.permitNumber || filters.protocolNumber || filters.fromDate || filters.toDate || filters.permitType) && (
                            <Badge appearance="filled" color="brand" size="small">Active</Badge>
                        )}
                    </div>
                    {showAdvancedFilters ? <ChevronUp24Regular /> : <ChevronDown24Regular />}
                </div>

                {showAdvancedFilters && (
                    <div className={styles.advancedFiltersBody}>
                        <div className={styles.filterGrid}>
                            <div className={styles.filterField}>
                                <Text className={styles.filterLabel}>Permit Number</Text>
                                <Input
                                    placeholder="e.g., GWP-2026-001"
                                    value={filters.permitNumber}
                                    onChange={(_, data) => handleFilterChange('permitNumber', data.value)}
                                />
                            </div>

                            <div className={styles.filterField}>
                                <Text className={styles.filterLabel}>Protocol Number</Text>
                                <Input
                                    placeholder="e.g., PROTO-001"
                                    value={filters.protocolNumber}
                                    onChange={(_, data) => handleFilterChange('protocolNumber', data.value)}
                                />
                            </div>

                            <div className={styles.filterField}>
                                <Text className={styles.filterLabel}>Status</Text>
                                <Dropdown
                                    placeholder="Select status"
                                    value={statusOptions.find((s) => s.key === filters.status)?.text ?? 'All Statuses'}
                                    onOptionSelect={(_, data) => handleFilterChange('status', data.optionValue as string)}
                                >
                                    {statusOptions.map((option) => (
                                        <Option key={option.key} value={option.key}>
                                            {option.text}
                                        </Option>
                                    ))}
                                </Dropdown>
                            </div>

                            <div className={styles.filterField}>
                                <Text className={styles.filterLabel}>Permit Type</Text>
                                <Dropdown
                                    placeholder="Select type"
                                    value={permitTypeOptions.find((t) => t.key === filters.permitType)?.text ?? 'All Types'}
                                    onOptionSelect={(_, data) => handleFilterChange('permitType', data.optionValue as string)}
                                >
                                    {permitTypeOptions.map((option) => (
                                        <Option key={option.key} value={option.key}>
                                            {option.text}
                                        </Option>
                                    ))}
                                </Dropdown>
                            </div>

                            <div className={styles.filterField}>
                                <Text className={styles.filterLabel}>
                                    <CalendarLtr24Regular style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                    From Date
                                </Text>
                                <Input
                                    type="date"
                                    value={filters.fromDate}
                                    onChange={(_, data) => handleFilterChange('fromDate', data.value)}
                                />
                            </div>

                            <div className={styles.filterField}>
                                <Text className={styles.filterLabel}>
                                    <CalendarLtr24Regular style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                    To Date
                                </Text>
                                <Input
                                    type="date"
                                    value={filters.toDate}
                                    onChange={(_, data) => handleFilterChange('toDate', data.value)}
                                />
                            </div>
                        </div>

                        <div className={styles.filterActions}>
                            <Button
                                icon={<FilterDismiss24Regular />}
                                appearance="subtle"
                                onClick={handleClearFilters}
                            >
                                Clear All
                            </Button>
                            <Button
                                icon={<Search24Regular />}
                                appearance="primary"
                                onClick={handleApplyFilters}
                                disabled={isSearching}
                            >
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Results Section */}
            {hasSearched && (
                <div className={styles.resultsSection}>
                    <div className={styles.resultsHeader}>
                        <div className={styles.resultsCount}>
                            <Info24Regular />
                            Found <strong>{totalResults}</strong> permit{totalResults !== 1 ? 's' : ''}
                            {filters.query && ` matching "${filters.query}"`}
                            {filters.status && ` with status "${statusOptions.find(s => s.key === filters.status)?.text}"`}
                        </div>
                        {results.length > 0 && (
                            <div className={styles.resultsActions}>
                                <Button
                                    icon={<ArrowSync24Regular />}
                                    appearance="subtle"
                                    onClick={() => performSearch(filters, currentPage)}
                                    disabled={isSearching}
                                >
                                    Refresh
                                </Button>
                            </div>
                        )}
                    </div>

                    <Card className={styles.resultsCard}>
                        {isSearching ? (
                            <div className={styles.loadingContainer}>
                                <Spinner size="large" />
                                <Text>Searching permits...</Text>
                            </div>
                        ) : results.length === 0 ? (
                            <div className={styles.emptyState}>
                                <Search24Regular className={styles.emptyStateIcon} />
                                <div className={styles.emptyStateTitle}>No permits found</div>
                                <div className={styles.emptyStateDescription}>
                                    Try adjusting your search criteria or filters to find what you're looking for.
                                </div>
                                <Button
                                    appearance="primary"
                                    style={{ marginTop: tokens.spacingVerticalL }}
                                    onClick={handleClearFilters}
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className={styles.tableContainer}>
                                    {/* Desktop Table View */}
                                    <Table className={styles.table}>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHeaderCell>Permit #</TableHeaderCell>
                                                <TableHeaderCell className={styles.hideOnSmallTablet}>Protocol #</TableHeaderCell>
                                                <TableHeaderCell className={styles.hideOnSmallTablet}>Type</TableHeaderCell>
                                                <TableHeaderCell className={styles.hideOnTablet}>Description</TableHeaderCell>
                                                <TableHeaderCell>Status</TableHeaderCell>
                                                <TableHeaderCell className={styles.hideOnTablet}>Created</TableHeaderCell>
                                                <TableHeaderCell>Actions</TableHeaderCell>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {results.map((permit: any) => (
                                                <TableRow key={permit._id} className={styles.tableRow}>
                                                    <TableCell>
                                                        <TableCellLayout>
                                                            <Text
                                                                className={styles.permitNumber}
                                                                onClick={() => handleViewPermit(permit._id)}
                                                            >
                                                                {permit.permitNumber || 'N/A'}
                                                            </Text>
                                                        </TableCellLayout>
                                                    </TableCell>
                                                    <TableCell className={styles.hideOnSmallTablet}>
                                                        <TableCellLayout>
                                                            {permit.protocolNumber || 'N/A'}
                                                        </TableCellLayout>
                                                    </TableCell>
                                                    <TableCell className={styles.hideOnSmallTablet}>
                                                        <TableCellLayout>
                                                            <Badge appearance="outline">
                                                                {permit.permitType === 'height' ? 'Height' : 'General'}
                                                            </Badge>
                                                        </TableCellLayout>
                                                    </TableCell>
                                                    <TableCell className={styles.hideOnTablet}>
                                                        <TableCellLayout className={styles.descriptionCell}>
                                                            <Tooltip
                                                                content={permit.initiator?.briefDescriptionOfWork || permit.jobDescription || 'N/A'}
                                                                relationship="label"
                                                            >
                                                                <span>
                                                                    {permit.initiator?.briefDescriptionOfWork || permit.jobDescription || 'N/A'}
                                                                </span>
                                                            </Tooltip>
                                                        </TableCellLayout>
                                                    </TableCell>
                                                    <TableCell>
                                                        <TableCellLayout>
                                                            {getStatusBadge(permit.permitStatus || permit.status || 'Unknown')}
                                                        </TableCellLayout>
                                                    </TableCell>
                                                    <TableCell className={styles.hideOnTablet}>
                                                        <TableCellLayout>
                                                            {permit.createdAt
                                                                ? new Date(permit.createdAt).toLocaleDateString()
                                                                : 'N/A'}
                                                        </TableCellLayout>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className={styles.actionButtons}>
                                                            <Tooltip content="View Details" relationship="label">
                                                                <Button
                                                                    icon={<Eye24Regular />}
                                                                    appearance="subtle"
                                                                    size="small"
                                                                    onClick={() => handleViewPermit(permit._id)}
                                                                />
                                                            </Tooltip>
                                                            {['Approved', 'Closed'].includes(permit.permitStatus || permit.status) && (
                                                                <Tooltip content="Download PDF" relationship="label">
                                                                    <Button
                                                                        icon={<DocumentArrowDown24Regular />}
                                                                        appearance="subtle"
                                                                        size="small"
                                                                    />
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>

                                    {/* Mobile Card View */}
                                    <div className={styles.mobileCardList}>
                                        {results.map((permit: any) => (
                                            <div key={permit._id} className={styles.mobileCard}>
                                                <div className={styles.mobileCardHeader}>
                                                    <div className={styles.mobileCardTitle}>
                                                        <Text
                                                            weight="semibold"
                                                            size={400}
                                                            className={styles.permitNumber}
                                                            onClick={() => handleViewPermit(permit._id)}
                                                        >
                                                            {permit.permitNumber || 'N/A'}
                                                        </Text>
                                                        {permit.protocolNumber && (
                                                            <Text size={200} style={{ color: tokens.colorNeutralForeground3 }}>
                                                                {permit.protocolNumber}
                                                            </Text>
                                                        )}
                                                    </div>
                                                    {getStatusBadge(permit.permitStatus || permit.status || 'Unknown')}
                                                </div>

                                                <div className={styles.mobileCardBody}>
                                                    <div className={styles.mobileCardRow}>
                                                        <Text className={styles.mobileCardLabel}>Type</Text>
                                                        <Badge appearance="outline" size="small">
                                                            {permit.permitType === 'height' ? 'Height' : 'General'}
                                                        </Badge>
                                                    </div>
                                                    <div className={styles.mobileCardRow}>
                                                        <Text className={styles.mobileCardLabel}>Description</Text>
                                                        <Text className={styles.mobileCardValue} style={{ maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {permit.initiator?.briefDescriptionOfWork || permit.jobDescription || 'N/A'}
                                                        </Text>
                                                    </div>
                                                    <div className={styles.mobileCardRow}>
                                                        <Text className={styles.mobileCardLabel}>Created</Text>
                                                        <Text className={styles.mobileCardValue}>
                                                            {permit.createdAt ? new Date(permit.createdAt).toLocaleDateString() : 'N/A'}
                                                        </Text>
                                                    </div>
                                                </div>

                                                <div className={styles.mobileCardFooter}>
                                                    <Tooltip content="View Details" relationship="label">
                                                        <Button
                                                            icon={<Eye24Regular />}
                                                            appearance="subtle"
                                                            size="small"
                                                            onClick={() => handleViewPermit(permit._id)}
                                                        />
                                                    </Tooltip>
                                                    {['Approved', 'Closed'].includes(permit.permitStatus || permit.status) && (
                                                        <Tooltip content="Download PDF" relationship="label">
                                                            <Button
                                                                icon={<DocumentArrowDown24Regular />}
                                                                appearance="subtle"
                                                                size="small"
                                                            />
                                                        </Tooltip>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className={styles.pagination}>
                                        <Button
                                            appearance="subtle"
                                            disabled={currentPage === 1 || isSearching}
                                            onClick={() => handlePageChange(currentPage - 1)}
                                        >
                                            Previous
                                        </Button>
                                        <Text>
                                            Page {currentPage} of {totalPages}
                                        </Text>
                                        <Button
                                            appearance="subtle"
                                            disabled={currentPage === totalPages || isSearching}
                                            onClick={() => handlePageChange(currentPage + 1)}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </Card>
                </div>
            )}

            {/* Initial State - Search Suggestions */}
            {!hasSearched && (
                <div className={styles.searchSuggestions}>
                    <div className={styles.suggestionTitle}>
                        <History24Regular />
                        Try searching for:
                    </div>
                    <div className={styles.suggestionChips}>
                        {recentSearches.map((suggestion, index) => (
                            <div
                                key={index}
                                className={styles.suggestionChip}
                                onClick={() => {
                                    setFilters(prev => ({ ...prev, query: suggestion }));
                                    performSearch({ ...filters, query: suggestion });
                                }}
                            >
                                {suggestion}
                            </div>
                        ))}
                        <div
                            className={styles.suggestionChip}
                            onClick={() => performSearch(filters)}
                        >
                            Show all permits
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchPage;
