import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from './services/auth.service';
import { environment } from '../environments/environment';
import { FacebookService, InitParams } from 'ngx-facebook';
import { NgbdModalLoginContent } from './welcome/welcome.component'
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgProgress } from '@ngx-progressbar/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  public userId: string;
  
  constructor(
    private translate: TranslateService,
    public router: Router,
    public auth: AuthService,
    private fb: FacebookService,
    private modalService: NgbModal,
    public progress: NgProgress,
    ) {
    let userLang = navigator.language;
    if(userLang === "fr") {
      userLang = "fr-FR"
    };
    if(userLang === "en") {
      userLang = "en-US"
    };
    translate.setDefaultLang('en-US');
    translate.use(userLang);
    let facebookConfig: InitParams = environment.facebookConfig;
    this.fb.init(facebookConfig);
    //à chaque fois qu'on change de route, on retourne en haut de la page
    this.router.events.subscribe((evt) => {
        if (!(evt instanceof NavigationEnd)) {
            return;
        }
        window.scrollTo(0, 0)
    });
    this.auth.userMeta.subscribe(data => {
      if(data){
        this.userId = data.payload.id;
      }
    });
  }
  
  public isCollapsed = true;
  switchLanguage(language: string) {
    this.translate.use(language);
  }
  
  openModalLogin(content) {
    this.modalService.open(NgbdModalLoginContent)
  }
  
}
