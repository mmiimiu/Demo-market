const fs = require('fs');
let code = fs.readFileSync('tmp_ContractManager.tsx', 'utf8');

// 1. Add Save icon to lucide-react import
code = code.replace(
  'ChevronUp, Copy, Check, RotateCcw, Layers, Stamp',
  'ChevronUp, Copy, Check, RotateCcw, Layers, Stamp, Save'
);

// 2. Add Save button below Agent Checkbox
const agentCheckboxEnd = `        </span>\n      </div>`;
const saveButtonCode = `\n\n      {canEdit && (
        <div className="mt-6 mb-2">
          <Button 
            className="w-full bg-[#10B981] hover:bg-[#0d9668] text-white font-black py-6 rounded-xl text-[14px] shadow-lg shadow-emerald-500/20"
            onClick={async () => {
              try {
                const payload = {
                  contractId: contract.id,
                  startDate: editStartDate,
                  endDate: editEndDate,
                  monthlyRent: editMonthlyRent,
                  addendums: {
                    furniture: editAttachments.map(a => ({ item: a.title, penaltyPrice: Number(a.content) || 0 })),
                    others: []
                  },
                  updatedByRole: currentUserRole,
                  updatedByUid: 'web-user'
                };
                
                const res = await fetch('/api/contract/update', {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload)
                });
                
                if (res.ok) {
                  const updated = { ...contract, signatures: {}, status: 'pending_signatures' };
                  setContract(updated);
                  const stored = localStorage.getItem('contracts');
                  if (stored) {
                    const arr = JSON.parse(stored);
                    const cidx = arr.findIndex((c:any) => c.id === contract.id);
                    if (cidx !== -1) {
                      arr[cidx] = updated;
                      localStorage.setItem('contracts', JSON.stringify(arr));
                    }
                  }
                  toast({
                    title: isTh ? 'บันทึกสำเร็จ & ส่งแจ้งเตือนแล้ว' : 'Saved & Notified',
                    description: isTh ? 'ระบบเคลียร์ลายเซ็นและส่ง LINE แจ้งให้ทุกฝ่ายเซ็นใหม่แล้ว' : 'Signatures reset and LINE notification sent.',
                  });
                } else {
                  toast({ variant: 'destructive', title: 'Error', description: 'Failed to update contract.' });
                }
              } catch (e) {
                console.error(e);
                toast({ variant: 'destructive', title: 'Error', description: 'Network error.' });
              }
            }}
          >
            <Save className="w-5 h-5 mr-2" />
            {isTh ? 'บันทึกข้อมูลและส่งแจ้งเตือนให้ทุกฝ่ายเซ็นใหม่' : 'Save & Request New Signatures'}
          </Button>
        </div>
      )}`;

if (!code.includes('const payload = {')) {
    code = code.replace(agentCheckboxEnd, agentCheckboxEnd + saveButtonCode);
}

fs.writeFileSync('src/components/shared/ContractManager.tsx', code);
console.log('Patched successfully');
