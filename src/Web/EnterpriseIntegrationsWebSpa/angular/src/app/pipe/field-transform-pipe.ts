import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fieldTransform'
})
export class FieldTransformPipe implements PipeTransform {
  transform(value: string, rowData: any): string {
    if (!value) return value;

    // Replace templated fields with actual values
    const interpolatedValue = value.replace(/\{\{(\w+)\}\}/g, (match, key) => rowData[key] || match);

    // Convert Markdown to HTML
    return interpolatedValue;
  }
}
