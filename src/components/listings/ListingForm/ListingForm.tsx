'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { ListingFormProps } from './types';
import { useListingForm } from './useListingForm';
import { BasicInfoSection } from './BasicInfoSection';
import { DetailsSection } from './DetailsSection';
import { UtilitiesCostsSection } from './UtilitiesCostsSection';
import { PhotosMediaSection } from './PhotosMediaSection';
import { AmenitiesNearbySection } from './AmenitiesNearbySection';
import { DescriptionSection } from './DescriptionSection';
import { SafetyBanner } from './SafetyBanner';
import { SubmitButton } from './SubmitButton';
import { TemplateSelectorModal } from './TemplateSelectorModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FileText, Save, LayoutTemplate } from 'lucide-react';

export function ListingForm({ lang, initialData, propertyId }: ListingFormProps) {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = React.useState(false);
  const [showTemplateSaveForm, setShowTemplateSaveForm] = React.useState(false);
  const [templateName, setTemplateName] = React.useState('');
  const [isPublicTemplate, setIsPublicTemplate] = React.useState(false);
  const {
    loading,
    isUploading,
    photos,
    handlePhotoUpload,
    removePhoto,
    nearbyInput,
    setNearbyInput,
    nearbyPlaces,
    addNearbyPlace,
    removeNearbyPlace,
    isLocating,
    handleLocateMe,
    formData,
    setFormData,
    userRole,
    suggestedPlaces,
    encodedLoc,
    genericMapUrl,
    handleSubmit,
    handleSaveDraft,
    handleSaveTemplate,
    t,
    verifiedProperties,
  } = useListingForm(lang, initialData, propertyId);

  const isTh = lang === 'th';

  return (
    <div className={cn(
      "max-w-4xl mx-auto p-6 lg:p-10 space-y-10",
      lang === 'cn' ? "font-chinese" : lang === 'th' ? "font-thai" : "font-english"
    )}>
      <div className="text-center relative">
        <h1 className="text-4xl font-black text-slate-900 mb-2">
          {propertyId ? t.edit_listing : t.create_listing}
        </h1>
        <p className="text-slate-500 font-medium">
          {lang === 'th' ? 'ลงประกาศที่พักของคุณให้ผู้เช่านับหมื่นเห็นได้ฟรี' : lang === 'cn' ? '免费发布您的房源，触达数万租客' : 'Post your property to reach thousands of tenants for free.'}
        </p>

        {!propertyId && (
          <div className="mt-6 flex justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsTemplateModalOpen(true)}
              className="rounded-xl border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-50 hover:text-indigo-700"
            >
              <LayoutTemplate className="w-4 h-4 mr-2" />
              {isTh ? 'เลือกจากเทมเพลต' : 'Use Template'}
            </Button>
          </div>
        )}
      </div>

      <TemplateSelectorModal 
        isOpen={isTemplateModalOpen} 
        onClose={() => setIsTemplateModalOpen(false)} 
        onSelect={(data) => {
          setFormData(prev => ({ ...prev, ...data }));
          setIsTemplateModalOpen(false);
        }}
        lang={lang} 
      />

      <form noValidate onSubmit={(e) => {
        e.preventDefault();
        handleSubmit(e);
      }} className="space-y-8">
        
        {/* Basic Info Section */}
        <Card className="glass-card premium-shadow border-none rounded-2xl overflow-hidden">
          <CardContent className="p-8 sm:p-10">
            <h2 className="text-2xl font-black text-slate-900 mb-6">
              {lang === 'th' ? 'ข้อมูลพื้นฐาน' : lang === 'cn' ? '基本信息' : 'Basic Info'}
            </h2>
            <BasicInfoSection 
              formData={formData} 
              setFormData={setFormData} 
              t={t} 
              lang={lang} 
              verifiedProperties={verifiedProperties}
            />
          </CardContent>
        </Card>

        {/* Details & Costs Section */}
        <Card className="glass-card premium-shadow border-none rounded-2xl overflow-hidden">
          <CardContent className="p-8 sm:p-10">
            <h2 className="text-2xl font-black text-slate-900 mb-6">
              {lang === 'th' ? 'รายละเอียด' : lang === 'cn' ? '详情与费用' : 'Details & Costs'}
            </h2>
            <div className="space-y-12">
              <DetailsSection formData={formData} setFormData={setFormData} userRole={userRole} lang={lang} t={t} />
              <hr className="border-slate-100" />
              <UtilitiesCostsSection formData={formData} setFormData={setFormData} lang={lang} />
            </div>
          </CardContent>
        </Card>

        {/* Photos Section */}
        <Card className="glass-card premium-shadow border-none rounded-2xl overflow-hidden">
          <CardContent className="p-8 sm:p-10">
            <h2 className="text-2xl font-black text-slate-900 mb-6">
              {lang === 'th' ? 'รูปภาพ' : lang === 'cn' ? '照片' : 'Photos'}
            </h2>
            <PhotosMediaSection 
              photos={photos} 
              handlePhotoUpload={handlePhotoUpload} 
              removePhoto={removePhoto} 
              t={t} 
              isUploading={isUploading}
              tour360Url={formData.tour360Url}
              onTour360Change={(url) => setFormData(prev => ({ ...prev, tour360Url: url }))}
            />
          </CardContent>
        </Card>

        {/* Amenities Section */}
        <Card className="glass-card premium-shadow border-none rounded-2xl overflow-hidden">
          <CardContent className="p-8 sm:p-10">
            <h2 className="text-2xl font-black text-slate-900 mb-6">
              {lang === 'th' ? 'สิ่งอำนวยความสะดวก' : lang === 'cn' ? '设施' : 'Amenities'}
            </h2>
            <AmenitiesNearbySection 
              formData={formData}
              toggleAmenity={(amenity) => {
                setFormData(prev => ({
                  ...prev,
                  amenities: prev.amenities.includes(amenity)
                    ? prev.amenities.filter((a) => a !== amenity)
                    : [...prev.amenities, amenity]
                }));
              }}
              nearbyInput={nearbyInput}
              setNearbyInput={setNearbyInput}
              nearbyPlaces={nearbyPlaces}
              addNearbyPlace={addNearbyPlace}
              removeNearbyPlace={removeNearbyPlace}
              suggestedPlaces={suggestedPlaces}
              handleLocateMe={handleLocateMe}
              isLocating={isLocating}
              genericMapUrl={genericMapUrl}
              encodedLoc={encodedLoc}
              lang={lang}
              t={t}
            />
          </CardContent>
        </Card>

        {/* Description Section */}
        <Card className="glass-card premium-shadow border-none rounded-2xl overflow-hidden">
          <CardContent className="p-8 sm:p-10">
            <h2 className="text-2xl font-black text-slate-900 mb-6">
              {lang === 'th' ? 'คำอธิบาย' : lang === 'cn' ? '描述' : 'Description'}
            </h2>
            <DescriptionSection formData={formData} setFormData={setFormData} lang={lang} t={t} />
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex flex-col items-center gap-4 pt-4">
          <div className="w-full max-w-lg flex flex-col sm:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1 rounded-xl font-bold border-gray-200 hover:bg-gray-50 h-12"
              onClick={(e) => handleSaveDraft(e)}
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {isTh ? 'บันทึกฉบับร่าง' : 'Save Draft'}
            </Button>
            
            <div className="flex-1">
              <SubmitButton loading={loading} t={t} />
            </div>
          </div>

          <div className="w-full max-w-lg pt-4 border-t border-gray-100 flex flex-col items-center">
            {!showTemplateSaveForm ? (
              <Button 
                type="button" 
                variant="ghost" 
                className="text-gray-500 font-bold hover:text-indigo-600 hover:bg-indigo-50 rounded-xl"
                onClick={() => setShowTemplateSaveForm(true)}
              >
                <FileText className="w-4 h-4 mr-2" />
                {isTh ? 'บันทึกเป็นเทมเพลต' : 'Save as Template'}
              </Button>
            ) : (
              <div className="w-full p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-4">
                <div>
                  <Label className="font-bold text-gray-700">{isTh ? 'ชื่อเทมเพลต' : 'Template Name'}</Label>
                  <Input 
                    placeholder={isTh ? 'เช่น รูปแบบคอนโดพร้อมอยู่ 1 ห้องนอน' : 'e.g., Fully Furnished 1BR'} 
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100">
                  <div>
                    <Label className="font-bold text-gray-700">{isTh ? 'แชร์สาธารณะ' : 'Public Template'}</Label>
                    <p className="text-xs text-gray-500">{isTh ? 'ให้ผู้ใช้อื่นสามารถนำเทมเพลตนี้ไปใช้ได้' : 'Allow other users to use this template'}</p>
                  </div>
                  <Switch checked={isPublicTemplate} onCheckedChange={setIsPublicTemplate} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowTemplateSaveForm(false)} className="rounded-lg font-bold">
                    {isTh ? 'ยกเลิก' : 'Cancel'}
                  </Button>
                  <Button 
                    type="button" 
                    size="sm"
                    disabled={!templateName.trim() || loading}
                    className="rounded-lg font-bold bg-indigo-600 hover:bg-indigo-700"
                    onClick={(e) => {
                      handleSaveTemplate(e, templateName, isPublicTemplate);
                      setShowTemplateSaveForm(false);
                    }}
                  >
                    {isTh ? 'บันทึกเทมเพลต' : 'Save Template'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <SafetyBanner t={t} />
      </form>
    </div>
  );
}
