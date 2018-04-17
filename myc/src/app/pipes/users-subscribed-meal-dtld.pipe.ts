import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'usersSubscribedMealDtld'
})
export class UsersSubscribedMealDtldPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let array = [];
    value.forEach(element => {
      if(element.role === args) {
        array.push(element);
      }
    });
    return array;
  }

}
