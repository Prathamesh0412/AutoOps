"use client"

import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
  variant?: "default" | "card" | "text" | "button" | "badge" | "avatar"
  count?: number
}

export function Skeleton({ className, variant = "default", count = 1 }: SkeletonProps) {
  const variantClasses = {
    default: "skeleton",
    card: "skeleton rounded-lg",
    text: "skeleton h-4 w-full",
    button: "skeleton h-9 w-20 rounded-md",
    badge: "skeleton h-5 w-16 rounded-full",
    avatar: "skeleton size-10 rounded-full",
  }

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(variantClasses[variant], className)}
        />
      ))}
    </>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-6 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton variant="avatar" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" className="w-3/4" />
          <Skeleton variant="text" className="w-1/2 h-3" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" className="w-full" />
        <Skeleton variant="text" className="w-5/6" />
        <Skeleton variant="text" className="w-4/6" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton variant="badge" />
        <Skeleton variant="button" />
      </div>
    </div>
  )
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 border rounded-lg">
          <Skeleton variant="avatar" />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="w-48" />
            <Skeleton variant="text" className="w-32 h-3" />
          </div>
          <Skeleton variant="badge" />
        </div>
      ))}
    </div>
  )
}

export function TableSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-4 p-4 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" className="w-24" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border">
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} variant="text" className="w-20" />
          ))}
        </div>
      ))}
    </div>
  )
}
