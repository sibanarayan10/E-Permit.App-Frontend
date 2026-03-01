/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
/**
 * PDF Generator Utility
 * This file generates permit PDFs using jsPDF and html2canvas
 * Note: This is migrated from JS - using ts-nocheck for compatibility
 * Original functionality is preserved from the JavaScript version
 */

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logo from "../assets/sailLogo.png";

// Type definitions
type PermitData = Record<string, any>;
type UserData = { name?: string } | null;
type PDFOptions = { returnBase64?: boolean };

const renderSignature = (signature: any): string => {
  if (!signature) return "";

  // Image signature (base64 or URL)
  if (
    typeof signature === "string" &&
    (signature.startsWith("data:image") || signature.startsWith("http"))
  ) {
    return `
      <img 
        src="${signature}" 
        style="
          max-width:100%;
          max-height:100%;
          object-fit:contain;
          display:block;
        "
      />
    `;
  }

  // Text fallback
  return `<span>${signature}</span>`;
};
const signatureBox = (signature) => `
  <div style="
    width:15%;
    height:22px;
    display:flex;
    align-items:center;
    justify-content:center;
    overflow:hidden;
  ">
    ${renderSignature(signature)}
  </div>
`;
export const generatePermitPDF = async (permit, user) => {
  // Create a temporary div to hold the PDF content
  const element = document.createElement("div");
  element.style.position = "absolute";
  element.style.left = "-9999px";
  element.style.top = "0";
  element.style.width = "794px"; // A4 width in pixels
  element.style.padding = "2px";
  element.style.backgroundColor = "white";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.fontSize = "10px";
  element.style.color = "#000000"; // Explicitly set black text color

  // Format dates
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      Draft: "#6c757d",
      Pending_Execution: "#ffc107",
      Pending_Issuer: "#0dcaf0",
      Approved: "#198754",
      Returned: "#dc3545",
      Rejected: "#6c757d",
      Closed: "#6c757d",
    };
    return colors[status] || "#6c757d";
  };

  // Get stage color
  const getStageColor = (stage) => {
    const colors = {
      Initiator: "#198754",
      Execution: "#fd7e14",
      Issuer: "#0dcaf0",
    };
    return colors[stage] || "#6c757d";
  };

  // Generate PDF content
  element.innerHTML = `
    <div id="permit-pdf-content" style="border: 0.5px solid #2c3e50; padding: 8px; background: white;">
      <!-- Ultra Compact Header -->
      <div style="
        position: relative;
        padding: 2px 0 4px 0;
        margin-bottom: 10px;
        border-bottom: 0.5px solid #2c3e50;
        text-align: center;
        font-family: Arial, sans-serif;
      ">
        <img src="${logo}" 
             style="position: absolute; left: 0; top: -1px; width: 90px; height: auto;" />
        <div style="font-size: 12px; font-weight: 700; color: #2c3e50; line-height: 1;">
          भिलाई इस्पात संयंत्र
        </div>
        <div style="font-size: 12px; font-weight: 700; color: #2c3e50; line-height: 1;">
          BHILAI STEEL PLANT
        </div>
        <div style="font-size: 11px; font-weight: 700; color: #2c3e50; margin-top: 2px; line-height: 1;">
          Safety Engineering Department
        </div>
        <div style="font-size: 13px; font-weight: 900; color: #2c3e50; margin-top: 2px; line-height: 1;">
          ELECTRONIC WORK PERMIT
        </div>
      </div>

      <!-- Permit Basic Information -->
      <div style="margin-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <div>
            <strong>Permit Number:</strong> ${permit.permitNumber}
          </div>
          <div style="padding: 2px 8px; background: ${getStatusColor(
    permit.permitStatus
  )}; color: white; border-radius: 2px; font-weight: bold; font-size: 9px;">
            ${permit.permitStatus.replace("_", " ")}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <div>
            <strong>Current Stage:</strong> 
            <span style="padding: 1px 6px; background: ${getStageColor(
    permit.currentStage
  )}; color: white; border-radius: 2px; font-weight: bold; margin-left: 3px; font-size: 9px;">
              ${permit.currentStage}
            </span>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 9px;">
          <div>
            <strong>PO Number:</strong> ${permit.poNumber}
          </div>
          <div>
            <strong>Permit Type:</strong> ${permit.permitType}
          </div>
          <div>
            <strong>Contractor:</strong> ${permit.contractor}
          </div>
          <div>
            <strong>Issue Date:</strong> ${formatDate(permit.issueDate)}
          </div>
          <div>
            <strong>Expiry Date:</strong> ${formatDate(permit.expiryDate)}
          </div>
          <div style="grid-column: 1 / -1;">
            <strong>Location:</strong> ${permit.location}
          </div>
          <div style="grid-column: 1 / -1;">
            <strong>Work Description:</strong> ${permit.workDescription}
          </div>
        </div>
      </div>

      <!-- Safety Information -->
      ${permit.riskAssessment || permit.safetyMeasures
      ? `
        <div style="margin-bottom: 12px;">
          <div style="font-weight: bold; border-bottom: 0.5px solid #ddd; padding-bottom: 3px; margin-bottom: 6px; font-size: 10px;">
            SAFETY INFORMATION
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 9px;">
            ${permit.riskAssessment
        ? `
              <div>
                <strong>Risk Assessment:</strong><br>
                ${permit.riskAssessment}
              </div>
            `
        : ""
      }
            ${permit.safetyMeasures
        ? `
              <div>
                <strong>Safety Measures:</strong><br>
                ${permit.safetyMeasures}
              </div>
            `
        : ""
      }
            ${permit.emergencyProcedures
        ? `
              <div>
                <strong>Emergency Procedures:</strong><br>
                ${permit.emergencyProcedures}
              </div>
            `
        : ""
      }
            ${permit.toolsRequired
        ? `
              <div>
                <strong>Tools Required:</strong><br>
                ${permit.toolsRequired}
              </div>
            `
        : ""
      }
            ${permit.personalProtectiveEquipment
        ? `
              <div style="grid-column: 1 / -1;">
                <strong>Personal Protective Equipment:</strong><br>
                ${permit.personalProtectiveEquipment}
              </div>
            `
        : ""
      }
          </div>
        </div>
      `
      : ""
    }

      <!-- Execution Approval -->
      ${permit.executionApproval
      ? `
        <div style="margin-bottom: 12px; border: 0.5px solid ${permit.executionApproval.approved ? "#198754" : "#ffc107"
      }; padding: 8px; background: ${permit.executionApproval.approved ? "#d1e7dd" : "#fff3cd"
      }; font-size: 9px;">
          <div style="font-weight: bold; color: ${permit.executionApproval.approved ? "#0f5132" : "#856404"
      }; margin-bottom: 6px; font-size: 10px;">
            EXECUTION APPROVAL
          </div>
          <div style="margin-bottom: 4px;">
            <strong>Status:</strong> 
            <span style="color: ${permit.executionApproval.approved ? "#198754" : "#fd7e14"
      }; font-weight: bold;">
              ${permit.executionApproval.approved ? "APPROVED" : "RETURNED"}
            </span>
          </div>
          ${permit.executionApproval.comments
        ? `
            <div style="margin-bottom: 4px;">
              <strong>Comments:</strong> ${permit.executionApproval.comments}
            </div>
          `
        : ""
      }
          ${permit.siteConditions
        ? `
            <div style="margin-bottom: 4px;">
              <strong>Site Conditions:</strong> ${permit.siteConditions}
            </div>
          `
        : ""
      }
          ${permit.additionalSafetyMeasures
        ? `
            <div style="margin-bottom: 4px;">
              <strong>Additional Safety Measures:</strong> ${permit.additionalSafetyMeasures}
            </div>
          `
        : ""
      }
          <div style="font-size: 8px; color: #666;">
            ${permit.executionApproval.approved ? "Approved" : "Returned"
      } by: ${permit.executionApproval.approvedBy?.name || "Unknown"
      } on ${formatDate(permit.executionApproval.approvedAt)}
          </div>
        </div>
      `
      : ""
    }

      <!-- Issuer Approval -->
      ${permit.issuerApproval
      ? `
        <div style="margin-bottom: 12px; border: 0.5px solid ${permit.issuerApproval.approved ? "#198754" : "#ffc107"
      }; padding: 8px; background: ${permit.issuerApproval.approved ? "#d1e7dd" : "#fff3cd"
      }; font-size: 9px;">
          <div style="font-weight: bold; color: ${permit.issuerApproval.approved ? "#0f5132" : "#856404"
      }; margin-bottom: 6px; font-size: 10px;">
            ISSUER APPROVAL
          </div>
          <div style="margin-bottom: 4px;">
            <strong>Status:</strong> 
            <span style="color: ${permit.issuerApproval.approved ? "#198754" : "#fd7e14"
      }; font-weight: bold;">
              ${permit.issuerApproval.approved ? "APPROVED" : "RETURNED"}
            </span>
          </div>
          ${permit.issuerApproval.comments
        ? `
            <div style="margin-bottom: 4px;">
              <strong>Comments:</strong> ${permit.issuerApproval.comments}
            </div>
          `
        : ""
      }
          ${permit.finalChecks
        ? `
            <div style="margin-bottom: 4px;">
              <strong>Final Checks:</strong> ${permit.finalChecks}
            </div>
          `
        : ""
      }
          ${permit.complianceVerification
        ? `
            <div style="margin-bottom: 4px;">
              <strong>Compliance Verification:</strong> ${permit.complianceVerification}
            </div>
          `
        : ""
      }
          <div style="font-size: 8px; color: #666;">
            ${permit.issuerApproval.approved ? "Approved" : "Returned"} by: ${permit.issuerApproval.approvedBy?.name || "Unknown"
      } on ${formatDate(permit.issuerApproval.approvedAt)}
          </div>
        </div>
      `
      : ""
    }

      <!-- Return Information -->
      ${permit.returnedReason
      ? `
        <div style="margin-bottom: 12px; border: 0.5px solid #dc3545; padding: 8px; background: #f8d7da; font-size: 9px;">
          <div style="font-weight: bold; color: #721c24; margin-bottom: 6px; font-size: 10px;">
            RETURN INFORMATION
          </div>
          <div style="margin-bottom: 4px;">
            <strong>Return Reason:</strong> ${permit.returnedReason}
          </div>
        </div>
      `
      : ""
    }

      <!-- Footer -->
      <div style="border-top: 0.5px solid #2c3e50; padding-top: 8px; margin-top: 12px; text-align: center; font-size: 8px;">
        <div style="color: #666;">
          Generated by: ${user?.name || "System"
    } | ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
        </div>
        <div style="color: #999; margin-top: 2px;">
          e-PTW System - Safety Engineering Department
        </div>
      </div>
    </div>
  `;

  // Add to document
  document.body.appendChild(element);

  try {
    // Generate PDF
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save(`Permit-${permit.permitNumber}.pdf`);
  } catch (error) {
    throw new Error(
      "Failed to generate PDF: " + (error.message || "Unknown error")
    );
  } finally {
    // Clean up
    document.body.removeChild(element);
  }
};

