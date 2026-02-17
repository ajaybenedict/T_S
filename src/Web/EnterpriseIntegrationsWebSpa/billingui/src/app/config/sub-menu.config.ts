import { SubMenuItem } from "../interface/button.interface";

const BillingListItem = {
  hasName: true,
  displayName: 'Billing List',
  hasIcon: true,
  iconURL: '/assets/billing_list.svg',
  onClickEmit: 'BillingList'
};

const ApproveItem = {
  hasName: true,
  displayName: 'Approve',
  hasIcon: true,
  iconURL: '/assets/cbc/approve.svg',
  onClickEmit: 'Approve'
};

const DeclineItem = {
  hasName: true,
  displayName: 'Decline',
  hasIcon: true,
  iconURL: '/assets/cbc/decline.svg',
  onClickEmit: 'Decline'
};

const DeleteItem = {
  hasName: true, 
  displayName: 'Delete', 
  hasIcon: true, 
  iconURL: '/assets/delete.svg', 
  onClickEmit: 'Delete'
};


const DownloadItem = {
  hasName: true, 
  displayName: 'CSV Download', 
  hasIcon: true, 
  iconURL: '/assets/download_arrow_24_24.svg', 
  onClickEmit: 'Download'
};

export const SubMenuConfig: Record<string, SubMenuItem[]> = {
  Declined: [ApproveItem, BillingListItem],
  Approved: [DeclineItem, BillingListItem],
  default: [DeleteItem, DownloadItem]
};
