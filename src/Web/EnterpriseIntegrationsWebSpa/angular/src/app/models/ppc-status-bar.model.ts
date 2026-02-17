export interface PPCStatusBarData {
    width?: string;
    height: string;
    type: PPCStatusBarType;
    message: string;
    showDismissBtn: boolean;
}

export type PPCStatusBarType = 'alert' | 'error' | 'success';

export type PPCStatusBarConstantData = {
    [key in PPCStatusBarType]: {
        imgSrc: string;
        backgroundColor: string;
        leftBorderColor: string;
    };
};