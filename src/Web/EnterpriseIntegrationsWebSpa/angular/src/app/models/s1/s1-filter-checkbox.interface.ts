 export interface S1Checkbox {
  displayName: string;
  key: string | number;
  checked: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
}

export interface S1GroupCheckbox {  
  groupTitle: string;
  checkboxes: S1Checkbox[];
  id: string | number;
}

export interface S1DescriptionCheckbox extends S1Checkbox{  
  description: string;
}