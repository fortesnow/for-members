"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

const AlertDialog = ({
  open,
  onOpenChange,
  children
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = React.useState(open || false)
  
  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
    if (onOpenChange) {
      onOpenChange(isOpen)
    }
  }, [open, isOpen, onOpenChange])
  
  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg md:w-full">
            {children}
          </div>
        </div>
      )}
    </>
  )
}

const AlertDialogTrigger = ({
  children,
  ...props
}: {
  children: React.ReactNode
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <Button {...props}>
      {children}
    </Button>
  )
}

const AlertDialogContent = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

const AlertDialogHeader = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`flex flex-col space-y-2 text-center sm:text-left ${className || ''}`} {...props}>
      {children}
    </div>
  )
}

const AlertDialogFooter = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className || ''}`} {...props}>
      {children}
    </div>
  )
}

const AlertDialogTitle = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => {
  return (
    <h2 className={`text-lg font-semibold ${className || ''}`} {...props}>
      {children}
    </h2>
  )
}

const AlertDialogDescription = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => {
  return (
    <p className={`text-sm text-muted-foreground ${className || ''}`} {...props}>
      {children}
    </p>
  )
}

const AlertDialogAction = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <Button className={className} {...props}>
      {children}
    </Button>
  )
}

const AlertDialogCancel = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <Button variant="outline" className={`mt-2 sm:mt-0 ${className || ''}`} {...props}>
      {children}
    </Button>
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel
} 