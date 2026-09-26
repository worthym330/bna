"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BlockConfig, TemplateBuilderProps } from './types';
import { Canvas } from './Canvas';
import { Sidebar } from './Sidebar';
import { compileToHandlebars } from './compiler';

export default function TemplateBuilder({ initialConfig, onSave, onClose, assets }: TemplateBuilderProps) {
  const [blocks, setBlocks] = useState<BlockConfig[]>(initialConfig || []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedBlock = blocks.find(b => b.id === selectedId) || null;

  const handleUpdateBlock = (id: string, newSettings: Record<string, any>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, settings: newSettings } : b));
  };

  const handleAddBlock = (block: BlockConfig) => {
    setBlocks(prev => [...prev, block]);
    setSelectedId(block.id);
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleSave = async () => {
    if (blocks.length === 0) {
      toast.error("Template cannot be empty");
      return;
    }
    
    setLoading(true);
    try {
      const compiledHtml = compileToHandlebars(blocks);
      await onSave(compiledHtml, blocks);
    } catch (err) {
      console.error(err);
      toast.error("Failed to compile or save template");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">
      <div className="h-14 bg-slate-900 flex items-center justify-between px-6 shrink-0 shadow-md">
        <h2 className="text-white font-medium">Invoice Template Builder</h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Template"}
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden flex">
        <Canvas 
          blocks={blocks}
          selectedId={selectedId}
          onBlocksChange={setBlocks}
          onSelect={setSelectedId}
          onRemove={handleRemoveBlock}
        />
        <Sidebar 
          selectedBlock={selectedBlock}
          onUpdateBlock={handleUpdateBlock}
          onAddBlock={handleAddBlock}
        />
      </div>
    </div>
  );
}
