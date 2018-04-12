import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencySymbol'
})
export class CurrencySymbolPipe implements PipeTransform {

  transform(value: any, args?: string): any {
    if (args === "€") {
      return value + "€"
    }
    else {
      return args + value
    }
  }

}
