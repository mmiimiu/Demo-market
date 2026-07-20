import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ChecklistItem } from './types';

export const generateChecklistPDF = (
  propertyName: string,
  items: ChecklistItem[],
  signatureImage: string | null,
  onSave?: () => void
) => {
  const doc = new jsPDF();
  doc.setFontSize(22);
  doc.text('PrimeRent Move-in Checklist', 20, 20);
  doc.setFontSize(12);
  doc.text(`Property: ${propertyName}`, 20, 30);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 37);
  
  const tableData = items.map(item => [
    item.name,
    item.status.toUpperCase(),
    item.note || '-'
  ]);

  autoTable(doc, {
    startY: 45,
    head: [['Item', 'Status', 'Notes']],
    body: tableData,
    theme: 'grid',
  });

  if (signatureImage) {
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.text('Signature:', 20, finalY);
    doc.addImage(signatureImage, 'PNG', 20, finalY + 5, 50, 20);
  }

  doc.save(`Checklist_${propertyName}.pdf`);
  if (onSave) onSave();
};
