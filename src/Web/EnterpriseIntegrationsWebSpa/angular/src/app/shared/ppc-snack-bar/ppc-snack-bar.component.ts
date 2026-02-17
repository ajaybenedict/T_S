import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { PpcSnackBarService } from 'src/app/core/services/ppc-snack-bar.service';

@Component({
  selector: 'app-ppc-snackbar',
  templateUrl: './ppc-snack-bar.component.html',
  styleUrls: ['./ppc-snack-bar.component.css']
})
export class PpcSnackBarComponent {

  declare message: string;

  constructor(
    private snackBarService: PpcSnackBarService,
    private sanitizer: DomSanitizer,
  ) {}

  get sanitizedContent() {
    return this.sanitizer.bypassSecurityTrustHtml(this.message);
  }

  dismiss() {
    this.snackBarService.dismiss();
  }

}
