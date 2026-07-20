import { useState } from 'react';
import type { Language } from '@/lib/types';

interface UseMaintenanceFormProps {
  lang: Language;
  propertyId: string;
  tenantId: string;
  onSubmitSuccess?: () => void;
}

export function useMaintenanceForm({ lang, propertyId, tenantId, onSubmitSuccess }: UseMaintenanceFormProps) {
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageMockUpload = () => {
    setImages(prev => [...prev, 'https://via.placeholder.com/150/e0e0e0/888888?text=Photo']);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue.trim()) return;

    setLoading(true);
    try {
      // Simulate API call to save maintenance request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(lang === 'th' ? 'ส่งเรื่องแจ้งซ่อมเรียบร้อยแล้ว' : 'Maintenance request submitted successfully');
      
      setIssue('');
      setDescription('');
      setImages([]);
      setPriority('medium');
      
      if (onSubmitSuccess) onSubmitSuccess();
    } catch (error) {
      alert('Error submitting request');
    } finally {
      setLoading(false);
    }
  };

  return {
    issue,
    setIssue,
    description,
    setDescription,
    priority,
    setPriority,
    images,
    loading,
    handleImageMockUpload,
    removeImage,
    handleSubmit
  };
}
