export interface SubsTransferCustomerPreviewRow {
  region: string;
  customerTenantId: string;
  sourcePartnerName: string;
  sourcePartnerTenantId: string;
  customerEmailId: string;
}

export interface SubsTransferFormValues {
  region: string | null;
  transferType: string | null;
  mpnId: string;
  sourcePartnerTenantId: string;
  sourcePartnerName: string;
  email: string;
  requestedBy: string;
}

export interface SubsTransferCustomerPreviewPanelData {
  rows: SubsTransferCustomerPreviewRow[];
  formValues: SubsTransferFormValues;
}
