export interface DelegationAgreement {
  id: string;
  propertyId: number;
  propertyName: string;
  ownerId: string;
  ownerName: string;
  ownerSignature: string | null;
  agentId: string;
  agentName: string;
  agentSignature: string | null;
  commissionRate: number;
  status: 'pending_agent_signature' | 'pending_owner_signature' | 'active';
  createdAt: string;
  repostedAt?: string;
  repostId?: string;
  monthKey?: string;
}

export interface DelegationsTabProps {
  lang: 'th' | 'en' | 'cn';
  currentRole: 'landlord' | 'agent' | 'user' | 'renter' | 'admin' | 'owner' | 'superadmin' | 'sa';
  currentUser: any;
}
