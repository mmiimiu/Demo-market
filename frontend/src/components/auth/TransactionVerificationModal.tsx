'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TransactionVerificationModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: () => void;
  transactionType?: 'booking' | 'payment' | 'other';
}

export function TransactionVerificationModal({
  open,
  onClose,
  onVerify,
  transactionType = 'booking'
}: TransactionVerificationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transaction Verification</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-4">
            Please verify your transaction details before proceeding.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onVerify}>
              Verify & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
