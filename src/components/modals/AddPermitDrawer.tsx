/**
 * Add Permit Drawer - Offcanvas form for creating/editing permits
 */

import React, { useState, useEffect } from 'react';
import {
    makeStyles,
    tokens,
    Drawer,
    DrawerHeader,
    DrawerHeaderTitle,
    DrawerBody,
    Button,
    Text,
    Input,
    Textarea,
    Dropdown,
    Option,
    Checkbox,
    Tab,
    TabList,
    Spinner,
    Field,
    Badge,
} from '@fluentui/react-components';
import {
    Dismiss24Regular,
    Save24Regular,
    ChevronLeft24Regular,
    ChevronRight24Regular,
    Add24Regular,
    Delete24Regular,
    Person24Regular,
    Warning24Regular,
    Checkmark24Regular,
} from '@fluentui/react-icons';
import { useUser } from '@/context';
import {
    createPermit,
    editPermitDetails,
    getNextPermitNumbers,
    getPermitById,
    getLocations,
    getSubLocations,
} from '@/services';
import hiraService from '@/services/hiraService';
import toast from 'react-hot-toast';
import { validateDrawerPermit, validateTab, fieldToTabMap, ValidationErrors } from '@/validations/generalPermitValidation';

const useStyles = makeStyles({
    drawer: {
        width: '800px',
        maxWidth: '90vw',
        height: 'calc(100vh - 60px)',
        marginTop: '60px',
        '@media (max-width: 768px)': {
            width: '100vw',
            maxWidth: '100vw',
            height: '100vh',
            marginTop: '0',
        },
    },
    drawerBody: {
        padding: tokens.spacingHorizontalL,
        display: 'flex',
        flexDirection: 'column' as const,
        height: '100%',
        overflow: 'auto',
        '@media (max-width: 768px)': {
            padding: tokens.spacingHorizontalM,
            overflow: 'auto',
        },
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: tokens.spacingHorizontalM,
        '@media (max-width: 600px)': {
            gridTemplateColumns: '1fr',
        },
    },
    fullWidth: {
        gridColumn: '1 / -1',
    },
    buttonRow: {
        display: 'flex',
        justifyContent: 'space-between',
        gap: tokens.spacingHorizontalM,
        padding: tokens.spacingVerticalM,
        paddingTop: tokens.spacingVerticalL,
        borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
        backgroundColor: tokens.colorNeutralBackground1,
        marginTop: 'auto',
        flexShrink: 0,
        flexWrap: 'nowrap',
        '@media (max-width: 768px)': {
            position: 'sticky' as const,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            gap: tokens.spacingHorizontalM,
            padding: tokens.spacingVerticalM,
            paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
            '& button': {
                flex: 1,
                minWidth: '80px',
                fontSize: tokens.fontSizeBase200,
            },
        },
    },
    tabContent: {
        marginTop: tokens.spacingVerticalM,
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingRight: '4px', // Avoid scrollbar overlap content
    },
    checklistGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: tokens.spacingHorizontalS,
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
        },
    },
    riskCard: {
        padding: tokens.spacingHorizontalM,
        marginBottom: tokens.spacingVerticalS,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground1,
    },
    riskCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: tokens.spacingVerticalS,
        padding: tokens.spacingHorizontalXS,
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: tokens.borderRadiusSmall,
    },
    signatureBox: {
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingHorizontalM,
        textAlign: 'center' as const,
        backgroundColor: tokens.colorNeutralBackground2,
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        '@media (max-width: 768px)': {
            minHeight: '60px',
            padding: tokens.spacingHorizontalS,
        },
    },
    signatureImage: {
        maxHeight: '60px',
        maxWidth: '150px',
        objectFit: 'contain' as const,
    },
    permitNumbersRow: {
        display: 'flex',
        gap: tokens.spacingHorizontalM,
        padding: tokens.spacingHorizontalM,
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: tokens.borderRadiusMedium,
        marginBottom: tokens.spacingVerticalM,
        flexWrap: 'wrap' as const,
        '@media (max-width: 768px)': {
            gap: tokens.spacingHorizontalS,
            padding: tokens.spacingHorizontalS,
        },
    },
    permitNumberItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '2px',
    },
    autoFillNote: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: tokens.fontSizeBase100,
        color: tokens.colorNeutralForeground3,
        marginTop: '2px',
    },
    sectionTitle: {
        fontSize: tokens.fontSizeBase300,
        fontWeight: tokens.fontWeightSemibold,
        marginBottom: tokens.spacingVerticalS,
    },
    associatedPermitItem: {
        padding: tokens.spacingHorizontalS,
        backgroundColor: tokens.colorNeutralBackground2,
        borderRadius: tokens.borderRadiusMedium,
        marginBottom: tokens.spacingVerticalXS,
    },
});

interface FormData {
    permitNumber: string;
    protocolNumber: string;
    srNo: string;
    initiator: {
        briefDescriptionOfWork: string;
        equipmentLocation: {
            equipmentNameNo: string;
            location: string;
            subLocation: string;
            locationName: string;
        };
        periodOfWork: {
            from: { date: Date; hrs: string };
            to: { date: Date; hrs: string };
        };
        associatedPermits: {
            workAtHeightPermit: { checked: boolean; sNo: string };
            confinedSpacePermit: { checked: boolean; sNo: string };
            excavationWorkPermit: { checked: boolean; sNo: string };
            isolationPermit: { checked: boolean; sNo: string };
            mechanicalIsolation: { checked: boolean; sNo: string };
            other: { checked: boolean; description: string };
        };
        checkPoints: Array<{ sn: number; riskAssessment: string; hazardMitigationMeasures: string }>;
        initiatorDetails: {
            name: string;
            signature: string;
            date: Date;
            time: string;
        };
    };
    prePermitChecks: {
        electricalIsolation: boolean;
        mechanicalIsolation: boolean;
        gasIsolation: boolean;
        utilitiesIsolation: boolean;
        trafficAwareness: boolean;
        relevantDeptAwareOfIsolation: boolean;
        workingAtHeight: boolean;
        workingInConfinedSpace: boolean;
        excavation: boolean;
        gasTestingRequired: boolean;
        periodicGasTestingRequired: boolean;
        multipleExecutingAgencies: boolean;
        locationAccessible: boolean;
        fireDeptStandby: boolean;
        gasSafetyStandby: boolean;
        ambulanceStandby: boolean;
        initiatorSignature: {
            name: string;
            signature: string;
            date: Date;
            time: string;
        };
    };
    // HIRA Linkage
    isHiraRequired: boolean;
    hiraId: string | null;
    hiraDetails: {
        hiraNumber: string;
        jobHeader?: {
            area: string;
            jobType: string;
            jobDetails: string;
        };
    } | null;
}

