import { NgModule } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';

@NgModule({
  exports: [
    HttpClientTestingModule,
    RouterTestingModule,
    NoopAnimationsModule,
    MatDialogModule,
    MatMenuModule
  ]
})
export class TestingModule {}