export interface Appointment {
  id: string;
  title: string;
  propertyId: string;
  propertyName: string;
  clientName: string;
  clientPhone?: string;
  date: Date;
  time: string;
  duration: number; // minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  location?: string;
}

export interface AppointmentFormData {
  title: string;
  propertyId: string;
  propertyName: string;
  clientName: string;
  clientPhone?: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
  location?: string;
}

export interface AppointmentSchedulerProps {
  lang: 'th' | 'en' | 'cn';
}
