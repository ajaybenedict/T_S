import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ppc-card',
  templateUrl: './ppc-card.component.html',
  styleUrls: ['./ppc-card.component.css']
})
export class PpcCardComponent {

  @Input('headerImgSrc') _headerImgSrc !: string;
  @Input('comingSoonText') _comingSoonText!: string;
  @Input('contentHeader') _contentHeader !: string;
  @Input('contentDesc') _contentDesc !: string;
  @Input('actionText') _actionText !: string;
  @Input('actionImgSrc') _actionImgSrc !: string;
  @Input('isActive') _isActive !: boolean;
  @Input('navigateURL') _navigateURL !: string;

  constructor(
    private router: Router,
  ){}

  navigate() {
    if(this._isActive) {      
      if(this._navigateURL != undefined) {
        this.router.navigate([this._navigateURL]);
      } else {
        console.log('Navigation URL not defined');
      }
    }
  }
}
