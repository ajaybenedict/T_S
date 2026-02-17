import { HOSTNAME_INT, HOSTNAME_UAT,  HOSTNAME_PROD, HOSTNAME_LOCAL} from "./constants";

export function resolveEnvironment() {
   const hostName = new URL(window.location.href).hostname;    
              if (hostName === HOSTNAME_INT) {
                return{REMOTE_ENTRY_URL: 'https://' + HOSTNAME_INT + '/cbc/remoteEntry.js'};
              }
              else if (hostName === HOSTNAME_UAT) {
                return{REMOTE_ENTRY_URL: 'https://' + HOSTNAME_UAT + '/cbc/remoteEntry.js'};
              }
              else if (hostName === HOSTNAME_PROD) {
                return{REMOTE_ENTRY_URL:'https://' + HOSTNAME_PROD + '/cbc/remoteEntry.js'};
              }
              else {
                return{REMOTE_ENTRY_URL:'http://' +  HOSTNAME_LOCAL  + ':4200/cbc/remoteEntry.js'};
              }
}
