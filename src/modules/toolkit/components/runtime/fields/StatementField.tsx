/**
 * StatementField - Statement/info display field for form runtime
 * This field type doesn't collect data, just displays information
 */

import { cn } from '@/design-system/lib/utils';
import type { FormField, FieldAnswer } from '../../../types/form.types';

interface StatementFieldProps {
  field: FormField;
  value: FieldAnswer | undefined;
  onChange: (value: FieldAnswer) => void;
  error?: string | null;
}

export function StatementField({
  field,
}: StatementFieldProps) {
  return (
    <div className="space-y-6">
      {/* Statement content */}
      <div className="prose prose-invert max-w-none">
        {field.help_text && (
          <p className="text-kosmos-gray text-lg leading-relaxed">
            {field.help_text}
          </p>
        )}
      </div>

      {/* Visual indicator that this is informational */}
      <div className="flex items-center gap-2 text-kosmos-gray/60 text-sm">
        <div className="w-2 h-2 rounded-full bg-kosmos-orange/50" />
        <span>Pressione Enter ou clique em Continuar</span>
      </div>
    </div>
  );
}
