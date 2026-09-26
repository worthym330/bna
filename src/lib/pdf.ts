import puppeteer from 'puppeteer';
import Handlebars from 'handlebars';

// Register Handlebars helpers for formatting
Handlebars.registerHelper('formatCurrency', function (value) {
  if (typeof value !== 'number') return value;
  return value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
});

Handlebars.registerHelper('formatDate', function (dateString) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-GB');
});

Handlebars.registerHelper('eq', function (a, b) {
  return a === b;
});

export async function generatePdfFromHtml(htmlTemplate: string, data: any): Promise<Buffer> {
  // 1. Compile Handlebars
  const template = Handlebars.compile(htmlTemplate);
  const compiledHtml = template(data);

  // 2. Launch Puppeteer
  // Note: For serverless (Vercel), you'd swap this with puppeteer-core and @sparticuz/chromium
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set HTML content
    await page.setContent(compiledHtml, {
      waitUntil: 'domcontentloaded'
    });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}
