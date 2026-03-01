/**
 * Send Permit Email Utility - Send emails with PDF attachments
 */

import { generateGeneralWorkPermitPDF } from './pdfGenerator';
import { sendEmailWithPDF } from '@/services';
import type { Permit } from '@/models';

interface SendPermitPDFEmailOptions {
    templateNo: number;
    permit: Permit;
    recipientEmail: string;
    recipientName: string;
}

interface EmailResult {
    success: boolean;
    message: string;
}

/**
 * Generate PDF from permit data and send email with attachment
 * Uses the same PDF as the download button (generateGeneralWorkPermitPDF)
 */
export const sendPermitPDFEmail = async ({
    templateNo,
    permit,
    recipientEmail,
    recipientName,
}: SendPermitPDFEmailOptions): Promise<EmailResult> => {
    try {
        console.log('📧 Starting PDF email generation...');
        console.log('Template:', templateNo, 'Recipient:', recipientEmail);

        // Generate PDF using the same function as download button
        // Pass returnBase64: true to get base64 instead of downloading
        const pdfBase64 = await generateGeneralWorkPermitPDF(permit, { returnBase64: true });

        console.log('PDF Base64 generated:', pdfBase64 ? `Length: ${pdfBase64.length}` : 'NULL');

        if (!pdfBase64) {
            console.error('Failed to generate PDF - no data returned');
            return { success: false, message: 'PDF generation failed' };
        }

        console.log('📤 Sending email with PDF attachment...');

        // Send email with PDF
        const result = await sendEmailWithPDF({
            templateNo,
            recipientEmail,
            recipientName,
            permitData: {
                permitNumber: permit.permitNumber,
                protocolNumber: permit.protocolNumber || '',
                srNo: permit.srNo || '',
                permitStatus: permit.permitStatus || permit.status,
                currentStage: permit.currentStage || permit.stage,
                initiator: permit.initiator,
            },
            pdfBase64,
            pdfFilename: `General_Work_Permit_${permit.permitNumber}.pdf`,
        });

        console.log('📧 Email API result:', result);
        return result;
    } catch (error) {
        console.error('Failed to send permit PDF email:', error);
        return { success: false, message: (error as Error).message };
    }
};

/**
 * Send approval email with PDF (Template #5)
 */
export const sendApprovalEmailWithPDF = async (
    permit: Permit,
    recipientEmail: string,
    recipientName: string
): Promise<EmailResult> => {
    return sendPermitPDFEmail({
        templateNo: 5,
        permit,
        recipientEmail,
        recipientName,
    });
};

/**
 * Send closure email with PDF (Template #12)
 */
export const sendClosureEmailWithPDF = async (
    permit: Permit,
    recipientEmail: string,
    recipientName: string
): Promise<EmailResult> => {
    return sendPermitPDFEmail({
        templateNo: 12,
        permit,
        recipientEmail,
        recipientName,
    });
};
