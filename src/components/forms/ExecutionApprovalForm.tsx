/**
 * Execution Approval Form - Converted from working JSX version
 * Uses Fluent UI components with exact same data logic
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
  Checkbox,
  Field,
  MessageBar,
  MessageBarBody,
  Image,
  Radio,
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  Add24Regular,
  Delete24Regular,
  ChevronLeft24Regular,
  ChevronRight24Regular,
  Checkmark24Regular,
  Shield24Regular,
  Person24Regular,
  Calendar24Regular,
} from '@fluentui/react-icons';
import { useUser } from '@/context';
import { IssuerSelectionModal } from '../modals/IssuerSelectionModal';
import toast from 'react-hot-toast';
import { validateExecutionStep, fieldToStepMap, ValidationErrors } from '@/validations/executionApprovalValidation';

const useStyles = makeStyles({
  header: {
    background: 'linear-gradient(135deg, #1e3a5f, #2d4a6f)',
    color: 'white',
  },
  body: {
    padding: tokens.spacingHorizontalL,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    paddingRight: '4px',
    paddingBottom: '100px',
  },
  stepIndicator: {
    marginBottom: tokens.spacingVerticalM,
    padding: tokens.spacingHorizontalM,
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
  },
  progressBar: {
    height: '6px',
    backgroundColor: tokens.colorNeutralBackground4,
    borderRadius: '3px',
    marginTop: tokens.spacingVerticalS,
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.colorBrandBackground,
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  section: {
    marginBottom: tokens.spacingVerticalL,
    padding: tokens.spacingHorizontalM,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
    marginBottom: tokens.spacingVerticalM,
    color: tokens.colorBrandForeground1,
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: tokens.spacingHorizontalM,
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  badgeContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens.spacingHorizontalS,
    marginTop: tokens.spacingVerticalS,
  },
  badgeItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: tokens.colorBrandBackground2,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorBrandStroke1}`,
  },
  badgeItemPerson: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: tokens.colorPaletteGreenBackground2,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorPaletteGreenBorder1}`,
  },
  signatureBox: {
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: tokens.spacingHorizontalM,
    backgroundColor: tokens.colorNeutralBackground2,
    minHeight: '80px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkTable: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  checkTableHeader: {
    backgroundColor: tokens.colorNeutralBackground3,
  },
  checkTableCell: {
    padding: tokens.spacingHorizontalS,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  checkTableCellCenter: {
    padding: tokens.spacingHorizontalS,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    textAlign: 'center' as const,
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalM,
    padding: tokens.spacingVerticalM,
    paddingTop: tokens.spacingVerticalL,
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    backgroundColor: tokens.colorNeutralBackground1,
    marginTop: 'auto',
    flexShrink: 0,
  },
});

interface ExecutionApprovalFormProps {
  open: boolean;
  onClose: () => void;
  permit: { _id: string; permitNumber: string } | null;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

const STEPS = [
  { key: 'step1', title: 'Executing Agency Details' },
  { key: 'step2', title: 'Pre-Execution Checks' },
  { key: 'step3', title: 'Comments & Submit' },
];

const PRE_EXECUTION_CHECKS = [
  { field: 'jobSpecificSafetyTalk', label: 'Job Specific Safety Talk Conducted' },
  { field: 'sparkGeneratingWork', label: 'Spark Generating Work' },
  { field: 'combustibleMaterialRemoved', label: 'Combustible Material Removed' },
  { field: 'barriersGuardsUsed', label: 'Barriers/Guards Used' },
  { field: 'barricadingRequired', label: 'Barricading Required' },
  { field: 'fireExtinguisherLocationKnown', label: 'Fire Extinguisher Location Known' },
  { field: 'additionalIlluminationRequired', label: 'Additional Illumination Required' },
  { field: 'additionalSupplyPointsRequired', label: 'Additional Supply Points Required' },
  { field: 'gasTestingRequired', label: 'Gas Testing Required' },
  { field: 'periodicGasMonitoringRequired', label: 'Periodic Gas Monitoring Required' },
];

export const ExecutionApprovalForm: React.FC<ExecutionApprovalFormProps> = ({
  open,
  onClose,
  permit,
  onSubmit,
  isLoading = false,
}) => {
  const styles = useStyles();
  const { user, signature: userSignature } = useUser();

  // Form state
  const [activeStep, setActiveStep] = useState(0);
  const [showIssuerModal, setShowIssuerModal] = useState(false);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});

  // Shortcut: returns the error message for a given field path, or undefined
  const getError = (path: string): string | undefined => formErrors[path];

  // Input state for dynamic lists
  const [newPPEItem, setNewPPEItem] = useState('');
  const [newPersonName, setNewPersonName] = useState('');

  // Helper functions for local date/time
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getLocalTimeString = () => {
    const d = new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Initial form state matching JSX version
  const initialState = {
    comments: '',
    executingAgency: {
      specialPPEsToolsEquipment: [] as string[],
      numberOfPersonsAttached: '',
      nameOfPersons: [] as string[],
      attachSeparateList: false,
      acceptorName: '',
      acceptorSignature: { name: '', signature: '' },
      holderName: '',
      holderSignature: { name: '', signature: '' },
      acceptanceDate: getLocalDateString(),
      acceptanceTime: getLocalTimeString(),
    },
    preExecutionChecks: {
      jobSpecificSafetyTalk: '',
      sparkGeneratingWork: '',
      combustibleMaterialRemoved: '',
      barriersGuardsUsed: '',
      barricadingRequired: '',
      fireExtinguisherLocationKnown: '',
      additionalIlluminationRequired: '',
      additionalSupplyPointsRequired: '',
      gasTestingRequired: '',
      periodicGasMonitoringRequired: '',
      repDetails: {
        name: '',
        signature: '',
        date: getLocalDateString(),
        time: getLocalTimeString(),
      },
    },
  };

  const [formData, setFormData] = useState(initialState);

  // Initialize form data - EXACT SAME LOGIC AS JSX VERSION
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setFormErrors({});
      setShowIssuerModal(false);
      setNewPPEItem('');
      setNewPersonName('');

      let initialData = { ...initialState };

      // Auto-fill with user data
      if (user) {
        const userName = user.name || '';
        const userSignatureUrl = userSignature || '';

        initialData.executingAgency.acceptorName = userName;
        initialData.executingAgency.acceptorSignature = {
          name: userName,
          signature: userSignatureUrl,
        };

        // Representative Details sync with Acceptor
        initialData.preExecutionChecks.repDetails.name = userName;
        initialData.preExecutionChecks.repDetails.signature = userSignatureUrl;
      }

      setFormData(initialData);
    }
  }, [open, user, userSignature]);

  // Add PPE item
  const handleAddPPE = () => {
    if (newPPEItem.trim()) {
      setFormData(prev => ({
        ...prev,
        executingAgency: {
          ...prev.executingAgency,
          specialPPEsToolsEquipment: [...prev.executingAgency.specialPPEsToolsEquipment, newPPEItem.trim()],
        },
      }));
      setNewPPEItem('');
    }
  };

  // Remove PPE item
  const handleRemovePPE = (index: number) => {
    setFormData(prev => ({
      ...prev,
      executingAgency: {
        ...prev.executingAgency,
        specialPPEsToolsEquipment: prev.executingAgency.specialPPEsToolsEquipment.filter((_, i) => i !== index),
      },
    }));
  };

  // Add person name
  const handleAddPerson = () => {
    // Validate count limit if specified
    const limit = formData.executingAgency.numberOfPersonsAttached ? parseInt(formData.executingAgency.numberOfPersonsAttached) : 0;
    if (limit > 0 && formData.executingAgency.nameOfPersons.length >= limit) {
      toast.error(`Cannot add more than ${limit} persons as specified.`);
      return;
    }

    if (newPersonName.trim()) {
      setFormData(prev => ({
        ...prev,
        executingAgency: {
          ...prev.executingAgency,
          nameOfPersons: [...prev.executingAgency.nameOfPersons, newPersonName.trim()],
        },
      }));
      setNewPersonName('');
    }
  };

  // Remove person name
  const handleRemovePerson = (index: number) => {
    setFormData(prev => ({
      ...prev,
      executingAgency: {
        ...prev.executingAgency,
        nameOfPersons: prev.executingAgency.nameOfPersons.filter((_, i) => i !== index),
      },
    }));
  };

  // Handle holder signature upload
  const handleHolderSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          executingAgency: {
            ...prev.executingAgency,
            holderSignature: {
              name: prev.executingAgency.holderName,
              signature: reader.result as string,
            },
          },
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Update pre-execution check
  const handleCheckChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      preExecutionChecks: {
        ...prev.preExecutionChecks,
        [field]: value,
      },
    }));
  };

  // Navigate steps with validation
  const goNext = async () => {
    // Step 2 (comments) has no validation
    if (activeStep === 2) return;

    const result = await validateExecutionStep(formData as any, activeStep);
    if (!result.valid) {
      setFormErrors(prev => ({ ...prev, ...result.errors }));
      return;
    }
    // Clear errors for the current step since it passed
    setFormErrors(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(key => {
        if (fieldToStepMap[key] === activeStep) {
          delete updated[key];
        }
      });
      return updated;
    });
    if (activeStep < STEPS.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const goPrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // Handle submit button click
  const handleSubmitClick = async () => {
    if (activeStep < STEPS.length - 1) {
      await goNext();
      return;
    }

    // Show issuer selection modal
    setShowIssuerModal(true);
  };

  // Handle issuer selection and final submit - EXACT SAME LOGIC AS JSX VERSION
  const handleIssuerSelected = (issuer: any) => {
    // Prepare data for submission - keep it simple like JSX version
    const submitData = {
      assignedIssuerId: issuer._id,
      comments: formData.comments,
      executingAgency: {
        ...formData.executingAgency,
        numberOfPersonsAttached: formData.executingAgency.numberOfPersonsAttached
          ? parseInt(formData.executingAgency.numberOfPersonsAttached)
          : undefined,
      },
      preExecutionChecks: {
        ...formData.preExecutionChecks,
      },
    };

    // Call onSubmit and close modal
    onSubmit(submitData);
    setShowIssuerModal(false);
  };

  const isLastStep = activeStep === STEPS.length - 1;

  // Render Step 1: Executing Agency Details
  const renderStep1 = () => (
    <div className={styles.content}>

      {/* PPE & Personnel Section */}
      <div className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Shield24Regular />
          PPE & Personnel Information
        </Text>

        <Field label="Special PPEs/Tools/Equipment">
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input
              value={newPPEItem}
              onChange={(_, d) => setNewPPEItem(d.value)}
              placeholder="Enter PPE/Tool/Equipment"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPPE())}
              style={{ flex: 1 }}
            />
            <Button icon={<Add24Regular />} onClick={handleAddPPE}>Add</Button>
          </div>
          {formData.executingAgency.specialPPEsToolsEquipment.length > 0 && (
            <div className={styles.badgeContainer}>
              {formData.executingAgency.specialPPEsToolsEquipment.map((item, i) => (
                <div key={i} className={styles.badgeItem}>
                  <Text size={200} weight="semibold">{item}</Text>
                  <Button
                    icon={<Delete24Regular />}
                    appearance="transparent"
                    size="small"
                    onClick={() => handleRemovePPE(i)}
                    style={{
                      minWidth: 'auto',
                      padding: '0',
                      height: '20px',
                      width: '20px',
                      color: tokens.colorNeutralForeground2,
                    }}
                    title="Remove item"
                  />
                </div>
              ))}
            </div>
          )}
        </Field>

        <div className={styles.formGrid} style={{ marginTop: '12px' }}>
          <Field label="Number of Persons Attached">
            <Input
              type="number"
              value={formData.executingAgency.numberOfPersonsAttached}
              onChange={(_, d) => setFormData(prev => ({
                ...prev,
                executingAgency: { ...prev.executingAgency, numberOfPersonsAttached: d.value },
              }))}
            />
          </Field>
          <Field>
            <Checkbox
              label="Attach Separate List"
              checked={formData.executingAgency.attachSeparateList}
              onChange={(_, d) => setFormData(prev => ({
                ...prev,
                executingAgency: { ...prev.executingAgency, attachSeparateList: d.checked === true },
              }))}
              style={{ marginTop: '24px' }}
            />
          </Field>
        </div>

        <Field
          label="Name of Persons"
          style={{ marginTop: '12px' }}
          validationMessage={getError('executingAgency.nameOfPersons')}
          validationState={getError('executingAgency.nameOfPersons') ? 'error' : undefined}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input
              value={newPersonName}
              onChange={(_, d) => setNewPersonName(d.value)}
              placeholder="Enter person name"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPerson())}
              style={{ flex: 1 }}
            />
            <Button icon={<Add24Regular />} appearance="primary" onClick={handleAddPerson}>Add</Button>
          </div>
          {formData.executingAgency.nameOfPersons.length > 0 && (
            <div className={styles.badgeContainer}>
              {formData.executingAgency.nameOfPersons.map((name, i) => (
                <div key={i} className={styles.badgeItemPerson}>
                  <Person24Regular style={{ fontSize: '14px' }} />
                  <Text size={200} weight="semibold">{name}</Text>
                  <Button
                    icon={<Delete24Regular />}
                    appearance="transparent"
                    size="small"
                    onClick={() => handleRemovePerson(i)}
                    style={{
                      minWidth: 'auto',
                      padding: '0',
                      height: '20px',
                      width: '20px',
                      color: tokens.colorNeutralForeground2,
                    }}
                    title="Remove person"
                  />
                </div>
              ))}
            </div>
          )}
        </Field>
      </div>

      {/* Acceptor Details Section */}
      <div className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Person24Regular />
          Acceptor Details (Auto-filled)
        </Text>

        <div className={styles.formGrid}>
          <Field
            label="Acceptor Name *"
            required
            validationMessage={getError('executingAgency.acceptorName')}
            validationState={getError('executingAgency.acceptorName') ? 'error' : undefined}
          >
            <Input value={formData.executingAgency.acceptorName} readOnly />
            <Text size={100} style={{ color: 'green', marginTop: '4px' }}>
              ✓ Auto-filled from your profile
            </Text>
          </Field>
          <Field
            label="Acceptor Signature *"
            required
            validationMessage={getError('executingAgency.acceptorSignature.signature')}
            validationState={getError('executingAgency.acceptorSignature.signature') ? 'error' : undefined}
          >
            {formData.executingAgency.acceptorSignature?.signature &&
              formData.executingAgency.acceptorSignature.signature.trim() !== '' &&
              formData.executingAgency.acceptorSignature.signature.startsWith('http') ? (
              <div className={styles.signatureBox}>
                <Image
                  src={formData.executingAgency.acceptorSignature.signature}
                  alt="Signature"
                  style={{ maxHeight: '60px', maxWidth: '100%' }}
                />
              </div>
            ) : (
              <div className={styles.signatureBox}>
                <Text size={200}>No signature in profile</Text>
              </div>
            )}
          </Field>
        </div>
      </div>

      {/* Holder Details Section */}
      <div className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Person24Regular />
          Holder Details (Optional)
        </Text>

        <div className={styles.formGrid}>
          <Field label="Holder Name">
            <Input
              value={formData.executingAgency.holderName}
              onChange={(_, d) => setFormData(prev => ({
                ...prev,
                executingAgency: { ...prev.executingAgency, holderName: d.value },
              }))}
              placeholder="Enter holder name"
            />
          </Field>
          <Field label="Holder Signature (Optional)">
            <input
              type="file"
              accept="image/*"
              onChange={handleHolderSignatureUpload}
              style={{
                padding: '8px',
                border: `1px solid ${tokens.colorNeutralStroke1}`,
                borderRadius: tokens.borderRadiusMedium,
                width: '100%',
              }}
            />
            {formData.executingAgency.holderSignature?.signature && (
              <div className={styles.signatureBox} style={{ marginTop: '8px' }}>
                <Image
                  src={formData.executingAgency.holderSignature.signature}
                  alt="Holder Signature"
                  style={{ maxHeight: '60px', maxWidth: '100%' }}
                />
              </div>
            )}
          </Field>
        </div>
      </div>

      {/* Date & Time Section */}
      <div className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Calendar24Regular />
          Acceptance Date & Time
        </Text>

        <div className={styles.formGrid}>
          <Field label="Acceptance Date">
            <Input
              type="date"
              value={formData.executingAgency.acceptanceDate as string}
              onChange={(_, d) => setFormData(prev => ({
                ...prev,
                executingAgency: { ...prev.executingAgency, acceptanceDate: d.value },
              }))}
            />
          </Field>
          <Field label="Acceptance Time">
            <Input
              type="time"
              value={formData.executingAgency.acceptanceTime}
              onChange={(_, d) => setFormData(prev => ({
                ...prev,
                executingAgency: { ...prev.executingAgency, acceptanceTime: d.value },
              }))}
            />
          </Field>
        </div>
      </div>
    </div>
  );

  // Render Step 2: Pre-Execution Checks
  const renderStep2 = () => (
    <div className={styles.content}>

      <div className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Checkmark24Regular />
          Pre-Execution Safety Checks
        </Text>

        <table className={styles.checkTable}>
          <thead>
            <tr className={styles.checkTableHeader}>
              <th className={styles.checkTableCell} style={{ width: '55%' }}>Safety Check Item</th>
              <th className={styles.checkTableCellCenter} style={{ width: '15%' }}>YES</th>
              <th className={styles.checkTableCellCenter} style={{ width: '15%' }}>NO</th>
              <th className={styles.checkTableCellCenter} style={{ width: '15%' }}>N/A</th>
            </tr>
          </thead>
          <tbody>
            {PRE_EXECUTION_CHECKS.map(check => {
              const hasError = !!getError(`preExecutionChecks.${check.field}`);
              return (
                <tr key={check.field} style={hasError ? { backgroundColor: 'rgba(220, 38, 38, 0.08)' } : undefined}>
                  <td className={styles.checkTableCell} style={hasError ? { color: tokens.colorPaletteRedForeground1 } : undefined}>{check.label}</td>
                  <td className={styles.checkTableCellCenter}>
                    <Radio
                      name={check.field}
                      value="YES"
                      checked={(formData.preExecutionChecks as any)[check.field] === 'YES'}
                      onChange={() => handleCheckChange(check.field, 'YES')}
                    />
                  </td>
                  <td className={styles.checkTableCellCenter}>
                    <Radio
                      name={check.field}
                      value="NO"
                      checked={(formData.preExecutionChecks as any)[check.field] === 'NO'}
                      onChange={() => handleCheckChange(check.field, 'NO')}
                    />
                  </td>
                  <td className={styles.checkTableCellCenter}>
                    <Radio
                      name={check.field}
                      value="NA"
                      checked={(formData.preExecutionChecks as any)[check.field] === 'NA'}
                      onChange={() => handleCheckChange(check.field, 'NA')}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Representative Details */}
      <div className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Person24Regular />
          Representative Details
        </Text>
        <Text size={200} style={{ color: tokens.colorNeutralForeground3, marginBottom: '12px', display: 'block' }}>
          Auto-filled from Acceptor
        </Text>

        <div className={styles.formGrid}>
          <Field
            label="Representative Name *"
            required
            validationMessage={getError('preExecutionChecks.repDetails.name')}
            validationState={getError('preExecutionChecks.repDetails.name') ? 'error' : undefined}
          >
            <Input value={formData.preExecutionChecks.repDetails.name} readOnly />
          </Field>
          <Field label="Signature">
            {formData.preExecutionChecks.repDetails.signature ? (
              <div className={styles.signatureBox}>
                <Image
                  src={formData.preExecutionChecks.repDetails.signature}
                  alt="Signature"
                  style={{ maxHeight: '60px', maxWidth: '100%' }}
                />
              </div>
            ) : (
              <div className={styles.signatureBox}>
                <Text size={200}>Auto-filled from Acceptor</Text>
              </div>
            )}
          </Field>
          <Field label="Date">
            <Input
              type="date"
              value={formData.preExecutionChecks.repDetails.date as string}
              onChange={(_, d) => setFormData(prev => ({
                ...prev,
                preExecutionChecks: {
                  ...prev.preExecutionChecks,
                  repDetails: { ...prev.preExecutionChecks.repDetails, date: d.value },
                },
              }))}
            />
          </Field>
          <Field label="Time">
            <Input
              type="time"
              value={formData.preExecutionChecks.repDetails.time}
              onChange={(_, d) => setFormData(prev => ({
                ...prev,
                preExecutionChecks: {
                  ...prev.preExecutionChecks,
                  repDetails: { ...prev.preExecutionChecks.repDetails, time: d.value },
                },
              }))}
            />
          </Field>
        </div>
      </div>
    </div>
  );

  // Render Step 3: Comments
  const renderStep3 = () => (
    <div className={styles.content}>
      <div className={styles.section}>
        <Text className={styles.sectionTitle}>Comments & Submit</Text>

        <Field label="Comments (Optional)" className={styles.fullWidth}>
          <Textarea
            value={formData.comments}
            onChange={(_, d) => setFormData(prev => ({ ...prev, comments: d.value }))}
            placeholder="Add any additional comments..."
            rows={4}
          />
        </Field>

        <MessageBar intent="info" style={{ marginTop: '16px' }}>
          <MessageBarBody>
            Click "Approve & Select Issuer" to proceed to issuer selection.
          </MessageBarBody>
        </MessageBar>
      </div>
    </div>
  );

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={(_, d) => !d.open && onClose()}
        position="end"
        size="medium"
      >
        <DrawerHeader className={styles.header}>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                icon={<Dismiss24Regular />}
                onClick={onClose}
                style={{ color: 'white' }}
              />
            }
          >
            Execution Approval - {permit?.permitNumber}
          </DrawerHeaderTitle>
        </DrawerHeader>

        <DrawerBody className={styles.body}>
          {/* Step Indicator */}
          <div className={styles.stepIndicator}>
            <Text weight="semibold">
              Step {activeStep + 1} of {STEPS.length} — {STEPS[activeStep]?.title || ''}
            </Text>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${((activeStep + 1) / STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          {activeStep === 0 && renderStep1()}
          {activeStep === 1 && renderStep2()}
          {activeStep === 2 && renderStep3()}

          {/* Footer */}
          <div className={styles.footer}>
            <Button
              appearance="secondary"
              icon={<ChevronLeft24Regular />}
              onClick={goPrev}
              disabled={activeStep === 0}
            >
              Previous
            </Button>

            <Button
              appearance="primary"
              icon={isLastStep ? <Checkmark24Regular /> : <ChevronRight24Regular />}
              iconPosition="after"
              onClick={handleSubmitClick}
              disabled={isLoading}
            >
              {isLastStep ? 'Approve & Select Issuer' : 'Next'}
            </Button>
          </div>
        </DrawerBody>
      </Drawer>

      {/* Issuer Selection Modal */}
      <IssuerSelectionModal
        open={showIssuerModal}
        onClose={() => setShowIssuerModal(false)}
        permitNumber={permit?.permitNumber || ''}
        onSelectIssuer={handleIssuerSelected}
      />
    </>
  );
};

export default ExecutionApprovalForm;
