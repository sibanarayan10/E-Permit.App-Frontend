/**
 * Add/Edit Permit Form Page - Full functionality matching original
 * Includes: 6 tabs, initiator details, signature display, auto-fill, proper data structure
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    makeStyles,
    tokens,
    Card,
    Text,
    Button,
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
    ArrowLeft24Regular,
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
import { PageLoading } from '@/components/common';
import toast from 'react-hot-toast';
import { validateGeneralPermit, validateTab, fieldToTabMap, ValidationErrors } from '@/validations/generalPermitValidation';

const useStyles = makeStyles({
    container: {
        padding: tokens.spacingHorizontalL,
        paddingTop: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden',
    },
    header: {
        display: 'flex',
        alignItems: 'center',
        gap: tokens.spacingHorizontalM,
        marginBottom: tokens.spacingVerticalL,
    },
    title: {
        fontSize: tokens.fontSizeBase600,
        fontWeight: tokens.fontWeightSemibold,
    },
    subtitle: {
        fontSize: tokens.fontSizeBase300,
        color: tokens.colorNeutralForeground3,
    },
    card: {
        padding: tokens.spacingHorizontalXL,
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        overflow: 'hidden',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: tokens.spacingHorizontalL,
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
        },
    },
    formGrid3: {
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: tokens.spacingHorizontalL,
        '@media (max-width: 768px)': {
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
    },
    tabContent: {
        marginTop: tokens.spacingVerticalL,
        flex: 1,
        overflow: 'auto',
    },
    checklistGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: tokens.spacingHorizontalM,
    },
    riskCard: {
        padding: tokens.spacingHorizontalM,
        marginBottom: tokens.spacingVerticalM,
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground1,
    },
    riskCardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: tokens.spacingVerticalS,
        padding: tokens.spacingHorizontalS,
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: tokens.borderRadiusSmall,
    },
    signatureBox: {
        border: `1px solid ${tokens.colorNeutralStroke1}`,
        borderRadius: tokens.borderRadiusMedium,
        padding: tokens.spacingHorizontalL,
        textAlign: 'center' as const,
        backgroundColor: tokens.colorNeutralBackground2,
        minHeight: '120px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
    },
    signatureImage: {
        maxHeight: '80px',
        maxWidth: '200px',
        objectFit: 'contain' as const,
        marginBottom: '8px',
    },
    permitNumbersRow: {
        display: 'flex',
        gap: tokens.spacingHorizontalL,
        padding: tokens.spacingHorizontalL,
        backgroundColor: tokens.colorNeutralBackground3,
        borderRadius: tokens.borderRadiusMedium,
        marginBottom: tokens.spacingVerticalL,
    },
    permitNumberItem: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '4px',
    },
    autoFillNote: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: tokens.fontSizeBase100,
        color: tokens.colorNeutralForeground3,
        marginTop: '4px',
    },
    sectionTitle: {
        fontSize: tokens.fontSizeBase400,
        fontWeight: tokens.fontWeightSemibold,
        marginBottom: tokens.spacingVerticalM,
        color: tokens.colorNeutralForeground1,
    },
    associatedPermitItem: {
        padding: tokens.spacingHorizontalM,
        backgroundColor: tokens.colorNeutralBackground2,
        borderRadius: tokens.borderRadiusMedium,
        marginBottom: tokens.spacingVerticalS,
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

export const AddPermitFormPage: React.FC = () => {
    const styles = useStyles();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const { user } = useUser();
    const isEdit = Boolean(id);

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
            // Fetch default HIRA when toggle is turned on
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

    // Auto-fill user details
    useEffect(() => {
        if (!isEdit && user) {
            autoFillUserDetails();
        }
    }, [user, isEdit]);

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

    // Load permit data for edit
    useEffect(() => {
        if (id) {
            loadPermitData(id);
        }
    }, [id]);

    // Load permit numbers for new permits
    useEffect(() => {
        if (!isEdit) {
            loadNextNumbers();
        }
    }, [isEdit]);

    // Load locations
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
                    prePermitChecks: {
                        electricalIsolation: permit.prePermitChecks?.electricalIsolation || false,
                        mechanicalIsolation: permit.prePermitChecks?.mechanicalIsolation || false,
                        gasIsolation: permit.prePermitChecks?.gasIsolation || false,
                        utilitiesIsolation: permit.prePermitChecks?.utilitiesIsolation || false,
                        trafficAwareness: permit.prePermitChecks?.trafficAwareness || false,
                        relevantDeptAwareOfIsolation: permit.prePermitChecks?.relevantDeptAwareOfIsolation || false,
                        workingAtHeight: permit.prePermitChecks?.workingAtHeight || false,
                        workingInConfinedSpace: permit.prePermitChecks?.workingInConfinedSpace || false,
                        excavation: permit.prePermitChecks?.excavation || false,
                        gasTestingRequired: permit.prePermitChecks?.gasTestingRequired || false,
                        periodicGasTestingRequired: permit.prePermitChecks?.periodicGasTestingRequired || false,
                        multipleExecutingAgencies: permit.prePermitChecks?.multipleExecutingAgencies || false,
                        locationAccessible: permit.prePermitChecks?.locationAccessible || false,
                        fireDeptStandby: permit.prePermitChecks?.fireDeptStandby || false,
                        gasSafetyStandby: permit.prePermitChecks?.gasSafetyStandby || false,
                        ambulanceStandby: permit.prePermitChecks?.ambulanceStandby || false,
                        initiatorSignature: {
                            name: safeString(permit.prePermitChecks?.initiatorSignature?.name),
                            signature: safeString(permit.prePermitChecks?.initiatorSignature?.signature),
                            date: safeDate(permit.prePermitChecks?.initiatorSignature?.date),
                            time: safeString(permit.prePermitChecks?.initiatorSignature?.time) || new Date().toTimeString().slice(0, 5),
                        },
                    },
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
                toast.success('Permit data loaded');
            }
        } catch (error) {
            toast.error('Failed to load permit data');
            navigate('/permits');
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
            toast.error('Failed to generate automatic numbers');
        } finally {
            setLoadingNumbers(false);
        }
    };

    const loadLocationsData = async () => {
        try {
            const response = await getLocations();
            // Response data is Location[] with _id and name
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
            console.error('Failed to load sub-locations:', error);
            setSubLocations([]);
        } finally {
            setLoadingSubLocations(false);
        }
    };

    const handleChange = (path: string, value: any) => {
        setFormData(prev => {
            const keys = path.split('.');
            const newData = JSON.parse(JSON.stringify(prev)); // Deep clone
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

    const handleCheckPointChange = (
        index: number,
        field: 'riskAssessment' | 'hazardMitigationMeasures',
        value: string
    ) => {
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
                checkPoints: prev.initiator.checkPoints
                    .filter((_, i) => i !== index)
                    .map((cp, i) => ({ ...cp, sn: i + 1 })),
            },
        }));
    };

    const validateForm = async (): Promise<boolean> => {
        const result = await validateGeneralPermit(formData as any);
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

            // Clean up associated permits - ensure proper structure matching the model
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

            // Prepare submit data with proper date formatting
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
                prePermitChecks: {
                    ...formData.prePermitChecks,
                    initiatorSignature: {
                        ...formData.prePermitChecks.initiatorSignature,
                        date: formData.prePermitChecks.initiatorSignature.date instanceof Date
                            ? formatDateForSubmit(formData.prePermitChecks.initiatorSignature.date)
                            : formData.prePermitChecks.initiatorSignature.date,
                    },
                },
                // HIRA Linkage
                isHiraRequired: formData.isHiraRequired,
                hiraId: formData.isHiraRequired ? formData.hiraId : null,
            };

            if (isEdit && id) {
                await editPermitDetails(id, submitData as any);
                toast.success('Permit updated successfully!');
            } else {
                await createPermit(submitData as any);
                toast.success('Permit created successfully!');
            }
            navigate('/permits');
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
            const result = await validateTab(formData as any, activeTab, 'page');
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

    if (isLoading) {
        return <PageLoading label="Loading permit..." />;
    }

    // === TAB RENDERERS ===

    const renderBasicInfoTab = () => (
        <div>
            {/* Permit Numbers Row */}
            <div className={styles.permitNumbersRow}>
                <div className={styles.permitNumberItem}>
                    <Text size={200} weight="medium">Permit Number</Text>
                    <Badge appearance="outline" size="large">
                        {loadingNumbers ? <Spinner size="tiny" /> : (formData.permitNumber || 'Generating...')}
                    </Badge>
                </div>
                <div className={styles.permitNumberItem}>
                    <Text size={200} weight="medium">Protocol Number</Text>
                    {loadingNumbers ? (
                        <Badge appearance="outline" size="large">
                            <Spinner size="tiny" />
                        </Badge>
                    ) : (
                        <Input
                            value={formData.protocolNumber}
                            onChange={(_, data) => handleChange('protocolNumber', data.value)}
                            placeholder="Enter protocol number"
                            style={{ minWidth: '120px' }}
                        />
                    )}
                </div>
                <div className={styles.permitNumberItem}>
                    <Text size={200} weight="medium">SR No.</Text>
                    <Badge appearance="outline" size="large">
                        {loadingNumbers ? <Spinner size="tiny" /> : (formData.srNo || 'Generating...')}
                    </Badge>
                </div>
            </div>

            <div className={styles.formGrid}>
                <Field
                    label="Brief Description of Work *"
                    required
                    className={styles.fullWidth}
                    validationMessage={getError('initiator.briefDescriptionOfWork')}
                    validationState={getError('initiator.briefDescriptionOfWork') ? 'error' : undefined}
                >
                    <Textarea
                        value={formData.initiator.briefDescriptionOfWork}
                        onChange={(_, data) => handleChange('initiator.briefDescriptionOfWork', data.value)}
                        placeholder="Provide a brief description of the work to be performed..."
                        rows={3}
                    />
                </Field>

                <Field label="Equipment Name/No.">
                    <Input
                        value={formData.initiator.equipmentLocation.equipmentNameNo}
                        onChange={(_, data) => handleChange('initiator.equipmentLocation.equipmentNameNo', data.value)}
                        placeholder="Equipment identification"
                    />
                </Field>

                <Field label="Location Name (Manual)">
                    <Input
                        value={formData.initiator.equipmentLocation.locationName}
                        onChange={(_, data) => handleChange('initiator.equipmentLocation.locationName', data.value)}
                        placeholder="Enter specific location name"
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
                        {locations.map(loc => (
                            <Option key={loc} value={loc}>{loc}</Option>
                        ))}
                    </Dropdown>
                </Field>

                <Field
                    label="DIC *"
                    required
                    validationMessage={getError('initiator.equipmentLocation.subLocation')}
                    validationState={getError('initiator.equipmentLocation.subLocation') ? 'error' : undefined}
                >
                    <Dropdown
                        placeholder={loadingSubLocations ? 'Loading...' : 'Select Sub Location'}
                        value={formData.initiator.equipmentLocation.subLocation}
                        onOptionSelect={(_, data) => handleChange('initiator.equipmentLocation.subLocation', data.optionValue || '')}
                        disabled={!formData.initiator.equipmentLocation.location || loadingSubLocations}
                    >
                        {subLocations.map(loc => (
                            <Option key={loc} value={loc}>{loc}</Option>
                        ))}
                    </Dropdown>
                </Field>

                <Field label="From Date">
                    <Input
                        type="date"
                        value={formatDate(formData.initiator.periodOfWork.from.date)}
                        onChange={(_, data) => {
                            // Parse as local date to avoid timezone issues
                            const [year, month, day] = data.value.split('-').map(Number);
                            if (year !== undefined && month !== undefined && day !== undefined) {
                                handleChange('initiator.periodOfWork.from.date', new Date(year, month - 1, day));
                            }
                        }}
                    />
                </Field>

                <Field
                    label="To Date"
                    validationMessage={getError('initiator.periodOfWork.to.date')}
                    validationState={getError('initiator.periodOfWork.to.date') ? 'error' : undefined}
                >
                    <Input
                        type="date"
                        value={formatDate(formData.initiator.periodOfWork.to.date)}
                        onChange={(_, data) => {
                            // Parse as local date to avoid timezone issues
                            const [year, month, day] = data.value.split('-').map(Number);
                            if (year !== undefined && month !== undefined && day !== undefined) {
                                handleChange('initiator.periodOfWork.to.date', new Date(year, month - 1, day));
                            }
                        }}
                    />
                </Field>

                <Field label="From Time *">
                    <Input
                        type="time"
                        value={formData.initiator.periodOfWork.from.hrs}
                        onChange={(_, data) => handleChange('initiator.periodOfWork.from.hrs', data.value)}
                    />
                </Field>

                <Field label="To Time *">
                    <Input
                        type="time"
                        value={formData.initiator.periodOfWork.to.hrs}
                        onChange={(_, data) => handleChange('initiator.periodOfWork.to.hrs', data.value)}
                    />
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
            <div>
                <Text className={styles.sectionTitle}>Select Associated Permits (if any)</Text>
                <div className={styles.formGrid}>
                    {permits.map(permit => (
                        <div key={permit.key} className={styles.associatedPermitItem}>
                            <Checkbox
                                checked={(formData.initiator.associatedPermits as any)[permit.key]?.checked}
                                onChange={(_, data) => handleChange(`initiator.associatedPermits.${permit.key}.checked`, data.checked === true)}
                                label={permit.label}
                            />
                            {(formData.initiator.associatedPermits as any)[permit.key]?.checked && (
                                <Input
                                    placeholder="S/No."
                                    value={(formData.initiator.associatedPermits as any)[permit.key]?.sNo || ''}
                                    onChange={(_, data) => handleChange(`initiator.associatedPermits.${permit.key}.sNo`, data.value)}
                                    style={{ marginTop: '8px', marginLeft: '28px' }}
                                />
                            )}
                        </div>
                    ))}
                    <div className={styles.associatedPermitItem}>
                        <Checkbox
                            checked={formData.initiator.associatedPermits.other.checked}
                            onChange={(_, data) => handleChange('initiator.associatedPermits.other.checked', data.checked === true)}
                            label="Other"
                        />
                        {formData.initiator.associatedPermits.other.checked && (
                            <Input
                                placeholder="Description"
                                value={formData.initiator.associatedPermits.other.description}
                                onChange={(_, data) => handleChange('initiator.associatedPermits.other.description', data.value)}
                                style={{ marginTop: '8px', marginLeft: '28px' }}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const renderCheckPointsTab = () => (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Text className={styles.sectionTitle}>Check Points / Risk Assessment</Text>
                <Button icon={<Add24Regular />} appearance="primary" onClick={addCheckPoint}>Add Check Point</Button>
            </div>

            {formData.initiator.checkPoints.map((cp, index) => (
                <div key={index} className={styles.riskCard}>
                    <div className={styles.riskCardHeader}>
                        <Text weight="semibold">Check Point {cp.sn}</Text>
                        <Button
                            icon={<Delete24Regular />}
                            appearance="subtle"
                            size="small"
                            onClick={() => removeCheckPoint(index)}
                            disabled={formData.initiator.checkPoints.length <= 2}
                        />
                    </div>
                    <Field label="Risk Assessment" style={{ marginBottom: '12px' }}>
                        <Textarea
                            placeholder="Any additional risk foreseen..."
                            value={cp.riskAssessment}
                            onChange={(_, data) => handleCheckPointChange(index, 'riskAssessment', data.value)}
                            rows={2}
                        />
                    </Field>
                    <Field label="Hazard Mitigation Measures">
                        <Textarea
                            placeholder="Hazard mitigation measures in place..."
                            value={cp.hazardMitigationMeasures}
                            onChange={(_, data) => handleCheckPointChange(index, 'hazardMitigationMeasures', data.value)}
                            rows={2}
                        />
                    </Field>
                </div>
            ))}
        </div>
    );

    const renderPrePermitChecksTab = () => {
        const checks = [
            { key: 'electricalIsolation', label: 'Electrical Isolation Done' },
            { key: 'mechanicalIsolation', label: 'Mechanical Isolation Done' },
            { key: 'gasIsolation', label: 'Gas Isolation Done' },
            { key: 'utilitiesIsolation', label: 'Utilities Isolation Done' },
            { key: 'trafficAwareness', label: 'Traffic Awareness Required' },
            { key: 'relevantDeptAwareOfIsolation', label: 'Relevant Dept. Aware of Isolation' },
            { key: 'workingAtHeight', label: 'Working at Height' },
            { key: 'workingInConfinedSpace', label: 'Working in Confined Space' },
            { key: 'excavation', label: 'Excavation Work' },
            { key: 'gasTestingRequired', label: 'Gas Testing Required' },
            { key: 'periodicGasTestingRequired', label: 'Periodic Gas Testing Required' },
            { key: 'multipleExecutingAgencies', label: 'Multiple Executing Agencies' },
            { key: 'locationAccessible', label: 'Location Accessible' },
            { key: 'fireDeptStandby', label: 'Fire Dept. Standby Required' },
            { key: 'gasSafetyStandby', label: 'Gas Safety Standby Required' },
            { key: 'ambulanceStandby', label: 'Ambulance Standby Required' },
        ];

        return (
            <div>
                <Text className={styles.sectionTitle}>Pre-Permit Safety Checks</Text>
                <div className={styles.checklistGrid}>
                    {checks.map(check => (
                        <Checkbox
                            key={check.key}
                            checked={(formData.prePermitChecks as any)[check.key]}
                            onChange={(_, data) => handleChange(`prePermitChecks.${check.key}`, data.checked === true)}
                            label={check.label}
                        />
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
        <div>
            <Text className={styles.sectionTitle}>Initiator Details</Text>
            <div className={styles.formGrid}>
                <Field
                    label="Initiator Name"
                    validationMessage={getError('initiator.initiatorDetails.name')}
                    validationState={getError('initiator.initiatorDetails.name') ? 'error' : undefined}
                >
                    <Input
                        value={formData.initiator.initiatorDetails.name}
                        onChange={(_, data) => handleChange('initiator.initiatorDetails.name', data.value)}
                        placeholder="Enter name"
                        disabled={!isEdit}
                    />
                    {!isEdit && (
                        <div className={styles.autoFillNote}>
                            <Person24Regular fontSize={12} />
                            Auto-filled with your profile: {user?.name}
                        </div>
                    )}
                </Field>

                <Field
                    label="Signature"
                    validationMessage={getError('initiator.initiatorDetails.signature')}
                    validationState={getError('initiator.initiatorDetails.signature') ? 'error' : undefined}
                >
                    <div className={styles.signatureBox}>
                        {formData.initiator.initiatorDetails.signature?.startsWith('http') ? (
                            <>
                                <img
                                    src={formData.initiator.initiatorDetails.signature}
                                    alt="Signature"
                                    className={styles.signatureImage}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#28a745' }}>
                                    <Checkmark24Regular fontSize={14} />
                                    <Text size={200}>Signature image will be used</Text>
                                </div>
                            </>
                        ) : (
                            <>
                                <Warning24Regular fontSize={32} style={{ color: '#6c757d', marginBottom: '8px' }} />
                                <Text size={300} style={{ color: '#6c757d' }}>No signature image available</Text>
                                <Text size={200} style={{ color: '#999', marginTop: '4px' }}>
                                    Text signature will be used: {formData.initiator.initiatorDetails.signature || 'Not specified'}
                                </Text>
                            </>
                        )}
                    </div>
                </Field>

                <Field label="Date">
                    <Input
                        type="date"
                        value={formatDate(formData.initiator.initiatorDetails.date)}
                        onChange={(_, data) => handleChange('initiator.initiatorDetails.date', new Date(data.value))}
                        disabled={!isEdit}
                    />
                </Field>

                <Field label="Time">
                    <Input
                        type="time"
                        value={formData.initiator.initiatorDetails.time}
                        onChange={(_, data) => handleChange('initiator.initiatorDetails.time', data.value)}
                        disabled={!isEdit}
                    />
                </Field>
            </div>
        </div>
    );

    const renderPrePermitSignatureTab = () => (
        <div>
            <Text className={styles.sectionTitle}>Pre-Permit Checks - Initiator Signature</Text>
            <div className={styles.formGrid}>
                <Field
                    label="Initiator Name"
                    validationMessage={getError('prePermitChecks.initiatorSignature.name')}
                    validationState={getError('prePermitChecks.initiatorSignature.name') ? 'error' : undefined}
                >
                    <Input
                        value={formData.prePermitChecks.initiatorSignature.name}
                        onChange={(_, data) => handleChange('prePermitChecks.initiatorSignature.name', data.value)}
                        placeholder="Enter name"
                        disabled={!isEdit}
                    />
                    {!isEdit && (
                        <div className={styles.autoFillNote}>
                            <Person24Regular fontSize={12} />
                            Auto-filled with your profile: {user?.name}
                        </div>
                    )}
                </Field>

                <Field
                    label="Signature"
                    validationMessage={getError('prePermitChecks.initiatorSignature.signature')}
                    validationState={getError('prePermitChecks.initiatorSignature.signature') ? 'error' : undefined}
                >
                    <div className={styles.signatureBox}>
                        {formData.prePermitChecks.initiatorSignature.signature?.startsWith('http') ? (
                            <>
                                <img
                                    src={formData.prePermitChecks.initiatorSignature.signature}
                                    alt="Signature"
                                    className={styles.signatureImage}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#28a745' }}>
                                    <Checkmark24Regular fontSize={14} />
                                    <Text size={200}>Signature image will be used</Text>
                                </div>
                            </>
                        ) : (
                            <>
                                <Warning24Regular fontSize={32} style={{ color: '#6c757d', marginBottom: '8px' }} />
                                <Text size={300} style={{ color: '#6c757d' }}>No signature image available</Text>
                                <Text size={200} style={{ color: '#999', marginTop: '4px' }}>
                                    Text signature will be used: {formData.prePermitChecks.initiatorSignature.signature || 'Not specified'}
                                </Text>
                            </>
                        )}
                    </div>
                </Field>

                <Field label="Date">
                    <Input
                        type="date"
                        value={formatDate(formData.prePermitChecks.initiatorSignature.date)}
                        onChange={(_, data) => handleChange('prePermitChecks.initiatorSignature.date', new Date(data.value))}
                        disabled={!isEdit}
                    />
                </Field>

                <Field label="Time">
                    <Input
                        type="time"
                        value={formData.prePermitChecks.initiatorSignature.time}
                        onChange={(_, data) => handleChange('prePermitChecks.initiatorSignature.time', data.value)}
                        disabled={!isEdit}
                    />
                </Field>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'basic': return renderBasicInfoTab();
            case 'associated': return renderAssociatedPermitsTab();
            case 'checkpoints': return renderCheckPointsTab();
            case 'prechecks': return renderPrePermitChecksTab();
            case 'initiator': return renderInitiatorDetailsTab();
            case 'signature': return renderPrePermitSignatureTab();
            default: return null;
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <Button
                    icon={<ArrowLeft24Regular />}
                    appearance="subtle"
                    size="large"
                    onClick={() => navigate('/permits')}
                />
                <div>
                    <Text className={styles.title}>
                        {isEdit ? 'Edit Permit' : 'Create New Electrical Permit'}
                    </Text>
                    <Text className={styles.subtitle}>
                        Permit to Work • {formData.permitNumber || 'Generating...'}
                    </Text>
                </div>
            </div>

            {/* Form Card */}
            <Card className={styles.card}>
                {/* Tabs */}
                <TabList
                    selectedValue={activeTab}
                    onTabSelect={(_, data) => setActiveTab(data.value as string)}
                    size="large"
                >
                    <Tab value="basic">Basic Info</Tab>
                    <Tab value="associated">Associated Permits</Tab>
                    <Tab value="checkpoints">Risk Assessment</Tab>
                    <Tab value="prechecks">Pre-Permit Checks</Tab>
                    <Tab value="initiator">Initiator Details</Tab>
                    <Tab value="signature">Signature</Tab>
                </TabList>

                {/* Tab Content */}
                <div className={styles.tabContent}>
                    {renderTabContent()}
                </div>

                {/* Navigation Buttons */}
                <div className={styles.buttonRow}>
                    <Button
                        icon={<ChevronLeft24Regular />}
                        appearance="secondary"
                        size="large"
                        onClick={goToPrevTab}
                        disabled={isFirstTab}
                    >
                        Previous
                    </Button>

                    {isLastTab ? (
                        <Button
                            icon={<Save24Regular />}
                            appearance="primary"
                            size="large"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <Spinner size="tiny" style={{ marginRight: '8px' }} />
                                    Saving...
                                </>
                            ) : (
                                isEdit ? 'Update Permit' : 'Create Permit'
                            )}
                        </Button>
                    ) : (
                        <Button
                            icon={<ChevronRight24Regular />}
                            iconPosition="after"
                            appearance="primary"
                            size="large"
                            onClick={goToNextTab}
                        >
                            Next
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AddPermitFormPage;
