/**
 * Forgot Password Page - Matching Login page design
 */

import React, { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
    makeStyles,
    tokens,
    Card,
    Text,
    Input,
    Label,
    Button,
    Spinner,
} from '@fluentui/react-components';
import { Mail24Regular, Checkmark24Regular } from '@fluentui/react-icons';
import { forgotPassword } from '@/services';
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
        marginBottom: tokens.spacingVerticalL,
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
    submitBtn: {
        marginTop: tokens.spacingVerticalS,
        background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
    },
    footer: {
        textAlign: 'center',
        marginTop: tokens.spacingVerticalM,
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
    },
    loginLink: {
        color: '#6366f1',
        fontWeight: tokens.fontWeightSemibold,
        textDecoration: 'none',
    },
    successContainer: {
        textAlign: 'center',
        padding: tokens.spacingVerticalL,
    },
    successIcon: {
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        backgroundColor: '#10b981',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        marginBottom: tokens.spacingVerticalM,
    },
    successText: {
        color: tokens.colorNeutralForeground1,
        marginBottom: tokens.spacingVerticalS,
    },
    successSubtext: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
        marginBottom: tokens.spacingVerticalL,
    },
});

const ForgotPassword: React.FC = () => {
    const styles = useStyles();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email address');
            return;
        }

        setIsLoading(true);
        try {
            await forgotPassword(email);
            setIsSubmitted(true);
            toast.success('Password reset link sent!');
        } catch (error: any) {
            toast.error(error.message || 'Failed to send reset link.');
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

                {!isSubmitted ? (
                    <>
                        <Text as="h2" className={styles.title}>Forgot Password?</Text>
                        <Text className={styles.subtitle}>
                            Enter your email and we'll send you a reset link
                        </Text>

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

                            <Button
                                appearance="primary"
                                type="submit"
                                size="large"
                                disabled={isLoading}
                                className={styles.submitBtn}
                                icon={isLoading ? <Spinner size="tiny" /> : undefined}
                            >
                                {isLoading ? 'Sending...' : 'Send Reset Link'}
                            </Button>

                            <Text className={styles.footer}>
                                Remember your password?{' '}
                                <Link to="/login" className={styles.loginLink}>Sign in</Link>
                            </Text>
                        </form>
                    </>
                ) : (
                    <div className={styles.successContainer}>
                        <div className={styles.successIcon}>
                            <Checkmark24Regular style={{ color: '#fff', fontSize: '32px' }} />
                        </div>
                        <Text as="h2" className={styles.title}>Check Your Email</Text>
                        <Text className={styles.successText}>
                            We've sent a password reset link to <strong>{email}</strong>
                        </Text>
                        <Text className={styles.successSubtext}>
                            Please check your inbox and follow the instructions. The link expires in 1 hour.
                        </Text>
                        <Link to="/login">
                            <Button appearance="primary" size="large" className={styles.submitBtn}>
                                Back to Login
                            </Button>
                        </Link>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ForgotPassword;
