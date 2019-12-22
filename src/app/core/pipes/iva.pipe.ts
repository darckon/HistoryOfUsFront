import { Pipe, PipeTransform } from '@angular/core';

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
