import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'normalizeString'
})
export class NormalizeStringPipe implements PipeTransform {
    transform(value: string): string {
        if (!value) return '';
        //  Only normalize if the string is fully lowercase
        if (value === value.toLowerCase()) {
            return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        }
        return value;
    }
}