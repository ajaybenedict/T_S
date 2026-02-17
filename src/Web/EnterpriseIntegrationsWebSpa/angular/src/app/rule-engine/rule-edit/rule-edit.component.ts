import { ChangeDetectorRef, Component, forwardRef, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormArray, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from '@angular/forms';
import { RuleExpressionRowType, RuleExpressionUI } from 'src/app/models/rule-engine/rule-engine';
import { SelectDropdown } from 'src/app/models/select-dropdown.interface';
import { boolOptions, C3OverrideLevels, c3RuleEngineAttributeList, LogicalOperators } from 'src/app/core/config/rule-engine.config';
import { RuleEngineDataService } from 'src/app/core/services/rule-engine/rule-engine-data.service';
import { EMPTY, map, merge, Subject, takeUntil } from 'rxjs';
import { PPCDashboardDataService } from 'src/app/core/services/ppc-dashboard-data.service';
import { RuleEngineExpressionHelper, RuleEngineHelper } from '../rule-engine-helper';
import { CountryRegionResponse } from 'src/app/models/ppc/country-region-api.interface';

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

  // CVA callbacks
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  // for controlling CVA updates firing multiple times while rebuilding
  private isWriting = false;

  // NG_VALIDATORS callback
  private onValidatorChange: () => void = () => {};

  form!: FormGroup;
  countryData!: {countries: SelectDropdown[], regions: SelectDropdown[]};
  selectedOverride!: C3OverrideLevels;
  selectedLevelValue!: string[];
  countryRegionResponse!: CountryRegionResponse[];
  attributeList!: SelectDropdown[];
  rowOperatorList = LogicalOperators;
  operatorOptions!: any[][]; // to maintain operator data for each row dynamically
  actionListData: SelectDropdown[] = RuleEngineHelper.getActionListDropdown();

  formControlNameList = {
    EXPRESSIONS: 'expressions',
    LOGICAL_OPERATOR: 'logicalOperator',
    ATTRIBUTE: 'attribute',
    OPERATOR: 'operator',
    VALUE: 'value',
    ACTION: 'action',
  }

  labels = {
    ATTRIBUTE: 'Attribute',
    OPERATOR: 'Operator',
    VALUE: 'Value',
    ACTION: 'Action',
  };

  constructor(
    private readonly fb: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
    private readonly ruleEngineDataSVC: RuleEngineDataService,
    private readonly dashboardDataSVC: PPCDashboardDataService,
  ) {}

  ngOnInit(): void {
    this.getCountryRegionAPIResponse();
    this.attributeList = [];
    this.initForm();
    // logic to get the region list
    this.getCountryRegionData();
    // AttributeList Logic based on override value
    this.subscribeToOverride();
    this.subscribeToLevelValues();
    this.operatorOptions = [];
    this.addExpression();
    // CVA
    this.propagateFormChangesToParent();
  }

  // ----- ControlValueAccessor -----
  writeValue(value: { expressions: RuleExpressionUI[], action: string } | null): void {
    if (!this.form) return; // in case called before ngOnInit
    // For create new rule
    if(!value) {
      this.isWriting = true;
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

    this.form.patchValue({[this.formControlNameList.ACTION]: value.action});

    this.form.updateValueAndValidity({ emitEvent: false });
    this.isWriting = false;

    // re-run filtering for pre-populated attributes
    this.expressions.controls.forEach(row => {
      const attr = row.get(this.formControlNameList.ATTRIBUTE)?.value;
      if (attr) this.applyCountryFiltering(attr);
    });

    this.refreshValidation();
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
      .subscribe(value => {
        if (this.isWriting) return;
        this.onChange(value);
        this.onTouched();
      });
    // Important: notify parent that validity changed, so it re-runs validation
    this.form.statusChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isWriting) return;
        this.onValidatorChange();
      });
  }

  private initForm() {
    this.form = this.fb.group({
      [this.formControlNameList.EXPRESSIONS]: this.fb.array([]),
      [this.formControlNameList.ACTION]: [null, Validators.required],
    }, {
      validators: () => this.resellerExpressionValidator(this.form)
    });
  }

  private getCountryRegionAPIResponse() {
    this.dashboardDataSVC.countryRegionData$
      .pipe(takeUntil(this.destroy$))
      .subscribe(res => {
        if (!res) return;
        this.countryRegionResponse = [...res];
      });
  }

  private getCountryRegionData() {
    if(this.countryRegionResponse)
      this.countryData = RuleEngineHelper.getAllCountryRegionList(this.countryRegionResponse);
  }

  private subscribeToOverride() {
    this.ruleEngineDataSVC.overrideValue$
      .pipe(
        takeUntil(this.destroy$),
        map(res => {
          if (!res) return [];
          this.selectedOverride = res;
          this.resetForm();
          this.refreshValidation();
          return RuleEngineHelper.getAttributeDropdown([...c3RuleEngineAttributeList.common, ...c3RuleEngineAttributeList.reseller, ...c3RuleEngineAttributeList.creditFlags], res);
        }),
      ).subscribe(list => this.attributeList = list);
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
    this.form.get(this.formControlNameList.ACTION)?.setValue(null)
  }

  get expressions(): FormArray {
    return this.form.get(this.formControlNameList.EXPRESSIONS) as FormArray;
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
        expr?.logicalOperator?.name ?? (rowIndex > 0 ? 'And' : null)
      ],
      [this.formControlNameList.ATTRIBUTE]: [expr?.attribute, Validators.required],
      [this.formControlNameList.OPERATOR]: [expr?.operator, Validators.required],
      [this.formControlNameList.VALUE]: [expr?.value, Validators.required],
      filteredOptions: this.fb.control<SelectDropdown[] | null>(null)
    });
  }

  /** Sets the operator options (numeric/string) for the given row */
  private initializeOperatorOptions(expr: RuleExpressionUI | undefined, rowIndex: number): void {
    const isNumberAttr = RuleEngineExpressionHelper.isNumericAttribute(expr?.attribute ?? null);
    this.operatorOptions[rowIndex] = RuleEngineHelper.getOperatorsDropdown(isNumberAttr ? 'number' : 'string');
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

  /** Subscribes to VALUE and OPERATOR changes for Region rows */
  private subscribeToRegionDependentChanges(rowGroup: FormGroup): void {
    const attrKey = () => RuleEngineExpressionHelper.attrKey(
      rowGroup.get(this.formControlNameList.ATTRIBUTE)?.value
    );

    const shouldReset = () => attrKey() === 'Region';
    const reset$ = merge(
      rowGroup.get(this.formControlNameList.VALUE)?.valueChanges ?? EMPTY,
      rowGroup.get(this.formControlNameList.OPERATOR)?.valueChanges ?? EMPTY
    );

    reset$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      if (shouldReset()) {
        this.resetAllCountryRows();
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
    const isNumber = RuleEngineExpressionHelper.isNumericAttribute(attr);
    this.operatorOptions[rowIndex] = RuleEngineHelper.getOperatorsDropdown(isNumber ? 'number' : 'string');
  }

  /** Update filtered dropdown options for the given row */
  private updateFilteredOptions(rowGroup: FormGroup, attr: any): void {
    const options = this.getFilteredOptionsForRow(rowGroup, attr);
    rowGroup.patchValue({ filteredOptions: options }, { emitEvent: false });
  }

  /** Resets all Country rows when Region changes */
  private resetAllCountryRows(): void {
    for (const ctrl of this.expressions.controls) {
      const key = RuleEngineExpressionHelper.attrKey(
        ctrl.get(this.formControlNameList.ATTRIBUTE)?.value
      );

      if (key !== 'Country') continue;

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
    if (!this.selectedOverride || this.selectedOverride !== 'Reseller') {
      return; // Only apply logic for Reseller override
    }

    // Check if any expression has Country selected
    const hasCountry = this.expressions.controls.some(ctrl => {
      const attr = ctrl.get(this.formControlNameList.ATTRIBUTE)?.value;
      const key = RuleEngineExpressionHelper.attrKey(attr);
      return key === 'Country';
    });

    // Get full list of attributes (Reseller + common)
    const fullList = RuleEngineHelper.getAttributeDropdown(
      [...c3RuleEngineAttributeList.common, ...c3RuleEngineAttributeList.reseller, ...c3RuleEngineAttributeList.creditFlags],
      this.selectedOverride
    );

    if (hasCountry) {
      // Remove Region from the attribute list
      this.attributeList = fullList.filter(attr => RuleEngineExpressionHelper.attrKey(attr) !== 'Region');
    } else {
      // Restore default list
      this.attributeList = fullList;
    }

    this.cdr.detectChanges();
  }

  private getFilteredOptionsForRow(row: FormGroup, attr: RuleExpressionRowType | SelectDropdown | string): SelectDropdown[] {
    const key = RuleEngineExpressionHelper.attrKey(attr);

    if(key && c3RuleEngineAttributeList.creditFlags.includes(key)) {
      return this.getBoolValueDropDownOptions();
    }

    if (key !== 'Country') {
      return this.getValueDropdownOptions(attr);
    }

    const regionRows = this.getValidRegionRows();
    if (regionRows.length === 0) {
      return RuleEngineHelper.getAllCountryRegionList(this.countryRegionResponse).countries;
    }

    const allCountries = regionRows.flatMap(ctrl => this.getCountriesForRegionRow(ctrl));
    return this.getUniqueCountries(allCountries);
  }

  private getValidRegionRows(): FormGroup[] {
    return this.expressions.controls.filter(ctrl => {
      const attrKey = RuleEngineExpressionHelper.attrKey(
        ctrl.get(this.formControlNameList.ATTRIBUTE)?.value
      );
      const attrValue = ctrl.get(this.formControlNameList.VALUE)?.value;
      return attrKey === 'Region' && !!attrValue;
    }) as FormGroup[];
  }

  private getCountriesForRegionRow(ctrl: AbstractControl): SelectDropdown[] {
    const regionVal = ctrl.get(this.formControlNameList.VALUE)?.value;
    const regionKey = regionVal?.value ?? regionVal;

    const operatorVal = ctrl.get(this.formControlNameList.OPERATOR)?.value;
    const operator = (operatorVal?.value ?? operatorVal) as string;

    return operator === '!='
      ? RuleEngineHelper.getCountriesNotInRegion(this.countryRegionResponse, [regionKey])
      : RuleEngineHelper.getCountryByRegion(this.countryRegionResponse, [regionKey]);
  }

  private getUniqueCountries(countries: SelectDropdown[]): SelectDropdown[] {
    return Array.from(new Map(countries.map(c => [c.value, c])).values());
  }

  // small helper that only inspects the key (keeps the conditional simple)
  private shouldFilterCountriesKey(key: string | null): boolean {
    return (
      key === 'Country' &&
      this.selectedOverride === 'CountryGroup' &&
      !!this.selectedLevelValue?.length
    );
  }

  /**
   * attr can be: RuleExpressionRowType | SelectDropdown | string
   * We extract the attribute key via RuleEngineExpressionHelper.attrKey(attr)
   * then decide whether to filter countries based on the region or revert to the full list.
   */
  private applyCountryFiltering(attr: RuleExpressionRowType | SelectDropdown | string): void {
    const key = RuleEngineExpressionHelper.attrKey(attr);

    if (this.shouldFilterCountriesKey(key)) {
      this.countryData.countries = [
        ...RuleEngineHelper.getCountryByRegion(this.countryRegionResponse, this.selectedLevelValue)
      ];
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
    const attr = expr?.get(this.formControlNameList.ATTRIBUTE)?.value as (string | SelectDropdown | null);
    if (!attr) return false;

    const key = RuleEngineExpressionHelper.attrKey(attr);
    // reseller list probably string[], so compare with the key (string)
    return key ? c3RuleEngineAttributeList.reseller.includes(key) || c3RuleEngineAttributeList.creditFlags.includes(key) : false;
  }

  getValueDropdownOptionsWrapper(expr: AbstractControl | null): SelectDropdown[] {
    const attr = expr?.get(this.formControlNameList.ATTRIBUTE)?.value as (string | SelectDropdown | null);
    const key = RuleEngineExpressionHelper.attrKey(attr);

    if(key && c3RuleEngineAttributeList.creditFlags.includes(key)) {
      return this.getBoolValueDropDownOptions();
    }

    // Only handle Country attribute differently; others follow the normal path
    if (key !== 'Country') {
      return this.getValueDropdownOptions(attr);
    }

    const regionRow = this.findRegionRow();
    if (!regionRow) {
      return this.getValueDropdownOptions(attr);
    }

    const { opName, regionKey } = this.getRegionRowDetails(regionRow);
    if (!regionKey) {
      return this.getValueDropdownOptions(attr);
    }

    return this.resolveCountryOptions(opName, regionKey) ?? this.getValueDropdownOptions(attr);
  }
  /** Finds the first Region row that has a value */
  private findRegionRow(): AbstractControl | undefined {
    return this.expressions?.controls?.find(ctrl => {
      const attrKey = RuleEngineExpressionHelper.attrKey(
        ctrl.get(this.formControlNameList.ATTRIBUTE)?.value
      );
      const hasValue = !!ctrl.get(this.formControlNameList.VALUE)?.value;
      return attrKey === 'Region' && hasValue;
    });
  }

  /** Extracts operator name and region key from a Region row */
  private getRegionRowDetails(regionRow: AbstractControl): { opName: string; regionKey: string } {
    const operatorVal = regionRow.get(this.formControlNameList.OPERATOR)?.value;
    const regionVal = regionRow.get(this.formControlNameList.VALUE)?.value;

    return {
      opName: (operatorVal?.value ?? operatorVal) as string,
      regionKey: regionVal?.value ?? regionVal
    };
  }

  /** Returns countries based on operator condition */
  private resolveCountryOptions(opName: string, regionKey: string): SelectDropdown[] | null {
    switch (opName) {
      case '==':
      case undefined:
      case '':
        return RuleEngineHelper.getCountryByRegion(this.countryRegionResponse, [regionKey]);

      case '!=':
        return RuleEngineHelper.getCountriesNotInRegion(this.countryRegionResponse, [regionKey]);

      default:
        return null;
    }
  }

  getValueDropdownOptions(attribute: RuleExpressionRowType): SelectDropdown[] {
    const key = RuleEngineExpressionHelper.attrKey(attribute);
    return key === 'Region' ? this.countryData.regions : this.countryData.countries;
  }

  getBoolValueDropDownOptions(): SelectDropdown[] {
    return boolOptions;
  }

  isValueField(expr: AbstractControl, type: 'numeric' | 'decimal' | 'stringWithSpecialChars'): boolean {
    const attr = expr?.get(this.formControlNameList.ATTRIBUTE)?.value as RuleExpressionRowType;
    const key = RuleEngineExpressionHelper.attrKey(attr);

    if (type === 'numeric') {
      return RuleEngineExpressionHelper.isNumericValueField(key);
    }
    if (type === 'decimal') {
      return RuleEngineExpressionHelper.isDecimalValueField(key);
    }
    if (type === 'stringWithSpecialChars') {
      return RuleEngineExpressionHelper.isStringValueWithSpecialCharsField(key);
    }

    return false;
  }

  hasAttribute(expr: AbstractControl): boolean {
    const attr = expr?.get(this.formControlNameList.ATTRIBUTE)?.value;
    return !!attr;
  }

  private refreshValidation(): void {
    if (this.form) {
      this.form.updateValueAndValidity({ onlySelf: false, emitEvent: true });
    }
  }

  private resellerExpressionValidator(form: FormGroup): ValidationErrors | null {
    if (this.selectedOverride !== 'Reseller') return null; // only enforce for Reseller

    const expressions = form.get(this.formControlNameList.EXPRESSIONS) as FormArray;
    if (!expressions || expressions.length === 0) return { resellerMissingCountryOrRegion: true };

    const hasCountryOrRegion = expressions.controls.some(ctrl => {
      const attr = ctrl.get(this.formControlNameList.ATTRIBUTE)?.value;
      const key = RuleEngineExpressionHelper.attrKey(attr);
      return key === 'Country' || key === 'Region';
    });

    return hasCountryOrRegion ? null : { resellerMissingCountryOrRegion: true };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
