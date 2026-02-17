const { withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'StreamOneAngularApps',

  exposes: {
    './AuthInterceptor': './src/app/interceptors/auth.interceptor.ts',
    './ppcdaterange': './src/app/shared-s1/s1-date-range-picker/s1-date-range-picker.component.ts',
    './S1HeaderConfigService': './src/app/core/services/s1-header-config.service.ts',
    './searchbar': './src/app/shared-s1/s1-search-bar/s1-search-bar.component.ts',
    './navbar': './src/app/shared/ppc-nav-tabs/ppc-nav-tabs.component.ts',
    './paginator': './src/app/shared/ppc-paginator/ppc-paginator.component.ts',
    './S1MenuComponent': './src/app/shared-s1/s1-menu/s1-menu.component.ts',
    './PpcSnackBarComponent': './src/app/shared/ppc-snack-bar/ppc-snack-bar.component.ts',
    './PpcSnackBarService': './src/app/core/services/ppc-snack-bar.service.ts',
    './filterButtons': './src/app/shared-s1/s1-filter-buttons/s1-filter-buttons.component.ts',
    './checkbox': './src/app/shared-s1/s1-flat-checkbox/s1-flat-checkbox.component.ts',
  },



  shared: {
    '@angular/core': { singleton: true, strictVersion: true, requiredVersion: '15.2.10' },
    '@angular/common': { singleton: true, strictVersion: true, requiredVersion: '15.2.10' },
    '@angular/router': { singleton: true, strictVersion: true, requiredVersion: '15.2.10' },
    '@angular/forms': { singleton: true, strictVersion: true, requiredVersion: '15.2.10' },
    '@angular/platform-browser': { singleton: true, strictVersion: true, requiredVersion: '15.2.10' },
    '@angular/platform-browser/animations': { singleton: true, strictVersion: true, requiredVersion: '15.2.10' },
    // Angular Material modules
    '@angular/material': { singleton: true, strictVersion: true, requiredVersion: '15.2.9' },
    '@angular/material/core': { singleton: true, strictVersion: true, requiredVersion: '15.2.9' },
    '@angular/material/datepicker': { singleton: true, strictVersion: true, requiredVersion: '15.2.9' },
    '@angular/material/form-field': { singleton: true, strictVersion: true, requiredVersion: '15.2.9' },
    '@angular/material/input': { singleton: true, strictVersion: true, requiredVersion: '15.2.9' },
    '@angular/material/dialog': { singleton: true, strictVersion: true, requiredVersion: '15.2.9' },
    '@angular/material/snack-bar': { singleton: true, strictVersion: true, requiredVersion: '15.2.9' },
    '@angular/material/menu': { singleton: true, strictVersion: true, requiredVersion: '15.2.9' },
    '@angular/material/button': { singleton: true, strictVersion: true, requiredVersion: '15.2.9' },
    'src/app/core/config/s1-custom-date-range-header.ts': {
      singleton: true,
      strictVersion: false,
      requiredVersion: false,
    },
    'ngx-toastr': {
      singleton: true,
      strictVersion: false,
      requiredVersion: 'auto'
    },
    'src/app/core/services/data-state.ts': { singleton: true, strictVersion: false,
      requiredVersion: false }, 
    '@angular/common/http': { singleton: true, strictVersion: true },
    // Add other shared libs if needed
  },

});



