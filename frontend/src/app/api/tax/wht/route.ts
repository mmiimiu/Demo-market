import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agentId = searchParams.get('agentId') || 'AG-88941';
  const role = searchParams.get('role') || 'agent';

  if (role === 'tenant') {
    return NextResponse.json({ error: 'Access denied: WHT Certificates are for Agents/Owners only' }, { status: 403 });
  }

  // Demo WHT 3% Certificate Data
  const whtData = {
    documentNo: 'WHT-2026-07-0041',
    issuedDate: '2026-07-15',
    agentId,
    agentName: 'สมชาย มั่งคั่ง (Agent)',
    taxId: '1-1004-99823-11-2',
    period: 'มิถุนายน 2026',
    grossCommission: 45000.0,
    whtRate: '3%',
    whtAmount: 1350.0,
    netPayout: 43650.0,
    downloadUrl: `/api/tax/wht/download?doc=WHT-2026-07-0041`,
  };

  return NextResponse.json({ success: true, data: whtData });
}
