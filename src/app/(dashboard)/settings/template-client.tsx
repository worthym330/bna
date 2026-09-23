"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { saveTemplateAction } from "@/app/actions/templates";

export function TemplateClient({ existingTemplate }: { existingTemplate: any }) {
  const [htmlContent, setHtmlContent] = useState(existingTemplate?.htmlContent || "");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setLoading(true);
    try {
      await saveTemplateAction(htmlContent);
      toast.success("Template saved successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save template");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4 bg-white p-6 rounded-md border shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">HTML Invoice Template</h2>
          <p className="text-sm text-slate-500">
            Customize the HTML layout of your generated invoices using Handlebars variables.
          </p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Template"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-4 border-t">
        <div className="md:col-span-1 space-y-4 text-sm text-slate-600 bg-slate-50 p-4 rounded-md">
          <h3 className="font-semibold text-slate-900">Available Variables</h3>
          <ul className="space-y-2 break-all">
            <li><code>{`{{organization.legalName}}`}</code></li>
            <li><code>{`{{client.clientName}}`}</code></li>
            <li><code>{`{{project.projectName}}`}</code></li>
            <li><code>{`{{invoice.invoiceNumber}}`}</code></li>
            <li><code>{`{{formatDate invoice.invoiceDate}}`}</code></li>
            <li><code>{`{{formatCurrency invoice.totalAmount}}`}</code></li>
            <li><code>{`{{assets.letterhead}}`}</code> (Image URL)</li>
            <li><code>{`{{assets.stamp}}`}</code> (Image URL)</li>
            <li><code>{`{{assets.signature}}`}</code> (Image URL)</li>
          </ul>
          <h3 className="font-semibold text-slate-900 mt-4">Looping Items</h3>
          <pre className="text-xs bg-slate-200 p-2 rounded">
{`{{#each invoice.lineItems}}
  {{this.description}}
  {{this.quantity}}
  {{this.unitPrice}}
{{/each}}`}
          </pre>
        </div>

        <div className="md:col-span-3">
          <textarea
            className="w-full h-[500px] p-4 font-mono text-sm border rounded-md focus:ring-2 focus:ring-slate-950 focus:outline-none"
            value={htmlContent}
            onChange={(e) => setHtmlContent(e.target.value)}
            placeholder="<html><body>...</body></html>"
            spellCheck="false"
          />
        </div>
      </div>
    </div>
  );
}
