import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'daysPipe',
  pure: false
})
export class DaysPipe implements PipeTransform {
  transform(value: any, args?: any) {
    if(value){
      return value.filter(meal => {
        if(args.some(element => element.selected) === true) {
          for (let i = 0; i < args.length; i++) {
            if (args[i].selected === true) {
              if (meal.date.getDay() === args[i].ind) {
                return meal
              }
            }
          }
        }
        else {
          return meal;
        }
      });
    }
  }
}


@Pipe({
  name: 'pricePipe',
  pure: false
})
export class PricePipe implements PipeTransform {
//en input arrivera toujours la variable selectedFilters contenant tous les filtres
  transform(value: any, args?: any) {
    if(value){
      return value.filter(meal => {
        if(args.priceFilterMin !== null && args.priceFilterMax !== null){
          return (meal.mealPrice >= args.priceFilterMin && meal.mealPriceMin <= args.priceFilterMax);
        }
        else {
          if (args.priceFilterMin !== null) {
            return (meal.mealPrice >= args.priceFilterMin);
          }
          if (args.priceFilterMax !== null) {
            return (meal.mealPrice <= args.priceFilterMax);
          }
          else {
            return meal;
          }
        }
      })
    }
  }
}

@Pipe({
  name: 'dateRangePipe',
  pure: false
})
export class DateRangePipe implements PipeTransform {
//en input arrivera toujours la variable selectedFilters contenant tous les filtres
  transform(value: any, args?: any) {
    if(value){
      return value.filter(meal => {
        if (args.dateFilterMin !== null && args.dateFilterMax !== null) {
          return (meal.date >= args.dateFilterMin && meal.date <= args.dateFilterMax);
        }
        else {
          if (args.dateFilterMin !== null) {
            return (meal.date >= args.dateFilterMin);
          }
          else if (args.dateFilterMax !== null) {
            return (meal.date <= args.dateFilterMax);
          }
          else {
            return meal;
          }
        }
      })
    }
  }
}

@Pipe({
  name: 'preferencePipe',
  pure: false
})
export class PreferencePipe implements PipeTransform {
  transform(value: any, args?: any) {
    if(value){
      return value.filter(meal => {
        if(args.some(element => element.selected) === true) {
          for (let i=0; i < args.length; i++){
            if (args[i]["selected"] === true) {
              if (meal[args[i]["label"].split('.').pop().toLowerCase()] === true) {
                return meal
              }
            }
          }
        }
        else {
          return meal;
        }
      })
    }
  }
}

@Pipe({
  name: 'helpingTypePipe',
  pure: false
})
export class HelpingTypePipe implements PipeTransform {
  transform(value: any, args?: any) {
    if(value){
      return value.filter(meal => {
        if(args.some(element => element.selected) === true) {
          for (let i=0; i < args.length; i++){
            if (args[i]["selected"] === true) {
              if(args[i]["label"].split('.').pop() === "HELP_COOKING"){
                if (meal["detailedInfo"]["requiredGuests"]["cooks"]["nbRquCooks"] > 0) {
                  return meal
                } 
              }
              if(args[i]["label"].split('.').pop() === "HELP_CLEANING"){
                if (meal["detailedInfo"]["requiredGuests"]["cleaners"]["nbRquCleaners"] > 0) {
                  return meal
                } 
              }
              if(args[i]["label"].split('.').pop() === "SIMPLE_GUEST"){
                if (meal["detailedInfo"]["requiredGuests"]["simpleGuests"]["nbRquSimpleGuests"] > 0) {
                  return meal
                } 
              }
            }
          }
        }
        else {
          return meal;
        }
      })
    }
  }
}

@Pipe({
  name: 'cityPipe',
  pure: false
})
export class CityPipe implements PipeTransform {
  //en input arrivera toujours la variable selectedFilters.cityFilter
  transform(value: any, args?: any) {
    if(value){
      return value.filter(meal => {
        if (args.town !== null && args.country_code !== null) {
          return (meal.address.country_code === args.country_code && meal.address.town === args.town);
        }
        else {
          return meal;
        }
      })
    }
  }
}