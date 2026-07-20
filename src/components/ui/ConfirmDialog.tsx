/**
 * ConfirmDialog
 * Global confirmation popup — replaces alert() / confirm() for sensitive actions.
 * 
 * Variants:
 *   - danger  → red destructive button (delete, revoke)
 *   - warning → orange button (payment, important change)
 *   - info    → blue button (general confirmation)
 * 
 * Usage:
 *   const { openConfirm, ConfirmDialogNode } = useConfirmDialog();
 *   ...
 *   <button onClick={() => openConfirm({ title: '...', message: '...', onConfirm: () => ... })} />
 *   {ConfirmDialogNode}
 */

'use client';

import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Trash2, Info } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel?: () => void;
}

// ── Icon map ─────────────────────────────────────────────────────────────────

const iconMap = {
  danger:  <Trash2 className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-orange-500" />,
  info:    <Info className="w-5 h-5 text-blue-500" />,
};

const buttonVariantClass = {
  danger:  'bg-red-500 hover:bg-red-600 text-white font-black rounded-xl',
  warning: 'bg-orange-500 hover:bg-orange-600 text-white font-black rounded-xl',
  info:    'bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl',
};

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useConfirmDialog() {
  const [isOpen, setIsOpen]       = useState(false);
  const [options, setOptions]     = useState<ConfirmOptions | null>(null);

  const openConfirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
  }, []);

  const handleConfirm = () => {
    options?.onConfirm();
    setIsOpen(false);
  };

  const handleCancel = () => {
    options?.onCancel?.();
    setIsOpen(false);
  };

  const variant = options?.variant ?? 'info';

  const ConfirmDialogNode = (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) handleCancel(); }}>
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
        {/* Header stripe */}
        <div className={`px-6 pt-6 pb-4 ${
          variant === 'danger'  ? 'bg-red-50'    :
          variant === 'warning' ? 'bg-orange-50' : 'bg-blue-50'
        }`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black text-gray-900">
              {iconMap[variant]}
              {options?.title}
            </DialogTitle>
            {options?.message && (
              <DialogDescription className="text-sm text-gray-500 font-medium mt-1 leading-relaxed">
                {options.message}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>

        {/* Footer actions */}
        <DialogFooter className="flex gap-2 px-6 pb-6 pt-4 bg-white">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex-1 rounded-xl font-bold text-sm h-11 border-gray-200"
          >
            {options?.cancelLabel ?? 'ยกเลิก'}
          </Button>
          <Button
            onClick={handleConfirm}
            className={`flex-1 h-11 text-sm ${buttonVariantClass[variant]}`}
          >
            {options?.confirmLabel ?? 'ยืนยัน'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return { openConfirm, ConfirmDialogNode };
}

// ── Standalone component (for one-off usage) ──────────────────────────────────

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'ยืนยัน',
  cancelLabel  = 'ยกเลิก',
  variant      = 'info',
  onConfirm,
  onCancel,
}: ConfirmOptions & { open: boolean }) {
  const v = variant;
  return (
    <Dialog open={open} onOpenChange={(val) => { if (!val) onCancel?.(); }}>
      <DialogContent className="max-w-sm rounded-2xl p-0 overflow-hidden border-0 shadow-2xl">
        <div className={`px-6 pt-6 pb-4 ${
          v === 'danger'  ? 'bg-red-50'    :
          v === 'warning' ? 'bg-orange-50' : 'bg-blue-50'
        }`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-black text-gray-900">
              {iconMap[v]}
              {title}
            </DialogTitle>
            {message && (
              <DialogDescription className="text-sm text-gray-500 font-medium mt-1 leading-relaxed">
                {message}
              </DialogDescription>
            )}
          </DialogHeader>
        </div>
        <DialogFooter className="flex gap-2 px-6 pb-6 pt-4 bg-white">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1 rounded-xl font-bold text-sm h-11 border-gray-200"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            className={`flex-1 h-11 text-sm ${buttonVariantClass[v]}`}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
