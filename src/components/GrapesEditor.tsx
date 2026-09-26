"use client";

import React, { useEffect, useRef, useState } from 'react';
import 'grapesjs/dist/css/grapes.min.css';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface GrapesEditorProps {
  initialHtml?: string;
  assets?: any[];
  onSave: (htmlContent: string) => Promise<void>;
  onClose: () => void;
}

export default function GrapesEditor({ initialHtml, assets = [], onSave, onClose }: GrapesEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let e: any = null;

    const initEditor = async () => {
      if (!editorRef.current) return;
      
      // Dynamically import grapesjs to avoid SSR issues
      const grapesjs = (await import('grapesjs')).default;
      const grapesjsPresetWebpage = (await import('grapesjs-preset-webpage')).default;
      const grapesjsBlocksBasic = (await import('grapesjs-blocks-basic')).default;

      e = grapesjs.init({
        container: editorRef.current,
        plugins: [grapesjsBlocksBasic, grapesjsPresetWebpage],
        height: '100%',
        width: '100%',
        storageManager: false, // We handle saving manually
        components: initialHtml || '<div style="padding: 40px; font-family: Helvetica, sans-serif;"><h1>New Template</h1><p>Start designing here...</p></div>',
        canvas: {
          styles: [
            'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
          ]
        },
        assetManager: {
          assets: assets.map(a => ({
            src: `/api/assets/${a.id}`,
            name: a.name,
            type: 'image'
          }))
        }
      });

      // Add custom Table block
      const bm = e.BlockManager;
      bm.add('table-block', {
        label: 'Table',
        category: 'Basic',
        attributes: { class: 'fa fa-table' },
        content: `
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ccc; padding: 10px; text-align: left;">Header 1</th>
                <th style="border: 1px solid #ccc; padding: 10px; text-align: left;">Header 2</th>
                <th style="border: 1px solid #ccc; padding: 10px; text-align: left;">Header 3</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #ccc; padding: 10px;">Cell 1</td>
                <td style="border: 1px solid #ccc; padding: 10px;">Cell 2</td>
                <td style="border: 1px solid #ccc; padding: 10px;">Cell 3</td>
              </tr>
              <tr>
                <td style="border: 1px solid #ccc; padding: 10px;">Cell 4</td>
                <td style="border: 1px solid #ccc; padding: 10px;">Cell 5</td>
                <td style="border: 1px solid #ccc; padding: 10px;">Cell 6</td>
              </tr>
            </tbody>
          </table>
        `
      });

      // Enable native GrapesJS resizing for table cells
      const domc = e.Components;
      domc.addType('cell', {
        isComponent: (el: HTMLElement) => el.tagName === 'TD' || el.tagName === 'TH',
        model: {
          defaults: {
            name: 'Cell',
            draggable: ['tr'],
            resizable: {
              // Only allow horizontal resizing
              tl: 0, tc: 0, tr: 0,
              cl: 0, cr: 1,
              bl: 0, bc: 0, br: 0,
              // Update style width directly
              updateTarget: (el: HTMLElement, rect: any, opt: any) => {
                el.style.width = opt.resizer.rectDim.w + 'px';
              }
            },
          },
        },
      });



      setEditorInstance(e);
    };

    initEditor();

    return () => {
      if (e) {
        e.destroy();
      }
    };
  }, [initialHtml]);

  const handleSave = async () => {
    if (!editorInstance) return;
    setLoading(true);
    try {
      const html = editorInstance.getHtml();
      const css = editorInstance.getCss();
      
      const fullContent = `<!DOCTYPE html>
<html>
<head>
<style>
${css}
</style>
</head>
<body>
${html}
</body>
</html>`;

      await onSave(fullContent);
    } catch (err) {
      toast.error("Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <div className="h-14 bg-slate-900 flex items-center justify-between px-6 shrink-0">
        <h2 className="text-white font-medium">Visual Template Studio (GrapesJS)</h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Design"}
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative">
        <div ref={editorRef} className="absolute inset-0" />
      </div>
    </div>
  );
}
