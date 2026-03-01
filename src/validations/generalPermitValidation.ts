/**
 * Yup validation schemas for General Permit form
 *
 * Mirrors the backend createPermitValidation rules from:
 *   E-Permit.Apis/validations/permitValidation.js
 *
 * Two schemas are exported:
 *
 *   1. generalPermitSchema  – used by AddPermitFormPage (permit numbers optional)
 *   2. drawerPermitSchema   – used by AddPermitDrawer  (permit numbers required,
 *                              at least one checkpoint required)
 */

import * as Yup from 'yup';

// ──────────────────────────────────────────────────────
// Shared sub-schemas (reused by both page & drawer)
// ──────────────────────────────────────────────────────

const periodOfWorkSchema = Yup.object().shape({
    from: Yup.object().shape({
        date: Yup.date().required('From date is required'),
        hrs: Yup.string().required('From time is required'),
    }),
    to: Yup.object().shape({
        date: Yup.date()
            .required('To date is required')
            .test(
                'to-after-from',
                'To date must be on or after from date',
                function (toDate) {
                    // Navigate up to periodOfWork level to access from.date
                    const periodOfWork = this.from?.[1]?.value;
                    const fromDate = periodOfWork?.from?.date;
                    if (!fromDate || !toDate) return true;

                    const from = new Date(fromDate);
                    const to = new Date(toDate);
                    // Compare date portion only (ignore time)
                    from.setHours(0, 0, 0, 0);
                    to.setHours(0, 0, 0, 0);
                    return to >= from;
                }
            ),
        hrs: Yup.string().required('To time is required'),
    }),
});

const initiatorDetailsSchema = Yup.object().shape({
    name: Yup.string()
        .trim()
        .required('Initiator name is required'),
    signature: Yup.string()
        .trim()
        .required('Initiator signature is required. Please ensure your profile has a signature.'),
    date: Yup.date(),
    time: Yup.string(),
});

const prePermitSignatureSchema = Yup.object().shape({
    initiatorSignature: Yup.object().shape({
        name: Yup.string()
            .trim()
            .required('Sign-off name is required'),
        signature: Yup.string()
            .trim()
            .required('Sign-off signature is required'),
        date: Yup.date(),
        time: Yup.string(),
    }),
});

// ──────────────────────────────────────────────────────
// 1. AddPermitFormPage schema (permit numbers optional)
// ──────────────────────────────────────────────────────

export const generalPermitSchema = Yup.object().shape({
    permitNumber: Yup.string()
        .trim()
        .max(50, 'Permit number cannot exceed 50 characters'),

    protocolNumber: Yup.string()
        .trim()
        .max(50, 'Protocol number cannot exceed 50 characters'),

    srNo: Yup.string()
        .trim()
        .max(50, 'SR No cannot exceed 50 characters'),

    initiator: Yup.object().shape({
        briefDescriptionOfWork: Yup.string()
            .trim()
            .required('Brief description of work is required')
            .max(500, 'Brief description cannot exceed 500 characters'),

        equipmentLocation: Yup.object().shape({
            equipmentNameNo: Yup.string(),
            location: Yup.string()
                .required('Location (Unit) is required'),
            subLocation: Yup.string()
                .required('Sub-location is required'),
            locationName: Yup.string(),
        }),

        periodOfWork: periodOfWorkSchema,

        initiatorDetails: initiatorDetailsSchema,
    }),

    prePermitChecks: prePermitSignatureSchema,
});

// ──────────────────────────────────────────────────────
// 2. AddPermitDrawer schema
//    - permit numbers REQUIRED
//    - at least one checkpoint must have content
// ──────────────────────────────────────────────────────

export const drawerPermitSchema = Yup.object().shape({
    permitNumber: Yup.string()
        .trim()
        .required('Permit number is required')
        .max(50, 'Permit number cannot exceed 50 characters'),

    protocolNumber: Yup.string()
        .trim()
        .required('Protocol number is required')
        .max(50, 'Protocol number cannot exceed 50 characters'),

    srNo: Yup.string()
        .trim()
        .required('SR No is required')
        .max(50, 'SR No cannot exceed 50 characters'),

    initiator: Yup.object().shape({
        briefDescriptionOfWork: Yup.string()
            .trim()
            .required('Brief description of work is required')
            .max(500, 'Brief description cannot exceed 500 characters'),

        equipmentLocation: Yup.object().shape({
            equipmentNameNo: Yup.string(),
            location: Yup.string()
                .required('Location (Unit) is required'),
            subLocation: Yup.string()
                .required('Sub-location is required'),
            locationName: Yup.string(),
        }),

        periodOfWork: periodOfWorkSchema,

        checkPoints: Yup.array()
            .test(
                'at-least-one-filled',
                'Please fill at least one Risk Assessment checkpoint',
                function (checkPoints) {
                    if (!checkPoints || checkPoints.length === 0) return false;
                    return checkPoints.some(
                        (cp: any) =>
                            cp.riskAssessment?.trim() || cp.hazardMitigationMeasures?.trim()
                    );
                }
            ),

        initiatorDetails: initiatorDetailsSchema,
    }),

    prePermitChecks: prePermitSignatureSchema,
});

