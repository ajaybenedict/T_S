import { Injector, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { AppRoutingModule } from "./app-routing.module";
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LandingPageComponent } from './landing-page/landing-page.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { SsoauthGuard } from "./core/auth/ssoauth.guard";
import { SsoComponent } from './sso/sso.component';
import { AuthInterceptor } from "./interceptors/auth.interceptor";
import { PreviewInterceptor } from './interceptors/preview.interceptor';
import { ErrorPageComponent } from "./error-page/error-page.component";
import { LogoutComponent } from './logout/logout/logout.component';
import { DatePipe } from "@angular/common";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Required for animations
import { ToastrModule } from 'ngx-toastr';
import { NgxPaginationModule } from "ngx-pagination";
import { NgxLoadingModule } from "ngx-loading";
import { FileSaverModule } from 'ngx-filesaver';
import { DataState } from "./core/services/data-state";
import { MaterialPPCModule } from "./material/material-ppc.module";
import { ErrorInterceptor } from "./interceptors/error.interceptor";
import { SharedModule } from "./shared/shared.module";
import { AutomationLoginComponent } from './automation-login/automation-login.component';


import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { DynamicModule } from 'ng-dynamic-component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

import { DisplayCustomIonDataComponent } from "./AIAssistant/DisplayComponent/display-custom-ion-data.component";
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { MarkdownModule } from "ngx-markdown";
import { SharedS1Module } from "./shared-s1/shared-s1.module";
import { DashboardApiErrorInterceptor } from "./interceptors/dashboard-api-error.interceptor";
import { RuleEngineModule } from "./rule-engine/rule-engine.module";
import { createCustomElement } from "@angular/elements";
import { AI_OVERVIEW_ELEMENT_NAME } from "./core/constants/constants";
import { AiSummaryComponent } from './ai-summary/ai-summary.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingPageComponent,
    SsoComponent,
    ErrorPageComponent,
    LogoutComponent,
    DisplayCustomIonDataComponent,
    AutomationLoginComponent,
    AiSummaryComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    FormsModule,
    FontAwesomeModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(),
    NgxPaginationModule,
    MaterialPPCModule,    
    FileSaverModule,
    MatTableModule,
    MatCardModule,
    MatIconModule,
    NgxChartsModule,
    MatSnackBarModule,
    DynamicModule,
    MarkdownModule.forRoot(),
    NgxLoadingModule.forRoot({}),
    SharedModule,
    SharedS1Module,
    RuleEngineModule, // Added to make the build work properly and will be removed from here after full implementation
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PreviewInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true, // Set to true to allow multiple interceptors
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: DashboardApiErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    },
    SsoauthGuard, DatePipe, DataState],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private readonly injector: Injector) {
    const overviewEl = createCustomElement(AiSummaryComponent, { injector: this.injector });
    customElements.define(AI_OVERVIEW_ELEMENT_NAME, overviewEl);    
  }
}
