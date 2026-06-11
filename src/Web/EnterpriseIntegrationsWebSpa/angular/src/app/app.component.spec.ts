import { Location } from '@angular/common';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Title } from '@angular/platform-browser';
import { of, Subject } from 'rxjs';

import { DataState } from './core/services/data-state';
import { UserApiService } from './core/services/user-api.service';
import { AppComponent } from './app.component';
import { ApplicationIdEnum, PermissionsEnum } from './core/config/permissions.config';
import { APP_ROUTE_CONFIG_URL, INSIGHT_DASHBOARD_ROUTE } from './core/constants/constants';

describe('AppComponent', () => {
  let routerEvents$: Subject<any>;
  let dataStateSpy: jasmine.SpyObj<DataState>;
  let locationSpy: jasmine.SpyObj<Location>;

  beforeEach(async () => {
    routerEvents$ = new Subject<any>();

    const userApiServiceSpy = jasmine.createSpyObj<UserApiService>('UserApiService', ['getAppSettings']);
    userApiServiceSpy.getAppSettings.and.returnValue(of({}));

    const routerSpy = {
      events: routerEvents$.asObservable(),
      navigate: jasmine.createSpy('navigate'),
    } as Partial<Router>;

    const titleSpy = jasmine.createSpyObj<Title>('Title', ['setTitle']);

    dataStateSpy = jasmine.createSpyObj<DataState>('DataState', [
      'setBaseURL',
      'setCoreBaseURL',
      'setappsettingObject',
      'setCurrentURL',
      'hasPermission',
      'setAIPanelStatus',
    ], {
      user$: of(null),
    });
    dataStateSpy.hasPermission.and.returnValue(false);

    locationSpy = jasmine.createSpyObj<Location>('Location', ['path']);
    locationSpy.path.and.returnValue('/landingpage');

    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: UserApiService, useValue: userApiServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Title, useValue: titleSpy },
        { provide: DataState, useValue: dataStateSpy },
        { provide: Location, useValue: locationSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should initialize without throwing on navigation event', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    routerEvents$.next(new NavigationEnd(1, '/landingpage', '/landingpage'));

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should enable AI icon on revenue dashboard when Insight has AIAssistants permission', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const revenueRoute = `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_URL}`;

    locationSpy.path.and.returnValue(revenueRoute);
    dataStateSpy.hasPermission.and.callFake((permissions: number[], applicationId: number) => {
      return applicationId === ApplicationIdEnum.Insight && permissions.includes(PermissionsEnum.AIAssistants);
    });

    fixture.detectChanges();
    routerEvents$.next(new NavigationEnd(1, revenueRoute, revenueRoute));

    expect(dataStateSpy.hasPermission).toHaveBeenCalledWith([PermissionsEnum.AIAssistants], ApplicationIdEnum.Insight);
    expect(app.isAIAccess).toBeTrue();
  });

  it('should keep AI icon hidden on revenue dashboard when only C3 has AIAssistants permission', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const revenueRoute = `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_URL}`;

    locationSpy.path.and.returnValue(revenueRoute);
    dataStateSpy.hasPermission.and.callFake((_permissions: number[], applicationId: number) => {
      return applicationId === ApplicationIdEnum.C3;
    });

    fixture.detectChanges();
    routerEvents$.next(new NavigationEnd(1, revenueRoute, revenueRoute));

    expect(app.isAIAccess).toBeFalse();
  });

  it('should enable AI icon on revenue dashboard for GlobalAdmin via DataState fallback', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const revenueRoute = `/${APP_ROUTE_CONFIG_URL.INSIGHTS}/${INSIGHT_DASHBOARD_ROUTE.REVENUE_DASHBOARD_URL}`;

    locationSpy.path.and.returnValue(revenueRoute);
    // Simulate DataState.hasPermission global-admin behavior by returning true for Insight check.
    dataStateSpy.hasPermission.and.returnValue(true);

    fixture.detectChanges();
    routerEvents$.next(new NavigationEnd(1, revenueRoute, revenueRoute));

    expect(app.isAIAccess).toBeTrue();
  });
});
