import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Loading Spinner Component
 */
export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-b-2 border-primary",
        sizeClasses[size],
        className
      )}
    />
  );
}

/**
 * Full Screen Loading Component
 */
export function LoadingScreen({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <LoadingSpinner size="lg" />
      {message && (
        <p className="text-muted-foreground text-sm">{message}</p>
      )}
    </div>
  );
}

