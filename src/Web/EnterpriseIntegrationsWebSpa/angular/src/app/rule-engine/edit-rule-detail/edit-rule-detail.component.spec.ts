import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { PPCDashboardDataService } from 'src/app/core/services/ppc-dashboard-data.service';
import { PpcSnackBarService } from 'src/app/core/services/ppc-snack-bar.service';
import { RuleEngineApiService } from 'src/app/core/services/rule-engine/rule-engine-api.service';
import { RuleEditorConfigAdapter } from 'src/app/core/services/rule-engine/rule-editor-config-adapter.service';
import { RuleEngineDataService } from 'src/app/core/services/rule-engine/rule-engine-data.service';
import { RuleEditorField, UIRuleConfigApiResponse } from 'src/app/models/rule-engine/rule-editor-config.model';
import { emailFormatAndDomainValidator } from 'src/app/shared/directives/validators/email.validator';
import { EditRuleDetailComponent } from './edit-rule-detail.component';

function createField(overrides: Partial<RuleEditorField>): RuleEditorField {
  return {
    id: 1,
    applicationId: 1,
    workflowId: 1,
    key: 'Amount',
    title: 'Amount',
    dataType: 'decimal',
    usedIn: 'expressionBuilder',
    validations: null,
    allowedOverrides: ['Global'],
    rulePrecedence: null,
    dataSource: null,
    values: null,
    isComparable: true,
    application: null,
    ...overrides,
  };
}

