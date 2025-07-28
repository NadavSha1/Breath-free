import { memo } from 'react';
import { cn } from '@/lib/utils';

const LoadingSpinner = memo(function LoadingSpinner({ 
  size = 'default', 
  className,
  text,
  fullScreen = false 
}) {
  const sizeClasses = {
    small: 'w-4 h-4',
    default: 'w-8 h-8',
    large: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div
        className={cn(
          "animate-spin rounded-full border-4 border-gray-200 border-t-blue-600",
          sizeClasses[size],
          className
        )}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse-soft">
          {text}
        </p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
});

export default LoadingSpinner;