import { Pipe, PipeTransform, Injector } from '@angular/core';
import { OrderDetailsFormatPipe, ResellerDetailFormatPipe, InvoiceIDFormatPipe, CountryFormatPipe, PriceFormatPipe,  IssueCountFormatPipe  } from './order-details-data-format.pipe';

@Pipe({ name: 'dynamicPipe' })
export class DynamicPipe implements PipeTransform {
  constructor(private injector: Injector) {}

  transform(value: any, pipeName: string | undefined, row: any, args: string[] = []): any {
    if (!pipeName) return value;
    
    const pipeMap: { [key: string]: any } = {
      'orderdetailsformat': OrderDetailsFormatPipe,
      'resellerdetailformat': ResellerDetailFormatPipe,
      'invoiceidformat': InvoiceIDFormatPipe,
      'countryformat': CountryFormatPipe,
      'priceformat': PriceFormatPipe,
      'issuecountformat':IssueCountFormatPipe,
    };

    const pipeClass = pipeMap[pipeName.toLowerCase()];
    if (!pipeClass) return value;

    const pipe = this.injector.get(pipeClass);

    let pipeArgs: any[] = [];

    if (Array.isArray(args)) {
      pipeArgs = args.map(arg => row?.[arg]);
    } else if (typeof args === 'string') {
      pipeArgs = [row?.[args]];
    }

    return pipe.transform(value, ...pipeArgs);

    
  }
}