import { EventEmitter, TemplateRef } from "@angular/core";

export interface PPCMastheadDropdown {
    title: string;
    iconURL: string;
    navigationURL?: string; //navigates to this path on click and makes the item active when this path is opened
    isEnabled: boolean; // false - not active in landing page and we will not show it in dropdown as well
    category: PPCMastheadDropdownCategory;
}

export enum PPCMastheadDropdownCategory {
    General = 'General',
    Insights = 'StreamOne Insight',
    CloudTools = 'StreamOne Cloud Tools',
};

export interface PPCMastheadDropdownPanel {
    templateRef: TemplateRef<any>;
    readonly closed: EventEmitter<void>;
}