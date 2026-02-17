import { Pipe, PipeTransform } from '@angular/core';// Adjust the import based on your project structure
import { JsonHelper } from '../core/services/AIAssistant/json-helper';

@Pipe({
  name: 'extractChartJsonObject'
})
export class ExtractChartJsonObjectPipe implements PipeTransform {

  transform(value: string): any {
    var chartJson = JsonHelper.extractJsonObject(value, "```chartjson");
    return chartJson;
  }
}
