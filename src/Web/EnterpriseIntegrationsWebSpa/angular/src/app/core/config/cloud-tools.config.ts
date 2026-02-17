import { CloudToolsSidePanelDetailsTabData, CloudToolsTaskIdEnum, NewTaskBtnMenu } from "src/app/models/cloud-tools/cloud-tools.interface";
import { S1Checkbox } from "src/app/models/s1/s1-filter-checkbox.interface";
import { DOCUMENT_URL } from "../constants/constants";
import { PermissionsEnum } from "./permissions.config";

export const cloudToolsSidePanelTabsConfig: CloudToolsSidePanelDetailsTabData = {
    Details: {
        displayName: 'Details',
        onClickEvent: 'Details',
    },
};

export const taskTypeData: S1Checkbox[] = [
    { displayName: 'Sub Transfer', key: 'subTransfer', checked: false },
    { displayName: 'PCR Cleanup', key: 'pcrCleanup', checked: false },
    { displayName: 'Sandbox Cleanup', key: 'sandboxCleanup', checked: false },
    { displayName: 'Update MpnID', key: 'updateMpnId', checked: false }
];

export type CloudTools = 'EST' | 'PCR' | 'Sandbox';

export const uploadAPIURL: Record<CloudTools, string> = {
    EST: 'updatelcm',
    PCR: 'pcrcleanup',
    Sandbox: 'sandboxcleanup',
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
    }
};

export const CLOUD_TOOLS_PERMISSION_MAP: Record<CloudTools, PermissionsEnum> = {
  EST: PermissionsEnum.ESTManager,
  PCR: PermissionsEnum.PCRCleanUp,
  Sandbox: PermissionsEnum.SandBoxCleanUp,
};


export const CLOUD_TOOL_PERMISSION_MAP: Record<CloudToolsTaskIdEnum, PermissionsEnum> = {
  [CloudToolsTaskIdEnum.LCMUpdate]: PermissionsEnum.ESTManager,
  [CloudToolsTaskIdEnum.SandBoxCleanUp]: PermissionsEnum.SandBoxCleanUp,
  [CloudToolsTaskIdEnum.PCRCleanup]: PermissionsEnum.PCRCleanUp,
};

export enum CloudToolType {
  EST = 'EST',
  SandboxCleanup = 'SandboxCleanup',
  PCRCleanup = 'PCRCleanup',
}

export class CloudToolsOperationFactory {

  static getOperationsTools(): S1Checkbox[] {
    return [
      {displayName: 'EST Manager', key: CloudToolsTaskIdEnum.LCMUpdate, checked: false},
      {displayName: 'PCR Cleanup', key: CloudToolsTaskIdEnum.PCRCleanup, checked: false},
      {displayName: 'Sandbox Cleanup', key: CloudToolsTaskIdEnum.SandBoxCleanUp, checked: false}
    ]
  }
}
