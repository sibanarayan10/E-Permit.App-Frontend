/**
 * Login Page - Using Fluent UI components with minimal CSS
 */

import React, { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    makeStyles,
    tokens,
    Card,
    Text,
    Input,
    Label,
    Button,
    Checkbox,
    Spinner,
} from '@fluentui/react-components';
import { Mail24Regular, LockClosed24Regular, Eye24Regular} from '@fluentui/react-icons';
import { useUser } from '@/context';
import { loginUser } from '@/services';
import toast from 'react-hot-toast';
import sailLogo from '@/assets/Sail_Logo.jpeg';

const useStyles = makeStyles({
    page: {
        position: 'fixed',
        inset: '0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
        overflow: 'hidden',
    },
    headerBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '50vh',
        background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
        borderRadius: '0 0 50% 50% / 0 0 80px 80px',
    },
    card: {
        position: 'relative',
        width: '100%',
        maxWidth: '400px',
        padding: tokens.spacingHorizontalXL,
        borderRadius: tokens.borderRadiusXLarge,
        zIndex: 1,
        maxHeight: '90vh',
        overflowY: 'auto',
    },
    logoWrapper: {
        display: 'flex',
        justifyContent: 'center',
        marginBottom: tokens.spacingVerticalM,
    },
    logo: {
        width: '70px',
        height: '70px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '3px solid #fff',
        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
    },
    title: {
        textAlign: 'center',
        fontSize: tokens.fontSizeBase600,
        fontWeight: tokens.fontWeightBold,
        marginBottom: tokens.spacingVerticalXS,
    },
    subtitle: {
        textAlign: 'center',
        color: tokens.colorNeutralForeground3,
        marginBottom: tokens.spacingVerticalM,
    },

    /* ── Demo Credentials Banner ── */
    demoBanner: {
        marginBottom: tokens.spacingVerticalM,
        borderRadius: tokens.borderRadiusMedium,
        border: '1.5px dashed #818cf8',
        background: 'linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%)',
        padding: '10px 14px',
        cursor: 'pointer',
        transition: 'box-shadow 0.18s ease, transform 0.18s ease',
        ':hover': {
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.18)',
            transform: 'translateY(-1px)',
        },
        ':active': {
            transform: 'translateY(0)',
        },
    },
    demoBannerHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '6px',
    },
    demoBadge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
        color: '#fff',
        fontSize: '10px',
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        padding: '2px 8px',
        borderRadius: '20px',
    },
    demoHint: {
        fontSize: '10px',
        color: '#6366f1',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: '3px',
    },
    demoRow: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '2px',
    },
    demoLabel: {
        fontSize: '10px',
        color: '#6b7280',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        minWidth: '62px',
    },
    demoValue: {
        fontSize: '12px',
        color: '#3730a3',
        fontWeight: 700,
        fontFamily: 'monospace',
        background: 'rgba(99, 102, 241, 0.08)',
        padding: '1px 7px',
        borderRadius: '4px',
        letterSpacing: '0.02em',
    },

    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalM,
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: tokens.spacingVerticalXS,
    },
    optionsRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    forgotLink: {
        color: '#6366f1',
        textDecoration: 'none',
        fontSize: tokens.fontSizeBase200,
        ':hover': { textDecoration: 'underline' },
    },
    submitBtn: {
        marginTop: tokens.spacingVerticalM,
        background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
        ':hover': { opacity: 0.9 },
    },
    footer: {
        textAlign: 'center',
        marginTop: tokens.spacingVerticalL,
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
    },
    contactLink: {
        color: tokens.colorNeutralForeground1,
        fontWeight: tokens.fontWeightSemibold,
        textDecoration: 'none',
    },
});

const DEMO_EMAIL = 'demo01@gmail.com';
const DEMO_PASSWORD = 'demo123';

const Login: React.FC = () => {
    const styles = useStyles();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { setUserData } = useUser();

    /** Fill form fields with demo credentials on banner click */
    const handleDemoFill = () => {
        setEmail(DEMO_EMAIL);
        setPassword(DEMO_PASSWORD);
        toast.success('Demo credentials filled!', { icon: '🎉', duration: 2000 });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error('Please enter both email and password');
            return;
        }

        setIsLoading(true);
        try {
            const response = await loginUser(email, password);

            if (rememberMe) {
                localStorage.setItem('loginPreference', 'local');
            } else {
                sessionStorage.setItem('loginPreference', 'session');
            }

            setUserData(response.data);
            toast.success('Login successful!');
            navigate('/dashboard');
        } catch (error: any) {
            toast.error(error.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.headerBg} />

            <Card className={styles.card}>
                <div className={styles.logoWrapper}>
                    <img src={sailLogo} alt="SAIL Logo" className={styles.logo} />
                </div>

                <Text as="h2" className={styles.title}>Welcome Back</Text>
                <Text className={styles.subtitle}>Sign in to your e-PTW account</Text>

                {/* ── Demo Credentials Banner ── */}
                <div
                    className={styles.demoBanner}
                    onClick={handleDemoFill}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleDemoFill()}
                    title="Click to auto-fill demo credentials"
                >
                    <div className={styles.demoBannerHeader}>
                        <span className={styles.demoBadge}>
                            🎯 &nbsp;Demo Access
                        </span>
                        <span className={styles.demoHint}>
                            <Eye24Regular style={{ width: 12, height: 12 }} />
                            Click to auto-fill
                        </span>
                    </div>

                    <div className={styles.demoRow}>
                        <span className={styles.demoLabel}>Email</span>
                        <span className={styles.demoValue}>{DEMO_EMAIL}</span>
                    </div>
                    <div className={styles.demoRow}>
                        <span className={styles.demoLabel}>Password</span>
                        <span className={styles.demoValue}>{DEMO_PASSWORD}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <Label htmlFor="email" required>Email Address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(_, data) => setEmail(data.value)}
                            placeholder="Enter your email"
                            contentBefore={<Mail24Regular />}
                            disabled={isLoading}
                            size="large"
                        />
                    </div>

                    <div className={styles.field}>
                        <Label htmlFor="password" required>Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(_, data) => setPassword(data.value)}
                            placeholder="Enter your password"
                            contentBefore={<LockClosed24Regular />}
                            disabled={isLoading}
                            size="large"
                        />
                    </div>

                    <div className={styles.optionsRow}>
                        <Checkbox
                            checked={rememberMe}
                            onChange={(_, data) => setRememberMe(data.checked === true)}
                            label="Keep me logged in"
                            disabled={isLoading}
                        />
                        <Link to="/forgot-password" className={styles.forgotLink}>
                            Forgot Password?
                        </Link>
                    </div>

                    <Button
                        appearance="primary"
                        type="submit"
                        size="large"
                        disabled={isLoading}
                        className={styles.submitBtn}
                        icon={isLoading ? <Spinner size="tiny" /> : undefined}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </Button>

                    <Text className={styles.footer}>
                        Don't have an account?{' '}
                        <a href="#" className={styles.contactLink}>Contact administrator</a>
                    </Text>
                </form>
            </Card>
        </div>
    );
};

export default Login;