/**
 * Excel export logic for reports
 */

import { MONTHS_EN } from '../types';

export async function exportExcelReport(
  selectedMonth: number,
  selectedYear: number,
  totalRevenue: number,
  paidCount: number,
  overdueCount: number,
  reportData: any[]
) {
  const XLSX = await import('xlsx');
  const wsData = [
    [`PrimeRent — Monthly Report: ${MONTHS_EN[selectedMonth]} ${selectedYear}`],
    [],
    ['Tenant', 'Property', 'Amount (THB)', 'Date', 'Status', 'Reference ID'],
    ...reportData.map(r => [r.tenant, r.property, r.amount, r.date, r.status, r.ref]),
    [],
    ['', '', '', '', 'Total Revenue:', totalRevenue],
    ['', '', '', '', 'Paid:', paidCount],
    ['', '', '', '', 'Overdue:', overdueCount],
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [{ wch: 25 }, { wch: 30 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 20 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, `${MONTHS_EN[selectedMonth]} ${selectedYear}`);
  XLSX.writeFile(wb, `PrimeRent_Report_${MONTHS_EN[selectedMonth]}_${selectedYear}.xlsx`);
}
