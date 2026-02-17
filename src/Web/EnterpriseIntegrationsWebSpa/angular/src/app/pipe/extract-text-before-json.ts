import { Pipe, PipeTransform } from '@angular/core';
import { JsonHelper } from '../core/services/AIAssistant/json-helper';

@Pipe({
  name: 'extractTextBeforeJson'
})
export class ExtractTextBeforeJsonPipe implements PipeTransform {

  transform(value: string): string {
    
    return JsonHelper.removeJsonObject(value);
  }
}
