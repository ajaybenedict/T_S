import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { API_BASE_URL_INT, API_BASE_URL_LOCAL, API_BASE_URL_PROD, API_BASE_URL_UAT, APP_ROUTE_CONFIG_URL, C3_USER_GUIDE_ALLOWED_ROUTES, CORE_BASE_URL_INT, CORE_BASE_URL_LOCAL, CORE_BASE_URL_PROD, CORE_BASE_URL_UAT, DOCUMENT_URL, INSIGHT_DASHBOARD_ROUTE, INSIGHT_USER_GUIDE_ALLOWED_ROUTES } from './core/constants/constants';
import { Title } from '@angular/platform-browser';
import { UserApiService } from './core/services/user-api.service';
import { DataState } from './core/services/data-state';
import { filter, Subject, takeUntil } from 'rxjs';
import { AuthTokenService } from './core/services/auth-token.service';
import { PPCMastheadDropdown } from './models/ppc-masthead-dropdown.model';
import { ppcMastheadDropdownConfig } from './core/config/ppc-masthead-dropdown.config';
import { Location } from '@angular/common';
import { animate, group, query, style, transition, trigger } from '@angular/animations';
import { PermissionsEnum } from './core/config/permissions.config';

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
  allowedRuleEditorRoutes: string[] = [`/${APP_ROUTE_CONFIG_URL.C3_DASHBOARD}`];
  allowedUserGuideRoutes: string[] = [...INSIGHT_USER_GUIDE_ALLOWED_ROUTES, ...C3_USER_GUIDE_ALLOWED_ROUTES];
  isUserGuideEnabled = false;
  isDropdownOpen: boolean = false;
  isAIAccess: boolean = false;
  isRuleEditorEnabled = false;
  userEmail!: string;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly userApiService: UserApiService,
    private readonly router: Router,
    private readonly titleService: Title,
    private readonly dataState: DataState,
    private readonly authtokenSVC: AuthTokenService,
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
    this.dataState.hydrateFirstName(); // When page refreshes, this will set firstName from LocalStorage.    
    this.dataState.firstName$.pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: res => {
        if(res) this.firstname = res;
      },
    });
    this.dataState.userEmail$.pipe(
      takeUntil(this.destroy$),
    ).subscribe({
      next: res => {
        if(res) this.userEmail = res;
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
      // AI Icon access
      this.isAIAccess = this.checkModuleAccess(this.allowedAIAssistantRoutes, [PermissionsEnum.AIAssistants]);
      // Rule editor access
      this.isRuleEditorEnabled = this.checkModuleAccess(this.allowedRuleEditorRoutes, [PermissionsEnum.RuleEditor, PermissionsEnum.RuleViewer]);
      // User Guide allowed routes
      this.isUserGuideEnabled = this.checkModuleAccess(this.allowedUserGuideRoutes);

      this.moduleName = ppcMastheadDropdownConfig.find(el => el.navigationURL == this.currentURL)?.title ?? '';
    }
    )
    this.initMastheadDropdown();
    this.logoPath = this.defaultLogoPath;
  }

  checkModuleAccess(routes: string[], permissions: PermissionsEnum[] | null = null) {
    const routeToCheck = this.currentURL.includes('(') ? this.currentURL.split('(')[0] : this.currentURL; // to support auxillary routes
    const access = permissions ? [...routes].includes(routeToCheck) && this.dataState.hasPermission([...permissions]) : [...routes].includes(routeToCheck);
    return access;
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
    this.authtokenSVC.clearToken();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
