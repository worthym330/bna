import { BHAGYA_TEMPLATE_HTML } from './default-template';

export const TEMPLATE_GALLERY = [
  {
    id: "bhagya",
    name: "Standard Invoice",
    description: "A standard block-based invoice layout.",
    html: BHAGYA_TEMPLATE_HTML,
    blocks: [
      { id: '1', type: 'HEADER', settings: { showLogo: true, showOrgName: true, showOrgAddress: true, showOrgTaxId: true, showInvoiceNumber: true, showDate: true, showDueDate: true, primaryColor: '#0f172a' } },
      { id: '2', type: 'CLIENT_INFO', settings: { showClientAddress: true, showClientTaxId: true, showProjectInfo: true, bgColor: '#f8fafc' } },
      { id: '3', type: 'LINE_ITEMS', settings: { showHsn: true, showTaxRate: true, headerColor: '#f1f5f9' } },
      { id: '4', type: 'TOTALS', settings: { showAmountInWords: true, totalsBgColor: '#f8fafc' } },
      { id: '5', type: 'FOOTER', settings: { showTerms: true, showSignature: true, customText: '' } }
    ]
  },
  {
    id: "modern",
    name: "Modern Clean",
    description: "A clean, modern layout using flexbox.",
    html: `
<div style="font-family: 'Inter', sans-serif; padding: 40px; color: #333;">
  <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; margin-bottom: 30px;">
    <div>
      <h1 style="color: #1e40af; margin: 0; font-size: 24px;">{{organization.legalName}}</h1>
      <p style="color: #64748b; margin: 5px 0 0 0; font-size: 12px;">{{organization.address}}, {{organization.city}} - {{organization.pincode}}</p>
    </div>
    <div style="text-align: right;">
      <h2 style="color: #3b82f6; font-size: 32px; font-weight: 700; margin: 0; text-transform: uppercase;">Invoice</h2>
      <p style="margin: 5px 0 0 0; font-size: 14px; color: #475569;">#{{invoice.invoiceNumber}}</p>
      <p style="margin: 2px 0 0 0; font-size: 12px; color: #94a3b8;">{{formatDate invoice.invoiceDate}}</p>
    </div>
  </div>

  <div style="display: flex; margin-bottom: 40px;">
    <div style="flex: 1;">
      <h3 style="color: #94a3b8; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">Bill To</h3>
      <div style="font-weight: 600; font-size: 16px;">{{client.clientName}}</div>
      <div style="color: #475569; font-size: 13px;">{{client.addressLine1}}</div>
      <div style="color: #475569; font-size: 13px;">{{client.city}}, {{client.state}} {{client.pincode}}</div>
    </div>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
    <thead>
      <tr>
        <th style="text-align: left; padding: 12px 0; border-bottom: 2px solid #e2e8f0; color: #64748b; font-weight: 500; font-size: 12px; text-transform: uppercase;">Description</th>
        <th style="text-align: right; padding: 12px 0; border-bottom: 2px solid #e2e8f0; color: #64748b; font-weight: 500; font-size: 12px; text-transform: uppercase;">Amount</th>
      </tr>
    </thead>
    <tbody>
      {{#each invoice.lineItems}}
      <tr>
        <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px;">{{this.description}}</td>
        <td style="padding: 16px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-weight: 500; font-size: 14px;">{{formatCurrency this.totalAmount}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div style="display: flex; justify-content: flex-end;">
    <div style="width: 300px;">
      <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
        <span style="color: #64748b; font-size: 14px;">Subtotal</span>
        <span style="font-weight: 500;">{{formatCurrency invoice.subTotal}}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
        <span style="color: #64748b; font-size: 14px;">Tax</span>
        <span style="font-weight: 500;">{{formatCurrency invoice.taxTotal}}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 16px 0; color: #1e40af;">
        <span style="font-weight: 700; font-size: 18px;">Total Due</span>
        <span style="font-weight: 700; font-size: 18px;">{{formatCurrency invoice.totalAmount}}</span>
      </div>
    </div>
  </div>
</div>
    `
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Lots of whitespace and elegant typography.",
    html: `
<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 50px; color: #111;">
  <div style="text-align: right; margin-bottom: 60px;">
    <h1 style="font-weight: 300; font-size: 40px; letter-spacing: 2px; margin: 0 0 10px 0;">INVOICE</h1>
    <div style="font-size: 14px; color: #777;">{{invoice.invoiceNumber}}</div>
    <div style="font-size: 14px; color: #777;">{{formatDate invoice.invoiceDate}}</div>
  </div>
  
  <div style="display: flex; justify-content: space-between; margin-bottom: 60px;">
    <div>
      <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">FROM</div>
      <div style="font-size: 18px;">{{organization.legalName}}</div>
    </div>
    <div style="text-align: right;">
      <div style="font-weight: bold; font-size: 14px; margin-bottom: 5px;">TO</div>
      <div style="font-size: 18px;">{{client.clientName}}</div>
    </div>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 50px;">
    <thead>
      <tr>
        <th style="text-align: left; padding: 10px 0; border-bottom: 1px solid #000; font-weight: bold; font-size: 12px;">ITEM</th>
        <th style="text-align: right; padding: 10px 0; border-bottom: 1px solid #000; font-weight: bold; font-size: 12px;">TOTAL</th>
      </tr>
    </thead>
    <tbody>
      {{#each invoice.lineItems}}
      <tr>
        <td style="padding: 15px 0; border-bottom: 1px solid #eee; font-size: 14px;">{{this.description}}</td>
        <td style="padding: 15px 0; border-bottom: 1px solid #eee; text-align: right; font-size: 14px;">{{formatCurrency this.totalAmount}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div style="text-align: right;">
    <div style="font-size: 24px; font-weight: 300;">TOTAL DUE</div>
    <div style="font-size: 36px; font-weight: bold;">{{formatCurrency invoice.totalAmount}}</div>
  </div>
</div>
    `
  },
  {
    id: "bold",
    name: "Bold Header",
    description: "A stark layout with a solid color header.",
    html: `
<div style="font-family: Arial, sans-serif; color: #333;">
  <div style="background-color: #111; color: #fff; padding: 40px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <h1 style="margin: 0; font-size: 28px;">{{organization.legalName}}</h1>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Invoice</div>
      <div style="font-size: 20px; font-weight: bold;">{{invoice.invoiceNumber}}</div>
    </div>
  </div>

  <div style="padding: 40px;">
    <div style="margin-bottom: 40px;">
      <div style="font-weight: bold; font-size: 12px; text-transform: uppercase; color: #888;">Billed To</div>
      <div style="font-size: 18px; font-weight: bold; margin-top: 5px;">{{client.clientName}}</div>
      <div>{{client.addressLine1}}, {{client.city}}</div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
      <thead>
        <tr style="background-color: #f4f4f4;">
          <th style="text-align: left; padding: 15px; font-weight: bold;">Description</th>
          <th style="text-align: right; padding: 15px; font-weight: bold;">Amount</th>
        </tr>
      </thead>
      <tbody>
        {{#each invoice.lineItems}}
        <tr>
          <td style="padding: 15px; border-bottom: 1px solid #eee;">{{this.description}}</td>
          <td style="padding: 15px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold;">{{formatCurrency this.totalAmount}}</td>
        </tr>
        {{/each}}
      </tbody>
    </table>

    <div style="text-align: right;">
      <div style="font-size: 14px; color: #888;">Total</div>
      <div style="font-size: 32px; font-weight: bold;">{{formatCurrency invoice.totalAmount}}</div>
    </div>
  </div>
</div>
    `
  },
  {
    id: "classic",
    name: "Classic Grid",
    description: "Traditional business invoice with borders.",
    html: `
<div style="font-family: 'Times New Roman', Times, serif; padding: 40px; color: #000;">
  <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 20px;">
    <h1 style="margin: 0; font-size: 32px; text-transform: uppercase;">{{organization.legalName}}</h1>
    <div>{{organization.address}}, {{organization.city}} - {{organization.pincode}}</div>
    <div>GSTIN: {{organization.gstin}}</div>
  </div>

  <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
    <div style="width: 48%; border: 1px solid #000; padding: 15px;">
      <strong>Bill To:</strong><br/>
      {{client.clientName}}<br/>
      {{client.addressLine1}}<br/>
      {{client.city}}, {{client.state}}<br/>
      GSTIN: {{client.gstin}}
    </div>
    <div style="width: 48%; border: 1px solid #000; padding: 15px;">
      <strong>Invoice No:</strong> {{invoice.invoiceNumber}}<br/><br/>
      <strong>Date:</strong> {{formatDate invoice.invoiceDate}}
    </div>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
    <thead>
      <tr>
        <th style="border: 1px solid #000; padding: 10px; text-align: left;">S.No.</th>
        <th style="border: 1px solid #000; padding: 10px; text-align: left;">Description of Goods/Services</th>
        <th style="border: 1px solid #000; padding: 10px; text-align: center;">HSN/SAC</th>
        <th style="border: 1px solid #000; padding: 10px; text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      {{#each invoice.lineItems}}
      <tr>
        <td style="border: 1px solid #000; padding: 10px;">{{@index}}</td>
        <td style="border: 1px solid #000; padding: 10px;">{{this.description}}</td>
        <td style="border: 1px solid #000; padding: 10px; text-align: center;">{{this.hsnSac}}</td>
        <td style="border: 1px solid #000; padding: 10px; text-align: right;">{{formatCurrency this.totalAmount}}</td>
      </tr>
      {{/each}}
      <tr>
        <td colspan="3" style="border: 1px solid #000; padding: 10px; text-align: right; font-weight: bold;">Grand Total</td>
        <td style="border: 1px solid #000; padding: 10px; text-align: right; font-weight: bold;">{{formatCurrency invoice.totalAmount}}</td>
      </tr>
    </tbody>
  </table>
  
  <div style="text-align: right; margin-top: 60px;">
    <div>For {{organization.legalName}}</div>
    <br/><br/><br/>
    <div>Authorised Signatory</div>
  </div>
</div>
    `
  },
  {
    id: "creative",
    name: "Creative Accent",
    description: "A modern design with a colored accent bar.",
    html: `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #444; border-left: 15px solid #e11d48;">
  <div style="display: flex; justify-content: space-between; margin-bottom: 50px;">
    <div>
      <div style="font-size: 14px; color: #e11d48; text-transform: uppercase; font-weight: bold; letter-spacing: 2px;">Invoice</div>
      <div style="font-size: 32px; font-weight: bold; color: #111; margin-top: 5px;">{{invoice.invoiceNumber}}</div>
      <div style="color: #888;">{{formatDate invoice.invoiceDate}}</div>
    </div>
    <div style="text-align: right;">
      <h1 style="margin: 0; font-size: 24px; color: #111;">{{organization.legalName}}</h1>
      <p style="margin: 5px 0 0 0; color: #888;">{{organization.city}}, {{organization.pincode}}</p>
    </div>
  </div>

  <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 40px;">
    <div style="font-weight: bold; font-size: 14px; margin-bottom: 10px;">INVOICE TO:</div>
    <div style="font-size: 18px; color: #111;">{{client.clientName}}</div>
    <div style="color: #666; margin-top: 5px;">{{client.addressLine1}}, {{client.city}}</div>
  </div>

  <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
    <thead>
      <tr>
        <th style="text-align: left; padding: 15px 10px; border-bottom: 2px solid #e11d48; color: #111;">Description</th>
        <th style="text-align: right; padding: 15px 10px; border-bottom: 2px solid #e11d48; color: #111;">Total</th>
      </tr>
    </thead>
    <tbody>
      {{#each invoice.lineItems}}
      <tr>
        <td style="padding: 15px 10px; border-bottom: 1px solid #eee;">{{this.description}}</td>
        <td style="padding: 15px 10px; border-bottom: 1px solid #eee; text-align: right; font-weight: bold; color: #111;">{{formatCurrency this.totalAmount}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div style="display: flex; justify-content: flex-end;">
    <div style="background: #111; color: #fff; padding: 25px; border-radius: 8px; width: 250px; text-align: center;">
      <div style="font-size: 14px; opacity: 0.8; margin-bottom: 5px;">Amount Due</div>
      <div style="font-size: 28px; font-weight: bold;">{{formatCurrency invoice.totalAmount}}</div>
    </div>
  </div>
</div>
    `
  }
];
