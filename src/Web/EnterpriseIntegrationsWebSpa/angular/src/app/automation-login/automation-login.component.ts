import { Component } from '@angular/core';
import { SsoService } from '../core/services/sso.service';
import { PermissionsLoaderDialogService } from '../core/services/permissions-loader-dialog.service';
import { SsoLoginService } from '../core/services/sso.login.service';

@Component({
  selector: 'app-automation-login',
  templateUrl: './automation-login.component.html',
  styleUrls: ['./automation-login.component.css']
})
export class AutomationLoginComponent {
  email: string = '';
  password: string = '';

  constructor(
    private readonly ssoService: SsoService,
    private readonly dialogSVC: PermissionsLoaderDialogService,
    private readonly ssoLoginService: SsoLoginService
  ) { }

  onLogin() {
    this.dialogSVC.showDialog('Loader');
    let payload = { email: this.email, password: this.password };
    this.ssoService.automationLogin(payload).subscribe({
      next: (res) => {
        this.ssoLoginService.handleSsoSuccess(res);
        this.dialogSVC.closeDialog();
      },
      error: (error) => this.ssoLoginService.handleSsoError(error)
    });
  }
}
