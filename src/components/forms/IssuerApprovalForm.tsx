/**
 * Issuer Approval Form - Converted from working JSX to TSX
 * Uses Fluent UI with exact same data logic as working JSX version
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
  Dropdown,
  Option,
  Spinner,
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  Add24Regular,
  Delete24Regular,
  ChevronLeft24Regular,
  Checkmark24Regular,
  Shield24Regular,
  Person24Regular,
} from '@fluentui/react-icons';
import { useUser } from '@/context';
import { validateIssuerStep, validateNewIsolationDetail, fieldToStepMap, ValidationErrors } from '@/validations/issuerApprovalValidation';

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
    '@media (max-width: 768px)': {
      padding: tokens.spacingHorizontalM,
    },
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
    '@media (max-width: 768px)': {
      padding: tokens.spacingHorizontalS,
      marginBottom: tokens.spacingVerticalS,
    },
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
    '@media (max-width: 768px)': {
      padding: tokens.spacingHorizontalS,
      marginBottom: tokens.spacingVerticalM,
    },
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
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: tokens.spacingHorizontalS,
    },
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  isolationItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: tokens.spacingHorizontalM,
    marginBottom: tokens.spacingVerticalS,
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    '@media (max-width: 768px)': {
      flexDirection: 'column',
      padding: tokens.spacingHorizontalS,
      gap: tokens.spacingVerticalXS,
    },
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
    '@media (max-width: 768px)': {
      minHeight: '60px',
      padding: tokens.spacingHorizontalS,
    },
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
    flexWrap: 'wrap',
    '@media (max-width: 768px)': {
      gap: tokens.spacingHorizontalS,
      padding: tokens.spacingVerticalS,
      '& button': {
        minWidth: '60px',
        fontSize: tokens.fontSizeBase200,
      },
    },
  },
  addForm: {
    padding: tokens.spacingHorizontalM,
    borderTop: `1px solid ${tokens.colorNeutralStroke1}`,
    marginTop: tokens.spacingVerticalM,
    '@media (max-width: 768px)': {
      padding: tokens.spacingHorizontalS,
    },
  },
});

interface IssuerApprovalFormProps {
  open: boolean;
  onClose: () => void;
  permit: { _id: string; permitNumber: string } | null;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

const STEPS = [
  { key: 'step1', title: 'Isolation Details' },
  { key: 'step2', title: 'Issuer Certification' },
  { key: 'step3', title: 'Comments' },
];

const ISOLATION_TYPES = ['Electrical', 'Mechanical', 'Hydraulic', 'Pneumatic', 'Gas Isolation'];

// Helper function to format date for input (local timezone)
const formatLocalDate = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function to parse date from input (local timezone)
const parseLocalDate = (dateStr: string): Date => {
  const parts = dateStr.split('-').map(Number);
  const year = parts[0] || new Date().getFullYear();
  const month = parts[1] || 1;
  const day = parts[2] || 1;
  return new Date(year, month - 1, day);
};

// Helper function to format datetime for input (local timezone)
const formatLocalDateTime = (date: Date): string => {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const IssuerApprovalForm: React.FC<IssuerApprovalFormProps> = ({
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
  const [confirmApproval, setConfirmApproval] = useState(false);
  const [formErrors, setFormErrors] = useState<ValidationErrors>({});

  // Shortcut: returns the error message for a given field path, or undefined
  const getError = (path: string): string | undefined => formErrors[path];

  // Initial state matching JSX version - always use current date/time
  const getInitialState = () => ({
    comments: '',
    issuerCertification: {
      verifiedAndFoundSatisfactory: false,
      issuerDetails: {
        name: user?.name || '',
        signature: userSignature || '',
        date: new Date(),
        time: new Date().toTimeString().slice(0, 5),
      },
    },
    isolationDetails: [] as any[],
  });

  const [formData, setFormData] = useState(getInitialState());

  // New isolation detail state
  const [newIsolationDetail, setNewIsolationDetail] = useState({
    sn: 1,
    equipmentNameNo: '',
    isolationType: '',
    formNo: '',
    nameOfAuthorizedIsolator: '',
    dateAndTime: new Date(),
  });

  // Initialize form - EXACT SAME LOGIC AS JSX VERSION
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setConfirmApproval(false);
      setFormErrors({});

      // Always set current date and time when form opens
      const currentDate = new Date();
      const currentTime = currentDate.toTimeString().slice(0, 5);

      if (permit) {
        setFormData((prev) => ({
          ...prev,
          comments: (permit as any).issuerApproval?.comments || '',
          issuerCertification: {
            ...prev.issuerCertification,
            ...((permit as any).issuerCertification || {}),
            issuerDetails: {
              name: user?.name || '',
              signature: userSignature || '',
              // Always use current date and time
              date: currentDate,
              time: currentTime,
            },
          },
          isolationDetails: (permit as any).isolationDetails || [],
        }));

        if ((permit as any).isolationDetails?.length > 0) {
          const maxSn = Math.max(
            ...(permit as any).isolationDetails.map((i: any) => i.sn || 0)
          );
          setNewIsolationDetail((prev) => ({ ...prev, sn: maxSn + 1 }));
        }
      } else {
        setFormData(getInitialState());
        setNewIsolationDetail({
          sn: 1,
          equipmentNameNo: '',
          isolationType: '',
          formNo: '',
          nameOfAuthorizedIsolator: '',
          dateAndTime: new Date(),
        });
      }
    }
  }, [open, permit, user, userSignature]);

  // Add isolation detail with Yup validation
  const addIsolationDetail = async () => {
    const result = await validateNewIsolationDetail(newIsolationDetail as any);
    if (!result.valid) {
      setFormErrors(prev => ({ ...prev, ...result.errors }));
      return;
    }

    // Clear add-form errors
    setFormErrors(prev => {
      const updated = { ...prev };
      delete updated['equipmentNameNo'];
      delete updated['isolationType'];
      delete updated['nameOfAuthorizedIsolator'];
      delete updated['isolationDetails'];
      return updated;
    });

    setFormData((prev) => ({
      ...prev,
      isolationDetails: [...prev.isolationDetails, { ...newIsolationDetail }],
    }));

    setNewIsolationDetail({
      sn: newIsolationDetail.sn + 1,
      equipmentNameNo: '',
      isolationType: '',
      formNo: '',
      nameOfAuthorizedIsolator: '',
      dateAndTime: new Date(),
    });
  };

  // Remove isolation detail
  const removeIsolationDetail = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      isolationDetails: prev.isolationDetails.filter((_, i) => i !== index),
    }));
  };

  // Navigate steps with validation
  const next = async () => {
    // Step 2 (comments) has no validation
    if (activeStep === 2) return;

    const result = await validateIssuerStep(formData as any, activeStep);
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

  // Handle submit - EXACT SAME LOGIC AS JSX VERSION
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirmApproval) {
      setConfirmApproval(true);
      return;
    }

    // Send data as-is, just like JSX version
    onSubmit({
      ...formData,
    });
  };

  const isLastStep = activeStep === STEPS.length - 1;

  // Render Step 1: Isolation Details
  const renderStep1 = () => (
    <div className={styles.content}>
      <div className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Shield24Regular />
          Isolation Details
        </Text>

        {getError('isolationDetails') && (
          <Text style={{ color: tokens.colorPaletteRedForeground1, display: 'block', marginBottom: '12px', fontSize: tokens.fontSizeBase200 }}>
            {getError('isolationDetails')}
          </Text>
        )}

        {/* Existing Isolation Details */}
        {formData.isolationDetails.map((item: any, idx: number) => (
          <div key={idx} className={styles.isolationItem}>
            <div style={{ flex: 1 }}>
              <Text weight="semibold">S.No: {item.sn}</Text>
              <Text block size={200}>Equipment: {item.equipmentNameNo}</Text>
              <Text block size={200}>Type: {item.isolationType}</Text>
              <Text block size={200}>Form No: {item.formNo || 'N/A'}</Text>
              <Text block size={200}>Authorized Isolator: {item.nameOfAuthorizedIsolator}</Text>
            </div>
            <Button
              icon={<Delete24Regular />}
              appearance="subtle"
              onClick={() => removeIsolationDetail(idx)}
            />
          </div>
        ))}

        {/* Add New Isolation Form */}
        <div className={styles.addForm}>


          <div className={styles.formGrid}>
            <Field label="S.No">
              <Input value={String(newIsolationDetail.sn)} readOnly />
            </Field>
            <Field
              label="Equipment *"
              required
              validationMessage={getError('equipmentNameNo')}
              validationState={getError('equipmentNameNo') ? 'error' : undefined}
            >
              <Input
                value={newIsolationDetail.equipmentNameNo}
                onChange={(_, d) =>
                  setNewIsolationDetail((prev) => ({
                    ...prev,
                    equipmentNameNo: d.value,
                  }))
                }
                placeholder="Equipment Name/No"
              />
            </Field>
            <Field
              label="Isolation Type *"
              required
              validationMessage={getError('isolationType')}
              validationState={getError('isolationType') ? 'error' : undefined}
            >
              <Dropdown
                placeholder="Select type"
                value={newIsolationDetail.isolationType}
                onOptionSelect={(_, d) =>
                  setNewIsolationDetail((prev) => ({
                    ...prev,
                    isolationType: d.optionValue || '',
                  }))
                }
              >
                {ISOLATION_TYPES.map((type) => (
                  <Option key={type} value={type}>
                    {type}
                  </Option>
                ))}
              </Dropdown>
            </Field>
            <Field label="Form No">
              <Input
                value={newIsolationDetail.formNo}
                onChange={(_, d) =>
                  setNewIsolationDetail((prev) => ({ ...prev, formNo: d.value }))
                }
                placeholder="Form number"
              />
            </Field>
            <Field
              label="Authorized Isolator *"
              required
              validationMessage={getError('nameOfAuthorizedIsolator')}
              validationState={getError('nameOfAuthorizedIsolator') ? 'error' : undefined}
            >
              <Input
                value={newIsolationDetail.nameOfAuthorizedIsolator}
                onChange={(_, d) =>
                  setNewIsolationDetail((prev) => ({
                    ...prev,
                    nameOfAuthorizedIsolator: d.value,
                  }))
                }
                placeholder="Name of authorized isolator"
              />
            </Field>
            <Field label="Date & Time">
              <Input
                type="datetime-local"
                value={
                  newIsolationDetail.dateAndTime instanceof Date
                    ? formatLocalDateTime(newIsolationDetail.dateAndTime)
                    : newIsolationDetail.dateAndTime
                }
                onChange={(_, d) =>
                  setNewIsolationDetail((prev) => ({
                    ...prev,
                    dateAndTime: new Date(d.value),
                  }))
                }
              />
            </Field>
          </div>

          <Button
            icon={<Add24Regular />}
            appearance="primary"
            onClick={addIsolationDetail}
            style={{ marginTop: '12px' }}
          >
            Add Isolation Detail
          </Button>
        </div>
      </div>
    </div>
  );

  // Render Step 2: Issuer Certification
  const renderStep2 = () => (
    <div className={styles.content}>
      <div className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Checkmark24Regular />
          Issuer Certification
        </Text>

        <Field
          validationMessage={getError('issuerCertification.verifiedAndFoundSatisfactory')}
          validationState={getError('issuerCertification.verifiedAndFoundSatisfactory') ? 'error' : undefined}
        >
          <Checkbox
            label="Verified and found satisfactory *"
            checked={formData.issuerCertification.verifiedAndFoundSatisfactory}
            onChange={(_, d) =>
              setFormData((prev) => ({
                ...prev,
                issuerCertification: {
                  ...prev.issuerCertification,
                  verifiedAndFoundSatisfactory: d.checked === true,
                },
              }))
            }
            style={{ marginBottom: '16px' }}
          />
        </Field>

        <hr style={{ margin: '16px 0' }} />
        <Text className={styles.sectionTitle}>
          <Person24Regular />
          Issuer Details
        </Text>

        <div className={styles.formGrid}>
          <Field
            label="Issuer Name *"
            required
            validationMessage={getError('issuerCertification.issuerDetails.name')}
            validationState={getError('issuerCertification.issuerDetails.name') ? 'error' : undefined}
          >
            <Input
              value={formData.issuerCertification.issuerDetails.name}
              readOnly
            />
          </Field>
          <Field
            label="Signature *"
            required
            validationMessage={getError('issuerCertification.issuerDetails.signature')}
            validationState={getError('issuerCertification.issuerDetails.signature') ? 'error' : undefined}
          >
            {formData.issuerCertification.issuerDetails.signature ? (
              <div className={styles.signatureBox}>
                <img
                  src={formData.issuerCertification.issuerDetails.signature}
                  alt="Issuer Signature"
                  style={{ maxHeight: '60px', maxWidth: '100%' }}
                  onError={(e) => (e.currentTarget.style.display = 'none')}
                />
              </div>
            ) : (
              <div className={styles.signatureBox}>
                <Text size={200}>No signature in profile</Text>
              </div>
            )}
          </Field>
          <Field label="Date">
            <Input
              type="date"
              value={formatLocalDate(formData.issuerCertification.issuerDetails.date instanceof Date
                ? formData.issuerCertification.issuerDetails.date
                : new Date(formData.issuerCertification.issuerDetails.date))}
              onChange={(_, d) =>
                setFormData((prev) => ({
                  ...prev,
                  issuerCertification: {
                    ...prev.issuerCertification,
                    issuerDetails: {
                      ...prev.issuerCertification.issuerDetails,
                      date: parseLocalDate(d.value),
                    },
                  },
                }))
              }
            />
          </Field>
          <Field label="Time">
            <Input
              type="time"
              value={formData.issuerCertification.issuerDetails.time}
              onChange={(_, d) =>
                setFormData((prev) => ({
                  ...prev,
                  issuerCertification: {
                    ...prev.issuerCertification,
                    issuerDetails: {
                      ...prev.issuerCertification.issuerDetails,
                      time: d.value,
                    },
                  },
                }))
              }
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
        <Text className={styles.sectionTitle}>Final Comments</Text>

        <Field label="Comments (Optional)" className={styles.fullWidth}>
          <Textarea
            value={formData.comments}
            onChange={(_, d) => setFormData((prev) => ({ ...prev, comments: d.value }))}
            rows={5}
            placeholder="Add any additional comments..."
          />
        </Field>
      </div>
    </div>
  );

  return (
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
          Issuer Final Approval - {permit?.permitNumber}
        </DrawerHeaderTitle>
      </DrawerHeader>

      <DrawerBody className={styles.body}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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

          {/* Step Content - Scrollable */}
          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '16px' }}>
            {activeStep === 0 && renderStep1()}
            {activeStep === 1 && renderStep2()}
            {activeStep === 2 && renderStep3()}
          </div>

          {/* Footer - Fixed at bottom */}
          <div className={styles.footer}>
            <Button appearance="secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>

            {activeStep > 0 && (
              <Button
                appearance="secondary"
                icon={<ChevronLeft24Regular />}
                onClick={() => setActiveStep(activeStep - 1)}
                disabled={isLoading}
              >
                Previous
              </Button>
            )}

            {!isLastStep ? (
              <Button appearance="primary" onClick={next} disabled={isLoading}>
                Next
              </Button>
            ) : (
              <Button
                appearance={confirmApproval ? 'primary' : 'primary'}
                type="submit"
                disabled={isLoading}
                icon={confirmApproval ? <Checkmark24Regular /> : undefined}
              >
                {isLoading && <Spinner size="tiny" style={{ marginRight: '8px' }} />}
                {isLoading
                  ? 'Submitting...'
                  : confirmApproval
                    ? 'Confirm Final Approval'
                    : 'Review & Approve'}
              </Button>
            )}
          </div>
        </form>
      </DrawerBody>
    </Drawer>
  );
};

export default IssuerApprovalForm;
