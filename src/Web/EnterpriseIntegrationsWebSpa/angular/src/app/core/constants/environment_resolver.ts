import { HOSTNAME_INT, HOSTNAME_UAT,  HOSTNAME_PROD, HOSTNAME_LOCAL} from "./constants";

export function resolveEnvironment() {
  const hostName = window.location.hostname;
  const isLocal = hostName === 'localhost' || hostName === '127.0.0.1';
  const protocol = isLocal ? 'http' : 'https';

  if (hostName === HOSTNAME_INT) {
    return { REMOTE_ENTRY_URL: `https://${HOSTNAME_INT}/cbc/remoteEntry.js`,
    REMOTE_BASE_URL: 'https://' + HOSTNAME_INT + '/cbc/' };
  }

  if (hostName === HOSTNAME_UAT) {
    return { REMOTE_ENTRY_URL: `https://${HOSTNAME_UAT}/cbc/remoteEntry.js`,
    REMOTE_BASE_URL: 'https://' + HOSTNAME_UAT + '/cbc/' };
  }

  if (hostName === HOSTNAME_PROD) {
    return { REMOTE_ENTRY_URL: `https://${HOSTNAME_PROD}/cbc/remoteEntry.js`,
    REMOTE_BASE_URL: 'https://' + HOSTNAME_PROD + '/cbc/' };
  }
 
  if (isLocal) {
    return {
      REMOTE_ENTRY_URL: `${protocol}://${HOSTNAME_LOCAL}:4200/cbc/remoteEntry.js`,
      REMOTE_BASE_URL: `${protocol}://${HOSTNAME_LOCAL}:4200/cbc/`
    };
  }

  throw new Error(`Unknown environment: ${hostName}`);
}