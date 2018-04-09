import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth.service';
import { environment } from '../environments/environment';
import { FacebookService, InitParams } from 'ngx-facebook';
import { NgbdModalLoginContent } from './welcome/welcome.component'
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { NgProgress } from '@ngx-progressbar/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {

  constructor(
    private translate: TranslateService,
    public router: Router,
    public auth: AuthService,
    private fb: FacebookService,
    private modalService: NgbModal,
    public progress: NgProgress
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
  }
  
  public isCollapsed = true;
  switchLanguage(language: string) {
    this.translate.use(language);
  }
  
  openModalLogin(content) {
    this.modalService.open(NgbdModalLoginContent)
  }
  
}
