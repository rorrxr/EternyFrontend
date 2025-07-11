import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/utils/helpers"

const progressVariants = cva(
  "relative h-2 w-full overflow-hidden rounded-full bg-secondary",
  {
    variants: {
      size: {
        sm: "h-1",
        md: "h-2", 
        lg: "h-3",
        xl: "h-4"
      },
      variant: {
        default: "bg-secondary",
        success: "bg-green-200 dark:bg-green-900",
        warning: "bg-yellow-200 dark:bg-yellow-900", 
        danger: "bg-red-200 dark:bg-red-900",
        info: "bg-blue-200 dark:bg-blue-900"
      }
    },
    defaultVariants: {
      size: "md",
      variant: "default"
    }
  }
)

const progressIndicatorVariants = cva(
  "h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out",
  {
    variants: {
      variant: {
        default: "bg-primary",
        success: "bg-green-600 dark:bg-green-500",
        warning: "bg-yellow-600 dark:bg-yellow-500",
        danger: "bg-red-600 dark:bg-red-500", 
        info: "bg-blue-600 dark:bg-blue-500"
      },
      animated: {
        true: "animate-pulse",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      animated: false
    }
  }
)

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants> {
  value?: number
  max?: number
  showValue?: boolean
  showPercentage?: boolean
  label?: string
  animated?: boolean
  striped?: boolean
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ 
  className, 
  value = 0, 
  max = 100,
  size,
  variant,
  showValue = false,
  showPercentage = false,
  label,
  animated = false,
  striped = false,
  ...props 
}, ref) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100))
  
  return (
    <div className="w-full space-y-1">
      {(label || showValue || showPercentage) && (
        <div className="flex justify-between items-center text-sm">
          {label && (
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {(showValue || showPercentage) && (
            <span className="text-gray-500 dark:text-gray-400">
              {showValue && `${value}/${max}`}
              {showValue && showPercentage && " • "}
              {showPercentage && `${percentage.toFixed(1)}%`}
            </span>
          )}
        </div>
      )}
      
      <ProgressPrimitive.Root
        ref={ref}
        className={cn(progressVariants({ size, variant }), className)}
        {...props}
      >
        <ProgressPrimitive.Indicator
          className={cn(
            progressIndicatorVariants({ variant, animated }),
            striped && "bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:30px_100%] animate-[progress-stripes_1s_linear_infinite]",
            "origin-left"
          )}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </ProgressPrimitive.Root>
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

// 원형 진행률 컴포넌트
export interface CircularProgressProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  variant?: "default" | "success" | "warning" | "danger" | "info"
  showValue?: boolean
  label?: string
  className?: string
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ 
    value = 0, 
    max = 100, 
    size = 120, 
    strokeWidth = 8,
    variant = "default",
    showValue = true,
    label,
    className 
  }, ref) => {
    const percentage = Math.min(100, Math.max(0, (value / max) * 100))
    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = circumference
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    const variantColors = {
      default: "stroke-primary",
      success: "stroke-green-600 dark:stroke-green-500", 
      warning: "stroke-yellow-600 dark:stroke-yellow-500",
      danger: "stroke-red-600 dark:stroke-red-500",
      info: "stroke-blue-600 dark:stroke-blue-500"
    }

    return (
      <div ref={ref} className={cn("relative inline-flex items-center justify-center", className)}>
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn("transition-all duration-300 ease-in-out", variantColors[variant])}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {showValue && (
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {percentage.toFixed(0)}%
              </div>
            )}
            {label && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {label}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
)
CircularProgress.displayName = "CircularProgress"

// 스텝 진행률 컴포넌트
export interface StepProgressProps {
  steps: Array<{
    label: string
    description?: string
    completed?: boolean
    current?: boolean
    error?: boolean
  }>
  orientation?: "horizontal" | "vertical"
  size?: "sm" | "md" | "lg"
  className?: string
}

const StepProgress = React.forwardRef<HTMLDivElement, StepProgressProps>(
  ({ steps, orientation = "horizontal", size = "md", className }, ref) => {
    const sizeStyles = {
      sm: {
        step: "w-6 h-6 text-xs",
        connector: orientation === "horizontal" ? "h-0.5" : "w-0.5",
        label: "text-sm"
      },
      md: {
        step: "w-8 h-8 text-sm", 
        connector: orientation === "horizontal" ? "h-1" : "w-1",
        label: "text-base"
      },
      lg: {
        step: "w-10 h-10 text-base",
        connector: orientation === "horizontal" ? "h-1.5" : "w-1.5", 
        label: "text-lg"
      }
    }

    const currentStyles = sizeStyles[size]

    return (
      <div 
        ref={ref}
        className={cn(
          "flex",
          orientation === "horizontal" ? "items-center" : "flex-col",
          className
        )}
      >
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className={cn(
              "flex items-center",
              orientation === "vertical" && "flex-col"
            )}>
              {/* Step circle */}
              <div className={cn(
                "rounded-full border-2 flex items-center justify-center font-medium transition-colors",
                currentStyles.step,
                step.error
                  ? "border-red-500 bg-red-500 text-white"
                  : step.completed
                  ? "border-green-500 bg-green-500 text-white"
                  : step.current
                  ? "border-blue-500 bg-blue-500 text-white"
                  : "border-gray-300 bg-white text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400"
              )}>
                {step.error ? (
                  "✕"
                ) : step.completed ? (
                  "✓"
                ) : (
                  index + 1
                )}
              </div>
              
              {/* Step label */}
              <div className={cn(
                orientation === "horizontal" ? "ml-3" : "mt-2 text-center",
                currentStyles.label
              )}>
                <div className={cn(
                  "font-medium",
                  step.current ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"
                )}>
                  {step.label}
                </div>
                {step.description && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-1 bg-gray-300 dark:bg-gray-600",
                orientation === "horizontal" 
                  ? `mx-4 ${currentStyles.connector}` 
                  : `my-4 ${currentStyles.connector}`,
                step.completed && "bg-green-500"
              )} />
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }
)
StepProgress.displayName = "StepProgress"

export { Progress, CircularProgress, StepProgress } 