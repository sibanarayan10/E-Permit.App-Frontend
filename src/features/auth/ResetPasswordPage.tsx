/**
 * Reset Password Page
 */

import React, { useState, type FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    makeStyles,
    tokens,
    Card,
    Text,
    Input,
    Label,
    Button,
    Spinner,
    MessageBar,
    MessageBarBody,
    MessageBarTitle,
    ProgressBar,
} from '@fluentui/react-components';
import {
    Password24Regular,
    Eye24Regular,
    EyeOff24Regular,
    ArrowLeft24Regular,
    Checkmark24Regular,
} from '@fluentui/react-icons';
import { resetPassword } from '@/services';
import toast from 'react-hot-toast';

const useStyles = makeStyles({
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: tokens.spacingHorizontalL,
        backgroundColor: tokens.colorNeutralBackground2,
    },
    card: {
        width: '100%',
        maxWidth: '420px',
        padding: tokens.spacingHorizontalXL,
    },
    backLink: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXS,
        color: tokens.colorNeutralForeground3,
        textDecoration: 'none',
        fontSize: tokens.fontSizeBase200,
        marginBottom: tokens.spacingVerticalL,
        '&:hover': {
            color: tokens.colorBrandForeground1,
        },
    },
    header: {
        textAlign: 'center',
        marginBottom: tokens.spacingVerticalXL,
    },
    title: {
        fontSize: tokens.fontSizeBase600,
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground1,
        marginBottom: tokens.spacingVerticalXS,
    },
    subtitle: {
        fontSize: tokens.fontSizeBase300,
        color: tokens.colorNeutralForeground3,
    },
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
    inputWrapper: {
        position: 'relative',
    },
    passwordToggle: {
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: 'translateY(-50%)',
        minWidth: 'auto',
        padding: '4px',
    },
    strengthContainer: {
        marginTop: tokens.spacingVerticalXS,
    },
    strengthLabel: {
        fontSize: tokens.fontSizeBase200,
        marginBottom: tokens.spacingVerticalXXS,
    },
    requirements: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
        marginTop: tokens.spacingVerticalXS,
    },
    requirement: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalXS,
        marginBottom: tokens.spacingVerticalXXS,
    },
    requirementMet: {
        color: tokens.colorPaletteGreenForeground1,
    },
    message: {
        marginBottom: tokens.spacingVerticalM,
    },
    submitButton: {
        marginTop: tokens.spacingVerticalM,
    },
    successContainer: {
        textAlign: 'center',
        padding: tokens.spacingVerticalXL,
    },
    successIcon: {
        fontSize: '48px',
        marginBottom: tokens.spacingVerticalM,
    },
});

interface PasswordStrength {
    score: number;
    label: string;
    color: 'brand' | 'success' | 'warning' | 'error';
}

const calculatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { score: 25, label: 'Weak', color: 'error' };
    if (score <= 3) return { score: 50, label: 'Fair', color: 'warning' };
    if (score <= 4) return { score: 75, label: 'Good', color: 'brand' };
    return { score: 100, label: 'Strong', color: 'success' };
};

export const ResetPasswordPage: React.FC = () => {
    const styles = useStyles();
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    const passwordStrength = calculatePasswordStrength(password);

    const requirements = [
        { label: 'At least 8 characters', met: password.length >= 8 },
        { label: 'Contains lowercase letter', met: /[a-z]/.test(password) },
        { label: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
        { label: 'Contains number', met: /[0-9]/.test(password) },
    ];

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');

        if (!password) {
            setError('Password is required');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!token) {
            setError('Invalid reset token');
            return;
        }

        try {
            setIsLoading(true);
            await resetPassword(token, password, confirmPassword);
            setIsSuccess(true);
            toast.success('Password reset successfully!');
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'Failed to reset password';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className={styles.container}>
                <Card className={styles.card}>
                    <div className={styles.successContainer}>
                        <Text className={styles.successIcon}>✅</Text>
                        <Text className={styles.title}>Password Reset!</Text>
                        <Text className={styles.subtitle}>
                            Your password has been successfully reset. You can now login with
                            your new password.
                        </Text>
                        <Button
                            appearance="primary"
                            style={{ marginTop: tokens.spacingVerticalL }}
                            onClick={() => navigate('/login')}
                        >
                            Go to Login
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <Link to="/login" className={styles.backLink}>
                    <ArrowLeft24Regular />
                    Back to Login
                </Link>

                <div className={styles.header}>
                    <Text className={styles.title}>Reset Password</Text>
                    <Text className={styles.subtitle}>
                        Enter your new password below.
                    </Text>
                </div>

                {error && (
                    <MessageBar intent="error" className={styles.message}>
                        <MessageBarBody>
                            <MessageBarTitle>Error</MessageBarTitle>
                            {error}
                        </MessageBarBody>
                    </MessageBar>
                )}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <Label htmlFor="password" required>
                            New Password
                        </Label>
                        <div className={styles.inputWrapper}>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(_, data) => setPassword(data.value)}
                                placeholder="Enter new password"
                                contentBefore={<Password24Regular />}
                                disabled={isLoading}
                                autoComplete="new-password"
                            />
                            <Button
                                className={styles.passwordToggle}
                                appearance="subtle"
                                icon={showPassword ? <EyeOff24Regular /> : <Eye24Regular />}
                                onClick={() => setShowPassword(!showPassword)}
                                type="button"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            />
                        </div>

                        {password && (
                            <div className={styles.strengthContainer}>
                                <Text className={styles.strengthLabel}>
                                    Strength: {passwordStrength.label}
                                </Text>
                                <ProgressBar
                                    value={passwordStrength.score / 100}
                                    color={passwordStrength.color}
                                />
                            </div>
                        )}

                        <div className={styles.requirements}>
                            {requirements.map((req, index) => (
                                <div
                                    key={index}
                                    className={`${styles.requirement} ${req.met ? styles.requirementMet : ''
                                        }`}
                                >
                                    <Checkmark24Regular />
                                    <span>{req.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.field}>
                        <Label htmlFor="confirmPassword" required>
                            Confirm Password
                        </Label>
                        <div className={styles.inputWrapper}>
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(_, data) => setConfirmPassword(data.value)}
                                placeholder="Confirm new password"
                                contentBefore={<Password24Regular />}
                                disabled={isLoading}
                                autoComplete="new-password"
                            />
                            <Button
                                className={styles.passwordToggle}
                                appearance="subtle"
                                icon={
                                    showConfirmPassword ? <EyeOff24Regular /> : <Eye24Regular />
                                }
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                type="button"
                                aria-label={
                                    showConfirmPassword ? 'Hide password' : 'Show password'
                                }
                            />
                        </div>
                    </div>

                    <Button
                        className={styles.submitButton}
                        appearance="primary"
                        type="submit"
                        disabled={isLoading}
                        icon={isLoading ? <Spinner size="tiny" /> : undefined}
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default ResetPasswordPage;