// Simple PDF generator without HTML2Canvas (alternative method)
export const generateSimplePermitPDF = (permit, user) => {
  const pdf = new jsPDF();

  // Set font
  pdf.setFont("helvetica");

  // Header
  pdf.setFontSize(12);
  pdf.setTextColor(44, 62, 80);
  pdf.text("BHILAI STEEL PLANT", 105, 10, { align: "center" });
  pdf.text("भिलाई इस्पात संयंत्र", 105, 15, { align: "center" });

  pdf.setFontSize(10);
  pdf.text("Safety Engineering Department", 105, 22, { align: "center" });

  pdf.setFontSize(14);
  pdf.text("ELECTRONIC WORK PERMIT", 105, 30, { align: "center" });

  // Horizontal line
  pdf.setDrawColor(44, 62, 80);
  pdf.line(15, 35, 195, 35);

  let yPosition = 42;

  // Permit Information
  pdf.setFontSize(10);
  pdf.setTextColor(0, 0, 0);

  // Permit Number and Status
  pdf.setFontSize(11);
  pdf.text(`Permit Number: ${permit.permitNumber}`, 15, yPosition);

  // Status with background
  const status = permit.permitStatus.replace("_", " ");
  const statusWidth = pdf.getTextWidth(status) + 4;
  pdf.setFillColor(255, 193, 7);
  if (permit.permitStatus === "Approved") pdf.setFillColor(25, 135, 84);
  if (permit.permitStatus === "Returned") pdf.setFillColor(220, 53, 69);
  if (permit.permitStatus === "Draft") pdf.setFillColor(108, 117, 125);
  pdf.rect(195 - statusWidth, yPosition - 3, statusWidth, 5, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.text(status, 195 - statusWidth + 2, yPosition);
  pdf.setTextColor(0, 0, 0);

  yPosition += 8;

  // Current Stage
  pdf.setFontSize(9);
  pdf.text(`Current Stage: ${permit.currentStage}`, 15, yPosition);
  yPosition += 6;

  // Basic Information
  pdf.setFontSize(8);
  pdf.text(`PO Number: ${permit.poNumber}`, 15, yPosition);
  pdf.text(`Permit Type: ${permit.permitType}`, 110, yPosition);
  yPosition += 5;

  pdf.text(`Contractor: ${permit.contractor}`, 15, yPosition);
  pdf.text(
    `Issue Date: ${new Date(permit.issueDate).toLocaleDateString()}`,
    110,
    yPosition
  );
  yPosition += 5;

  pdf.text(
    `Expiry Date: ${new Date(permit.expiryDate).toLocaleDateString()}`,
    15,
    yPosition
  );
  pdf.text(`Location: ${permit.location}`, 110, yPosition);
  yPosition += 8;

  // Work Description
  const workDescLines = pdf.splitTextToSize(
    `Work Description: ${permit.workDescription}`,
    180
  );
  pdf.text(workDescLines, 15, yPosition);
  yPosition += workDescLines.length * 4 + 5;

  // Safety Information
  if (permit.riskAssessment || permit.safetyMeasures) {
    pdf.setFontSize(9);
    pdf.setTextColor(44, 62, 80);
    pdf.text("SAFETY INFORMATION", 15, yPosition);
    yPosition += 6;

    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);

    if (permit.riskAssessment) {
      const riskLines = pdf.splitTextToSize(
        `Risk Assessment: ${permit.riskAssessment}`,
        85
      );
      pdf.text(riskLines, 20, yPosition);
      yPosition += riskLines.length * 3 + 2;
    }
    if (permit.safetyMeasures) {
      const safetyLines = pdf.splitTextToSize(
        `Safety Measures: ${permit.safetyMeasures}`,
        85
      );
      pdf.text(safetyLines, 20, yPosition);
      yPosition += safetyLines.length * 3 + 2;
    }
    if (permit.emergencyProcedures) {
      const emergencyLines = pdf.splitTextToSize(
        `Emergency Procedures: ${permit.emergencyProcedures}`,
        85
      );
      pdf.text(emergencyLines, 20, yPosition);
      yPosition += emergencyLines.length * 3 + 2;
    }
    if (permit.toolsRequired) {
      const toolsLines = pdf.splitTextToSize(
        `Tools Required: ${permit.toolsRequired}`,
        85
      );
      pdf.text(toolsLines, 20, yPosition);
      yPosition += toolsLines.length * 3 + 2;
    }
    if (permit.personalProtectiveEquipment) {
      const ppeLines = pdf.splitTextToSize(
        `PPE: ${permit.personalProtectiveEquipment}`,
        180
      );
      pdf.text(ppeLines, 20, yPosition);
      yPosition += ppeLines.length * 3 + 2;
    }
    yPosition += 3;
  }

  // Execution Approval
  if (permit.executionApproval) {
    pdf.setFontSize(9);
    pdf.setTextColor(44, 62, 80);
    pdf.text("EXECUTION APPROVAL", 15, yPosition);
    yPosition += 6;

    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);

    pdf.text(
      `Status: ${permit.executionApproval.approved ? "APPROVED" : "RETURNED"}`,
      20,
      yPosition
    );
    yPosition += 4;

    if (permit.executionApproval.comments) {
      const commentLines = pdf.splitTextToSize(
        `Comments: ${permit.executionApproval.comments}`,
        170
      );
      pdf.text(commentLines, 20, yPosition);
      yPosition += commentLines.length * 3 + 2;
    }

    pdf.text(
      `Approved by: ${permit.executionApproval.approvedBy?.name || "Unknown"
      } on ${new Date(
        permit.executionApproval.approvedAt
      ).toLocaleDateString()}`,
      20,
      yPosition
    );
    yPosition += 8;
  }

  // Issuer Approval
  if (permit.issuerApproval) {
    pdf.setFontSize(9);
    pdf.setTextColor(44, 62, 80);
    pdf.text("ISSUER APPROVAL", 15, yPosition);
    yPosition += 6;

    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);

    pdf.text(
      `Status: ${permit.issuerApproval.approved ? "APPROVED" : "RETURNED"}`,
      20,
      yPosition
    );
    yPosition += 4;

    if (permit.issuerApproval.comments) {
      const commentLines = pdf.splitTextToSize(
        `Comments: ${permit.issuerApproval.comments}`,
        170
      );
      pdf.text(commentLines, 20, yPosition);
      yPosition += commentLines.length * 3 + 2;
    }

    pdf.text(
      `Approved by: ${permit.issuerApproval.approvedBy?.name || "Unknown"
      } on ${new Date(permit.issuerApproval.approvedAt).toLocaleDateString()}`,
      20,
      yPosition
    );
    yPosition += 8;
  }

  // Return Information
  if (permit.returnedReason) {
    pdf.setFontSize(9);
    pdf.setTextColor(44, 62, 80);
    pdf.text("RETURN INFORMATION", 15, yPosition);
    yPosition += 6;

    pdf.setFontSize(7);
    pdf.setTextColor(0, 0, 0);

    const returnLines = pdf.splitTextToSize(
      `Return Reason: ${permit.returnedReason}`,
      170
    );
    pdf.text(returnLines, 20, yPosition);
    yPosition += returnLines.length * 3 + 2;
  }

  // Footer
  pdf.setFontSize(6);
  pdf.setTextColor(100, 100, 100);
  pdf.text(
    `Generated by: ${user?.name || "System"
    } on ${new Date().toLocaleDateString()}`,
    15,
    285
  );
  pdf.text("e-PTW System - Safety Engineering Department", 105, 285, {
    align: "center",
  });

  // Save PDF
  pdf.save(`Permit-${permit.permitNumber}.pdf`);
};

