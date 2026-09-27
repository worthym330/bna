"use client";

import { useState } from "react";
import { updateBlogAction } from "@/app/actions/blogs";
import { toast } from "sonner";
import { Save, Plus, ArrowLeft, GripVertical, Trash2 } from "lucide-react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type BlogBlock = {
  id: string;
  type: 'H1' | 'H2' | 'P' | 'IMAGE';
  content: string;
};

export function BlogEditorClient({ initialBlog }: { initialBlog: any }) {
  const [title, setTitle] = useState(initialBlog.title);
  const [slug, setSlug] = useState(initialBlog.slug);
  const [isPublished, setIsPublished] = useState(initialBlog.isPublished);
  
  // Parse existing HTML into blocks, or start fresh
  const [blocks, setBlocks] = useState<BlogBlock[]>(() => {
    try {
      if (initialBlog.designConfig && Array.isArray(initialBlog.designConfig) && initialBlog.designConfig.length > 0) {
        return initialBlog.designConfig;
      }
    } catch (e) {}
    return [
      { id: '1', type: 'H1', content: initialBlog.title },
      { id: '2', type: 'P', content: 'Start writing your blog post here...' }
    ];
  });

  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addBlock = (type: 'H1' | 'H2' | 'P' | 'IMAGE') => {
    const newBlock: BlogBlock = {
      id: Date.now().toString(),
      type,
      content: type === 'IMAGE' ? 'https://via.placeholder.com/800x400' : ''
    };
    setBlocks([...blocks, newBlock]);
  };

  const updateBlock = (id: string, content: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content } : b));
  };

  const removeBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  const generateHtml = () => {
    return blocks.map(b => {
      if (b.type === 'H1') return `<h1 class="text-4xl font-bold mb-6">${b.content}</h1>`;
      if (b.type === 'H2') return `<h2 class="text-2xl font-bold mt-8 mb-4">${b.content}</h2>`;
      if (b.type === 'P') return `<p class="text-lg text-slate-700 leading-relaxed mb-6">${b.content}</p>`;
      if (b.type === 'IMAGE') return `<img src="${b.content}" alt="Blog Image" class="w-full rounded-xl mb-6 shadow-sm" />`;
      return '';
    }).join('\n');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateBlogAction(initialBlog.id, {
        title,
        slug,
        isPublished,
        htmlContent: generateHtml(),
        designConfig: blocks
      });
      toast.success("Blog updated successfully");
    } catch (e: any) {
      toast.error(e.message || "Failed to update blog");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
        <div className="flex gap-4">
          <Link href="/super-admin/blogs" className="p-2 border rounded-md hover:bg-slate-50">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-4">
             <input 
               type="text" 
               value={title} 
               onChange={e => setTitle(e.target.value)} 
               className="font-bold text-xl border-none focus:ring-0 p-0" 
             />
             <div className="flex items-center gap-2 text-sm text-slate-500">
               <span>/blogs/</span>
               <input 
                 type="text" 
                 value={slug} 
                 onChange={e => setSlug(e.target.value)} 
                 className="border-b border-slate-300 focus:border-blue-500 focus:ring-0 p-0 text-slate-700" 
               />
             </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium">
            <input 
              type="checkbox" 
              checked={isPublished} 
              onChange={e => setIsPublished(e.target.checked)} 
              className="rounded text-blue-600 focus:ring-blue-600"
            />
            Published
          </label>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSaving ? "Saving..." : "Save Blog"}
          </button>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Editor Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-[600px]">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
              <div className="space-y-4">
                {blocks.map((block) => (
                  <SortableBlock 
                    key={block.id} 
                    block={block} 
                    updateBlock={updateBlock} 
                    removeBlock={removeBlock} 
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          
          {blocks.length === 0 && (
            <div className="text-center text-slate-400 py-12 border-2 border-dashed rounded-xl border-slate-200">
              Drag and drop blocks from the sidebar to build your blog
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-64 shrink-0 bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-6">
          <h3 className="font-semibold text-slate-800 mb-4">Add Block</h3>
          <div className="space-y-2">
            <button onClick={() => addBlock('H1')} className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 flex items-center gap-3 transition-colors">
              <span className="font-bold text-lg text-slate-400">H1</span> Main Heading
            </button>
            <button onClick={() => addBlock('H2')} className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 flex items-center gap-3 transition-colors">
              <span className="font-bold text-lg text-slate-400">H2</span> Sub Heading
            </button>
            <button onClick={() => addBlock('P')} className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 flex items-center gap-3 transition-colors">
              <span className="font-bold text-lg text-slate-400">¶</span> Paragraph
            </button>
            <button onClick={() => addBlock('IMAGE')} className="w-full text-left px-4 py-3 rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 flex items-center gap-3 transition-colors">
              <span className="font-bold text-lg text-slate-400">🖼</span> Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SortableBlock({ block, updateBlock, removeBlock }: { block: BlogBlock, updateBlock: (id: string, content: string) => void, removeBlock: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative border border-transparent hover:border-blue-200 rounded-lg p-2 transition-colors">
      <div {...attributes} {...listeners} className="absolute -left-8 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-slate-400" />
      </div>
      <button onClick={() => removeBlock(block.id)} className="absolute -right-8 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600">
        <Trash2 className="w-5 h-5" />
      </button>

      {block.type === 'H1' && (
        <input 
          type="text" 
          value={block.content} 
          onChange={e => updateBlock(block.id, e.target.value)} 
          placeholder="Main Heading..."
          className="w-full text-4xl font-bold border-none bg-transparent focus:ring-0 p-0"
        />
      )}
      {block.type === 'H2' && (
        <input 
          type="text" 
          value={block.content} 
          onChange={e => updateBlock(block.id, e.target.value)} 
          placeholder="Sub Heading..."
          className="w-full text-2xl font-bold border-none bg-transparent focus:ring-0 p-0"
        />
      )}
      {block.type === 'P' && (
        <textarea 
          value={block.content} 
          onChange={e => updateBlock(block.id, e.target.value)} 
          placeholder="Write your paragraph..."
          rows={4}
          className="w-full text-lg text-slate-700 leading-relaxed border-none bg-transparent focus:ring-0 p-0 resize-y"
        />
      )}
      {block.type === 'IMAGE' && (
        <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50">
          <label className="text-sm text-slate-500 block mb-2">Image URL</label>
          <input 
            type="text" 
            value={block.content} 
            onChange={e => updateBlock(block.id, e.target.value)} 
            placeholder="https://..."
            className="w-full text-sm border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          {block.content && <img src={block.content} alt="Preview" className="mt-4 max-h-48 rounded object-cover" />}
        </div>
      )}
    </div>
  );
}
