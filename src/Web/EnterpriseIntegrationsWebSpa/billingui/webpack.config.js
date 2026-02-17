const { withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({
  name: 'billingui',

  exposes: {
    './ProductCollection': './src/app/CollectionSkuMapping/productcollection.module.ts',
    './cbc-legacyui': './src/app/legacyui/billingconsole.module.ts',
    './cbc-newui': './src/app/newui/cbc.module.ts',
  },

  shared: {
     'ngx-toastr': {
    singleton: true,
    strictVersion: false,
    requiredVersion: 'auto'
  },
    '@angular/core': { singleton: true, strictVersion: true, requiredVersion: '15.2.10' },
    '@angular/common': { singleton: true, strictVersion: true, requiredVersion: '15.2.10' },
    '@angular/router': { singleton: true, strictVersion: true, requiredVersion: '15.2.10' },
    '@angular/forms': { singleton: true, strictVersion: true, requiredVersion: '15.2.10' },
    '@angular/platform-browser': { singleton: true, strictVersion: true, requiredVersion: '15.2.10' },
    '@angular/platform-browser/animations': { singleton: true, strictVersion: true, requiredVersion: '15.2.10' },
    '@angular/material': { singleton: true, strictVersion: true, requiredVersion: '15.2.9' },
    '@angular/material/core': { singleton: true, strictVersion: true, requiredVersion: '15.2.9' },
    '@angular/material/datepicker': { singleton: true, strictVersion: true, requiredVersion: '15.2.9' },
    '@angular/material/form-field': { singleton: true, strictVersion: true, requiredVersion: '15.2.9' },
    '@angular/material/input': { singleton: true, strictVersion: true, requiredVersion: '15.2.9' },
    '@angular/material/dialog': { singleton: true, strictVersion: true, requiredVersion: '15.2.9' },
    '@angular/material/snack-bar': { singleton: true, strictVersion: true, requiredVersion: '15.2.9' },
    '@angular/material/datepicker': { singleton: true, strictVersion: true, requiredVersion: '15.2.9' },
    '@angular/material/menu': { singleton: true, strictVersion: true, requiredVersion: '15.2.9' },
    '@angular/material/button': { singleton: true, strictVersion: true, requiredVersion:'15.2.9' },
    '@angular/common/http': { singleton: true, strictVersion: true },

  },
});