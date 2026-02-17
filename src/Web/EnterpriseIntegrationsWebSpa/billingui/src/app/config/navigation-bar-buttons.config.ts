import { Button } from "../interface/button.interface";

export const NavigationBarButtonConfigs:Button[] = [
  {
    key: 'toggleExpandCollapse',
    label: 'collapsed',
    icon: 'cbc/collapsedOrder',
    width: '40px',
    showLabel: false,
    showIcon: true,
    disabled: false,
    showHoverIcon: false,
    class: 'btn-action'
  },
  {
    key: 'manageColumn',
    label: 'manageColumn',
    icon: 'cbc/manageColumns',
    width: '40px',
    showLabel: false,
    showIcon: true,
    disabled: false,
    showHoverIcon: false,
    class: 'btn-action'
  },
  {
    key: 'Download',
    label: 'Download',
    icon: 'cbc/download',
    width: '40px',
    showLabel: false,
    showIcon: true,
    disabled: false,
    showHoverIcon: false,
    class: 'btn-action'
  },
];
