import 'zone.js/testing';
import { DatePipe } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA, Provider } from '@angular/core';
import { TestBed, TestModuleMetadata, getTestBed } from '@angular/core/testing';
import { MatDialog, MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { SIDE_PANEL_DATA, SIDE_PANEL_REF } from './app/shared-s1/s1-cdk-side-panel/side-panel.tokens';

const sharedImports = [
  RouterTestingModule,
  HttpClientTestingModule,
  NoopAnimationsModule,
  MatDialogModule,
  MatMenuModule,
];

const sharedProviders: Provider[] = [
  DatePipe,
  {
    provide: ActivatedRoute,
    useValue: {
      snapshot: {
        paramMap: convertToParamMap({}),
        queryParamMap: convertToParamMap({}),
        queryParams: {},
        data: {},
      },
      params: of({}),
      queryParams: of({}),
      data: of({}),
    },
  },
  {
    provide: MAT_DIALOG_DATA,
    useValue: {},
  },
  {
    provide: MatDialogRef,
    useValue: {
      close: () => undefined,
      afterClosed: () => of(undefined),
    },
  },
  {
    provide: MatDialog,
    useValue: {
      open: () => ({ afterClosed: () => of(undefined) }),
      closeAll: () => undefined,
    },
  },
  {
    provide: SIDE_PANEL_DATA,
    useValue: {},
  },
  {
    provide: SIDE_PANEL_REF,
    useValue: {
      close: () => undefined,
      afterClosed: () => of(undefined),
    },
  },
];

const originalConfigureTestingModule = TestBed.configureTestingModule.bind(TestBed);
TestBed.configureTestingModule =
  function patchedConfigureTestingModule(moduleDef: TestModuleMetadata) {
    const merged: TestModuleMetadata = {
      ...moduleDef,
      imports: [...sharedImports, ...(moduleDef?.imports ?? [])],
      // spec providers go last so they can override the defaults above
      providers: [...sharedProviders, ...(moduleDef?.providers ?? [])],
      schemas: [...(moduleDef?.schemas ?? []), NO_ERRORS_SCHEMA, CUSTOM_ELEMENTS_SCHEMA],
    };

    return originalConfigureTestingModule(merged);
  };

getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
  {
    teardown: {
      destroyAfterEach: false,
    },
  }
);

type WebpackContextModule = {
  keys(): string[];
  <T>(id: string): T;
};

declare const require: {
  context?: (path: string, deep?: boolean, filter?: RegExp) => WebpackContextModule;
};

const context: WebpackContextModule =
  require !== undefined && typeof require.context === 'function'
    ? require.context('./', true, /\.spec\.ts$/)
    : (import.meta as unknown as {
        webpackContext: (path: string, options: { recursive: boolean; regExp: RegExp }) => WebpackContextModule;
      }).webpackContext('./', { recursive: true, regExp: /\.spec\.ts$/ });

type KarmaWindow = Window & {
  __karma__?: {
    files?: Record<string, unknown>;
  };
};

const karmaFiles = (globalThis as unknown as KarmaWindow).__karma__?.files ?? {};
const karmaSpecSet = new Set(
  Object.keys(karmaFiles)
    .filter((file) => file.endsWith('.spec.ts'))
    .map((file) => {
      const fromBase = file.replace(/^\/base\//, '');
      const fromSrc = fromBase.replace(/^src\//, '');
      return `./${fromSrc}`;
    })
);

context
  .keys()
  .filter((specPath) => {
    if (karmaSpecSet.size > 0) {
      return karmaSpecSet.has(specPath);
    }

    return !specPath.includes('/sku-bulk-upload/');
  })
  .forEach(context);
