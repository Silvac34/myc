export class Filter {
    "weekDays": Item_one[];
    "dateFilterMin": Item_two;
    "dateFilterMax": Item_two;
    "priceFilterMin": Item_two;
    "priceFilterMax": Item_two;
    "cityFilter": String;
    "preferenceFilter": Item_one[];
    "helpTypeFilter": Item_one[];
}

export class Item_one {
    "label": String;
    "selected": Boolean;
}

export class Item_two {
    "opened": Boolean;
    "value": any;
}