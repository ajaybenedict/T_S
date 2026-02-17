export interface S1FilterButtons {
    displayName?: string;
    hasCloseBtn?: boolean;
    selectedCount?: number;
    onClickEvent?: string;
    closeBtnClickEvent?: string;
    selected: boolean;
    type: 'reset' | 'add' | 'filter';
}