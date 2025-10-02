import { ImgHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
}

const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  ({ className, src, alt, size = 'md', fallback, ...props }, ref) => {
    const sizeClasses = {
      xs: 'h-6 w-6',
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    };

    const textSizeClasses = {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-2xl',
    };

    if (!src) {
      return (
        <div
          className={clsx(
            'rounded-full bg-tobacco-300 flex items-center justify-center text-tobacco-700 font-medium',
            sizeClasses[size],
            textSizeClasses[size],
            className
          )}
        >
          {fallback || alt.charAt(0).toUpperCase()}
        </div>
      );
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={clsx('rounded-full object-cover', sizeClasses[size], className)}
        {...props}
      />
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