// ──────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────

/**
 * Map a Yup field path to the tab it belongs to.
 * Used to navigate the user to the first tab that has an error.
 */
export const fieldToTabMap: Record<string, string> = {
    permitNumber: 'basic',
    protocolNumber: 'basic',
    srNo: 'basic',
    'initiator.briefDescriptionOfWork': 'basic',
    'initiator.equipmentLocation.location': 'basic',
    'initiator.equipmentLocation.subLocation': 'basic',
    'initiator.periodOfWork.from.date': 'basic',
    'initiator.periodOfWork.from.hrs': 'basic',
    'initiator.periodOfWork.to.date': 'basic',
    'initiator.periodOfWork.to.hrs': 'basic',
    'initiator.checkPoints': 'checkpoints',
    'initiator.initiatorDetails.name': 'initiator',
    'initiator.initiatorDetails.signature': 'initiator',
    'prePermitChecks.initiatorSignature.name': 'signature',
    'prePermitChecks.initiatorSignature.signature': 'signature',
};

/** Tab display order – used to determine which tab should be shown first */
const tabPriority = ['basic', 'associated', 'checkpoints', 'prechecks', 'initiator', 'signature'];

/**
 * Errors keyed by the Yup field path (e.g. "initiator.briefDescriptionOfWork").
 */
export type ValidationErrors = Record<string, string>;

/**
 * Internal runner – validates data against a given Yup schema.
 */
async function runValidation(
    schema: Yup.ObjectSchema<any>,
    formData: Record<string, any>
): Promise<
    | { valid: true }
    | { valid: false; errors: ValidationErrors; firstErrorTab: string }
> {
    try {
        await schema.validate(formData, { abortEarly: false });
        return { valid: true };
    } catch (err) {
        if (err instanceof Yup.ValidationError) {
            const errors: ValidationErrors = {};
            let firstErrorTab = 'basic';
            let firstTabIndex = tabPriority.length;

            for (const inner of err.inner) {
                const path = inner.path || '';
                errors[path] = inner.message;

                // Determine the tab for this error
                const tab = fieldToTabMap[path];
                if (tab) {
                    const idx = tabPriority.indexOf(tab);
                    if (idx < firstTabIndex) {
                        firstTabIndex = idx;
                        firstErrorTab = tab;
                    }
                }
            }

            return { valid: false, errors, firstErrorTab };
        }
        // Unexpected error – re-throw
        throw err;
    }
}

// ──────────────────────────────────────────────────────
// Public API
// ──────────────────────────────────────────────────────

/** Validate using the **page** schema (AddPermitFormPage). */
export async function validateGeneralPermit(formData: Record<string, any>) {
    return runValidation(generalPermitSchema, formData);
}

/** Validate using the **drawer** schema (AddPermitDrawer). */
export async function validateDrawerPermit(formData: Record<string, any>) {
    return runValidation(drawerPermitSchema, formData);
}

/**
 * Validate only the fields that belong to a specific tab.
 * Returns `{ valid: true }` if the current tab has no errors,
 * or `{ valid: false, errors }` with only the errors for that tab.
 */
export async function validateTab(
    formData: Record<string, any>,
    currentTab: string,
    mode: 'page' | 'drawer' = 'drawer'
): Promise<{ valid: true } | { valid: false; errors: ValidationErrors }> {
    const schema = mode === 'drawer' ? drawerPermitSchema : generalPermitSchema;

    try {
        await schema.validate(formData, { abortEarly: false });
        return { valid: true };
    } catch (err) {
        if (err instanceof Yup.ValidationError) {
            const tabErrors: ValidationErrors = {};
            for (const inner of err.inner) {
                const path = inner.path || '';
                const tab = fieldToTabMap[path];
                if (tab === currentTab) {
                    tabErrors[path] = inner.message;
                }
            }
            if (Object.keys(tabErrors).length === 0) {
                return { valid: true };
            }
            return { valid: false, errors: tabErrors };
        }
        throw err;
    }
}
