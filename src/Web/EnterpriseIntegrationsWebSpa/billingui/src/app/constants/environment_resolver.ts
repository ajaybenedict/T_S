import { HOSTNAME_INT, HOSTNAME_UAT, HOSTNAME_PROD, HOSTNAME_LOCAL, API_BASE_URL_INT, API_BASE_URL_UAT, API_BASE_URL_PROD, API_CORE, API_V1 } from "./constants";

export function resolveEnvironment() {
  const hostName = new URL(window.location.href).hostname;
  if (hostName === HOSTNAME_INT) {
    return {
      REMOTE_ENTRY_URL: 'https://' + HOSTNAME_INT + '/remoteEntry.js',
      API_ENTRY_URL: 'https://' + API_BASE_URL_INT + API_CORE + API_V1,
      REMOTE_BASE: 'https://' + HOSTNAME_INT + '/cbc/',
      HOST_BASE: 'https://' + HOSTNAME_INT + '/'
    };

  }
  else if (hostName === HOSTNAME_UAT) {
    return {
      REMOTE_ENTRY_URL: 'https://' + HOSTNAME_UAT + '/remoteEntry.js',
      API_ENTRY_URL: 'https://' + API_BASE_URL_UAT + API_CORE +  API_V1,
      REMOTE_BASE: 'https://' + HOSTNAME_UAT + '/cbc/',
      HOST_BASE: 'https://' + HOSTNAME_UAT + '/'
    };
  }
  else if (hostName === HOSTNAME_PROD) {
    return {
      REMOTE_ENTRY_URL: 'https://' + HOSTNAME_PROD + '/remoteEntry.js',      
      API_ENTRY_URL:'https://' + API_BASE_URL_PROD + API_CORE +  API_V1,
      REMOTE_BASE: 'https://' + HOSTNAME_PROD + '/cbc/',
      HOST_BASE: 'https://' + HOSTNAME_PROD + '/'
    };
  }
  else {
    return {
      REMOTE_ENTRY_URL: 'http://' + HOSTNAME_LOCAL + ':4000/remoteEntry.js',
      API_ENTRY_URL: 'https://' + API_BASE_URL_INT + API_CORE +  API_V1,
      REMOTE_BASE: 'http://' + HOSTNAME_LOCAL + ':4200/cbc/',
      HOST_BASE: 'http://' + HOSTNAME_LOCAL + ':4000/'
    };
  }
}