// Generate General Work Permit PDF matching the form structure
export const generateGeneralWorkPermitPDF = async (permit, user) => {
  // Create a temporary div to hold the PDF content
  const element = document.createElement("div");
  element.style.position = "absolute";
  element.style.left = "-9999px";
  element.style.top = "0";
  element.style.width = "794px";
  element.style.padding = "15px";
  element.style.backgroundColor = "white";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.fontSize = "9px";
  element.style.lineHeight = "1.3";
  element.style.color = "#000000"; // Explicitly set black text color

  // Helper functions
  const formatDate = (dateValue) => {
    if (!dateValue) return "";
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return "";
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const formatDateTime = (dateValue, timeValue) => {
    const dateStr = formatDate(dateValue);
    return timeValue ? `${dateStr} ${timeValue}` : dateStr;
  };
  // const ynBox = (value) => {
  //   const v = String(value || "").toUpperCase();
  //   return `
  //   <span style="
  //     display:inline-block;
  //     width:28px;
  //     text-align:center;
  //     border:0.5px solid #000;
  //     font-weight:bold;
  //     font-size:8px;
  //   ">
  //     ${v === "YES" ? "Yes" : "NO"}
  //   </span>
  // `;
  // };
  // Helper for YES/NO/N/A checkbox display (matching closure checklist style)
  const ynCheckboxPreChecks = (value, targetValue) => {
    const v = String(value || "").toUpperCase();
    const isChecked = v === targetValue || (v === "TRUE" && targetValue === "YES") || (v === "FALSE" && targetValue === "NO");
    return `<span style="display:inline-block; width:35px; text-align:center; border:0.5px solid #000; font-weight:${isChecked ? 'bold' : 'normal'}; background:${isChecked ? '#e0e0e0' : 'white'};">${isChecked ? targetValue : ''}</span>`;
  };
  const element2 = document.createElement("div");
  element2.style.position = "absolute";
  element2.style.left = "-9999px";
  element2.style.top = "0";
  element2.style.width = "794px";
  element2.style.padding = "12px";
  element2.style.backgroundColor = "white";
  element2.style.fontFamily = "Arial, sans-serif";
  element2.style.fontSize = "8px";
  element2.style.color = "#000000";

  element2.innerHTML = `
<div style="border:0.5px solid #000; padding:12px; font-size:8px; background:white; color:#000000;">

  <!-- TOP HEADER -->
  <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
    <tr>
      <td style="border:0.5px solid #000; width:15%; text-align:center;">
        <img src="${logo}" style="width:50px;" />
      </td>
      <td style="border:0.5px solid #000; text-align:center; font-weight:bold;">
        STANDARD FOR PERMIT TO WORK<br/>
        (BSP-TS-05)
      </td>
      <td style="border:0.5px solid #000; width:15%; font-size:7px;">
        Issue :<br/>Rev : 01
      </td>
    </tr>
  </table>

  <div style="font-weight:bold; margin-bottom:6px;">
    15.4 Permit to Work Checklist
  </div>

  <!-- PRE PERMIT CHECKS -->
  <div style="font-weight:bold; margin-bottom:4px;">
    PRE PERMIT CHECKS (To be filled up by Initiator)
  </div>

  <table style="width:100%; border-collapse:collapse; font-size:8px; margin-bottom:12px;">
    <tr style="background:#f0f0f0;">
      <th style="border:0.5px solid #000; padding:6px; text-align:left; width:55%;"></th>
      <th style="border:0.5px solid #000; padding:6px; width:15%; text-align:center;">YES</th>
      <th style="border:0.5px solid #000; padding:6px; width:15%; text-align:center;">NO</th>
      <th style="border:0.5px solid #000; padding:6px; width:15%; text-align:center;">N/A</th>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Electrical Isolation</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.electricalIsolation, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.electricalIsolation, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.electricalIsolation, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Mechanical Isolation</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.mechanicalIsolation, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.mechanicalIsolation, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.mechanicalIsolation, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Gas Isolation (Methane, O₂, CO, BF etc.)</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.gasIsolation, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.gasIsolation, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.gasIsolation, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Utilities (Air, Water, Steam, Hyd etc.)</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.utilitiesIsolation, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.utilitiesIsolation, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.utilitiesIsolation, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Traffic (Road, Rail)</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.trafficAwareness, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.trafficAwareness, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.trafficAwareness, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Relevant Departments made aware of isolation requirements</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.relevantDeptAwareOfIsolation, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.relevantDeptAwareOfIsolation, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.relevantDeptAwareOfIsolation, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Working at Height?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.workingAtHeight, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.workingAtHeight, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.workingAtHeight, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Working in a confined Space?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.workingInConfinedSpace, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.workingInConfinedSpace, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.workingInConfinedSpace, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Excavation?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.excavation, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.excavation, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.excavation, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Gas testing required?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.gasTestingRequired, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.gasTestingRequired, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.gasTestingRequired, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Is periodic testing of gas required during the work?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.periodicGasTestingRequired, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.periodicGasTestingRequired, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.periodicGasTestingRequired, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Multiple Executing Agencies?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.multipleExecutingAgencies, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.multipleExecutingAgencies, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.multipleExecutingAgencies, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Location accessible?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.locationAccessible, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.locationAccessible, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.locationAccessible, 'NA')}</td>
    </tr>
  </table>

  <!-- EMERGENCY -->
  <div style="margin-top:8px; font-weight:bold;">Emergency</div>

  <table style="width:100%; border-collapse:collapse; font-size:8px;">
    <tr style="background:#f0f0f0;">
      <th style="border:0.5px solid #000; padding:6px; text-align:left; width:55%;"></th>
      <th style="border:0.5px solid #000; padding:6px; width:15%; text-align:center;">YES</th>
      <th style="border:0.5px solid #000; padding:6px; width:15%; text-align:center;">NO</th>
      <th style="border:0.5px solid #000; padding:6px; width:15%; text-align:center;">N/A</th>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Fire department is required on standby?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.fireDeptStandby, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.fireDeptStandby, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.fireDeptStandby, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Gas safety is required on standby?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.gasSafetyStandby, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.gasSafetyStandby, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.gasSafetyStandby, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Ambulance is required on standby?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.ambulanceStandby, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.ambulanceStandby, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.prePermitChecks?.ambulanceStandby, 'NA')}</td>
    </tr>
  </table>

  <!-- INITIATOR SIGN -->
  <div style="margin-top:8px;">
  <strong>Name of Initiator :</strong>
  ${permit.prePermitChecks?.initiatorSignature?.name || "N/A"}
</div>

<div style="margin-top:4px;">
  <strong>Signature :</strong>
  ${signatureBox(permit.prePermitChecks?.initiatorSignature?.signature)}
  &nbsp;&nbsp;
  <strong>Date :</strong>
  ${formatDate(permit.prePermitChecks?.initiatorSignature?.date)}
  &nbsp;&nbsp;
  <strong>Time :</strong>
  ${permit.prePermitChecks?.initiatorSignature?.time || ""}
</div>


  <!-- PRE EXECUTION -->
  <div style="margin-top:12px; font-weight:bold;">
    PRE EXECUTION (To be filled up on site by Executing Agency)
  </div>

  <table style="width:100%; border-collapse:collapse; font-size:8px; margin-bottom:12px;">
    <tr style="background:#f0f0f0;">
      <th style="border:0.5px solid #000; padding:6px; text-align:left; width:55%;"></th>
      <th style="border:0.5px solid #000; padding:6px; width:15%; text-align:center;">YES</th>
      <th style="border:0.5px solid #000; padding:6px; width:15%; text-align:center;">NO</th>
      <th style="border:0.5px solid #000; padding:6px; width:15%; text-align:center;">N/A</th>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Is Job specific safety talk given to people working?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.jobSpecificSafetyTalk, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.jobSpecificSafetyTalk, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.jobSpecificSafetyTalk, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">When potentially spark generating (Work in a flammable area)</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.sparkGeneratingWork, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.sparkGeneratingWork, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.sparkGeneratingWork, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Combustible material removed outside the affected area</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.combustibleMaterialRemoved, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.combustibleMaterialRemoved, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.combustibleMaterialRemoved, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">If not possible required barriers / guards used to prevent sparks</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.barriersGuardsUsed, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.barriersGuardsUsed, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.barriersGuardsUsed, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Barricading required?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.barricadingRequired, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.barricadingRequired, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.barricadingRequired, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Location of Fire Extinguishers known to people working?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.fireExtinguisherLocationKnown, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.fireExtinguisherLocationKnown, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.fireExtinguisherLocationKnown, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Additional illumination required?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.additionalIlluminationRequired, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.additionalIlluminationRequired, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.additionalIlluminationRequired, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Additional supply points / connection for tools required?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.additionalSupplyPointsRequired, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.additionalSupplyPointsRequired, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.additionalSupplyPointsRequired, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Gas Testing required?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.gasTestingRequired, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.gasTestingRequired, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.gasTestingRequired, 'NA')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Periodic gas monitoring required? (maximum every 2 hours)</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.periodicGasMonitoringRequired, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.periodicGasMonitoringRequired, 'NO')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckboxPreChecks(permit.preExecutionChecks?.periodicGasMonitoringRequired, 'NA')}</td>
    </tr>
  </table>

  <!-- EXECUTION SIGN -->
  <div style="margin-top:8px;">
  <strong>Name of Executing Agency Rep :</strong>
  ${permit.executingAgency?.acceptorName || "N/A"}
</div>

<div style="margin-top:4px;">
  <strong>Signature :</strong>
  ${signatureBox(permit.executingAgency?.acceptorSignature?.signature || permit.executingAgency?.acceptorSignature)}
  &nbsp;&nbsp;
  <strong>Date :</strong>
  ${formatDate(permit.executingAgency?.acceptanceDate)}
  &nbsp;&nbsp;
  <strong>Time :</strong>
  ${permit.executingAgency?.acceptanceTime || ""}
</div>

<!-- FOOTER -->
<div style="text-align:center; margin-top:15px; padding-top:8px; border-top:0.5px solid #ccc; font-size:7px; color:#666;">
  Generated by: ${user?.name || "System"} | ${new Date().toLocaleString()}
</div>

</div>
`;

  // Generate HTML content matching the form structure
  element.innerHTML = `
    <div id="general-work-permit-pdf" style="border: 0.5px solid #000; padding: 12px; background: white; max-width: 764px;">
      <!-- Ultra Compact Header -->
      <div style="
        position: relative;
        padding: 2px 0 4px 0;
        margin-bottom: 10px;
        border-bottom: 0.5px solid #2c3e50;
        text-align: center;
        font-family: Arial, sans-serif;
      ">
        <img src="${logo}" 
             style="position: absolute; left: 0; top: -1px; width: 120px; height: auto;" />
        <div style="font-size: 11px; font-weight: 700; color: #2c3e50; line-height: 1;">
          भिलाई इस्पात संयंत्र
        </div>
        <div style="font-size: 11px; font-weight: 700; color: #2c3e50; line-height: 1;">
          BHILAI STEEL PLANT
        </div>
        
        <div style="font-size: 10px; font-weight: 700; color: #2c3e50; margin-top: 2px; line-height: 1;">
          Safety Engineering Department
        </div>
        <div style="font-size: 12px; font-weight: 900; color: #2c3e50; margin-top: 2px; line-height: 1;">
          ELECTRONIC WORK PERMIT
        </div>
        <div style="position: absolute; right: 0; top: 42px;font-size: 9px; font-weight: 600; color: #555; margin-top: -1px; line-height: 1;">
          this copy must be available at work site
        </div>
      </div>

      <!-- Serial Number -->
      <!-- Serial Number + Cancelled Label -->
<div style="
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:12px;
  font-size:9px;
">
  <!-- LEFT: STATUS LABEL -->
  <div>
  ${permit.permitStatus === "Cancelled"
      ? `<span style="
       background-color:#dc3545;
           color:#ffffff;
          font-weight:bold;
          border:0.5px solid #dc3545;
          padding:2px 6px;
          font-size:9px;
        ">
          CANCELLED
        </span>`
      : permit.permitStatus === "Closed"
        ? `<span style="
       background-color:#6c757d;
           color:#ffffff;
          font-weight:bold;
          border:0.5px solid #6c757d;
          padding:2px 6px;
          font-size:9px;
        ">
          CLOSED
        </span>`
        : `<span style="
       background-color:#198754;
           color:#ffffff;
          font-weight:bold;
          border:0.5px solid #198754;
          padding:2px 6px;
          font-size:9px;
        ">
          ACTIVE
        </span>`
    }
</div>


  <!-- RIGHT: SR NO -->
  <div>
    <strong>Sr. No:</strong> ${permit.srNo || ""}
  </div>
</div>


      <!-- Section A: Initiator -->
      <div style="margin-bottom: 15px; border: 0.5px solid #000; padding: 8px;">
        <div style="font-weight: bold; font-size: 10px; margin-bottom: 8px; border-bottom: 0.5px solid #000; padding-bottom: 3px;">
          Section (A) Initiator (Shop Maintenance)
        </div>
        
        <div style="margin-bottom: 6px;">
          <strong>Protocol Number:</strong> ${permit.protocolNumber || ""}
        </div>

        <div style="margin-bottom: 6px;">
          <strong>Brief description of the work:</strong><br>
          <div style="border: 0.5px solid #ccc; padding: 4px; min-height: 25px; margin-top: 3px; font-size: 8px;">
            ${permit.initiator?.briefDescriptionOfWork || ""}
          </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr ${permit.initiator?.equipmentLocation?.locationName ? '1fr' : ''}; gap:8px; margin-bottom:6px;">

  <div>
    <strong>Equipment(s) to be worked on:</strong>
    <div style="border:0.5px solid #ccc; padding:3px; min-height:20px; margin-top:3px; font-size:8px;">
      ${permit.initiator?.equipmentLocation?.equipmentNameNo || ""}
    </div>
  </div>

  <div>
    <strong>Unit / DIC:</strong>
    <div style="display:flex; gap:4px; margin-top:3px;">
      <div style="border:0.5px solid #ccc; padding:3px; min-height:20px; width:50%; font-size:8px;">
        ${permit.initiator?.equipmentLocation?.location || ""}
      </div>
      <div style="border:0.5px solid #ccc; padding:3px; min-height:20px; width:50%; font-size:8px;">
        ${permit.initiator?.equipmentLocation?.subLocation || ""}
      </div>
    </div>
  </div>

  ${permit.initiator?.equipmentLocation?.locationName ? `
  <div>
    <strong>Location:</strong>
    <div style="border:0.5px solid #ccc; padding:3px; min-height:20px; margin-top:3px; font-size:8px;">
      ${permit.initiator.equipmentLocation.locationName}
    </div>
  </div>
  ` : ""}

</div>


        <div style="margin-bottom: 6px; font-size: 8px;">
          <strong>Period of work:</strong><br>
          <div style="display: inline-block; margin-left: 8px;">
            <strong>From:</strong> ${formatDateTime(
      permit.originalPeriod?.from?.date || permit.initiator?.periodOfWork?.from?.date,
      permit.originalPeriod?.from?.hrs || permit.initiator?.periodOfWork?.from?.hrs
    )}
            &nbsp;&nbsp;
            <strong>To:</strong> ${formatDateTime(
      permit.originalPeriod?.to?.date || permit.initiator?.periodOfWork?.to?.date,
      permit.originalPeriod?.to?.hrs || permit.initiator?.periodOfWork?.to?.hrs
    )}
          </div>
        </div>

        <!-- Associated Permits -->
       <div style="margin-bottom: 10px; font-size: 8px;">
  <strong>Associated Permit(s):</strong>

  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 6px;">

    <!-- LEFT COLUMN -->
    <div>

      <!-- Work At Height -->
      <div style="display:flex; align-items:center; margin-bottom:4px;">
        <input type="checkbox"
          ${permit.initiator?.associatedPermits?.workAtHeightPermit?.checked
      ? "checked"
      : ""
    }
          disabled
          style="margin-right:6px; transform:scale(0.7);"
        />
        <span style="white-space:nowrap;">
          Work At Height Permit S/No:
          <span style="border-bottom:0.5px solid #000; display:inline-block; min-width:90px;">
            ${permit.initiator?.associatedPermits?.workAtHeightPermit?.checked
      ? permit.initiator.associatedPermits.workAtHeightPermit.sNo ||
      ""
      : ""
    }
          </span>
        </span>
      </div>

      <!-- Confined Space -->
      <div style="display:flex; align-items:center; margin-bottom:4px;">
        <input type="checkbox"
          ${permit.initiator?.associatedPermits?.confinedSpacePermit?.checked
      ? "checked"
      : ""
    }
          disabled
          style="margin-right:6px; transform:scale(0.7);"
        />
        <span style="white-space:nowrap;">
          Confined Space Permit S/No:
          <span style="border-bottom:0.5px solid #000; display:inline-block; min-width:90px;">
            ${permit.initiator?.associatedPermits?.confinedSpacePermit?.checked
      ? permit.initiator.associatedPermits.confinedSpacePermit.sNo ||
      ""
      : ""
    }
          </span>
        </span>
      </div>

      <!-- Other -->
      <div style="display:flex; align-items:center; margin-bottom:4px;">
        <input type="checkbox"
          ${permit.initiator?.associatedPermits?.other?.checked ? "checked" : ""
    }
          disabled
          style="margin-right:6px; transform:scale(0.7);"
        />
        <span>
          Other:
          <span style="border-bottom:0.5px solid #000; display:inline-block; min-width:140px;">
            ${permit.initiator?.associatedPermits?.other?.checked
      ? permit.initiator.associatedPermits.other.description || ""
      : ""
    }
          </span>
        </span>
      </div>

    </div>

    <!-- RIGHT COLUMN -->
    <div>

      <!-- Isolation Permit -->
      <div style="display:flex; align-items:center; margin-bottom:4px;">
        <input type="checkbox"
          ${permit.initiator?.associatedPermits?.isolationPermit?.checked
      ? "checked"
      : ""
    }
          disabled
          style="margin-right:6px; transform:scale(0.7);"
        />
        <span style="white-space:nowrap;">
          Isolation Permit (refer Sec. C) S/No:
          <span style="border-bottom:0.5px solid #000; display:inline-block; min-width:90px;">
            ${permit.initiator?.associatedPermits?.isolationPermit?.checked
      ? permit.initiator.associatedPermits.isolationPermit.sNo || ""
      : ""
    }
          </span>
        </span>
      </div>

      <!-- Excavation -->
      <div style="display:flex; align-items:center; margin-bottom:4px;">
        <input type="checkbox"
          ${permit.initiator?.associatedPermits?.excavationWorkPermit?.checked
      ? "checked"
      : ""
    }
          disabled
          style="margin-right:6px; transform:scale(0.7);"
        />
        <span style="white-space:nowrap;">
          Excavation Work Permit S/No:
          <span style="border-bottom:0.5px solid #000; display:inline-block; min-width:90px;">
            ${permit.initiator?.associatedPermits?.excavationWorkPermit?.checked
      ? permit.initiator.associatedPermits.excavationWorkPermit.sNo ||
      ""
      : ""
    }
          </span>
        </span>
      </div>

      <!-- Mechanical Isolation -->
      <div style="display:flex; align-items:center; margin-bottom:4px;">
        <input type="checkbox"
          ${permit.initiator?.associatedPermits?.mechanicalIsolation?.checked
      ? "checked"
      : ""
    }
          disabled
          style="margin-right:6px; transform:scale(0.7);"
        />
        <span style="white-space:nowrap;">
          Mechanical Isolation (refer Sec. C) S/No:
          <span style="border-bottom:0.5px solid #000; display:inline-block; min-width:90px;">
            ${permit.initiator?.associatedPermits?.mechanicalIsolation?.checked
      ? permit.initiator.associatedPermits.mechanicalIsolation.sNo ||
      ""
      : ""
    }
          </span>
        </span>
      </div>

    </div>

  </div>
</div>

        <!-- Check Points -->
        <div style="margin-bottom: 10px; font-size: 8px;">
          <table style="width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 7px;">
            <thead>
              <tr>
                <th style="border: 0.5px solid #000; padding: 4px; text-align: center; width: 30px;">SN</th>
                <th style="border: 0.5px solid #000; padding: 4px; text-align: left;">Check Points</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 0.5px solid #000; padding: 4px; text-align: center;">1</td>
                <td style="border: 0.5px solid #000; padding: 4px;">
                  Any additional risk foreseen shall be mentioned and if necessary additional HIRA to be carried out by Initiator (Attach separate sheet if necessary)<br>
                  <div style="border: 0.5px solid #ccc; padding: 4px; min-height: 25px; margin-top: 3px; font-size: 7px;">
                    ${permit.initiator?.checkPoints?.[0]?.riskAssessment || ""}
                  </div>
                </td>
              </tr>
              <tr>
                <td style="border: 0.5px solid #000; padding: 4px; text-align: center;">2</td>
                <td style="border: 0.5px solid #000; padding: 4px;">
                  Hazard Mitigation Measures in place - If required please indicate (By Initiator)<br>
                  <div style="border: 0.5px solid #ccc; padding: 4px; min-height: 35px; margin-top: 3px; font-size: 7px;">
                    ${permit.initiator?.checkPoints?.[0]
      ?.hazardMitigationMeasures ||
    permit.initiator?.checkPoints?.[1]
      ?.hazardMitigationMeasures ||
    ""
    }
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Initiator Details -->
        <div style="margin-top: 10px; font-size: 8px;">
          <strong>Initiator's Details:</strong>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6px; margin-top: 5px;">
            <div>
              <strong>Name of Initiator:</strong><br>
              <div style="border: 0.5px solid #ccc; padding: 3px; min-height: 18px; margin-top: 3px;">
                ${permit.initiator?.initiatorDetails?.name || ""}
              </div>
            </div>
            <div>
              <strong>Signature:</strong><br>
              <div style="border: 0.5px solid #ccc; padding: 3px; min-height: 18px; margin-top: 3px;">
                ${signatureBox(permit.initiator?.initiatorDetails?.signature)}
              </div>
            </div>
            <div>
              <strong>Date:</strong><br>
              <div style="border: 0.5px solid #ccc; padding: 3px; min-height: 18px; margin-top: 3px;">
                ${formatDate(permit.initiator?.initiatorDetails?.date)}
              </div>
            </div>
            <div>
              <strong>Time:</strong><br>
              <div style="border: 0.5px solid #ccc; padding: 3px; min-height: 18px; margin-top: 3px;">
                ${permit.initiator?.initiatorDetails?.time || ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section B: Executing Agency -->
      <div style="margin-bottom: 15px; border: 0.5px solid #000; padding: 8px;">
        <div style="font-weight: bold; font-size: 10px; margin-bottom: 8px; border-bottom: 0.5px solid #000; padding-bottom: 3px;">
          Section (B) Executing Agency
        </div>

        <div style="margin-bottom: 6px; font-size: 8px;">
          <strong>3.</strong> Special PPEs, Tools & Equipment required for the job to be identified by executing agency<br>
          <div style="border: 0.5px solid #ccc; padding: 4px; min-height: 35px; margin-top: 3px; font-size: 7px;">
            ${permit.executingAgency?.specialPPEsToolsEquipment?.join(", ") ||
    ""
    }
          </div>
        </div>

        <div style="display: grid; grid-template-columns: ${permit.executingAgency?.nameOfPersons && permit.executingAgency.nameOfPersons.length > 0 ? '1fr 2fr' : '1fr'}; gap: 8px; margin-bottom: 6px; font-size: 8px;">
          <div>
            <strong>4.</strong> No. of persons attached to this permit<br>
            <div style="border: 0.5px solid #ccc; padding: 3px; min-height: 18px; margin-top: 3px;">
              ${permit.executingAgency?.numberOfPersonsAttached || ""}
              ${permit.executingAgency?.attachSeparateList ? " [Attach Separate List]" : ""}
            </div>
          </div>
          ${permit.executingAgency?.nameOfPersons && permit.executingAgency.nameOfPersons.length > 0 ? `
          <div>
            <strong>Name of Persons:</strong><br>
            <div style="border: 0.5px solid #ccc; padding: 3px; min-height: 18px; margin-top: 3px; font-size: 7px;">
              ${permit.executingAgency.nameOfPersons.map((name, idx) => (idx + 1) + ". " + name).join(", ")}
            </div>
          </div>
          ` : ""}
        </div>

        <!-- Executing Agency Details -->
        <div style="margin-top: 10px; font-size: 8px;">
          <div style="margin-bottom: 6px;">
            <strong>Executing Agency:</strong>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
            <div>
              <strong>Acceptor Name:</strong>
              <div style="border: 0.5px solid #ccc; padding: 3px; min-height: 18px; margin-top: 3px;">
                ${permit.executingAgency?.acceptorName || ""}
              </div>
            </div>
            <div>
              <strong>Signature:</strong><br>
              <div style="border: 0.5px solid #ccc; padding: 3px; min-height: 18px; margin-top: 3px;">
                ${signatureBox(permit.executingAgency?.acceptorSignature?.signature || permit.executingAgency?.acceptorSignature)}
              </div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
            <div>
              <strong>Holder Name:</strong>
              <div style="border: 0.5px solid #ccc; padding: 3px; min-height: 18px; margin-top: 3px;">
                ${permit.executingAgency?.holderName || ""}
              </div>
            </div>
            <div>
              <strong>Signature:</strong><br>
              <div style="border: 0.5px solid #ccc; padding: 3px; min-height: 18px; margin-top: 3px;">
  ${signatureBox(permit.executingAgency?.holderSignature?.signature || '')}
</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
            <div>
              <strong>Date:</strong>
              <div style="border: 0.5px solid #ccc; padding: 3px; min-height: 18px; margin-top: 3px;">
                ${formatDate(permit.executingAgency?.acceptanceDate)}
              </div>
            </div>
            <div>
              <strong>Time:</strong>
              <div style="border: 0.5px solid #ccc; padding: 3px; min-height: 18px; margin-top: 3px;">
                ${permit.executingAgency?.acceptanceTime || ""}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Section C: Isolation Details -->
      <div style="margin-bottom: 15px; border: 0.5px solid #000; padding: 8px;">
        <div style="font-weight: bold; font-size: 10px; margin-bottom: 8px; border-bottom: 0.5px solid #000; padding-bottom: 3px;">
          Section (C) Isolation details (To be filled by Issuer)
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-top: 6px; font-size: 7px;">
          <thead>
            <tr>
              <th style="border: 0.5px solid #000; padding: 4px; text-align: center; width: 30px;">SN</th>
              <th style="border: 0.5px solid #000; padding: 4px; text-align: left;">Equipment Name/No</th>
              <th style="border: 0.5px solid #000; padding: 4px; text-align: left;">Isolation (Ele/Mech/Hyd/Pneum)</th>
              <th style="border: 0.5px solid #000; padding: 4px; text-align: left;">Form no</th>
              <th style="border: 0.5px solid #000; padding: 4px; text-align: left;">Name of Authorized Isolator</th>
              <th style="border: 0.5px solid #000; padding: 4px; text-align: left;">Date & Time</th>
            </tr>
          </thead>
          <tbody>
            ${permit.isolationDetails && permit.isolationDetails.length > 0
      ? permit.isolationDetails
        .map(
          (detail, idx) => `
              <tr>
                <td style="border: 0.5px solid #000; padding: 4px; text-align: center;">${detail.sn || idx + 1
            }</td>
                <td style="border: 0.5px solid #000; padding: 4px;">${detail.equipmentNameNo || ""
            }</td>
                <td style="border: 0.5px solid #000; padding: 4px;">${detail.isolationType || ""
            }</td>
                <td style="border: 0.5px solid #000; padding: 4px;">${detail.formNo || ""
            }</td>
                <td style="border: 0.5px solid #000; padding: 4px;">${detail.nameOfAuthorizedIsolator || ""
            }</td>
                <td style="border: 0.5px solid #000; padding: 4px;">${formatDateTime(
              detail.dateAndTime,
              ""
            )}</td>
              </tr>
            `
        )
        .join("")
      : `
              <tr>
                <td style="border: 0.5px solid #000; padding: 4px; text-align: center;">1</td>
                <td style="border: 0.5px solid #000; padding: 4px;"></td>
                <td style="border: 0.5px solid #000; padding: 4px;"></td>
                <td style="border: 0.5px solid #000; padding: 4px;"></td>
                <td style="border: 0.5px solid #000; padding: 4px;"></td>
                <td style="border: 0.5px solid #000; padding: 4px;"></td>
              </tr>
            `
    }
          </tbody>
        </table>
      </div>

      <!-- Certification and Issuer Details -->
      ${permit.permitStatus === "Approved" ||
      permit.permitStatus === "Closed" ||
      (permit.permitStatus === "Cancelled" && permit.issuerApproval?.approved)
      ? `
      <div style="margin-bottom: 15px; border: 0.5px solid #000; padding: 8px;">
        <div style="margin-bottom: 8px; font-size: 8px;">
          <strong>I certify that the above check points have been verified and found satisfactory.</strong>
        </div>

        <div style="font-weight: bold; font-size: 10px; margin-bottom: 8px; border-bottom: 0.5px solid #000; padding-bottom: 3px;">
          Issuer Details
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6px; margin-top: 5px; font-size: 8px;">
          <div>
            <strong>Name of Issuer (Shop Operation):</strong><br>
            <div style="border: 0.5px solid #ccc; padding: 3px; min-height: 18px; margin-top: 3px;">
              ${permit.issuerCertification?.issuerDetails?.name ||
      permit.issuerApproval?.approvedBy?.name ||
      ""
      }
            </div>
          </div>
          <div>
            <strong>Signature:</strong><br>
            <div style="border: 0.5px solid #ccc; padding: 3px; min-height: 18px; margin-top: 3px;">
              ${signatureBox(
        permit.issuerCertification?.issuerDetails?.signature ||
        permit.issuerApproval?.approvedBy?.signature
      )}
            </div>
          </div>
          <div>
            <strong>Date:</strong><br>
            <div style="border: 0.5px solid #ccc; padding: 3px; min-height: 18px; margin-top: 3px;">
              ${formatDate(
        permit.issuerCertification?.issuerDetails?.date ||
        permit.issuerApproval?.approvedAt
      )}
            </div>
          </div>
          <div>
            <strong>Time:</strong><br>
            <div style="border: 0.5px solid #ccc; padding: 3px; min-height: 18px; margin-top: 3px;">
              ${permit.issuerCertification?.issuerDetails?.time ||
      (permit.issuerApproval?.approvedAt
        ? new Date(
          permit.issuerApproval.approvedAt
        ).toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        })
        : "")
      }
            </div>
          </div>
        </div>
      </div>
      `
      : ""
    }

      <!-- Footer -->
      <div style="text-align: center; font-size: 7px; color: #666; margin-top: 12px; border-top: 0.5px solid #ccc; padding-top: 6px;">
        Generated by: ${user?.name || "System"
    } | ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}
      </div>
    </div>
  `;
  const element3 = document.createElement("div");
  element3.style.position = "absolute";
  element3.style.left = "-9999px";
  element3.style.top = "0";
  element3.style.width = "794px";
  element3.style.padding = "12px";
  element3.style.backgroundColor = "white";
  element3.style.fontFamily = "Arial, sans-serif";
  element3.style.fontSize = "8px";
  element3.style.color = "#000000";

  element3.innerHTML = `
<div style="border:0.5px solid #000; padding:12px; font-size:8px; background:white; color:#000000;">

  <!-- HEADER (SAME AS PAGE 2) -->
  <table style="width:100%; border-collapse:collapse; margin-bottom:8px;">
    <tr>
      <td style="border:0.5px solid #000; width:15%; text-align:center;">
        <img src="${logo}" style="width:50px;" />
      </td>
      <td style="border:0.5px solid #000; text-align:center; font-weight:bold;">
        STANDARD FOR PERMIT TO WORK<br/>
        (BSP-TS-05)
      </td>
      <td style="border:0.5px solid #000; width:15%; font-size:7px;">
        Issue :<br/>Rev : 01
      </td>
    </tr>
  </table>

  <!-- ============================= -->
  <!-- RENEWAL OF GENERAL WORK PERMIT -->
  <!-- ============================= -->

  ${permit.renewalCount && permit.renewalCount > 0 ? `
  <div style="text-align:center; font-weight:bold; margin-bottom:4px;">
    Renewal of General Work Permit
  </div>

  <table style="width:100%; border-collapse:collapse; font-size:7px;">
    <tr>
      <th style="border:0.5px solid #000; padding:4px; width:5%;">Shift</th>
      <th style="border:0.5px solid #000; padding:4px; width:18%;">Previous Date & Time</th>
      <th style="border:0.5px solid #000; padding:4px; width:18%;">New Date & Time</th>
      <th style="border:0.5px solid #000; padding:4px;">
        Initiator Name & Signature
      </th>
      <th style="border:0.5px solid #000; padding:4px;">
        Executing Agency Name & Sign
      </th>
      <th style="border:0.5px solid #000; padding:4px;">
        Issuer Name & Sign
      </th>
    </tr>

    ${(permit.renewalHistory && permit.renewalHistory.length > 0
        ? permit.renewalHistory.map((renewal, index) => `
      <tr>
        <td style="border:0.5px solid #000; height:18px; padding:4px; text-align:center; font-size:7px;">
          ${renewal.renewalNumber || index + 1}
        </td>
        <td style="border:0.5px solid #000; padding:4px; font-size:6px;">
          <div style="margin-bottom:2px;">
            <strong>From:</strong> ${formatDate(renewal.previousPeriod?.from?.date)} ${renewal.previousPeriod?.from?.hrs || ""}
          </div>
          <div>
            <strong>To:</strong> ${formatDate(renewal.previousPeriod?.to?.date)} ${renewal.previousPeriod?.to?.hrs || ""}
          </div>
        </td>
        <td style="border:0.5px solid #000; padding:4px; font-size:6px;">
          <div style="margin-bottom:2px;">
            <strong>From:</strong> ${formatDate(renewal.newPeriod?.from?.date)} ${renewal.newPeriod?.from?.hrs || ""}
          </div>
          <div>
            <strong>To:</strong> ${formatDate(renewal.newPeriod?.to?.date)} ${renewal.newPeriod?.to?.hrs || ""}
          </div>
        </td>
        <td style="border:0.5px solid #000; padding:4px; font-size:7px;">
          ${permit.initiator?.initiatorDetails?.name ||
          permit.prePermitChecks?.initiatorSignature?.name ||
          ""
          }
          ${permit.initiator?.initiatorDetails?.signature ||
            permit.prePermitChecks?.initiatorSignature?.signature
            ? `<br/>${signatureBox(
              permit.initiator?.initiatorDetails?.signature ||
              permit.prePermitChecks?.initiatorSignature?.signature
            )}`
            : ""
          }
        </td>
        <td style="border:0.5px solid #000; padding:4px; font-size:7px;">
          ${renewal.executorApprovedBy
            ? `${permit.executingAgency?.acceptorName || permit.executionApproval?.approvedBy?.name || ""}
               ${permit.executingAgency?.acceptorSignature?.signature
              ? `<br/>${signatureBox(permit.executingAgency.acceptorSignature.signature)}`
              : ""}`
            : `<span style="color:#999; font-style:italic;">Pending</span>`
          }
        </td>
        <td style="border:0.5px solid #000; padding:4px; font-size:7px;">
          ${renewal.issuerApprovedBy
            ? `${permit.issuerCertification?.issuerDetails?.name || permit.issuerApproval?.approvedBy?.name || ""}
               ${permit.issuerCertification?.issuerDetails?.signature || permit.issuerApproval?.approvedBy?.signature
              ? `<br/>${signatureBox(permit.issuerCertification?.issuerDetails?.signature || permit.issuerApproval?.approvedBy?.signature)}`
              : ""}`
            : `<span style="color:#999; font-style:italic;">Pending</span>`
          }
        </td>
      </tr>
    `).join("")
        : Array.from({ length: permit.renewalCount }).map((_, index) => `
      <tr>
        <td style="border:0.5px solid #000; height:18px; padding:4px; text-align:center; font-size:7px;">
          ${index + 1}
        </td>
        <td style="border:0.5px solid #000; padding:4px; font-size:6px;">
          <div style="margin-bottom:2px;">
            <strong>From:</strong> ${permit.pendingRenewal?.previousPeriod?.from?.date
            ? formatDate(permit.pendingRenewal.previousPeriod.from.date) + " " + (permit.pendingRenewal.previousPeriod.from.hrs || "")
            : formatDate(permit.originalPeriod?.from?.date || permit.initiator?.periodOfWork?.from?.date) + " " + (permit.originalPeriod?.from?.hrs || permit.initiator?.periodOfWork?.from?.hrs || "")}
          </div>
          <div>
            <strong>To:</strong> ${permit.pendingRenewal?.previousPeriod?.to?.date
            ? formatDate(permit.pendingRenewal.previousPeriod.to.date) + " " + (permit.pendingRenewal.previousPeriod.to.hrs || "")
            : formatDate(permit.originalPeriod?.to?.date || permit.initiator?.periodOfWork?.to?.date) + " " + (permit.originalPeriod?.to?.hrs || permit.initiator?.periodOfWork?.to?.hrs || "")}
          </div>
        </td>
        <td style="border:0.5px solid #000; padding:4px; font-size:6px;">
          <div style="margin-bottom:2px;">
            <strong>From:</strong> ${permit.pendingRenewal?.isActive === false
            ? formatDate(permit.initiator?.periodOfWork?.from?.date) + " " + (permit.initiator?.periodOfWork?.from?.hrs || "")
            : (permit.pendingRenewal?.from?.date ? formatDate(permit.pendingRenewal.from.date) + " " + (permit.pendingRenewal.from.hrs || "") : "")}
          </div>
          <div>
            <strong>To:</strong> ${permit.pendingRenewal?.isActive === false
            ? formatDate(permit.initiator?.periodOfWork?.to?.date) + " " + (permit.initiator?.periodOfWork?.to?.hrs || "")
            : (permit.pendingRenewal?.to?.date ? formatDate(permit.pendingRenewal.to.date) + " " + (permit.pendingRenewal.to.hrs || "") : "")}
          </div>
        </td>
        <td style="border:0.5px solid #000; padding:4px; font-size:7px;">
          ${permit.initiator?.initiatorDetails?.name ||
          permit.prePermitChecks?.initiatorSignature?.name ||
          ""
          }
        </td>
        <td style="border:0.5px solid #000; padding:4px; font-size:7px;">
          ${permit.pendingRenewal?.executorApproval?.approved
            ? `${permit.executingAgency?.acceptorName || permit.executionApproval?.approvedBy?.name || ""}`
            : `<span style="color:#999; font-style:italic;">Pending</span>`
          }
        </td>
        <td style="border:0.5px solid #000; padding:4px; font-size:7px;">
          ${permit.pendingRenewal?.isActive === false
            ? `${permit.issuerCertification?.issuerDetails?.name || permit.issuerApproval?.approvedBy?.name || ""}`
            : `<span style="color:#999; font-style:italic;">Pending</span>`
          }
        </td>
      </tr>
    `).join(""))
      }
  </table>

  <!-- Renewal Reason -->
  ${permit.renewalHistory && permit.renewalHistory.length > 0
        ? permit.renewalHistory.map((renewal, index) => `
      <div style="margin-top:4px; font-size:7px;">
        <strong>Renewal ${renewal.renewalNumber || index + 1} Reason:</strong> ${renewal.renewalReason || "Not provided"}
      </div>
    `).join("")
        : (permit.pendingRenewal?.renewalReason ? `
  <div style="margin-top:6px; font-size:7px;">
    <strong>Renewal Reason:</strong> ${permit.pendingRenewal.renewalReason}
  </div>
  ` : "")}

  <!-- RIGHT SIDE NOTE -->
  <div style="
    margin-top:4px;
    font-size:7px;
    width:35%;
    float:right;
    text-align:left;
  ">
    In case of break in work beyond a shift this permit shall stand cancelled
    and new permit to be taken
  </div>

  <div style="clear:both; margin-bottom:10px;"></div>
  ` : ""}

  <!-- ============================= -->
  <!-- CLOSURE OF WORK PERMIT -->
  <!-- ============================= -->

  ${permit.permitStatus === "Closed" && permit.closure ? `
  <div style="text-align:center; font-weight:bold; margin-bottom:6px; border-top:0.5px solid #000; padding-top:8px;">
    Closure of Work Permit
  </div>

  <!-- Section D - Initiator Closure -->
  <div style="font-weight:bold; margin-bottom:4px; font-size:8px;">
    (D) To be Filled by Initiator
  </div>
  <div style="font-size:7px; margin-bottom:6px; border:0.5px solid #000; padding:6px;">
    <div style="margin-bottom:6px;">
      ${permit.closure?.initiatorClosure?.confirmationText || "The Job is completed. All men & materials are removed from the site. Safe to restore isolations as stated in Section (C)"}
    </div>
    <div style="display:flex; justify-content:space-between; margin-top:8px;">
      <div style="width:30%;">
        <strong>Date:</strong>
        <div style="border-bottom:0.5px solid #000; padding:2px;">
          ${formatDate(permit.closure?.initiatorClosure?.initiatorDetails?.date || permit.closure?.initiatedAt)}
        </div>
      </div>
      <div style="width:30%;">
        <strong>Time:</strong>
        <div style="border-bottom:0.5px solid #000; padding:2px;">
          ${permit.closure?.initiatorClosure?.initiatorDetails?.time || ""}
        </div>
      </div>
    </div>
    <div style="display:flex; justify-content:space-between; margin-top:8px;">
      <div style="width:45%;">
        <strong>Name & Sign of Executing Agency Rep:</strong>
        <div style="border:0.5px solid #ccc; min-height:24px; padding:2px; margin-top:2px;">
          ${permit.closure?.initiatorClosure?.executingAgencyRepSignature?.name
      || permit.preExecutionChecks?.repDetails?.name
      || permit.executingAgency?.acceptorName
      || permit.executionApproval?.approvedBy?.name
      || ""}
          ${(permit.closure?.initiatorClosure?.executingAgencyRepSignature?.signature
        || permit.preExecutionChecks?.repDetails?.signature
        || permit.executingAgency?.acceptorSignature?.signature
        || permit.executingAgency?.acceptorSignature)
        ? `<br/>${signatureBox(
          permit.closure?.initiatorClosure?.executingAgencyRepSignature?.signature
          || permit.preExecutionChecks?.repDetails?.signature
          || permit.executingAgency?.acceptorSignature?.signature
          || permit.executingAgency?.acceptorSignature
        )}`
        : ""}
        </div>
      </div>
      <div style="width:45%;">
        <strong>Name & Sign of Initiator:</strong>
        <div style="border:0.5px solid #ccc; min-height:24px; padding:2px; margin-top:2px;">
          ${permit.closure?.initiatorClosure?.initiatorDetails?.name || ""}
          ${permit.closure?.initiatorClosure?.initiatorDetails?.signature
        ? `<br/>${signatureBox(permit.closure.initiatorClosure.initiatorDetails.signature)}`
        : ""}
        </div>
      </div>
    </div>
  </div>

  <!-- Section E - Isolation Removal Details -->
  <div style="font-weight:bold; margin-top:8px; margin-bottom:4px; font-size:8px;">
    (E) Details of Isolation removal for restoration of energy (To be filled by Issuer)
  </div>
  <table style="width:100%; border-collapse:collapse; font-size:7px;">
    <tr>
      <th style="border:0.5px solid #000; padding:3px; width:5%;">SN</th>
      <th style="border:0.5px solid #000; padding:3px; width:20%;">Equipment Name/No</th>
      <th style="border:0.5px solid #000; padding:3px; width:20%;">Isolation(Ele/Mech/Hyd/Pneum)</th>
      <th style="border:0.5px solid #000; padding:3px; width:15%;">Form no</th>
      <th style="border:0.5px solid #000; padding:3px; width:25%;">Name of Authorized Isolator</th>
      <th style="border:0.5px solid #000; padding:3px; width:15%;">Date & Time</th>
    </tr>
    ${permit.closure?.isolationRemovalDetails && permit.closure.isolationRemovalDetails.length > 0
        ? permit.closure.isolationRemovalDetails.map((detail, idx) => `
        <tr>
          <td style="border:0.5px solid #000; padding:3px; text-align:center;">${detail.sn || idx + 1}</td>
          <td style="border:0.5px solid #000; padding:3px;">${detail.equipmentNameNo || ""}</td>
          <td style="border:0.5px solid #000; padding:3px;">${detail.isolationType || ""}</td>
          <td style="border:0.5px solid #000; padding:3px;">${detail.formNo || ""}</td>
          <td style="border:0.5px solid #000; padding:3px;">${detail.nameOfAuthorizedIsolator || ""}</td>
          <td style="border:0.5px solid #000; padding:3px;">${detail.dateAndTime ? formatDate(detail.dateAndTime) : ""}</td>
        </tr>
      `).join("")
        : `
        <tr><td style="border:0.5px solid #000; height:16px; text-align:center;">1</td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td></tr>
        <tr><td style="border:0.5px solid #000; height:16px; text-align:center;">2</td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td></tr>
        <tr><td style="border:0.5px solid #000; height:16px; text-align:center;">3</td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td></tr>
        <tr><td style="border:0.5px solid #000; height:16px; text-align:center;">4</td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td></tr>
        <tr><td style="border:0.5px solid #000; height:16px; text-align:center;">5</td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td><td style="border:0.5px solid #000;"></td></tr>
      `
      }
  </table>

  <!-- Section F - Final Certification -->
  <div style="margin-top:8px; font-size:7px; border:0.5px solid #000; padding:6px;">
    <div style="margin-bottom:6px;">
      <strong>(F)</strong> All isolation made as per Section C are now restored. Equipment are ready to start.
    </div>
    <div style="display:flex; justify-content:space-between; align-items:flex-end;">
      <div style="width:50%;">
        <strong>Name & Signature of Issuer:</strong>
        <div style="border:0.5px solid #ccc; min-height:24px; padding:2px; margin-top:2px;">
          ${permit.closure?.finalCertification?.issuerSignature?.name || permit.closure?.issuerChecklist?.issuerDetails?.name || ""}
          ${permit.closure?.finalCertification?.issuerSignature?.signature || permit.closure?.issuerChecklist?.issuerDetails?.signature
        ? `<br/>${signatureBox(permit.closure.finalCertification?.issuerSignature?.signature || permit.closure.issuerChecklist?.issuerDetails?.signature)}`
        : ""}
        </div>
      </div>
      <div style="width:40%;">
        <strong>Date & Time:</strong>
        <div style="border-bottom:0.5px solid #000; padding:2px;">
          ${permit.closure?.closedAt ? formatDate(permit.closure.closedAt) : ""} 
          ${permit.closure?.finalCertification?.issuerSignature?.time || permit.closure?.issuerChecklist?.issuerDetails?.time || ""}
        </div>
      </div>
    </div>
  </div>
  ` : ""}

  <!-- ============================= -->
  <!-- CANCELLATION OF WORK PERMIT -->
  <!-- ============================= -->

  ${permit.permitStatus === "Cancelled" && permit.cancellation?.reason ? `
  <div style="text-align:center; font-weight:bold; margin-bottom:4px;">
    Cancellation of Work Permit
  </div>

  <table style="width:100%; border-collapse:collapse; font-size:8px;">
    <tr>
      <!-- LEFT -->
      <td style="width:65%; vertical-align:top; padding-right:10px; font-size:8px;">
  <strong>(G) To be filled by Issuer</strong><br/><br/>
  This Work Permit is cancelled due to the reason below (please select)

  <div style="margin-top:8px; display:flex; align-items:center;">
    <input
      type="checkbox"
      ${permit.cancellation?.reason === "CHANGE_OF_SCOPE" ? "checked" : ""}
      disabled
      style="margin-right:6px;"
    />
    <span>Permit cancelled due to change of scope</span>
  </div>

  <div style="margin-top:6px; display:flex; align-items:center;">
    <input
      type="checkbox"
      ${permit.cancellation?.reason === "VIOLATION_OF_PERMIT_CONDITIONS"
        ? "checked"
        : ""
      }
      disabled
      style="margin-right:6px;"
    />
    <span>
      Permit cancelled on violation of permit conditions & safety requirements
    </span>
  </div>

  <div style="margin-top:6px; display:flex; align-items:center;">
    <input
      type="checkbox"
      ${permit.cancellation?.reason === "PLANT_EMERGENCY" ? "checked" : ""}
      disabled
      style="margin-right:6px;"
    />
    <span>Permit cancelled on plant emergency</span>
  </div>

  <div style="margin-top:8px;">
    <strong>Comments / Remarks:</strong>
    <div style="
      border:0.5px solid #000;
      min-height:30px;
      padding:4px;
      margin-top:4px;
    ">
      ${permit.cancellation?.comments || ""}
    </div>
  </div>
