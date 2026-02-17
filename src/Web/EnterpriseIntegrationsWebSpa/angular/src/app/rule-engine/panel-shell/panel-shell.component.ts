import { trigger, transition, style, animate } from '@angular/animations';
import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { APP_ROUTE_CONFIG_URL, DISCLAIMER_TEXT } from 'src/app/core/constants/constants';
import { RuleEngineDataService } from 'src/app/core/services/rule-engine/rule-engine-data.service';

@Component({
  selector: 'app-panel-shell',
  templateUrl: './panel-shell.component.html',
  styleUrls: ['./panel-shell.component.css'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate('600ms ease-out', style({ transform: 'translateX(0%)' })),
      ]),
      transition(':leave', [
        animate('600ms ease-in', style({ transform: 'translateX(100%)' })),
      ]),
    ]),
  ],
})
export class PanelShellComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  panelVisible = true;
  outletKey = 'ruleEngineOutlet:';
  editPathKey = '/edit';
  breadCrumbData = 'Rules Engine';
  disclaimerText = DISCLAIMER_TEXT.RULE_ENGINE;
  
  constructor(
    private readonly ruleEngineDataSVC: RuleEngineDataService,
    private readonly router: Router,
    private readonly location: Location,    
    private readonly cdr: ChangeDetectorRef,
  ){}

  ngOnInit(): void {
    this.ruleEngineDataSVC.breadcrumb$
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if(res) {
          this.breadCrumbData = res;
          this.cdr.detectChanges();
        }
      });
  }

  dismissPanel() {
    const currURL = this.location.path();    
    const outletSegment = currURL.split(this.outletKey)[1] ?? '';
    const shouldNavigateBack = outletSegment.includes(this.editPathKey);
    if(shouldNavigateBack) {
      this.router.navigate([{ outlets: { ruleEngineOutlet: [APP_ROUTE_CONFIG_URL.RULE_ENGINE] } }]);
    } else {
      this.panelVisible = false;
    }        
  }
  onAnimationDone() {
    if (!this.panelVisible) {
      this.ruleEngineDataSVC.setPanelStatus('Closed');
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
