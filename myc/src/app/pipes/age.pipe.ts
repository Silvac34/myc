import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'age'
})
export class AgePipe implements PipeTransform {

    transform(value: any): any {
        let now = new Date;
        let ageDifMs = +now - value;
        let ageDate = new Date(ageDifMs); // miliseconds from epoch
        return Math.abs(+ageDate.getUTCFullYear() - 1970);
    }

}
