import { ApprovalTypeFilter, ApprovalTypeFilterEnum } from "src/app/models/ppc/ppc-filter.interface";

const approvalType = ApprovalTypeFilterEnum;

export const approvalTypeFilterConfig: ApprovalTypeFilter[] = [
    {
        displayName: 'Manual',
        key: approvalType.Manual,
        description: "Requires manual review and approval before processing."
    },
    {
        displayName: 'Auto',
        key: approvalType.Auto,
        description: "Instantly approved without ERP or manual intervention."
    },
    {
        displayName: 'ERP',
        key: approvalType.ERP,
        description: "Automatically approved via ERP system—no manual action needed."
    },
];