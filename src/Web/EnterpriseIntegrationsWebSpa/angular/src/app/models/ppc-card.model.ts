export interface PPCCardData {
    headerImgSrc: string;
    comingSoonText: string;
    contentHeader: string;
    contentDesc: string;
    actionText: string;
    actionImgSrc: string;
    isActive: boolean;
    navigateURL: string;
    applicationType?: string;
}

export enum PPCCardCategory {
    General = 'General',
    Insights = 'StreamOne Insight',
    CloudTools = 'StreamOne Cloud Tools'
};
