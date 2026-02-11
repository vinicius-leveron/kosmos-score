import * as React from 'react';
import { cn } from '@/design-system/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/design-system/primitives/card';

interface ResponsiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether the card should be interactive on mobile (add active states) */
  interactive?: boolean;
  /** Whether to use compact padding on mobile */
  compact?: boolean;
  /** Additional header props */
  headerProps?: React.HTMLAttributes<HTMLDivElement>;
  /** Additional content props */
  contentProps?: React.HTMLAttributes<HTMLDivElement>;
  /** Additional footer props */
  footerProps?: React.HTMLAttributes<HTMLDivElement>;
}

/**
 * ResponsiveCard - Card component optimized for mobile with touch-friendly interactions
 * 
 * @example
 * <ResponsiveCard interactive compact>
 *   <ResponsiveCard.Header>
 *     <ResponsiveCard.Title>Title</ResponsiveCard.Title>
 *   </ResponsiveCard.Header>
 *   <ResponsiveCard.Content>
 *     Content here
 *   </ResponsiveCard.Content>
 * </ResponsiveCard>
 */
const ResponsiveCardRoot = React.forwardRef<HTMLDivElement, ResponsiveCardProps>(
  ({ className, interactive = false, compact = false, children, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          // Base styles
          'transition-all',
          // Interactive states for mobile
          interactive && [
            'cursor-pointer',
            'hover:border-primary/50',
            'active:scale-[0.98]',
            'touch-manipulation',
          ],
          // Responsive padding
          compact && 'p-0',
          className
        )}
        {...props}
      >
        {children}
      </Card>
    );
  }
);
ResponsiveCardRoot.displayName = 'ResponsiveCard';

const ResponsiveCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { compact?: boolean }
>(({ className, compact, ...props }, ref) => (
  <CardHeader
    ref={ref}
    className={cn(
      // Responsive padding
      compact ? 'p-3 sm:p-4' : 'p-4 sm:p-6',
      className
    )}
    {...props}
  />
));
ResponsiveCardHeader.displayName = 'ResponsiveCard.Header';

const ResponsiveCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & { size?: 'sm' | 'md' | 'lg' }
>(({ className, size = 'md', ...props }, ref) => (
  <CardTitle
    ref={ref}
    className={cn(
      // Responsive text sizes
      {
        'text-sm sm:text-base': size === 'sm',
        'text-base sm:text-lg': size === 'md',
        'text-lg sm:text-xl': size === 'lg',
      },
      className
    )}
    {...props}
  />
));
ResponsiveCardTitle.displayName = 'ResponsiveCard.Title';

const ResponsiveCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <CardDescription
    ref={ref}
    className={cn(
      // Responsive text size
      'text-xs sm:text-sm',
      className
    )}
    {...props}
  />
));
ResponsiveCardDescription.displayName = 'ResponsiveCard.Description';

const ResponsiveCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { compact?: boolean }
>(({ className, compact, ...props }, ref) => (
  <CardContent
    ref={ref}
    className={cn(
      // Responsive padding
      compact ? 'p-3 sm:p-4 pt-0' : 'p-4 sm:p-6 pt-0',
      className
    )}
    {...props}
  />
));
ResponsiveCardContent.displayName = 'ResponsiveCard.Content';

const ResponsiveCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { compact?: boolean }
>(({ className, compact, ...props }, ref) => (
  <CardFooter
    ref={ref}
    className={cn(
      // Responsive padding
      compact ? 'p-3 sm:p-4 pt-0' : 'p-4 sm:p-6 pt-0',
      // Responsive flex direction
      'flex flex-col sm:flex-row gap-2 sm:gap-4',
      className
    )}
    {...props}
  />
));
ResponsiveCardFooter.displayName = 'ResponsiveCard.Footer';

// Export as compound component
export const ResponsiveCard = Object.assign(ResponsiveCardRoot, {
  Header: ResponsiveCardHeader,
  Title: ResponsiveCardTitle,
  Description: ResponsiveCardDescription,
  Content: ResponsiveCardContent,
  Footer: ResponsiveCardFooter,
});

/**
 * MetricCard - Specialized responsive card for displaying metrics
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export function MetricCard({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: MetricCardProps) {
  return (
    <ResponsiveCard compact className={className}>
      <ResponsiveCard.Header compact>
        <div className="flex items-center justify-between">
          <ResponsiveCard.Title size="sm" className="text-muted-foreground font-medium">
            {title}
          </ResponsiveCard.Title>
          {icon && <div className="text-muted-foreground">{icon}</div>}
        </div>
      </ResponsiveCard.Header>
      <ResponsiveCard.Content compact>
        <div className="space-y-1">
          <div className="text-xl sm:text-2xl font-bold">{value}</div>
          {description && (
            <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div
              className={cn(
                'text-xs sm:text-sm',
                trend.positive ? 'text-green-500' : 'text-red-500'
              )}
            >
              {trend.positive ? '+' : ''}{trend.value}% {trend.label}
            </div>
          )}
        </div>
      </ResponsiveCard.Content>
    </ResponsiveCard>
  );
}