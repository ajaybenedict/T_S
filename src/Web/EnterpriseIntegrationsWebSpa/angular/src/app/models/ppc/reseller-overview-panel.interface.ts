import { S1TagType } from "../s1/s1-tag.interface";

export interface ResellerOverviewPanel {
    header: ResellerOverviewPanelHeader;
    creditInfo: ResellerOverviewCreditInfo;
    riskInsurance: ResellerOverviewRiskInsurance;
    paymentDunning: ResellerOverviewPaymentDunning;
}

export interface ResellerOverviewSidePanelData {
    resellerOverview?: ResellerOverviewPanel;
}

export interface ResellerOverviewPanelHeader {
    resellerName: string;
    resellerId: string;
    currency: string;
    country: string;
}

export interface ResellerOverviewCreditInfo {
    creditLimit: number;
    creditUsed: number;
    creditAvailable: number;
}

export interface ResellerOverviewRiskInsurance {
    riskClassType: S1TagType;
    riskClassValue: string;
    ownRisk: number;
    moodys: number;
    insurance: number;
    allianzGradeType: S1TagType;
    allianzGradeValue: string;
    status: string;
    customerType: string;
    insuredAmount: number;
}

export interface ResellerOverviewPaymentDunning {
    dunningLevelType: S1TagType;
    dunningLevelValue: string;
    totalDue: number;
    pastDue: number;
    paymentTerm: string; //may change in future to any enum or type based on the data we get from backend
    specialLiabilities: number;
    nextReviewDate: string;
    analystName: string;
}

export interface ResellerOverviewValueKeyConfig<T extends object> {
    valueKey: keyof T;
    tagTypeKey?: keyof T;
}

export interface ResellerOverviewPanelFieldConfig {
    creditInfo: ReadonlyArray<ResellerOverviewValueKeyConfig<ResellerOverviewCreditInfo>>;
    riskInsurance: ReadonlyArray<ResellerOverviewValueKeyConfig<ResellerOverviewRiskInsurance>>;
    paymentDunning: ReadonlyArray<ResellerOverviewValueKeyConfig<ResellerOverviewPaymentDunning>>;
}

export type ResellerOverviewPanelSectionKey = Exclude<keyof ResellerOverviewPanel, 'header'>;

export const ResellerOverviewPanelTitles: Record<ResellerOverviewPanelSectionKey, { title: string; subtitles: readonly string[] }> = {
    creditInfo: {
        title: 'Credit Information',
        subtitles: ['Credit Limit', 'Credit Used', 'Credit Available'],
    },
    riskInsurance: {
        title: 'Risk & Insurance',
        subtitles: ['Risk Class', 'Own Risk', 'Moody\'s', 'Insurance', 'Allianz Grade', 'Status', 'Customer Type', 'Insured Amount'],
    },
    paymentDunning: {
        title: 'Payment & Dunning',
        subtitles: ['Dunning Level', 'Total Due', 'Past Due', 'Payment Term', 'Special Liabilities', 'Next Review Date', 'Analyst Name'],
    },
};

// Field order is aligned with ResellerOverviewPanelTitles subtitles.
export const ResellerOverviewPanelFields: ResellerOverviewPanelFieldConfig = {
    creditInfo: [
        { valueKey: 'creditLimit' },
        { valueKey: 'creditUsed' },
        { valueKey: 'creditAvailable' },
    ],
    riskInsurance: [
        { valueKey: 'riskClassValue', tagTypeKey: 'riskClassType' },
        { valueKey: 'ownRisk' },
        { valueKey: 'moodys' },
        { valueKey: 'insurance' },
        { valueKey: 'allianzGradeValue', tagTypeKey: 'allianzGradeType' },
        { valueKey: 'status' },
        { valueKey: 'customerType' },
        { valueKey: 'insuredAmount' },
    ],
    paymentDunning: [
        { valueKey: 'dunningLevelValue', tagTypeKey: 'dunningLevelType' },
        { valueKey: 'totalDue' },
        { valueKey: 'pastDue' },
        { valueKey: 'paymentTerm' },
        { valueKey: 'specialLiabilities' },
        { valueKey: 'nextReviewDate' },
        { valueKey: 'analystName' },
    ],
};
// Mock can be removed during API integration, it's currently used to develop and test the component in isolation.
export const ResellerOverviewPanelMockData: ResellerOverviewPanel = {
    header: {
        resellerName: 'Contoso Reseller Ltd',
        resellerId: '1234567890',
        currency: 'USD',
        country: 'US',
    },
    creditInfo: {
        creditLimit: 950000,
        creditUsed: 245000,
        creditAvailable: 705000,
    },
    riskInsurance: {
        riskClassType: 'Sunset',
        riskClassValue: 'Medium Risk',
        ownRisk: 170000,
        moodys: 8,
        insurance: 225000,
        allianzGradeType: 'Teal',
        allianzGradeValue: 'Grade A',
        status: 'Active',
        customerType: 'Enterprise',
        insuredAmount: 300000,
    },
    paymentDunning: {
        dunningLevelType: 'Cherry',
        dunningLevelValue: 'Level 3',
        totalDue: 120000,
        pastDue: 45000,
        paymentTerm: 'Net 30',
        specialLiabilities: 9000,
        nextReviewDate: '2026-08-15',
        analystName: 'Alex Morgan',
    },
};