import { Pipe, PipeTransform } from '@angular/core';
import { SupplyingConstants } from 'src/app/supplying/supplying-constants'

@Pipe({
  name: 'iva'
})
export class IvaPipe implements PipeTransform {

  transform(value: number, active: boolean): string {

    if(value == null){
      value = 0;
    }
    
    if (active == true)
      return (value * 1.19).toFixed().toString();
    return (value).toString();
  }

}

@Pipe({
  name: 'tax'
})
export class TaxPipe implements PipeTransform {

  transform(value: number, active: boolean): string {
    if(value == null){
      value = 0;
    }

    if (active == true)
      return (value * 0.19).toFixed().toString();
    return (0).toString();
  }

}

@Pipe({
  name: 'taxV'
})
export class TaxValuePipe implements PipeTransform {

  transform(value: number, option: any): string {

    if(value == null){
      value = 0;
    }

    if (option == SupplyingConstants.TAX_CATEGORY_IVA)
      return (value+(value * 0.19)).toFixed().toString();
    else if (option == SupplyingConstants.TAX_CATEGORY_10)
      return (value/0.90).toFixed().toString();
    return (value).toString();
  }

}

@Pipe({
  name: 'taxN'
})
export class NewTaxPipe implements PipeTransform {

  transform(value: number, option: any): string {

    if(value == null){
      value = 0;
    }
    if (option == SupplyingConstants.TAX_CATEGORY_IVA)
      return (value * 0.19).toFixed().toString();
    else if (option == SupplyingConstants.TAX_CATEGORY_10)
      return (value/0.90-(value)).toFixed().toString();
    return (0).toString();
  }

}