import { ReactNode } from 'react';
import { cn } from '@/design-system/lib/utils';
import { useResponsive } from '@/design-system/hooks/useResponsive';

interface ResponsiveWrapperProps {
  /** Content to show on mobile devices */
  mobile?: ReactNode;
  /** Content to show on tablet devices */
  tablet?: ReactNode;
  /** Content to show on desktop devices */
  desktop?: ReactNode;
  /** Content to show on all devices (fallback) */
  children?: ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Breakpoint to switch from mobile to tablet (default: 'sm') */
  mobileBreakpoint?: 'sm' | 'md';
  /** Breakpoint to switch from tablet to desktop (default: 'lg') */
  desktopBreakpoint?: 'md' | 'lg' | 'xl';
}

/**
 * ResponsiveWrapper - Conditionally renders different content based on screen size
 * 
 * @example
 * // Different content for mobile vs desktop
 * <ResponsiveWrapper
 *   mobile={<MobileComponent />}
 *   desktop={<DesktopComponent />}
 * />
 * 
 * @example
 * // Same content with responsive classes
 * <ResponsiveWrapper className="p-4 sm:p-6 lg:p-8">
 *   <Component />
 * </ResponsiveWrapper>
 */
export function ResponsiveWrapper({
  mobile,
  tablet,
  desktop,
  children,
  className,
  mobileBreakpoint = 'sm',
  desktopBreakpoint = 'lg',
}: ResponsiveWrapperProps) {
  const responsive = useResponsive();

  // Determine which content to show
  let content = children;

  if (desktop && responsive.isBreakpoint(desktopBreakpoint)) {
    content = desktop;
  } else if (tablet && responsive.isBreakpoint(mobileBreakpoint) && !responsive.isBreakpoint(desktopBreakpoint)) {
    content = tablet;
  } else if (mobile && !responsive.isBreakpoint(mobileBreakpoint)) {
    content = mobile;
  }

  // If no specific content provided, use children as fallback
  if (!content && children) {
    content = children;
  }

  if (!content) return null;

  return <div className={cn(className)}>{content}</div>;
}

/**
 * ShowOnMobile - Only renders content on mobile devices
 */
export function ShowOnMobile({ 
  children, 
  className,
  breakpoint = 'md' 
}: { 
  children: ReactNode; 
  className?: string;
  breakpoint?: 'sm' | 'md' | 'lg';
}) {
  const responsive = useResponsive();
  
  if (responsive.isBreakpoint(breakpoint)) return null;
  
  return <div className={cn(className)}>{children}</div>;
}

/**
 * HideOnMobile - Hides content on mobile devices
 */
export function HideOnMobile({ 
  children, 
  className,
  breakpoint = 'md'
}: { 
  children: ReactNode; 
  className?: string;
  breakpoint?: 'sm' | 'md' | 'lg';
}) {
  const responsive = useResponsive();
  
  if (!responsive.isBreakpoint(breakpoint)) return null;
  
  return <div className={cn(className)}>{children}</div>;
}

/**
 * ResponsiveGrid - Automatically adjusts grid columns based on screen size
 */
export function ResponsiveGrid({
  children,
  className,
  cols = {
    default: 1,
    sm: 2,
    md: 3,
    lg: 4,
  }
}: {
  children: ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
}) {
  const gridClasses = cn(
    'grid gap-4',
    `grid-cols-${cols.default || 1}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className
  );

  return <div className={gridClasses}>{children}</div>;
}