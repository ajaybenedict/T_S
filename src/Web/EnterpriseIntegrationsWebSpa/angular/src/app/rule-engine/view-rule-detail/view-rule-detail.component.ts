import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PermissionsEnum } from 'src/app/core/config/permissions.config';
import { DataState } from 'src/app/core/services/data-state';
import { RuleDetail } from 'src/app/models/rule-engine/rule-engine';

@Component({
  selector: 'app-view-rule-detail',
  templateUrl: './view-rule-detail.component.html',
  styleUrls: ['./view-rule-detail.component.css']
})
export class ViewRuleDetailComponent {

  @Input() ruleData: RuleDetail | null = null;
  @Input() isDraft = false;
  @Output() actionEmitter = new EventEmitter<string>();

  hasEditAccess = this.dataState.hasPermission([PermissionsEnum.RuleEditor]);

  constructor (
    private readonly dataState: DataState,
  ) {}

  actionClickHandler(event: string) {
    this.actionEmitter.emit(event);
  }

}
