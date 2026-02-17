import { loadRemoteModule } from '@angular-architects/module-federation';
import { Overlay } from '@angular/cdk/overlay';
import { Injector } from '@angular/core';
import { REMOTE_ENTRY_URL } from '../constants/constants';
export async function showRemoteSnackBar(injector: Injector) {
  

   const m = await loadRemoteModule({
        type: 'module',
        remoteEntry:REMOTE_ENTRY_URL,
        exposedModule: './PpcSnackBarService',
      });

  const snackBarService = new m.PpcSnackBarService(injector.get(Overlay));
  snackBarService.show('Snack bar from remote MFE!');
}
