import { Component, Input, OnInit } from '@angular/core';
import { RuleExpression, RuleExpressionUI } from 'src/app/models/rule-engine/rule-engine';
import { RuleEngineExpressionHelper } from '../rule-engine-helper';

@Component({
  selector: 'app-view-rule',
  templateUrl: './view-rule.component.html',
  styleUrls: ['./view-rule.component.css']
})
export class ViewRuleComponent implements OnInit {
  @Input() inputData: RuleExpression[] = [];
  @Input() action!: string;
  
  expressions: RuleExpressionUI[] = [];
  firstRow!: RuleExpressionUI;
  otherRows!: RuleExpressionUI[];
  actionImg: string | null = null;

  ngOnInit(): void {
    this.expressions = RuleEngineExpressionHelper.apiToUi(this.inputData)
    this.firstRow = this.expressions[0];
    this.otherRows = this.expressions.length > 1 ? this.expressions.slice(1) : [];
    switch(this.action) {
      case 'Approve':
        this.actionImg = '/assets/Approve.svg';
        break;
      case 'Decline':
        this.actionImg = '/assets/Decline.svg'
        break;
      default:
        this.actionImg = null;
    }
  }

  getValueString(row: RuleExpressionUI) {
    return (row.value as string);
  }

  getAttributeString(row: RuleExpressionUI) {
    return (row.attribute as string);
  }
}
