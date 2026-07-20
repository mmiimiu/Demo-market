import { WarningData } from './types';

export const exportNoticeToPDF = async (warningData: WarningData, signatureUrl: string | null) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Header Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('ARREARS WARNING & PAYMENT DEMAND', 105, 20, { align: 'center' });
  doc.line(20, 26, 190, 26);

  // Metadata
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Written Date: ${new Date().toLocaleDateString()}`, 190, 34, { align: 'right' });
  doc.text(`Subject: Late Rent Payment Demand & Eviction Warning`, 20, 42);
  doc.text(`Tenant Name: ${warningData.tenantName}`, 20, 48);
  doc.text(`Property Reference: ${warningData.propertyName} (Room No. ${warningData.roomNo})`, 20, 54);
  doc.line(20, 60, 190, 60);

  // Content body
  doc.setFont('Helvetica', 'bold');
  doc.text('DEMAND BREAKDOWN:', 20, 70);

  doc.setFont('Helvetica', 'normal');
  let y = 78;
  const items = [
    { label: 'Monthly Rent', amount: warningData.rent },
    { label: 'Common Fee', amount: warningData.commonFee },
    { label: 'Water Usage', amount: warningData.water },
    { label: 'Electricity Usage', amount: warningData.electricity },
  ];

  items.forEach(item => {
    doc.text(item.label, 25, y);
    doc.text(`THB ${item.amount.toLocaleString()}`, 190, y, { align: 'right' });
    y += 7;
  });

  doc.line(20, y + 2, 190, y + 2);
  doc.setFont('Helvetica', 'bold');
  doc.text('TOTAL NET ARREARS:', 25, y + 9);
  doc.text(`THB ${warningData.total.toLocaleString()}`, 190, y + 9, { align: 'right' });

  // Legal wording
  y += 22;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9.5);
  const text1 = `You are hereby notified that you are in default of your lease agreement for the period of ${warningData.billingMonth} (which was due on ${warningData.dueDate}). Your rent is currently overdue by ${warningData.daysOverdue} days.`;
  const text2 = `Demand is hereby made that you pay the total outstanding sum of THB ${warningData.total.toLocaleString()} within 7 (seven) days of receipt of this warning letter.`;
  const text3 = `Failure to clear the arrears within 7 days will result in the immediate termination of the lease agreement, subsequent eviction of all occupants from the premises, and legal proceedings to recover all outstanding balances and penalties.`;

  const split1 = doc.splitTextToSize(text1, 170);
  const split2 = doc.splitTextToSize(text2, 170);
  const split3 = doc.splitTextToSize(text3, 170);

  doc.text(split1, 20, y);
  y += split1.length * 5 + 3;
  doc.text(split2, 20, y);
  y += split2.length * 5 + 3;
  doc.setFont('Helvetica', 'bold');
  doc.text(split3, 20, y);
  y += split3.length * 5 + 15;

  // Signature
  doc.setFont('Helvetica', 'normal');
  doc.text('Sincerely,', 140, y);
  if (signatureUrl && signatureUrl.startsWith('data:image')) {
    try {
      doc.addImage(signatureUrl, 'PNG', 135, y + 4, 45, 15);
      y += 20;
    } catch {
      y += 8;
    }
  } else {
    doc.text('(Unsigned / Online Draft)', 140, y + 8);
    y += 12;
  }
  doc.text('( Landlord / Owner )', 140, y + 4);

  // Save the file
  doc.save(`Warning_Notice_${warningData.tenantName.replace(/\s+/g, '_')}.pdf`);
};
