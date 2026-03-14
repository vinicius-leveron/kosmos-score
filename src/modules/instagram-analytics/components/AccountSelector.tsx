import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/design-system/primitives/select';
import type { InstagramAccount } from '../types';

interface AccountSelectorProps {
  accounts: InstagramAccount[];
  selectedId: string | undefined;
  onSelect: (id: string | undefined) => void;
}

export function AccountSelector({ accounts, selectedId, onSelect }: AccountSelectorProps) {
  if (accounts.length <= 1) return null;

  return (
    <Select value={selectedId || 'all'} onValueChange={(v) => onSelect(v === 'all' ? undefined : v)}>
      <SelectTrigger className="w-[200px]" aria-label="Selecionar conta Instagram">
        <SelectValue placeholder="Todas as contas" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas as contas</SelectItem>
        {accounts.map(account => (
          <SelectItem key={account.id} value={account.id}>
            @{account.ig_username}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
