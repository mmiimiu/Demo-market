'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { ContractTemplate, AuditEvent } from './types';
import { MOCK_AUDIT_LOG, DEFAULT_ATTACHMENTS } from './constants';

export function useContractData(contractId: string, forceRole?: 'tenant' | 'owner' | 'agent') {
  const { user } = useUser();
  const db = useFirestore();
  const { data: dbContract, loading: dbLoading } = useDoc<any>(
    db && user && !user.isMock && contractId ? `contracts/${contractId}` : null
  );

  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<ContractTemplate>('monthly');
  const [auditLog, setAuditLog] = useState<AuditEvent[]>(MOCK_AUDIT_LOG);

  const [editMonthlyRent, setEditMonthlyRent] = useState('');
  const [editDepositAmount, setEditDepositAmount] = useState('');
  const [editAdvanceRentAmount, setEditAdvanceRentAmount] = useState('');
  const [editStartDate, setEditStartDate] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editAttachments, setEditAttachments] = useState<any[]>([]);
  const [editLandlordName, setEditLandlordName] = useState('');
  const [editTenantName, setEditTenantName] = useState('');
  const [editAgentName, setEditAgentName] = useState('');
  const [editPropertyName, setEditPropertyName] = useState('');
  const [renewalInputDate, setRenewalInputDate] = useState('');

  const loadContractData = useCallback(() => {
    if (user && !user.isMock && dbContract) {
      setContract(dbContract);
      setLoading(false);
      return;
    }
    
    let match = null;
    let contracts: any[] = [];
    const storedContracts = localStorage.getItem('contracts');
    if (storedContracts) {
      try {
        contracts = JSON.parse(storedContracts);
        match = contracts.find((c: any) => c.id === contractId);
      } catch (err) {
        console.error('Error parsing mock contracts:', err);
      }
    }

    if (match) {
      if (!match.attachments || match.attachments.length !== 2 || !match.attachments[0].type) {
        match.attachments = DEFAULT_ATTACHMENTS;
        const idx = contracts.findIndex((c: any) => c.id === contractId);
        if (idx !== -1) {
          contracts[idx] = match;
          localStorage.setItem('contracts', JSON.stringify(contracts));
        }
      }
      setContract(match);
    } else if (contractId.startsWith('mock_ctr_') || contractId === 'mock_ctr_1') {
      const simulated = {
        id: contractId,
        propertyId: '1',
        propertyName: 'คอนโดสุขุมวิท 101 ชั้น 12 ห้อง 1204',
        ownerId: 'owner_somyot',
        tenantId: 'tenant_tattap',
        monthlyRent: 18000,
        depositAmount: 36000,
        advanceRentAmount: 18000,
        startDate: '2026-07-01T00:00:00.000Z',
        endDate: '2027-06-30T00:00:00.000Z',
        signatures: {
          owner: {
            name: 'นาย สมชาย ใจดี (Owner)',
            signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqWDpaAAAACXBIWXMAAAsTAAALEwEAmpwYAAABeklEQVR4nO2aTWrDMBSFP6t9G12ErKI30E10IXkDOyvIDbILySr2bXSReAO5gS7C90Ukh1aUOMWx6sA9B4QY2Y9PT0+WnFJKHMdxHMdxHMdxHMdxHNvFDHAATg34vQMeO8H6gCPwZcHzG/gAps04rpg58ArMmsM34A54teC6KqaAM2C2OHqLzS7A1YLrq5gC1qT3M1uMvcf2DHgC7gU2xTADPAEPwLgYc1fR4o5U5lM8i78g64c7UrWfYm7HqvgLst7cqaobNlV2q/gNf7W4V3U/t1Z2q/gN99b4V3U/t1Z2q/gN32pxu25/Fv9a3Gpx72F/q8VdxW941uKeiz/E3I6L/Cnm6R1HqvhzzO24yL9int5xpIp+w18t7lXdL22q7FbxG77V4nbd/iz+tbiq7u/Wyq6K/9p7Vffzqaq+Kj1Wpcf2Lw8qPUyFh6XwYCo87ApPrsKjrvAkFZ5ChZeHrvA0FZ62wtNW+P8pjuM4juM4juM4juM4tuf4AQ+Yd6n2XwYJAAAAAElFTkSuQmCC',
            signedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            ipAddress: '182.52.12.98'
          },
          tenant: {
            name: 'นาย ณัฐพล ใจสู้ (Tenant)',
            signatureDataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAyCAYAAACqWDpaAAAACXBIWXMAAAsTAAALEwEAmpwYAAABeklEQVR4nO2aTWrDMBSFP6t9G12ErKI30E10IXkDOyvIDbILySr2bXSReAO5gS7C90Ukh1aUOMWx6sA9B4QY2Y9PT0+WnFJKHMdxHMdxHMdxHMdxHNvFDHAATg34vQMeO8H6gCPwZcHzG/gAps04rpg58ArMmsM34A54teC6KqaAM2C2OHqLzS7A1YLrq5gC1qT3M1uMvcf2DHgC7gU2xTADPAEPwLgYc1fR4o5U5lM8i78g64c7UrWfYm7HqvgLst7cqaobNlV2q/gNf7W4V3U/t1Z2q/gN99b4V3U/t1Z2q/gN32pxu25/Fv9a3Gpx72F/q8VdxW941uKeiz/E3I6L/Cnm6R1HqvhzzO24yL9int5xpIp+w18t7lXdL22q7FbxG77V4nbd/iz+tbiq7u/Wyq6K/9p7Vffzqaq+Kj1Wpcf2Lw8qPUyFh6XwYCo87ApPrsKjrvAkFZ5ChZeHrvA0FZ62wtNW+P8pjuM4juM4juM4juM4tuf4AQ+Yd6n2XwYJAAAAAElFTkSuQmCC',
            signedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            ipAddress: '49.228.45.112'
          }
        },
        attachments: DEFAULT_ATTACHMENTS,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setContract(simulated);
      contracts.push(simulated);
      localStorage.setItem('contracts', JSON.stringify(contracts));
    }
    setLoading(false);
  }, [dbContract, user, contractId]);

  useEffect(() => { loadContractData(); }, [loadContractData]);

  useEffect(() => {
    if (contract) {
      setEditMonthlyRent(contract.monthlyRent?.toString() || '');
      setEditDepositAmount(contract.depositAmount?.toString() || '');
      setEditAdvanceRentAmount(contract.advanceRentAmount?.toString() || '');
      const sDate = contract.startDate ? new Date(contract.startDate) : new Date();
      const eDate = contract.endDate ? new Date(contract.endDate) : new Date();
      setEditStartDate(sDate.toISOString().substring(0, 10));
      setEditEndDate(eDate.toISOString().substring(0, 10));

      if (contract.endDate) {
        const d = new Date(contract.endDate);
        d.setFullYear(d.getFullYear() + 1);
        setRenewalInputDate(d.toISOString().substring(0, 10));
      }

      setEditAttachments(contract.attachments?.length > 0 ? contract.attachments : []);
      setEditLandlordName(contract.landlordName || 'นาย สมชาย ใจดี');
      setEditTenantName(contract.tenantName || 'นาย ณัฐพล ใจสู้');
      setEditAgentName(contract.agentName || 'PrimeRent Agent');
      setEditPropertyName(contract.propertyName || 'คอนโดสุขุมวิท 101 ชั้น 12 ห้อง 1204');
      if (contract.template) setTemplate(contract.template);
      if (contract.auditLog) setAuditLog(contract.auditLog);
    }
  }, [contract]);

  const signaturesCount = Object.keys(contract?.signatures || {}).length;
  const isSigned = contract?.status === 'active';
  const currentUserRole = forceRole || (user?.isMock
    ? (localStorage.getItem('primerent_user_role') === 'owner' ? 'owner' : 'tenant')
    : (user?.uid === contract?.ownerId ? 'owner' : user?.uid === contract?.tenantId ? 'tenant' : 'agent'));

  return {
    contract, setContract, loading: loading || dbLoading, template, setTemplate, auditLog, setAuditLog,
    editMonthlyRent, setEditMonthlyRent, editDepositAmount, setEditDepositAmount,
    editAdvanceRentAmount, setEditAdvanceRentAmount, editStartDate, setEditStartDate,
    editEndDate, setEditEndDate, editAttachments, setEditAttachments, editLandlordName, setEditLandlordName,
    editTenantName, setEditTenantName, editAgentName, setEditAgentName, editPropertyName, setEditPropertyName,
    renewalInputDate, setRenewalInputDate, signaturesCount, isSigned, currentUserRole, user, db
  };
}
