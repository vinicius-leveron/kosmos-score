import { Target } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/design-system/primitives/table';
import { cn } from '@/design-system/lib/utils';
import { formatCurrency } from './RevenueTimelineChart';

interface Deal {
  id: string;
  title: string;
  company: string;
  amount: number;
  stage: string;
  stageColor: string;
  probability: number;
  daysInStage: number;
}

interface TopDealsTableProps {
  deals: Deal[];
}

export function TopDealsTable({ deals }: TopDealsTableProps) {
  return (
    <div className="card-structural p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-1 h-5 bg-kosmos-orange rounded-r" />
        <Target className="h-5 w-5 text-kosmos-orange" />
        <h3 className="font-display text-sm font-semibold text-kosmos-white tracking-wider uppercase">
          Top Deals em Aberto
        </h3>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-kosmos-gray">Deal</TableHead>
              <TableHead className="text-kosmos-gray text-right">Valor</TableHead>
              <TableHead className="text-kosmos-gray">Stage</TableHead>
              <TableHead className="text-kosmos-gray text-right">Prob.</TableHead>
              <TableHead className="text-kosmos-gray text-right">Dias</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deals.length === 0 ? (
              <TableRow className="border-border">
                <TableCell colSpan={5} className="text-center text-kosmos-gray py-8">
                  Nenhum deal em aberto
                </TableCell>
              </TableRow>
            ) : (
              deals.map((deal) => (
                <TableRow key={deal.id} className="border-border">
                  <TableCell className="font-medium">
                    <div>
                      <div className="text-kosmos-white">{deal.title}</div>
                      <div className="text-xs text-kosmos-gray">{deal.company}</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-green-400 font-medium">
                    {formatCurrency(deal.amount)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: deal.stageColor }}
                      />
                      <span className="text-kosmos-white text-sm">{deal.stage}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        'font-medium',
                        deal.probability >= 70 ? 'text-green-400' :
                        deal.probability >= 40 ? 'text-yellow-400' : 'text-gray-400'
                      )}
                    >
                      {deal.probability}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-kosmos-gray">
                    {deal.daysInStage}d
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
