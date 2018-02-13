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
  
}
