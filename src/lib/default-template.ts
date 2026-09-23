export const BHAGYA_TEMPLATE_HTML = `
<!DOCTYPE html>
<html>
<head>
<style>
  body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 0;
    font-size: 11px;
    color: #000;
  }
  .container {
    width: 100%;
    margin: 0 auto;
  }
  .header-img {
    width: 100%;
    max-height: 120px;
    object-fit: contain;
    margin-bottom: 20px;
  }
  .title {
    text-align: center;
    font-weight: bold;
    font-size: 14px;
    text-transform: uppercase;
    border: 1px solid #000;
    padding: 5px;
    background-color: #f8f8f8;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid #000;
    padding: 6px;
    vertical-align: middle;
  }
  .grid-label {
    font-weight: bold;
    background-color: #f8f8f8;
  }
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .bold { font-weight: bold; }
  
  .details-table th, .details-table td {
    width: 25%;
  }
  
  .items-table {
    margin-top: 10px;
  }
  .items-table th {
    background-color: #f8f8f8;
    font-weight: bold;
    text-align: center;
  }
  
  .footer {
    margin-top: 20px;
    font-size: 10px;
  }
  .signatory {
    margin-top: 40px;
    text-align: right;
    padding-right: 20px;
  }
  .stamp-box {
    width: 150px;
    height: 60px;
    object-fit: contain;
    display: block;
    margin-left: auto;
    margin-bottom: 5px;
  }
</style>
</head>
<body>
<div class="container">
  {{#if assets.letterhead}}
    <img src="{{assets.letterhead}}" class="header-img" />
  {{else}}
    <h1 style="text-align:center; color:darkred;">{{organization.legalName}}</h1>
  {{/if}}

  <div class="title">{{#if (eq invoice.type "CREDIT_NOTE")}}CREDIT NOTE{{else}}TAX INVOICE{{/if}}</div>
  
  <table class="details-table">
    <tr>
      <td class="bold text-center" colspan="2">{{organization.legalName}}</td>
      <td class="grid-label text-center">Invoice No.</td>
      <td class="text-center">{{invoice.invoiceNumber}}</td>
    </tr>
    <tr>
      <td colspan="2" class="text-center">{{organization.address}}</td>
      <td class="grid-label text-center">Invoice Date</td>
      <td class="text-center">{{formatDate invoice.invoiceDate}}</td>
    </tr>
    <tr>
      <td colspan="2" class="text-center">{{organization.city}} - {{organization.pincode}}</td>
      <td class="grid-label text-center">Reverse Charge Y/N</td>
      <td class="text-center">No</td>
    </tr>
    {{#if (eq invoice.type "CREDIT_NOTE")}}
    <tr>
      <td class="bold text-center" colspan="2">GST NO - {{organization.gstin}}</td>
      <td class="grid-label text-center">Against Invoice No.</td>
      <td class="text-center">{{invoice.linkedInvoiceNumber}}</td>
    </tr>
    {{/if}}
    <tr>
      <td class="bold text-center" colspan="2">PAN NO. - {{organization.pan}}</td>
      <td class="grid-label text-center">WO Date-</td>
      <td class="text-center">{{#if project.workOrderDate}}{{formatDate project.workOrderDate}}{{else}}-{{/if}}</td>
    </tr>
    <tr>
      <td class="bold text-center" colspan="2">Bill To</td>
      <td class="grid-label text-center">WO No. -</td>
      <td class="text-center">{{#if project.workOrderNumber}}{{project.workOrderNumber}}{{else}}-{{/if}}</td>
    </tr>
    <tr>
      <td class="bold text-center" colspan="2">{{client.clientName}}</td>
      <td class="bold text-center" colspan="2">Project Name</td>
    </tr>
    <tr>
      <td class="text-center" colspan="2">{{client.addressLine1}}, {{client.city}}</td>
      <td class="text-center" colspan="2" rowspan="2">
        <span class="bold">{{#if project.projectName}}{{project.projectName}}{{else}}N/A{{/if}}</span><br/>
        {{#if project.projectAddress}}{{project.projectAddress}}{{/if}}
      </td>
    </tr>
    <tr>
      <td class="text-center" colspan="2">{{client.state}} - {{client.pincode}}</td>
    </tr>
    <tr>
      <td class="bold text-center" colspan="2">GST NO. - {{client.gstin}}</td>
      <td colspan="2"></td>
    </tr>
    <tr>
      <td class="text-center" colspan="2">PAN NO. - {{client.pan}}</td>
      <td colspan="2" class="text-center">CIVIL Works</td>
    </tr>
    {{#if (eq invoice.type "CREDIT_NOTE")}}
    <tr>
      <td class="bold text-center" colspan="2">Reason for Credit Note :</td>
      <td colspan="2" class="text-center">{{#if invoice.reason}}{{invoice.reason}}{{else}}Deduction / rate difference on Final Bill{{/if}}</td>
    </tr>
    {{/if}}
  </table>

  <table class="items-table">
    <tr>
      <th style="width: 5%;">SR. NO.</th>
      <th style="width: 50%;">Item Of Description</th>
      <th style="width: 20%;">SAC NO</th>
      <th style="width: 25%;">Amount</th>
    </tr>
    {{#each invoice.lineItems}}
    <tr>
      <td class="text-center">{{@index}}</td>
      <td>{{this.description}}</td>
      <td class="text-center">{{this.hsnSac}}</td>
      <td class="text-right bold">{{formatCurrency this.totalAmount}}</td>
    </tr>
    {{/each}}
    <tr>
      <td colspan="3" class="text-right">Add IGST</td>
      <td class="text-right">{{formatCurrency invoice.taxTotal}}</td>
    </tr>
    <tr>
      <td colspan="3" class="text-right bold">Total Amount</td>
      <td class="text-right bold">{{formatCurrency invoice.totalAmount}}</td>
    </tr>
  </table>

  <div class="footer">
    <i>This is issued against Tax Invoice and reduces the taxable value and IGST charged on that invoice.</i>
    
    <div class="signatory">
      <div class="bold" style="margin-bottom:10px;">For {{organization.legalName}}</div>
      {{#if assets.stamp}}
        <img src="{{assets.stamp}}" class="stamp-box" />
      {{/if}}
      {{#if assets.signature}}
        <img src="{{assets.signature}}" class="stamp-box" />
      {{/if}}
      <div>Authorised Signatory</div>
    </div>
  </div>
</div>
</body>
</html>
`;

