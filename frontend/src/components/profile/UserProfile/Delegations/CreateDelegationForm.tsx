'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Send } from 'lucide-react';

export const MOCK_AGENTS = [
  { id: 'mock-agent-1', name: 'สมชาย มืออาชีพ (Agent)' },
  { id: 'agent-2', name: 'วิชัย โบรกเกอร์ (Agent)' },
];

interface CreateDelegationFormProps {
  lang: 'th' | 'en' | 'cn';
  onSubmit: (propertyName: string, agentId: string, commission: number) => void;
  onCancel: () => void;
}

export function CreateDelegationForm({ lang, onSubmit, onCancel }: CreateDelegationFormProps) {
  const isTh = lang === 'th';
  const [selectedProperty, setSelectedProperty] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState(MOCK_AGENTS[0].id);
  const [commission, setCommission] = useState(10);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(selectedProperty, selectedAgentId, commission);
  };

  return (
    <Card className="max-w-md mx-auto border-none shadow-xl rounded-none">
      <CardHeader>
        <CardTitle className="text-lg font-black">
          {isTh ? 'แต่งตั้งตัวแทนดูแลห้องพัก' : 'Delegate Property Care'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-500 uppercase">{isTh ? 'ชื่อห้องพัก/อสังหาริมทรัพย์' : 'Property Name'}</label>
            <input
              placeholder="Condo Asoke 2BR"
              value={selectedProperty}
              onChange={e => setSelectedProperty(e.target.value)}
              className="w-full h-11 border px-3 text-sm focus:outline-none"
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-500 uppercase">{isTh ? 'เลือกตัวแทนนายหน้า (Agent)' : 'Select Agent'}</label>
            <select
              value={selectedAgentId}
              onChange={e => setSelectedAgentId(e.target.value)}
              className="w-full h-11 border px-3 text-sm focus:outline-none bg-white"
            >
              {MOCK_AGENTS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-black text-gray-500 uppercase">{isTh ? 'อัตราค่าคอมมิชชั่นดูแล (%)' : 'Care Commission (%)'}</label>
            <input
              type="number"
              min={1}
              max={50}
              value={commission}
              onChange={e => setCommission(parseInt(e.target.value) || 10)}
              className="w-full h-11 border px-3 text-sm focus:outline-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-none">
              {isTh ? 'ยกเลิก' : 'Cancel'}
            </Button>
            <Button type="submit" className="flex-1 bg-primary text-white font-bold rounded-none">
              <Send className="w-4 h-4 mr-2" />
              {isTh ? 'ส่งสัญญา' : 'Send Agreement'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
