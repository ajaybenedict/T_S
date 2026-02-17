import { inject, Injectable } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { DialogType, PPCDialogData } from "src/app/models/ppc-dialog-data.model";
import { PpcDialogComponent } from "src/app/shared/ppc-dialog/ppc-dialog.component";
import { APP_ROUTE_CONFIG_URL, DOCUMENT_URL } from "../constants/constants";

@Injectable({ providedIn: 'root' })

export class PermissionsLoaderDialogService {

    readonly dialog = inject(MatDialog);
    private dialogRef: MatDialogRef<PpcDialogComponent> | null = null;

    showDialog(type: DialogType) {
        this.openDialog(type);
    }

    closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
      this.dialogRef = null;
    }
  }

    private openDialog(type: DialogType) {
        this.closeDialog();
        const EasyVistaHelpLink = `Please submit an
                <a target="_blank" class="s1-no-underline s1-C-LegacyOcean" href="${DOCUMENT_URL.EASY_VISTA}">EasyVista</a> 
                ticket to request access.`;

        const LoginBackLink = `Please <a href="${APP_ROUTE_CONFIG_URL.SSO}" class="s1-no-underline s1-C-LegacyOcean">Log in</a> again to continue.`;

        const defaultDialogSize = { width: '480px', height: '244px' };
        const loaderDialogSize = { width: '480px', height: '152px' };

        const dialogConfigMap: Partial<Record<DialogType, PPCDialogData>> = {
            Loader: {
                content: 'Please wait a few moments for the page to load',
                loadingText: 'Loading',
                type: 'Loader',
            },
            PermissionError: {
                content: `You do not have permission to perform this action. ${EasyVistaHelpLink}`,
                loadErrorMsg: '<span>Uh-oh! Permission Needed</span>',
                header: 'Restricted Access',
                type: 'PermissionError',
            },
            UserDeactivated: {
                content: `Your account has been deactivated. ${EasyVistaHelpLink}`,
                loadErrorMsg: '<span>Uh-oh! Account Deactivated</span>',
                header: 'Restricted Access',
                type: 'UserDeactivated',
            },
            UserNotFound: {
                content: `You do not have access to this application. ${EasyVistaHelpLink}`,
                loadErrorMsg: '<span>Uh-oh! Account Not Found</span>',
                header: 'Restricted Access',
                type: 'UserNotFound',
            },
            InternalServerError: {
                content: `We are not able to process your request at the moment. Please try again later.`,
                loadErrorMsg: '<span>Uh-oh! Internal Server Error</span>',
                header: 'Internal Server Error',
                type: 'InternalServerError',
            },
            NoCountryRegionAccess: {
                content: `No country/region access. ${EasyVistaHelpLink}`,
                loadErrorMsg: '<span>Uh-oh! Country/Region Access Needed</span>',
                header: 'Restricted Access',
                type: 'NoCountryRegionAccess',
            },
            SessionExpired: {
              content: `${LoginBackLink}`,
              loadErrorMsg: '<span>Uh-oh! oauth session expired</span>',
              header: 'Session Expired',
              type: 'SessionExpired',
          },
        };

        const data = dialogConfigMap[type];
        if (!data) {
            throw new Error(`Unhandled dialog type: ${type}`);
        }

        const size = type === 'Loader' ? loaderDialogSize : defaultDialogSize;
        const dialogData = { ...size, data };

        this.dialogRef = this.dialog.open(PpcDialogComponent, { ...dialogData, disableClose: false, closeOnNavigation: false });
    }

}
