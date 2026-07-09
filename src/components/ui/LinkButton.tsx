'use client'
import Link from 'next/link';
import { LinkButtonProps } from '@/interface/index';

export function LinkButton({
  href,
  children,
  size = 'md',
  animation = 'shine',
  fullWidth = false,
  icon,
  iconPosition = 'right',
  className = '',
  onClick,
  animationColor = 'white/30',
  type,
  disabled,
}:LinkButtonProps) {
  // Base styles
  const baseStyles = 'cursor-pointer font-semibold rounded-[16px] flex items-center justify-center transition relative overflow-hidden group';
  
  // Size styles
  const sizeStyles = {
    sm: 'text-sm h-[48px]',
    md: 'text-[16px] h-[56px]',
    lg: 'text-[16px] h-[62px]',
    xl: 'text-[18px] h-[62px]',
  };
  
  // Width styles
  const widthStyles = fullWidth ? 'w-full' : '';
  
  // Combine all styles
  const linkStyles = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${widthStyles}
    ${className}
  `;
  
  // Map animationColor prop to class-based gradient variants
  const shineColorClass = (() => {
    switch (animationColor) {
      case 'white/30':
        return 'shine-gradient--white-30';
      case 'white/20':
        return 'shine-gradient--white-20';
      case 'black/10':
        return 'shine-gradient--black-10';
      default:
        return 'shine-gradient--white-30';
    }
  })();
  
  // Animation element using global CSS classes (no inline styles)
  const AnimationElement = animation === 'shine' ? (
    <span
      className={`shine-gradient ${shineColorClass} absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out pointer-events-none`}
    />
  ) : null;
  
  // Scale animation
  const scaleClass = animation === 'scale' ? 'hover:scale-105' : '';
  
  // Render as Next.js Link when href is provided; otherwise render a button
  if (href) {
    return (
      <Link
        href={href}
        className={`${linkStyles} ${scaleClass}`}
        onClick={onClick}
      >
        {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
        <span className="relative z-10">{children}</span>
        {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
        {AnimationElement}
      </Link>
    );
  }

  return (
    <button
      type={type ?? 'button'}
      disabled={disabled}
      className={`${linkStyles} ${scaleClass}`}
      onClick={onClick}
    >
      {icon && iconPosition === 'left' && <span className="mr-2">{icon}</span>}
      <span className="relative z-10">{children}</span>
      {icon && iconPosition === 'right' && <span className="ml-2">{icon}</span>}
      {AnimationElement}
    </button>
  );
};
