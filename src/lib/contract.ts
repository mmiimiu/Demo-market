/**
 * @fileOverview Contract Helper Module
 * จัดการโครงสร้างข้อมูลสัญญาเช่า (Digital Contract) และสถานะ E-Signature
 */

export type ContractStatus = 'draft' | 'pending_signatures' | 'active' | 'expired' | 'terminated';

export interface SignatureBlock {
  uid: string;
  name: string;
  role: 'owner' | 'tenant' | 'agent';
  signedAt?: Date;
  signatureDataUrl?: string; // base64 image from canvas
  ipAddress?: string;
}

export interface DigitalContract {
  id: string;
  propertyId: string;
  propertyName: string;
  
  // Parties involved
  ownerId: string;
  tenantId: string;
  agentId?: string; // Optional if no agent involved

  // Terms
  monthlyRent: number;
  depositAmount: number;
  advanceRentAmount: number;
  startDate: Date;
  endDate: Date;
  
  // Signatures state
  signatures: {
    owner?: SignatureBlock;
    tenant?: SignatureBlock;
    agent?: SignatureBlock;
  };
  
  // Attachments / Addendums
  addendums?: {
    furniture?: Array<{ item: string; penaltyPrice: number }>;
    others?: Array<{ title: string; content: string }>;
  };
  
  status: ContractStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * คำนวณสถานะของสัญญาว่าการเซ็นครบหรือยัง
 */
export function checkSignaturesComplete(contract: DigitalContract): boolean {
  const { signatures, agentId } = contract;
  
  const ownerSigned = !!signatures.owner?.signedAt;
  const tenantSigned = !!signatures.tenant?.signedAt;
  const agentSigned = agentId ? !!signatures.agent?.signedAt : true; // If no agent, count as true

  return ownerSigned && tenantSigned && agentSigned;
}

/**
 * อัปเดตสถานะสัญญาเป็น active ถ้าเซ็นครบทุกคน
 */
export function evaluateContractStatus(contract: DigitalContract): ContractStatus {
  if (contract.status === 'draft') return 'draft';
  if (contract.status === 'expired' || contract.status === 'terminated') return contract.status;

  if (checkSignaturesComplete(contract)) {
    return 'active';
  }
  
  return 'pending_signatures';
}
