import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { HostCheckboxComponent } from './host-checkbox.component';
import { CheckBox, CheckboxGroup } from 'src/app/interface/button.interface';
import { configureTestBed } from 'src/app/testing/test-bed.helper';

describe('HostCheckboxComponent', () => {
  let component: HostCheckboxComponent;
  let fixture: ComponentFixture<HostCheckboxComponent>;
  let mockContainer: jasmine.SpyObj<ViewContainerRef>;
  let mockCdr: jasmine.SpyObj<ChangeDetectorRef>;
  let loadRemoteSpy: jasmine.Spy;

  beforeEach(async () => {
    const containerSpy = jasmine.createSpyObj('ViewContainerRef', ['createComponent', 'clear']);
    const cdrSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    const mockModule = {
      S1FlatCheckboxComponent: class MockFlatComponent {
        inputData: any;
        checked = jasmine.createSpyObj('EventEmitter', ['subscribe']);
      },
      S1GroupCheckboxComponent: class MockGroupComponent {
        inputData: any;
        checked = jasmine.createSpyObj('EventEmitter', ['subscribe']);
      }
    };

    loadRemoteSpy = spyOn(HostCheckboxComponent, 'loadRemoteModuleFn').and.resolveTo(mockModule);

    await configureTestBed({
      declarations: [HostCheckboxComponent],
      providers: [
        { provide: ChangeDetectorRef, useValue: cdrSpy },
        { provide: ViewContainerRef, useValue: containerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HostCheckboxComponent);
    component = fixture.componentInstance;
    mockContainer = TestBed.inject(ViewContainerRef) as jasmine.SpyObj<ViewContainerRef>;
    mockCdr = TestBed.inject(ChangeDetectorRef) as jasmine.SpyObj<ChangeDetectorRef>;

    // Set the container since it's a ViewChild
    component.container = mockContainer;

    // Override the component's cdr with the spy
    (component as any).cdr = mockCdr;

    // Mock component ref
    const mockCompRef = jasmine.createSpyObj('ComponentRef', ['setInput', 'destroy'], {
      instance: { checked: jasmine.createSpyObj('EventEmitter', ['subscribe']) },
      changeDetectorRef: jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges'])
    });
    mockCompRef.__sub = jasmine.createSpyObj('Subscription', ['unsubscribe']);
    mockContainer.createComponent.and.returnValue(mockCompRef);

    // Reset cache
    (HostCheckboxComponent as any).moduleCache.clear();
  });

  afterEach(() => {
    loadRemoteSpy.calls.reset();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngAfterViewInit', () => {
    it('should load remote module and initialize', async () => {
      const loadRemoteSpy = spyOn(component as any, 'loadRemote').and.resolveTo();
      await component.ngAfterViewInit();
      expect(loadRemoteSpy).toHaveBeenCalled();
      expect(component['isInitialized']).toBeTrue();
      expect(mockCdr.detectChanges).toHaveBeenCalled();
    });
  });

  describe('ngOnChanges', () => {
    beforeEach(() => {
      component['isInitialized'] = true;
      const mockRef = jasmine.createSpyObj('ComponentRef', ['setInput', 'destroy'], {
        instance: { checked: jasmine.createSpyObj('EventEmitter', ['subscribe']) },
        changeDetectorRef: jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges'])
      });
      mockRef.__sub = jasmine.createSpyObj('Subscription', ['unsubscribe']);
      component['compRefs'] = [mockRef];
    });

    it('should reload when checkboxType changes', async () => {
      const loadRemoteSpy = spyOn(component as any, 'loadRemote').and.resolveTo();
      component.ngOnChanges({
        checkboxType: {
          currentValue: 'groupcheckbox',
          previousValue: 'checkbox',
          firstChange: false,
          isFirstChange: () => false
        }
      } as any);
      expect(loadRemoteSpy).toHaveBeenCalled();
    });

    it('should update remote when checkboxesValue changes and initialized', () => {
      spyOn(component as any, 'updateRemote');
      component.checkboxesValue = [{ key: 1, displayName: 'Test' }] as CheckBox[];
      component.ngOnChanges({
        checkboxesValue: {
          currentValue: component.checkboxesValue,
          previousValue: [],
          firstChange: false,
          isFirstChange: () => false
        }
      } as any);
      expect((component as any).updateRemote).toHaveBeenCalled();
    });
  });

  describe('loadRemote', () => {
    it('should load flat checkbox successfully', async () => {
      component.checkboxType = 'checkbox';
      component.checkboxesValue = [{ key: 1, displayName: 'Test' }] as CheckBox[];

      await (component as any).loadRemote();

      expect(mockContainer.createComponent).toHaveBeenCalled();
      expect((component as any).compRefs[0].instance.checked.subscribe).toHaveBeenCalled();
    });

    it('should load group checkbox successfully', async () => {
      component.checkboxType = 'groupcheckbox';
      component.checkboxesValue = [{
        id: 'group1',
        groupTitle: 'Group',
        checkboxes: [{ key: 1, displayName: 'Test' }]
      }] as CheckboxGroup[];

      await (component as any).loadRemote();

      expect(mockContainer.createComponent).toHaveBeenCalledTimes(1); // For the group
      expect((component as any).compRefs[0].instance.checked.subscribe).toHaveBeenCalled();
    });

    it('should emit changes on checkbox selection', async () => {
      component.checkboxType = 'checkbox';
      component.checkboxesValue = [{ key: 1, displayName: 'Test' }] as CheckBox[];
      spyOn(component.checkboxesChange, 'emit');

      await (component as any).loadRemote();

      const subscribeCallback = (component as any).compRefs[0].instance.checked.subscribe.calls.mostRecent().args[0];
      const selected = [{ key: 1, displayName: 'Test', checked: true }];
      subscribeCallback(selected);

      expect(component.checkboxesChange.emit).toHaveBeenCalledWith(selected);
    });

    it('should handle loadRemoteModule error', async () => {
      loadRemoteSpy.and.rejectWith(new Error('Load failed'));
      spyOn(console, 'error');

      await expectAsync((component as any).loadRemote()).toBeResolved();
      expect(console.error).toHaveBeenCalledWith('Error loading remote checkbox component:', jasmine.any(Error));
    });

    it('should skip if loading', async () => {
      component['loading'] = true;
      await (component as any).loadRemote();
      expect(loadRemoteSpy).not.toHaveBeenCalled();
    });

    it('should skip if no container', async () => {
      (component as any).container = null;
      await (component as any).loadRemote();
      expect(loadRemoteSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateRemote', () => {
    it('should update flat checkbox', () => {
      component.checkboxType = 'checkbox';
      component.checkboxesValue = [{ key: 1, displayName: 'Test' }] as CheckBox[];
      const mockRef = jasmine.createSpyObj('ComponentRef', ['setInput', 'destroy'], {
        changeDetectorRef: jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges'])
      });
      (component as any).compRefs = [mockRef];

      (component as any).updateRemote();

      expect(mockRef.setInput).toHaveBeenCalledWith('inputData', component.checkboxesValue);
      expect(mockRef.changeDetectorRef.detectChanges).toHaveBeenCalled();
    });

    it('should update group checkbox', () => {
      component.checkboxType = 'groupcheckbox';
      component.checkboxesValue = [{
        id: 'group1',
        groupTitle: 'Group',
        checkboxes: [{ key: 1, displayName: 'Test' }]
      }] as CheckboxGroup[];
      const mockRef = jasmine.createSpyObj('ComponentRef', ['setInput', 'destroy'], {
        changeDetectorRef: jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges'])
      });
      (component as any).compRefs = [mockRef];

      (component as any).updateRemote();

      expect(mockRef.setInput).toHaveBeenCalledWith('inputData', component.checkboxesValue[0]);
    });

    it('should handle update errors', () => {
      const mockRef = jasmine.createSpyObj('ComponentRef', ['setInput', 'destroy'], {
        changeDetectorRef: jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges'])
      });
      mockRef.setInput.and.throwError('Update failed');
      (component as any).compRefs = [mockRef];
      spyOn(console, 'error');

      (component as any).updateRemote();

      expect(console.error).toHaveBeenCalledWith('Error updating remote component:', jasmine.any(Error));
    });
  });

  describe('ngOnDestroy', () => {
    it('should cleanup subscriptions and destroy components', () => {
      const mockSub = jasmine.createSpyObj('Subscription', ['unsubscribe']);
      const mockRef = jasmine.createSpyObj('ComponentRef', ['destroy'], { __sub: mockSub });
      (component as any).compRefs = [mockRef];

      component.ngOnDestroy();

      expect(mockSub.unsubscribe).toHaveBeenCalled();
      expect(mockRef.destroy).toHaveBeenCalled();
      expect((component as any).compRefs).toEqual([]);
    });
  });

  describe('Module caching', () => {
    it('should cache loaded modules', async () => {
      component.checkboxType = 'checkbox';
      await (component as any).loadRemote();
      await (component as any).loadRemote();
      expect(loadRemoteSpy).toHaveBeenCalledTimes(1);
    });
  });
});