"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createTemplateAction, updateTemplateAction, deleteTemplateAction, setAsDefaultTemplateAction } from "@/app/actions/templates";
import GrapesEditor from "@/components/GrapesEditor";
import { TEMPLATE_GALLERY } from "@/lib/template-gallery";

export function TemplatesClient({ initialTemplates, assets }: { initialTemplates: any[], assets: any[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const startNew = () => {
    setShowGallery(true);
  };

  const selectTemplate = (templateHtml: string) => {
    setEditingId("NEW");
    setName("");
    setHtmlContent(templateHtml);
    setShowGallery(false);
    setShowEditor(true);
  };
    
  const editTemplate = (t: any) => {
    setEditingId(t.id);
    setName(t.name);
    setHtmlContent(t.htmlContent);
    setShowEditor(true);
  };

  const handleSave = async (finalHtml: string) => {
    if (!name.trim()) {
      // Prompt for name if not set (which it won't be if NEW)
      const inputName = prompt("Enter a name for this template:");
      if (!inputName || !inputName.trim()) {
        toast.error("Template name is required to save.");
        return;
      }
      setName(inputName);
    }

    try {
      const payload = { name: name.trim() || "Untitled", htmlContent: finalHtml };

      if (editingId === "NEW") {
        await createTemplateAction(payload);
        toast.success("Template created!");
      } else if (editingId) {
        await updateTemplateAction(editingId, payload);
        toast.success("Template updated!");
      }
      setShowEditor(false);
      setEditingId(null);
    } catch (err) {
      toast.error("Failed to save template");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      await deleteTemplateAction(id);
      toast.success("Template deleted");
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  if (showGallery) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setShowGallery(false)}>Back</Button>
          <h2 className="text-2xl font-bold">Choose a Starting Template</h2>
        </div>
        <p className="text-slate-500">Select a base layout. You can completely customize it in the visual editor on the next screen.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TEMPLATE_GALLERY.map(template => (
            <div 
              key={template.id} 
              className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md hover:border-primary cursor-pointer transition-all flex flex-col h-[280px]"
              onClick={() => selectTemplate(template.html)}
            >
              <div className="h-40 bg-slate-100 flex items-center justify-center p-4">
                 <div className="text-slate-400 text-sm font-medium border-2 border-dashed border-slate-300 rounded p-6 text-center w-full h-full flex flex-col items-center justify-center">
                   <div className="w-16 h-16 bg-slate-200 rounded-md mb-2"></div>
                   Visual Preview
                 </div>
              </div>
              <div className="p-4 border-t flex-1">
                <h3 className="font-semibold text-lg">{template.name}</h3>
                <p className="text-sm text-slate-500 mt-1">{template.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (showEditor) {
    return (
      <GrapesEditor 
        initialHtml={htmlContent} 
        onSave={handleSave} 
        onClose={() => {
          setShowEditor(false);
          setEditingId(null);
        }} 
      />
    );
  }

  return (
    <div className="space-y-4 bg-white p-6 rounded-md border shadow-sm">
      <div className="flex justify-end">
        <Button onClick={startNew}>+ New Canvas Template</Button>
      </div>
      <div className="space-y-3">
        {initialTemplates.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No templates found.</p>
        ) : (
          initialTemplates.map(t => (
            <div key={t.id} className="flex items-center justify-between p-4 border rounded-md hover:bg-slate-50">
              <div>
                <h3 className="font-medium text-lg flex items-center gap-2">
                  {t.name}
                  {t.isDefault && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Default</span>}
                </h3>
                <p className="text-sm text-slate-500">Last updated: {new Date(t.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2">
                {!t.isDefault && (
                  <Button variant="outline" size="sm" onClick={() => setAsDefaultTemplateAction(t.id)}>Make Default</Button>
                )}
                <Button variant="secondary" size="sm" onClick={() => editTemplate(t)}>Open Visual Studio</Button>
                {!t.isDefault && (
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(t.id)}>Delete</Button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
