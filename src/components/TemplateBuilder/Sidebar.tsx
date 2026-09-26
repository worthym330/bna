import { BlockConfig, BlockType } from './types';
// import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
const uuidv4 = () => crypto.randomUUID();
import { Label } from '@/components/ui/label';

import { Type, LayoutTemplate, AlignJustify, Hash, Footprints, ArrowDownToLine, HandCoins } from 'lucide-react';

interface SidebarProps {
  selectedBlock: BlockConfig | null;
  onUpdateBlock: (id: string, newSettings: Record<string, any>) => void;
  onAddBlock: (block: BlockConfig) => void;
}

const AVAILABLE_BLOCKS: { type: BlockType; label: string; icon: React.ReactNode; defaultSettings: Record<string, any> }[] = [
  { type: 'HEADER', label: 'Header', icon: <LayoutTemplate size={18} />, defaultSettings: { layout: 'logo_left', showLogo: true, showOrgName: true, showOrgAddress: true, showOrgTaxId: true, showInvoiceNumber: true, showDate: true, showDueDate: true, primaryColor: '#0f172a' } },
  { type: 'CLIENT_INFO', label: 'Client Details', icon: <AlignJustify size={18} />, defaultSettings: { layout: 'default', showClientAddress: true, showClientTaxId: true, showProjectInfo: true, bgColor: '#f8fafc' } },
  { type: 'LINE_ITEMS', label: 'Line Items Table', icon: <Hash size={18} />, defaultSettings: { showHsn: true, showTaxRate: true, headerColor: '#f1f5f9' } },
  { type: 'TOTALS', label: 'Totals & Taxes', icon: <HandCoins size={18} />, defaultSettings: { align: 'right', showAmountInWords: true, totalsBgColor: '#f8fafc' } },
  { type: 'FOOTER', label: 'Footer & Signature', icon: <Footprints size={18} />, defaultSettings: { showTerms: true, showSignature: true, customText: '' } },
  { type: 'SPACER', label: 'Vertical Space', icon: <ArrowDownToLine size={18} />, defaultSettings: { height: 30 } },
  { type: 'TEXT', label: 'Custom Text', icon: <Type size={18} />, defaultSettings: { content: 'Enter your text here...', align: 'left', color: '#334155' } },
];

