import { Circle, X } from 'lucide-react';

interface BetIconProps {
  direction: 'yes' | 'no' | 'YES' | 'NO';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BetIcon({ direction, size = 'md', className = '' }: BetIconProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const isYes = direction === 'yes' || direction === 'YES';
  const colorClass = isYes ? 'text-green-600' : 'text-red-600';
  const combinedClass = `${sizeClasses[size]} ${colorClass} ${className} stroke-[2.5]`;

  return isYes ? (
    <Circle className={combinedClass} />
  ) : (
    <X className={combinedClass} />
  );
}