</td>


      <!-- RIGHT -->
      <td style="width:35%; vertical-align:top;">
        <strong>Name of Issuer:</strong>
        <div style="border-bottom:0.5px solid #000; margin-bottom:6px;">
          ${permit.cancellation?.issuerDetails?.name || ""}
        </div>

       <strong>Signature:</strong><br>
            <div style="border: 0.5px solid #ccc; padding: 3px; min-height: 18px; margin-top: 3px;">
              ${signatureBox(
        permit.issuerCertification?.issuerDetails?.signature ||
        permit.issuerApproval?.approvedBy?.signature ||
        user?.signature
      )}
            </div>

        <div style="margin-top:6px;">
          <strong>Date:</strong>
          ${formatDate(permit.cancellation?.issuerDetails?.date)}
        </div>

        <div>
          <strong>Time:</strong>
          ${permit.cancellation?.issuerDetails?.time || ""}
        </div>
      </td>
    </tr>
  </table>
  ` : ""}

  <!-- FOOTER -->
  <div style="text-align:center; margin-top:15px; padding-top:8px; border-top:0.5px solid #ccc; font-size:7px; color:#666;">
    Generated by: ${user?.name || "System"} | ${new Date().toLocaleString()}
  </div>

</div>
`;

  // ============= PAGE 4 - CLOSURE CHECKLISTS =============
  const element4 = document.createElement("div");
  element4.style.position = "absolute";
  element4.style.left = "-9999px";
  element4.style.top = "0";
  element4.style.width = "794px";
  element4.style.padding = "12px";
  element4.style.backgroundColor = "white";
  element4.style.fontFamily = "Arial, sans-serif";
  element4.style.fontSize = "8px";
  element4.style.color = "#000000";

  // Helper for YES/NO checkbox display
  const ynCheckbox = (value, targetValue) => {
    const isChecked = String(value || "").toUpperCase() === targetValue;
    return `<span style="display:inline-block; width:35px; text-align:center; border:0.5px solid #000; font-weight:${isChecked ? 'bold' : 'normal'}; background:${isChecked ? '#e0e0e0' : 'white'};">${isChecked ? targetValue : ''}</span>`;
  };

  element4.innerHTML = `
<div style="border:0.5px solid #000; padding:12px; font-size:8px; background:white; color:#000000;">

  <!-- HEADER -->
  <table style="width:100%; border-collapse:collapse; margin-bottom:10px;">
    <tr>
      <td style="border:0.5px solid #000; width:15%; text-align:center;">
        <img src="${logo}" style="width:50px;" />
      </td>
      <td style="border:0.5px solid #000; text-align:center; font-weight:bold;">
        STANDARD FOR PERMIT TO WORK<br/>
        (BSP-TS-05)
      </td>
      <td style="border:0.5px solid #000; width:15%; font-size:7px;">
        Issue :<br/>Rev : 01
      </td>
    </tr>
  </table>

  <!-- ============================= -->
  <!-- 15.5 EXECUTOR HANDOVER CHECKLIST -->
  <!-- ============================= -->

  <div style="font-weight:bold; margin-bottom:8px; font-size:9px; color:#2c5282;">
    15.5 Permit to Work Closure / Handover Checklist (By executing agency)
  </div>

  <table style="width:100%; border-collapse:collapse; font-size:8px; margin-bottom:12px;">
    <tr style="background:#f0f0f0;">
      <th style="border:0.5px solid #000; padding:6px; text-align:left; width:70%;"></th>
      <th style="border:0.5px solid #000; padding:6px; width:15%; text-align:center;">YES</th>
      <th style="border:0.5px solid #000; padding:6px; width:15%; text-align:center;">NO</th>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Is work completed?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.executorChecklist?.isWorkCompleted, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.executorChecklist?.isWorkCompleted, 'NO')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Has all equipment, tools and consumables removed from site?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.executorChecklist?.equipmentRemoved, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.executorChecklist?.equipmentRemoved, 'NO')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Has all personnel left the work area and moved to a safe distance?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.executorChecklist?.personnelMovedToSafe, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.executorChecklist?.personnelMovedToSafe, 'NO')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Has any mechanical / electrical locks that may have been provided been removed?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.executorChecklist?.locksRemoved, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.executorChecklist?.locksRemoved, 'NO')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Is the work area cleaned?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.executorChecklist?.workAreaCleaned, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.executorChecklist?.workAreaCleaned, 'NO')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Any test run required?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.executorChecklist?.testRunRequired, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.executorChecklist?.testRunRequired, 'NO')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">If Yes, a procedure has been agreed for testing?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.executorChecklist?.testingProcedureAgreed, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.executorChecklist?.testingProcedureAgreed, 'NO')}</td>
    </tr>
  </table>

  <!-- Executor Signature -->
  <div style="margin-bottom:16px; font-size:8px;">
    <div style="margin-bottom:6px;">
      <strong>Name of Executing Agency Rep :</strong>
      <span style="border-bottom:0.5px solid #000; display:inline-block; width:200px; margin-left:10px;">
        ${permit.closure?.executorChecklist?.executingAgencyRepDetails?.name || ""}
      </span>
    </div>
    <div style="display:flex; gap:30px;">
      <div>
        <strong>Signature:</strong>
        <div style="border:0.5px solid #ccc; min-height:30px; width:150px; padding:2px; margin-top:2px;">
          ${permit.closure?.executorChecklist?.executingAgencyRepDetails?.signature
      ? signatureBox(permit.closure.executorChecklist.executingAgencyRepDetails.signature)
      : ""}
        </div>
      </div>
      <div>
        <strong>Date:</strong>
        <span style="border-bottom:0.5px solid #000; display:inline-block; width:80px; margin-left:5px;">
          ${formatDate(permit.closure?.executorChecklist?.executingAgencyRepDetails?.date)}
        </span>
      </div>
      <div>
        <strong>Time:</strong>
        <span style="border-bottom:0.5px solid #000; display:inline-block; width:60px; margin-left:5px;">
          ${permit.closure?.executorChecklist?.executingAgencyRepDetails?.time || ""}
        </span>
      </div>
    </div>
  </div>

  <!-- ============================= -->
  <!-- 15.6 ISSUER CLOSURE CHECKLIST -->
  <!-- ============================= -->

  <div style="font-weight:bold; margin-bottom:8px; font-size:9px; color:#2c5282; border-top:0.5px solid #000; padding-top:10px;">
    15.6 Permit to Work Closure checklist for each permit (by Issuer)
  </div>

  <table style="width:100%; border-collapse:collapse; font-size:8px; margin-bottom:12px;">
    <tr style="background:#f0f0f0;">
      <th style="border:0.5px solid #000; padding:6px; text-align:left; width:70%;"></th>
      <th style="border:0.5px solid #000; padding:6px; width:15%; text-align:center;">YES</th>
      <th style="border:0.5px solid #000; padding:6px; width:15%; text-align:center;">NO</th>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Are there multiple permits issued for the same work area / equipment to different agencies?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.issuerChecklist?.multiplePermitsIssued, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.issuerChecklist?.multiplePermitsIssued, 'NO')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">If so have all relevant work completed and permits ready for closure?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.issuerChecklist?.allWorkCompleted, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.issuerChecklist?.allWorkCompleted, 'NO')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Are all Isolation certificates returned after de-isolation?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.issuerChecklist?.isolationCertificatesReturned, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.issuerChecklist?.isolationCertificatesReturned, 'NO')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Any test run required?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.issuerChecklist?.testRunRequired, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.issuerChecklist?.testRunRequired, 'NO')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">People and equipment used for work has been moved to safe place?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.issuerChecklist?.equipmentMovedToSafe, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.issuerChecklist?.equipmentMovedToSafe, 'NO')}</td>
    </tr>
    <tr>
      <td style="border:0.5px solid #000; padding:6px;">Are emergency procedures in place to handle any incidents during testing?</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.issuerChecklist?.emergencyProceduresInPlace, 'YES')}</td>
      <td style="border:0.5px solid #000; text-align:center;">${ynCheckbox(permit.closure?.issuerChecklist?.emergencyProceduresInPlace, 'NO')}</td>
    </tr>
  </table>

  <!-- Issuer Signature -->
  <div style="font-size:8px;">
    <div style="margin-bottom:6px;">
      <strong>Name of Issuer :</strong>
      <span style="border-bottom:0.5px solid #000; display:inline-block; width:200px; margin-left:10px;">
        ${permit.closure?.issuerChecklist?.issuerDetails?.name || ""}
      </span>
    </div>
    <div style="display:flex; gap:30px;">
      <div>
        <strong>Signature:</strong>
        <div style="border:0.5px solid #ccc; min-height:30px; width:150px; padding:2px; margin-top:2px;">
          ${permit.closure?.issuerChecklist?.issuerDetails?.signature
      ? signatureBox(permit.closure.issuerChecklist.issuerDetails.signature)
      : ""}
        </div>
      </div>
      <div>
        <strong>Date:</strong>
        <span style="border-bottom:0.5px solid #000; display:inline-block; width:80px; margin-left:5px;">
          ${formatDate(permit.closure?.issuerChecklist?.issuerDetails?.date)}
        </span>
      </div>
      <div>
        <strong>Time:</strong>
        <span style="border-bottom:0.5px solid #000; display:inline-block; width:60px; margin-left:5px;">
          ${permit.closure?.issuerChecklist?.issuerDetails?.time || ""}
        </span>
      </div>
    </div>
  </div>

  <!-- FOOTER -->
  <div style="text-align:center; margin-top:15px; padding-top:8px; border-top:0.5px solid #ccc; font-size:7px; color:#666;">
    Generated by: ${user?.name || "System"} | ${new Date().toLocaleString()}
  </div>

</div>
`;

  try {
    // Determine if we need compressed output for email (smaller file size)
    const isCompressed = user?.returnBase64;
    const canvasScale = isCompressed ? 1.5 : 2; // Slightly lower scale for email
    const imageFormat = isCompressed ? "JPEG" : "PNG";
    const imageQuality = isCompressed ? 0.85 : 1; // Higher JPEG quality for readability

    // ---------------- PAGE 1 ----------------
    document.body.appendChild(element);

    const canvas1 = await html2canvas(element, {
      scale: canvasScale,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = isCompressed
      ? canvas1.toDataURL("image/jpeg", imageQuality)
      : canvas1.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const pageWidth = 210;
    const pageHeight = 297;

    const imgWidth = pageWidth;
    const imgHeight = (canvas1.height * imgWidth) / canvas1.width;

    let heightLeft = imgHeight;
    let position = 0;

    // First page - render the entire content scaled to fit
    // Note: We don't slice the content across pages as it creates blank/partial pages
    pdf.addImage(imgData, imageFormat, 0, position, imgWidth, imgHeight, undefined, isCompressed ? 'FAST' : undefined);

    // ---------------- PAGE 2 ----------------
    document.body.appendChild(element2);

    const canvas2 = await html2canvas(element2, {
      scale: canvasScale,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgHeight2 = (canvas2.height * imgWidth) / canvas2.width;

    // Always add a new page for element2 (the checklist page)
    pdf.addPage();
    const imgData2 = isCompressed
      ? canvas2.toDataURL("image/jpeg", imageQuality)
      : canvas2.toDataURL("image/png");
    pdf.addImage(
      imgData2,
      imageFormat,
      0,
      0,
      imgWidth,
      imgHeight2,
      undefined,
      isCompressed ? 'FAST' : undefined
    );
    // ---------------- PAGE 3 (RENEWAL / CLOSURE / CANCELLATION) ----------------
    if ((permit.renewalCount && permit.renewalCount > 0) || permit.permitStatus === "Cancelled" || permit.permitStatus === "Closed") {
      document.body.appendChild(element3);

      const canvas3 = await html2canvas(element3, {
        scale: canvasScale,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgHeight3 = (canvas3.height * imgWidth) / canvas3.width;
      const imgData3 = isCompressed
        ? canvas3.toDataURL("image/jpeg", imageQuality)
        : canvas3.toDataURL("image/png");

      pdf.addPage();
      pdf.addImage(
        imgData3,
        imageFormat,
        0,
        0,
        imgWidth,
        imgHeight3,
        undefined,
        isCompressed ? 'FAST' : undefined
      );
    }

    // ---------------- PAGE 4 (CLOSURE CHECKLISTS) ----------------
    if (permit.permitStatus === "Closed" && permit.closure) {
      document.body.appendChild(element4);

      const canvas4 = await html2canvas(element4, {
        scale: canvasScale,
        useCORS: true,
        backgroundColor: "#ffffff",
      });

      const imgHeight4 = (canvas4.height * imgWidth) / canvas4.width;
      const imgData4 = isCompressed
        ? canvas4.toDataURL("image/jpeg", imageQuality)
        : canvas4.toDataURL("image/png");

      pdf.addPage();
      pdf.addImage(
        imgData4,
        imageFormat,
        0,
        0,
        imgWidth,
        imgHeight4,
        undefined,
        isCompressed ? 'FAST' : undefined
      );
    }

    // ---------------- SAVE OR RETURN AT END ----------------
    // If returnBase64 flag is set, return base64 instead of saving
    if (user?.returnBase64) {
      return pdf.output("datauristring").split(",")[1];
    }
    pdf.save(`General_Work_Permit_${permit.permitNumber || "Unknown"}.pdf`);
  } catch (error) {
    console.error("PDF generation error:", error);
    throw new Error(
      "Failed to generate PDF: " + (error.message || "Unknown error")
    );
  } finally {
    // Clean up
    if (element.parentNode) {
      document.body.removeChild(element);
    }
    if (element2.parentNode) document.body.removeChild(element2);
    if (element3.parentNode) document.body.removeChild(element3);
    if (element4.parentNode) document.body.removeChild(element4);
  }
};
