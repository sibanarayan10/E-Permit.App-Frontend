/**
 * Create Height Permit Drawer
 * Multi-tab form for creating Height Work Permits
 */

import React, { useState, useEffect } from 'react';
import {
    Drawer,
    DrawerHeader,
    DrawerHeaderTitle,
    DrawerBody,
    Button,
    Input,
    Textarea,
    Field,
    makeStyles,
    tokens,
    TabList,
    Tab,
    Checkbox,
    Radio,
    RadioGroup,
    Spinner,
} from '@fluentui/react-components';
import {
    Dismiss24Regular,
    ChevronLeft24Regular,
    ChevronRight24Regular,
    Save24Regular,
} from '@fluentui/react-icons';
import toast from 'react-hot-toast';
import {
    getNextHeightPermitNumbers,
    createHeightPermit,
    updateHeightPermit,
    getHeightPermitById,
} from '@/services';
import { useUser } from '@/context';
import type { HeightPermit, HeightPermitCreateInput } from '@/models';
import { validateHeightPermit, ValidationErrors } from '@/validations/heightPermitValidation';

const useStyles = makeStyles({
    drawer: {
        width: '500px',
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
    tabContent: {
        marginTop: tokens.spacingVerticalM,
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingRight: '4px',
    },
    section: {
        padding: tokens.spacingVerticalM,
        marginBottom: tokens.spacingVerticalM,
        border: `1px solid ${tokens.colorNeutralStroke2}`,
        borderRadius: tokens.borderRadiusMedium,
        backgroundColor: tokens.colorNeutralBackground1,
        '@media (max-width: 768px)': {
            padding: tokens.spacingVerticalS,
            marginBottom: tokens.spacingVerticalS,
        },
    },
    sectionTitle: {
        fontSize: tokens.fontSizeBase300,
        fontWeight: tokens.fontWeightSemibold,
        marginBottom: tokens.spacingVerticalS,
        color: tokens.colorBrandForeground1,
    },
    fieldRow: {
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: tokens.spacingHorizontalM,
        '@media (max-width: 600px)': {
            gridTemplateColumns: '1fr',
        },
    },
    checkboxGroup: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: tokens.spacingVerticalXS,
        '@media (max-width: 768px)': {
            gridTemplateColumns: '1fr',
        },
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
});

interface CreateHeightPermitDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (permitId?: string) => void;
    permitToEdit?: HeightPermit | null;
}

