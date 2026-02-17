import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { RuleDetail } from "../models/rule-engine/rule-engine";
import { inject } from "@angular/core";
import { RuleEngineApiService } from "../core/services/rule-engine/rule-engine-api.service";
import { map, of } from "rxjs";
import { C3_RULE_ENGINE_WORKFLOW_ID } from "../core/config/rule-engine.config";

export const ruleDetailResolver: ResolveFn<{mode: 'edit' | 'duplicate' | 'create', data: RuleDetail | null, ruleId: string | null}> = 
    (route: ActivatedRouteSnapshot) => {
        const ruleApiSVC = inject(RuleEngineApiService);
        const workflowId = C3_RULE_ENGINE_WORKFLOW_ID;
        // Any one of the below will be available
        const id = route.paramMap.get('id');
        const duplicateId = route.queryParamMap.get('duplicateId');

        if(id) {
            return ruleApiSVC.getRuleById(workflowId, id).pipe(
                map(rule => ({mode: 'edit', data: {...rule}, ruleId: id}))
            );
        } else if(duplicateId) {
            return ruleApiSVC.getRuleById(workflowId, duplicateId).pipe(
                map(rule => {
                    const ruleName = rule.name + ' copy';
                    return {mode: 'duplicate', data: {...rule, name: ruleName }, ruleId: null};
                })
            );
        } else {
            return of({mode: 'create', data: null, ruleId: null});
        }
};