export const FILTER_PANEL_BUTTON_CONFIG = [
    {
      displayName: 'Country',
      type: 'filter',
      selected: true,
      hasCloseBtn: false,
      selectedCount: 0,
      onClickEvent: 'apply',
      closeBtnClickEvent: 'close',
    },
    {
      displayName: 'Vendor',
      type: 'filter',
      selected: false,
      hasCloseBtn: false,
      selectedCount: 0,
      onClickEvent: 'apply',
      closeBtnClickEvent: 'close',
    },
    {
      displayName: 'Issues',
      type: 'filter',
      selected: false,
      hasCloseBtn: false,
      selectedCount: 0,
      onClickEvent: 'apply',
      closeBtnClickEvent: 'close',
    },
];

export const RESET_BUTTON_CONFIG = [
    {
      displayName: 'Reset',
      type: 'reset',
      selected: false,
      hasCloseBtn: false,
      selectedCount: 0,
      onClickEvent: 'apply',
      closeBtnClickEvent: 'close',
    }
];



export const TAB_BUTTON_CONFIGS: { [key: string]: any[] } = {
  Country: [ {
      displayName: 'Country',
      type: 'filter',
      selected: false,
      hasCloseBtn: true,
      selectedCount: 0,
      onClickEvent: 'apply',
      closeBtnClickEvent: 'close',
    }],
  Vendor: [{
      displayName: 'Vendor',
      type: 'filter',
      selected: false,
      hasCloseBtn: true,
      selectedCount: 0,
      onClickEvent: 'apply',
      closeBtnClickEvent: 'close',
    }],
  Issues: [{
      displayName: 'Issues',
      type: 'filter',
      selected: false,
      hasCloseBtn: true,
      selectedCount: 0,
      onClickEvent: 'apply',
      closeBtnClickEvent: 'close',
    }]
};
