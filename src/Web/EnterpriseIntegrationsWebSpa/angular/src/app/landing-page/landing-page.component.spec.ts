import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LandingPageComponent } from './landing-page.component';
import { DataState } from '../core/services/data-state';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ApplicationIdEnum, PermissionsEnum } from '../core/config/permissions.config';

describe('LandingPageComponent', () => {
  let component: LandingPageComponent;
  let fixture: ComponentFixture<LandingPageComponent>;
  let dataStateMock: any;
  let routerMock: any;
  let permissionsByApplication: Record<number, number[]>;

  beforeEach(async () => {
    permissionsByApplication = {};

    dataStateMock = {
      user$: of({ firstName: 'Test' }),
      hasPermission: jasmine.createSpy('hasPermission').and.callFake((requiredPermissions: number[], applicationId: number) => {
        const grantedPermissions = permissionsByApplication[applicationId] ?? [];
        const streamOneHubPermissions = permissionsByApplication[ApplicationIdEnum.StreamOneHub] ?? [];
        // Mirror DataState.hasPermission behavior: StreamOneHub GlobalAdmin grants access.
        if (streamOneHubPermissions.includes(PermissionsEnum.GlobalAdmin)) {
          return true;
        }
        return requiredPermissions.some(permission => grantedPermissions.includes(permission));
      }),
      redirectUrl$: of(null),
      updateRedirectUrl: jasmine.createSpy('updateRedirectUrl')
    };
    routerMock = { navigateByUrl: jasmine.createSpy('navigateByUrl') };

    await TestBed.configureTestingModule({
      declarations: [ LandingPageComponent ],
      providers: [
        { provide: DataState, useValue: dataStateMock },
        { provide: Router, useValue: routerMock }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set firstname from user observable', () => {
    expect(component.firstname).toBe('Test');
  });

  it('should check AI assistant permission for StreamOneHub application', () => {
    permissionsByApplication[ApplicationIdEnum.StreamOneHub] = [PermissionsEnum.AIAssistants];
    component.ngOnInit();
    expect(dataStateMock.hasPermission).toHaveBeenCalledWith([PermissionsEnum.AIAssistants], ApplicationIdEnum.StreamOneHub);
  });

  it('should show AI icon when StreamOneHub has AIAssistants permission', () => {
    permissionsByApplication[ApplicationIdEnum.StreamOneHub] = [PermissionsEnum.AIAssistants];
    component.ngOnInit();
    expect(component.showAIFloatingIcon).toBeTrue();
  });

  it('should show AI icon when StreamOneHub has GlobalAdmin permission', () => {
    permissionsByApplication[ApplicationIdEnum.StreamOneHub] = [PermissionsEnum.GlobalAdmin];
    component.ngOnInit();
    expect(component.showAIFloatingIcon).toBeTrue();
  });

  it('should hide AI icon when StreamOneHub does not have AIAssistants permission', () => {
    permissionsByApplication[ApplicationIdEnum.StreamOneHub] = [PermissionsEnum.IonProductSyncTool];
    component.ngOnInit();
    expect(component.showAIFloatingIcon).toBeFalse();
  });

  it('should hide AI icon when AIAssistants permission exists in another application', () => {
    permissionsByApplication[ApplicationIdEnum.C3] = [PermissionsEnum.AIAssistants];
    component.ngOnInit();
    expect(component.showAIFloatingIcon).toBeFalse();
  });

  it('should hide AI icon if user is null', () => {
    dataStateMock.user$ = of(null);
    fixture = TestBed.createComponent(LandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.showAIFloatingIcon).toBeFalse();
  });
});
