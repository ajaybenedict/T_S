import { Button } from "../interface/button.interface";

export const ACTION_CONFIG: Record<string, Button>  = {
  Approve: {
    key: 'Approve',
    label: 'Approve',
    icon: '/cbc/approve',
    showLabel: false,
    showIcon: true,
    disabled: false,
    class : 'btn-action'
  },
  Decline: {
    key: 'Decline',
    label: 'Decline',
    icon: '/cbc/decline',
    showLabel: false,
    showIcon: true,
    disabled: false,
    class : 'btn-action'
  }
};



export const DETAILED_VIEW_ACTION_CONFIG: Record<string, Button>  = {  
  Decline: {
    key: 'Decline',
    label: 'Decline Invoice',
    icon: '/cbc/decline',
    showLabel: true,
    showIcon: true,
    disabled: false, width: '152px',
    class : 'orderdetailed-action-button'
  },
  Approve: {
    key: 'Approve',
    label: 'Approve Invoice',
    icon: '/cbc/approve',
    showLabel: true,
    showIcon: true,
    disabled: false,
     width: '157px',
    class : 'orderdetailed-action-button'
  }
};

