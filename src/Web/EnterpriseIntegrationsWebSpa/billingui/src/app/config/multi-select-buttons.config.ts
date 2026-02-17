import { Button } from "../interface/button.interface";

export const MultiSelectButtonConfigs:Button[] = [
  {
    key: 'Download',
    label: 'Download',
    icon: '/cbc/download',
    tab: ['NONE'],
    width: '119px',
    showLabel: true,
    showIcon: true,
    disabled: false,
    class: 'multiselect-button'
  },
  {
    key: 'Approve',
    label: 'Approve',
    icon: '/cbc/approve',
    tab: ['NONE', 'Declined'],
    width: '109px',
    showLabel: true,
    showIcon: true,
    disabled: false,
    class: 'multiselect-button'

  },
  {
    key: 'Decline',
    label: 'Decline',
    icon: '/cbc/decline',
    tab: ['NONE', 'Approved'],
    width: '119px',
    showLabel: true,
    showIcon: true,
    disabled: false,
    class: 'multiselect-button'

  },
  {
    key: 'BillingList',
    label: 'BillingList',
    icon: 'billing_list',
    tab: ['Declined'],
    width: '119px',
    showLabel: true,
    showIcon: true,
    disabled: false,
    class: 'multiselect-button'

  },
    {
    key: 'Close',
    label: 'Close',
    icon: 'dismiss',
    tab: ['Declined','NONE', 'Approved'],
    width: '44px',
    showLabel: false,
    showIcon: true,
    disabled: false,
    class: 'multiselect-button dismiss-button'

  }
];
