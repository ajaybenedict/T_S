import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { API_BASE_URL_INT, API_BASE_URL_LOCAL, API_BASE_URL_PROD, API_BASE_URL_UAT, APP_ROUTE_CONFIG_URL, C3_USER_GUIDE_ALLOWED_ROUTES, CORE_BASE_URL_INT, CORE_BASE_URL_LOCAL, CORE_BASE_URL_PROD, CORE_BASE_URL_UAT, DOCUMENT_URL, INSIGHT_DASHBOARD_ROUTE, INSIGHT_USER_GUIDE_ALLOWED_ROUTES, CBC_USER_GUIDE_ALLOWED_ROUTES, CLOUD_TOOLS_ROUTE, CLOUD_TOOLS_USER_GUIDE_ALLOWED_ROUTES } from './core/constants/constants';
import { Title } from '@angular/platform-browser';
import { UserApiService } from './core/services/user-api.service';
import { DataState } from './core/services/data-state';
import { filter, Subject, takeUntil } from 'rxjs';
import { PPCMastheadDropdown } from './models/ppc-masthead-dropdown.model';
import { ppcMastheadDropdownConfig } from './core/config/ppc-masthead-dropdown.config';
import { Location } from '@angular/common';
import { animate, group, query, style, transition, trigger } from '@angular/animations';
import { ApplicationIdEnum, PermissionsEnum } from './core/config/permissions.config';
import { C3_RULE_ENGINE_WORKFLOW_ID, CBC_RULE_ENGINE_WORKFLOW_ID } from './core/config/rule-engine.config';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        // Set up the position for both entering and leaving elements
        query(
          ':enter, :leave',
          style({
            position: 'absolute',
            width: '100%',
          }),
          { optional: true }
        ),
        group([
          // Animate the leaving page out to the left
          query(
            ':leave',
            [
              style({ transform: 'translateX(0%)' }),
              animate('600ms ease-in-out', style({ transform: 'translateX(-100%)' })),
            ],
            { optional: true }
          ),
          // Animate the entering page from the right
          query(
            ':enter',
            [
              style({ transform: 'translateX(100%)' }),
              animate('600ms ease-in-out', style({ transform: 'translateX(0%)' })),
            ],
            { optional: true }
          ),
        ]),
      ]),
    ]),
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  declare firstname: string;
  declare dropdownData: PPCMastheadDropdown[];
  declare currentURL: string;
  declare logoPath: string;
  declare moduleName: string;
  defaultLogoPath: string = '/assets/tdsynx_circle_logo_24_24.svg';
  mouseHoverLogoPath: string = '/assets/logo_back_btn_24_24.svg';
  landingPage: string = '/landingpage';
  qaloginPage: string = '/qalogin';
  allowedAIAssistantRoutes: string[] = [`/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_URL}`];
  allowedRuleEditorRoutes: string[] = [`/${APP_ROUTE_CONFIG_URL.C3_DASHBOARD}`, `/${APP_ROUTE_CONFIG_URL.CBC_DASHBOARD}`];
  allowedUserGuideRoutes: string[] = [...INSIGHT_USER_GUIDE_ALLOWED_ROUTES, ...C3_USER_GUIDE_ALLOWED_ROUTES, ...CBC_USER_GUIDE_ALLOWED_ROUTES, ...CLOUD_TOOLS_USER_GUIDE_ALLOWED_ROUTES];
  isUserGuideEnabled = false;
  isDropdownOpen: boolean = false;
  isAIAccess: boolean = false;
  isRuleEditorEnabled = false;
  userEmail!: string;
  ruleEngineWorkflowId!: number;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly userApiService: UserApiService,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly dataState: DataState,
    private readonly location: Location,
  ) {
    this.titleService.setTitle('StreamOneApps');
    if (window.location.href.includes('localhost')) {
      dataState.setBaseURL(API_BASE_URL_LOCAL);
      dataState.setCoreBaseURL(CORE_BASE_URL_LOCAL);
    }
    else if (window.location.href.includes('int')) {
      dataState.setBaseURL(API_BASE_URL_INT);
      dataState.setCoreBaseURL(CORE_BASE_URL_INT);
    }
    else if (window.location.href.includes('uat')) {
      dataState.setBaseURL(API_BASE_URL_UAT);
      dataState.setCoreBaseURL(CORE_BASE_URL_UAT);
    }
    else {
      dataState.setBaseURL(API_BASE_URL_PROD);
      dataState.setCoreBaseURL(CORE_BASE_URL_PROD);
    }

    userApiService.getAppSettings().subscribe(res => {
      dataState.setappsettingObject(res);
    })
  }

  ngOnInit(): void {
    this.dataState.user$.pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: res => {
        if (res) {
          this.firstname = res.firstName;
          this.userEmail = res.emailAddress;
        }
      },
    });
    this.router.events.pipe(
      takeUntil(this.destroy$),
      filter(event => event instanceof NavigationEnd)
    ).subscribe(res => {
      this.currentURL = this.location.path().split('?')[0];
      this.dataState.setCurrentURL(this.currentURL);

      // below logic needed while navigating to landingpage from any other page
      if (this.currentURL == this.landingPage) {
        this.logoPath = this.defaultLogoPath;
      }
      this.ruleEngineWorkflowId =
        this.currentURL.startsWith(`/${APP_ROUTE_CONFIG_URL.CBC_DASHBOARD}`)
          ? CBC_RULE_ENGINE_WORKFLOW_ID
          : C3_RULE_ENGINE_WORKFLOW_ID;
      // AI Icon access
      this.isAIAccess = this.checkModuleAccess(this.allowedAIAssistantRoutes, [PermissionsEnum.AIAssistants], [ApplicationIdEnum.Insight]);
      // Rule editor access
      this.isRuleEditorEnabled = this.checkModuleAccess(this.allowedRuleEditorRoutes, [PermissionsEnum.RuleEditor, PermissionsEnum.RuleViewer], ApplicationIdEnum.C3);
      // User Guide allowed routes
      this.isUserGuideEnabled = this.checkUserGuideAccess(this.allowedUserGuideRoutes);

      this.moduleName = ppcMastheadDropdownConfig.find(el => el.navigationURL == this.currentURL)?.title ?? '';
    }
    )
    this.initMastheadDropdown();
    this.logoPath = this.defaultLogoPath;
  }

  checkModuleAccess(routes: string[], permissions: PermissionsEnum[] | null = null, applicationId?: ApplicationIdEnum | ApplicationIdEnum[]) {
    const routeToCheck = this.currentURL.includes('(') ? this.currentURL.split('(')[0] : this.currentURL; // to support auxillary routes
    const isAllowedRoute = [...routes].includes(routeToCheck);

    if ((permissions === null || permissions === undefined) || (applicationId === null || applicationId === undefined)) {
      return isAllowedRoute;
    }

    const appIds = Array.isArray(applicationId) ? applicationId : [applicationId];
    return isAllowedRoute && appIds.some(id => this.dataState.hasPermission([...permissions], id));
  }

  checkUserGuideAccess(routes: string[]): boolean {
    const routeToCheck = this.currentURL.includes('(') ? this.currentURL.split('(')[0] : this.currentURL; // to support auxillary routes
    return [...routes].includes(routeToCheck);
  }

  downloadUserGuide() {
    const segments = this.currentURL.split('/');
    const moduleName = segments[1];
    const subModuleName = segments[2];

    // Route → Document mapping (easily extendable in future)
    const documentMap = new Map<string, string>([
      [APP_ROUTE_CONFIG_URL.INSIGHTS, DOCUMENT_URL.INSIGHT],
      [INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_URL, DOCUMENT_URL.REVENUE],
      [INSIGHT_DASHBOARD_ROUTE.ION_REGIONAL_OVERVIEW, DOCUMENT_URL.REGIONAL_OVERVIEW_GUIDE],
      [INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_PHASE2_URL, DOCUMENT_URL.REVENUE_DASHBOARD_PHASE2_GUIDE],
      [INSIGHT_DASHBOARD_ROUTE.ION_ORDER_DATA_URL, DOCUMENT_URL.ION_ORDER_DATA_GUIDE],
      [INSIGHT_DASHBOARD_ROUTE.END_CUSTOMER_CHURN_URL, DOCUMENT_URL.END_CUSTOMER_CHURN_GUIDE],
      [APP_ROUTE_CONFIG_URL.CBC_DASHBOARD, DOCUMENT_URL.CBC_GUIDE],
      [CLOUD_TOOLS_ROUTE.EST_MANAGER, DOCUMENT_URL.EST_MANAGER_USER_GUIDE],
      [CLOUD_TOOLS_ROUTE.SANDBOX_CLEANUP, DOCUMENT_URL.SANDBOX_USER_GUIDE],
      [CLOUD_TOOLS_ROUTE.PCR_CLEANUP, DOCUMENT_URL.PCR_CLEANUP_USER_GUIDE],
      [CLOUD_TOOLS_ROUTE.UPDATE_MPNID, DOCUMENT_URL.MPNID_USER_GUIDE],
      [CLOUD_TOOLS_ROUTE.SUBS_TRANSFER, DOCUMENT_URL.SUBSCRIPTION_TRANSFER_USER_GUIDE],
      ['default', DOCUMENT_URL.C3] // Fallback
    ]);

    // Determine href based on domain or sub-domain
    const href = documentMap.get(subModuleName)
      || documentMap.get(moduleName)
      || documentMap.get('default');

    // Trigger download
    if (href) {
      const link = document.createElement('a');
      link.href = href;
      link.target = '_blank';
      link.click();
      link.remove();
    }
  }

  redirectToLandingPage() {
    this.router.navigate([APP_ROUTE_CONFIG_URL.LANDING_PAGE]);
  }

  logout() {
    this.router.navigate([APP_ROUTE_CONFIG_URL.LOGOUT]);
  }

  initMastheadDropdown() {
    this.dropdownData = ppcMastheadDropdownConfig;
  }

  toggleLogo(isHover: boolean) {
    if (this.currentURL !== this.landingPage) {
      this.logoPath = isHover ? this.mouseHoverLogoPath : this.defaultLogoPath;
    }
  }
  // Added for animation on page navigation
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }

  dropdownClosedHandler(value: boolean) {
    this.isDropdownOpen = value;
  }

  aiIconClick(): void {
    console.log('AI icon clicked');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
