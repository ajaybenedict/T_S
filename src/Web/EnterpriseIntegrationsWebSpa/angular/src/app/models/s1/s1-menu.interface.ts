import { TemplateRef } from "@angular/core";

export interface S1Menu {
    hasName: boolean;
    displayName?: string;
    hasIcon: boolean;
    iconURL?: string;
    hoverIcon?: string;
    subMenu: S1MenuItem[];
}

export interface S1MenuItem {
    hasName: boolean;
    displayName?: string;
    hasIcon: boolean;
    iconURL?: string;
    isS1Btn?: boolean;
    s1BtnType?: 'primary' | 'secondary' | 'secondary-filled';
    onClickEmit: string;
    tagTemplate?: TemplateRef<unknown>;
}