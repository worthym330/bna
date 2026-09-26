import { BlockConfig } from './types';

export function compileToHandlebars(blocks: BlockConfig[]): string {
  let html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    color: #333;
    line-height: 1.5;
    margin: 0;
    padding: 0;
    font-size: 14px;
  }
  .container { width: 100%; max-width: 800px; margin: 0 auto; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
  th { background-color: #f8fafc; font-weight: bold; }
  .text-right { text-align: right; }
  .text-center { text-align: center; }
  .font-bold { font-weight: bold; }
  .flex { display: flex; }
  .justify-between { justify-content: space-between; }
  .mt-4 { margin-top: 1rem; }
  .mb-4 { margin-bottom: 1rem; }
  .text-xs { font-size: 0.75rem; }
  .text-sm { font-size: 0.875rem; }
  .text-lg { font-size: 1.125rem; }
  .text-xl { font-size: 1.25rem; }
  .text-2xl { font-size: 1.5rem; }
  .uppercase { text-transform: uppercase; }
  .text-slate-500 { color: #64748b; }
</style>
</head>
<body>
<div class="container">
`;

  blocks.forEach(block => {
    html += compileBlock(block) + '\\n';
  });

  html += `
</div>
</body>
</html>
`;

  return html;
}

function compileBlock(block: BlockConfig): string {
  const { type, settings } = block;

  switch (type) {
    case 'HEADER': {
      const isCentered = settings.layout === 'centered';
      const isRight = settings.layout === 'logo_right';
      
      const orgContent = `
        ${settings.showLogo ? `{{#if assets.letterhead}}<img src="{{assets.letterhead}}" style="max-height: 80px; max-width: 200px; margin-bottom: 10px;" />{{/if}}` : ''}
        ${settings.showOrgName ? `<div class="text-xl font-bold">{{organization.legalName}}</div>` : ''}
        ${settings.showOrgAddress ? `<div class="text-sm text-slate-500">{{organization.address}}<br/>{{organization.city}}, {{organization.state}} {{organization.pincode}}<br/>{{organization.country}}</div>` : ''}
        ${settings.showOrgTaxId ? `<div class="text-sm text-slate-500 mt-2">GSTIN: {{organization.gstin}}<br/>PAN: {{organization.pan}}</div>` : ''}
      `;
      
      const invoiceContent = `
        <div class="text-2xl font-bold uppercase" style="color: ${settings.primaryColor || '#000'}">
          {{#if (eq invoice.type "CREDIT_NOTE")}}CREDIT NOTE{{else}}TAX INVOICE{{/if}}
        </div>
        <div class="mt-4">
          ${settings.showInvoiceNumber ? `<div><span class="font-bold">Invoice No:</span> {{invoice.invoiceNumber}}</div>` : ''}
          ${settings.showDate ? `<div><span class="font-bold">Date:</span> {{formatDate invoice.invoiceDate}}</div>` : ''}
          ${settings.showDueDate ? `<div><span class="font-bold">Due Date:</span> {{formatDate invoice.dueDate}}</div>` : ''}
        </div>
      `;

      if (isCentered) {
        return `
          <div style="text-align: center; margin-bottom: 30px;">
            ${orgContent}
            <div style="margin-top: 20px;">
              ${invoiceContent}
            </div>
          </div>
        `;
      }

      return `
        <table style="border: none; margin-bottom: 30px; width: 100%;">
          <tr style="border: none;">
            <td style="border: none; vertical-align: top; width: 50%; text-align: ${isRight ? 'right' : 'left'};">
              ${isRight ? invoiceContent : orgContent}
            </td>
            <td style="border: none; vertical-align: top; width: 50%; text-align: ${isRight ? 'left' : 'right'};">
              ${isRight ? orgContent : invoiceContent}
            </td>
          </tr>
        </table>
      `;
    }

    case 'CLIENT_INFO': {
      const clientAlign = settings.layout === 'right' ? 'text-align: right;' : '';
      const splitMode = settings.layout === 'split';

      const innerContent = `
        <div class="font-bold mb-2">Billed To:</div>
        <div class="font-bold text-lg">{{client.clientName}}</div>
        ${settings.showClientAddress ? `<div>{{client.addressLine1}}{{#if client.addressLine2}}<br/>{{client.addressLine2}}{{/if}}<br/>{{client.city}}, {{client.state}} {{client.pincode}}<br/>{{client.country}}</div>` : ''}
        ${settings.showClientTaxId ? `<div class="mt-2">GSTIN: {{client.gstin}}<br/>PAN: {{client.pan}}</div>` : ''}
        
        ${settings.showProjectInfo ? `
        {{#if project}}
        <div class="mt-4">
          <div class="font-bold">Project:</div>
          <div>{{project.projectName}}</div>
          {{#if project.workOrderNumber}}<div>WO No: {{project.workOrderNumber}}</div>{{/if}}
          {{#if project.workOrderDate}}<div>WO Date: {{formatDate project.workOrderDate}}</div>{{/if}}
        </div>
        {{/if}}
        ` : ''}
      `;

      if (splitMode) {
        return `
          <table style="border: none; width: 100%; margin-bottom: 30px;">
            <tr style="border: none;">
              <td style="border: none; width: 50%; vertical-align: top; padding: 15px; background-color: ${settings.bgColor || '#f8fafc'}; border-radius: 4px;">
                ${innerContent}
              </td>
              <td style="border: none; width: 50%;"></td>
            </tr>
          </table>
        `;
      }

      return `
        <div style="margin-bottom: 30px; ${clientAlign}">
          <div style="background-color: ${settings.bgColor || '#f8fafc'}; padding: 15px; border-radius: 4px; display: inline-block; width: 100%; box-sizing: border-box;">
            ${innerContent}
          </div>
        </div>
      `;
    }

    case 'LINE_ITEMS':
      return `
        <table style="width: 100%; margin-bottom: 30px;">
          <thead>
            <tr style="background-color: ${settings.headerColor || '#f8fafc'};">
              <th style="width: 5%;">#</th>
              <th style="width: 45%;">Description</th>
              ${settings.showHsn ? `<th style="width: 10%;">HSN/SAC</th>` : ''}
              <th style="width: 10%; text-align: right;">Qty</th>
              <th style="width: 15%; text-align: right;">Rate</th>
              ${settings.showTaxRate ? `<th style="width: 10%; text-align: right;">Tax %</th>` : ''}
              <th style="width: 15%; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            {{#each invoice.lineItems}}
            <tr>
              <td class="text-center">{{add @index 1}}</td>
              <td>{{this.description}}</td>
              ${settings.showHsn ? `<td>{{this.hsnSac}}</td>` : ''}
              <td class="text-right">{{this.quantity}}</td>
              <td class="text-right">{{formatCurrency this.unitPrice}}</td>
              ${settings.showTaxRate ? `<td class="text-right">{{this.taxRate}}%</td>` : ''}
              <td class="text-right">{{formatCurrency this.totalAmount}}</td>
            </tr>
            {{/each}}
          </tbody>
        </table>
      `;

    case 'TOTALS': {
      const isTotalsLeft = settings.align === 'left';
      
      const wordsContent = settings.showAmountInWords ? `
        <div class="font-bold text-sm">Amount in Words:</div>
        <div class="text-sm italic capitalize">{{numberToWords invoice.totalAmount}}</div>
      ` : '';
      
      const tableContent = `
        <table style="margin: 0; width: 100%;">
          <tr>
            <td style="border-right: none; text-align: left;" class="font-bold">Subtotal</td>
            <td style="border-left: none; text-align: right;">{{formatCurrency invoice.subTotal}}</td>
          </tr>
          {{#if invoice.cgst}}
          <tr>
            <td style="border-right: none; text-align: left;" class="text-sm text-slate-500">CGST</td>
            <td style="border-left: none; text-align: right;" class="text-sm text-slate-500">{{formatCurrency invoice.cgst}}</td>
          </tr>
          {{/if}}
          {{#if invoice.sgst}}
          <tr>
            <td style="border-right: none; text-align: left;" class="text-sm text-slate-500">SGST</td>
            <td style="border-left: none; text-align: right;" class="text-sm text-slate-500">{{formatCurrency invoice.sgst}}</td>
          </tr>
          {{/if}}
          {{#if invoice.igst}}
          <tr>
            <td style="border-right: none; text-align: left;" class="text-sm text-slate-500">IGST</td>
            <td style="border-left: none; text-align: right;" class="text-sm text-slate-500">{{formatCurrency invoice.igst}}</td>
          </tr>
          {{/if}}
          <tr style="background-color: ${settings.totalsBgColor || '#f8fafc'};">
            <td style="border-right: none; text-align: left; font-size: 1.125rem;" class="font-bold">Total</td>
            <td style="border-left: none; text-align: right; font-size: 1.125rem;" class="font-bold">{{formatCurrency invoice.totalAmount}}</td>
          </tr>
        </table>
      `;

      return `
        <table style="border: none; width: 100%; margin-bottom: 30px;">
          <tr style="border: none;">
            <td style="border: none; width: 50%; vertical-align: top; padding-right: 20px;">
              ${isTotalsLeft ? tableContent : wordsContent}
            </td>
            <td style="border: none; width: 50%; vertical-align: top; padding-left: 20px;">
              ${isTotalsLeft ? wordsContent : tableContent}
            </td>
          </tr>
        </table>
      `;
    }

    case 'FOOTER':
      return `
        <table style="border: none; width: 100%; margin-top: 50px;">
          <tr style="border: none;">
            <td style="border: none; width: 60%; vertical-align: bottom;">
              ${settings.showTerms ? `
                {{#if invoice.terms}}
                <div class="font-bold text-sm mb-1">Terms & Conditions:</div>
                <div class="text-xs text-slate-500" style="white-space: pre-wrap;">{{invoice.terms}}</div>
                {{/if}}
                {{#if invoice.notes}}
                <div class="font-bold text-sm mb-1 mt-4">Notes:</div>
                <div class="text-xs text-slate-500" style="white-space: pre-wrap;">{{invoice.notes}}</div>
                {{/if}}
              ` : ''}
              ${settings.customText ? `<div class="text-xs text-slate-500 mt-4">${settings.customText}</div>` : ''}
            </td>
            <td style="border: none; width: 40%; text-align: center; vertical-align: bottom;">
              <div class="font-bold text-sm mb-2">For {{organization.legalName}}</div>
              ${settings.showSignature ? `
                {{#if assets.signature}}
                <img src="{{assets.signature}}" style="max-height: 80px; max-width: 150px; margin: 10px auto;" />
                {{else}}
                <div style="height: 80px;"></div>
                {{/if}}
              ` : `<div style="height: 80px;"></div>`}
              <div class="text-sm border-t pt-2 mt-2" style="border-color: #e2e8f0; display: inline-block; padding-left: 20px; padding-right: 20px;">Authorized Signatory</div>
            </td>
          </tr>
        </table>
      `;

    case 'SPACER':
      return `<div style="height: ${settings.height || '20'}px;"></div>`;
      
    case 'TEXT':
      return `<div style="${settings.align ? `text-align: ${settings.align};` : ''} ${settings.color ? `color: ${settings.color};` : ''} margin-bottom: 20px;">${settings.content || 'Add text here'}</div>`;

    default:
      return '';
  }
}
