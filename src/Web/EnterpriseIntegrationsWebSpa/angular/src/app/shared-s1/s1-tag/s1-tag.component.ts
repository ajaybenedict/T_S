import { Component, Input } from '@angular/core';
import { S1TagType } from 'src/app/models/s1/s1-tag.interface';

@Component({
  selector: 's1-tag',
  template: `<div class="d-flex s1-P-4-8-px s1-BR-4px s1-border-all-1px-{{color}}">
                <span class="s1-FW400 s1-FS10px s1-C-{{color}}">{{value}}</span>
            </div>`,
})
export class S1TagComponent {
  @Input() value = '';
  @Input() color: S1TagType = 'Teal';
}
