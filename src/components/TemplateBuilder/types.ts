export type BlockType = 'HEADER' | 'CLIENT_INFO' | 'LINE_ITEMS' | 'TOTALS' | 'FOOTER' | 'SPACER' | 'TEXT';

export interface BlockConfig {
  id: string;
  type: BlockType;
  settings: Record<string, any>;
}

export interface TemplateBuilderProps {
  initialConfig?: BlockConfig[] | null;
  onSave: (htmlContent: string, designConfig: BlockConfig[]) => Promise<void>;
  onClose: () => void;
  assets: any[];
}
