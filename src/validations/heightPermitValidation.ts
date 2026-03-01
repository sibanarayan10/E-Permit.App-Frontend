/**
 * Yup validation schemas for Height Permit form
 *
 * Mirrors the structure of CreateHeightPermitDrawer.tsx
 */

import * as Yup from 'yup';

// ──────────────────────────────────────────────────────
// Helper: Schedule / Period of Work Schema
// ──────────────────────────────────────────────────────

const scheduleSchema = Yup.object().shape({
    startTimeDate: Yup.object().shape({
        date: Yup.date().required('Start date is required'),
        hrs: Yup.string().required('Start time is required'),
    }),
    finishTimeDate: Yup.object().shape({
        date: Yup.date()
            .required('Finish date is required')
            .test(
                'finish-after-start',
                'Finish date must be on or after start date',
                function (finishDate) {
                    // Navigate up to schedule level to access startTimeDate
                    // Yup 'this.from' gives access to parent contexts in reverse order
                    // this.from[0] is current object, this.from[1] is parent (schedule)
                    const schedule = this.from?.[1]?.value;
                    const startDate = schedule?.startTimeDate?.date;

                    if (!startDate || !finishDate) return true;

                    const start = new Date(startDate);
                    const finish = new Date(finishDate);
                    // Compare date portion only (ignore time)
                    start.setHours(0, 0, 0, 0);
                    finish.setHours(0, 0, 0, 0);

                    return finish >= start;
                }
            ),
        hrs: Yup.string().required('Finish time is required'),
    }),
});

// ──────────────────────────────────────────────────────
// Helper: Initiator Signature Schema
// ──────────────────────────────────────────────────────

const initiatorSignatureSchema = Yup.object().shape({
    name: Yup.string()
        .trim()
        .required('Initiator name is required'),
    signature: Yup.string()
        .trim()
        .required('Initiator signature is required. Please ensure your profile has a signature.'),
    date: Yup.date(),
    time: Yup.string(),
});

// ──────────────────────────────────────────────────────
// Main Height Permit Schema
// ──────────────────────────────────────────────────────

export const heightPermitSchema = Yup.object().shape({
    // Basic Tab
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

    personOrContractorResponsible: Yup.object().shape({
        name: Yup.string()
            .trim()
            .required('Person or Contractor Responsible is required'),
        nameOfContractorsSupervisor: Yup.string().nullable(),
        nameOfDepartmentalRepresentative: Yup.string().nullable(),
    }),

    jobLocation: Yup.string()
        .trim()
        .required('Job Location is required'),

    jobDescription: Yup.string()
        .trim()
        .required('Job Description is required'),

    schedule: scheduleSchema,

    // Hazards Tab - Loose validation (just structure)
    hazardsAssociated: Yup.object(),
    fallProtectionSystem: Yup.object(),

    // Context Tab - Loose validation
    workContext: Yup.object(),
    fallProtectionEquipment: Yup.object(),
    methodOfAccess: Yup.object(),

    // Risk Assessment Tab
    riskAssessment: Yup.object().shape({
        HIRAOrJSACompleted: Yup.string(),
    }),

    // Check that if names are added, they are not empty?
    numberOfPersonsAuthorized: Yup.array().of(
        Yup.object().shape({
            name: Yup.string().trim().required("Name is required"),
            heightPassRefNo: Yup.string().nullable()
        })
    ),

    incidentsOrNearMisses: Yup.string(),

    initiatorSignature: initiatorSignatureSchema,
});

// ──────────────────────────────────────────────────────
// Helpers for Tab Navigation & Validation Running
// ──────────────────────────────────────────────────────

/**
 * Map a Yup field path to the tab it belongs to.
 * Used to navigate the user to the first tab that has an error.
 */
export const fieldToTabMap: Record<string, string> = {
    // Basic Tab
    permitNumber: 'basic',
    protocolNumber: 'basic',
    srNo: 'basic',
    'personOrContractorResponsible.name': 'basic',
    'personOrContractorResponsible.nameOfContractorsSupervisor': 'basic',
    'personOrContractorResponsible.nameOfDepartmentalRepresentative': 'basic',
    jobLocation: 'basic',
    jobDescription: 'basic',
    'schedule.startTimeDate.date': 'basic',
    'schedule.startTimeDate.hrs': 'basic',
    'schedule.finishTimeDate.date': 'basic',
    'schedule.finishTimeDate.hrs': 'basic',

    // Hazards Tab
    'hazardsAssociated': 'hazards',
    'fallProtectionSystem': 'hazards',

    // Context Tab
    'workContext': 'context',
    'fallProtectionEquipment': 'context',
    'methodOfAccess': 'context',

    // Risk Assessment Tab
    'riskAssessment.HIRAOrJSACompleted': 'assessment',
    'numberOfPersonsAuthorized': 'assessment',
    'incidentsOrNearMisses': 'assessment',
    'initiatorSignature.name': 'assessment',
    'initiatorSignature.signature': 'assessment',
    'initiatorSignature.date': 'assessment',
    'initiatorSignature.time': 'assessment',
};

/** Tab display order – used to determine which tab should be shown first */
const tabPriority = ['basic', 'hazards', 'context', 'assessment'];

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
                // Handle nested array errors (e.g. numberOfPersonsAuthorized[0].name)
                // We map them to the parent field if possible
                let tab: string | undefined = fieldToTabMap[path];

                if (!tab) {
                    // Try finding prefix match for arrays/objects
                    const key = Object.keys(fieldToTabMap).find(k => path.startsWith(k));
                    if (key) {
                        tab = fieldToTabMap[key];
                    }
                }

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

/** Validate using the height permit schema */
export async function validateHeightPermit(formData: Record<string, any>) {
    return runValidation(heightPermitSchema, formData);
}
