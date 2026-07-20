export const handleDownloadPDF = async (
  contract: any,
  contractId: string,
  template: any,
  TEMPLATES: any,
  toast: (opts: any) => void,
  lang: 'th' | 'en' | 'cn'
) => {
  const isTh = lang === 'th';
  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('RESIDENTIAL LEASE AGREEMENT', 105, 18, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Contract ID: ${contractId}  |  Template: ${TEMPLATES[template].label}`, 105, 24, { align: 'center' });
    doc.line(20, 30, 190, 30);

    doc.setFont('Helvetica', 'bold');
    doc.text('1. PROPERTY & PARTIES', 20, 40);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Property: ${contract.propertyName || 'N/A'}`, 25, 47);
    doc.text(`Owner ID: ${contract.ownerId || 'N/A'}`, 25, 53);
    doc.text(`Tenant ID: ${contract.tenantId || 'N/A'}`, 25, 59);

    doc.setFont('Helvetica', 'bold');
    doc.text('2. LEASE TERMS', 20, 70);
    doc.setFont('Helvetica', 'normal');
    doc.text(`Monthly Rent: THB ${Number(contract.monthlyRent || 0).toLocaleString()}`, 25, 77);
    doc.text(`Security Deposit: THB ${Number(contract.depositAmount || 0).toLocaleString()}`, 25, 83);
    doc.text(`Advance Rent: THB ${Number(contract.advanceRentAmount || 0).toLocaleString()}`, 25, 89);
    
    const { format } = await import('date-fns');
    const sDate = contract.startDate ? format(new Date(contract.startDate), 'dd MMMM yyyy') : 'N/A';
    const eDate = contract.endDate ? format(new Date(contract.endDate), 'dd MMMM yyyy') : 'N/A';
    doc.text(`Start Date: ${sDate}`, 25, 95);
    doc.text(`End Date: ${eDate}`, 25, 101);

    doc.line(20, 108, 190, 108);
    doc.setFont('Helvetica', 'bold');
    doc.text('3. E-SIGNATURE CONFIRMATION', 20, 118);

    let sigY = 128;
    const roles = ['tenant', 'owner'];
    if (contract.agentId) roles.push('agent');

    for (const r of roles) {
      const sig = contract.signatures?.[r];
      doc.setFont('Helvetica', 'bold');
      doc.text(`${r.toUpperCase()}:`, 25, sigY);
      doc.setFont('Helvetica', 'normal');
      if (sig) {
        doc.text(`Name: ${sig.name}`, 30, sigY + 6);
        doc.text(`Signed At: ${format(new Date(sig.signedAt), 'dd MMM yyyy HH:mm')}`, 30, sigY + 11);
        doc.text(`IP Address: ${sig.ipAddress}`, 30, sigY + 16);
        if (sig.signatureDataUrl && sig.signatureDataUrl.startsWith('data:image')) {
          try {
            doc.addImage(sig.signatureDataUrl, 'PNG', 30, sigY + 20, 60, 20);
            sigY += 50;
          } catch {
            sigY += 28;
          }
        } else {
          sigY += 28;
        }
      } else {
        doc.text('PENDING SIGNATURE (รอการลงนาม)', 30, sigY + 6);
        sigY += 20;
      }
    }

    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text('🔒 Digitally Secured & Encrypted by PrimeRent Digital Platform', 105, 280, { align: 'center' });

    doc.save(`Contract_${contractId}.pdf`);
    toast({ title: isTh ? 'ดาวน์โหลด PDF สำเร็จ' : 'PDF Downloaded', description: isTh ? 'สัญญาพร้อมลายเซ็นบันทึกเรียบร้อยแล้ว' : 'Contract with signatures saved.' });
  } catch (err: any) {
    toast({ variant: 'destructive', title: 'Download Failed', description: err.message });
  }
};

export const handleShareLine = async (
  lang: 'th' | 'en' | 'cn',
  setLinkCopied: React.Dispatch<React.SetStateAction<boolean>>,
  toast: (opts: any) => void
) => {
  const isTh = lang === 'th';
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const lineText = encodeURIComponent(
    isTh ? `📄 ลิงก์สัญญาเช่า (PrimeRent):\n${shareUrl}` : `📄 Lease Contract Link (PrimeRent):\n${shareUrl}`
  );
  try { await navigator.clipboard.writeText(shareUrl); } catch {}
  setLinkCopied(true);
  setTimeout(() => setLinkCopied(false), 2000);
  window.open(`https://line.me/R/msg/text/?${lineText}`, '_blank');
  toast({ title: isTh ? 'คัดลอกลิงก์แล้ว' : 'Link Copied', description: isTh ? 'ลิงก์สัญญาถูกคัดลอกและเปิด LINE แล้ว' : 'Contract link copied & LINE opened.' });
};
