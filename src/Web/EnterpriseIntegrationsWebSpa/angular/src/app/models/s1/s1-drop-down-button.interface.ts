import { S1MenuItem } from "./s1-menu.interface";

export interface S1DropDownButton {
    hasIcon: boolean;
    iconURL?: string;
    hasTitle: boolean;
    title?: string;
    subMenu: S1MenuItem[];
}