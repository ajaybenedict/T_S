import { SubsTransferTypeEnum, SubsTransferUploadRequest } from 'src/app/models/cloud-tools/cloud-tools.interface';
import { SubsTransferFormValues } from 'src/app/models/cloud-tools/subs-transfer-preview.interface';
import { SelectDropdown } from 'src/app/models/select-dropdown.interface';

export type SubsTransferRawLikeFormValues = Omit<SubsTransferFormValues, 'region' | 'transferType'> & {
  region: SelectDropdown | string | null;
  transferType: SelectDropdown | string | null;
};

function toDropdownValue(option: SelectDropdown | string | null | undefined): string {
  if (typeof option === 'string') {
    return option;
  }

  return option?.value ?? '';
}

export function normalizeSubsTransferFormValues(formValue: SubsTransferRawLikeFormValues): SubsTransferFormValues {
  return {
    region: toDropdownValue(formValue.region).trim(),
    transferType: toDropdownValue(formValue.transferType).trim(),
    mpnId: String(formValue.mpnId ?? '').trim(),
    sourcePartnerTenantId: String(formValue.sourcePartnerTenantId ?? '').trim(),
    sourcePartnerName: String(formValue.sourcePartnerName ?? 'tdsynnexpartner').trim(),
    email: String(formValue.email ?? '').trim(),
    requestedBy: String(formValue.requestedBy ?? '').trim(),
  };
}

export function buildSubsTransferUploadPayload(formValues?: SubsTransferFormValues | null): SubsTransferUploadRequest | null {
  if (!formValues) {
    return null;
  }

  const normalizedValues = normalizeSubsTransferFormValues(formValues);
  const transferType = String(normalizedValues.transferType ?? '').trim();
  const mpnIdRaw = String(normalizedValues.mpnId ?? '').trim();
  const mpnId = Number(mpnIdRaw);

  if (
    !normalizedValues.region ||
    !normalizedValues.sourcePartnerTenantId ||
    !normalizedValues.sourcePartnerName ||
    !normalizedValues.email ||
    !/^\d+$/.test(mpnIdRaw) ||
    !Number.isFinite(mpnId)
  ) {
    return null;
  }

  if (transferType !== SubsTransferTypeEnum.All && transferType !== SubsTransferTypeEnum.NewCommerce) {
    return null;
  }

  return {
    region: normalizedValues.region,
    transferType: transferType as SubsTransferTypeEnum,
    mpnId: mpnIdRaw,
    sourcePartnerTenantId: normalizedValues.sourcePartnerTenantId,
    sourcePartnerName: normalizedValues.sourcePartnerName,
    customerEmail: normalizedValues.email,
    requestedBy: normalizedValues.requestedBy,
  };
}