export const CreateHeightPermitDrawer: React.FC<CreateHeightPermitDrawerProps> = ({
    isOpen,
    onClose,
    onSuccess,
    permitToEdit,
}) => {
    const styles = useStyles();
    const { user, signature } = useUser();

    // Tab order for navigation
    const tabOrder = ['basic', 'hazards', 'context', 'assessment'];
    const [selectedTab, setSelectedTab] = useState<string>('basic');
    const [loading, setLoading] = useState(false);

    // Navigation helpers
    const isFirstTab = selectedTab === tabOrder[0];
    const isLastTab = selectedTab === tabOrder[tabOrder.length - 1];
    const [formData, setFormData] = useState<HeightPermitCreateInput>(getDefaultFormData());
    const [formErrors, setFormErrors] = useState<ValidationErrors>({});

    /** Shortcut: returns the error message for a given field path, or undefined */
    const getError = (path: string): string | undefined => formErrors[path];

    // Helper to get default form data with current dates
    function getDefaultFormData(): HeightPermitCreateInput {
        const now = new Date();
        const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const formatDate = (d: Date) => d.toISOString().split('T')[0] || '';
        const formatTime = (d: Date) => d.toTimeString().slice(0, 5);

        return {
            permitNumber: '',
            protocolNumber: '',
            srNo: '',
            personOrContractorResponsible: {
                name: '',
                nameOfContractorsSupervisor: '',
                nameOfDepartmentalRepresentative: '',
            },
            jobLocation: '',
            jobDescription: '',
            schedule: {
                startTimeDate: { date: formatDate(now), hrs: formatTime(now) },
                finishTimeDate: { date: formatDate(tomorrow), hrs: '17:00' },
            },
            hazardsAssociated: {
                fallingObjects: false,
                highWinds: false,
                weatherConditions: false,
                unguardedEdges: false,
                manualHandlingOfLoads: false,
                riskOfFallingPersons: false,
                overheadElectricCables: false,
                unsecuredLadders: false,
                illumination: false,
                unevenFloorSurfaces: false,
                fragileRoofs: false,
                equipmentMachinery: false,
                other: '',
            },
            fallProtectionSystem: {
                travelRestraintSystem: false,
                workPositioningSystem: false,
                fallArrestSystem: false,
            },
            workContext: {
                onRoofSurface: { selected: false, hazardsAssessed: 'NO', canWorkProceed: 'NO', remark: '' },
                nearExposedEdge: { selected: false, hazardsAssessed: 'NO', canWorkProceed: 'NO', remark: '' },
                nearOpenHole: { selected: false, hazardsAssessed: 'NO', canWorkProceed: 'NO', remark: '' },
                onHeavyPlantAndMachinery: { selected: false, hazardsAssessed: 'NO', canWorkProceed: 'NO', remark: '' },
                onTowerStructure: { selected: false, hazardsAssessed: 'NO', canWorkProceed: 'NO', remark: '' },
                erectingScaffold: { selected: false, hazardsAssessed: 'NO', canWorkProceed: 'NO', remark: '' },
                onCrane: { selected: false, hazardsAssessed: 'NO', canWorkProceed: 'NO', remark: '' },
                other: { selected: false, hazardsAssessed: 'NO', canWorkProceed: 'NO', remark: '' },
            },
            fallProtectionEquipment: {
                lanyardFixedLength: { selected: false, inspected: 'NO', remark: '' },
                rearAttachment: { selected: false, inspected: 'NO', remark: '' },
                frontAttachment: { selected: false, inspected: 'NO', remark: '' },
                isConnectorCompatible: { selected: false, inspected: 'NO', remark: '' },
                retractableLanyardType2NoWinchWebbing: { selected: false, inspected: 'NO', remark: '' },
                retractableLanyardType2NoWinchCable: { selected: false, inspected: 'NO', remark: '' },
                retractableLanyardType3WinchCable: { selected: false, inspected: 'NO', remark: '' },
                poleStrapBelt: { selected: false, inspected: 'NO', remark: '' },
                fullBodyHarnessFallArrest: { selected: false, inspected: 'NO', remark: '' },
                fullBodyHarnessWorkPositioning: { selected: false, inspected: 'NO', remark: '' },
                safetyNet: { selected: false, inspected: 'NO', remark: '' },
            },
            methodOfAccess: {
                portableExtensionLadder: { selected: false, inspected: 'NO', surroundingHazardsControlled: 'NO' },
                fixedLadderWithCable: { selected: false, inspected: 'NO', surroundingHazardsControlled: 'NO' },
                elevatingWorkPlatform: { selected: false, inspected: 'NO', surroundingHazardsControlled: 'NO' },
                manCage: { selected: false, inspected: 'NO', surroundingHazardsControlled: 'NO' },
                scissorLift: { selected: false, inspected: 'NO', surroundingHazardsControlled: 'NO' },
                climbingTechnique: { selected: false, inspected: 'NO', surroundingHazardsControlled: 'NO' },
                permanentStaircase: { selected: false, inspected: 'NO', surroundingHazardsControlled: 'NO' },
                permanentMonkeyLadder: { selected: false, inspected: 'NO', surroundingHazardsControlled: 'NO' },
                scaffolding: { selected: false, inspected: 'NO', surroundingHazardsControlled: 'NO' },
                other: { selected: false, inspected: 'NO', surroundingHazardsControlled: 'NO', description: '' },
            },
            riskAssessment: {
                HIRAOrJSACompleted: 'NO',
            },
            numberOfPersonsAuthorized: [],
            permissionToWork: {
                personResponsibleForWork: { name: '', designation: '', department: '', signature: '', date: '', time: '' },
                executingAgency: { name: '', designation: '', department: '', signature: '', date: '', time: '' },
                authorisingPerson: { name: '', designation: '', department: '', signature: '', date: '', time: '' },
            },
            jobCompletionCancellation: {
                personResponsibleForWork: { name: '', designation: '', department: '', signature: '', date: '', time: '' },
                executingAgency: { name: '', designation: '', department: '', signature: '', date: '', time: '' },
                authorisingPerson: { name: '', designation: '', department: '', signature: '', date: '', time: '' },
            },
            incidentsOrNearMisses: 'NO',
            initiatorSignature: {
                name: user?.name || '',
                signature: signature || '',
                date: formatDate(now),
                time: formatTime(now),
            }
        };
    }


    // Reset form when drawer opens for new permit (not editing)
    useEffect(() => {
        if (isOpen && !permitToEdit) {
            // Reset form to default values
            setFormData(getDefaultFormData());
            setFormErrors({});
            // Reset to first tab
            setSelectedTab('basic');
            // Load fresh permit numbers
            loadPermitNumbers();
        }
    }, [isOpen, permitToEdit]);

    // Load permit data for editing - fetch from backend if only ID is provided
    useEffect(() => {
        const loadPermitData = async () => {
            if (!permitToEdit || !permitToEdit._id) return;

            // Check if we already have full data (more than just _id)
            if (permitToEdit.permitNumber) {
                // Already have full data, use it directly
                populateFormWithPermitData(permitToEdit);
                return;
            }

            // Only have ID, fetch full data from backend
            try {
                setLoading(true);
                const response = await getHeightPermitById(permitToEdit._id);
                if (response.success && response.data) {
                    populateFormWithPermitData(response.data);
                }
            } catch (error: any) {
                toast.error('Failed to load permit data for editing');
                console.error('Error loading permit:', error);
            } finally {
                setLoading(false);
            }
        };

        if (isOpen && permitToEdit) {
            loadPermitData();
        }
    }, [isOpen, permitToEdit]);

    // Helper function to populate form with permit data
    const populateFormWithPermitData = (permit: any) => {
        const defaults = getDefaultFormData();

        // Helper to convert 'YES'/'NO' or other values to boolean if needed
        const toBool = (val: any) => val === true || val === 'YES';

        // Sanitize hazards to booleans
        const sanitizedHazards = { ...defaults.hazardsAssociated };
        if (permit.hazardsAssociated) {
            Object.keys(permit.hazardsAssociated).forEach(key => {
                (sanitizedHazards as any)[key] = toBool(permit.hazardsAssociated[key]);
            });
            // Keep 'other' as string
            if (permit.hazardsAssociated.other) sanitizedHazards.other = permit.hazardsAssociated.other;
        }

        // Sanitize fall protection system
        const sanitizedFPS = { ...defaults.fallProtectionSystem };
        if (permit.fallProtectionSystem) {
            // Handle old structure where keys might be nested in 'type' or different
            // New structure: simple booleans at top level of fallProtectionSystem
            if (permit.fallProtectionSystem.type) {
                // Creating from old structure
                sanitizedFPS.travelRestraintSystem = toBool(permit.fallProtectionSystem.type.fullRestrictedSystem);
                sanitizedFPS.workPositioningSystem = toBool(permit.fallProtectionSystem.type.workPositioningSystem);
                sanitizedFPS.fallArrestSystem = toBool(permit.fallProtectionSystem.type.fallArrestSystem);
            } else {
                // New structure
                Object.keys(permit.fallProtectionSystem).forEach(key => {
                    (sanitizedFPS as any)[key] = toBool(permit.fallProtectionSystem[key]);
                });
            }
        }

        // Sanitize Authorized Persons (handle old string format)
        let sanitizedPersons: any[] = [];
        if (Array.isArray(permit.numberOfPersonsAuthorized)) {
            sanitizedPersons = permit.numberOfPersonsAuthorized;
        } else if (typeof permit.numberOfPersonsAuthorized === 'string' && permit.numberOfPersonsAuthorized) {
            // Convert old string to single entry array
            sanitizedPersons = [{ name: permit.numberOfPersonsAuthorized, heightPassRefNo: '' }];
        }

        setFormData({
            permitNumber: permit.permitNumber || '',
            protocolNumber: permit.protocolNumber || '',
            srNo: permit.srNo || '',
            personOrContractorResponsible: permit.personOrContractorResponsible || defaults.personOrContractorResponsible,
            jobLocation: permit.jobLocation || '',
            jobDescription: permit.jobDescription || '',
            schedule: permit.schedule || defaults.schedule,
            hazardsAssociated: sanitizedHazards,
            fallProtectionSystem: sanitizedFPS,
            workContext: { ...defaults.workContext, ...permit.workContext },
            fallProtectionEquipment: { ...defaults.fallProtectionEquipment, ...permit.fallProtectionEquipment },
            methodOfAccess: { ...defaults.methodOfAccess, ...permit.methodOfAccess },
            riskAssessment: { ...defaults.riskAssessment, ...permit.riskAssessment },
            numberOfPersonsAuthorized: sanitizedPersons,
            permissionToWork: permit.permissionToWork || defaults.permissionToWork,
            jobCompletionCancellation: permit.jobCompletionCancellation || defaults.jobCompletionCancellation,
            incidentsOrNearMisses: permit.incidentsOrNearMisses || (permit.wereInjuries === 'YES' ? 'YES' : 'NO'),
            initiatorSignature: permit.initiatorSignature || defaults.initiatorSignature,
        });
    };

    const loadPermitNumbers = async () => {
        try {
            const response = await getNextHeightPermitNumbers();
            if (response.success) {
                setFormData((prev) => ({
                    ...prev,
                    permitNumber: response.data.permitNumber,
                    protocolNumber: response.data.protocolNumber,
                    srNo: response.data.srNo,
                }));
            }
        } catch (error: any) {
            toast.error('Failed to load permit numbers');
        }
    };

    const validateForm = async (): Promise<boolean> => {
        const result = await validateHeightPermit(formData as any);
        if (result.valid) {
            setFormErrors({});
            return true;
        }
        // Show errors inline
        setFormErrors(result.errors);
        // Navigate to the tab that contains the first error
        if (result.firstErrorTab) {
            setSelectedTab(result.firstErrorTab);
        }
        return false;
    };

    const handleSubmit = async () => {
        setFormErrors({});
        const isValid = await validateForm();
        if (!isValid) return;

        setLoading(true);
        try {
            let submitData = { ...formData };

            // For new permits, get fresh permit numbers right before submission
            // This ensures we don't get duplicate protocol numbers
            if (!permitToEdit) {
                try {
                    const numbersResponse = await getNextHeightPermitNumbers();
                    if (numbersResponse.success) {
                        submitData = {
                            ...submitData,
                            permitNumber: numbersResponse.data.permitNumber,
                            protocolNumber: numbersResponse.data.protocolNumber,
                            srNo: numbersResponse.data.srNo,
                        };
                    }
                } catch (error) {
                    // Continue with existing numbers if refresh fails
                    console.warn('Failed to refresh permit numbers, using existing');
                }
            }

            let response;
            if (permitToEdit) {
                response = await updateHeightPermit(permitToEdit._id!, submitData);
            } else {
                response = await createHeightPermit(submitData);
            }

            if (response.success) {
                toast.success(permitToEdit ? 'Height permit updated successfully' : 'Height permit created successfully');
                // Pass the new permit ID to the callback (for new permits only)
                const permitId = permitToEdit ? undefined : response.data?._id;
                onSuccess?.(permitId);
                onClose();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save height permit');
        } finally {
            setLoading(false);
        }
    };

    // Tab navigation
    const goToNextTab = () => {
        const currentIndex = tabOrder.indexOf(selectedTab);
        const nextTab = tabOrder[currentIndex + 1];
        if (currentIndex < tabOrder.length - 1 && nextTab !== undefined) {
            setSelectedTab(nextTab);
        }
    };

    const goToPrevTab = () => {
        const currentIndex = tabOrder.indexOf(selectedTab);
        const prevTab = tabOrder[currentIndex - 1];
        if (currentIndex > 0 && prevTab !== undefined) {
            setSelectedTab(prevTab);
        }
    };

    const updateField = (path: string, value: any) => {
        setFormData((prev) => {
            const keys = path.split('.');
            const newData = { ...prev };
            let current: any = newData;

            for (let i = 0; i < keys.length - 1; i++) {
                const key = keys[i];
                if (key === undefined) continue;

                if (!current[key]) {
                    current[key] = {};
                } else {
                    current[key] = { ...current[key] };
                }
                current = current[key];
            }

            const lastKey = keys[keys.length - 1];
            if (lastKey !== undefined) {
                current[lastKey] = value;
            }
            return newData;
        });
    };

    const renderBasicInfoTab = () => (
        <div className={styles.tabContent}>
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Permit Numbers</div>
                <div className={styles.fieldRow}>
                    <Field label="Permit Number" required validationMessage={getError('permitNumber')}>
                        <Input
                            value={formData.permitNumber}
                            onChange={(e) => updateField('permitNumber', e.target.value)}
                            disabled={!!permitToEdit}
                        />
                    </Field>
                    <Field label="Protocol Number" validationMessage={getError('protocolNumber')}>
                        <Input
                            value={formData.protocolNumber}
                            onChange={(e) => updateField('protocolNumber', e.target.value)}
                            disabled={!!permitToEdit}
                        />
                    </Field>
                    <Field label="SR Number" validationMessage={getError('srNo')}>
                        <Input
                            value={formData.srNo}
                            onChange={(e) => updateField('srNo', e.target.value)}
                            disabled={!!permitToEdit}
                        />
                    </Field>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>Responsible Party</div>
                <div className={styles.fieldRow}>
                    <Field label="Person or Contractor Responsible" required validationMessage={getError('personOrContractorResponsible.name')}>
                        <Input
                            value={formData.personOrContractorResponsible?.name}
                            onChange={(e) => updateField('personOrContractorResponsible.name', e.target.value)}
                        />
                    </Field>
                    <Field label="Name of Contractor's Supervisor" validationMessage={getError('personOrContractorResponsible.nameOfContractorsSupervisor')}>
                        <Input
                            value={formData.personOrContractorResponsible?.nameOfContractorsSupervisor}
                            onChange={(e) =>
                                updateField('personOrContractorResponsible.nameOfContractorsSupervisor', e.target.value)
                            }
                        />
                    </Field>
                    <Field label="Name of Departmental Representative" validationMessage={getError('personOrContractorResponsible.nameOfDepartmentalRepresentative')}>
                        <Input
                            value={formData.personOrContractorResponsible?.nameOfDepartmentalRepresentative}
                            onChange={(e) =>
                                updateField('personOrContractorResponsible.nameOfDepartmentalRepresentative', e.target.value)
                            }
                        />
                    </Field>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>Job Details</div>
                <Field label="Job Location" required validationMessage={getError('jobLocation')}>
                    <Input
                        value={formData.jobLocation}
                        onChange={(e) => updateField('jobLocation', e.target.value)}
                    />
                </Field>
                <div style={{ height: '10px' }} />
                <Field label="Job Description" required validationMessage={getError('jobDescription')}>
                    <Textarea
                        value={formData.jobDescription}
                        onChange={(e) => updateField('jobDescription', e.target.value)}
                        rows={3}
                    />
                </Field>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>Schedule</div>
                <div className={styles.fieldRow}>
                    <Field label="Start Date" required validationMessage={getError('schedule.startTimeDate.date')}>
                        <Input
                            type="date"
                            value={typeof formData.schedule?.startTimeDate?.date === 'string' ? formData.schedule?.startTimeDate?.date : ''}
                            onChange={(e) => updateField('schedule.startTimeDate.date', e.target.value)}
                        />
                    </Field>
                    <Field label="Start Time" required validationMessage={getError('schedule.startTimeDate.hrs')}>
                        <Input
                            type="time"
                            value={formData.schedule?.startTimeDate?.hrs}
                            onChange={(e) => updateField('schedule.startTimeDate.hrs', e.target.value)}
                        />
                    </Field>
                    <Field label="Finish Date" required validationMessage={getError('schedule.finishTimeDate.date')}>
                        <Input
                            type="date"
                            value={typeof formData.schedule?.finishTimeDate?.date === 'string' ? formData.schedule?.finishTimeDate?.date : ''}
                            onChange={(e) => updateField('schedule.finishTimeDate.date', e.target.value)}
                        />
                    </Field>
                    <Field label="Finish Time" required validationMessage={getError('schedule.finishTimeDate.hrs')}>
                        <Input
                            type="time"
                            value={formData.schedule?.finishTimeDate?.hrs}
                            onChange={(e) => updateField('schedule.finishTimeDate.hrs', e.target.value)}
                        />
                    </Field>
                </div>
            </div>
        </div>
    );

    const renderHazardsTab = () => (
        <div className={styles.tabContent}>
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Which of the following hazards are associated with this work?</div>
                <div className={styles.checkboxGroup}>
                    <Checkbox
                        checked={formData.hazardsAssociated?.fallingObjects}
                        onChange={(_, data) => updateField('hazardsAssociated.fallingObjects', data.checked)}
                        label="Falling Objects"
                    />
                    <Checkbox
                        checked={formData.hazardsAssociated?.highWinds}
                        onChange={(_, data) => updateField('hazardsAssociated.highWinds', data.checked)}
                        label="High Winds"
                    />
                    <Checkbox
                        checked={formData.hazardsAssociated?.weatherConditions}
                        onChange={(_, data) => updateField('hazardsAssociated.weatherConditions', data.checked)}
                        label="Weather Conditions"
                    />
                    <Checkbox
                        checked={formData.hazardsAssociated?.unguardedEdges}
                        onChange={(_, data) => updateField('hazardsAssociated.unguardedEdges', data.checked)}
                        label="Unguarded Edges"
                    />
                    <Checkbox
                        checked={formData.hazardsAssociated?.manualHandlingOfLoads}
                        onChange={(_, data) => updateField('hazardsAssociated.manualHandlingOfLoads', data.checked)}
                        label="Manual Handling of Loads"
                    />
                    <Checkbox
                        checked={formData.hazardsAssociated?.riskOfFallingPersons}
                        onChange={(_, data) => updateField('hazardsAssociated.riskOfFallingPersons', data.checked)}
                        label="Risk of Falling Persons"
                    />
                    <Checkbox
                        checked={formData.hazardsAssociated?.overheadElectricCables}
                        onChange={(_, data) => updateField('hazardsAssociated.overheadElectricCables', data.checked)}
                        label="Overhead Electric Cables"
                    />
                    <Checkbox
                        checked={formData.hazardsAssociated?.unsecuredLadders}
                        onChange={(_, data) => updateField('hazardsAssociated.unsecuredLadders', data.checked)}
                        label="Unsecured Ladders"
                    />
                    <Checkbox
                        checked={formData.hazardsAssociated?.illumination}
                        onChange={(_, data) => updateField('hazardsAssociated.illumination', data.checked)}
                        label="Illumination"
                    />
                    <Checkbox
                        checked={formData.hazardsAssociated?.unevenFloorSurfaces}
                        onChange={(_, data) => updateField('hazardsAssociated.unevenFloorSurfaces', data.checked)}
                        label="Uneven Floor Surfaces"
                    />
                    <Checkbox
                        checked={formData.hazardsAssociated?.fragileRoofs}
                        onChange={(_, data) => updateField('hazardsAssociated.fragileRoofs', data.checked)}
                        label="Fragile Roofs"
                    />
                    <Checkbox
                        checked={formData.hazardsAssociated?.equipmentMachinery}
                        onChange={(_, data) => updateField('hazardsAssociated.equipmentMachinery', data.checked)}
                        label="Equipment/Machinery"
                    />
                </div>
                <div style={{ marginTop: '10px' }}>
                    <Field label="Other hazards not listed above">
                        <Input
                            value={formData.hazardsAssociated?.other || ''}
                            onChange={(e) => updateField('hazardsAssociated.other', e.target.value)}
                        />
                    </Field>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>Indicate Type of Fall Protection System</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <Checkbox
                        checked={formData.fallProtectionSystem?.travelRestraintSystem}
                        onChange={(_e, data) =>
                            updateField('fallProtectionSystem.travelRestraintSystem', data.checked)
                        }
                        label="Travel restraint system (Falls are prevented – PPE limits travel)"
                    />
                    <Checkbox
                        checked={formData.fallProtectionSystem?.workPositioningSystem}
                        onChange={(_e, data) =>
                            updateField('fallProtectionSystem.workPositioningSystem', data.checked)
                        }
                        label="Work positioning system (Continuous tension, restrained by PPE)"
                    />
                    <Checkbox
                        checked={formData.fallProtectionSystem?.fallArrestSystem}
                        onChange={(_e, data) =>
                            updateField('fallProtectionSystem.fallArrestSystem', data.checked)
                        }
                        label="Fall-arrest system (Does not prevent falls – catches after fall)"
                    />
                </div>
            </div>
        </div>
    );

    const renderWorkContextTab = () => (
        <div className={styles.tabContent}>
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Work Context</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {/* Helper to render a work context row */}
                    {Object.entries({
                        onRoofSurface: 'On a roof surface',
                        nearExposedEdge: 'Near an exposed edge (no hand railing/barriers)',
                        nearOpenHole: 'Near an open hole (no hand railing/barriers)',
                        onHeavyPlantAndMachinery: 'On heavy plant and machinery',
                        onTowerStructure: 'On a tower structure',
                        erectingScaffold: 'Erecting scaffold',
                        onCrane: 'On a crane',
                        other: 'Other'
                    }).map(([key, label]) => {
                        const fieldData = (formData.workContext as any)?.[key] || {};
                        return (
                            <div key={key} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
                                <Checkbox
                                    checked={fieldData.selected}
                                    onChange={(_, data) => updateField(`workContext.${key}.selected`, data.checked)}
                                    label={label}
                                />
                                {fieldData.selected && (
                                    <div style={{ marginLeft: '20px', marginTop: '10px', display: 'grid', gap: '10px' }}>
                                        {/* Specific fields for certain types */}
                                        {key === 'onRoofSurface' && (
                                            <Field label="Roof Pitch Angle (degrees)">
                                                <Input
                                                    value={fieldData.roofPitchAngle || ''}
                                                    onChange={(e) => updateField(`workContext.${key}.roofPitchAngle`, e.target.value)}
                                                />
                                            </Field>
                                        )}
                                        {key === 'onHeavyPlantAndMachinery' && (
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <Field label="Shut down taken?">
                                                    <RadioGroup
                                                        value={fieldData.shutDownTaken || 'NO'}
                                                        onChange={(_, data) => updateField(`workContext.${key}.shutDownTaken`, data.value)}
                                                        layout="horizontal"
                                                    >
                                                        <Radio value="YES" label="Yes" />
                                                        <Radio value="NO" label="No" />
                                                    </RadioGroup>
                                                </Field>
                                                {/* Add more heavy plant specific fields if needed */}
                                            </div>
                                        )}
                                        {key === 'onTowerStructure' && (
                                            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                                <Checkbox checked={fieldData.type?.comms} onChange={(_, d) => updateField(`workContext.${key}.type.comms`, d.checked)} label="Comms" />
                                                <Checkbox checked={fieldData.type?.energyTransmission} onChange={(_, d) => updateField(`workContext.${key}.type.energyTransmission`, d.checked)} label="Energy Transmission" />
                                                <Checkbox checked={fieldData.type?.cableWayTower} onChange={(_, d) => updateField(`workContext.${key}.type.cableWayTower`, d.checked)} label="Cable-way tower" />
                                            </div>
                                        )}
                                        {key === 'onCrane' && (
                                            <Field label="Description">
                                                <Input value={fieldData.description || ''} onChange={(e) => updateField(`workContext.${key}.description`, e.target.value)} />
                                            </Field>
                                        )}
                                        {key === 'other' && (
                                            <Field label="Description">
                                                <Input value={fieldData.description || ''} onChange={(e) => updateField(`workContext.${key}.description`, e.target.value)} />
                                            </Field>
                                        )}

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <Field label="Hazards assessed?">
                                                <RadioGroup
                                                    value={fieldData.hazardsAssessed || 'NO'}
                                                    onChange={(_, data) => updateField(`workContext.${key}.hazardsAssessed`, data.value)}
                                                    layout="horizontal"
                                                >
                                                    <Radio value="YES" label="Yes" />
                                                    <Radio value="NO" label="No" />
                                                </RadioGroup>
                                            </Field>
                                            <Field label="Can work proceed?">
                                                <RadioGroup
                                                    value={fieldData.canWorkProceed || 'NO'}
                                                    onChange={(_, data) => updateField(`workContext.${key}.canWorkProceed`, data.value)}
                                                    layout="horizontal"
                                                >
                                                    <Radio value="YES" label="Yes" />
                                                    <Radio value="NO" label="With Remark" />
                                                </RadioGroup>
                                            </Field>
                                        </div>
                                        <Field label="Remark">
                                            <Input
                                                value={fieldData.remark || ''}
                                                onChange={(e) => updateField(`workContext.${key}.remark`, e.target.value)}
                                                placeholder="Remark if any..."
                                            />
                                        </Field>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>Method of Access to Target Work Position</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {Object.entries({
                        portableExtensionLadder: { label: 'Portable extension ladder', check: 'personToFootLadderAvailable', checkLabel: 'Person to foot ladder available?' },
                        fixedLadderWithCable: { label: 'Fixed ladder with cable system', check: 'cableFallArrestDeviceAvailable', checkLabel: 'Cable fall-arrest device available?' },
                        elevatingWorkPlatform: { label: 'Elevating work platform (EWP)', check: 'adjustableLanyardAvailable', checkLabel: 'Adjustable lanyard available?' },
                        manCage: { label: 'Man cage / dog box via crane', check: 'doggerAvailableInCage', checkLabel: 'Dogger available and in cage?' },
                        scissorLift: { label: 'Scissor lift (stable work platform)', check: 'noPPERequired', checkLabel: 'No PPE required' },
                        climbingTechnique: { label: 'Climbing technique (using lanyard)', multiCheck: [{ k: 'doubleHookLanyardSuitable', l: 'Double hook lanyard suitable?' }, { k: 'poleStrapBeltAvailable', l: 'Pole strap/belt available?' }] },
                        permanentStaircase: { label: 'Permanent Staircase', check: 'railingAvailable', checkLabel: 'Railing Available' },
                        permanentMonkeyLadder: { label: 'Permanent Monkey Ladder', check: 'cageAvailable', checkLabel: 'Cage available' },
                        scaffolding: { label: 'Scaffolding', check: 'asPerStandard', checkLabel: 'As per standard' },
                        other: { label: 'Other', check: 'controlMeasureCheck', checkLabel: 'Control measure check' }
                    }).map(([key, config]: [string, any]) => {
                        const fieldData = (formData.methodOfAccess as any)?.[key] || {};
                        return (
                            <div key={key} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
                                <Checkbox
                                    checked={fieldData.selected}
                                    onChange={(_, data) => updateField(`methodOfAccess.${key}.selected`, data.checked)}
                                    label={config.label}
                                />
                                {fieldData.selected && (
                                    <div style={{ marginLeft: '20px', marginTop: '10px', display: 'grid', gap: '10px' }}>
                                        {key === 'other' && (
                                            <Input placeholder="Describe..." value={fieldData.description || ''} onChange={(e) => updateField(`methodOfAccess.other.description`, e.target.value)} />
                                        )}

                                        {/* Dynamic Control Measures based on type */}
                                        {config.check && (
                                            <Checkbox
                                                checked={fieldData[config.check]}
                                                onChange={(_, d) => updateField(`methodOfAccess.${key}.${config.check}`, d.checked)}
                                                label={config.checkLabel}
                                            />
                                        )}
                                        {config.multiCheck && config.multiCheck.map((c: any) => (
                                            <Checkbox
                                                key={c.k}
                                                checked={fieldData[c.k]}
                                                onChange={(_, d) => updateField(`methodOfAccess.${key}.${c.k}`, d.checked)}
                                                label={c.l}
                                            />
                                        ))}

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                            <Field label="Checked?">
                                                <RadioGroup
                                                    value={fieldData.inspected || 'NO'}
                                                    onChange={(_, data) => updateField(`methodOfAccess.${key}.inspected`, data.value)}
                                                    layout="horizontal"
                                                >
                                                    <Radio value="YES" label="Yes" />
                                                    <Radio value="NO" label="No" />
                                                </RadioGroup>
                                            </Field>
                                            <Field label="Surrounding hazards controlled?">
                                                <RadioGroup
                                                    value={fieldData.surroundingHazardsControlled || 'NO'}
                                                    onChange={(_, data) => updateField(`methodOfAccess.${key}.surroundingHazardsControlled`, data.value)}
                                                    layout="horizontal"
                                                >
                                                    <Radio value="YES" label="Yes" />
                                                    <Radio value="NO" label="No" />
                                                </RadioGroup>
                                            </Field>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Indicate Type of Fall Protection Equipment (PPE)</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {Object.entries({
                        lanyardFixedLength: 'Lanyard (fixed length)',
                        rearAttachment: 'Rear attachment (preferred method)',
                        frontAttachment: 'Front attachment (reasonable justification required)',
                        isConnectorCompatible: 'Is connector compatible with harness to avoid risk of roll-out?',
                        retractableLanyardType2NoWinchWebbing: 'Retractable lanyard (seat belt / webbing type) – type 2 no winch',
                        retractableLanyardType2NoWinchCable: 'Retractable lanyard (cable type) – type 2 no winch',
                        retractableLanyardType3WinchCable: 'Retractable lanyard (cable type) – type 3 with winch capability',
                        poleStrapBelt: 'Pole strap/belt (adjustable)',
                        fullBodyHarnessFallArrest: 'Full Body Harness (fall arrest type with front & rear connectors)',
                        fullBodyHarnessWorkPositioning: 'Full Body Harness (work positioning type with front, rear & side connectors)',
                        safetyNet: 'Safety Net as per site conditions'
                    }).map(([key, label]) => {
                        const fieldData = (formData.fallProtectionEquipment as any)?.[key] || {};
                        return (
                            <div key={key} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
                                <Checkbox
                                    checked={fieldData.selected}
                                    onChange={(_, data) => updateField(`fallProtectionEquipment.${key}.selected`, data.checked)}
                                    label={label}
                                />
                                {fieldData.selected && (
                                    <div style={{ marginLeft: '20px', marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
                                        <Field label="Checked?">
                                            <RadioGroup
                                                value={fieldData.inspected || 'NO'}
                                                onChange={(_, data) => updateField(`fallProtectionEquipment.${key}.inspected`, data.value)}
                                                layout="horizontal"
                                            >
                                                <Radio value="YES" label="Yes" />
                                                <Radio value="NO" label="No" />
                                            </RadioGroup>
                                        </Field>
                                        <Field label="Remark">
                                            <Input
                                                value={fieldData.remark || ''}
                                                onChange={(e) => updateField(`fallProtectionEquipment.${key}.remark`, e.target.value)}
                                            />
                                        </Field>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );

    const renderRiskAssessmentTab = () => (
        <div className={styles.tabContent}>
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Risk Assessment</div>
                {/* Removed workCannotProceed as it's not in the main schema shown in form image explicitly, but keeping if backend needs it. 
                    Actually, backend schema has RiskAssessment: { HIRAOrJSACompleted: string }.
                    Let's stick to what's in the schema I just wrote: HIRAOrJSACompleted.
                */}
                <Field label="HIRA or JSA Completed? (See Attached)">
                    <RadioGroup
                        value={formData.riskAssessment?.HIRAOrJSACompleted || 'NO'}
                        onChange={(_e, data) =>
                            updateField('riskAssessment.HIRAOrJSACompleted', data.value)
                        }
                    >
                        <Radio value="YES" label="YES" />
                        <Radio value="NO" label="NO" />
                    </RadioGroup>
                </Field>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>Number of Persons Authorized</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {formData.numberOfPersonsAuthorized?.map((person: any, index: number) => (
                        <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'end' }}>
                            <Field label="Name" validationMessage={getError(`numberOfPersonsAuthorized[${index}].name`)}>
                                <Input
                                    value={person.name}
                                    onChange={(e) => {
                                        const newPersons = [...(formData.numberOfPersonsAuthorized || [])];
                                        newPersons[index] = { ...newPersons[index], name: e.target.value };
                                        updateField('numberOfPersonsAuthorized', newPersons);
                                    }}
                                />
                            </Field>
                            <Field label="Height Pass Ref No.">
                                <Input
                                    value={person.heightPassRefNo}
                                    onChange={(e) => {
                                        const newPersons = [...(formData.numberOfPersonsAuthorized || [])];
                                        newPersons[index] = { ...newPersons[index], heightPassRefNo: e.target.value };
                                        updateField('numberOfPersonsAuthorized', newPersons);
                                    }}
                                />
                            </Field>
                            <Button
                                icon={<Dismiss24Regular />}
                                appearance="subtle"
                                onClick={() => {
                                    const newPersons = [...(formData.numberOfPersonsAuthorized || [])];
                                    newPersons.splice(index, 1);
                                    updateField('numberOfPersonsAuthorized', newPersons);
                                }}
                            />
                        </div>
                    ))}
                    <Button
                        appearance="outline"
                        onClick={() => {
                            const newPersons = [...(formData.numberOfPersonsAuthorized || []), { name: '', heightPassRefNo: '' }];
                            updateField('numberOfPersonsAuthorized', newPersons);
                        }}
                    >
                        Add Authorized Person
                    </Button>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>Incidents</div>
                <Field label="Were there any incidents or near misses associated with this work?" validationMessage={getError('incidentsOrNearMisses')}>
                    <RadioGroup
                        value={formData.incidentsOrNearMisses || 'NO'}
                        onChange={(_e, data) => updateField('incidentsOrNearMisses', data.value)}
                    >
                        <Radio value="YES" label="YES (see attached report)" />
                        <Radio value="NO" label="NO" />
                    </RadioGroup>
                </Field>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>Initiator Signature</div>
                <div className={styles.fieldRow}>
                    <Field label="Name" required validationMessage={getError('initiatorSignature.name')}>
                        <Input value={formData.initiatorSignature?.name || ''} disabled />
                    </Field>
                    <Field label="Signature" required validationMessage={getError('initiatorSignature.signature')}>
                        <div style={{ border: `1px solid ${tokens.colorNeutralStroke1}`, padding: '10px', minHeight: '60px', borderRadius: tokens.borderRadiusMedium, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: tokens.colorNeutralBackground2 }}>
                            {formData.initiatorSignature?.signature ? (
                                <img src={formData.initiatorSignature.signature} alt="Signature" style={{ maxHeight: '50px', maxWidth: '100%', objectFit: 'contain' }} />
                            ) : (
                                <span style={{ color: tokens.colorNeutralForegroundDisabled }}>No signature</span>
                            )}
                        </div>
                    </Field>
                    <Field label="Date" validationMessage={getError('initiatorSignature.date')}>
                        <Input value={typeof formData.initiatorSignature?.date === 'string' ? formData.initiatorSignature?.date : formData.initiatorSignature?.date?.toISOString().split('T')[0] || ''} disabled />
                    </Field>
                    <Field label="Time" validationMessage={getError('initiatorSignature.time')}>
                        <Input value={formData.initiatorSignature?.time || ''} disabled />
                    </Field>
                </div>
            </div>
        </div>
    );

    return (
        <Drawer
            type="overlay"
            separator
            open={isOpen}
            onOpenChange={(_, { open }) => !open && onClose()}
            position="end"
            size="large"
            className={styles.drawer}
        >
            <DrawerHeader>
                <DrawerHeaderTitle
                    action={<Button appearance="subtle" icon={<Dismiss24Regular />} onClick={onClose} />}
                >
                    {permitToEdit ? 'Edit Height Permit' : 'Create Height Permit'}
                </DrawerHeaderTitle>
            </DrawerHeader>

            <DrawerBody className={styles.drawerBody}>
                {loading && !formData.permitNumber ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                        <Spinner size="large" label="Loading..." />
                    </div>
                ) : (
                    <>
                        <TabList
                            selectedValue={selectedTab}
                            onTabSelect={(_, data) => setSelectedTab(data.value as string)}
                            size="small"
                            style={{ flexShrink: 0 }}
                        >
                            <Tab value="basic">Basic</Tab>
                            <Tab value="hazards">Hazards</Tab>
                            <Tab value="context">Context</Tab>
                            <Tab value="assessment">Risk</Tab>
                        </TabList>

                        <div className={styles.tabContent}>
                            {selectedTab === 'basic' && renderBasicInfoTab()}
                            {selectedTab === 'hazards' && renderHazardsTab()}
                            {selectedTab === 'context' && renderWorkContextTab()}
                            {selectedTab === 'assessment' && renderRiskAssessmentTab()}
                        </div>

                        <div className={styles.buttonRow}>
                            <Button
                                icon={<ChevronLeft24Regular />}
                                appearance="secondary"
                                onClick={goToPrevTab}
                                disabled={isFirstTab}
                            >
                                Previous
                            </Button>
                            {isLastTab ? (
                                <Button
                                    icon={<Save24Regular />}
                                    appearance="primary"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                >
                                    {loading ? <><Spinner size="tiny" /> Saving...</> : (permitToEdit ? 'Update' : 'Create')}
                                </Button>
                            ) : (
                                <Button
                                    icon={<ChevronRight24Regular />}
                                    iconPosition="after"
                                    appearance="primary"
                                    onClick={goToNextTab}
                                >
                                    Next
                                </Button>
                            )}
                        </div>
                    </>
                )}
            </DrawerBody>
        </Drawer>
    );
};

export default CreateHeightPermitDrawer;
