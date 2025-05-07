
import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'full' | 'symbol' | 'icon' | 'text';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMappings = {
  full: {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24',
  },
  symbol: {
    xs: 'h-4',
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12',
    xl: 'h-16',
  },
  icon: {
    xs: 'h-4 w-4',
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
  },
  text: {
    xs: 'h-4',
    sm: 'h-5',
    md: 'h-6',
    lg: 'h-8',
    xl: 'h-10',
  },
};

export const Logo: React.FC<LogoProps> = ({ 
  variant = 'full', 
  size = 'md', 
  className 
}) => {
  const getImageSource = () => {
    switch (variant) {
      case 'full':
        return '/logo-full.png';
      case 'symbol':
        return '/logo-symbol.png';
      case 'icon':
        return '/logo-icon.png';
      case 'text':
        return '/logo-text.png';
      default:
        return '/logo-full.png';
    }
  };

  return (
    <img
      src={getImageSource()}
      alt="Steadystream"
      className={cn(
        sizeMappings[variant][size],
        variant === 'icon' ? 'object-contain' : 'h-auto w-auto object-contain',
        className
      )}
    />
  );
};

export default Logo;