describe('EditRuleDetailComponent', () => {
  let component: EditRuleDetailComponent;
  let fixture: ComponentFixture<EditRuleDetailComponent>;

  let ruleEngineDataSVC: {
    getWorkflowId: jasmine.Spy;
    getUIRuleConfig: jasmine.Spy;
    setUIRuleConfig: jasmine.Spy;
    getExpressionAttributesByComparability: jasmine.Spy;
    setEditingExpression: jasmine.Spy;
    setBreadcrumb: jasmine.Spy;
    setOverrideValue: jasmine.Spy;
    setLevelValue: jasmine.Spy;
  };

  const uiConfig: UIRuleConfigApiResponse = {
    attributeList: [
      createField({ key: 'Region', title: 'Region', dataType: 'select', allowedOverrides: ['CountryGroup', 'Region', 'Country'] }),
      createField({ key: 'Country', title: 'Country', dataType: 'select', allowedOverrides: ['CountryGroup', 'Region', 'Country', 'Reseller'] }),
      createField({ key: 'ResellerName', title: 'Reseller Name', dataType: 'string', allowedOverrides: ['Reseller'] }),
      createField({ key: 'Amount', title: 'Amount', dataType: 'decimal', allowedOverrides: ['Global', 'Country', 'Reseller'] }),
      createField({ key: 'Then', title: 'Then', usedIn: 'actionBuilder', allowedOverrides: ['Global'] }),
    ],
    dataSource: {
      regionCountryDropDown: [
        {
          regionId: 1,
          regionName: 'EMEA',
          countries: [
            { id: 1, countryKey: 'DK', name: 'Denmark', erpCountryKey: 'DK', erpId: '1' },
            { id: 2, countryKey: 'FR', name: 'France', erpCountryKey: 'FR', erpId: '2' },
          ],
        },
      ],
    },
  };

  beforeEach(async () => {
    ruleEngineDataSVC = {
      getWorkflowId: jasmine.createSpy('getWorkflowId').and.returnValue(1),
      getUIRuleConfig: jasmine.createSpy('getUIRuleConfig').and.returnValue(uiConfig),
      setUIRuleConfig: jasmine.createSpy('setUIRuleConfig'),
      getExpressionAttributesByComparability: jasmine.createSpy('getExpressionAttributesByComparability').and.returnValue([]),
      setEditingExpression: jasmine.createSpy('setEditingExpression'),
      setBreadcrumb: jasmine.createSpy('setBreadcrumb'),
      setOverrideValue: jasmine.createSpy('setOverrideValue'),
      setLevelValue: jasmine.createSpy('setLevelValue'),
    };

    TestBed.configureTestingModule({
      declarations: [EditRuleDetailComponent],
      imports: [ReactiveFormsModule],
      providers: [
        {
          provide: PPCDashboardDataService,
          useValue: {
            countryRegionData$: of(null),
          },
        },
        {
          provide: RuleEngineDataService,
          useValue: ruleEngineDataSVC,
        },
        {
          provide: RuleEngineApiService,
          useValue: {
            getUIRuleConfig: jasmine.createSpy('getUIRuleConfig').and.returnValue(of(uiConfig)),
            createRule: jasmine.createSpy('createRule').and.returnValue(of({})),
            updateRule: jasmine.createSpy('updateRule').and.returnValue(of({})),
          },
        },
        {
          provide: RuleEditorConfigAdapter,
          useValue: {
            getShellConfigForWorkflow: jasmine.createSpy('getShellConfigForWorkflow').and.returnValue({
              overridesRequiringLevelValue: ['CountryGroup', 'Region', 'Country', 'Reseller'],
              geoSelectorOverrideKeys: ['CountryGroup', 'Region', 'Country'],
              regionSelectorOverrideKeys: ['CountryGroup', 'Region'],
              resellerOverrideKeys: ['Reseller'],
              geoDataSourceKey: 'regionCountryDropDown',
              resellerMaxLength: 50,
              emailRecipientsEnabled: true,
              allowedEmailDomains: ['techdata.com', 'tdsynnex.com', 'mytecd.com'],
              applicationId: 1,
              dialogActions: {
                publish: 'Publish',
                saveDraft: 'SaveDraft',
                editDraft: 'EditDraft',
                editPublish: 'EditPublish',
              },
              dialogConfig: {
                createDraft: { header: 'Save Draft', content: '', primaryBtnAction: 'SaveDraft', secondaryBtnAction: 'Cancel', primaryBtnName: 'Confirm', secondaryBtnName: 'Cancel' },
                createPublish: { header: 'Publish Rule', content: '', primaryBtnAction: 'Publish', secondaryBtnAction: 'Cancel', primaryBtnName: 'Confirm', secondaryBtnName: 'Cancel' },
                edit: { header: 'Edit', content: '', primaryBtnName: 'Confirm' },
                moveToDraft: { header: 'Move to Draft', content: '', primaryBtnAction: 'MoveToDraft', secondaryBtnAction: 'Cancel', primaryBtnName: 'Confirm', secondaryBtnName: 'Cancel' },
                moveToPublish: { header: 'Move to Publish', content: '', primaryBtnAction: 'MoveToPublish', secondaryBtnAction: 'Cancel', primaryBtnName: 'Confirm', secondaryBtnName: 'Cancel' },
              },
            }),
          },
        },
        {
          provide: PpcSnackBarService,
          useValue: {
            show: jasmine.createSpy('show'),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              data: {
                ruleDetail: { mode: 'create', data: null, ruleId: null },
              },
            },
          },
        },
        {
          provide: MatDialog,
          useValue: {
            open: jasmine.createSpy('open').and.returnValue({
              afterClosed: () => of(null),
              close: jasmine.createSpy('close'),
            }),
          },
        },
        {
          provide: Router,
          useValue: {
            navigate: jasmine.createSpy('navigate'),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    TestBed.overrideTemplate(EditRuleDetailComponent, '');
    await TestBed.compileComponents();

    fixture = TestBed.createComponent(EditRuleDetailComponent);
    component = fixture.componentInstance;
    component.ngOnInit();
  });

  function attachAlertRecipientValidator(): void {
    const inputControl = component.editForm.get(component.formControlList.ALERT_RECIPIENT_INPUT) as FormControl;
    inputControl.setValidators(
      emailFormatAndDomainValidator({
        allowMultipleEmails: true,
        allowedDomains: component.allowedEmailList,
      }),
    );
  }

  function selectOverride(value: string): void {
    component.editForm.get(component.formControlList.OVERRIDE)?.setValue({ label: value, value });
  }

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose allowed email domains from shell config', () => {
    expect(component.allowedEmailList).toEqual(['techdata.com', 'tdsynnex.com', 'mytecd.com']);
    expect(component.showAlertRecipients).toBeTrue();
  });

  it('should map CountryGroup override label to Region in dropdown data', () => {
    const countryGroupOverride = component.overrideData.find(item => item.value === 'CountryGroup');

    expect(countryGroupOverride).toBeTruthy();
    expect(countryGroupOverride?.label).toBe('Region');
    expect(countryGroupOverride?.value).toBe('CountryGroup');
  });

  it('should fallback to API UI config when cache is empty', () => {
    ruleEngineDataSVC.getUIRuleConfig.and.returnValue(null);
    const apiSvc = TestBed.inject(RuleEngineApiService) as any;
    apiSvc.getUIRuleConfig.calls.reset();

    const fallbackFixture = TestBed.createComponent(EditRuleDetailComponent);
    const fallbackComponent = fallbackFixture.componentInstance;
    fallbackComponent.ngOnInit();

    expect(apiSvc.getUIRuleConfig).toHaveBeenCalledWith(1);
    expect(ruleEngineDataSVC.setUIRuleConfig).toHaveBeenCalledWith(uiConfig);
    expect(fallbackComponent.overrideData.length).toBeGreaterThan(0);
  });

  it('should compute selector behavior for CountryGroup override', () => {
    component.selectedOverride = 'CountryGroup';

    expect(component.usesGeoSelector).toBeTrue();
    expect(component.usesRegionSelector).toBeTrue();
    expect(component.usesResellerInput).toBeFalse();
  });

  it('should compute selector behavior for Region override', () => {
    component.selectedOverride = 'Region';

    expect(component.usesGeoSelector).toBeTrue();
    expect(component.usesRegionSelector).toBeTrue();
    expect(component.usesResellerInput).toBeFalse();
  });

  it('should compute selector behavior for Country override', () => {
    component.selectedOverride = 'Country';

    expect(component.usesGeoSelector).toBeTrue();
    expect(component.usesRegionSelector).toBeFalse();
    expect(component.usesResellerInput).toBeFalse();
  });

  it('should compute selector behavior for Reseller override', () => {
    component.selectedOverride = 'Reseller';

    expect(component.usesGeoSelector).toBeFalse();
    expect(component.usesRegionSelector).toBeFalse();
    expect(component.usesResellerInput).toBeTrue();
    expect(component.showResellerOverrideHint).toBeTrue();
  });

  it('should add required levelValue control for overrides that require level values', () => {
    selectOverride('Country');

    const levelControl = component.editForm.get(component.formControlList.LEVEL_VALUE);
    expect(levelControl).toBeTruthy();
    expect(levelControl?.invalid).toBeTrue();
    expect(ruleEngineDataSVC.setOverrideValue).toHaveBeenCalledWith('Country');
  });

  it('should remove levelValue control when switching to Global override', () => {
    selectOverride('Country');
    component.editForm.get(component.formControlList.RESELLER_INPUT)?.setValue('R-100');

    selectOverride('Global');

    expect(component.editForm.get(component.formControlList.LEVEL_VALUE)).toBeNull();
    expect(component.editForm.get(component.formControlList.RESELLER_INPUT)?.value).toBeNull();
  });

  it('should append selected country-region dropdown value to level values', () => {
    selectOverride('Country');

    component.editForm.get(component.formControlList.COUNTRY_REGION)?.setValue({ label: 'Denmark', value: 'Denmark' });

    expect(component.editForm.get(component.formControlList.LEVEL_VALUE)?.value).toEqual(['Denmark']);
    expect(component.editForm.get(component.formControlList.COUNTRY_REGION)?.value).toBeNull();
    expect(ruleEngineDataSVC.setLevelValue).toHaveBeenCalledWith(['Denmark']);
  });

  it('should add reseller chip once and ignore duplicates', () => {
    selectOverride('Reseller');

    component.editForm.get(component.formControlList.RESELLER_INPUT)?.setValue('R-200');
    component.addResellerValue();
    component.editForm.get(component.formControlList.RESELLER_INPUT)?.setValue('R-200');
    component.addResellerValue();

    expect(component.editForm.get(component.formControlList.LEVEL_VALUE)?.value).toEqual(['R-200']);
  });

  it('should show reseller Add button only when reseller input has non-whitespace text', () => {
    selectOverride('Reseller');

    component.editForm.get(component.formControlList.RESELLER_INPUT)?.setValue('   ');
    expect(component.showResellerAddButton).toBeFalse();

    component.editForm.get(component.formControlList.RESELLER_INPUT)?.setValue('R-200');
    expect(component.showResellerAddButton).toBeTrue();
  });

  it('should show reseller Add button when input flag is true even if control value is empty', () => {
    selectOverride('Reseller');
    (component as any).resellerInputHasText = true;
    component.editForm.get(component.formControlList.RESELLER_INPUT)?.setValue('   ');

    expect(component.showResellerAddButton).toBeTrue();
  });

  it('should remove level value chip', () => {
    selectOverride('Reseller');
    component.editForm.get(component.formControlList.LEVEL_VALUE)?.setValue(['R-1', 'R-2']);

    component.chipDismissHandler('R-1');

    expect(component.editForm.get(component.formControlList.LEVEL_VALUE)?.value).toEqual(['R-2']);
  });

  it('should add a valid alert recipient and clear input', () => {
    attachAlertRecipientValidator();

    const inputControl = component.editForm.get(component.formControlList.ALERT_RECIPIENT_INPUT) as FormControl;
    const recipientsControl = component.editForm.get(component.formControlList.ALERT_RECIPIENTS) as FormControl;

    inputControl.setValue('a.b@techdata.com');
    component.addAlertRecipientValue();

    expect(recipientsControl.value).toEqual(['a.b@techdata.com']);
    expect(inputControl.value).toBe('');
  });

  it('should reject subdomain email values', () => {
    attachAlertRecipientValidator();

    const inputControl = component.editForm.get(component.formControlList.ALERT_RECIPIENT_INPUT) as FormControl;
    const recipientsControl = component.editForm.get(component.formControlList.ALERT_RECIPIENTS) as FormControl;

    inputControl.setValue('user@a.techdata.com');
    component.addAlertRecipientValue();

    expect(recipientsControl.value).toEqual([]);
    expect(inputControl.invalid).toBeTrue();
  });

  it('should parse comma semicolon and spaces for alert recipients', () => {
    attachAlertRecipientValidator();

    const inputControl = component.editForm.get(component.formControlList.ALERT_RECIPIENT_INPUT) as FormControl;
    const recipientsControl = component.editForm.get(component.formControlList.ALERT_RECIPIENTS) as FormControl;

    inputControl.setValue('one@techdata.com; two@tdsynnex.com three@mytecd.com');
    component.addAlertRecipientValue();

    expect(recipientsControl.value).toEqual([
      'one@techdata.com',
      'two@tdsynnex.com',
      'three@mytecd.com',
    ]);
  });

  it('should show alert recipient Add button only when input has non-whitespace text', () => {
    const inputControl = component.editForm.get(component.formControlList.ALERT_RECIPIENT_INPUT) as FormControl;

    inputControl.setValue('   ');
    expect(component.showAlertRecipientAddButton).toBeFalse();

    inputControl.setValue('a.b@techdata.com');
    expect(component.showAlertRecipientAddButton).toBeTrue();
  });

  it('should hide alert recipient Add button when entered email is invalid', () => {
    attachAlertRecipientValidator();
    const inputControl = component.editForm.get(component.formControlList.ALERT_RECIPIENT_INPUT) as FormControl;

    inputControl.setValue('invalid-email');
    inputControl.updateValueAndValidity({ onlySelf: true, emitEvent: false });

    expect(component.showAlertRecipientAddButton).toBeFalse();
  });

  it('should avoid duplicate alert recipients case-insensitively', () => {
    attachAlertRecipientValidator();

    const inputControl = component.editForm.get(component.formControlList.ALERT_RECIPIENT_INPUT) as FormControl;
    const recipientsControl = component.editForm.get(component.formControlList.ALERT_RECIPIENTS) as FormControl;

    recipientsControl.setValue(['one@techdata.com']);
    inputControl.setValue('ONE@TECHDATA.COM');
    component.addAlertRecipientValue();

    expect(recipientsControl.value).toEqual(['one@techdata.com']);
  });

  it('should remove alert recipient chip', () => {
    const recipientsControl = component.editForm.get(component.formControlList.ALERT_RECIPIENTS) as FormControl;
    recipientsControl.setValue(['a@techdata.com', 'b@techdata.com']);

    component.alertRecipientChipDismissHandler('a@techdata.com');

    expect(recipientsControl.value).toEqual(['b@techdata.com']);
  });
});