export function Sidebar({ selectedBlock, onUpdateBlock, onAddBlock }: SidebarProps) {

  if (!selectedBlock) {
    return (
      <div className="w-80 bg-white border-l flex flex-col h-full overflow-y-auto">
        <div className="p-4 border-b bg-slate-50">
          <h3 className="font-semibold text-slate-800">Add Blocks</h3>
          <p className="text-xs text-slate-500 mt-1">Click a block to add it to your canvas.</p>
        </div>
        <div className="p-4 flex flex-col gap-3">
          {AVAILABLE_BLOCKS.map((b) => (
            <button
              key={b.type}
              onClick={() => onAddBlock({ id: uuidv4(), type: b.type, settings: b.defaultSettings })}
              className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary hover:bg-primary/5 transition-all text-left"
            >
              <div className="p-2 bg-slate-100 rounded text-slate-600">{b.icon}</div>
              <div className="font-medium text-sm text-slate-700">{b.label}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const { id, type, settings } = selectedBlock;

  const updateSetting = (key: string, value: any) => {
    onUpdateBlock(id, { ...settings, [key]: value });
  };

  const renderSettings = () => {
    switch (type) {
      case 'HEADER':
        return (
          <>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Organization Details</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><Label>Show Logo</Label><input type="checkbox" checked={settings.showLogo} onChange={(e) => updateSetting('showLogo', e.target.checked)} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" /></div>
                  <div className="flex items-center justify-between"><Label>Show Name</Label><input type="checkbox" checked={settings.showOrgName} onChange={(e) => updateSetting('showOrgName', e.target.checked)} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" /></div>
                  <div className="flex items-center justify-between"><Label>Show Address</Label><input type="checkbox" checked={settings.showOrgAddress} onChange={(e) => updateSetting('showOrgAddress', e.target.checked)} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" /></div>
                  <div className="flex items-center justify-between"><Label>Show Tax ID (GST/PAN)</Label><input type="checkbox" checked={settings.showOrgTaxId} onChange={(e) => updateSetting('showOrgTaxId', e.target.checked)} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" /></div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Invoice Details</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between"><Label>Show Invoice Number</Label><input type="checkbox" checked={settings.showInvoiceNumber} onChange={(e) => updateSetting('showInvoiceNumber', e.target.checked)} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" /></div>
                  <div className="flex items-center justify-between"><Label>Show Date</Label><input type="checkbox" checked={settings.showDate} onChange={(e) => updateSetting('showDate', e.target.checked)} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" /></div>
                  <div className="flex items-center justify-between"><Label>Show Due Date</Label><input type="checkbox" checked={settings.showDueDate} onChange={(e) => updateSetting('showDueDate', e.target.checked)} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" /></div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <Label className="mb-2 block">Layout Style</Label>
                <select 
                  className="w-full border rounded-md p-2 text-sm mb-4 bg-white"
                  value={settings.layout || 'logo_left'}
                  onChange={(e) => updateSetting('layout', e.target.value)}
                >
                  <option value="logo_left">Logo Left, Details Right</option>
                  <option value="logo_right">Logo Right, Details Left</option>
                  <option value="centered">Centered</option>
                </select>
                <Label className="mb-2 block">Primary Color</Label>
                <div className="flex items-center gap-2">
                  <Input type="color" value={settings.primaryColor || '#000000'} onChange={(e) => updateSetting('primaryColor', e.target.value)} className="w-12 p-1 h-9" />
                  <Input type="text" value={settings.primaryColor || '#000000'} onChange={(e) => updateSetting('primaryColor', e.target.value)} className="flex-1 font-mono text-sm" />
                </div>
              </div>
            </div>
          </>
        );
      case 'CLIENT_INFO':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between"><Label>Show Address</Label><input type="checkbox" checked={settings.showClientAddress} onChange={(e) => updateSetting('showClientAddress', e.target.checked)} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" /></div>
              <div className="flex items-center justify-between"><Label>Show Tax ID</Label><input type="checkbox" checked={settings.showClientTaxId} onChange={(e) => updateSetting('showClientTaxId', e.target.checked)} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" /></div>
              <div className="flex items-center justify-between"><Label>Show Project/WO</Label><input type="checkbox" checked={settings.showProjectInfo} onChange={(e) => updateSetting('showProjectInfo', e.target.checked)} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" /></div>
            </div>
            <div className="pt-4 border-t">
              <Label className="mb-2 block">Background Color</Label>
              <div className="flex items-center gap-2">
                <Input type="color" value={settings.bgColor || '#f8fafc'} onChange={(e) => updateSetting('bgColor', e.target.value)} className="w-12 p-1 h-9" />
                <Input type="text" value={settings.bgColor || '#f8fafc'} onChange={(e) => updateSetting('bgColor', e.target.value)} className="flex-1 font-mono text-sm" />
              </div>
            </div>
          </div>
        );
      case 'LINE_ITEMS':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between"><Label>Show HSN/SAC Column</Label><input type="checkbox" checked={settings.showHsn} onChange={(e) => updateSetting('showHsn', e.target.checked)} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" /></div>
              <div className="flex items-center justify-between"><Label>Show Tax % Column</Label><input type="checkbox" checked={settings.showTaxRate} onChange={(e) => updateSetting('showTaxRate', e.target.checked)} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" /></div>
            </div>
            <div className="pt-4 border-t">
              <Label className="mb-2 block">Header Background Color</Label>
              <div className="flex items-center gap-2">
                <Input type="color" value={settings.headerColor || '#f1f5f9'} onChange={(e) => updateSetting('headerColor', e.target.value)} className="w-12 p-1 h-9" />
                <Input type="text" value={settings.headerColor || '#f1f5f9'} onChange={(e) => updateSetting('headerColor', e.target.value)} className="flex-1 font-mono text-sm" />
              </div>
            </div>
          </div>
        );
      case 'TOTALS':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between"><Label>Show Amount In Words</Label><input type="checkbox" checked={settings.showAmountInWords} onChange={(e) => updateSetting('showAmountInWords', e.target.checked)} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" /></div>
            </div>
            <div className="pt-4 border-t">
              <Label className="mb-2 block">Grand Total Background</Label>
              <div className="flex items-center gap-2">
                <Input type="color" value={settings.totalsBgColor || '#f8fafc'} onChange={(e) => updateSetting('totalsBgColor', e.target.value)} className="w-12 p-1 h-9" />
                <Input type="text" value={settings.totalsBgColor || '#f8fafc'} onChange={(e) => updateSetting('totalsBgColor', e.target.value)} className="flex-1 font-mono text-sm" />
              </div>
            </div>
          </div>
        );
      case 'FOOTER':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between"><Label>Show Terms & Notes</Label><input type="checkbox" checked={settings.showTerms} onChange={(e) => updateSetting('showTerms', e.target.checked)} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" /></div>
              <div className="flex items-center justify-between"><Label>Show Signature Image</Label><input type="checkbox" checked={settings.showSignature} onChange={(e) => updateSetting('showSignature', e.target.checked)} className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary" /></div>
            </div>
            <div className="pt-4 border-t">
              <Label className="mb-2 block">Custom Footer Text</Label>
              <textarea
                className="w-full border rounded-md p-2 text-sm"
                rows={3}
                value={settings.customText || ''}
                onChange={(e) => updateSetting('customText', e.target.value)}
                placeholder="e.g., Thank you for your business!"
              />
            </div>
          </div>
        );
      case 'SPACER':
        return (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Height (px)</Label>
              <Input type="number" min="10" max="300" value={settings.height || 30} onChange={(e) => updateSetting('height', parseInt(e.target.value))} />
            </div>
          </div>
        );
      case 'TEXT':
        return (
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Content</Label>
              <textarea
                className="w-full border rounded-md p-2 text-sm"
                rows={4}
                value={settings.content || ''}
                onChange={(e) => updateSetting('content', e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-2 block">Alignment</Label>
              <select
                className="w-full border rounded-md p-2 text-sm"
                value={settings.align || 'left'}
                onChange={(e) => updateSetting('align', e.target.value)}
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
            <div className="pt-4 border-t">
              <Label className="mb-2 block">Text Color</Label>
              <div className="flex items-center gap-2">
                <Input type="color" value={settings.color || '#334155'} onChange={(e) => updateSetting('color', e.target.value)} className="w-12 p-1 h-9" />
              </div>
            </div>
          </div>
        );
      default:
        return <div>No settings available</div>;
    }
  };

  return (
    <div className="w-80 bg-white border-l flex flex-col h-full overflow-y-auto">
      <div className="p-4 border-b bg-slate-50">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 capitalize">{type.replace('_', ' ').toLowerCase()} Settings</h3>
        </div>
        <p className="text-xs text-slate-500 mt-1">Configure block appearance</p>
      </div>
      <div className="p-4">
        {renderSettings()}
      </div>
    </div>
  );
}
