import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'dateTimeFormat',
  pure: true
})
export class DateTimeFormatPipe implements PipeTransform {
  transform(dateString: string): { formattedDate: string; formattedTime: string } | null {
    if (!dateString) return null;

    const dateObj = new Date(dateString);

    const parts = dateObj.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).split(' ');

    const formattedDate = `${parts[0]} ${parts[1]}, ${parts[2]}`;

    const formattedTime = dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return { formattedDate, formattedTime };
  }
}




export abstract class BaseSalesOrderFormatPipe {
  constructor(
    protected sanitizer: DomSanitizer,
    protected dateTimeFormat: DateTimeFormatPipe
  ) {}
  protected buildHtml(
    salesorderheaderid: string,
    orderDate: string,
    listedViewonly: boolean
  ): SafeHtml {
    if (!orderDate) return '';

    const result = this.dateTimeFormat.transform(orderDate);
    if (!result) return '';

    const { formattedDate, formattedTime } = result;

    let html = '';

    if (listedViewonly) {
      html += `<span style="font-family: Arial;
                  font-weight: 700;
                  font-size: 14px;
                  line-height: 150%;
                  letter-spacing: 0%;
                  ">${salesorderheaderid}</span><br>`;
    } else {
      html += `<span style="color: #262626; 
                      font-style: Bold;
                      font-family: Arial;
                      font-weight: 700;
                      font-size: 14px;
                      line-height: 150%;
                      letter-spacing: 0%;
                  ">${salesorderheaderid}</span>
                  <span style="width: 16px;padding: 0 6px; color:#E4E5E6;">|</span>`;
    }

    html += `      
      <span style="color:#75716E;font-family: Arial; font-weight: 400;font-size: 14px; line-height: 150%;letter-spacing: 0%;">${formattedDate}</span>
      <span style="width: 16px;padding: 0 6px;color:#E4E5E6;">|</span>
      <span style="color:#75716E;font-family: Arial;font-weight: 400;font-size: 14px;line-height: 150%;letter-spacing: 0%;"> ${formattedTime} </span>
    `;

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

@Pipe({
  name: 'orderDetailsFormat'
})

export class OrderDetailsFormatPipe extends BaseSalesOrderFormatPipe implements PipeTransform {
  constructor(
    sanitizer: DomSanitizer,
    dateTimeFormat: DateTimeFormatPipe
  ) {
    super(sanitizer, dateTimeFormat);
  }

  transform(salesorderheaderid: string, orderDate: string): any {
    return this.buildHtml(salesorderheaderid, orderDate, true);
  }
}

@Pipe({
  name: 'ResellerDetailFormat'
})
export class ResellerDetailFormatPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(name: string, number: string | number): SafeHtml {
    let html = '';

    const n = name || '';
    const num = number || '';
    html += `
     <div style="width: 100%;">
      <strong class="pipe-blackcolor" style="font-family: Arial; font-weight: 700; font-size: 14px; line-height: 150%; letter-spacing: 0%;">${n}</strong>
      <span class="pipe-greycolor" style="font-family: Arial; font-weight: 400; font-size: 14px; line-height: 150%; letter-spacing: 0%; display: block;">${num}</span>        
    </div>`;

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}



@Pipe({
  name: 'InvoiceIDFormat'
})
export class InvoiceIDFormatPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(name: string, number: string | number): SafeHtml {
    let html = '';
    const n = name || '';
    const num = number || '';

    html += `
      <div style="display: inline-flex;">
        <strong class="pipe-charcoalcolor invoice-issue-highlight" style="font-family: Arial !important;
          font-weight: bold;
          font-size: 16px;
          line-height: 24px;
          ">${n} (${num})</strong>
          <span class="no-fill-override" style="width: 29px;
          height: 23px;
          padding-left: 4px;
          gap: 10px;
          border-radius: 4px;
          "><svg width="29" height="24" viewBox="0 0 29 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="1" width="28" height="22" rx="3.5" stroke="#005758"/>
          <path d="M4.79102 15.5V8.3418H9.9668V9.18652H5.73828V11.3789H9.69824V12.2188H5.73828V14.6553H10.1328V15.5H4.79102ZM11.4561 15.5V8.3418H14.6299C15.2679 8.3418 15.7529 8.4069 16.085 8.53711C16.417 8.66406 16.6823 8.8903 16.8809 9.21582C17.0794 9.54134 17.1787 9.90104 17.1787 10.2949C17.1787 10.8027 17.0143 11.2308 16.6855 11.5791C16.3568 11.9274 15.849 12.1488 15.1621 12.2432C15.4128 12.3636 15.6032 12.4824 15.7334 12.5996C16.0101 12.8535 16.2721 13.1709 16.5195 13.5518L17.7646 15.5H16.5732L15.626 14.0107C15.3493 13.5811 15.1214 13.2523 14.9424 13.0244C14.7633 12.7965 14.6022 12.637 14.459 12.5459C14.319 12.4548 14.1758 12.3913 14.0293 12.3555C13.9219 12.3327 13.7461 12.3213 13.502 12.3213H12.4033V15.5H11.4561ZM12.4033 11.501H14.4395C14.8724 11.501 15.2109 11.457 15.4551 11.3691C15.6992 11.278 15.8848 11.1348 16.0117 10.9395C16.1387 10.7409 16.2021 10.526 16.2021 10.2949C16.2021 9.95638 16.0785 9.67806 15.8311 9.45996C15.5869 9.24186 15.1995 9.13281 14.6689 9.13281H12.4033V11.501ZM18.668 15.5V8.3418H21.3682C21.8434 8.3418 22.2064 8.36458 22.457 8.41016C22.8086 8.46875 23.1032 8.58105 23.3408 8.74707C23.5785 8.90983 23.7689 9.13932 23.9121 9.43555C24.0586 9.73177 24.1318 10.0573 24.1318 10.4121C24.1318 11.0208 23.9382 11.5368 23.5508 11.96C23.1634 12.3799 22.4635 12.5898 21.4512 12.5898H19.6152V15.5H18.668ZM19.6152 11.7451H21.4658C22.0778 11.7451 22.5124 11.6312 22.7695 11.4033C23.0267 11.1755 23.1553 10.8548 23.1553 10.4414C23.1553 10.1419 23.0788 9.88639 22.9258 9.6748C22.776 9.45996 22.5775 9.31836 22.3301 9.25C22.1706 9.20768 21.876 9.18652 21.4463 9.18652H19.6152V11.7451Z" fill="#005758"/>
          </svg></span> </div> `;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}


@Pipe({ name: 'CountryFormat' })
export class CountryFormatPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(name: string): SafeHtml {
    let html = '';
    html += `<span pipe-blackcolor style="font-family: Arial;
              font-weight: 700;
              font-size: 14px;
              line-height: 150%;
              letter-spacing: 0%;
              ">${name}</span>`;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}


@Pipe({ name: 'PriceFormat' })
export class PriceFormatPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(name: string): SafeHtml {
    let html = '';
    html += `<span class="pipe-greycolor" style="
              width: 24px;
              font-family: Arial;
              font-weight: 400;
              font-style: Regular;
              font-size: 14px;
              line-height: 150%;
              ">${name}</span>`;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}


@Pipe({
  name: 'IssueCountFormat'
})
export class IssueCountFormatPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }
  transform(number: number): SafeHtml {
    let html = '';


    if (number > 0) {
      html += `
      <div style="display: inline-flex;gap:2px;"> 
          <span style="font-family: Arial;
            font-weight: 400;
            font-size: 16px;
            line-height: 150%;
            letter-spacing: 0%;
            color: #CD163F;
            width: 9px;
            margin-top: 2px;
            opacity: 1;">${number}</span>
            <span><svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clip-path="url(#clip0_1097_12881)">
            <g clip-path="url(#clip1_1097_12881)">
            <path d="M7.9377 2.016C7.9573 2.00525 7.97935 1.99974 8.0017 2C8.02372 1.99991 8.04539 2.00542 8.0647 2.016C8.08757 2.02971 8.10624 2.04943 8.1187 2.073L14.9757 13.74C15.0117 13.8 15.0107 13.864 14.9777 13.923C14.965 13.9472 14.9464 13.9678 14.9237 13.983C14.9039 13.9951 14.8809 14.0011 14.8577 14H1.1457C1.12249 14.0011 1.09948 13.9952 1.0797 13.983C1.05696 13.9678 1.03839 13.9472 1.0257 13.923C1.00922 13.8952 1.00069 13.8635 1.00105 13.8312C1.0014 13.7989 1.01062 13.7674 1.0277 13.74L7.8837 2.073C7.8962 2.04945 7.91487 2.02975 7.9377 2.016ZM8.9817 1.566C8.88271 1.39356 8.73998 1.2503 8.56791 1.15067C8.39584 1.05105 8.20053 0.998583 8.0017 0.998583C7.80287 0.998583 7.60756 1.05105 7.43549 1.15067C7.26343 1.2503 7.12069 1.39356 7.0217 1.566L0.164702 13.233C-0.292298 14.011 0.255702 15 1.1447 15H14.8577C15.7467 15 16.2957 14.01 15.8377 13.233L8.9817 1.566Z" fill="#CD163F"/>
            <path d="M7.00195 12C7.00195 11.8687 7.02782 11.7386 7.07807 11.6173C7.12833 11.496 7.20199 11.3858 7.29485 11.2929C7.38771 11.2 7.49794 11.1264 7.61927 11.0761C7.7406 11.0259 7.87063 11 8.00195 11C8.13328 11 8.26331 11.0259 8.38464 11.0761C8.50596 11.1264 8.6162 11.2 8.70906 11.2929C8.80192 11.3858 8.87558 11.496 8.92583 11.6173C8.97609 11.7386 9.00195 11.8687 9.00195 12C9.00195 12.2652 8.8966 12.5196 8.70906 12.7071C8.52152 12.8946 8.26717 13 8.00195 13C7.73674 13 7.48238 12.8946 7.29485 12.7071C7.10731 12.5196 7.00195 12.2652 7.00195 12ZM7.09995 5.995C7.08664 5.86884 7.09999 5.74129 7.13915 5.62063C7.17831 5.49996 7.24241 5.38888 7.32727 5.29459C7.41214 5.20029 7.51588 5.12489 7.63176 5.07328C7.74765 5.02167 7.87309 4.995 7.99995 4.995C8.12681 4.995 8.25226 5.02167 8.36814 5.07328C8.48403 5.12489 8.58777 5.20029 8.67263 5.29459C8.7575 5.38888 8.82159 5.49996 8.86075 5.62063C8.89991 5.74129 8.91327 5.86884 8.89995 5.995L8.54995 9.502C8.53819 9.63977 8.47516 9.76811 8.37331 9.86164C8.27146 9.95516 8.13823 10.0071 7.99995 10.0071C7.86168 10.0071 7.72844 9.95516 7.6266 9.86164C7.52475 9.76811 7.46171 9.63977 7.44995 9.502L7.09995 5.995Z" fill="#CD163F"/>
            </g>
            </g>
            <defs>
            <clipPath id="clip0_1097_12881">
            <rect width="16" height="16" fill="white"/>
            </clipPath>
            <clipPath id="clip1_1097_12881">
            <rect width="16" height="16" fill="white"/>
            </clipPath>
            </defs>
            </svg></span></div>`;
    }



    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}


@Pipe({
  name: 'salesorderDetailedViewFormat'
})
export class SalesOrderDetailedViewPipe extends BaseSalesOrderFormatPipe implements PipeTransform {
  constructor(
    sanitizer: DomSanitizer,
    dateTimeFormat: DateTimeFormatPipe
  ) {
    super(sanitizer, dateTimeFormat);
  }

  transform(salesorderheaderid: string, orderDate: string): any {
    return this.buildHtml(salesorderheaderid, orderDate, false);
  }
}

@Pipe({
  name: 'statusDateDetailedViewFormat'
})
export class StatusDateDetailedViewPipe implements PipeTransform {
  constructor(private readonly sanitizer: DomSanitizer,
    private readonly dateTimeFormat: DateTimeFormatPipe
  ) { }

  transform(orderDate: string): SafeHtml {
    let html = '';

    if (!orderDate) return '';

    const result = this.dateTimeFormat.transform(orderDate);
    if (!result) return '';

    const { formattedDate, formattedTime } = result;

    html += `<span style="width: 16px;padding: 0 6px; color:#E4E5E6;">|</span>
             <span style="color:#75716E;font-family: Arial; font-weight: 400px;font-size: 14px; line-height: 150%;letter-spacing: 0%;">${formattedDate}</span>
                <span style="width: 16px;padding: 0 6px;color:#E4E5E6;">|</span>
                <span style="color:#75716E;font-family: Arial;font-weight: 400px;font-size: 14px;    line-height: 150%;letter-spacing: 0%;"> ${formattedTime} </span>`;

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

