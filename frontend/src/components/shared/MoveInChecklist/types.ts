export interface ChecklistItem {
  id: string;
  name: string;
  status: 'good' | 'damaged' | 'needs_repair';
  note: string;
  photo?: string;
}

export interface MoveInChecklistProps {
  lang: 'th' | 'en' | 'cn';
  propertyName: string;
  contractId?: string; // Optional contract ID to verify status
}

export interface ChecklistItemsListProps {
  lang: 'th' | 'en' | 'cn';
  items: ChecklistItem[];
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, field: keyof ChecklistItem, value: any) => void;
  handlePhotoUpload: (id: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export interface ChecklistSignaturePadProps {
  lang: 'th' | 'en' | 'cn';
  signatureImage: string | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isDrawing: boolean;
  startDrawing: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  clearCanvas: () => void;
  saveSignature: () => void;
}
