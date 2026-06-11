import { TestBed, TestModuleMetadata } from '@angular/core/testing';
import { TestingModule } from './testing.module';
import { TEST_PROVIDERS } from './test-providers';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
export function configureTestBed(config: TestModuleMetadata) {
  return TestBed.configureTestingModule({
    imports: [
      TestingModule,
      ...(config.imports || [])
    ],
    declarations: config.declarations || [],
    providers: [
      ...TEST_PROVIDERS,
      ...(config.providers || [])
    ],
     schemas: [
      CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA,
      ...(config.schemas || [])
    ]
  });
}