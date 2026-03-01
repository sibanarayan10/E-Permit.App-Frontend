/**
 * Permit Type Selection Modal
 * Allows user to choose between General Permit and Height Permit
 */

import React from 'react';
import {
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogBody,
    DialogActions,
    DialogContent,
    Button,
    makeStyles,
    tokens,
    Card,
    Text,
} from '@fluentui/react-components';
import {
    Dismiss24Regular,
    DocumentBulletList24Regular,
    BuildingMultiple24Regular,
    Warning24Regular,
    BoxMultiple24Regular,
    ArrowDown24Regular,
} from '@fluentui/react-icons';

const useStyles = makeStyles({
    dialogSurface: {
        maxWidth: '800px',
        width: '90vw',
    },
    cardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: tokens.spacingHorizontalL,
        marginTop: tokens.spacingVerticalL,
    },
    permitCard: {
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        border: `2px solid ${tokens.colorNeutralStroke1}`,
        ':hover': {
            borderTopColor: tokens.colorBrandBackground,
            borderRightColor: tokens.colorBrandBackground,
            borderBottomColor: tokens.colorBrandBackground,
            borderLeftColor: tokens.colorBrandBackground,
            transform: 'translateY(-2px)',
            boxShadow: tokens.shadow8,
        },
    },
    permitCardDisabled: {
        cursor: 'not-allowed',
        opacity: 0.6,
        backgroundColor: tokens.colorNeutralBackgroundDisabled,
        border: `2px solid ${tokens.colorNeutralStrokeDisabled}`,
        ':hover': {
            borderTopColor: tokens.colorNeutralStrokeDisabled,
            borderRightColor: tokens.colorNeutralStrokeDisabled,
            borderBottomColor: tokens.colorNeutralStrokeDisabled,
            borderLeftColor: tokens.colorNeutralStrokeDisabled,
            transform: 'none',
            boxShadow: 'none',
        },
    },
    permitCardSelected: {
        borderTopColor: tokens.colorBrandBackground,
        borderRightColor: tokens.colorBrandBackground,
        borderBottomColor: tokens.colorBrandBackground,
        borderLeftColor: tokens.colorBrandBackground,
        backgroundColor: tokens.colorBrandBackground2,
    },
    permitCardContent: {
        padding: tokens.spacingVerticalXL,
        textAlign: 'center' as const,
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        gap: tokens.spacingVerticalM,
    },
    icon: {
        fontSize: '48px',
        color: tokens.colorBrandBackground,
    },
    iconDisabled: {
        color: tokens.colorNeutralForegroundDisabled,
    },
    permitTitle: {
        fontSize: tokens.fontSizeBase400,
        fontWeight: tokens.fontWeightSemibold,
        color: tokens.colorNeutralForeground1,
    },
    permitTitleDisabled: {
        color: tokens.colorNeutralForegroundDisabled,
    },
    permitDescription: {
        fontSize: tokens.fontSizeBase200,
        color: tokens.colorNeutralForeground3,
        marginTop: '4px',
    },
    permitDescriptionDisabled: {
        color: tokens.colorNeutralForegroundDisabled,
    },
});

interface PermitTypeSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectGeneralPermit: () => void;
    onSelectHeightPermit: () => void;
}

export const PermitTypeSelectionModal: React.FC<PermitTypeSelectionModalProps> = ({
    isOpen,
    onClose,
    onSelectGeneralPermit,
    onSelectHeightPermit,
}) => {
    const styles = useStyles();
    const [selectedType, setSelectedType] = React.useState<'general' | 'height' | null>(null);

    const handleSelect = () => {
        if (selectedType === 'general') {
            onSelectGeneralPermit();
        } else if (selectedType === 'height') {
            onSelectHeightPermit();
        }
        onClose();
    };

    // Reset selection when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setSelectedType(null);
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={(_, data) => !data.open && onClose()}>
            <DialogSurface className={styles.dialogSurface}>
                <DialogBody>
                    <DialogTitle
                        action={
                            <Button
                                appearance="subtle"
                                aria-label="close"
                                icon={<Dismiss24Regular />}
                                onClick={onClose}
                            />
                        }
                    >
                        Select Permit Type
                    </DialogTitle>
                    <DialogContent>
                        <Text>
                            Please select the type of permit you want to create:
                        </Text>

                        <div className={styles.cardGrid}>
                            {/* General Permit Card */}
                            <div
                                className={`${styles.permitCard} ${selectedType === 'general' ? styles.permitCardSelected : ''
                                    }`}
                                onClick={() => setSelectedType('general')}
                            >
                                <Card>
                                    <div className={styles.permitCardContent}>
                                        <DocumentBulletList24Regular className={styles.icon} />
                                        <div>
                                            <div className={styles.permitTitle}>General Permit</div>
                                            <div className={styles.permitDescription}>
                                                Standard work permit for general activities
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Height Permit Card */}
                            <div
                                className={`${styles.permitCard} ${selectedType === 'height' ? styles.permitCardSelected : ''
                                    }`}
                                onClick={() => setSelectedType('height')}
                            >
                                <Card>
                                    <div className={styles.permitCardContent}>
                                        <BuildingMultiple24Regular className={styles.icon} />
                                        <div>
                                            <div className={styles.permitTitle}>Height Permit</div>
                                            <div className={styles.permitDescription}>
                                                Permit for working at height with fall protection
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Hot Work Permit Card - Disabled */}
                            <div className={`${styles.permitCard} ${styles.permitCardDisabled}`}>
                                <Card>
                                    <div className={styles.permitCardContent}>
                                        <Warning24Regular className={`${styles.icon} ${styles.iconDisabled}`} />
                                        <div>
                                            <div className={`${styles.permitTitle} ${styles.permitTitleDisabled}`}>
                                                Hot Work Permit
                                            </div>
                                            <div className={`${styles.permitDescription} ${styles.permitDescriptionDisabled}`}>
                                                (Coming Soon)
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Confined Space Permit Card - Disabled */}
                            <div className={`${styles.permitCard} ${styles.permitCardDisabled}`}>
                                <Card>
                                    <div className={styles.permitCardContent}>
                                        <BoxMultiple24Regular className={`${styles.icon} ${styles.iconDisabled}`} />
                                        <div>
                                            <div className={`${styles.permitTitle} ${styles.permitTitleDisabled}`}>
                                                Confined Space Permit
                                            </div>
                                            <div className={`${styles.permitDescription} ${styles.permitDescriptionDisabled}`}>
                                                (Coming Soon)
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            {/* Excavation Permit Card - Disabled */}
                            <div className={`${styles.permitCard} ${styles.permitCardDisabled}`}>
                                <Card>
                                    <div className={styles.permitCardContent}>
                                        <ArrowDown24Regular className={`${styles.icon} ${styles.iconDisabled}`} />
                                        <div>
                                            <div className={`${styles.permitTitle} ${styles.permitTitleDisabled}`}>
                                                Excavation Permit
                                            </div>
                                            <div className={`${styles.permitDescription} ${styles.permitDescriptionDisabled}`}>
                                                (Coming Soon)
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            appearance="primary"
                            onClick={handleSelect}
                            disabled={!selectedType}
                        >
                            Continue
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};

export default PermitTypeSelectionModal;
