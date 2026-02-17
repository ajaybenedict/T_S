import { DatePipe } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import * as saveAs from 'file-saver';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CountryERPMapping } from 'src/app/interface/product-collection.interface';

import { ProductDetailsRequest } from 'src/app/models/productDetailsRequest.model';
import { ProductCollectionService } from 'src/app/services/product-collection.service';

// --- Lightweight types to remove a lot of `any` --- //
interface Vendor { vendorKey: string; vendorName: string; }
interface ERPName { code: string; name?: string }

interface ProductRow {
  recordId: number;
  productDescription: string;
  country: string | null;
  vendorName: string | null;
  createdBy?: string;
  updatedBy?: string;
  createdTime?: string | Date;
  updatedTime?: string | Date;
  // core sku fields
  erpProductId?: string; // SAP46 SCEC
  fcErpProductId?: string; // SAP46 FC
  // CIS
  uscisscecProductId?: string;
  uscisfcProductId?: string;
  ppaProductId?: string | null;
  // SAP46US
  uS46SCECProductId?: string;
  uS46FCProductId?: string;
  // SAP68 EU
  eU68SCECProductId?: string;
  eU68FCProductId?: string;
  // SAP68 APJ
  apJ68SCECProductId?: string;
  apJ68FCProductId?: string;
  // SAP68 US
  uS68SCECProductId?: string;
  uS68FCProductId?: string;
  // NSAP
  nsapscecProductId?: string;
  nsapfcProductId?: string;
  // StarSoftApp
  softAppSCECProductId?: string;
  softAppFCProductId?: string;
  // server may also send camel-case variants
  FcErpProductId?: string; // normalize to fcErpProductId when reading
  totalCount?: number;
}

// Map ERP code -> the fields on ProductRow that hold SCEC/FC (and optional PPA)
const ERP_FIELD_MAP: Record<string, { scec: keyof ProductRow; fc: keyof ProductRow; ppa?: keyof ProductRow }> = {
  SAP46: { scec: 'erpProductId', fc: 'fcErpProductId' },
  CIS: { scec: 'uscisscecProductId', fc: 'uscisfcProductId', ppa: 'ppaProductId' },
  SAP46US: { scec: 'uS46SCECProductId', fc: 'uS46FCProductId' },
  SAP68: { scec: 'eU68SCECProductId', fc: 'eU68FCProductId' },
  SAP68APJ: { scec: 'apJ68SCECProductId', fc: 'apJ68FCProductId' },
  SAP68US: { scec: 'uS68SCECProductId', fc: 'uS68FCProductId' },
  NSAP: { scec: 'nsapscecProductId', fc: 'nsapfcProductId' },
  StarSoftApp: { scec: 'softAppSCECProductId', fc: 'softAppFCProductId' },
};

@Component({
  selector: 'app-product-collection',
  templateUrl: './product-collection.component.html',
  styleUrls: ['./product-collection.component.css'],
})
export class ProductCollectionComponent implements OnInit, OnDestroy {
  productDetailsRequest: ProductDetailsRequest | undefined;

  contries: CountryERPMapping[] = [];
  allCountries: CountryERPMapping[] = []; // kept name for template compatibility
  // kept name for template compatibility
  vendors: Vendor[] = [];
  products: ProductRow[] = [];
  ERPNames: ERPName[] = [];

  isClick = false;
  isSearchButtonClicked = false;
  isExportButtonClicked = false;
  totalCount: number = 0;
  numberOfRecords = 50;
  p: number = 1;
  nextOffset: number = 1;
  prevOffset: number = 0;
  fromRecord: number = 1;
  thruoghRecord: number = 50; // kept original misspelling for template compatibility

  searchForm: FormGroup;
  valForm: FormGroup;

  // component-level flags
  isRecordFound = false;

  // NOTE: keep the array shape used by the template
  searchForArray = [
    { searchKey: 1, searchValue: 'No Collection SKU mapped' },
    { searchKey: 3, searchValue: 'No Collection SKU mapped (Last billing cycle)' }
  ];

  selectedERPValue: string = '';

