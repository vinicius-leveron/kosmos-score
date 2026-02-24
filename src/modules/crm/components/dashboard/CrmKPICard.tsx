import { Card, CardContent } from '@/design-system/primitives/card';
import { Skeleton } from '@/design-system/primitives/skeleton';

interface CrmKPICardProps {
  title: string;
  value: string | number | null | undefined;
  icon: React.ElementType;
  color?: string;
  subtitle?: string;
  isLoading?: boolean;
}

export function CrmKPICard({
  title,
  value,
  icon: Icon,
  color = 'text-kosmos-orange',
  subtitle,
  isLoading,
}: CrmKPICardProps) {
  return (
    <Card className="bg-kosmos-black-light border-border">
      <CardContent className="pt-6">
        <div className="flex items-center gap-3 mb-2">
          <Icon className={`h-5 w-5 ${color}`} />
          <span className="text-sm text-kosmos-gray">{title}</span>
        </div>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <>
            <div className={`text-2xl font-display font-bold ${color}`}>
              {typeof value === 'number' ? value.toLocaleString('pt-BR') : value || '-'}
            </div>
            {subtitle && <div className="text-xs text-kosmos-gray mt-1">{subtitle}</div>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
