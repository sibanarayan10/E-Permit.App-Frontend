/**
 * Issuer Approval - Yup validation schemas
 * Per-step validation with inline error support
 */

import * as Yup from 'yup';

// ──────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────

export type ValidationErrors = Record<string, string>;

// ──────────────────────────────────────────────────────
// Step 1 Schema: Isolation Details
// ──────────────────────────────────────────────────────

const step1Schema = Yup.object().shape({
    isolationDetails: Yup.array()
        .min(1, 'At least one isolation record is required'),
});

// ──────────────────────────────────────────────────────
// Step 2 Schema: Issuer Certification
// ──────────────────────────────────────────────────────

const step2Schema = Yup.object().shape({
    issuerCertification: Yup.object().shape({
        verifiedAndFoundSatisfactory: Yup.boolean()
            .oneOf([true], 'You must verify the work as satisfactory'),

        issuerDetails: Yup.object().shape({
            name: Yup.string()
                .trim()
                .required('Issuer name is required'),
            signature: Yup.string()
                .trim()
                .required('Issuer signature is required. Please ensure your profile has a signature.'),
        }),
    }),
});

// ──────────────────────────────────────────────────────
// Add Isolation Detail validation
// ──────────────────────────────────────────────────────

const isolationDetailSchema = Yup.object().shape({
    equipmentNameNo: Yup.string()
        .trim()
        .required('Equipment Name/No is required'),
    isolationType: Yup.string()
        .trim()
        .required('Isolation Type is required'),
    nameOfAuthorizedIsolator: Yup.string()
        .trim()
        .required('Authorized Isolator name is required'),
});

// ──────────────────────────────────────────────────────
// Field → Step mapping
// ──────────────────────────────────────────────────────

export const fieldToStepMap: Record<string, number> = {
    'isolationDetails': 0,
    'issuerCertification.verifiedAndFoundSatisfactory': 1,
    'issuerCertification.issuerDetails.name': 1,
    'issuerCertification.issuerDetails.signature': 1,
};

// ──────────────────────────────────────────────────────
// Validation runners
// ──────────────────────────────────────────────────────

/**
 * Validate a specific step of the Issuer Approval form.
 */
export async function validateIssuerStep(
    formData: Record<string, any>,
    step: number
): Promise<{ valid: true } | { valid: false; errors: ValidationErrors }> {
    const schema = step === 0 ? step1Schema : step2Schema;

    try {
        await schema.validate(formData, { abortEarly: false });
        return { valid: true };
    } catch (err) {
        if (err instanceof Yup.ValidationError) {
            const errors: ValidationErrors = {};
            for (const inner of err.inner) {
                const path = inner.path || '';
                errors[path] = inner.message;
            }
            if (Object.keys(errors).length === 0) {
                return { valid: true };
            }
            return { valid: false, errors };
        }
        throw err;
    }
}

/**
 * Validate the new isolation detail before adding it to the list.
 */
export async function validateNewIsolationDetail(
    detail: Record<string, any>
): Promise<{ valid: true } | { valid: false; errors: ValidationErrors }> {
    try {
        await isolationDetailSchema.validate(detail, { abortEarly: false });
        return { valid: true };
    } catch (err) {
        if (err instanceof Yup.ValidationError) {
            const errors: ValidationErrors = {};
            for (const inner of err.inner) {
                const path = inner.path || '';
                errors[path] = inner.message;
            }
            return { valid: false, errors };
        }
        throw err;
    }
}
