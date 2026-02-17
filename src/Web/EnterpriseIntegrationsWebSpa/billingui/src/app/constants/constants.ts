import { resolveEnvironment } from "./environment_resolver";

export const HOSTNAME_INT = 'int-streamone-hub.tdsynnex.org';
export const HOSTNAME_UAT = 'uat-streamone-hub.tdsynnex.org';
export const HOSTNAME_PROD = 'streamone-hub.tdsynnex.org';
export const HOSTNAME_LOCAL = 'localhost';

export const API_BASE_URL_LOCAL = 'localhost';
export const API_BASE_URL_INT = 'int-streamone-api.tdsynnex.org';
export const API_BASE_URL_UAT = 'uat-streamone-api.tdsynnex.org';
export const API_BASE_URL_PROD = 'streamone-api.tdsynnex.org';

export const API_CORE = '/core-billingconnector';
export const API_V1 = '/api/v1';
export const API_BASE_CONTROLLER = '/BillingOrdersApi';


export const REMOTE_ENTRY_URL = resolveEnvironment().REMOTE_ENTRY_URL;
export const API_ENTRY_URL = resolveEnvironment().API_ENTRY_URL;
export const REMOTE_ENTRY_BASEURL = resolveEnvironment().REMOTE_BASE;
export const HOST_ENTRY_BASEURL = resolveEnvironment().HOST_BASE;



export const ACTION_STATUS_TYPE_MAP: Record<string, number> = {
  Approve: 1,
  Decline: 7
};