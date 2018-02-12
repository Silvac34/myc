import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from "./services/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  
  constructor(private translate: TranslateService, private router: Router, public auth: AuthService) {
    let userLang = navigator.language; 
    translate.setDefaultLang('en');
    translate.use(userLang);
  }

  public isCollapsed = true;
  switchLanguage(language: string) {
    this.translate.use(language);
  }
  
  user = {
    "_id": {
        "$oid": "577946eb4403f92b93425e6a"
    },
    "privateInfo": {
        "cellphone": "0669686766",
        "preferences": {
            "omnivorous_notification": true,
            "veggies_notification": true,
            "vegan_notification": true
        },
        "user_ref": "3229872073936",
        "email": "dimitri.kohn@centrale-marseille.fr"
    },
    "picture": {
        "data": {
            "url": "https://scontent.xx.fbcdn.net/v/t1.0-1/p200x200/10574308_10154781062403395_8399053171141470099_n.jpg?oh=894f4bbf5fdc6f56612ca1845127824e&oe=5A6EF34D",
            "is_silhouette": false
        }
    },
    "first_name": "Dimitri",
    "last_name": "Odyssound",
    "gender": "male",
    "facebook_id": "10153917348848395",
    "link": "https://www.facebook.com/app_scoped_user_id/10153917348848395/",
    "reviews": {
        "positive": 1,
        "negative": 1
    },
    "_updated": {
        "$date": "2017-09-15T10:36:29.000Z"
    },
    "_etag": "793192952506211ba0fe4dae15180ae2e398b029"
  }
}
