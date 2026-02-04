import { RefreshCw, Zap } from "lucide-react"

interface LoadingStateProps {
  message?: string
  size?: "sm" | "md" | "lg"
  variant?: "spinner" | "dots" | "pulse"
}

export function LoadingState({ 
  message = "Loading...", 
  size = "md",
  variant = "spinner" 
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "size-6",
    md: "size-8", 
    lg: "size-12"
  }
  
  const messageSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  }

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        {variant === "spinner" && (
          <RefreshCw className={`${sizeClasses[size]} animate-spin text-primary transition-all duration-300`} />
        )}
        {variant === "dots" && (
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
          </div>
        )}
        {variant === "pulse" && (
          <div className="relative">
            <img 
              src="/logo.png" 
              alt="AutoOps AI Logo" 
              className={`${sizeClasses[size]} object-contain bg-black p-1 animate-pulse`}
              onError={(e) => {
                const target = e.currentTarget;
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) {
                  target.style.display = 'none';
                  fallback.style.display = 'block';
                }
              }}
            />
            <Zap className={`${sizeClasses[size]} text-primary animate-pulse hidden`} />
            <div className={`absolute inset-0 ${sizeClasses[size]} bg-primary/20 rounded-full animate-ping`} />
          </div>
        )}
      </div>
      <p className={`mt-4 ${messageSizes[size]} text-muted-foreground font-medium`}>
        {message}
      </p>
    </div>
  )
}
