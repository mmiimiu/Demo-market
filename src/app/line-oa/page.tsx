import React from 'react';
import { LineOASimulator } from '@/components/simulator';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RentFlow LINE OA Simulator',
  description: 'Simulates the LINE Official Account experience for RentFlow tenants',
};

export default function LineOAPage() {
  return <LineOASimulator />;
}
