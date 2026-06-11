import { ActivatedRouteSnapshot, ResolveFn } from "@angular/router";
import { RuleDetail } from "../models/rule-engine/rule-engine";
import { inject } from "@angular/core";
import { RuleEngineApiService } from "../core/services/rule-engine/rule-engine-api.service";
import { RuleEngineDataService } from "../core/services/rule-engine/rule-engine-data.service";
import { map, of } from "rxjs";
import { ApplicationIdEnum } from "../core/config/permissions.config";

export const ruleDetailResolver: ResolveFn<{mode: 'edit' | 'duplicate' | 'create', data: RuleDetail | null, ruleId: string | null}> =
    (route: ActivatedRouteSnapshot) => {
        const ruleApiSVC = inject(RuleEngineApiService);
        const workflowId = inject(RuleEngineDataService).getWorkflowId();
        if (workflowId === null || !Number.isInteger(workflowId) || workflowId <= 0) {
            throw new Error('Missing mandatory workflowId from RuleEngineDataService');
        }
        // Any one of the below will be available
        const id = route.paramMap.get('id');
        const duplicateId = route.queryParamMap.get('duplicateId');

        if(id) {
            return ruleApiSVC.getRuleById(ApplicationIdEnum.C3, workflowId, id).pipe(
                map(rule => ({mode: 'edit', data: {...rule}, ruleId: id}))
            );
        } else if(duplicateId) {
            return ruleApiSVC.getRuleById(ApplicationIdEnum.C3, workflowId, duplicateId).pipe(
                map(rule => {
                    const ruleName = rule.name + ' copy';
                    return {mode: 'duplicate', data: {...rule, name: ruleName }, ruleId: null};
                })
            );
        } else {
            return of({mode: 'create', data: null, ruleId: null});
        }
};