const getDefaultFormData = (): FormData => ({
    permitNumber: '',
    protocolNumber: '',
    srNo: '',
    initiator: {
        briefDescriptionOfWork: '',
        equipmentLocation: {
            equipmentNameNo: '',
            location: '',
            subLocation: '',
            locationName: '',
        },
        periodOfWork: {
            from: { date: new Date(), hrs: new Date().toTimeString().slice(0, 5) },
            to: { date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), hrs: '17:00' },
        },
        associatedPermits: {
            workAtHeightPermit: { checked: false, sNo: '' },
            confinedSpacePermit: { checked: false, sNo: '' },
            excavationWorkPermit: { checked: false, sNo: '' },
            isolationPermit: { checked: false, sNo: '' },
            mechanicalIsolation: { checked: false, sNo: '' },
            other: { checked: false, description: '' },
        },
        checkPoints: [
            { sn: 1, riskAssessment: '', hazardMitigationMeasures: '' },
            { sn: 2, riskAssessment: '', hazardMitigationMeasures: '' },
        ],
        initiatorDetails: {
            name: '',
            signature: '',
            date: new Date(),
            time: new Date().toTimeString().slice(0, 5),
        },
    },
    prePermitChecks: {
        electricalIsolation: false,
        mechanicalIsolation: false,
        gasIsolation: false,
        utilitiesIsolation: false,
        trafficAwareness: false,
        relevantDeptAwareOfIsolation: false,
        workingAtHeight: false,
        workingInConfinedSpace: false,
        excavation: false,
        gasTestingRequired: false,
        periodicGasTestingRequired: false,
        multipleExecutingAgencies: false,
        locationAccessible: false,
        fireDeptStandby: false,
        gasSafetyStandby: false,
        ambulanceStandby: false,
        initiatorSignature: {
            name: '',
            signature: '',
            date: new Date(),
            time: new Date().toTimeString().slice(0, 5),
        },
    },
    // HIRA Linkage defaults
    isHiraRequired: false,
    hiraId: null,
    hiraDetails: null,
});

const tabOrder = ['basic', 'associated', 'checkpoints', 'prechecks', 'initiator', 'signature'];

interface AddPermitDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onPermitCreated: (permitId?: string) => void;
    editPermitId?: string | null;
}

