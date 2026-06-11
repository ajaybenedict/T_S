import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'removeFileReferences'
})
export class RemoveFileReferencesPipe implements PipeTransform {
  transform(value: string): string {
    return (value || '').replace(/\u3010[^\u3010\u3011]*\u3011/g, '');
  }
}
