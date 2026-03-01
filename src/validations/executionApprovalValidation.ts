/**
 * Execution Approval - Yup validation schemas
 * Mirrors the manual validateStep logic with inline error support
 */

import * as Yup from 'yup';

// ──────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────

export type ValidationErrors = Record<string, string>;

// ──────────────────────────────────────────────────────
// Pre-execution check fields (must all be answered)
// ──────────────────────────────────────────────────────

const PRE_EXECUTION_CHECK_FIELDS = [
    'jobSpecificSafetyTalk',
    'sparkGeneratingWork',
    'combustibleMaterialRemoved',
    'barriersGuardsUsed',
    'barricadingRequired',
    'fireExtinguisherLocationKnown',
    'additionalIlluminationRequired',
    'additionalSupplyPointsRequired',
    'gasTestingRequired',
    'periodicGasMonitoringRequired',
];

// ──────────────────────────────────────────────────────
// Step 1 Schema: Executing Agency Details
// ──────────────────────────────────────────────────────

const step1Schema = Yup.object().shape({
    executingAgency: Yup.object().shape({
        acceptorName: Yup.string()
            .trim()
            .required('Acceptor name is required'),

        acceptorSignature: Yup.object().shape({
            signature: Yup.string()
                .trim()
                .required('Acceptor signature is required. Please ensure your profile has a signature.'),
        }),

        numberOfPersonsAttached: Yup.string(),

        nameOfPersons: Yup.array()
            .of(Yup.string())
            .test(
                'persons-count-match',
                'Number of persons added must match the specified count',
                function (nameOfPersons) {
                    const numAttached = this.parent?.numberOfPersonsAttached;
                    const limit = numAttached ? parseInt(numAttached) : 0;
                    if (limit > 0 && nameOfPersons) {
                        if (nameOfPersons.length !== limit) {
                            return this.createError({
                                message: `Number of persons must be exactly ${limit}. Currently added: ${nameOfPersons.length}`,
                            });
                        }
                    }
                    return true;
                }
            ),
    }),
});

// ──────────────────────────────────────────────────────
// Step 2 Schema: Pre-Execution Checks
// ──────────────────────────────────────────────────────

const preExecutionChecksShape: Record<string, Yup.StringSchema> = {};
PRE_EXECUTION_CHECK_FIELDS.forEach(field => {
    preExecutionChecksShape[field] = Yup.string()
        .required(`Please select YES, NO, or N/A`)
        .oneOf(['YES', 'NO', 'NA'], 'Please select YES, NO, or N/A');
});

const step2Schema = Yup.object().shape({
    preExecutionChecks: Yup.object().shape({
        ...preExecutionChecksShape,
        repDetails: Yup.object().shape({
            name: Yup.string()
                .trim()
                .required('Representative name is required'),
            signature: Yup.string()
                .trim()
                .required('Representative signature is required'),
        }),
    }),
});

// ──────────────────────────────────────────────────────
// Field → Step mapping
// ──────────────────────────────────────────────────────

export const fieldToStepMap: Record<string, number> = {
    'executingAgency.acceptorName': 0,
    'executingAgency.acceptorSignature.signature': 0,
    'executingAgency.nameOfPersons': 0,
    'executingAgency.numberOfPersonsAttached': 0,
    ...Object.fromEntries(
        PRE_EXECUTION_CHECK_FIELDS.map(f => [`preExecutionChecks.${f}`, 1])
    ),
    'preExecutionChecks.repDetails.name': 1,
    'preExecutionChecks.repDetails.signature': 1,
};

// ──────────────────────────────────────────────────────
// Validation runner
// ──────────────────────────────────────────────────────

/**
 * Validate a specific step of the Execution Approval form.
 * Returns `{ valid: true }` if the step passes, or `{ valid: false, errors }` with
 * only the errors relevant to that step.
 */
export async function validateExecutionStep(
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
 * Validate ALL steps at once (used on final submit).
 * Returns errors keyed by field path and the first step index that has errors.
 */
export async function validateAllExecutionSteps(
    formData: Record<string, any>
): Promise<
    | { valid: true }
    | { valid: false; errors: ValidationErrors; firstErrorStep: number }
> {
    const allErrors: ValidationErrors = {};
    let firstErrorStep = -1;

    for (let step = 0; step <= 1; step++) {
        const result = await validateExecutionStep(formData, step);
        if (!result.valid) {
            Object.assign(allErrors, result.errors);
            if (firstErrorStep === -1) firstErrorStep = step;
        }
    }

    if (Object.keys(allErrors).length === 0) {
        return { valid: true };
    }

    return { valid: false, errors: allErrors, firstErrorStep };
}
