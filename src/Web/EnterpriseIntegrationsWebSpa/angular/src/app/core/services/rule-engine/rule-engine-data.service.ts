import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { RuleEditorField, UIRuleConfigApiResponse } from "src/app/models/rule-engine/rule-editor-config.model";

@Injectable({
    providedIn: 'root',
})

export class RuleEngineDataService {
    private readonly panelStatusBS = new BehaviorSubject<"Opened" | "Closed">('Closed');
    private readonly overrideValueBS = new BehaviorSubject<string | null>(null);
    private readonly levelValueBS = new BehaviorSubject<string[] | null>(null);
    private readonly breadcrumbSub = new Subject<string>();
    private readonly workflowIdBS = new BehaviorSubject<number | null>(null);
    private readonly uiRuleConfigBS = new BehaviorSubject<UIRuleConfigApiResponse | null>(null);
    private readonly editingExpressionBS = new BehaviorSubject<string | null>(null);
    private allExpressionAttributes: RuleEditorField[] = [];
    private comparableExpressionAttributes: RuleEditorField[] = [];

    panelStatus$ = this.panelStatusBS.asObservable();
    overrideValue$ = this.overrideValueBS.asObservable();
    levelValue$ = this.levelValueBS.asObservable();
    breadcrumb$ = this.breadcrumbSub.asObservable();
    workflowId$ = this.workflowIdBS.asObservable();
    uiRuleConfig$ = this.uiRuleConfigBS.asObservable();
    editingExpression$ = this.editingExpressionBS.asObservable();

    setPanelStatus(value: "Opened" | "Closed") {
        this.panelStatusBS.next(value);
    }

    getPanelStatus() {
        return this.panelStatusBS.getValue();
    }

    setOverrideValue(value: string | null) {
        this.overrideValueBS.next(value);
    }

    getOverrideValue(): string | null {
        return this.overrideValueBS.getValue();
    }

    setLevelValue(value: string[] | null) {
        if(value) this.levelValueBS.next([...value]);
        else this.levelValueBS.next(value);
    }

    setBreadcrumb(val: string) {
        this.breadcrumbSub.next(val);
    }

    setWorkflowId(workflowId: number) {
        this.workflowIdBS.next(workflowId);
    }

    getWorkflowId(): number | null {
        return this.workflowIdBS.getValue();
    }

    setUIRuleConfig(config: UIRuleConfigApiResponse | null) {
        this.uiRuleConfigBS.next(config);
        this.setExpressionAttributeBuckets(config?.attributeList ?? []);
    }

    getUIRuleConfig(): UIRuleConfigApiResponse | null {
        return this.uiRuleConfigBS.getValue();
    }

    /**
     * Stores the raw expression currently being edited.
     *
     * Edit-mode compare hydration uses this source string to split criteria and
     * arithmetic clauses reliably, independent of UI row mapping filters.
     */
    setEditingExpression(expression: string | null): void {
        this.editingExpressionBS.next(expression);
    }

    getEditingExpression(): string | null {
        return this.editingExpressionBS.getValue();
    }

    getExpressionAttributesByComparability(
        isComparable: boolean,
        sourceAttributeList?: RuleEditorField[]
    ): RuleEditorField[] {
        // Fallback initialization for flows where config exists but buckets were not primed.
        if (!this.comparableExpressionAttributes.length && !this.allExpressionAttributes.length && Array.isArray(sourceAttributeList)) {
            this.setExpressionAttributeBuckets(sourceAttributeList);
        }

        // Compare tab uses only comparable attributes; conditional uses all expression attributes.
        const selected = isComparable
            ? this.comparableExpressionAttributes
            : this.allExpressionAttributes;

        return [...selected];
    }

    private setExpressionAttributeBuckets(attributeList: RuleEditorField[]): void {
        const expressionAttributes = attributeList.filter((field) => field?.usedIn === 'expressionBuilder');
        this.allExpressionAttributes = expressionAttributes;
        this.comparableExpressionAttributes = expressionAttributes.filter((field) => (field?.isComparable ?? false) === true);
    }
}