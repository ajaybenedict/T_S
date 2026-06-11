import { Component, SecurityContext } from '@angular/core';
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

  /**
   * Sanitizes snackbar HTML and returns safe markup for [innerHTML].
   */
  get sanitizedContent() {
    return this.sanitizer.sanitize(SecurityContext.HTML, this.message) ?? '';
  }

  dismiss() {
    this.snackBarService.dismiss();
  }

}
