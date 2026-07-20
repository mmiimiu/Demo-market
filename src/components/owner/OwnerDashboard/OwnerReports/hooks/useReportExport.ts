/**
 * Hook for handling report exports (PDF and Excel)
 */

import React from 'react';
import { exportPdfReport } from './pdfExport';
import { exportExcelReport } from './excelExport';

export function useReportExport(
  selectedMonth: number,
  selectedYear: number,
  totalRevenue: number,
  paidCount: number,
  overdueCount: number,
  reportData: any[]
) {
  const [exportingPdf, setExportingPdf] = React.useState(false);
  const [exportingExcel, setExportingExcel] = React.useState(false);
  const [exported, setExported] = React.useState<'pdf' | 'excel' | null>(null);

  const handleExportPdf = async () => {
    setExportingPdf(true);
    try {
      await exportPdfReport(selectedMonth, selectedYear, totalRevenue, paidCount, overdueCount, reportData);
      setExported('pdf');
      setTimeout(() => setExported(null), 3000);
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setExportingPdf(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      await exportExcelReport(selectedMonth, selectedYear, totalRevenue, paidCount, overdueCount, reportData);
      setExported('excel');
      setTimeout(() => setExported(null), 3000);
    } catch (e) {
      console.error('Excel export error:', e);
    } finally {
      setExportingExcel(false);
    }
  };

  return {
    exportingPdf,
    exportingExcel,
    exported,
    handleExportPdf,
    handleExportExcel,
  };
}
