'use client';

/**
 * @fileOverview MaintenanceForm Component
 * แบบฟอร์มแจ้งซ่อมสำหรับผู้เช่า (Tenant)
 */

import React from 'react';
import { Wrench, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Language } from '@/lib/types';
import { useMaintenanceForm } from './hooks/useMaintenanceForm';
import { MaintenancePhotoUpload } from './MaintenancePhotoUpload';
import { MaintenancePrioritySelector } from './MaintenancePrioritySelector';

interface MaintenanceFormProps {
  lang: Language;
  propertyId: string;
  tenantId: string;
  onSubmitSuccess?: () => void;
}

export const MaintenanceForm: React.FC<MaintenanceFormProps> = (props) => {
  const { lang } = props;
  const form = useMaintenanceForm(props);

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
          <Wrench className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900">
            {lang === 'th' ? 'แจ้งซ่อมบำรุง' : 'Maintenance Request'}
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">
            {lang === 'th' ? 'พบปัญหาในห้องพัก? แจ้งให้เจ้าของห้องทราบ' : 'Found an issue? Let the owner know.'}
          </p>
        </div>
      </div>

      <form onSubmit={form.handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {lang === 'th' ? 'หัวข้อปัญหา' : 'Issue Summary'} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.issue}
            onChange={(e) => form.setIssue(e.target.value)}
            placeholder={lang === 'th' ? 'เช่น แอร์ไม่เย็น, ท่อน้ำรั่ว' : 'e.g. AC not cooling'}
            className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-[#E51D53] focus:ring-2 focus:ring-[#E51D53]/20 transition-all font-medium text-gray-900"
          />
        </div>

        <MaintenancePrioritySelector priority={form.priority} setPriority={form.setPriority} lang={lang} />

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            {lang === 'th' ? 'รายละเอียดเพิ่มเติม' : 'Description'}
          </label>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => form.setDescription(e.target.value)}
            placeholder={lang === 'th' ? 'อธิบายปัญหาที่พบเพิ่มเติม...' : 'Describe the issue...'}
            className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-[#E51D53] focus:ring-2 focus:ring-[#E51D53]/20 transition-all font-medium text-gray-900 resize-none"
          />
        </div>

        <MaintenancePhotoUpload 
          images={form.images} 
          onUploadMock={form.handleImageMockUpload} 
          onRemove={form.removeImage} 
          lang={lang} 
        />

        <Button
          type="submit"
          disabled={form.loading || !form.issue.trim()}
          className="w-full h-14 rounded-2xl bg-[#E51D53] hover:bg-[#D41B4D] font-black text-lg text-white shadow-lg shadow-[#E51D53]/20 gap-2 mt-8"
        >
          {form.loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              {lang === 'th' ? 'ส่งรายการแจ้งซ่อม' : 'Submit Request'}
            </>
          )}
        </Button>
      </form>
    </div>
  );
};
