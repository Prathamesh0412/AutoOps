"use client"

import { toast as sonnerToast, Toaster } from "sonner"

export interface ToastProps {
  message: string
  type?: "success" | "error" | "info" | "warning"
}

export function toast({ message, type = "info" }: ToastProps) {
  switch (type) {
    case "success":
      sonnerToast.success(message)
      break
    case "error":
      sonnerToast.error(message)
      break
    case "warning":
      sonnerToast.warning(message)
      break
    default:
      sonnerToast.info(message)
  }
}

export function ToastProvider() {
  return <Toaster position="top-right" />
}
