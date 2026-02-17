import { S1FilterButtons } from "src/app/models/s1/s1-filter-buttons.interface";

export class DashboardFilterBarHelper {
    public static getAddFilterButton() {
        const data: S1FilterButtons =  {            
            selected: false,
            type: 'add',    
        };
        return data;
    }

    public static generateButtons(configData: {displayName: string, onClickEvent: string}, count: number) {
        const data: S1FilterButtons = {
            type: 'filter',
            displayName: configData.displayName,
            selected: false,
            selectedCount: count,
            onClickEvent: configData.onClickEvent,
            hasCloseBtn: true,
            closeBtnClickEvent: configData.onClickEvent,
        };
        return data;
    }

    public static getResetButton() {
        const data: S1FilterButtons =  {            
            selected: false,
            type: 'reset',                        
        };
        return data;
    }
}