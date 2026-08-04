'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, addDoc, doc, updateDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { useUser, useFirestore, useDoc, errorEmitter, FirestorePermissionError } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { Language, UserRole, Amenity, Property } from '@/lib/types';
import { translations } from '@/lib/translations';
import { ListingFormData } from './types';
import { useCredit } from '@/hooks/useCredit';
import { CREDIT_COSTS } from '@/lib/credit';
import { useImageUpload } from '@/hooks/useImageUpload';
import { logAudit } from '@/lib/audit';

export const useListingForm = (
  lang: Language,
  initialData?: Partial<Property>,
  propertyId?: string
) => {
  const t = translations[lang];
  const router = useRouter();
  const { user } = useUser();
  const db = useFirestore();
  const { creditBalance, spend } = useCredit();
  const { uploadImages, isUploading } = useImageUpload();
  const [loading, setLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>(initialData?.photos || []);
  const [nearbyInput, setNearbyInput] = useState('');
  const [nearbyPlaces, setNearbyPlaces] = useState<string[]>(initialData?.nearbyPlaces || []);
  const [mapPin, setMapPin] = useState<{ x: number, y: number } | null>(initialData?.mapPin || null);
  const [isLocating, setIsLocating] = useState(false);
  const [verifiedProperties, setVerifiedProperties] = useState<any[]>([]);

  const fetchVerifiedProperties = async () => {
    if (!user || user.isMock || !db) return;
    try {
      const q = query(
        collection(db, 'properties_verification'),
        where('uid', '==', user.uid),
        where('status', '==', 'approved')
      );
      const snapshot = await getDocs(q);
      const props = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setVerifiedProperties(props);
      if (props.length === 1 && !formData.deedNumber) {
        setFormData(prev => ({ ...prev, deedNumber: props[0].deedNumber, verifiedPropertyId: props[0].id }));
      }
    } catch (error) {
      console.error('Error fetching verified properties:', error);
    }
  };

  useEffect(() => {
    fetchVerifiedProperties();
  }, [user, db]);

  const { data: profile } = useDoc<{ role: UserRole }>(
    user && !user.isMock ? `users/${user.uid}` : null
  );
  
  const userRole = profile?.role || (user?.isMock ? 'agent' : 'landlord');

  const [formData, setFormData] = useState<ListingFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    price: initialData?.price?.toString() || '',
    type: initialData?.type || 'condo',
    location: initialData?.location || '',
    floor: initialData?.floor?.toString() || '',
    bed: initialData?.bed?.toString() || '1',
    bath: initialData?.bath?.toString() || '1',
    sqm: initialData?.sqm?.toString() || '30',
    deposit: initialData?.deposit?.toString() || '',
    contractTerm: initialData?.contractTerm?.toString() || '12',
    commonFee: initialData?.commonFee?.toString() || '',
    tour360Url: initialData?.tour360Url || '',
    amenities: initialData?.amenities || [] as Amenity[],
    commissionOffer: (initialData as any)?.commissionOffer || '',
    agentBrokerage: (initialData as any)?.agentBrokerage || '',
    deedNumber: (initialData as any)?.deedNumber || '',
    roomNumber: (initialData as any)?.roomNumber || '',
    waterRate: (initialData as any)?.waterRate?.toString() || '',
    electricityRate: (initialData as any)?.electricityRate?.toString() || '',
    internetIncluded: (initialData as any)?.internetIncluded || false,
  });

  const suggestedPlaces = lang === 'th' 
    ? ['ใกล้ BTS', 'ใกล้ MRT', 'เซเว่นหน้าปากซอย', 'ห้างสรรพสินค้า', 'มหาวิทยาลัย', 'โรงพยาบาล', 'ตลาดสด']
    : lang === 'cn' ? ['靠近 BTS', '靠近 MRT', '便利店', '购物中心', '大学', '医院', '市场'] : ['Near BTS', 'Near MRT', '7-Eleven', 'Shopping Mall', 'University', 'Hospital', 'Market'];

  const encodedLoc = encodeURIComponent(formData.location + (formData.location ? ", Thailand" : "Thailand"));
  const genericMapUrl = `https://maps.google.com/maps?q=${encodedLoc}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const slotsAvailable = 10 - photos.length;
    if (slotsAvailable <= 0) {
      toast({
        variant: "destructive",
        title: lang === 'th' ? "อัพโหลดรูปภาพได้สูงสุด 10 รูป" : "Maximum of 10 photos allowed",
      });
      return;
    }

    const filesToUpload = fileList.slice(0, slotsAvailable);

    try {
      const urls = await uploadImages(filesToUpload, 'properties');
      if (urls && urls.length > 0) {
        setPhotos(prev => [...prev, ...urls].slice(0, 10));
      } else {
        readLocalFiles(filesToUpload);
      }
    } catch (err) {
      console.warn('Cloudinary upload failed, falling back to base64:', err);
      readLocalFiles(filesToUpload);
    }
  };

  const readLocalFiles = (filesList: File[]) => {
    filesList.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result as string].slice(0, 10));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const toggleAmenity = (amenity: Amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a: Amenity) => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const addNearbyPlace = (e?: React.KeyboardEvent | React.MouseEvent, customValue?: string) => {
    if (e && 'key' in e && e.key !== 'Enter') return;
    if (e) e.preventDefault();
    
    const val = (customValue || nearbyInput).trim();
    if (val && !nearbyPlaces.includes(val)) {
      setNearbyPlaces([...nearbyPlaces, val]);
      if (!customValue) setNearbyInput('');
    }
  };

  const removeNearbyPlace = (place: string) => {
    setNearbyPlaces(nearbyPlaces.filter(p => p !== place));
  };

  const handleLocateMe = () => {
    setIsLocating(true);
    setTimeout(() => {
      setMapPin({ x: 50 + Math.random() * 10, y: 50 + Math.random() * 10 });
      setIsLocating(false);
      toast({
        title: lang === 'th' ? 'ดึงพิกัดปัจจุบันสำเร็จ' : lang === 'cn' ? '获取当前位置成功' : 'Location Found',
        description: lang === 'th' ? 'ระบบได้ระบุตำแหน่งของคุณบนแผนที่แล้ว' : lang === 'cn' ? '您的位置已在地图上标出' : 'Your current location has been pinned.'
      });
    }, 1500);
  };

  const handleSubmit = (e: React.FormEvent) => handleAction('publish', e);
  const handleSaveDraft = (e: React.FormEvent) => handleAction('draft', e);
  const handleSaveTemplate = (e: React.FormEvent, templateName: string, isPublicTemplate: boolean) => handleAction('template', e, { templateName, isPublicTemplate });

  const handleAction = (actionType: 'publish' | 'draft' | 'template', e?: React.FormEvent, templateOptions?: any) => {
    if (e) e.preventDefault();
    if (!user || !db) return;

    // Check free listing limit (first 3 listings are free)
    let publishedCount = 0;
    try {
      const stored = localStorage.getItem('primerent_mock_properties');
      const list = stored ? JSON.parse(stored) : [];
      publishedCount = list.filter((p: any) => p.ownerId === user.uid && p.status !== 'draft' && p.id !== propertyId).length;
    } catch (err) {
      console.error('Error counting published listings:', err);
    }
    const isFreeListing = publishedCount < 3;

    // Enforce credit check only after free limit is exceeded
    if (actionType === 'publish' && !propertyId && !isFreeListing && creditBalance < CREDIT_COSTS.POST_LISTING) {
      toast({
        variant: "destructive",
        title: lang === 'th' ? 'เครดิตไม่เพียงพอ' : 'Insufficient Credits',
        description: lang === 'th' 
          ? `คุณลงประกาศฟรีครบโควตา 3 ประกาศแล้ว ประกาศถัดไปใช้ ${CREDIT_COSTS.POST_LISTING} ₡ (ยอดปัจจุบัน: ${creditBalance} ₡)`
          : `Free limit (3) exceeded. Requires ${CREDIT_COSTS.POST_LISTING} ₡ to post. (Current: ${creditBalance} ₡)`
      });
      return;
    }
    
    // Skip photo requirement for drafts and templates
    if (actionType === 'publish' && !user?.isMock && photos.length < 5) {
      toast({
        variant: "destructive",
        title: t.upload_min_error,
      });
      return;
    }

    setLoading(true);

    const listingData = {
      ...formData,
      ownerId: user.uid,
      price: parseInt(formData.price),
      floor: parseInt(formData.floor) || 0,
      bed: parseInt(formData.bed),
      bath: parseInt(formData.bath),
      sqm: parseInt(formData.sqm),
      deposit: parseInt(formData.deposit) || 0,
      contractTerm: parseInt(formData.contractTerm) || 12,
      commonFee: parseInt(formData.commonFee) || 0,
      nearbyPlaces,
      mapPin,
      photos,
      waterRate: parseFloat(formData.waterRate) || 0,
      electricityRate: parseFloat(formData.electricityRate) || 0,
      internetIncluded: formData.internetIncluded,
      status: actionType === 'draft' ? 'draft' : 'pending',
      isTemplate: actionType === 'template',
      isPublicTemplate: templateOptions?.isPublicTemplate || false,
      templateName: templateOptions?.templateName || '',
      updatedAt: serverTimestamp(),
      createdAt: initialData ? initialData.createdAt : serverTimestamp(),
      name: formData.title,
      nameEn: formData.title,
      nameCn: formData.title,
      locationEn: formData.location,
      locationCn: formData.location,
      stars: 4,
      imageHint: 'thailand property',
      img: photos.length > 0 ? photos[0] : '',
      badge: '',
      // ✅ Verified: agent หรือ landlord ที่ผ่าน property verification
      isVerified: userRole === 'agent' || !!formData.deedNumber || !!((formData as any).verifiedPropertyId),
      listingMode: userRole === 'landlord' ? 'self-list' : 'agent',
    };

    if (user?.isMock) {
      const stored = localStorage.getItem('primerent_mock_properties');
      const list = stored ? JSON.parse(stored) : [];
      
      const newProp = {
        ...listingData,
        id: propertyId || `mock_prop_${Date.now()}`,
        updatedAt: new Date().toISOString(),
        createdAt: initialData ? initialData.createdAt : new Date().toISOString(),
        ownerId: user.uid
      };

      if (propertyId) {
        const idx = list.findIndex((p: any) => p.id === propertyId);
        if (idx !== -1) {
          list[idx] = newProp;
        }
      } else {
        list.push(newProp);
        if (actionType === 'publish') {
          if (isFreeListing) {
            toast({
              title: lang === 'th' ? 'ลงประกาศฟรี' : 'Free Listing Post',
              description: lang === 'th' 
                ? `ลงประกาศฟรีสิทธิ์สำหรับสมาชิกใหม่ (${publishedCount + 1}/3)` 
                : `Free listing privilege applied (${publishedCount + 1}/3)`
            });
          } else {
            spend(CREDIT_COSTS.POST_LISTING, `ลงประกาศใหม่: ${formData.title}`);
          }
        }
      }

      localStorage.setItem('primerent_mock_properties', JSON.stringify(list));
      
      logAudit(propertyId ? 'edit' : 'create', 'property', propertyId || newProp.id, user.uid, propertyId ? `แก้ไขประกาศ: ${formData.title} (จำลอง)` : `สร้างประกาศใหม่: ${formData.title} (จำลอง)`);

      toast({
        title: propertyId ? t.save_changes : t.create_listing,
        description: lang === 'th' ? 'ประกาศของคุณถูกบันทึกสำเร็จ (จำลอง)' : 'Your listing was successfully saved (Mock).'
      });
      
      router.push('/owner/dashboard');
      setLoading(false);
      return;
    }

    const action = propertyId 
      ? updateDoc(doc(db, 'properties', propertyId), listingData)
      : addDoc(collection(db, 'properties'), listingData);

    action
      .then((res) => {
        const docId = propertyId || (res as any)?.id || 'unknown';
        logAudit(propertyId ? 'edit' : 'create', 'property', docId, user.uid, propertyId ? `แก้ไขประกาศ: ${formData.title}` : `สร้างประกาศใหม่: ${formData.title}`);

        if (!propertyId && actionType === 'publish' && !isFreeListing) {
          spend(CREDIT_COSTS.POST_LISTING, `ลงประกาศใหม่: ${formData.title}`);
        }
        
        let successTitle = propertyId ? t.save_changes : t.create_listing;
        let successDesc = lang === 'th' ? 'ประกาศของคุณกำลังรอการตรวจสอบ' : lang === 'cn' ? '您的列表正在等待审核' : 'Your listing is pending review.';
        
        if (actionType === 'draft') {
          successTitle = lang === 'th' ? 'บันทึกร่างสำเร็จ' : 'Draft Saved';
          successDesc = lang === 'th' ? 'แบบร่างของคุณถูกบันทึกแล้ว' : 'Your draft has been saved.';
        } else if (actionType === 'template') {
          successTitle = lang === 'th' ? 'บันทึกเทมเพลตสำเร็จ' : 'Template Saved';
          successDesc = lang === 'th' ? 'เทมเพลตของคุณถูกบันทึกแล้ว' : 'Your template has been saved.';
        }

        toast({
          title: successTitle,
          description: successDesc
        });
        
        if (actionType === 'template') {
          // just reload the page or clear
          router.push('/owner/dashboard?tab=owner_properties');
        } else {
          router.push('/owner/dashboard');
        }
      })
      .catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: propertyId ? `/properties/${propertyId}` : '/properties',
          operation: propertyId ? 'update' : 'create',
          requestResourceData: listingData,
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => setLoading(false));
  };

  return {
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
    t,
    verifiedProperties,
  };
};
