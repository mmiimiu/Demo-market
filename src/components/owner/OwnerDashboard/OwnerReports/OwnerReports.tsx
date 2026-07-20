'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, BarChart2, Loader2, CheckCircle2 } from 'lucide-react';
import { ReportCard } from './components/ReportCard';
import { ReportTable } from './components/ReportTable';
import { useReportExport } from './hooks/useReportExport';
import { OwnerReportsProps, MOCK_REPORT_DATA, MONTHS_TH, MONTHS_EN } from './types';

export function OwnerReports({ lang, properties = [] }: OwnerReportsProps) {
  const isThai = lang === 'th';
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const totalRevenue = MOCK_REPORT_DATA.filter(r => r.status === (isThai ? 'ชำระแล้ว' : 'Paid')).reduce((s, r) => s + r.amount, 0);
  const paidCount = MOCK_REPORT_DATA.filter(r => r.status === 'ชำระแล้ว').length;
  const overdueCount = MOCK_REPORT_DATA.filter(r => r.status === 'ค้างชำระ').length;

  const {
    exportingPdf,
    exportingExcel,
    exported,
    handleExportPdf,
    handleExportExcel,
  } = useReportExport(selectedMonth, selectedYear, totalRevenue, paidCount, overdueCount, MOCK_REPORT_DATA);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-gray-600" />
            {isThai ? 'รายงานรายเดือน' : 'Monthly Reports'}
          </h3>
          <p className="text-sm text-gray-500 font-medium mt-0.5">
            {isThai ? 'ส่งออกรายงานรายรับในรูปแบบ PDF หรือ Excel' : 'Export revenue reports as PDF or Excel'}
          </p>
        </div>

        {/* Month + Year Selector */}
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="border border-gray-200 rounded-none px-3 py-2 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/30"
          >
            {(isThai ? MONTHS_TH : MONTHS_EN).map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(Number(e.target.value))}
            className="border border-gray-200 rounded-none px-3 py-2 text-sm font-medium text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/30"
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        <ReportCard
          label={isThai ? 'รายรับรวม' : 'Total Revenue'}
          value={`฿${totalRevenue.toLocaleString()}`}
          trend={`+5.7% ${isThai ? 'จากเดือนก่อน' : 'vs last month'}`}
          colorClass="text-gray-900"
          bgColorClass="bg-gray-50"
        />
        <ReportCard
          label={isThai ? 'ชำระแล้ว' : 'Paid'}
          value={`${paidCount}/${MOCK_REPORT_DATA.length}`}
          colorClass="text-gray-900"
          bgColorClass="bg-gray-50"
        />
        <ReportCard
          label={isThai ? 'ค้างชำระ' : 'Overdue'}
          value={`${overdueCount}`}
          colorClass="text-gray-900"
          bgColorClass="bg-gray-50"
        />
      </div>

      <ReportTable data={MOCK_REPORT_DATA} selectedMonth={selectedMonth} selectedYear={selectedYear} isThai={isThai} />

      {/* Export Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={handleExportPdf}
          disabled={exportingPdf}
          className="flex-1 h-12 rounded-none bg-gray-900 hover:bg-gray-800 text-white font-medium gap-2"
        >
          {exportingPdf ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> กำลังสร้าง PDF...</>
          ) : exported === 'pdf' ? (
            <><CheckCircle2 className="w-4 h-4" /> {isThai ? 'ดาวน์โหลดแล้ว!' : 'Downloaded!'}</>
          ) : (
            <><FileText className="w-4 h-4" /> {isThai ? '📄 ดาวน์โหลด PDF' : '📄 Download PDF'}</>
          )}
        </Button>
        <Button
          onClick={handleExportExcel}
          disabled={exportingExcel}
          variant="outline"
          className="flex-1 h-12 rounded-none border-2 border-gray-900 text-gray-900 hover:bg-gray-50 font-medium gap-2"
        >
          {exportingExcel ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> กำลังสร้าง Excel...</>
          ) : exported === 'excel' ? (
            <><CheckCircle2 className="w-4 h-4" /> {isThai ? 'ดาวน์โหลดแล้ว!' : 'Downloaded!'}</>
          ) : (
            <><Download className="w-4 h-4" /> {isThai ? '📊 ดาวน์โหลด Excel' : '📊 Download Excel'}</>
          )}
        </Button>
      </div>
    </div>
  );
}
