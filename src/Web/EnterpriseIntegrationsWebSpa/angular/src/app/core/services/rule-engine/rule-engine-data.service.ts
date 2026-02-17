import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject } from "rxjs";
import { C3OverrideLevels } from "../../config/rule-engine.config";

@Injectable({
    providedIn: 'root',
})

export class RuleEngineDataService {
    private readonly panelStatusBS = new BehaviorSubject<"Opened" | "Closed">('Closed');
    private readonly overrideValueBS = new BehaviorSubject<C3OverrideLevels | null>(null);
    private readonly levelValueBS = new BehaviorSubject<string[] | null>(null);
    private readonly breadcrumbSub = new Subject<string>();

    panelStatus$ = this.panelStatusBS.asObservable();
    overrideValue$ = this.overrideValueBS.asObservable();
    levelValue$ = this.levelValueBS.asObservable();
    breadcrumb$ = this.breadcrumbSub.asObservable();

    setPanelStatus(value: "Opened" | "Closed") {
        this.panelStatusBS.next(value);
    }

    getPanelStatus() {
        return this.panelStatusBS.getValue();
    }

    setOverrideValue(value: C3OverrideLevels | null) {
        this.overrideValueBS.next(value);
    }

    setLevelValue(value: string[] | null) {
        if(value) this.levelValueBS.next([...value]);
        else this.levelValueBS.next(value);
    }

    setBreadcrumb(val: string) {
        this.breadcrumbSub.next(val);
    }
}