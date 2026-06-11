export interface Button {
  key: string;
  label: string;
  icon: string;
  tab?: string[];  
  width?: string;
  showHoverIcon?: boolean;   
  showLabel: boolean;
  showIcon: boolean;
  disabled: boolean;
  class: string;
}


export interface SubMenuItem {
  hasName: boolean;
  displayName: string;
  hasIcon: boolean;
  iconURL: string;
  onClickEmit: string;
}

export interface TabButton {
  displayName: string;
  type: string;
  selected: boolean;
  hasCloseBtn: boolean;
  selectedCount: number;
  onClickEvent: string;
  closeBtnClickEvent: string;
}

export interface CheckBox {
  checked: boolean;
  displayName: string;
  key: number;
}

export interface CheckboxGroup {
  id: string;
  groupTitle: string;
  checkboxes: CheckBox[];
}


// Union type for checkbox value - allows both individual and array types
export type CheckboxValue = CheckBox[] | CheckboxGroup[] | (CheckBox | CheckboxGroup)[];


export interface SelectDropdown {
  label: string;
  value: string;
  imgUrl?: string;
  imgAlt?: string;
}
