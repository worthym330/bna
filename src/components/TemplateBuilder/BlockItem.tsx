import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BlockConfig } from './types';
import { GripVertical, Trash2 } from 'lucide-react';

interface BlockItemProps {
  block: BlockConfig;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export function BlockItem({ block, isSelected, onSelect, onRemove }: BlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group border-2 rounded-lg mb-4 bg-white transition-all ${
        isSelected ? 'border-primary ring-4 ring-primary/20' : 'border-transparent hover:border-slate-200'
      }`}
      onClick={() => onSelect(block.id)}
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing"
      >
        <div className="bg-white border rounded shadow-sm p-1 text-slate-400 hover:text-slate-600">
          <GripVertical size={20} />
        </div>
      </div>

      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(block.id); }}
          className="p-1.5 bg-white border shadow-sm rounded text-red-500 hover:bg-red-50"
          title="Remove Block"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="p-8 pointer-events-none">
        <BlockPreview block={block} />
      </div>
    </div>
  );
}

function BlockPreview({ block }: { block: BlockConfig }) {
  // A simplified visual representation of the block for the canvas
  switch (block.type) {
    case 'HEADER':
      return (
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            {block.settings.showLogo && <div className="w-32 h-12 bg-slate-200 rounded border-dashed border-2 flex items-center justify-center text-xs text-slate-500">Logo Placeholder</div>}
            {block.settings.showOrgName && <div className="text-xl font-bold bg-slate-100 w-48 h-6 rounded"></div>}
            {block.settings.showOrgAddress && <div className="space-y-1"><div className="w-32 h-3 bg-slate-100 rounded"></div><div className="w-24 h-3 bg-slate-100 rounded"></div></div>}
          </div>
          <div className="text-right space-y-2">
            <div className="text-2xl font-bold uppercase" style={{ color: block.settings.primaryColor || '#000' }}>TAX INVOICE</div>
            <div className="w-32 h-4 bg-slate-100 rounded ml-auto"></div>
            <div className="w-24 h-4 bg-slate-100 rounded ml-auto"></div>
          </div>
        </div>
      );
    case 'CLIENT_INFO':
      return (
        <div className="bg-slate-50 p-6 rounded" style={{ backgroundColor: block.settings.bgColor || '#f8fafc' }}>
          <div className="font-bold mb-2">Billed To:</div>
          <div className="w-48 h-5 bg-slate-200 rounded mb-2"></div>
          {block.settings.showClientAddress && <div className="space-y-1 mb-2"><div className="w-64 h-3 bg-slate-200 rounded"></div><div className="w-32 h-3 bg-slate-200 rounded"></div></div>}
          {block.settings.showProjectInfo && <div className="w-40 h-4 bg-slate-200 rounded mt-4"></div>}
        </div>
      );
    case 'LINE_ITEMS':
      return (
        <div className="border rounded overflow-hidden">
          <div className="flex bg-slate-100 p-3 font-bold text-sm" style={{ backgroundColor: block.settings.headerColor || '#f8fafc' }}>
            <div className="w-10">#</div>
            <div className="flex-1">Description</div>
            <div className="w-20 text-right">Qty</div>
            <div className="w-24 text-right">Amount</div>
          </div>
          {[1, 2].map(i => (
            <div key={i} className="flex p-3 border-t text-sm text-slate-500">
              <div className="w-10">{i}</div>
              <div className="flex-1">Item Description {i}</div>
              <div className="w-20 text-right">1</div>
              <div className="w-24 text-right">₹100.00</div>
            </div>
          ))}
        </div>
      );
    case 'TOTALS':
      return (
        <div className="flex justify-between mt-4">
          <div className="w-1/2">
             {block.settings.showAmountInWords && <div className="w-48 h-4 bg-slate-100 rounded"></div>}
          </div>
          <div className="w-1/3 space-y-2 text-right">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-medium">₹200.00</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Tax</span><span className="font-medium">₹36.00</span></div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2"><span className="text-slate-700">Total</span><span>₹236.00</span></div>
          </div>
        </div>
      );
    case 'FOOTER':
      return (
        <div className="flex justify-between mt-12 pt-8 border-t">
          <div className="w-1/2 space-y-4">
            {block.settings.showTerms && <><div className="w-24 h-4 bg-slate-100 rounded"></div><div className="w-64 h-2 bg-slate-100 rounded"></div><div className="w-48 h-2 bg-slate-100 rounded"></div></>}
          </div>
          <div className="w-1/3 text-center flex flex-col items-center">
            <div className="font-medium mb-4">For Organization Name</div>
            <div className="w-32 h-16 bg-slate-100 rounded border-dashed border-2 flex items-center justify-center text-xs text-slate-400 mb-2">Signature</div>
            <div className="text-xs text-slate-500 border-t border-slate-300 pt-1">Authorized Signatory</div>
          </div>
        </div>
      );
    case 'SPACER':
      return <div className="w-full flex items-center justify-center border-y border-dashed border-slate-200 text-slate-300 text-xs font-medium" style={{ height: `${block.settings.height || 20}px` }}>Spacer (${block.settings.height || 20}px)</div>;
    case 'TEXT':
      return <div className="text-slate-600" style={{ textAlign: block.settings.align as any, color: block.settings.color }}>{block.settings.content || 'Custom text block...'}</div>;
    default:
      return <div>Unknown Block</div>;
  }
}
