export type BlockType = "HEADER" | "SPLIT_INFO" | "LINE_ITEMS" | "TOTALS" | "TEXT" | "SIGNATORY";

export type Block = {
  id: string;
  type: BlockType;
  settings: any;
};

export type TemplateConfig = {
  themeColor: string;
  blocks: Block[];
  letterheadAssetId?: string;
  signatureAssetId?: string;
  stampAssetId?: string;
};

export const defaultTemplateConfig: TemplateConfig = {
  themeColor: "#2c3e50",
  blocks: [
    { id: "1", type: "HEADER", settings: { align: "LEFT", showLogo: true } },
    { id: "2", type: "SPLIT_INFO", settings: { leftContent: "BILL_TO", rightContent: "INVOICE_DETAILS" } },
    { id: "3", type: "LINE_ITEMS", settings: { showHsn: true, showTax: true } },
    { id: "4", type: "TOTALS", settings: {} },
    { id: "5", type: "TEXT", settings: { text: "Thank you for your business!", align: "CENTER" } },
    { id: "6", type: "SIGNATORY", settings: { showSignature: true, showStamp: true, align: "RIGHT" } }
  ]
};

export function compileTemplateConfigToHtml(config: TemplateConfig): string {
  // If old config format, convert to default
  if (!config.blocks) {
    config = defaultTemplateConfig;
  }

  let bodyHtml = "";

  for (const block of config.blocks) {
    if (block.type === "HEADER") {
      bodyHtml += `
      <div class="block-header" style="text-align: ${block.settings.align === 'CENTER' ? 'center' : block.settings.align === 'RIGHT' ? 'right' : 'left'}; margin-bottom: 40px; border-bottom: 2px solid #eaeaea; padding-bottom: 20px;">
        {{#if assets.letterhead}}
          <img src="{{assets.letterhead}}" class="logo" style="max-width: 250px; max-height: 100px; display: ${block.settings.showLogo ? 'inline-block' : 'none'};" />
        {{else}}
          <h1 class="org-name" style="color: ${config.themeColor}; font-size: 28px; margin: 0; display: ${block.settings.showLogo ? 'none' : 'block'};">{{organization.legalName}}</h1>
        {{/if}}
      </div>
      `;
    } 
    else if (block.type === "SPLIT_INFO") {
      const getSideHtml = (content: string) => {
        if (content === "BILL_TO") {
          return `
            <div style="font-size: 10px; color: #7f8c8d; text-transform: uppercase; margin-bottom: 5px;">Bill To</div>
            <div style="font-size: 14px; font-weight: bold;">{{client.clientName}}</div>
            <div>{{client.addressLine1}}, {{client.city}}</div>
            <div>{{client.state}} - {{client.pincode}}</div>
            <div><strong>GSTIN:</strong> {{client.gstin}}</div>
            {{#if project.projectName}}
              <div style="margin-top: 5px;"><strong>Project:</strong> {{project.projectName}}</div>
            {{/if}}
          `;
        }
        if (content === "INVOICE_DETAILS") {
          return `
            <div style="font-size: 28px; font-weight: bold; color: ${config.themeColor}; margin-bottom: 10px;">{{#if (eq invoice.type "CREDIT_NOTE")}}CREDIT NOTE{{else}}INVOICE{{/if}}</div>
            <div><strong>Invoice #:</strong> {{invoice.invoiceNumber}}</div>
            <div><strong>Date:</strong> {{formatDate invoice.invoiceDate}}</div>
            {{#if invoice.dueDate}}
            <div><strong>Due Date:</strong> {{formatDate invoice.dueDate}}</div>
            {{/if}}
            {{#if (eq invoice.type "CREDIT_NOTE")}}
            <div><strong>Against Inv #:</strong> {{invoice.againstInvoiceNumber}}</div>
            {{/if}}
          `;
        }
        if (content === "ORG_DETAILS") {
          return `
            <div style="font-size: 14px; font-weight: bold;">{{organization.legalName}}</div>
            <div>{{organization.address}}</div>
            <div>{{organization.city}} - {{organization.pincode}}</div>
            <div><strong>GSTIN:</strong> {{organization.gstin}}</div>
            <div><strong>PAN:</strong> {{organization.pan}}</div>
          `;
        }
        return `<div></div>`;
      };

      bodyHtml += `
      <div style="display: flex; justify-content: space-between; margin-bottom: 40px;">
        <div style="flex: 1;">
          ${getSideHtml(block.settings.leftContent)}
        </div>
        <div style="flex: 1; text-align: right;">
          ${getSideHtml(block.settings.rightContent)}
        </div>
      </div>
      `;
    }
    else if (block.type === "LINE_ITEMS") {
      bodyHtml += `
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
        <thead>
          <tr>
            <th style="background: #f8f9fa; text-align: left; padding: 12px; font-weight: 600; color: ${config.themeColor}; border-bottom: 2px solid ${config.themeColor};">Description</th>
            ${block.settings.showHsn ? `<th style="background: #f8f9fa; text-align: center; padding: 12px; font-weight: 600; color: ${config.themeColor}; border-bottom: 2px solid ${config.themeColor};">HSN/SAC</th>` : ''}
            <th style="background: #f8f9fa; text-align: right; padding: 12px; font-weight: 600; color: ${config.themeColor}; border-bottom: 2px solid ${config.themeColor};">Qty</th>
            <th style="background: #f8f9fa; text-align: right; padding: 12px; font-weight: 600; color: ${config.themeColor}; border-bottom: 2px solid ${config.themeColor};">Price</th>
            ${block.settings.showTax ? `<th style="background: #f8f9fa; text-align: right; padding: 12px; font-weight: 600; color: ${config.themeColor}; border-bottom: 2px solid ${config.themeColor};">Tax</th>` : ''}
            <th style="background: #f8f9fa; text-align: right; padding: 12px; font-weight: 600; color: ${config.themeColor}; border-bottom: 2px solid ${config.themeColor};">Amount</th>
          </tr>
        </thead>
        <tbody>
          {{#each invoice.lineItems}}
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #eaeaea;">{{this.description}}</td>
            ${block.settings.showHsn ? `<td style="padding: 12px; border-bottom: 1px solid #eaeaea; text-align: center;">{{this.hsnSac}}</td>` : ''}
            <td style="padding: 12px; border-bottom: 1px solid #eaeaea; text-align: right;">{{this.quantity}}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eaeaea; text-align: right;">{{formatCurrency this.unitPrice}}</td>
            ${block.settings.showTax ? `<td style="padding: 12px; border-bottom: 1px solid #eaeaea; text-align: right;">{{formatCurrency this.taxAmount}}</td>` : ''}
            <td style="padding: 12px; border-bottom: 1px solid #eaeaea; text-align: right;">{{formatCurrency this.totalAmount}}</td>
          </tr>
          {{/each}}
        </tbody>
      </table>
      `;
    }
    else if (block.type === "TOTALS") {
      bodyHtml += `
      <div style="width: 50%; float: right; margin-bottom: 40px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 12px;">Subtotal</td>
            <td style="padding: 8px 12px; text-align: right;">{{formatCurrency invoice.subTotal}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px;">Tax Total</td>
            <td style="padding: 8px 12px; text-align: right;">{{formatCurrency invoice.taxTotal}}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; border-top: 2px solid ${config.themeColor}; font-weight: bold; font-size: 16px; color: ${config.themeColor};">Total Amount</td>
            <td style="padding: 8px 12px; border-top: 2px solid ${config.themeColor}; font-weight: bold; font-size: 16px; color: ${config.themeColor}; text-align: right;">{{formatCurrency invoice.totalAmount}}</td>
          </tr>
        </table>
      </div>
      <div style="clear: both;"></div>
      `;
    }
    else if (block.type === "TEXT") {
      bodyHtml += `
      <div style="margin-bottom: 40px; text-align: ${block.settings.align === 'CENTER' ? 'center' : block.settings.align === 'RIGHT' ? 'right' : 'left'}; font-size: 11px; color: #555; white-space: pre-wrap;">${block.settings.text}</div>
      `;
    }
    else if (block.type === "SIGNATORY") {
      bodyHtml += `
      <div style="margin-bottom: 40px; text-align: ${block.settings.align === 'LEFT' ? 'left' : block.settings.align === 'CENTER' ? 'center' : 'right'};">
        <div style="font-weight: bold; margin-bottom: 10px;">For {{organization.legalName}}</div>
        {{#if assets.stamp}}
          <img src="{{assets.stamp}}" style="width: 120px; height: 50px; object-fit: contain; margin-bottom: 5px; display: ${block.settings.showStamp ? 'inline-block' : 'none'};" />
        {{/if}}
        <br/>
        {{#if assets.signature}}
          <img src="{{assets.signature}}" style="width: 120px; height: 50px; object-fit: contain; margin-bottom: 5px; display: ${block.settings.showSignature ? 'inline-block' : 'none'};" />
        {{/if}}
        <div style="color: #777;">Authorised Signatory</div>
      </div>
      `;
    }
  }

  return `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; font-size: 12px; }
  *, *::before, *::after { box-sizing: border-box; }
</style>
</head>
<body>
  ${bodyHtml}
</body>
</html>
  `;
}
