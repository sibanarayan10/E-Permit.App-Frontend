/**
 * Data Request Verification Page
 * OTP verification flow similar to Forgot Password page
 */

import React, { useState, useEffect, type FormEvent } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
    makeStyles,
    tokens,
    Card,
    Text,
    Button,
    Spinner,
    Dropdown,
    Option,
    Input,
    Label,
    MessageBar,
    MessageBarBody,
} from '@fluentui/react-components';
import {
    Mail24Regular,
    Phone24Regular,
    Shield24Regular,
    Checkmark24Regular,
    LockClosed24Regular,
} from '@fluentui/react-icons';
import {
    verifySecureToken,
    requestOtp,
    verifyOtp,
    type TokenVerifyResponse,
    type OtpVerifyResponse,
} from '@/services';
import sailLogo from '@/assets/Sail_Logo.jpeg';
import toast from 'react-hot-toast';

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
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
        borderRadius: '0 0 50% 50% / 0 0 80px 80px',
    },
    card: {
        position: 'relative',
        width: '100%',
        maxWidth: '450px',
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
        boxShadow: '0 4px 15px rgba(30, 58, 95, 0.4)',
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
        background: 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)',
    },
    infoBox: {
        padding: tokens.spacingHorizontalM,
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: tokens.borderRadiusMedium,
        marginBottom: tokens.spacingVerticalM,
    },
    infoLabel: {
        color: tokens.colorNeutralForeground3,
        fontSize: tokens.fontSizeBase200,
    },
    infoValue: {
        fontWeight: tokens.fontWeightSemibold,
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
    otpInput: {
        textAlign: 'center',
        fontSize: tokens.fontSizeBase500,
        letterSpacing: '8px',
    },
    loadingContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: tokens.spacingVerticalXXL,
    },
});

type Step = 'loading' | 'select-method' | 'enter-otp' | 'verified' | 'error';

