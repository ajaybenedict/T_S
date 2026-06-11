import { CloudToolsSidePanelDetailsTabData, CloudToolsTaskIdEnum, NewTaskBtnMenu } from "src/app/models/cloud-tools/cloud-tools.interface";
import { S1Checkbox } from "src/app/models/s1/s1-filter-checkbox.interface";
import { CLOUD_TOOLS_ROUTE, DOCUMENT_URL } from "../constants/constants";
import { PermissionsEnum } from "./permissions.config";
import { SelectDropdown } from "src/app/models/select-dropdown.interface";

export const cloudToolsSidePanelTabsConfig: CloudToolsSidePanelDetailsTabData = {
    Details: {
        displayName: 'Details',
        onClickEvent: 'Details',
    },
};

export type CloudTools = 'EST' | 'PCR' | 'Sandbox' | 'UpdateMPNID' | 'SubscriptionTransfer';

export const uploadAPIURL: Record<CloudTools, string> = {
    EST: 'updatelcm',
    PCR: 'pcrcleanup',
    Sandbox: 'sandboxcleanup',
    UpdateMPNID: 'updatempnid',
    SubscriptionTransfer: 'subscriptiontransfer/accept',
};

export const uploadButtonData: Record<CloudTools, NewTaskBtnMenu> = {
    EST: {
        display: 'EST Manager',
        emit: 'EST',
        uploadAPIURL: uploadAPIURL.EST,
        uploadTemplateURL: DOCUMENT_URL.EST_TEMPLATE,
    },
    PCR: {
        display: 'PCR Cleanup',
        emit: 'PCR',
        uploadAPIURL: uploadAPIURL.PCR,
        uploadTemplateURL: DOCUMENT_URL.PCR_TEMPLATE,
    },
    Sandbox: {
        display: 'Sandbox Cleanup',
        emit: 'Sandbox',
        uploadAPIURL: uploadAPIURL.Sandbox,
        uploadTemplateURL: DOCUMENT_URL.SANDBOX_TEMPLATE,
    },
    UpdateMPNID: {
        display: 'Update MpnID',
        emit: 'UpdateMPNID',
        uploadAPIURL: uploadAPIURL.UpdateMPNID,
        uploadTemplateURL: DOCUMENT_URL.UPDATE_MPNID_TEMPLATE,
    },
    SubscriptionTransfer: {
        display: 'Subscription Transfer',
        emit: 'SubscriptionTransfer',
        uploadAPIURL: 'subscription-transfer',
        uploadTemplateURL: '', // No template for subscription transfer
    },
};

export const CLOUD_TOOLS_PERMISSION_MAP: Record<CloudTools, PermissionsEnum> = {
  EST: PermissionsEnum.ESTManager,
  PCR: PermissionsEnum.PCRCleanUp,
  Sandbox: PermissionsEnum.SandBoxCleanUp,
  UpdateMPNID: PermissionsEnum.UpdateMPNID,
  SubscriptionTransfer: PermissionsEnum.SubscriptionTransfer,
};


export const CLOUD_TOOL_PERMISSION_MAP: Record<CloudToolsTaskIdEnum, PermissionsEnum> = {
  [CloudToolsTaskIdEnum.LCMUpdate]: PermissionsEnum.ESTManager,
  [CloudToolsTaskIdEnum.SandBoxCleanUp]: PermissionsEnum.SandBoxCleanUp,
  [CloudToolsTaskIdEnum.PCRCleanup]: PermissionsEnum.PCRCleanUp,
  [CloudToolsTaskIdEnum.UpdateMPNID]: PermissionsEnum.UpdateMPNID,
  [CloudToolsTaskIdEnum.SubscriptionTransfer]: PermissionsEnum.SubscriptionTransfer,
};

export enum CloudToolType {
  EST = 'EST',
  SandboxCleanup = 'SandboxCleanup',
  PCRCleanup = 'PCRCleanup',
  UpdateMPNID = 'UpdateMPNID',
  SubscriptionTransfer = 'SubscriptionTransfer',
}

export class CloudToolsOperationFactory {

  static getOperationsTools(): S1Checkbox[] {
    return [
      {displayName: 'EST Manager', key: CloudToolsTaskIdEnum.LCMUpdate, checked: false},
      {displayName: 'PCR Cleanup', key: CloudToolsTaskIdEnum.PCRCleanup, checked: false},
      {displayName: 'Sandbox Cleanup', key: CloudToolsTaskIdEnum.SandBoxCleanUp, checked: false},
      {displayName: 'Update MpnID', key: CloudToolsTaskIdEnum.UpdateMPNID, checked: false},
    ]
  }
}

export const routeToCloudToolsTaskId: Record<string, CloudToolsTaskIdEnum> = {
  [CLOUD_TOOLS_ROUTE.EST_MANAGER]: CloudToolsTaskIdEnum.LCMUpdate,
  [CLOUD_TOOLS_ROUTE.PCR_CLEANUP]: CloudToolsTaskIdEnum.PCRCleanup,
  [CLOUD_TOOLS_ROUTE.SANDBOX_CLEANUP]: CloudToolsTaskIdEnum.SandBoxCleanUp,
  [CLOUD_TOOLS_ROUTE.UPDATE_MPNID]: CloudToolsTaskIdEnum.UpdateMPNID,
  [CLOUD_TOOLS_ROUTE.SUBS_TRANSFER]: CloudToolsTaskIdEnum.SubscriptionTransfer,
};

export const subscriptionTransferTypeDropdownOptions: SelectDropdown[] = [
  {
    label: 'All',
    value: 'All',
  },
  {
    label: 'New Commerce',
    value: 'NewCommerce',
  },
];

export const enum DashboardTabEnum {
  Success = 0,
  InProgress = 1,
  Failed = 2
};
