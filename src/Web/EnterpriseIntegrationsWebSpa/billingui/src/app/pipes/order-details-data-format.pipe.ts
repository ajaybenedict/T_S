import { Pipe, PipeTransform } from '@angular/core';
import { formatDate } from '@angular/common';

function formatDateTime(dateString: string): {
  formattedDate: string;
  formattedTime: string;
} | null {
  if (!dateString) return null;

  const date = new Date(dateString);

  return {
    formattedDate: formatDate(date, 'dd MMM, yyyy', 'en-GB'),
    formattedTime: formatDate(date, 'hh:mm a', 'en-US')
  };
}

@Pipe({
  name: 'salesOrderDetailsFormat',
  pure: true
})
export class SalesOrderDetailsFormatPipe implements PipeTransform {

  transform(
    salesorderheaderid: string,
    orderDate: string
  ): {
    salesorderheaderid: string;
    formattedDate: string;
    formattedTime: string;
  } | null {

    const formatted = formatDateTime(orderDate);

    if (!formatted) return null;

    return {
      salesorderheaderid,
      ...formatted
    };
  }
}

@Pipe({
  name: 'DateTimeFormatPipe',
  pure: true
})
export class DateTimeFormatPipe implements PipeTransform {

  transform(
    dateString: string
  ): {
    formattedDate: string;
    formattedTime: string;
  } | null {

    return formatDateTime(dateString);
  }
}