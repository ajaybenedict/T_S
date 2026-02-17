import { REMOTE_ENTRY_BASEURL } from 'src/app/constants/constants';

export function preloadAndPatchViewOrders(): Promise<void> {
  const viewOrdersUrl = REMOTE_ENTRY_BASEURL + 'assets/legacy/ViewOrders.html';
  const baseImagePath = REMOTE_ENTRY_BASEURL + 'assets/legacy/';

  return fetch(viewOrdersUrl)
    .then(res => res.text())
    .then(patchedHtml => {
      // Patch all relative img src paths
      patchedHtml = patchedHtml.replace(
        /<img\s+([^>]*?)src=["'](assets\/legacy\/[^"']+)["']/g,
        (_, attrs, src) => {
          const fullSrc = baseImagePath + src.replace(/^assets\/legacy\//, '');
          return `<img ${attrs}src="${fullSrc}"`;
        }
      );

      const angular = (window as any).angular;

    
      if (angular?.module) {
        try {
          angular.module('billingOrderModule')
            .config(['$provide', function ($provide: any) {
              $provide.decorator('$templateCache', ['$delegate', function ($delegate: any) {
                $delegate.put('assets/legacy/ViewOrders.html', patchedHtml);
                return $delegate;
              }]);
            }]);

        
        } catch (err) {
          console.error('Error while patching $templateCache:', err);
        }
      }
    })
    .catch(err => {
      console.error('Failed to fetch or patch ViewOrders.html', err);
    });
}
