import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DataState } from '../data-state';
import { API_PATH_PPC, API_V1 } from '../../constants/constants';
import { RuleDetail, GetRulesRequest, Rule, UpdateRuleRequest } from 'src/app/models/rule-engine/rule-engine';
import { UIRuleConfigApiResponse } from 'src/app/models/rule-engine/rule-editor-config.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RuleEngineApiService {

  constructor(
    private readonly http: HttpClient,
    private readonly dataState: DataState
  ) { }

  private readonly baseURI = `${this.dataState.getBaseUrl()}/${API_PATH_PPC}/${API_V1}`;

  getAllRules(payload: GetRulesRequest, workflowId: number) {
    return this.http.post<Rule[]>(`${this.baseURI}/rule/${workflowId}/rules`, payload);
  }

  // need to update the response model api is not developed
  getRuleById(applicationId: number, workflowId: number, ruleId: string) {
    return this.http.get<RuleDetail>(`${this.baseURI}/rule/${applicationId}/${workflowId}/${ruleId}`);
  }

  createRule(applicationId: number, payload: RuleDetail, workflowId: number) {
    return this.http.post<boolean>(`${this.baseURI}/rule/${applicationId}/${workflowId}/create`, payload);
  }

  updateRule(applicationId: number, payload: UpdateRuleRequest, workflowId: number, ruleId: string) {
    return this.http.post<boolean>(`${this.baseURI}/rule/${applicationId}/${workflowId}/update/${ruleId}`, payload);
  }

  getUIRuleConfig(workflowId: number): Observable<UIRuleConfigApiResponse> {
    return this.http.get<UIRuleConfigApiResponse>(`${this.baseURI}/rule/workflow/${workflowId}/config`);
  }
}
