import { CheckBox, CheckboxGroup } from './button.interface';
export interface TabCounts {  
  [key: string]: number;
}

export interface CheckboxLists {
   [key: string]: (CheckBox | CheckboxGroup)[];
}

export interface DateRange {
  start: string;
  end: string;
}