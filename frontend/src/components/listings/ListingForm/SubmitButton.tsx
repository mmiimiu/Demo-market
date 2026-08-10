import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubmitButtonProps {
  loading: boolean;
  t: any;
}

export function SubmitButton({ loading, t }: SubmitButtonProps) {
  return (
    <div className="pt-10">
      <Button 
        type="submit" 
        disabled={loading}
        className="w-full h-16 rounded-none bg-primary hover:bg-primary-dark font-black text-xl shadow-2xl shadow-primary/20 gap-3 transition-transform hover:scale-[1.01] active:scale-[0.99]"
      >
        {loading ? (
          <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <PlusCircle className="w-6 h-6" /> 
            {t.submit_listing}
          </>
        )}
      </Button>
    </div>
  );
}