const DataRequestVerifyPage: React.FC = () => {
    const styles = useStyles();
    const { token } = useParams<{ token: string }>();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const type = (searchParams.get('type') as 'executor' | 'issuer') || 'executor';

    const [step, setStep] = useState<Step>('loading');
    const [tokenData, setTokenData] = useState<TokenVerifyResponse | null>(null);
    const [_verifiedData, setVerifiedData] = useState<OtpVerifyResponse | null>(null);
    const [otpMethod, setOtpMethod] = useState<'email' | 'sms'>('email');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Verify token on mount
    useEffect(() => {
        if (token) {
            verifyTokenHandler();
        }
    }, [token]);

    const verifyTokenHandler = async () => {
        try {
            setStep('loading');
            const response = await verifySecureToken(token!, type);
            setTokenData(response.data);
            setStep('select-method');
        } catch (err: any) {
            setError(err.message || 'Invalid or expired link');
            setStep('error');
        }
    };

    const handleRequestOtp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            setLoading(true);
            await requestOtp(token!, type, otpMethod);
            toast.success(`OTP sent via ${otpMethod}`);
            setStep('enter-otp');
        } catch (err: any) {
            toast.error(err.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (otp.length !== 6) {
            toast.error('Please enter a 6-digit OTP');
            return;
        }

        try {
            setLoading(true);
            const response = await verifyOtp(token!, type, otp);
            setVerifiedData(response.data);
            toast.success('OTP verified successfully');
            setStep('verified');

            // Navigate to approval page after short delay
            setTimeout(() => {
                navigate(`/data-request/approve/${response.data.dataRequestId}`, {
                    state: {
                        type,
                        token,
                        user: response.data.user,
                        dataRequestNumber: response.data.dataRequestNumber,
                        permitNumber: response.data.permitNumber,
                        permitType: response.data.permitType,
                    },
                });
            }, 1500);
        } catch (err: any) {
            toast.error(err.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    // Render based on step
    const renderContent = () => {
        switch (step) {
            case 'loading':
                return (
                    <div className={styles.loadingContainer}>
                        <Spinner size="large" />
                        <Text style={{ marginTop: tokens.spacingVerticalM }}>
                            Verifying your link...
                        </Text>
                    </div>
                );

            case 'error':
                return (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: tokens.spacingVerticalL }}>
                            <LockClosed24Regular style={{ fontSize: '48px', color: '#dc3545' }} />
                        </div>
                        <Text as="h2" className={styles.title}>Link Invalid</Text>
                        <MessageBar intent="error">
                            <MessageBarBody>{error}</MessageBarBody>
                        </MessageBar>
                        <Text className={styles.subtitle} style={{ marginTop: tokens.spacingVerticalM }}>
                            This link may have expired or already been used. Please contact the administrator for a new link.
                        </Text>
                    </>
                );

            case 'select-method':
                return (
                    <>
                        <Text as="h2" className={styles.title}>
                            <Shield24Regular style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                            Verify Your Identity
                        </Text>
                        <Text className={styles.subtitle}>
                            Select how you'd like to receive your verification code
                        </Text>

                        {/* Request Info */}
                        <div className={styles.infoBox}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: tokens.spacingHorizontalM }}>
                                <div>
                                    <Text className={styles.infoLabel}>Data Request</Text>
                                    <Text className={styles.infoValue} block>{tokenData?.dataRequestId}</Text>
                                </div>
                                <div>
                                    <Text className={styles.infoLabel}>Permit</Text>
                                    <Text className={styles.infoValue} block>{tokenData?.permitNumber}</Text>
                                </div>
                                <div>
                                    <Text className={styles.infoLabel}>Type</Text>
                                    <Text className={styles.infoValue} block style={{ textTransform: 'capitalize' }}>{tokenData?.permitType}</Text>
                                </div>
                                <div>
                                    <Text className={styles.infoLabel}>Your Role</Text>
                                    <Text className={styles.infoValue} block style={{ textTransform: 'capitalize' }}>{type}</Text>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleRequestOtp} className={styles.form}>
                            <div className={styles.field}>
                                <Label htmlFor="otpMethod" required>Select OTP Delivery Method</Label>
                                <Dropdown
                                    id="otpMethod"
                                    value={otpMethod === 'email' ? 'Email' : 'SMS'}
                                    selectedOptions={[otpMethod]}
                                    onOptionSelect={(_, data) => setOtpMethod(data.optionValue as 'email' | 'sms')}
                                >
                                    <Option value="email" text="Email">
                                        <Mail24Regular style={{ marginRight: '8px' }} />
                                        Email ({tokenData?.user.email})
                                    </Option>
                                    <Option value="sms" text="SMS" disabled={!tokenData?.user.hasPhone}>
                                        <Phone24Regular style={{ marginRight: '8px' }} />
                                        SMS {tokenData?.user.hasPhone ? '' : '(Not available)'}
                                    </Option>
                                </Dropdown>
                            </div>

                            <Button
                                appearance="primary"
                                type="submit"
                                size="large"
                                disabled={loading}
                                className={styles.submitBtn}
                                icon={loading ? <Spinner size="tiny" /> : undefined}
                            >
                                {loading ? 'Sending...' : 'Send OTP'}
                            </Button>
                        </form>
                    </>
                );

            case 'enter-otp':
                return (
                    <>
                        <Text as="h2" className={styles.title}>Enter OTP</Text>
                        <Text className={styles.subtitle}>
                            We've sent a 6-digit code to your {otpMethod === 'email' ? 'email' : 'phone'}
                        </Text>

                        <form onSubmit={handleVerifyOtp} className={styles.form}>
                            <div className={styles.field}>
                                <Label htmlFor="otp" required>Verification Code</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    value={otp}
                                    onChange={(_, data) => setOtp(data.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="000000"
                                    maxLength={6}
                                    size="large"
                                    className={styles.otpInput}
                                    style={{ textAlign: 'center', letterSpacing: '8px' }}
                                />
                            </div>

                            <Button
                                appearance="primary"
                                type="submit"
                                size="large"
                                disabled={loading || otp.length !== 6}
                                className={styles.submitBtn}
                                icon={loading ? <Spinner size="tiny" /> : undefined}
                            >
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </Button>

                            <Button
                                appearance="subtle"
                                onClick={() => setStep('select-method')}
                                disabled={loading}
                            >
                                ← Back to method selection
                            </Button>
                        </form>
                    </>
                );

            case 'verified':
                return (
                    <div className={styles.successContainer}>
                        <div className={styles.successIcon}>
                            <Checkmark24Regular style={{ color: '#fff', fontSize: '32px' }} />
                        </div>
                        <Text as="h2" className={styles.title}>Verified Successfully!</Text>
                        <Text className={styles.subtitle}>
                            Redirecting to approval form...
                        </Text>
                        <Spinner size="medium" />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.headerBg} />

            <Card className={styles.card}>
                <div className={styles.logoWrapper}>
                    <img src={sailLogo} alt="SAIL Logo" className={styles.logo} />
                </div>
                {renderContent()}
            </Card>
        </div>
    );
};

export default DataRequestVerifyPage;
