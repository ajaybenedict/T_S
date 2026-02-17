import { Component, ElementRef, ViewChild } from '@angular/core';


@Component({
  selector: 'app-info-tool-tip',
  templateUrl: './info-tool-tip.component.html',
  styleUrls: ['./info-tool-tip.component.css']
})
export class InfoToolTipComponent {

  title = '';
  content = '';
  visible = false;
  arrowLeft = 0;

  @ViewChild('popover', { static: false }) popover!: ElementRef;

  show(title: string, content: string) {
    this.title = title;
    this.content = content;
    this.visible = true;

    setTimeout(() => {
      if (!this.popover) return;

      const popRect = this.popover.nativeElement.getBoundingClientRect();

      this.arrowLeft = popRect.width / 2 - 8;
    });
  }

  hide() {
    this.visible = false;
  }

}