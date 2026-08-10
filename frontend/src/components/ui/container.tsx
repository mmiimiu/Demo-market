import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  as?: React.ElementType;
}

export function Container({ children, className, as: Component = 'div', ...props }: ContainerProps) {
  return (
    <Component
      className={cn('max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 w-full', className)}
      {...props}
    >
      {children}
    </Component>
  );
}