export const AddPermitDrawer: React.FC<AddPermitDrawerProps> = ({
    isOpen,
    onClose,
    onPermitCreated,
    editPermitId = null,
}) => {
    const styles = useStyles();
    const { user } = useUser();
    const isEdit = Boolean(editPermitId);

    const [formData, setFormData] = useState<FormData>(getDefaultFormData());
    const [activeTab, setActiveTab] = useState('basic');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadingNumbers, setLoadingNumbers] = useState(false);
    const [locations, setLocations] = useState<string[]>([]);
    const [subLocations, setSubLocations] = useState<string[]>([]);
    const [loadingSubLocations, setLoadingSubLocations] = useState(false);
    const [loadingHira, setLoadingHira] = useState(false);
    const [formErrors, setFormErrors] = useState<ValidationErrors>({});

    /** Shortcut: returns the error message for a given field path, or undefined */
    const getError = (path: string): string | undefined => formErrors[path];

    const isLastTab = activeTab === tabOrder[tabOrder.length - 1];
    const isFirstTab = activeTab === tabOrder[0];

    // Handle HIRA Required toggle
    const handleHiraRequiredToggle = async (checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            isHiraRequired: checked,
            hiraId: checked ? prev.hiraId : null,
            hiraDetails: checked ? prev.hiraDetails : null,
        }));

        if (checked) {
            setLoadingHira(true);
            try {
                const response = await hiraService.getDefaultHira();
                if (response.success && response.data) {
                    setFormData(prev => ({
                        ...prev,
                        isHiraRequired: true,
                        hiraId: response.data._id,
                        hiraDetails: {
                            hiraNumber: response.data.hiraNumber,
                            jobHeader: response.data.jobHeader,
                        },
                    }));
                    toast.success(`Default HIRA (${response.data.hiraNumber}) linked to permit`);
                } else {
                    toast.error('No default HIRA set. Please set a default HIRA from the HIRA list page.');
                    setFormData(prev => ({
                        ...prev,
                        isHiraRequired: false,
                        hiraId: null,
                        hiraDetails: null,
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch default HIRA:', error);
                toast.error('Failed to fetch default HIRA');
                setFormData(prev => ({
                    ...prev,
                    isHiraRequired: false,
                    hiraId: null,
                    hiraDetails: null,
                }));
            } finally {
                setLoadingHira(false);
            }
        }
    };

    // Reset form when drawer opens
    useEffect(() => {
        if (isOpen) {
            setFormData(getDefaultFormData());
            setActiveTab('basic');
            setFormErrors({});
            if (!isEdit) {
                loadNextNumbers();
                autoFillUserDetails();
            } else if (editPermitId) {
                loadPermitData(editPermitId);
            }
        }
    }, [isOpen, editPermitId]);

    // Load locations on mount
    useEffect(() => {
        loadLocationsData();
    }, []);

    // Load sub-locations when location changes
    useEffect(() => {
        if (formData.initiator.equipmentLocation.location) {
            loadSubLocationsData(formData.initiator.equipmentLocation.location);
        } else {
            setSubLocations([]);
        }
    }, [formData.initiator.equipmentLocation.location]);

    const autoFillUserDetails = () => {
        if (!user) return;
        const sig = user.signature as any;
        const signatureUrl = sig?.url || (typeof sig === 'string' ? sig : '');
        setFormData(prev => ({
            ...prev,
            initiator: {
                ...prev.initiator,
                initiatorDetails: {
                    ...prev.initiator.initiatorDetails,
                    name: user.name || '',
                    signature: signatureUrl,
                },
            },
            prePermitChecks: {
                ...prev.prePermitChecks,
                initiatorSignature: {
                    ...prev.prePermitChecks.initiatorSignature,
                    name: user.name || '',
                    signature: signatureUrl,
                },
            },
        }));
    };

    const loadPermitData = async (permitId: string) => {
        try {
            setIsLoading(true);
            const response = await getPermitById(permitId);
            const permit = response.data as any;
            if (permit) {
                // Map permit data to form structure with proper date handling
                const safeDate = (d: any) => (d ? new Date(d) : new Date());
                const safeString = (s: any) => s || '';

                setFormData({
                    permitNumber: safeString(permit.permitNumber),
                    protocolNumber: safeString(permit.protocolNumber),
                    srNo: safeString(permit.srNo),
                    initiator: {
                        briefDescriptionOfWork: safeString(permit.initiator?.briefDescriptionOfWork),
                        equipmentLocation: {
                            equipmentNameNo: safeString(permit.initiator?.equipmentLocation?.equipmentNameNo),
                            location: safeString(permit.initiator?.equipmentLocation?.location),
                            subLocation: safeString(permit.initiator?.equipmentLocation?.subLocation),
                            locationName: safeString(permit.initiator?.equipmentLocation?.locationName),
                        },
                        periodOfWork: {
                            from: {
                                date: safeDate(permit.initiator?.periodOfWork?.from?.date),
                                hrs: safeString(permit.initiator?.periodOfWork?.from?.hrs) || '08:00',
                            },
                            to: {
                                date: safeDate(permit.initiator?.periodOfWork?.to?.date),
                                hrs: safeString(permit.initiator?.periodOfWork?.to?.hrs) || '17:00',
                            },
                        },
                        associatedPermits: {
                            workAtHeightPermit: {
                                checked: permit.initiator?.associatedPermits?.workAtHeightPermit?.checked || false,
                                sNo: safeString(permit.initiator?.associatedPermits?.workAtHeightPermit?.sNo),
                            },
                            confinedSpacePermit: {
                                checked: permit.initiator?.associatedPermits?.confinedSpacePermit?.checked || false,
                                sNo: safeString(permit.initiator?.associatedPermits?.confinedSpacePermit?.sNo),
                            },
                            excavationWorkPermit: {
                                checked: permit.initiator?.associatedPermits?.excavationWorkPermit?.checked || false,
                                sNo: safeString(permit.initiator?.associatedPermits?.excavationWorkPermit?.sNo),
                            },
                            isolationPermit: {
                                checked: permit.initiator?.associatedPermits?.isolationPermit?.checked || false,
                                sNo: safeString(permit.initiator?.associatedPermits?.isolationPermit?.sNo),
                            },
                            mechanicalIsolation: {
                                checked: permit.initiator?.associatedPermits?.mechanicalIsolation?.checked || false,
                                sNo: safeString(permit.initiator?.associatedPermits?.mechanicalIsolation?.sNo),
                            },
                            other: {
                                checked: permit.initiator?.associatedPermits?.other?.checked || false,
                                description: safeString(permit.initiator?.associatedPermits?.other?.description),
                            },
                        },
                        checkPoints: permit.initiator?.checkPoints?.length > 0
                            ? permit.initiator.checkPoints.map((cp: any, i: number) => ({
                                sn: cp.sn || i + 1,
                                riskAssessment: safeString(cp.riskAssessment),
                                hazardMitigationMeasures: safeString(cp.hazardMitigationMeasures),
                            }))
                            : [
                                { sn: 1, riskAssessment: '', hazardMitigationMeasures: '' },
                                { sn: 2, riskAssessment: '', hazardMitigationMeasures: '' },
                            ],
                        initiatorDetails: {
                            name: safeString(permit.initiator?.initiatorDetails?.name),
                            signature: safeString(permit.initiator?.initiatorDetails?.signature),
                            date: safeDate(permit.initiator?.initiatorDetails?.date),
                            time: safeString(permit.initiator?.initiatorDetails?.time) || new Date().toTimeString().slice(0, 5),
                        },
                    },
                    prePermitChecks: (() => {
                        // Helper to convert YES/NO/NA strings to boolean
                        const toBool = (val: any): boolean => {
                            if (typeof val === 'boolean') return val;
                            if (typeof val === 'string') return val.toUpperCase() === 'YES';
                            return false;
                        };
                        return {
                            electricalIsolation: toBool(permit.prePermitChecks?.electricalIsolation),
                            mechanicalIsolation: toBool(permit.prePermitChecks?.mechanicalIsolation),
                            gasIsolation: toBool(permit.prePermitChecks?.gasIsolation),
                            utilitiesIsolation: toBool(permit.prePermitChecks?.utilitiesIsolation),
                            trafficAwareness: toBool(permit.prePermitChecks?.trafficAwareness),
                            relevantDeptAwareOfIsolation: toBool(permit.prePermitChecks?.relevantDeptAwareOfIsolation),
                            workingAtHeight: toBool(permit.prePermitChecks?.workingAtHeight),
                            workingInConfinedSpace: toBool(permit.prePermitChecks?.workingInConfinedSpace),
                            excavation: toBool(permit.prePermitChecks?.excavation),
                            gasTestingRequired: toBool(permit.prePermitChecks?.gasTestingRequired),
                            periodicGasTestingRequired: toBool(permit.prePermitChecks?.periodicGasTestingRequired),
                            multipleExecutingAgencies: toBool(permit.prePermitChecks?.multipleExecutingAgencies),
                            locationAccessible: toBool(permit.prePermitChecks?.locationAccessible),
                            fireDeptStandby: toBool(permit.prePermitChecks?.fireDeptStandby),
                            gasSafetyStandby: toBool(permit.prePermitChecks?.gasSafetyStandby),
                            ambulanceStandby: toBool(permit.prePermitChecks?.ambulanceStandby),
                            initiatorSignature: {
                                name: safeString(permit.prePermitChecks?.initiatorSignature?.name),
                                signature: safeString(permit.prePermitChecks?.initiatorSignature?.signature),
                                date: safeDate(permit.prePermitChecks?.initiatorSignature?.date),
                                time: safeString(permit.prePermitChecks?.initiatorSignature?.time) || new Date().toTimeString().slice(0, 5),
                            },
                        };
                    })(),
                    // HIRA Linkage
                    isHiraRequired: permit.isHiraRequired === true,
                    hiraId: typeof permit.hiraId === 'object' && permit.hiraId?._id
                        ? permit.hiraId._id
                        : (typeof permit.hiraId === 'string' ? permit.hiraId : null),
                    hiraDetails: permit.hiraId && typeof permit.hiraId === 'object' ? {
                        hiraNumber: permit.hiraId.hiraNumber || '',
                        jobHeader: permit.hiraId.jobHeader,
                    } : null,
                });
            }
        } catch (error) {
            toast.error('Failed to load permit');
            onClose();
        } finally {
            setIsLoading(false);
        }
    };

    const loadNextNumbers = async () => {
        try {
            setLoadingNumbers(true);
            const response = await getNextPermitNumbers();
            if (response.success && response.data) {
                setFormData(prev => ({
                    ...prev,
                    permitNumber: response.data.permitNumber || '',
                    protocolNumber: response.data.protocolNumber || '',
                    srNo: response.data.srNo || '',
                }));
            }
        } catch (error) {
            console.error('Failed to load permit numbers:', error);
        } finally {
            setLoadingNumbers(false);
        }
    };

    const loadLocationsData = async () => {
        try {
            const response = await getLocations();
            const locationNames = (response.data || []).map((loc: any) => loc.name || loc);
            setLocations(locationNames);
        } catch (error) {
            console.error('Failed to load locations:', error);
        }
    };

    const loadSubLocationsData = async (location: string) => {
        try {
            setLoadingSubLocations(true);
            const response = await getSubLocations(location);
            setSubLocations(response.data || []);
        } catch (error) {
            setSubLocations([]);
        } finally {
            setLoadingSubLocations(false);
        }
    };

    const handleChange = (path: string, value: any) => {
        setFormData(prev => {
            const keys = path.split('.');
            // Deep clone preserving Date objects
            const deepClone = (obj: any): any => {
                if (obj === null || typeof obj !== 'object') return obj;
                if (obj instanceof Date) return new Date(obj);
                if (Array.isArray(obj)) return obj.map(deepClone);
                const cloned: any = {};
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        cloned[key] = deepClone(obj[key]);
                    }
                }
                return cloned;
            };
            const newData = deepClone(prev);
            let current: any = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (key !== undefined) {
                    current = current[key];
                }
            }
            const lastKey = keys[keys.length - 1];
            if (lastKey !== undefined) {
                current[lastKey] = value;
            }
            return newData;
        });
    };

    const handleCheckPointChange = (index: number, field: 'riskAssessment' | 'hazardMitigationMeasures', value: string) => {
        setFormData(prev => ({
            ...prev,
            initiator: {
                ...prev.initiator,
                checkPoints: prev.initiator.checkPoints.map((cp, i) =>
                    i === index ? { ...cp, [field]: value } : cp
                ),
            },
        }));
    };

    const addCheckPoint = () => {
        setFormData(prev => ({
            ...prev,
            initiator: {
                ...prev.initiator,
                checkPoints: [
                    ...prev.initiator.checkPoints,
                    { sn: prev.initiator.checkPoints.length + 1, riskAssessment: '', hazardMitigationMeasures: '' },
                ],
            },
        }));
    };

    const removeCheckPoint = (index: number) => {
        if (formData.initiator.checkPoints.length <= 2) {
            toast.error('Minimum 2 checkpoints required');
            return;
        }
        setFormData(prev => ({
            ...prev,
            initiator: {
                ...prev.initiator,
                checkPoints: prev.initiator.checkPoints.filter((_, i) => i !== index).map((cp, i) => ({ ...cp, sn: i + 1 })),
            },
        }));
    };

    const validateForm = async (): Promise<boolean> => {
        const result = await validateDrawerPermit(formData as any);
        if (result.valid) {
            setFormErrors({});
            return true;
        }
        // Show errors inline
        setFormErrors(result.errors);
        // Navigate to the tab that contains the first error
        setActiveTab(result.firstErrorTab);
        return false;
    };

    const handleSubmit = async () => {
        setFormErrors({});
        const isValid = await validateForm();
        if (!isValid) return;

        try {
            setIsSubmitting(true);
            // Clean up associated permits - ensure proper structure
            const cleanedAssociatedPermits: Record<string, any> = {};
            const permitTypesWithSNo = [
                'workAtHeightPermit',
                'confinedSpacePermit',
                'excavationWorkPermit',
                'isolationPermit',
                'mechanicalIsolation',
            ];
            permitTypesWithSNo.forEach((permitType) => {
                const permit = (formData.initiator.associatedPermits as any)[permitType];
                cleanedAssociatedPermits[permitType] = {
                    checked: permit?.checked === true,
                    sNo: permit?.checked === true ? (permit.sNo || '').trim() : '',
                };
            });
            const otherPermit = formData.initiator.associatedPermits.other;
            cleanedAssociatedPermits.other = {
                checked: otherPermit?.checked === true,
                description: otherPermit?.checked === true ? (otherPermit.description || '').trim() : '',
            };

            const submitData = {
                ...formData,
                initiator: {
                    ...formData.initiator,
                    associatedPermits: cleanedAssociatedPermits,
                    periodOfWork: {
                        from: {
                            date: formData.initiator.periodOfWork.from.date instanceof Date
                                ? formatDateForSubmit(formData.initiator.periodOfWork.from.date)
                                : formData.initiator.periodOfWork.from.date,
                            hrs: formData.initiator.periodOfWork.from.hrs,
                        },
                        to: {
                            date: formData.initiator.periodOfWork.to.date instanceof Date
                                ? formatDateForSubmit(formData.initiator.periodOfWork.to.date)
                                : formData.initiator.periodOfWork.to.date,
                            hrs: formData.initiator.periodOfWork.to.hrs,
                        },
                    },
                    initiatorDetails: {
                        ...formData.initiator.initiatorDetails,
                        date: formData.initiator.initiatorDetails.date instanceof Date
                            ? formatDateForSubmit(formData.initiator.initiatorDetails.date)
                            : formData.initiator.initiatorDetails.date,
                    },
                },
                prePermitChecks: (() => {
                    // Helper to convert boolean to YES/NO string for server
                    const toYesNo = (val: boolean | undefined): string => val === true ? 'YES' : 'NO';
                    return {
                        electricalIsolation: toYesNo(formData.prePermitChecks.electricalIsolation),
                        mechanicalIsolation: toYesNo(formData.prePermitChecks.mechanicalIsolation),
                        gasIsolation: toYesNo(formData.prePermitChecks.gasIsolation),
                        utilitiesIsolation: toYesNo(formData.prePermitChecks.utilitiesIsolation),
                        trafficAwareness: toYesNo(formData.prePermitChecks.trafficAwareness),
                        relevantDeptAwareOfIsolation: toYesNo(formData.prePermitChecks.relevantDeptAwareOfIsolation),
                        workingAtHeight: toYesNo(formData.prePermitChecks.workingAtHeight),
                        workingInConfinedSpace: toYesNo(formData.prePermitChecks.workingInConfinedSpace),
                        excavation: toYesNo(formData.prePermitChecks.excavation),
                        gasTestingRequired: toYesNo(formData.prePermitChecks.gasTestingRequired),
                        periodicGasTestingRequired: toYesNo(formData.prePermitChecks.periodicGasTestingRequired),
                        multipleExecutingAgencies: toYesNo(formData.prePermitChecks.multipleExecutingAgencies),
                        locationAccessible: toYesNo(formData.prePermitChecks.locationAccessible),
                        fireDeptStandby: toYesNo(formData.prePermitChecks.fireDeptStandby),
                        gasSafetyStandby: toYesNo(formData.prePermitChecks.gasSafetyStandby),
                        ambulanceStandby: toYesNo(formData.prePermitChecks.ambulanceStandby),
                        initiatorSignature: {
                            ...formData.prePermitChecks.initiatorSignature,
                            date: formData.prePermitChecks.initiatorSignature.date instanceof Date
                                ? formatDateForSubmit(formData.prePermitChecks.initiatorSignature.date)
                                : formData.prePermitChecks.initiatorSignature.date,
                        },
                    };
                })(),
                // HIRA Linkage
                isHiraRequired: formData.isHiraRequired,
                hiraId: formData.isHiraRequired ? formData.hiraId : null,
            };

            if (isEdit && editPermitId) {
                await editPermitDetails(editPermitId, submitData as any);
                toast.success('Permit updated!');
                onPermitCreated();
            } else {
                const response = await createPermit(submitData as any);
                toast.success('Permit created!');
                // Pass the new permit ID to the callback
                onPermitCreated(response.data?._id);
            }
            onClose();
        } catch (error: any) {
            toast.error(error?.message || 'Failed to save permit');
        } finally {
            setIsSubmitting(false);
        }
    };

    const goToNextTab = async () => {
        const currentIndex = tabOrder.indexOf(activeTab);
        const nextTab = tabOrder[currentIndex + 1];
        if (currentIndex < tabOrder.length - 1 && nextTab !== undefined) {
            // Validate current tab before moving
            const result = await validateTab(formData as any, activeTab, 'drawer');
            if (!result.valid) {
                setFormErrors(prev => ({ ...prev, ...result.errors }));
                return;
            }
            // Clear errors for the current tab since it passed
            setFormErrors(prev => {
                const updated = { ...prev };
                Object.keys(updated).forEach(key => {
                    if (fieldToTabMap[key] === activeTab) {
                        delete updated[key];
                    }
                });
                return updated;
            });
            setActiveTab(nextTab);
        }
    };

    const goToPrevTab = () => {
        const currentIndex = tabOrder.indexOf(activeTab);
        const prevTab = tabOrder[currentIndex - 1];
        if (currentIndex > 0 && prevTab !== undefined) {
            setActiveTab(prevTab);
        }
    };

    const formatDate = (date: Date): string => {
        if (!(date instanceof Date) || isNaN(date.getTime())) return '';
        // Use local date components to avoid UTC conversion issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Format date for API submission - uses noon UTC to avoid timezone rollover issues
    const formatDateForSubmit = (date: Date): string => {
        if (!(date instanceof Date) || isNaN(date.getTime())) return '';
        // Use local date components and set to noon UTC to prevent date shift
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        // Return as ISO string at noon UTC to avoid timezone issues
        return `${year}-${month}-${day}T12:00:00.000Z`;
    };

    // Tab renderers
    const renderBasicInfoTab = () => (
        <div>
            <div className={styles.permitNumbersRow}>
                <div className={styles.permitNumberItem}>
                    <Text size={100}>Permit No.</Text>
                    <Badge appearance="outline">{loadingNumbers ? <Spinner size="tiny" /> : formData.permitNumber || '...'}</Badge>
                </div>
                <div className={styles.permitNumberItem}>
                    <Text size={100}>Protocol No.</Text>
                    {loadingNumbers ? (
                        <Badge appearance="outline"><Spinner size="tiny" /></Badge>
                    ) : (
                        <Input
                            size="small"
                            value={formData.protocolNumber}
                            onChange={(_, data) => handleChange('protocolNumber', data.value)}
                            placeholder="Protocol No."
                            style={{ minWidth: '100px', maxWidth: '150px' }}
                        />
                    )}
                </div>
                <div className={styles.permitNumberItem}>
                    <Text size={100}>SR No.</Text>
                    <Badge appearance="outline">{loadingNumbers ? <Spinner size="tiny" /> : formData.srNo || '...'}</Badge>
                </div>
            </div>
            <div className={styles.formGrid}>
                <Field
                    label="Work Description *"
                    required
                    className={styles.fullWidth}
                    validationMessage={getError('initiator.briefDescriptionOfWork')}
                    validationState={getError('initiator.briefDescriptionOfWork') ? 'error' : undefined}
                >
                    <Textarea
                        value={formData.initiator.briefDescriptionOfWork}
                        onChange={(_, data) => handleChange('initiator.briefDescriptionOfWork', data.value)}
                        placeholder="Brief description of work..."
                        rows={2}
                    />
                </Field>
                <Field label="Equipment Name/No.">
                    <Input
                        value={formData.initiator.equipmentLocation.equipmentNameNo}
                        onChange={(_, data) => handleChange('initiator.equipmentLocation.equipmentNameNo', data.value)}
                    />
                </Field>
                <Field label="Location Name">
                    <Input
                        value={formData.initiator.equipmentLocation.locationName}
                        onChange={(_, data) => handleChange('initiator.equipmentLocation.locationName', data.value)}
                    />
                </Field>
                <Field
                    label="Unit *"
                    required
                    validationMessage={getError('initiator.equipmentLocation.location')}
                    validationState={getError('initiator.equipmentLocation.location') ? 'error' : undefined}
                >
                    <Dropdown
                        placeholder="Select Location"
                        value={formData.initiator.equipmentLocation.location}
                        onOptionSelect={(_, data) => {
                            handleChange('initiator.equipmentLocation.location', data.optionValue || '');
                            handleChange('initiator.equipmentLocation.subLocation', '');
                        }}
                    >
                        {locations.map(loc => <Option key={loc} value={loc}>{loc}</Option>)}
                    </Dropdown>
                </Field>
                <Field
                    label="DIC *"
                    required
                    validationMessage={getError('initiator.equipmentLocation.subLocation')}
                    validationState={getError('initiator.equipmentLocation.subLocation') ? 'error' : undefined}
                >
                    <Dropdown
                        placeholder={loadingSubLocations ? 'Loading...' : 'Select DIC'}
                        value={formData.initiator.equipmentLocation.subLocation}
                        onOptionSelect={(_, data) => handleChange('initiator.equipmentLocation.subLocation', data.optionValue || '')}
                        disabled={!formData.initiator.equipmentLocation.location || loadingSubLocations}
                    >
                        {subLocations.map(loc => <Option key={loc} value={loc}>{loc}</Option>)}
                    </Dropdown>
                </Field>
                <Field label="From Date">
                    <Input type="date" value={formatDate(formData.initiator.periodOfWork.from.date)} onChange={(_, data) => {
                        // Parse as local date to avoid timezone issues
                        const [year, month, day] = data.value.split('-').map(Number);
                        if (year !== undefined && month !== undefined && day !== undefined) {
                            handleChange('initiator.periodOfWork.from.date', new Date(year, month - 1, day));
                        }
                    }} />
                </Field>
                <Field
                    label="To Date"
                    validationMessage={getError('initiator.periodOfWork.to.date')}
                    validationState={getError('initiator.periodOfWork.to.date') ? 'error' : undefined}
                >
                    <Input type="date" value={formatDate(formData.initiator.periodOfWork.to.date)} onChange={(_, data) => {
                        // Parse as local date to avoid timezone issues
                        const [year, month, day] = data.value.split('-').map(Number);
                        if (year !== undefined && month !== undefined && day !== undefined) {
                            handleChange('initiator.periodOfWork.to.date', new Date(year, month - 1, day));
                        }
                    }} />
                </Field>
                <Field label="From Time">
                    <Input type="time" value={formData.initiator.periodOfWork.from.hrs} onChange={(_, data) => handleChange('initiator.periodOfWork.from.hrs', data.value)} />
                </Field>
                <Field label="To Time">
                    <Input type="time" value={formData.initiator.periodOfWork.to.hrs} onChange={(_, data) => handleChange('initiator.periodOfWork.to.hrs', data.value)} />
                </Field>
            </div>
        </div>
    );

    const renderAssociatedPermitsTab = () => {
        const permits = [
            { key: 'workAtHeightPermit', label: 'Work at Height Permit' },
            { key: 'confinedSpacePermit', label: 'Confined Space Permit' },
            { key: 'excavationWorkPermit', label: 'Excavation Work Permit' },
            { key: 'isolationPermit', label: 'Isolation Permit' },
            { key: 'mechanicalIsolation', label: 'Mechanical Isolation' },
        ];
        return (
            <div className={styles.formGrid}>
                {permits.map(permit => (
                    <div key={permit.key} className={styles.associatedPermitItem}>
                        <Checkbox
                            checked={(formData.initiator.associatedPermits as any)[permit.key]?.checked}
                            onChange={(_, data) => handleChange(`initiator.associatedPermits.${permit.key}.checked`, data.checked === true)}
                            label={permit.label}
                        />
                        {(formData.initiator.associatedPermits as any)[permit.key]?.checked && (
                            <Input placeholder="S/No." value={(formData.initiator.associatedPermits as any)[permit.key]?.sNo || ''} onChange={(_, data) => handleChange(`initiator.associatedPermits.${permit.key}.sNo`, data.value)} style={{ marginTop: '4px', marginLeft: '24px' }} />
                        )}
                    </div>
                ))}
                <div className={styles.associatedPermitItem}>
                    <Checkbox checked={formData.initiator.associatedPermits.other.checked} onChange={(_, data) => handleChange('initiator.associatedPermits.other.checked', data.checked === true)} label="Other" />
                    {formData.initiator.associatedPermits.other.checked && (
                        <Input placeholder="Description" value={formData.initiator.associatedPermits.other.description} onChange={(_, data) => handleChange('initiator.associatedPermits.other.description', data.value)} style={{ marginTop: '4px', marginLeft: '24px' }} />
                    )}
                </div>
            </div>
        );
    };

    const renderCheckPointsTab = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Text className={styles.sectionTitle}>Check Points / Risk Assessment</Text>
                <Button icon={<Add24Regular />} size="small" appearance="primary" onClick={addCheckPoint}>Add</Button>
            </div>
            {getError('initiator.checkPoints') && (
                <div style={{
                    padding: '8px 12px',
                    marginBottom: '12px',
                    backgroundColor: tokens.colorPaletteRedBackground1,
                    border: `1px solid ${tokens.colorPaletteRedBorder1}`,
                    borderRadius: tokens.borderRadiusMedium,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                }}>
                    <Warning24Regular style={{ color: tokens.colorPaletteRedForeground1 }} />
                    <Text size={200} style={{ color: tokens.colorPaletteRedForeground1 }}>
                        {getError('initiator.checkPoints')}
                    </Text>
                </div>
            )}
            {formData.initiator.checkPoints.map((cp, index) => (
                <div key={index} className={styles.riskCard}>
                    <div className={styles.riskCardHeader}>
                        <Text weight="semibold" size={200}>Check Point {cp.sn}</Text>
                        <Button
                            icon={<Delete24Regular />}
                            appearance="subtle"
                            size="small"
                            onClick={() => removeCheckPoint(index)}
                            disabled={formData.initiator.checkPoints.length <= 2}
                        />
                    </div>
                    <Field label="Risk Assessment" size="small" style={{ marginBottom: '8px' }}>
                        <Textarea
                            placeholder="Any additional risk foreseen..."
                            value={cp.riskAssessment}
                            onChange={(_, data) => handleCheckPointChange(index, 'riskAssessment', data.value)}
                            rows={2}
                            resize="vertical"
                        />
                    </Field>
                    <Field label="Hazard Mitigation Measures" size="small">
                        <Textarea
                            placeholder="Hazard mitigation measures in place..."
                            value={cp.hazardMitigationMeasures}
                            onChange={(_, data) => handleCheckPointChange(index, 'hazardMitigationMeasures', data.value)}
                            rows={2}
                            resize="vertical"
                        />
                    </Field>
                </div>
            ))}
        </div>
    );

    const renderPrePermitChecksTab = () => {
        const checks = [
            { key: 'electricalIsolation', label: 'Electrical Isolation' },
            { key: 'mechanicalIsolation', label: 'Mechanical Isolation' },
            { key: 'gasIsolation', label: 'Gas Isolation' },
            { key: 'utilitiesIsolation', label: 'Utilities Isolation' },
            { key: 'trafficAwareness', label: 'Traffic Awareness' },
            { key: 'relevantDeptAwareOfIsolation', label: 'Dept. Aware' },
            { key: 'workingAtHeight', label: 'Working at Height' },
            { key: 'workingInConfinedSpace', label: 'Confined Space' },
            { key: 'excavation', label: 'Excavation' },
            { key: 'gasTestingRequired', label: 'Gas Testing' },
            { key: 'periodicGasTestingRequired', label: 'Periodic Gas Test' },
            { key: 'multipleExecutingAgencies', label: 'Multiple Agencies' },
            { key: 'locationAccessible', label: 'Location Accessible' },
            { key: 'fireDeptStandby', label: 'Fire Standby' },
            { key: 'gasSafetyStandby', label: 'Gas Safety Standby' },
            { key: 'ambulanceStandby', label: 'Ambulance Standby' },
        ];
        return (
            <div>
                <div className={styles.checklistGrid}>
                    {checks.map(check => (
                        <Checkbox key={check.key} checked={(formData.prePermitChecks as any)[check.key]} onChange={(_, data) => handleChange(`prePermitChecks.${check.key}`, data.checked === true)} label={check.label} />
                    ))}
                </div>

                {/* HIRA Linkage Section */}
                <div style={{
                    marginTop: tokens.spacingVerticalL,
                    padding: tokens.spacingHorizontalM,
                    backgroundColor: tokens.colorNeutralBackground3,
                    borderRadius: tokens.borderRadiusMedium,
                    border: `1px solid ${tokens.colorNeutralStroke1}`
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalM, marginBottom: tokens.spacingVerticalS }}>
                        <Checkbox
                            checked={formData.isHiraRequired}
                            onChange={(_, data) => handleHiraRequiredToggle(data.checked === true)}
                            label="Is HIRA Required?"
                            disabled={loadingHira}
                        />
                        {loadingHira && <Spinner size="tiny" label="Loading default HIRA..." />}
                    </div>

                    {formData.isHiraRequired && formData.hiraDetails && (
                        <div style={{
                            padding: tokens.spacingHorizontalM,
                            backgroundColor: tokens.colorNeutralBackground1,
                            borderRadius: tokens.borderRadiusSmall,
                            marginTop: tokens.spacingVerticalS
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: tokens.spacingHorizontalS, marginBottom: tokens.spacingVerticalXS }}>
                                <Checkmark24Regular style={{ color: tokens.colorPaletteGreenForeground1 }} />
                                <Text weight="semibold">HIRA Linked</Text>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: tokens.spacingHorizontalS, marginTop: tokens.spacingVerticalS }}>
                                <Text style={{ color: tokens.colorNeutralForeground3 }}>HIRA Number:</Text>
                                <Badge appearance="tint" color="brand">{formData.hiraDetails.hiraNumber}</Badge>
                                {formData.hiraDetails.jobHeader && (
                                    <>
                                        <Text style={{ color: tokens.colorNeutralForeground3 }}>Area:</Text>
                                        <Text>{formData.hiraDetails.jobHeader.area}</Text>
                                        <Text style={{ color: tokens.colorNeutralForeground3 }}>Job Type:</Text>
                                        <Text>{formData.hiraDetails.jobHeader.jobType}</Text>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {formData.isHiraRequired && !formData.hiraDetails && !loadingHira && (
                        <div style={{
                            padding: tokens.spacingHorizontalM,
                            backgroundColor: tokens.colorPaletteRedBackground2,
                            borderRadius: tokens.borderRadiusSmall,
                            marginTop: tokens.spacingVerticalS,
                            display: 'flex',
                            alignItems: 'center',
                            gap: tokens.spacingHorizontalS
                        }}>
                            <Warning24Regular style={{ color: tokens.colorPaletteRedForeground1 }} />
                            <Text>No default HIRA found. Please set a default HIRA from the HIRA list page.</Text>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    const renderInitiatorDetailsTab = () => (
        <div className={styles.formGrid}>
            <Field
                label="Initiator Name"
                validationMessage={getError('initiator.initiatorDetails.name')}
                validationState={getError('initiator.initiatorDetails.name') ? 'error' : undefined}
            >
                <Input value={formData.initiator.initiatorDetails.name} onChange={(_, data) => handleChange('initiator.initiatorDetails.name', data.value)} disabled={!isEdit} />
                {!isEdit && <div className={styles.autoFillNote}><Person24Regular fontSize={10} /> Auto-filled</div>}
            </Field>
            <Field
                label="Signature"
                validationMessage={getError('initiator.initiatorDetails.signature')}
                validationState={getError('initiator.initiatorDetails.signature') ? 'error' : undefined}
            >
                <div className={styles.signatureBox}>
                    {formData.initiator.initiatorDetails.signature?.startsWith('http') ? (
                        <>
                            <img src={formData.initiator.initiatorDetails.signature} alt="Signature" className={styles.signatureImage} />
                            <Text size={100} style={{ color: '#28a745' }}><Checkmark24Regular fontSize={10} /> Loaded</Text>
                        </>
                    ) : (
                        <><Warning24Regular fontSize={20} style={{ color: '#999' }} /><Text size={100}>No image</Text></>
                    )}
                </div>
            </Field>
            <Field label="Date">
                <Input type="date" value={formatDate(formData.initiator.initiatorDetails.date)} onChange={(_, data) => handleChange('initiator.initiatorDetails.date', new Date(data.value))} disabled={!isEdit} />
            </Field>
            <Field label="Time">
                <Input type="time" value={formData.initiator.initiatorDetails.time} onChange={(_, data) => handleChange('initiator.initiatorDetails.time', data.value)} disabled={!isEdit} />
            </Field>
        </div>
    );

    const renderSignatureTab = () => (
        <div className={styles.formGrid}>
            <Field
                label="Initiator Name"
                validationMessage={getError('prePermitChecks.initiatorSignature.name')}
                validationState={getError('prePermitChecks.initiatorSignature.name') ? 'error' : undefined}
            >
                <Input value={formData.prePermitChecks.initiatorSignature.name} onChange={(_, data) => handleChange('prePermitChecks.initiatorSignature.name', data.value)} disabled={!isEdit} />
                {!isEdit && <div className={styles.autoFillNote}><Person24Regular fontSize={10} /> Auto-filled</div>}
            </Field>
            <Field
                label="Signature"
                validationMessage={getError('prePermitChecks.initiatorSignature.signature')}
                validationState={getError('prePermitChecks.initiatorSignature.signature') ? 'error' : undefined}
            >
                <div className={styles.signatureBox}>
                    {formData.prePermitChecks.initiatorSignature.signature?.startsWith('http') ? (
                        <>
                            <img src={formData.prePermitChecks.initiatorSignature.signature} alt="Signature" className={styles.signatureImage} />
                            <Text size={100} style={{ color: '#28a745' }}><Checkmark24Regular fontSize={10} /> Loaded</Text>
                        </>
                    ) : (
                        <><Warning24Regular fontSize={20} style={{ color: '#999' }} /><Text size={100}>No image</Text></>
                    )}
                </div>
            </Field>
            <Field label="Date">
                <Input type="date" value={formatDate(formData.prePermitChecks.initiatorSignature.date)} onChange={(_, data) => handleChange('prePermitChecks.initiatorSignature.date', new Date(data.value))} disabled={!isEdit} />
            </Field>
            <Field label="Time">
                <Input type="time" value={formData.prePermitChecks.initiatorSignature.time} onChange={(_, data) => handleChange('prePermitChecks.initiatorSignature.time', data.value)} disabled={!isEdit} />
            </Field>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'basic': return renderBasicInfoTab();
            case 'associated': return renderAssociatedPermitsTab();
            case 'checkpoints': return renderCheckPointsTab();
            case 'prechecks': return renderPrePermitChecksTab();
            case 'initiator': return renderInitiatorDetailsTab();
            case 'signature': return renderSignatureTab();
            default: return null;
        }
    };

    return (
        <Drawer
            open={isOpen}
            onOpenChange={(_, { open }) => !open && onClose()}
            position="end"
            size="medium"
            className={styles.drawer}
        >
            <DrawerHeader>
                <DrawerHeaderTitle
                    action={<Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} />}
                >
                    {isEdit ? 'Edit Permit' : 'Create New Permit'}
                </DrawerHeaderTitle>
            </DrawerHeader>
            <DrawerBody className={styles.drawerBody}>
                {isLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <Spinner size="large" label="Loading..." />
                    </div>
                ) : (
                    <>
                        <TabList selectedValue={activeTab} onTabSelect={(_, data) => setActiveTab(data.value as string)} size="small" style={{ flexShrink: 0 }}>
                            <Tab value="basic">Basic</Tab>
                            <Tab value="associated">Permits</Tab>
                            <Tab value="checkpoints">Risks</Tab>
                            <Tab value="prechecks">Checks</Tab>
                            <Tab value="initiator">Initiator</Tab>
                            <Tab value="signature">Signature</Tab>
                        </TabList>

                        <div className={styles.tabContent}>{renderTabContent()}</div>

                        <div className={styles.buttonRow}>
                            <Button icon={<ChevronLeft24Regular />} appearance="secondary" onClick={goToPrevTab} disabled={isFirstTab}>Previous</Button>
                            {isLastTab ? (
                                <Button icon={<Save24Regular />} appearance="primary" onClick={handleSubmit} disabled={isSubmitting}>
                                    {isSubmitting ? <><Spinner size="tiny" /> Saving...</> : (isEdit ? 'Update' : 'Create')}
                                </Button>
                            ) : (
                                <Button icon={<ChevronRight24Regular />} iconPosition="after" appearance="primary" onClick={goToNextTab}>Next</Button>
                            )}
                        </div>
                    </>
                )}
            </DrawerBody>
        </Drawer>
    );
};

export default AddPermitDrawer;
