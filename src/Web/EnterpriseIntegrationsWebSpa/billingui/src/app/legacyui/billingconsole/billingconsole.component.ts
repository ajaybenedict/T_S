import {
  Component,
  OnInit,
  OnDestroy,
  Renderer2,
  RendererFactory2
} from '@angular/core';
import {
  UpgradeModule,
  setAngularJSGlobal,
  downgradeInjectable
} from '@angular/upgrade/static';
import { REMOTE_ENTRY_BASEURL } from 'src/app/constants/constants';
import { preloadAndPatchViewOrders } from 'src/app/shared/utils/asset-path-monkey-patch';
import { CBCPermissionEnum, ApplicationIdEnum } from 'src/app/core/cbcpermission.config';
import { DataState } from 'src/app/core/services/data-state';

declare var angular: any;

@Component({
  selector: 'app-billingconsole',
  templateUrl: './billingconsole.component.html',
  styleUrls: ['./billingconsole.component.css'],
})
export class BillingconsoleComponent implements OnInit, OnDestroy {
  private static isBootstrapped = false;
  private static readonly loadedScripts = new Set<string>();

  private readonly renderer: Renderer2;
  private linkElements: HTMLLinkElement[] = [];
  private scriptElements: HTMLScriptElement[] = [];
  private originalAngularStyleLink: HTMLLinkElement | null = null;

  constructor(
    private readonly upgrade: UpgradeModule,
    private readonly rendererFactory: RendererFactory2,
    private readonly dataState: DataState
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
  }

  async ngOnInit(): Promise<void> {
    this.removeBootstrap5();

    // Load legacy styles
    this.addStylesheet(REMOTE_ENTRY_BASEURL + 'assets/legacy/Content/bootstrap2.css');
    this.addStylesheet(REMOTE_ENTRY_BASEURL + 'assets/legacy/Content/angular-material.min.css');
    this.addStylesheet(REMOTE_ENTRY_BASEURL + 'assets/legacy/Content/toastr.css');
    this.addStylesheet(REMOTE_ENTRY_BASEURL + 'assets/legacy/Content/Site.css');

    try {
      if (!BillingconsoleComponent.isBootstrapped) {
        const scripts = [
          'assets/legacy/js/jquery-3.7.1.min.js',
          'assets/legacy/js/bootstrap.min.js',
          'assets/legacy/js/angular.min.js',
          'assets/legacy/js/angular-animate.min.js',
          'assets/legacy/js/angular-aria.min.js',
          'assets/legacy/js/angular-messages.min.js',
          'assets/legacy/js/angular-sanitize.min.js',
          'assets/legacy/js/angular-material.min.js',
          'assets/legacy/js/toastr.min.js',
          'assets/legacy/js/ng-csv.min.js',
          'assets/legacy/js/chosen.jquery.js',
          'assets/legacy/billing-console.js'
        ];

        for (const script of scripts) {
          await this.loadScriptOnce(REMOTE_ENTRY_BASEURL + script);
        }

        setAngularJSGlobal(angular);

        // Make the Angular DataState service available inside the legacy AngularJS app
        if (angular?.module) {
          angular.module('billingOrderModule')
            .factory('dataState', downgradeInjectable(DataState))
            .constant('CBCPermissionEnum', CBCPermissionEnum)
            .constant('ApplicationIdEnum', ApplicationIdEnum);
        }

        await preloadAndPatchViewOrders();

        const root = document.getElementById('angularjs-root') || document.body;
        this.upgrade.bootstrap(root, ['billingOrderModule'], { strictDi: true });

        BillingconsoleComponent.isBootstrapped = true;
      }
      const maxWait = 5000;
      let waited = 0;

      const poll = setInterval(() => {
        const injector = angular.element(document.body).injector();

        if (injector) {
          clearInterval(poll);
          this.loadLegacyView();
        } else if ((waited += 100) >= maxWait) {
          clearInterval(poll);
          console.error('AngularJS injector not found after waiting.');
        }
      }, 100);

    } catch (err) {
      console.error('Failed to load legacy scripts or bootstrap AngularJS:', err);
    }
  }

  private loadScriptOnce(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (BillingconsoleComponent.loadedScripts.has(src)) {
        resolve();
        return;
      }

      const scriptEl = this.renderer.createElement('script');
      if (src.includes('billing-console.js')) {
        scriptEl.type = 'module';
      } else {
        scriptEl.type = 'text/javascript';
      }
      scriptEl.src = src;
      scriptEl.defer = true;

      scriptEl.onload = () => {
        BillingconsoleComponent.loadedScripts.add(src);
        resolve();
      };      
      scriptEl.onerror = () => reject(new Error(`Failed to load ${src}`));

      this.renderer.appendChild(document.body, scriptEl);
      this.scriptElements.push(scriptEl);
    });
  }

  private loadLegacyView(): void {
    const injector = angular.element(document.body).injector();

    if (!injector) {
      console.error('AngularJS injector not found.');
      return;
    }

    const $templateRequest = injector.get('$templateRequest');
    const $compile = injector.get('$compile');
    const $rootScope = injector.get('$rootScope');

    const scope = $rootScope.$new(); // new isolated scope
    const container = document.getElementById('legacy-html-container');

    if (!container) {
      console.warn('Legacy HTML container not found.');
      return;
    }

    $templateRequest('assets/legacy/ViewOrders.html')
      .then((template: string) => {
        container.innerHTML = template;

        // Attach controller
        injector.get('$controller')('billingOrderController', { $scope: scope });

        // Compile and link
        $compile(container)(scope);

        // Apply initial date values
        setTimeout(() => {
          if (scope?.model) {
            const today = new Date();
            scope.model.startDate = today;
            scope.model.endDate = today;
            scope.$apply();
          }
        }, 100);
      })
      .catch((err: any) => {
        console.error('Failed to load template:', err);
      });
  }

  private addStylesheet(href: string): void {
    const linkEl = this.renderer.createElement('link');
    linkEl.rel = 'stylesheet';
    linkEl.href = href;
    this.renderer.appendChild(document.head, linkEl);
    this.linkElements.push(linkEl);
  }

  private removeBootstrap5(): void {
    const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));

    links.forEach(link => {
      const linkEl = link as HTMLLinkElement;
      const href = linkEl.href;

      if (/c3-bootstrap(\..*)?\.css?$/.test(href)) {
        this.originalAngularStyleLink = linkEl.cloneNode(true) as HTMLLinkElement;
        this.renderer.removeChild(document.head, linkEl);
      }
    });
  }

  ngOnDestroy(): void {
  // Remove styles
  this.linkElements.forEach(link => {
    this.renderer.removeChild(document.head, link);
  });
  this.linkElements = [];

  // Remove legacy HTML content
  const container = document.getElementById('legacy-html-container');
  if (container) {
    container.innerHTML = '';
  }

  // Remove scripts
  this.scriptElements.forEach(script => {
    if (script) {
      script.remove();
    }
  });

  this.scriptElements = [];

  // Restore Angular default styles
  if (this.originalAngularStyleLink) {
    this.renderer.appendChild(document.head, this.originalAngularStyleLink);
    this.originalAngularStyleLink = null;
  }
}
}