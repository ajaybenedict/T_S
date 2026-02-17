export interface PPCDialogData {
  header?: string;
  content: string;
  type: DialogType;
  fileName?: string;
  loadErrorMsg?: string;
  validationErrorMsg?: string;
  loadingText?: string;
  primaryBtnName?: string;
  primaryBtnAction?: string;
  secondaryBtnName?: string;
  secondaryBtnAction?: string;
  hasRadioButton?: boolean; // supports only 2 buttons as of now.
  radioGroup?: DialogRadioBtn[];
  radioLabel?: string;
}

interface DialogRadioBtn {
  displayName: string;
  value: string;
}

export type DialogType =
  'FileName' |
  'ValidationError' |
  'Loader' |
  'LoadError' |
  'UserNotFound' |
  'UserDeactivated' |
  'NoCountryRegionAccess' |
  'InternalServerError' |
  'PermissionError' |
  'Confirmation' |
  'RuleEngineConfirmation' |
  'RuleEngineConfirmationWithRadioBtn' |
  'SessionExpired';