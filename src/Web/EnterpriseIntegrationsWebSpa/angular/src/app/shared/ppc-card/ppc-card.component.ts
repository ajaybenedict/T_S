import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-ppc-card',
  templateUrl: './ppc-card.component.html',
  styleUrls: ['./ppc-card.component.css']
})
export class PpcCardComponent {

  @Input() headerImgSrc !: string;
  @Input() comingSoonText!: string;
  @Input() contentHeader !: string;
  @Input() contentDesc !: string;
  @Input() actionText !: string;
  @Input() actionImgSrc !: string;
  @Input() isActive !: boolean;
  @Input() navigateURL !: string;

  constructor(
    private router: Router,
  ){}

  navigate() {
    if(this.isActive) {      
      if(this.navigateURL != undefined) {
        this.router.navigate([this.navigateURL]);
      } else {
        console.log('Navigation URL not defined');
      }
    }
  }
}
