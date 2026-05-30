'use client';

import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      'fixed bottom-20 md:bottom-4 right-4 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[380px]',
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & { variant?: 'default' | 'success' | 'error' }
>(({ className, variant = 'default', ...props }, ref) => (
  <ToastPrimitives.Root
    ref={ref}
    className={cn(
      'flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:animate-in data-[state=open]:fade-in-80',
      variant === 'success' && 'bg-surface-container-lowest border-outline-variant/30 text-on-surface',
      variant === 'error' && 'bg-error-container border-error/20 text-on-error-container',
      variant === 'default' && 'bg-surface-container-lowest border-outline-variant/30 text-on-surface',
      className
    )}
    {...props}
  />
));
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title ref={ref} className={cn('font-label-lg text-label-lg', className)} {...props} />
));
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description ref={ref} className={cn('font-body-md text-body-md text-on-surface-variant', className)} {...props} />
));
ToastDescription.displayName = ToastPrimitives.Description.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn('ml-auto text-on-surface-variant hover:text-on-surface p-1 rounded-full hover:bg-surface-container-high transition-colors', className)}
    {...props}
  >
    <span className="material-symbols-outlined text-[18px]">close</span>
  </ToastPrimitives.Close>
));
ToastClose.displayName = ToastPrimitives.Close.displayName;

type ToastState = {
  id: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'success' | 'error';
  icon?: string;
};

let toastFn: (toast: Omit<ToastState, 'id'>) => void = () => {};

export function toast(options: Omit<ToastState, 'id'>) {
  toastFn(options);
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastState[]>([]);

  React.useEffect(() => {
    toastFn = (options) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...options, id }]);
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
    };
  }, []);

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, variant, icon }) => (
        <Toast key={id} variant={variant} open>
          {icon && (
            <span
              className={cn(
                'material-symbols-outlined text-[20px] shrink-0',
                variant === 'success' && 'text-primary',
                variant === 'error' && 'text-on-error-container',
              )}
            >
              {icon}
            </span>
          )}
          <div className="flex-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
