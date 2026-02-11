# QuickActionsMenu Component

## Overview

The QuickActionsMenu component provides inline quick action buttons with modals for CRM interactions. It's designed to be touch-friendly for mobile devices and integrates with Supabase hooks to save actions in the activities table.

## Features

- **WhatsApp Modal**: Send messages with templates
- **Email Modal**: Compose emails with subject and body templates
- **Call Modal**: Log calls with duration and notes
- **Task Modal**: Create tasks with type, priority, and deadline
- **Mobile-Optimized**: Touch-friendly buttons (min 44x44px)
- **Responsive Design**: Compact mode for mobile displays

## Usage

### Basic Usage

```tsx
import { QuickActionsMenu } from '@/modules/crm/components/quick-actions';

<QuickActionsMenu
  contactOrgId="123-abc-def"
  contactName="João Silva"
  contactEmail="joao@example.com"
  contactPhone="+5511999999999"
/>
```

### Compact Mode (Mobile)

```tsx
<QuickActionsMenu
  contactOrgId="123-abc-def"
  contactName="João Silva"
  contactEmail="joao@example.com"
  contactPhone="+5511999999999"
  compact // Shows only icons, no labels
  className="justify-center"
/>
```

### Integration in Contact Detail

```tsx
// In ContactDetail.tsx
<div className="space-y-2">
  <label className="text-sm font-medium">Ações Rápidas</label>
  <QuickActionsMenu
    contactOrgId={contactOrgId}
    contactName={contact.full_name}
    contactEmail={contact.email}
    contactPhone={contact.phone}
    className="w-full"
  />
</div>
```

### Integration in Contact List (Mobile)

```tsx
// In ContactsTableMobile.tsx
<Card>
  <div onClick={() => onSelectContact(contact)}>
    {/* Contact info */}
  </div>
  
  {/* Quick Actions - prevents card click */}
  <div className="mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
    <QuickActionsMenu
      contactOrgId={contact.id}
      contactName={contact.full_name}
      contactEmail={contact.email}
      contactPhone={contact.phone}
      compact
    />
  </div>
</Card>
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `contactOrgId` | `string` | Yes | The contact organization ID |
| `contactName` | `string` | No | Contact name for personalization |
| `contactEmail` | `string` | No | Contact email (enables email action) |
| `contactPhone` | `string` | No | Contact phone (enables WhatsApp/call actions) |
| `className` | `string` | No | Additional CSS classes |
| `compact` | `boolean` | No | Show compact buttons (mobile) |

## Modals

### WhatsApp Modal
- Message composition with character counter
- Pre-built templates (greeting, follow-up, offer, thanks)
- Template personalization with contact name
- Auto-saves to activities as `whatsapp_sent` type

### Email Modal
- Subject and body fields
- Pre-built templates (welcome, content share, meeting request)
- Template personalization
- Auto-saves to activities as `email_sent` type

### Call Modal
- Call direction selection (inbound/outbound/missed)
- Duration tracking (in minutes)
- Notes field with quick suggestions
- Auto-saves to activities as `call` type

### Task Modal
- Task type selection (follow-up, call, email, meeting, proposal, other)
- Priority levels (low/medium/high)
- Deadline with quick date options
- Auto-saves to activities as `meeting` type

## Message Templates

Templates are defined in `useQuickActions.ts` and can be customized:

```tsx
// Example: Adding a new WhatsApp template
messageTemplates.whatsapp.push({
  id: 'custom',
  name: 'Custom Template',
  content: 'Your custom message with {{nome}} placeholder'
});
```

## Database Integration

All actions are saved to the `activities` table with appropriate metadata:

```typescript
{
  contact_org_id: string,
  type: ActivityType,
  title: string,
  description: string,
  metadata: {
    // Specific to each action type
    message?: string,
    subject?: string,
    duration?: number,
    priority?: string,
    deadline?: string,
    // etc.
  }
}
```

## Accessibility

- All buttons have proper `aria-label` attributes
- Disabled states for unavailable actions
- Keyboard navigation support
- Focus management in modals
- Screen reader friendly

## Mobile Optimization

- Minimum touch target size: 44x44px
- Compact mode hides labels on mobile
- Responsive modal sizes
- Touch-friendly form controls
- Optimized for thumb reach

## Styling

The component uses Tailwind CSS with semantic color coding:
- WhatsApp: Green (`text-green-500`)
- Email: Blue (`text-blue-500`)
- Call: Purple (`text-purple-500`)
- Task: Orange (`text-orange-500`)

## Performance

- Lazy-loaded modals (only rendered when opened)
- Optimistic UI updates
- Debounced form inputs
- Memoized template rendering

## Future Enhancements

- [ ] SMS integration
- [ ] Video call logging
- [ ] Bulk actions for multiple contacts
- [ ] Custom action types
- [ ] Template management UI
- [ ] Action scheduling
- [ ] Integration with calendar
- [ ] Voice note attachments