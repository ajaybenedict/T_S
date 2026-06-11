import { ChangeDetectorRef, Component, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormArray, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from '@angular/forms';
import { CompareCriteriaType, RuleExpressionUI, RuleSelectableValue, RuleTypeEnum } from 'src/app/models/rule-engine/rule-engine';
import { SelectDropdown } from 'src/app/models/select-dropdown.interface';
import { boolOptions, LogicalOperators, ruleTypeTabConfig } from 'src/app/core/config/rule-engine.config';
import { RuleEngineDataService } from 'src/app/core/services/rule-engine/rule-engine-data.service';
import { EMPTY, catchError, map, merge, of, Subject, take, takeUntil } from 'rxjs';
import { PPCDashboardDataService } from 'src/app/core/services/ppc-dashboard-data.service';
import { RuleEngineExpressionHelper, RuleEngineHelper } from '../rule-engine-helper';
import { CountryRegionResponse } from 'src/app/models/ppc/country-region-api.interface';
import { S1FilterButtons } from 'src/app/models/s1/s1-filter-buttons.interface';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { PpcDialogComponent } from 'src/app/shared/ppc-dialog/ppc-dialog.component';
import { RuleEditorConfigAdapter } from 'src/app/core/services/rule-engine/rule-editor-config-adapter.service';
import { RuleEngineApiService } from 'src/app/core/services/rule-engine/rule-engine-api.service';
import { CascadeOptionsResolver, CascadeResolverContext, CascadeRule, NormalizedAttribute, RuleEditorField, RuleEditorSchema, RuleEditorShellConfig, UIRuleConfigApiResponse, WorkflowBehaviorStrategy } from 'src/app/models/rule-engine/rule-editor-config.model';

@Component({
  selector: 'app-rule-edit',
  templateUrl: './rule-edit.component.html',
  styleUrls: ['./rule-edit.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RuleEditComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => RuleEditComponent),
      multi: true
    },
  ]
})
export class RuleEditComponent implements OnInit, OnDestroy, ControlValueAccessor, Validator {
  private readonly destroy$ = new Subject<void>;
  private isSyncingCompareToExpression = false;
  private pendingCriteriaHydration: { criteriaType: CompareCriteriaType; rawValue: string } | null = null;
  private pendingExpressionString: string | null = null;

  // CVA callbacks
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  // for controlling CVA updates firing multiple times while rebuilding
  private isWriting = false;

  // NG_VALIDATORS callback
  private onValidatorChange: () => void = () => {};

  form!: FormGroup;
  countryData!: {countries: SelectDropdown[], regions: SelectDropdown[]};
  selectedOverride!: string;
  selectedLevelValue!: string[];
  countryRegionResponse!: CountryRegionResponse[];
  attributeList!: SelectDropdown[];
  compareAttributeOptions: SelectDropdown[] = [];
  compareAttr2Options: SelectDropdown[] = [];
  compareAttr3Options: SelectDropdown[] = [];
  compareCriteriaValueOptions: SelectDropdown[] = [];
  compareLogicalOperatorOptions: SelectDropdown[] = [];
  compareArithmeticOperatorOptions: SelectDropdown[] = [
    { label: '+ (Add)', value: '+' },
    { label: '- (Subtract)', value: '-' },
  ];
  rowOperatorList = LogicalOperators;
  operatorOptions!: SelectDropdown[][];
  actionListData: SelectDropdown[] = [];
  workflowId!: number;
  compareCriteriaTabList: S1FilterButtons[] = [
    {
      selected: false,
      type: 'filter',
      displayName: 'Region',
      onClickEvent: 'Region',
    },
    {
      selected: false,
      type: 'filter',
      displayName: 'Country',
      onClickEvent: 'Country',
    },
  ];
  private schema: RuleEditorSchema | null = null;
  private behavior: WorkflowBehaviorStrategy | null = null;
  private rawAttributeList: RuleEditorField[] = [];
  private readonly attributeMetadata = new Map<string, NormalizedAttribute>();
  private cascadeRules: CascadeRule[] = [];
  private cascadeResolver: CascadeOptionsResolver | null = null;
  private shellConfig: RuleEditorShellConfig | null = null;

  formControlNameList = {
    EXPRESSIONS: 'expressions',
    LOGICAL_OPERATOR: 'logicalOperator',
    ATTRIBUTE: 'attribute',
    OPERATOR: 'operator',
    VALUE: 'value',
    ACTION: 'action',
    COMPARE: 'compare',
    COMPARE_ATTR1: 'attr1',
    COMPARE_LOGICAL_OPERATOR: 'logicalOperator',
    COMPARE_ATTR2: 'attr2',
    COMPARE_ARITHMETIC_OPERATOR: 'arithmeticOperator',
    COMPARE_ATTR3: 'attr3',
    COMPARE_CRITERIA_TYPE: 'criteriaType',
    COMPARE_CRITERIA_VALUE: 'criteriaValue',
  }

  labels = {
    ATTRIBUTE: 'Attribute',
    OPERATOR: 'Operator',
    VALUE: 'Value',
    ACTION: 'Action',
  };

  compareLabels = {
    regionCountry: 'Add Region/Country',
  }

  /**
   * Controls whether Compare rule type is rendered in the editor UI.
   * Value is populated from WorkflowBehaviorRegistry shell config.
   */
  isCompareFeatureEnabled = false;

  /**
   * Returns true when the current workflow uses cost-adjustment mode, meaning
   * the action section renders a decimal textbox instead of an action dropdown.
   *
   * Driven by `RuleEditorShellConfig.costAdjustmentMode` which is set per
   * workflow in `RuleEditorConfigAdapterService`.
   */
  get isCostAdjustmentMode(): boolean {
    return !!this.shellConfig?.costAdjustmentMode;
  }