  private readonly destroy$ = new Subject<void>();

  constructor(
    public productCollection: ProductCollectionService,
    private toastr: ToastrService,
    private datePipe: DatePipe
  ) {
    this.searchForm = new FormGroup({
      searchValue: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      searchFor: new FormControl<number>(0, { nonNullable: true }),
      viewperERP: new FormControl<string | null>(null),
      viewbyVendor: new FormControl<string>('')
    });

    this.valForm = new FormGroup({});
  }

  ngOnInit(): void {
    this.productCollection.getVendorname().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: Vendor[]) => {
        // Exclude legacy Microsoft
        this.vendors = (res || []).filter(v => v.vendorKey !== 'microsoftLegacy' && v.vendorKey !== 'microsoftNCE');
      },
      error: () => this.toastr.error('Failed to load vendors')
    });

    this.productCollection.getCountryname().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: CountryERPMapping[]) => {
        this.allCountries = res;
        this.filterCountriesByERP(this.searchForm.controls['viewperERP'].value);
      },
      error: () => this.toastr.error('Failed to load countries')
    });

    this.searchForm.controls['viewperERP'].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((erpCode) => {
        this.selectedERPValue = erpCode;
        this.filterCountriesByERP(erpCode);
      });

    this.productCollection.getERPName().pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: ERPName[]) => {
        this.ERPNames = res || [];
        const defaultERP = this.ERPNames[1]?.code;
        this.searchForm.controls['viewperERP'].setValue(defaultERP);
        this.getProducts();
      },
      error: () => this.toastr.error('Failed to load ERP names')
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  filterCountriesByERP(erpCode: string) {
    if (erpCode) {
      this.contries = this.allCountries.filter(
        (country: CountryERPMapping) => country.erpCode === erpCode
      );
    } else {
      this.contries = this.allCountries;
    }
  }


  get showPPARebateType(): boolean {
    return this.searchForm?.controls?.['viewperERP']?.value === 'CIS';
  }

  // --- Data loaders ------------------------------------------------------- //
  getProducts(): void {
    this.productDetailsRequest = {
      Offset: 0,
      MaxResult: this.numberOfRecords,
      SortBy: '',
      SortOrder: '',
      SearchText: '',
      VendorKey: this.searchForm.controls['viewbyVendor'].value || '',
      CountryNames: '',
      SearchFor: 0,
      ERPCode: this.searchForm.controls['viewperERP'].value as string
    };

    this.productCollection.getCollectionSKUDetails(this.productDetailsRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ProductRow[]) => {
          this.products = res.filter((product: any) =>
            product.erpCode === this.selectedERPValue || product.erpCode == null
          );
          this.isRecordFound = this.products.length === 0;
          this.totalCount = this.products.length > 0 ? (this.products[0].totalCount ?? this.products.length) : 0;
          // REBUILD form controls fresh for current page
          this.valForm = new FormGroup({});
          this.buildingFormGroup(this.products);
        },
        error: (err) => {
          this.toastr.error('Failed to load products');
          console.error(err);
        }
      });
  }

  onPageChange(e: number): void {
    this.p = e;
    this.fromRecord = (e - 1) * 50 + 1;
    this.nextOffset = this.fromRecord - 1;
    this.prevOffset = this.nextOffset;
    this.thruoghRecord = this.nextOffset + this.numberOfRecords;

    this.productDetailsRequest = {
      Offset: Math.min(this.nextOffset, this.totalCount),
      MaxResult: this.numberOfRecords,
      SortBy: '',
      SortOrder: '',
      SearchText: this.searchForm.controls['searchValue'].value || '',
      VendorKey: this.searchForm.controls['viewbyVendor'].value || '',
      CountryNames: '',
      SearchFor: Number(this.searchForm.controls['searchFor'].value || 0),
      ERPCode: this.searchForm.controls['viewperERP'].value as string
    };

    this.productCollection.getCollectionSKUDetails(this.productDetailsRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ProductRow[]) => {
          this.products = res.filter((product: any) =>
            product.erpCode === this.selectedERPValue || product.erpCode == null
          );
          this.isRecordFound = this.products.length === 0;
          this.valForm = new FormGroup({});
          this.buildingFormGroup(this.products);
        },
        error: () => this.toastr.error('Failed to load page')
      });
  }

  searchAndCSV(isSearch: boolean): void {
    if (isSearch) {
      this.isSearchButtonClicked = true;
      this.products = [];
      this.isRecordFound = false;
    }
    else
    {
      this.isExportButtonClicked = true;
    }

    this.productDetailsRequest = {
      Offset: 0,
      MaxResult: isSearch ? 50 : (this.totalCount || 5000), // be generous on export
      SortBy: '',
      SortOrder: '',
      SearchText: this.searchForm.controls['searchValue'].value || '',
      VendorKey: this.searchForm.controls['viewbyVendor'].value || '',
      CountryNames: '',
      SearchFor: Number(this.searchForm.controls['searchFor'].value || 0),
      ERPCode: (this.searchForm.controls['viewperERP'].value as string) || null
    } as ProductDetailsRequest;

    this.productCollection.getCollectionSKUDetails(this.productDetailsRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ProductRow[]) => {
          if (isSearch) {
            this.products = res.filter((product: any) =>
              product.erpCode === this.selectedERPValue || product.erpCode == null
            );
            this.isRecordFound = this.products.length === 0;
            this.totalCount = this.products.length > 0 ? (this.products[0].totalCount ?? this.products.length) : 0;
            this.numberOfRecords = 50;
            this.resetPaging();
            this.valForm = new FormGroup({});
            this.buildingFormGroup(this.products);
            this.isSearchButtonClicked = false;
          } else {
            this.downloadFile(res || []);
            this.isExportButtonClicked = false;
          }
        },
        error: () => this.toastr.error('Search/export failed')
      });
  }

  clearInput(): void {
    this.isRecordFound = false;

    // Re-select a reasonable default ERP
    const defaultERP = this.ERPNames[1]?.code;
    this.searchForm.controls['viewperERP'].reset(defaultERP);

    this.searchForm.controls['searchValue'].reset('');
    this.searchForm.controls['searchFor'].reset(0);
    this.searchForm.controls['viewbyVendor'].reset('');

    this.productDetailsRequest = {
      Offset: 0,
      MaxResult: 50,
      SortBy: '',
      SortOrder: '',
      SearchText: '',
      VendorKey: '',
      CountryNames: '',
      SearchFor: 0,
      ERPCode: this.searchForm.controls['viewperERP'].value as string
    };

    this.productCollection.getCollectionSKUDetails(this.productDetailsRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: ProductRow[]) => {
          this.products = res.filter((product: any) =>
            product.erpCode === this.selectedERPValue || product.erpCode == null
          );
          this.isRecordFound = this.products.length === 0;
          this.totalCount = this.products.length > 0 ? (this.products[0].totalCount ?? this.products.length) : 0;
          this.numberOfRecords = 50;
          this.resetPaging();
          this.valForm = new FormGroup({});
          this.buildingFormGroup(this.products);
        },
        error: () => this.toastr.error('Failed to reset list')
      });
  }

  private resetPaging(): void {
    this.p = 1;
    this.nextOffset = 1;
    this.prevOffset = 0;
    this.fromRecord = 1;
    this.thruoghRecord = 50;
  }

  // --- Form building ------------------------------------------------------ //
  buildingFormGroup(res: ProductRow[]): void {
    res.forEach((item) => {
      // Normalize server field casing differences
      if (!item.fcErpProductId && (item as any).FcErpProductId) {
        item.fcErpProductId = (item as any).FcErpProductId;
      }

      const controlDescriptionValue = new FormControl({ value: item.productDescription, disabled: true }, Validators.required);
      const controlCountryValue = new FormControl({ value: item.country ?? null, disabled: true }, Validators.required);
      const controlVendorValue = new FormControl({ value: item.vendorName ?? null, disabled: true }, Validators.required);
      const controlSkuSCECValue = new FormControl({ value: item.erpProductId, disabled: true }, Validators.required);
      const controlSkuFCValue = new FormControl({ value: item.fcErpProductId, disabled: true });

      const rebateTypeKey = item.recordId + 'rebateType';
      const rebateTypeValue = new FormControl({ value: '', disabled: true });
      this.valForm.addControl(rebateTypeKey, rebateTypeValue);
      this.valForm.controls[rebateTypeKey].reset();

      const controlDescription = item.recordId + item.productDescription;
      const controlSkuSCEC = (item.erpProductId ? (item.recordId + item.erpProductId) : (item.recordId + 'SkuSCEC'));
      const itemFc = item.fcErpProductId ?? (item as any).FcErpProductId;
      const controlSkuFC = (itemFc ? (item.recordId + itemFc) : (item.recordId + 'SkuFC'));
      const controlCountry = item.recordId + 'country';
      const controlVendor = item.recordId + 'vendor';

      this.valForm.addControl(controlDescription, controlDescriptionValue);
      this.valForm.addControl(controlSkuSCEC, controlSkuSCECValue);
      this.valForm.addControl(controlSkuFC, controlSkuFCValue);
      this.valForm.addControl(controlCountry, controlCountryValue);
      this.valForm.addControl(controlVendor, controlVendorValue);

      // Populate control values based on selected ERP mapping
      this.applyERPFieldsToControls(item, controlSkuSCEC, controlSkuFC, rebateTypeKey);
    });
  }

  private applyERPFieldsToControls(item: ProductRow, controlSkuSCEC: string, controlSkuFC: string, rebateTypeKey: string): void {
    const erp = this.searchForm.controls['viewperERP'].value as string;
    const map = ERP_FIELD_MAP[erp];
    if (!map) { return; }

    const scecVal = (item as any)[map.scec] ?? '';
    const fcVal = (item as any)[map.fc] ?? '';
    this.valForm.controls[controlSkuSCEC].setValue(scecVal);
    this.valForm.controls[controlSkuFC].setValue(fcVal);

    if (map.ppa) {
      this.valForm.controls[rebateTypeKey]?.setValue((item as any)[map.ppa] ?? '');
    }
  }

  // --- Row editing & saving ---------------------------------------------- //
  edit(option: ProductRow): void {
    const controlDescription = option.recordId + option.productDescription;
    const controlSkuSCEC = option.erpProductId ? (option.recordId + option.erpProductId) : (option.recordId + 'SkuSCEC');
    const itemFc = option.fcErpProductId ?? (option as any).FcErpProductId;
    const controlSkuFC = itemFc ? (option.recordId + itemFc) : (option.recordId + 'SkuFC');
    const controlCountry = option.recordId + 'country';
    const controlVendor = option.recordId + 'vendor';
    const rebateType = option.recordId + 'rebateType';

    // enable controls for this row
    this.valForm.controls[controlDescription].enable();
    this.valForm.controls[controlSkuSCEC].enable();
    this.valForm.controls[controlSkuFC].enable();
    this.valForm.controls[controlCountry].enable();
    this.valForm.controls[controlVendor].enable();

    // RebateType visibility: only for CIS AND vendor === 'amazon'
    const updateRebateEnable = (vendor: string | null) => {
      if (this.showPPARebateType && vendor === 'amazon') {
        this.valForm.controls[rebateType]?.enable();
      } else {
        this.valForm.controls[rebateType]?.disable();
        this.valForm.controls[rebateType]?.setValue(null);
      }
    };

    const currentVendor = this.valForm.controls[controlVendor].value as string | null;
    updateRebateEnable(currentVendor);

    this.valForm.controls[controlVendor].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((vendor: string) => updateRebateEnable(vendor));
  }

  save(option: ProductRow): void {
    const controlDescription = option.recordId + option.productDescription;
    const controlSkuSCEC = option.erpProductId ? (option.recordId + option.erpProductId) : (option.recordId + 'SkuSCEC');
    const itemFc = option.fcErpProductId ?? (option as any).FcErpProductId;
    const controlSkuFC = itemFc ? (option.recordId + itemFc) : (option.recordId + 'SkuFC');
    const controlCountry = option.recordId + 'country';
    const controlVendor = option.recordId + 'vendor';
    const controlRebateType = option.recordId + 'rebateType';

    const obj: any = {
      RecordID: option.recordId || 0,
      ProductDescription: this.valForm.controls[controlDescription]?.value?.trim?.() || '',
      ERPPRoductID: this.valForm.controls[controlSkuSCEC]?.value?.trim?.() || '', // NOTE: keep exact casing if API expects it
      FCERPProductId: this.valForm.controls[controlSkuFC]?.value?.trim?.() || '',
      Country: this.valForm.controls[controlCountry]?.value || null,
      VendorKey: this.valForm.controls[controlVendor]?.value || null,
      PPAProductId: this.valForm.controls[controlRebateType]?.value || null,
      UpdatedBy: '',
      CreatedBy: '',
      ERPCode: this.searchForm.controls['viewperERP'].value as string,
    };
    obj.Country = obj.Country == 'All' ? null : obj.Country;

    // Basic validation
    if (!obj.ProductDescription) {
      this.toastr.error('Please enter valid Product Description', '', { positionClass: 'toast-top-custom-offset' });
      return;
    }
    if (!obj.ERPPRoductID) { // keep original key name to avoid breaking backend
      this.toastr.error('Please enter valid Collection Sku SC/EC', '', { positionClass: 'toast-top-custom-offset' });
      return;
    }

    if (
      this.valForm.controls[controlDescription]?.valid &&
      this.valForm.controls[controlSkuSCEC]?.valid
    ) {
      this.productCollection.saveProduct(obj).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          if (option.recordId === 0) {
            this.getProducts();
          } else {
            this.valForm.controls[controlDescription]?.disable();
            this.valForm.controls[controlSkuSCEC]?.disable();
            this.valForm.controls[controlSkuFC]?.disable();
            this.valForm.controls[controlCountry]?.disable();
            this.valForm.controls[controlVendor]?.disable();
            this.valForm.controls[controlRebateType]?.disable();
          }

          this.toastr.success('Record saved successfully', '', { positionClass: 'toast-top-custom-offset' });
          this.numberOfRecords = 50;
          this.resetPaging();
        },
        error: (err: any) => {
          this.toastr.error(err?.error?.errorMessage ?? 'Save failed', '', { positionClass: 'toast-top-custom-offset' });
        }
      });
    }
  }

  addRow(): void {
    const newRow: ProductRow = {
      country: null,
      erpProductId: '',
      fcErpProductId: '',
      productDescription: '',
      recordId: 0,
      totalCount: this.totalCount,
      vendorName: '',
    };

    this.products.unshift(newRow);

    const controlDescriptionValue = new FormControl('', Validators.required);
    const controlSkuSCECValue = new FormControl('', Validators.required);
    const controlSkuFCValue = new FormControl('');
    const controlCountryValue = new FormControl(null, Validators.required);
    const controlVendorValue = new FormControl(null, Validators.required);
    const rebateTypeValue = new FormControl({ value: null, disabled: true });

    const controlDescription = '0';
    const controlSkuSCEC = '0SkuSCEC';
    const controlSkuFC = '0SkuFC';
    const controlCountry = '0country';
    const controlVendor = '0vendor';
    const controlRebateType = '0rebateType';

    this.valForm.addControl(controlDescription, controlDescriptionValue);
    this.valForm.addControl(controlSkuSCEC, controlSkuSCECValue);
    this.valForm.addControl(controlSkuFC, controlSkuFCValue);
    this.valForm.addControl(controlCountry, controlCountryValue);
    this.valForm.addControl(controlVendor, controlVendorValue);
    this.valForm.addControl(controlRebateType, rebateTypeValue);

    // Enable editable
    this.valForm.controls[controlDescription].enable();
    this.valForm.controls[controlSkuSCEC].enable();
    this.valForm.controls[controlSkuFC].enable();
    this.valForm.controls[controlCountry].enable();
    this.valForm.controls[controlVendor].enable();

    // Rebate enablement
    this.valForm.controls[controlVendor].valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((vendor: string) => {
        if (this.showPPARebateType && vendor === 'amazon') {
          this.valForm.controls[controlRebateType].enable();
        } else {
          this.valForm.controls[controlRebateType].disable();
          this.valForm.controls[controlRebateType].setValue(null);
        }
      });
  }

  // --- Export ------------------------------------------------------------- //
  private getFieldValuesForERP(item: ProductRow, erp: string): { scec: string; fc: string; ppa?: string } {
    const map = ERP_FIELD_MAP[erp];
    if (!map) { return { scec: '', fc: '' }; }
    const scec = String((item as any)[map.scec] ?? '');
    const fc = String((item as any)[map.fc] ?? '');
    const ppa = map.ppa ? String((item as any)[map.ppa] ?? '') : undefined;
    return { scec, fc, ppa };
  }


  downloadFile(data: ProductRow[]): void {
    if (!data || data.length === 0) {
      this.toastr.info('Nothing to export');
      return;
    }

    const erp = this.searchForm.controls['viewperERP'].value as string;
    const isCIS = erp === 'CIS';

    // Build header once (CIS has an extra PPARebate column after Vendor)
    const baseHeader = [
      'ERP',
      'ProductDescription',
      'Country',
      'Vendor',
      'CollectionSKUSCEC',
      'CollectionSKUFC',
      'CreatedBy',
      'UpdatedBy',
      'CreatedOn',
      'UpdatedOn'
    ];
    const header = isCIS
      ? [...baseHeader.slice(0, 4), 'PPARebate', ...baseHeader.slice(4)]
      : baseHeader;
   
    const escapeCsv = (val: any): string => {
      if (val == null) return '';
      let s = String(val);
      if (s.indexOf('"') !== -1) s = s.replace(/"/g, '""');
      if (s.indexOf(',') !== -1 || s.indexOf('\n') !== -1 || s.indexOf('"') !== -1) {
        return `"${s}"`;
      }
      return s;
    };

    // Use Intl.DateTimeFormat (much faster than Angular DatePipe in tight loops)
    let formatDateFast: (v: any) => string;
    try {
      const dtf = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
      formatDateFast = (v: any) => {
        if (!v) return '';
        const d = (v instanceof Date) ? v : new Date(String(v));
        return isNaN(d.getTime()) ? String(v) : dtf.format(d);
      };
    } catch {
      // fallback to datePipe (rare)
      formatDateFast = (v: any) => (v ? this.datePipe.transform(v, 'MMM d, y, h:mm:ss a z') ?? '' : '');
    }

    // Build CSV lines efficiently
    const lines: string[] = [];
    lines.push(header.join(','));

    for (let i = 0, len = data.length; i < len; i++) {
      const item = data[i];
      const { scec, fc, ppa } = this.getFieldValuesForERP(item, erp);

      const createdOn = formatDateFast(item.createdTime);
      const updatedOn = formatDateFast(item.updatedTime);

      // Prepare a map for quick retrieval using header order
      const rowMap: Record<string, any> = {
        ERP: erp,
        ProductDescription: item.productDescription ?? '',
        Country: item.country ?? '',
        Vendor: item.vendorName ?? '',
        CollectionSKUSCEC: scec,
        CollectionSKUFC: fc,
        CreatedBy: item.createdBy ?? '',
        UpdatedBy: item.updatedBy ?? '',
        CreatedOn: createdOn,
        UpdatedOn: updatedOn,
      };

      // Build row values in header order; for CIS inject PPARebate from ppa
      const rowValues = header.map((h) => {
        if (h === 'PPARebate') return escapeCsv(ppa ?? '');
        return escapeCsv(rowMap[h]);
      });

      lines.push(rowValues.join(','));
    }

    const csvText = lines.join('\r\n');
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'CollectionSKUExport.csv');
  }


  // --- UI helpers --------------------------------------------------------- //
  disable(): void { this.isClick = true; }
  clear(): void { this.isClick = false; this.p = 1; }

  // Track by to avoid re-render churn
  trackByRecordId(_index: number, item: ProductRow): number { return item.recordId; }
}
