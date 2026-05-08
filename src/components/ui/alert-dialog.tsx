"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface AlertDialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function AlertDialog({ open, onOpenChange, children }: AlertDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange?.(false)}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative bg-background rounded-xl shadow-lg max-w-md w-full">
          {children}
        </div>
      </div>
    </div>
  )
}

export function AlertDialogContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  )
}

export function AlertDialogHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      {children}
    </div>
  )
}

export function AlertDialogTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-bold">
      {children}
    </h3>
  )
}

export function AlertDialogDescription({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-muted-foreground mt-1">
      {children}
    </p>
  )
}

export function AlertDialogFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-end gap-2 mt-4">
      {children}
    </div>
  )
}

export function AlertDialogCancel({ children, className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button variant="outline" className={className} {...props}>
      {children}
    </Button>
  )
}

export function AlertDialogAction({ children, className, ...props }: React.ComponentProps<typeof Button>) {
  return (
    <Button className={cn("bg-purple-600 hover:bg-purple-700", className)} {...props}>
      {children}
    </Button>
  )
}