export const MODERN_TEMPLATE_HTML = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; font-size: 12px; }
  .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eaeaea; padding-bottom: 20px; margin-bottom: 40px; }
  .logo { max-width: 200px; max-height: 80px; }
  .org-details { text-align: right; }
  .org-name { font-size: 24px; font-weight: bold; color: #2c3e50; }
  
  .bill-to { margin-bottom: 40px; }
  .bill-to h3 { color: #7f8c8d; text-transform: uppercase; font-size: 10px; margin-bottom: 5px; }
  .bill-to-name { font-size: 16px; font-weight: bold; }
  
  table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
  th { background: #f8f9fa; text-align: left; padding: 12px; font-weight: 600; color: #2c3e50; border-bottom: 2px solid #dee2e6; }
  td { padding: 12px; border-bottom: 1px solid #eaeaea; }
  .text-right { text-align: right; }
  
  .totals { width: 50%; float: right; }
  .totals table { margin-bottom: 0; }
  .totals th, .totals td { border: none; padding: 8px 12px; }
  .totals tr.grand-total { border-top: 2px solid #2c3e50; font-weight: bold; font-size: 16px; color: #2c3e50; }
  
  .footer { clear: both; padding-top: 60px; margin-top: 60px; text-align: center; font-size: 10px; color: #95a5a6; border-top: 1px solid #eaeaea; }
</style>
</head>
<body>
  <div class="header">
    <div>
      {{#if assets.letterhead}}
        <img src="{{assets.letterhead}}" class="logo" />
      {{else}}
        <h1 class="org-name">{{organization.legalName}}</h1>
      {{/if}}
    </div>
    <div class="org-details">
      <div style="font-size: 28px; font-weight: bold; color: #2c3e50; margin-bottom: 10px;">INVOICE</div>
      <div><strong>Invoice #:</strong> {{invoice.invoiceNumber}}</div>
      <div><strong>Date:</strong> {{formatDate invoice.invoiceDate}}</div>
      <div><strong>GSTIN:</strong> {{organization.gstin}}</div>
    </div>
  </div>

  <div class="bill-to">
    <h3>Bill To</h3>
    <div class="bill-to-name">{{client.clientName}}</div>
    <div>{{client.addressLine1}}, {{client.city}}</div>
    <div>{{client.state}} - {{client.pincode}}</div>
    <div><strong>GSTIN:</strong> {{client.gstin}}</div>
    {{#if project.projectName}}
      <div style="margin-top: 10px;"><strong>Project:</strong> {{project.projectName}}</div>
    {{/if}}
  </div>

  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>HSN/SAC</th>
        <th class="text-right">Qty</th>
        <th class="text-right">Price</th>
        <th class="text-right">Amount</th>
      </tr>
    </thead>
    <tbody>
      {{#each invoice.lineItems}}
      <tr>
        <td>{{this.description}}</td>
        <td>{{this.hsnSac}}</td>
        <td class="text-right">{{this.quantity}}</td>
        <td class="text-right">{{formatCurrency this.unitPrice}}</td>
        <td class="text-right">{{formatCurrency this.totalAmount}}</td>
      </tr>
      {{/each}}
    </tbody>
  </table>

  <div class="totals">
    <table>
      <tr>
        <td>Subtotal</td>
        <td class="text-right">{{formatCurrency invoice.subTotal}}</td>
      </tr>
      <tr>
        <td>Tax Total</td>
        <td class="text-right">{{formatCurrency invoice.taxTotal}}</td>
      </tr>
      <tr class="grand-total">
        <td>Total Amount</td>
        <td class="text-right">{{formatCurrency invoice.totalAmount}}</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    Thank you for your business!
  </div>
</body>
</html>
`;
