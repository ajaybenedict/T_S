import { HOSTNAME_INT, HOSTNAME_UAT, HOSTNAME_PROD, HOSTNAME_LOCAL, API_BASE_URL_INT, API_BASE_URL_UAT, API_BASE_URL_PROD, API_CORE, API_V1, API_BASE_URL_LOCAL } from "./constants";

export function resolveEnvironment() {
  const hostName = new URL(window.location.href).hostname;
  const isLocal = hostName === 'localhost' || hostName === '127.0.0.1';
  const protocol = isLocal ? 'http' : 'https';

  if (hostName === HOSTNAME_INT) {
    return {
      REMOTE_ENTRY_URL: 'https://' + HOSTNAME_INT + '/remoteEntry.js',
      API_ENTRY_URL: 'https://' + API_BASE_URL_INT + API_CORE + API_V1,
      REMOTE_BASE: 'https://' + HOSTNAME_INT + '/cbc/',
      HOST_BASE: 'https://' + HOSTNAME_INT + '/'
    };
  }
  if (hostName === HOSTNAME_UAT) {
    return {
      REMOTE_ENTRY_URL: 'https://' + HOSTNAME_UAT + '/remoteEntry.js',
      API_ENTRY_URL: 'https://' + API_BASE_URL_UAT + API_CORE +  API_V1,
      REMOTE_BASE: 'https://' + HOSTNAME_UAT + '/cbc/',
      HOST_BASE: 'https://' + HOSTNAME_UAT + '/'
    };
  }
  if (hostName === HOSTNAME_PROD) {
    return {
      REMOTE_ENTRY_URL: 'https://' + HOSTNAME_PROD + '/remoteEntry.js',      
      API_ENTRY_URL:'https://' + API_BASE_URL_PROD + API_CORE +  API_V1,
      REMOTE_BASE: 'https://' + HOSTNAME_PROD + '/cbc/',
      HOST_BASE: 'https://' + HOSTNAME_PROD + '/'
    };
  }
   if (isLocal) {
    return {
      REMOTE_ENTRY_URL: protocol + '://' + HOSTNAME_LOCAL + ':4000/remoteEntry.js',
      API_ENTRY_URL: protocol + '://' + API_BASE_URL_LOCAL +  API_V1,
      REMOTE_BASE: protocol + '://' + HOSTNAME_LOCAL + ':4200/cbc/',
      HOST_BASE: protocol + '://' + HOSTNAME_LOCAL + ':4000/'
    };
  }
  throw new Error(`Unknown environment: ${hostName}`);
}