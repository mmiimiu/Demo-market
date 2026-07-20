export interface TimeSlot { id: string; date: string; time: string; label: string; available: boolean; }
export interface CreateShowingPayload {
  agentId: string;
  tenantId: string;
  propertyId: string;
  proposedSlots: TimeSlot[];
  notes?: string;
}
