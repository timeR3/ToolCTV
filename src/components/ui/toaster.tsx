"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const titleId = title ? `toast-title-${id}` : undefined;
        const descriptionId = description ? `toast-description-${id}` : undefined;

        return (
          <Toast 
            key={id} 
            {...props}
            {...(titleId && { 'aria-labelledby': titleId })}
            {...(descriptionId && { 'aria-describedby': descriptionId })}
          >
            <div className="grid gap-1">
              {title && <ToastTitle id={titleId}>{title}</ToastTitle>}
              {description && (
                <ToastDescription id={descriptionId}>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