  tabs: Partial<Record<RuleTypeEnum, S1FilterButtons>> = {};
  tabList!: S1FilterButtons[];
  selectedTab: string = ruleTypeTabConfig.Conditional.onClickEvent;
  private dialogRef?: MatDialogRef<PpcDialogComponent>;

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly ruleEngineDataSVC: RuleEngineDataService,
    private readonly dashboardDataSVC: PPCDashboardDataService,
    private readonly ruleEngineApiSVC: RuleEngineApiService,
    private readonly ruleConfigAdapter: RuleEditorConfigAdapter,
    private readonly dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.getCountryRegionAPIResponse();
    this.attributeList = [];
    this.initForm();
    this.initTabs();
    this.workflowId = this.getWorkflowId();
    this.operatorOptions = [];
    this.initializeRuleEditorConfig();
    // logic to get the region list
    this.getCountryRegionData();
    // AttributeList Logic based on override value
    this.subscribeToOverride();
    this.subscribeToLevelValues();
    this.addExpression();
    this.initializeCompareMode();
    this.setTabMode(this.selectedTab, false);
    // CVA
    this.propagateFormChangesToParent();
  }

  private getWorkflowId(): number {
    const workflowId = this.ruleEngineDataSVC.getWorkflowId();
    if (workflowId === null || !Number.isInteger(workflowId) || workflowId <= 0) {
      throw new Error('Missing mandatory workflowId in RuleEngineDataService');
    }

    return workflowId;
  }

  private initializeRuleEditorConfig(): void {
    const cachedConfig = this.ruleEngineDataSVC.getUIRuleConfig();
    if (cachedConfig) {
      this.applyRuleEditorConfig(cachedConfig);
      return;
    }

    this.ruleEngineApiSVC.getUIRuleConfig(this.workflowId)
      .pipe(
        take(1),
        catchError((error) => {
          console.error('Error in getUIRuleConfig API:', error);
          return of(null);
        })
      )
      .subscribe((config) => {
        if (!config) {
          return;
        }
        this.ruleEngineDataSVC.setUIRuleConfig(config);
        this.applyRuleEditorConfig(config);
      });
  }

  private applyRuleEditorConfig(config: UIRuleConfigApiResponse): void {
    this.rawAttributeList = Array.isArray(config.attributeList) ? [...config.attributeList] : [];
    const componentConfig = this.ruleConfigAdapter.adaptConfig(config, this.workflowId);
    this.schema = componentConfig.schema;
    this.behavior = componentConfig.behavior;
    this.cascadeRules = componentConfig.cascadeRules;
    this.cascadeResolver = componentConfig.cascadeResolver;
    this.shellConfig = componentConfig.shellConfig;
    this.isCompareFeatureEnabled = this.shellConfig.enableCompareRuleType;
    this.operatorOptions = [];
    this.initTabs();
    this.setTabMode(this.selectedTab, false);
    this.initializeGeoDataFromConfig(config);

    // When costAdjustmentMode is active, add a decimal-number validator to the action
    // control so the form stays invalid until a valid numeric value is entered.
    if (this.shellConfig.costAdjustmentMode) {
      this.form.get(this.formControlNameList.ACTION)
        ?.addValidators(Validators.pattern(/^-?\d+(\.\d+)?$/));
      this.form.get(this.formControlNameList.ACTION)?.updateValueAndValidity({ emitEvent: false });
    }

    this.attributeMetadata.clear();
    this.schema.expressionAttributes.forEach((attribute) => {      
      this.attributeMetadata.set(attribute.key.toLowerCase(), attribute);
    });    
    this.updateActionList();
  }

  /**
   * Initializes geo data from UI config so Region/Country options are available
   * even when dashboard observable data arrives late.
   */
  private initializeGeoDataFromConfig(config: UIRuleConfigApiResponse): void {
    if (!this.shellConfig?.geoDataSourceKey) {
      return;
    }

    const geoData = config.dataSource?.[this.shellConfig.geoDataSourceKey];
    if (!Array.isArray(geoData) || geoData.length === 0) {
      return;
    }

    this.countryRegionResponse = [...geoData as CountryRegionResponse[]];
    this.countryData = RuleEngineHelper.getAllCountryRegionList(this.countryRegionResponse);
  }

  /**
   * Builds the cascade resolution context used by application-specific resolvers.
   */
  private getCascadeResolverContext(): CascadeResolverContext {
    return {
      selectedOverride: this.selectedOverride ?? '',
      selectedLevelValues: Array.isArray(this.selectedLevelValue) ? [...this.selectedLevelValue] : [],
      sourceData: this.countryRegionResponse,
    };
  }

  /**
   * Finds the cascade rule whose child attribute matches the provided key.
   */
  private findCascadeRuleByChildKey(key: string | null | undefined): CascadeRule | null {
    if (!key) {
      return null;
    }

    return this.cascadeRules.find((rule) => this.areAttributeKeysEqual(rule.childAttributeKey, key)) ?? null;
  }

  /**
   * Finds the cascade rule whose parent attribute matches the provided key.
   */
  private findCascadeRuleByParentKey(key: string | null | undefined): CascadeRule | null {
    if (!key) {
      return null;
    }

    return this.cascadeRules.find((rule) => this.areAttributeKeysEqual(rule.parentAttributeKey, key)) ?? null;
  }

  /**
   * Compares attribute keys in a case-insensitive way to avoid key-format drift
   * between workflow rules (e.g. "Region") and API keys (e.g. "region").
   */
  private areAttributeKeysEqual(left: string | null | undefined, right: string | null | undefined): boolean {
    if (!left || !right) {
      return false;
    }

    return left.trim().toLowerCase() === right.trim().toLowerCase();
  }

  /**
   * Identifies whether the supplied key belongs to a cascade parent attribute.
   */
  private isCascadeParentAttribute(key: string | null | undefined): boolean {
    return this.findCascadeRuleByParentKey(key) !== null;
  }

  /**
   * Identifies whether the supplied key belongs to a cascade child attribute.
   */
  private isCascadeChildAttribute(key: string | null | undefined): boolean {
    return this.findCascadeRuleByChildKey(key) !== null;
  }

  /**
   * Resolves the default dropdown options for a cascade child attribute.
   */
  private getDefaultCascadeChildOptions(rule: CascadeRule): SelectDropdown[] {
    if (!this.cascadeResolver) {
      return [];
    }

    return this.cascadeResolver.resolveDefaultChildOptions(rule, this.getCascadeResolverContext());
  }

  /**
   * Resolves the child options for a specific parent row.
   */
  private getCascadeChildOptionsForParentRow(rule: CascadeRule, ctrl: AbstractControl): SelectDropdown[] {
    if (!this.cascadeResolver) {
      return [];
    }

    const parentValue = ctrl.get(this.formControlNameList.VALUE)?.value;
    const resolvedParentValue = parentValue?.value ?? parentValue;
    const operatorValue = ctrl.get(this.formControlNameList.OPERATOR)?.value;
    const resolvedOperatorValue = (operatorValue?.value ?? operatorValue) as string | null;

    if (!resolvedParentValue) {
      return [];
    }

    return this.cascadeResolver.resolveChildOptions(
      rule,
      String(resolvedParentValue),
      resolvedOperatorValue,
      this.getCascadeResolverContext(),
    );
  }

  /**
   * Collects valid parent rows for a specific cascade rule.
   */
  private getValidCascadeParentRows(rule: CascadeRule): FormGroup[] {
    return this.expressions.controls.filter((ctrl) => {
      const attributeKey = RuleEngineExpressionHelper.attrKey(
        ctrl.get(this.formControlNameList.ATTRIBUTE)?.value,
      );
      const parentValue = ctrl.get(this.formControlNameList.VALUE)?.value;
      return this.areAttributeKeysEqual(attributeKey, rule.parentAttributeKey) && !!parentValue;
    }) as FormGroup[];
  }

  /**
   * Finds the first populated parent row for a specific cascade rule.
   */
  private findFirstCascadeParentRow(rule: CascadeRule): AbstractControl | undefined {
    return this.expressions.controls.find((ctrl) => {
      const attributeKey = RuleEngineExpressionHelper.attrKey(
        ctrl.get(this.formControlNameList.ATTRIBUTE)?.value,
      );
      const hasValue = !!ctrl.get(this.formControlNameList.VALUE)?.value;
      return this.areAttributeKeysEqual(attributeKey, rule.parentAttributeKey) && hasValue;
    });
  }

  private updateActionList(): void {
    if (!this.schema?.actionAttribute) {
      this.actionListData = [];
      return;
    }

    const actionOptions = this.ruleConfigAdapter.resolveDropdownOptions(
      this.schema.actionAttribute.dataSourceRef,
      this.schema.dataSources,
    );

    this.actionListData = this.toSelectOptions(actionOptions);
  }

  private toSelectOptions(options: any[]): SelectDropdown[] {
    return options
      .map((option) => {
        if (option && typeof option === 'object' && 'label' in option && 'value' in option) {
          return option as SelectDropdown;
        }

        if (typeof option === 'string') {
          return { label: option, value: option } as SelectDropdown;
        }

        return null;
      })
      .filter((option): option is SelectDropdown => option !== null);
  }

  private findNormalizedAttribute(attr: RuleSelectableValue | undefined): NormalizedAttribute | null {
    if (attr === null || attr === undefined) {
      return null;
    }

    const attrKey = RuleEngineExpressionHelper.attrKey(attr);
    if (!attrKey) {
      return null;
    }

    return this.attributeMetadata.get(attrKey.toLowerCase()) ?? null;
  }

  // ----- ControlValueAccessor -----
  /**
   * Hydrates editor controls from parent CVA value for create/edit flows.
   *
   * Action values may arrive either as a raw string (API mapping) or as a
   * SelectDropdown object (already normalized). We normalize to the exact
   * option object when available so the dropdown always renders a preselected
   * value consistently in edit mode.
   *
   * For CBC cost-adjustment mode the action arrives as a JSON string
   * `'{"costAdjustment":N}'`. In that case the raw decimal value is extracted
   * and patched directly into the action text input instead of resolving a
   * dropdown option.
   */
  writeValue(value: { expressions: RuleExpressionUI[], action: RuleSelectableValue } | null): void {
    if (!this.form) return; // in case called before ngOnInit
    // For create new rule
    if(!value) {
      this.isWriting = true;
      this.pendingExpressionString = null;
      this.form.reset({}, { emitEvent: false });
      this.expressions.clear();
      this.operatorOptions = [];
      this.addExpression();
      this.isWriting = false;
      return;
    }
    // null check
    if(!value.expressions?.length) return;

    // Edit existing rule
    // const uiForm = RuleEngineExpressionHelper.apiToUiForm(value);
    this.isWriting = true;
    this.pendingExpressionString = this.ruleEngineDataSVC.getEditingExpression();
    this.syncSelectedTabFromExpressions(value.expressions, this.pendingExpressionString);

    // Rebuild rows
    this.expressions.clear();
    this.operatorOptions = [];

    // populating expressions
    value.expressions.forEach((expr, idx)  => {
      const rowGroup = this.createExpressionGroup(expr, idx);
      // prevent noisy value/status emissions while we’re building
      rowGroup.markAsPristine();
      this.expressions.push(rowGroup);
    });

    // For cost-adjustment workflows the action may arrive as either a raw string
    // or SelectDropdown object. Normalize first, then parse JSON payload
    // `'{"costAdjustment":N}'` so the textbox shows just `N`.
    const actionForControl = this.isCostAdjustmentMode
      ? this.resolveCostAdjustmentControlValue(value.action)
      : this.resolveActionControlValue(value.action);

    // Keep selected action aligned with the actual dropdown option list.
    this.form.patchValue({
      [this.formControlNameList.ACTION]: actionForControl,
    });

    this.form.updateValueAndValidity({ emitEvent: false });
    this.isWriting = false;

    // re-run filtering for pre-populated attributes
    this.expressions.controls.forEach(row => {
      const attr = row.get(this.formControlNameList.ATTRIBUTE)?.value;
      if (attr) this.applyCountryFiltering(attr);
    });

    this.refreshValidation();
  }

  /**
   * Normalizes incoming action payload for cost-adjustment textbox hydration.
   *
   * Edit-mode values can arrive as either:
   * 1) raw string from API mapping, or
   * 2) SelectDropdown object from prior normalization.
   *
   * For CBC rules the persisted shape is usually `'{"costAdjustment":N}'`.
   * If parsing succeeds, return `N` as plain text. If not, fall back to a
   * reasonable raw value so legacy/plain numeric action strings still hydrate.
   */
  private resolveCostAdjustmentControlValue(action: RuleSelectableValue | undefined): string | null {
    if (action === null || action === undefined) {
      return null;
    }

    const rawActionValue = typeof action === 'object'
      ? String(action.value ?? action.label ?? '').trim()
      : String(action).trim();

    const parsedValue = RuleEngineHelper.tryParseCostAdjustmentValue(rawActionValue);
    if (parsedValue !== null) {
      return parsedValue;
    }

    return rawActionValue || null;
  }

  /**
   * Normalizes incoming action payload to a SelectDropdown-compatible value.
   *
   * Matching priority:
   * 1) existing dropdown option by `value` (case-insensitive)
   * 2) existing dropdown option by `label` (case-insensitive)
   * 3) fallback to a synthetic option preserving the raw value
   */
  private resolveActionControlValue(action: RuleSelectableValue | undefined): SelectDropdown | null {
    if (action === null || action === undefined) {
      return null;
    }

    if (typeof action === 'object') {
      return action;
    }

    const normalizedAction = action.trim().toLowerCase();
    if (!normalizedAction) {
      return null;
    }

    const matchedOption = this.actionListData.find((option) => {
      const normalizedOptionValue = String(option.value ?? '').trim().toLowerCase();
      const normalizedOptionLabel = String(option.label ?? '').trim().toLowerCase();
      return normalizedOptionValue === normalizedAction || normalizedOptionLabel === normalizedAction;
    });

    return matchedOption ?? { label: action, value: action };
  }

  /**
   * Selects tab mode by inferred rule type and hydrates compare form when needed.
   *
   * @param expressions UI expressions passed by parent child-form binding.
   * @param expressionString Optional raw API expression for robust compare-mode edit hydration.
   */
  private syncSelectedTabFromExpressions(expressions: RuleExpressionUI[], expressionString: string | null = null): void {
    const inferredRuleType = RuleEngineExpressionHelper.inferRuleTypeFromUiExpressions(expressions);
    const ruleType = !this.isCompareFeatureEnabled && inferredRuleType === RuleTypeEnum.Compare
      ? RuleTypeEnum.Conditional
      : inferredRuleType;
    this.selectedTab = ruleTypeTabConfig[ruleType].onClickEvent;
    if (ruleType === RuleTypeEnum.Compare) {
      this.hydrateCompareFormFromExpressions(expressions, expressionString);
    }
    this.syncTabSelectionState();
    this.setTabMode(this.selectedTab, false);
  }

  private syncTabSelectionState(): void {
    if (!Array.isArray(this.tabList)) {
      return;
    }

    this.tabList = this.tabList.map((tab) => ({
      ...tab,
      selected: tab.onClickEvent === this.selectedTab,
    }));
  }
  // CVA callbacks
  registerOnChange(fn: (value: any) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  // ----- Validator (NG_VALIDATORS) -----
  validate(_control: AbstractControl): ValidationErrors | null {
    return this.form?.valid ? null : { childInvalid: true };
  }
  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  private propagateFormChangesToParent() {
    // Propagate value changes to parent control (CVA)
    this.form.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isWriting) return;
        this.emitCurrentFormValueToParent();
      });
    // Important: notify parent that validity changed, so it re-runs validation
    this.form.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isWriting) return;
        this.onValidatorChange();
      });
  }

  /**
   * Emits a raw form snapshot so disabled controls remain available to the parent CVA consumer.
   *
   * Compare mode stores its serialized expression in the disabled expressions array,
   * therefore `getRawValue()` must be used instead of `form.value`.
   */
  private emitCurrentFormValueToParent(): void {
    this.onChange(this.form.getRawValue());
    this.onTouched();
  }

  private initForm() {
    this.form = this.fb.group({
      [this.formControlNameList.EXPRESSIONS]: this.fb.array([]),
      [this.formControlNameList.ACTION]: [null, Validators.required],
      [this.formControlNameList.COMPARE]: this.fb.group({
        [this.formControlNameList.COMPARE_CRITERIA_TYPE]: [null],
        [this.formControlNameList.COMPARE_CRITERIA_VALUE]: [null],
        [this.formControlNameList.COMPARE_ATTR1]: [null, Validators.required],
        [this.formControlNameList.COMPARE_LOGICAL_OPERATOR]: [null, Validators.required],
        [this.formControlNameList.COMPARE_ATTR2]: [null, Validators.required],
        [this.formControlNameList.COMPARE_ARITHMETIC_OPERATOR]: [null, Validators.required],
        [this.formControlNameList.COMPARE_ATTR3]: [null, Validators.required],
      }),
    }, {
      validators: (control: AbstractControl) => this.ruleEditorFormValidator(control as FormGroup)
    });
  }

  /**
   * Routes form-level validation by active tab so compare mode validates only compare controls.
   */
  private ruleEditorFormValidator(form: FormGroup): ValidationErrors | null {
    if (this.selectedTab === RuleTypeEnum.Compare) {
      return this.compareExpressionValidator(form);
    }

    return this.resellerExpressionValidator(form);
  }

  private initTabs() {
    this.tabs = RuleEngineHelper.getRuleTypesTabList(this.isCompareFeatureEnabled);
    this.tabList = Object.values(this.tabs);
    const defaultSelectedTab = this.tabList.find((tab) => tab.selected)?.onClickEvent;
    this.selectedTab = defaultSelectedTab ?? ruleTypeTabConfig.Conditional.onClickEvent;
    this.syncTabSelectionState();
  }

  tabClickHandler(tab: S1FilterButtons | string) {
    if (this.isValidFilterButton(tab) && tab.onClickEvent === this.selectedTab) {
      return;
    }
    this.openDialog(tab);    
  }

  private openDialog(tab: S1FilterButtons | string) {
    this.closeDialog();
    const data = RuleEngineHelper.getRuleTypeTabSwitchConfirmationDialogData();
    this.dialogRef = this.dialog.open(PpcDialogComponent, {
      height: '232px',
      width: '75vw',
      maxWidth: '75vw',
      disableClose: false,
      position: { bottom: '0', right: '0' },
      data,
    });

    this.dialogRef.afterClosed()
      .pipe(take(1))
      .subscribe((dialogResult: string | boolean | undefined) => {
        if (dialogResult === 'confirm') {
          this.confirmTabSwitch(tab);
        } else {
          // User cancelled: revert tab button state to match actual selectedTab
          this.syncTabSelectionState();
        }
      });
  }

  private closeDialog() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  private confirmTabSwitch(tab: S1FilterButtons | string) {
    if (!this.isValidFilterButton(tab)) {
      return;
    }

    this.setTabMode(tab.onClickEvent, true);
  }

  private isValidFilterButton(btn: S1FilterButtons | string): btn is S1FilterButtons & { onClickEvent: string } {
    return typeof btn === 'object' && typeof btn.onClickEvent === 'string';
  }

  private getCountryRegionAPIResponse() {
    this.dashboardDataSVC.countryRegionData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (!res) return;
        this.countryRegionResponse = [...res];
        this.countryData = RuleEngineHelper.getAllCountryRegionList(this.countryRegionResponse);
        this.updateCompareCriteriaValueOptions();
        this.flushPendingCriteriaHydration();
      });
  }

  private flushPendingCriteriaHydration(): void {
    if (!this.pendingCriteriaHydration) return;
    const { criteriaType, rawValue } = this.pendingCriteriaHydration;
    this.pendingCriteriaHydration = null;
    const options = criteriaType === 'Country'
      ? (this.countryData?.countries ?? [])
      : (this.countryData?.regions ?? []);
    const matchedOption = options.find(
      (opt) => String(opt.value).toLowerCase() === rawValue.toLowerCase(),
    ) ?? null;
    if (matchedOption) {
      this.compareForm.get(this.formControlNameList.COMPARE_CRITERIA_VALUE)?.setValue(matchedOption, { emitEvent: false });
      this.refreshValidation();
    }
  }

  private getCountryRegionData() {
    if (Array.isArray(this.countryRegionResponse) && this.countryRegionResponse.length) {
      this.countryData = RuleEngineHelper.getAllCountryRegionList(this.countryRegionResponse);
      this.updateCompareCriteriaValueOptions();
      return;
    }

    this.countryData = { countries: [], regions: [] };
    this.updateCompareCriteriaValueOptions();
  }

  private subscribeToOverride() {
    this.ruleEngineDataSVC.overrideValue$
      .pipe(
        takeUntil(this.destroy$),
        map((res): SelectDropdown[] => {
          if (!res || !this.schema || !this.behavior) return [];
          this.selectedOverride = res;
          this.resetForm();
          this.refreshValidation();
          return this.getAttributeListForOverride(res);
        }),
      ).subscribe((list) => {
        this.attributeList = list;
        this.updateCompareAttributeOptions();
        this.updateCompareCriteriaValueOptions();
      });
  }

  private getAttributeListForOverride(override: string): SelectDropdown[] {
    return RuleEngineHelper.getExpressionAttributesForOverride(this.rawAttributeList, override);
  }

  private subscribeToLevelValues() {
    this.ruleEngineDataSVC.levelValue$
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if(res) {
          this.selectedLevelValue = [...res];
        }
        this.resetForm();
      });
  }

  private resetForm() {
    this.form.reset();
    this.expressions.clear();
    this.operatorOptions = [];
    this.addExpression();
    this.resetCompareForm();
    this.form.get(this.formControlNameList.ACTION)?.setValue(null);
    this.setTabMode(this.selectedTab, false);
  }

  get expressions(): FormArray {
    return this.form.get(this.formControlNameList.EXPRESSIONS) as FormArray;
  }

  get compareForm(): FormGroup {
    return this.form.get(this.formControlNameList.COMPARE) as FormGroup;
  }

  private initializeCompareMode(): void {
    const operatorLabels: Record<string, string> = {
      '==': '== (Equal)',
      '!=': '!= (Not Equal)',
      '<': '< (Less Than)',
      '<=': '<= (Less Than or Equal)',
      '>': '> (Greater Than)',
      '>=': '>= (Greater Than or Equal)',
    };

    this.compareLogicalOperatorOptions = ['!=', '<', '<=', '>', '>=', '=='].map((operator) => ({
      label: operatorLabels[operator] ?? operator,
      value: operator,
    }));
    this.syncCompareCriteriaSelectionState(null);
    this.updateCompareAttributeOptions();
    this.subscribeToCompareFieldChanges();
    this.subscribeToCompareCriteriaChanges();
  }

  get showCompareResellerCriteria(): boolean {
    return this.isCompareFeatureEnabled
      && this.selectedTab === RuleTypeEnum.Compare
      && this.selectedOverride === 'Reseller';
  }

  private subscribeToCompareCriteriaChanges(): void {
    const criteriaTypeControl = this.compareForm.get(this.formControlNameList.COMPARE_CRITERIA_TYPE);
    const criteriaValueControl = this.compareForm.get(this.formControlNameList.COMPARE_CRITERIA_VALUE);

    criteriaTypeControl?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((criteriaType: CompareCriteriaType | null) => {
        this.syncCompareCriteriaSelectionState(criteriaType);
        this.updateCompareCriteriaValueOptions();

        const currentCriteriaValue = criteriaValueControl?.value as SelectDropdown | null;
        if (!currentCriteriaValue) {
          this.refreshValidation();
          return;
        }

        const isCurrentValueValid = this.compareCriteriaValueOptions.some(
          (option) => option.value === currentCriteriaValue.value,
        );

        if (!isCurrentValueValid) {
          criteriaValueControl?.setValue(null);
          return;
        }

        this.refreshValidation();
      });
  }

  compareCriteriaClickHandler(tab: S1FilterButtons | string): void {
    if (!this.isValidFilterButton(tab)) {
      return;
    }

    const nextCriteriaType = tab.onClickEvent as CompareCriteriaType;
    const criteriaTypeControl = this.compareForm.get(this.formControlNameList.COMPARE_CRITERIA_TYPE);
    if (criteriaTypeControl?.value === nextCriteriaType) {
      return;
    }

    criteriaTypeControl?.setValue(nextCriteriaType);
    this.compareForm.get(this.formControlNameList.COMPARE_CRITERIA_VALUE)?.setValue(null);
  }

  private syncCompareCriteriaSelectionState(selectedCriteriaType: CompareCriteriaType | null): void {
    this.compareCriteriaTabList = this.compareCriteriaTabList.map((tab) => ({
      ...tab,
      selected: tab.onClickEvent === selectedCriteriaType,
    }));
  }

  private updateCompareCriteriaValueOptions(): void {
    if (!this.showCompareResellerCriteria) {
      this.compareCriteriaValueOptions = [];
      this.syncCompareCriteriaSelectionState(null);
      return;
    }

    const criteriaType = this.compareForm.get(this.formControlNameList.COMPARE_CRITERIA_TYPE)?.value as CompareCriteriaType | null;
    if (criteriaType === 'Region') {
      this.compareCriteriaValueOptions = [...(this.countryData?.regions ?? [])];
      return;
    }

    if (criteriaType === 'Country') {
      this.compareCriteriaValueOptions = [...(this.countryData?.countries ?? [])];
      return;
    }

    this.compareCriteriaValueOptions = [];
  }

  /**
   * Creates compare attribute options from helper-filtered comparable metadata.
   */
  private updateCompareAttributeOptions(): void {
    if (!this.selectedOverride) {
      this.compareAttributeOptions = [];
      this.compareAttr2Options = [];
      this.compareAttr3Options = [];
      return;
    }

    this.compareAttributeOptions = RuleEngineHelper.getComparableExpressionAttributesForOverride(
      this.rawAttributeList,
      this.selectedOverride,
    );
    this.updateCompareDependentOptions();
  }

  /**
   * Recomputes Attr2/Attr3 lists based on uniqueness constraints.
   */
  private updateCompareDependentOptions(): void {
    const selectedAttr1 = this.getCompareSelectionValue(this.formControlNameList.COMPARE_ATTR1);
    const selectedAttr2 = this.getCompareSelectionValue(this.formControlNameList.COMPARE_ATTR2);

    this.compareAttr2Options = this.compareAttributeOptions
      .filter((option) => option.value !== selectedAttr1);

    this.compareAttr3Options = this.compareAttributeOptions
      .filter((option) => option.value !== selectedAttr1 && option.value !== selectedAttr2);

    this.resetInvalidCompareSelection(this.formControlNameList.COMPARE_ATTR2, this.compareAttr2Options);
    this.resetInvalidCompareSelection(this.formControlNameList.COMPARE_ATTR3, this.compareAttr3Options);
  }

  private resetInvalidCompareSelection(controlName: string, validOptions: SelectDropdown[]): void {
    const currentValue = this.compareForm.get(controlName)?.value as SelectDropdown | null;
    if (!currentValue) {
      return;
    }

    const isCurrentValueValid = validOptions.some((option) => option.value === currentValue.value);
    if (!isCurrentValueValid) {
      this.compareForm.get(controlName)?.setValue(null);
    }
  }

  private getCompareSelectionValue(controlName: string): string {
    const currentValue = this.compareForm.get(controlName)?.value as SelectDropdown | null;
    return String(currentValue?.value ?? '').trim();
  }

  /**
   * Wires compare form events to enforce reset behavior and keep expression row synchronized.
   */
  private subscribeToCompareFieldChanges(): void {
    const attr1Control = this.compareForm.get(this.formControlNameList.COMPARE_ATTR1);
    const attr2Control = this.compareForm.get(this.formControlNameList.COMPARE_ATTR2);

    attr1Control?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedAttr1) => {
        if (this.isSyncingCompareToExpression) {
          return;
        }

        if (this.selectedTab === RuleTypeEnum.Compare && this.isCompareFormFilled() && !!selectedAttr1) {
          this.resetCompareFormPreservingChangedControl(this.formControlNameList.COMPARE_ATTR1, selectedAttr1);
          return;
        }

        this.updateCompareDependentOptions();
        this.syncCompareToExpressionRow();
      });

    attr2Control?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((selectedAttr2) => {
        if (this.isSyncingCompareToExpression) {
          return;
        }

        if (this.selectedTab === RuleTypeEnum.Compare && this.isCompareFormFilled() && !!selectedAttr2) {
          this.resetCompareFormPreservingChangedControl(this.formControlNameList.COMPARE_ATTR2, selectedAttr2);
          return;
        }

        this.updateCompareDependentOptions();
        this.syncCompareToExpressionRow();
      });

    this.compareForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isSyncingCompareToExpression) {
          return;
        }

        this.updateCompareDependentOptions();
        this.syncCompareToExpressionRow();
      });
  }

  private isCompareFormFilled(): boolean {
    const value = this.compareForm.getRawValue();
    return !!(
      value?.[this.formControlNameList.COMPARE_ATTR1]
      && value?.[this.formControlNameList.COMPARE_LOGICAL_OPERATOR]
      && value?.[this.formControlNameList.COMPARE_ATTR2]
      && value?.[this.formControlNameList.COMPARE_ARITHMETIC_OPERATOR]
      && value?.[this.formControlNameList.COMPARE_ATTR3]
    );
  }

  /**
   * Resets compare values after attr1/attr2 change while preserving the latest changed selection.
   */
  private resetCompareFormPreservingChangedControl(changedControl: string, changedValue: SelectDropdown): void {
    this.isSyncingCompareToExpression = true;
    this.compareForm.reset();
    this.syncCompareCriteriaSelectionState(null);
    this.compareCriteriaValueOptions = [];
    this.compareForm.get(changedControl)?.setValue(changedValue, { emitEvent: false });
    this.isSyncingCompareToExpression = false;
    this.updateCompareDependentOptions();
    this.updateCompareCriteriaValueOptions();
    this.syncCompareToExpressionRow();
  }

  private resetCompareForm(): void {
    this.compareForm.reset({}, { emitEvent: false });
    this.syncCompareCriteriaSelectionState(null);
    this.compareCriteriaValueOptions = [];
    this.updateCompareDependentOptions();
  }

  private ensureSingleExpressionRow(): FormGroup {
    if (this.expressions.length === 0) {
      this.addExpression();
    }

    if (this.expressions.length > 1) {
      while (this.expressions.length > 1) {
        this.expressions.removeAt(this.expressions.length - 1);
        this.operatorOptions.pop();
      }
    }

    return this.expressions.at(0) as FormGroup;
  }

  /**
   * Persists compare selections into expressions[0] so existing payload serialization remains unchanged.
   */
  private syncCompareToExpressionRow(): void {
    if (this.selectedTab !== RuleTypeEnum.Compare) {
      return;
    }

    const firstRow = this.ensureSingleExpressionRow();
    const compareValue = this.compareForm.getRawValue();
    const attr1 = compareValue?.[this.formControlNameList.COMPARE_ATTR1] as SelectDropdown | null;
    const logicalOperator = compareValue?.[this.formControlNameList.COMPARE_LOGICAL_OPERATOR] as SelectDropdown | null;
    const attr2 = compareValue?.[this.formControlNameList.COMPARE_ATTR2] as SelectDropdown | null;
    const arithmeticOperator = compareValue?.[this.formControlNameList.COMPARE_ARITHMETIC_OPERATOR] as SelectDropdown | null;
    const attr3 = compareValue?.[this.formControlNameList.COMPARE_ATTR3] as SelectDropdown | null;

    if (!attr1 || !logicalOperator || !attr2 || !arithmeticOperator || !attr3) {
      firstRow.patchValue({
        [this.formControlNameList.LOGICAL_OPERATOR]: null,
        [this.formControlNameList.ATTRIBUTE]: null,
        [this.formControlNameList.OPERATOR]: null,
        [this.formControlNameList.VALUE]: null,
      }, { emitEvent: false });
      this.refreshValidation();
      if (!this.isWriting) {
        this.emitCurrentFormValueToParent();
      }
      return;
    }

    const rightOperand = RuleEngineExpressionHelper.buildCompareOperand(
      String(attr2.value),
      String(arithmeticOperator.value) as '+' | '-',
      String(attr3.value),
    );

    firstRow.patchValue({
      [this.formControlNameList.LOGICAL_OPERATOR]: null,
      [this.formControlNameList.ATTRIBUTE]: attr1,
      [this.formControlNameList.OPERATOR]: logicalOperator,
      [this.formControlNameList.VALUE]: rightOperand,
    }, { emitEvent: false });

    this.refreshValidation();
    if (!this.isWriting) {
      this.emitCurrentFormValueToParent();
    }
  }

  /**
   * Hydrates compare controls from API/edit expression row when compare mode is detected.
   */
  private hydrateCompareFormFromExpressions(expressions: RuleExpressionUI[], expressionString: string | null = null): void {
    const rawExpression = String(expressionString ?? this.pendingExpressionString ?? '').trim();
    const hydrationFromExpression = rawExpression
      ? RuleEngineExpressionHelper.getCompareEditHydrationFromExpression(rawExpression)
      : null;

    const compareParts = hydrationFromExpression?.compareParts
      ?? RuleEngineExpressionHelper.getComparePartsFromUiExpressions(expressions);

    if (!compareParts) {
      this.resetCompareForm();
      return;
    }

    this.updateCompareAttributeOptions();
    this.isSyncingCompareToExpression = true;
    this.compareForm.patchValue({
      [this.formControlNameList.COMPARE_ATTR1]: this.findCompareAttribute(compareParts.attr1),
      [this.formControlNameList.COMPARE_LOGICAL_OPERATOR]: { label: compareParts.logicalOperator, value: compareParts.logicalOperator },
      [this.formControlNameList.COMPARE_ATTR2]: this.findCompareAttribute(compareParts.attr2),
      [this.formControlNameList.COMPARE_ARITHMETIC_OPERATOR]: { label: compareParts.arithmeticOperator, value: compareParts.arithmeticOperator },
      [this.formControlNameList.COMPARE_ATTR3]: this.findCompareAttribute(compareParts.attr3),
    }, { emitEvent: false });
    this.isSyncingCompareToExpression = false;
    this.updateCompareDependentOptions();
    this.syncCompareToExpressionRow();

    const hasLogicalConnector = hydrationFromExpression?.hasLogicalConnector ?? expressions.length > 1;
    const parsedCriteria = hydrationFromExpression?.criteria ?? null;
    this.hydrateCriteriaFromCompareExpression(hasLogicalConnector, parsedCriteria);
  }

  /**
   * Hydrates compare criteria using raw compare-expression split results.
   *
   * Rules:
   * 1) Compare mode + no logical connector => non-reseller compare, do not prefill criteria.
   * 2) Compare mode + logical connector + reseller override => prefill criteria.
   * 3) Compare mode + logical connector + non-reseller override => do not prefill criteria.
   */
  private hydrateCriteriaFromCompareExpression(
    hasLogicalConnector: boolean,
    criteria: { criteriaType: CompareCriteriaType; rawValue: string } | null,
  ): void {
    if (!hasLogicalConnector || this.selectedOverride !== 'Reseller' || !criteria) {
      this.compareForm.get(this.formControlNameList.COMPARE_CRITERIA_TYPE)?.setValue(null, { emitEvent: false });
      this.compareForm.get(this.formControlNameList.COMPARE_CRITERIA_VALUE)?.setValue(null, { emitEvent: false });
      this.syncCompareCriteriaSelectionState(null);
      this.updateCompareCriteriaValueOptions();
      this.pendingCriteriaHydration = null;
      return;
    }

    // Set criteria type immediately — does not require country/region data
    this.compareForm.get(this.formControlNameList.COMPARE_CRITERIA_TYPE)?.setValue(criteria.criteriaType, { emitEvent: false });
    this.syncCompareCriteriaSelectionState(criteria.criteriaType);
    this.updateCompareCriteriaValueOptions();

    const matchedOption = this.compareCriteriaValueOptions.find(
      (opt) => String(opt.value).toLowerCase() === criteria.rawValue.toLowerCase(),
    ) ?? null;

    if (matchedOption) {
      this.compareForm.get(this.formControlNameList.COMPARE_CRITERIA_VALUE)?.setValue(matchedOption, { emitEvent: false });
      this.pendingCriteriaHydration = null;
    } else {
      // Country/region list not yet loaded; store for deferred patching in getCountryRegionAPIResponse
      this.pendingCriteriaHydration = criteria;
    }
  }

  private findCompareAttribute(attributeKey: string): SelectDropdown | null {
    const normalizedKey = attributeKey.trim().toLowerCase();
    return this.compareAttributeOptions.find((option) => String(option.value).trim().toLowerCase() === normalizedKey) ?? null;
  }

  /**
   * Activates a tab and toggles compare/conditional control sets accordingly.
   *
   * Compare requests are normalized to Conditional when compare feature is disabled.
   */
  private setTabMode(nextTab: string, wipePreviousTabValues: boolean): void {
    if (!this.isCompareFeatureEnabled && nextTab === RuleTypeEnum.Compare) {
      nextTab = RuleTypeEnum.Conditional;
    }

    const previousTab = this.selectedTab;
    this.selectedTab = nextTab;
    this.syncTabSelectionState();

    if (wipePreviousTabValues && previousTab !== nextTab) {
      // Decision selection is shared across tabs in the UI, but when the user
      // confirms a tab change we reset tab-authored state completely, including
      // the action dropdown, so the new tab starts from a clean slate.
      this.form.get(this.formControlNameList.ACTION)?.setValue(null, { emitEvent: false });

      if (previousTab === RuleTypeEnum.Compare) {
        // Compare mode mirrors its state into expressions[0] for payload compatibility.
        // When leaving compare mode after user confirmation, both the compare form and
        // the mirrored conditional row must be cleared so stale values do not appear.
        this.resetCompareForm();
        this.resetConditionalExpressions();
      }

      if (previousTab === RuleTypeEnum.Conditional) {
        this.resetConditionalExpressions();
      }
    }

    if (nextTab === RuleTypeEnum.Compare) {
      this.compareForm.enable({ emitEvent: false });
      this.expressions.disable({ emitEvent: false });
      this.ensureSingleExpressionRow();
      this.syncCompareToExpressionRow();
    } else {
      this.compareForm.disable({ emitEvent: false });
      this.expressions.enable({ emitEvent: false });
    }

    this.refreshValidation();
  }

  private resetConditionalExpressions(): void {
    this.expressions.clear();
    this.operatorOptions = [];
    this.addExpression();
  }

  private createExpressionGroup(expr: RuleExpressionUI | undefined, rowIndex: number): FormGroup {
    const rowGroup = this.initializeRowGroup(expr, rowIndex);
    this.initializeOperatorOptions(expr, rowIndex);

    this.subscribeToAttributeChanges(rowGroup, rowIndex);
    this.subscribeToRegionDependentChanges(rowGroup);

    this.initializeFilteredOptions(rowGroup, expr);

    return rowGroup;
  }

  /** Initialize the base FormGroup for an expression row */
  private initializeRowGroup(expr: RuleExpressionUI | undefined, rowIndex: number): FormGroup {
    return this.fb.group({
      [this.formControlNameList.LOGICAL_OPERATOR]: [
        expr?.logicalOperator ?? (rowIndex > 0 ? 'And' : null)
      ],
      [this.formControlNameList.ATTRIBUTE]: [expr?.attribute, Validators.required],
      [this.formControlNameList.OPERATOR]: [expr?.operator, Validators.required],
      [this.formControlNameList.VALUE]: [expr?.value, Validators.required],
      filteredOptions: this.fb.control<SelectDropdown[] | null>(null)
    });
  }

  /** Sets the operator options (numeric/string) for the given row */
  private initializeOperatorOptions(expr: RuleExpressionUI | undefined, rowIndex: number): void {
    const metadata = this.findNormalizedAttribute(expr?.attribute ?? null);
    this.operatorOptions[rowIndex] = this.getOperatorsForMetadata(metadata);
  }

  /** Subscribes to ATTRIBUTE changes and updates operator/value/options dynamically */
  private subscribeToAttributeChanges(rowGroup: FormGroup, rowIndex: number): void {
    rowGroup.get(this.formControlNameList.ATTRIBUTE)?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(attr => {
        if (!attr) return;

        // Reset operator/value for current row
        this.resetRowOperatorAndValue(rowGroup);

        // Update operator options for this attribute type
        this.updateOperatorOptionsForRow(attr, rowIndex);

        // Update filtered options for the row
        this.updateFilteredOptions(rowGroup, attr);
      });
  }

  /**
   * Subscribes to parent row changes that should invalidate dependent child rows.
   */
  private subscribeToRegionDependentChanges(rowGroup: FormGroup): void {
    const getResetRule = (): CascadeRule | null => {
      const attributeKey = RuleEngineExpressionHelper.attrKey(
        rowGroup.get(this.formControlNameList.ATTRIBUTE)?.value,
      );
      const cascadeRule = this.findCascadeRuleByParentKey(attributeKey);
      if (!cascadeRule?.resetChildOnParentChange) {
        return null;
      }

      return cascadeRule;
    };

    if (!getResetRule()) {
      return;
    }

    const reset$ = merge(
      rowGroup.get(this.formControlNameList.VALUE)?.valueChanges ?? EMPTY,
      rowGroup.get(this.formControlNameList.OPERATOR)?.valueChanges ?? EMPTY
    );

    reset$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      const cascadeRule = getResetRule();
      if (cascadeRule) {
        this.resetAllCountryRows(cascadeRule);
      }
    });
  }

  /** Initializes filtered options for prefilled attributes */
  private initializeFilteredOptions(rowGroup: FormGroup, expr?: RuleExpressionUI): void {
    const initialAttr = expr?.attribute;
    if (!initialAttr) return;

    const options = this.getFilteredOptionsForRow(rowGroup, initialAttr);
    rowGroup.patchValue({ filteredOptions: options }, { emitEvent: false });
  }

  /** Reset operator and value fields for a single row */
  private resetRowOperatorAndValue(rowGroup: FormGroup): void {
    rowGroup.patchValue(
      {
        [this.formControlNameList.OPERATOR]: null,
        [this.formControlNameList.VALUE]: null
      },
      { emitEvent: false }
    );
  }

  /** Update operator options based on attribute type */
  private updateOperatorOptionsForRow(attr: any, rowIndex: number): void {
    const metadata = this.findNormalizedAttribute(attr);
    this.operatorOptions[rowIndex] = this.getOperatorsForMetadata(metadata);
  }

  private getOperatorsForMetadata(metadata: NormalizedAttribute | null): SelectDropdown[] {
    if (!metadata || !this.schema) {
      return [];
    }

    const operators = this.ruleConfigAdapter.getOperatorsForAttribute(metadata, this.schema.operatorSets);
    return operators.map((operator) => ({ label: operator, value: operator }));
  }

  /** Update filtered dropdown options for the given row */
  private updateFilteredOptions(rowGroup: FormGroup, attr: any): void {
    const options = this.getFilteredOptionsForRow(rowGroup, attr);
    rowGroup.patchValue({ filteredOptions: options }, { emitEvent: false });
  }

  /**
   * Resets dependent child rows when the linked parent changes.
   */
  private resetAllCountryRows(rule: CascadeRule): void {
    for (const ctrl of this.expressions.controls) {
      const key = RuleEngineExpressionHelper.attrKey(ctrl.get(this.formControlNameList.ATTRIBUTE)?.value);

      if (!this.areAttributeKeysEqual(key, rule.childAttributeKey)) {
        continue;
      }

      const attrValue = ctrl.get(this.formControlNameList.ATTRIBUTE)?.value;
      const options = this.getFilteredOptionsForRow(ctrl as FormGroup, attrValue);

      ctrl.patchValue(
        {
          [this.formControlNameList.VALUE]: null,
          [this.formControlNameList.OPERATOR]: null,
          filteredOptions: options
        },
        { emitEvent: false }
      );
    }
  }

  private updateAttributeListBasedOnCountry(): void {
    if (!this.selectedOverride) {
      return;
    }

    this.attributeList = RuleEngineHelper.getExpressionAttributesForOverride(this.rawAttributeList, this.selectedOverride);
    this.cdr.detectChanges();
  }

  /**
   * Returns the filtered attribute options for a specific expression row.
   *
   * When `shellConfig.allowDuplicateAttributes` is false, attributes already
   * selected in *other* rows are excluded so each attribute can only appear once
   * across all expressions (both create and edit mode).
   *
   * When `allowDuplicateAttributes` is true (or shellConfig is not yet loaded),
   * the full override-filtered `attributeList` is returned unchanged.
   *
   * @param rowIndex - Zero-based index of the expression row being rendered
   * @returns Filtered list of attribute options for that row's dropdown
   */
  getAttributeOptionsForRow(rowIndex: number): SelectDropdown[] {
    if (!this.shellConfig || this.shellConfig.allowDuplicateAttributes) {
      return this.attributeList;
    }

    // Map each expression row to the shape expected by the adapter helper
    const expressionRefs = this.expressions.controls.map((ctrl) => {
      const attrValue = ctrl.get(this.formControlNameList.ATTRIBUTE)?.value as SelectDropdown | null;
      return attrValue ? { attribute: { key: String(attrValue.value ?? '') } } : null;
    });

    const selectedInOthers = this.ruleConfigAdapter.getSelectedAttributeKeysInOtherExpressions(
      expressionRefs,
      rowIndex,
    );

    return this.attributeList.filter(
      (option) => !selectedInOthers.has(String(option.value ?? '')),
    );
  }

  /**
   * Disables "Add Condition" only for Conditional tab when all unique attributes
   * from the current override-filtered list are already selected in expression rows.
   *
   * This logic is intentionally scoped to duplicate-restricted workflows
   * (`allowDuplicateAttributes === false`). For permissive workflows, adding
   * additional rows remains enabled.
   */
  isAddConditionDisabled(): boolean {
    if (this.selectedTab !== RuleTypeEnum.Conditional) {
      return false;
    }

    if (!this.shellConfig || this.shellConfig.allowDuplicateAttributes) {
      return false;
    }

    if (!Array.isArray(this.attributeList) || this.attributeList.length === 0) {
      return false;
    }

    const selectedAttributes = new Set<string>();
    this.expressions.controls.forEach((ctrl) => {
      const attrValue = ctrl.get(this.formControlNameList.ATTRIBUTE)?.value as SelectDropdown | null;
      const normalizedValue = String(attrValue?.value ?? '').trim();
      if (normalizedValue) {
        selectedAttributes.add(normalizedValue);
      }
    });

    return selectedAttributes.size >= this.attributeList.length;
  }

  private getFilteredOptionsForRow(row: FormGroup, attr: RuleSelectableValue): SelectDropdown[] {
    const metadata = this.findNormalizedAttribute(attr);
    const key = RuleEngineExpressionHelper.attrKey(attr);
    const cascadeRule = this.findCascadeRuleByChildKey(key);

    if (metadata?.dataType === 'bool') {
      return this.getBoolValueDropDownOptions();
    }

    if (!cascadeRule) {
      return this.getValueDropdownOptions(attr);
    }

    const parentRows = this.getValidCascadeParentRows(cascadeRule);
    if (parentRows.length === 0) {
      return this.getDefaultCascadeChildOptions(cascadeRule);
    }

    const allCountries = parentRows.flatMap((ctrl) => this.getCascadeChildOptionsForParentRow(cascadeRule, ctrl));
    return this.getUniqueCountries(allCountries);
  }

  private getUniqueCountries(countries: SelectDropdown[]): SelectDropdown[] {
    return Array.from(new Map(countries.map(c => [c.value, c])).values());
  }

  /**
   * Syncs the default child option cache used by the first-row dropdown path.
   */
  private applyCountryFiltering(attr: RuleSelectableValue): void {
    const key = RuleEngineExpressionHelper.attrKey(attr);
    const cascadeRule = this.findCascadeRuleByChildKey(key);

    if (cascadeRule) {
      this.countryData.countries = [...this.getDefaultCascadeChildOptions(cascadeRule)];
    } else {
      this.countryData = RuleEngineHelper.getAllCountryRegionList(this.countryRegionResponse);
    }

    this.cdr.detectChanges();
  }


  addExpression(expr?: RuleExpressionUI) {
    const idx = this.expressions.length;
    const rowGroup = this.createExpressionGroup(expr, idx);
    this.expressions.push(rowGroup);
    this.updateAttributeListBasedOnCountry();
    this.refreshValidation();
  }

  removeExpression(index: number) {
    this.expressions.removeAt(index);
    this.operatorOptions.splice(index, 1);
    this.updateAttributeListBasedOnCountry();
    this.refreshValidation();
  }

  isDropdownValuetype(expr: AbstractControl | null): boolean {
    const attr = expr?.get(this.formControlNameList.ATTRIBUTE)?.value as RuleSelectableValue;
    const metadata = this.findNormalizedAttribute(attr);
    return metadata?.inputType === 'dropdown';
  }

  getValueDropdownOptionsWrapper(expr: AbstractControl | null): SelectDropdown[] {
    const attr = expr?.get(this.formControlNameList.ATTRIBUTE)?.value as RuleSelectableValue;
    const key = RuleEngineExpressionHelper.attrKey(attr);
    const metadata = this.findNormalizedAttribute(attr);
    const cascadeRule = this.findCascadeRuleByChildKey(key);

    if (metadata?.dataType === 'bool') {
      return this.getBoolValueDropDownOptions();
    }

    if (!cascadeRule) {
      return this.getValueDropdownOptions(attr);
    }

    const parentRow = this.findFirstCascadeParentRow(cascadeRule);
    if (!parentRow) {
      return this.getValueDropdownOptions(attr);
    }

    const { operatorName, parentValue } = this.getRegionRowDetails(parentRow);
    if (!parentValue) {
      return this.getValueDropdownOptions(attr);
    }

    return this.resolveCountryOptions(cascadeRule, operatorName, parentValue) ?? this.getValueDropdownOptions(attr);
  }

  /**
   * Extracts operator and parent value from a populated cascade parent row.
   */
  private getRegionRowDetails(regionRow: AbstractControl): { operatorName: string; parentValue: string } {
    const operatorVal = regionRow.get(this.formControlNameList.OPERATOR)?.value;
    const regionVal = regionRow.get(this.formControlNameList.VALUE)?.value;

    return {
      operatorName: (operatorVal?.value ?? operatorVal) as string,
      parentValue: regionVal?.value ?? regionVal
    };
  }

  /**
   * Resolves child dropdown options for the first-row rendering path.
   */
  private resolveCountryOptions(rule: CascadeRule, operatorName: string, parentValue: string): SelectDropdown[] | null {
    if (!this.cascadeResolver) {
      return null;
    }

    return this.cascadeResolver.resolveChildOptions(
      rule,
      parentValue,
      operatorName,
      this.getCascadeResolverContext(),
    );
  }

  getValueDropdownOptions(attribute: RuleSelectableValue): SelectDropdown[] {
    const metadata = this.findNormalizedAttribute(attribute);
    const key = RuleEngineExpressionHelper.attrKey(attribute);
    const normalizedKey = String(key ?? '').trim().toLowerCase();

    if (this.isCascadeParentAttribute(key)) {
      return this.countryData.regions;
    }

    if (this.isCascadeChildAttribute(key)) {
      return this.countryData.countries;
    }

    if (metadata?.dataType === 'bool') {
      return this.getBoolValueDropDownOptions();
    }

    // In workflows without Region->Country cascade (e.g., CBC), Region/Country
    // fields still use the geo datasource key. That datasource is a
    // CountryRegionResponse[] payload, not a SelectDropdown[] list, so we must
    // map directly to precomputed region/country dropdowns.
    if (
      this.shellConfig?.geoDataSourceKey
      && metadata?.dataSourceRef === this.shellConfig.geoDataSourceKey
    ) {
      if (normalizedKey === 'region') {
        return this.countryData.regions;
      }
      if (normalizedKey === 'country') {
        return this.countryData.countries;
      }
    }

    if (!metadata?.dataSourceRef || !this.schema) {
      return [];
    }

    const options = this.ruleConfigAdapter.resolveDropdownOptions(metadata.dataSourceRef, this.schema.dataSources);
    return this.toSelectOptions(options);
  }

  getBoolValueDropDownOptions(): SelectDropdown[] {
    return boolOptions;
  }

  isValueField(expr: AbstractControl, type: 'numeric' | 'decimal' | 'stringWithSpecialChars'): boolean {
    const attr = expr?.get(this.formControlNameList.ATTRIBUTE)?.value as RuleSelectableValue;
    const metadata = this.findNormalizedAttribute(attr);

    if (type === 'numeric') {
      return metadata?.inputType === 'number';
    }
    if (type === 'decimal') {
      return metadata?.inputType === 'decimal';
    }
    if (type === 'stringWithSpecialChars') {
      return metadata?.inputType === 'text';
    }

    return false;
  }

  hasAttribute(expr: AbstractControl): boolean {
    const attr = expr?.get(this.formControlNameList.ATTRIBUTE)?.value;
    return !!attr;
  }

  /**
   * Computes compare summary markup for compare mode.
   * Returns empty string if any required field is missing or incomplete.
   *
   * Format: If {attr1Title} is {operator} ({attr2Title} {arithmeticOp} {attr3Title}), then {actionLabel}.
   * Only the decision text is bolded.
   */
  getCompareSummary(): string {
    const compareValue = this.compareForm.getRawValue();
    const attr1 = compareValue?.[this.formControlNameList.COMPARE_ATTR1] as SelectDropdown | null;
    const logicalOperator = compareValue?.[this.formControlNameList.COMPARE_LOGICAL_OPERATOR] as SelectDropdown | null;
    const attr2 = compareValue?.[this.formControlNameList.COMPARE_ATTR2] as SelectDropdown | null;
    const arithmeticOperator = compareValue?.[this.formControlNameList.COMPARE_ARITHMETIC_OPERATOR] as SelectDropdown | null;
    const attr3 = compareValue?.[this.formControlNameList.COMPARE_ATTR3] as SelectDropdown | null;
    const criteriaType = compareValue?.[this.formControlNameList.COMPARE_CRITERIA_TYPE] as CompareCriteriaType | null;
    const criteriaValue = compareValue?.[this.formControlNameList.COMPARE_CRITERIA_VALUE] as SelectDropdown | null;
    const actionValue = this.form.get(this.formControlNameList.ACTION)?.value as SelectDropdown | null;

    // Return empty if any required field is missing
    if (!attr1 || !logicalOperator || !attr2 || !arithmeticOperator || !attr3 || !actionValue) {
      return '';
    }

    // Resolve attribute titles from metadata
    const attr1Title = this.getAttributeTitleFromMetadata(String(attr1.value));
    const attr2Title = this.getAttributeTitleFromMetadata(String(attr2.value));
    const attr3Title = this.getAttributeTitleFromMetadata(String(attr3.value));

    if (!attr1Title || !attr2Title || !attr3Title) {
      return '';
    }

    // For reseller override, criteria is mandatory before showing summary.
    if (this.selectedOverride === 'Reseller' && (!criteriaType || !criteriaValue)) {
      return '';
    }

    const actionLabel = String(actionValue.label ?? actionValue.value);
    const operator = String(logicalOperator.value);
    const arithmeticOp = String(arithmeticOperator.value);
    const criteriaLabel = this.selectedOverride === 'Reseller' ? criteriaType : null;
    const criteriaValueLabel = this.selectedOverride === 'Reseller'
      ? String(criteriaValue?.label ?? criteriaValue?.value ?? '')
      : null;

    return RuleEngineHelper.getCompareSummaryMarkup(
      attr1Title,
      operator,
      attr2Title,
      arithmeticOp,
      attr3Title,
      actionLabel,
      {
        label: criteriaLabel,
        value: criteriaValueLabel,
      },
    );
  }

  /**
   * Resolves attribute title from internal metadata map using case-insensitive key lookup.
   */
  private getAttributeTitleFromMetadata(attributeKey: string): string | null {
    if (!attributeKey) {
      return null;
    }

    const normalizedKey = attributeKey.trim().toLowerCase();
    const metadata = this.attributeMetadata.get(normalizedKey);
    return metadata?.title ?? null;
  }

  private refreshValidation(): void {
    if (this.form) {
      this.form.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    }
  }

  /**
   * Compare tab validator that enforces required fields and unique attribute selection.
   */
  private compareExpressionValidator(form: FormGroup): ValidationErrors | null {
    const compareForm = form.get(this.formControlNameList.COMPARE);
    if (!(compareForm instanceof FormGroup)) {
      return { compareValidation: 'Compare group is not available.' };
    }

    const attr1 = compareForm.get(this.formControlNameList.COMPARE_ATTR1)?.value as SelectDropdown | null;
    const logicalOperator = compareForm.get(this.formControlNameList.COMPARE_LOGICAL_OPERATOR)?.value as SelectDropdown | null;
    const attr2 = compareForm.get(this.formControlNameList.COMPARE_ATTR2)?.value as SelectDropdown | null;
    const arithmeticOperator = compareForm.get(this.formControlNameList.COMPARE_ARITHMETIC_OPERATOR)?.value as SelectDropdown | null;
    const attr3 = compareForm.get(this.formControlNameList.COMPARE_ATTR3)?.value as SelectDropdown | null;
    const criteriaType = compareForm.get(this.formControlNameList.COMPARE_CRITERIA_TYPE)?.value as CompareCriteriaType | null;
    const criteriaValue = compareForm.get(this.formControlNameList.COMPARE_CRITERIA_VALUE)?.value as SelectDropdown | null;

    if (!attr1 || !logicalOperator || !attr2 || !arithmeticOperator || !attr3) {
      return { compareValidation: 'All compare fields are mandatory.' };
    }

    if (this.selectedOverride === 'Reseller' && (!criteriaType || !criteriaValue)) {
      return { compareValidation: 'Criteria selection is mandatory for reseller compare rules.' };
    }

    const selectedKeys = [String(attr1.value), String(attr2.value), String(attr3.value)];
    const uniqueKeyCount = new Set(selectedKeys).size;
    if (uniqueKeyCount !== selectedKeys.length) {
      return { compareValidation: 'Compare attributes must be unique.' };
    }

    return null;
  }

  private resellerExpressionValidator(form: FormGroup): ValidationErrors | null {
    if (this.selectedTab === RuleTypeEnum.Compare) {
      return null;
    }

    if (!this.behavior || !this.selectedOverride) {
      return null;
    }

    const expressions = form.get(this.formControlNameList.EXPRESSIONS) as FormArray;
    if (!expressions) {
      return null;
    }

    const normalizedExpressions = expressions.controls.map((control) => ({
      attribute: {
        key: RuleEngineExpressionHelper.attrKey(control.get(this.formControlNameList.ATTRIBUTE)?.value),
      },
    }));

    const validation = this.behavior.validateExpressions(normalizedExpressions, this.selectedOverride);
    return validation.valid ? null : { workflowValidation: validation.error ?? true };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
