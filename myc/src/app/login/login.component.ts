import { Component, OnInit, Input} from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from "../services/auth.service";
import { AuthGuardService } from "../services/auth-guard.service";
import { MessengerCheckboxService } from "../services/messenger-checkbox.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthService]
})
export class LoginComponent implements OnInit {
  constructor(public auth: AuthService, private authGuard: AuthGuardService, public activeModal: NgbActiveModal, public router: Router, private messengerCheckbox: MessengerCheckboxService) { }
  
  ngOnInit() {
  }

  private afterSignIn(): void {
    if(this.router.url === "/create_meal"){
      this.messengerCheckbox.initializeFbMessenger();
    }
    console.log(this.authGuard.redirectUrl);
    if(this.authGuard.redirectUrl) {
      this.router.navigate([this.authGuard.redirectUrl]);
    }
  }
  
  onClick(event){
    for (let i=0; i<event.path.length; i++){
      //on ne veut pas que le modal de viewMealDtld soit fermé, lorsqu'on se connecte depuis cet endroit. 
      //On rajoute donc l'id au composant app-login et lorsuqe c'est différent de cet ID, on est dans un modal que l'on doit fermer
      if(event.path[i].localName === "app-login" && event.path[i].id !== "fromMealDtld") { 
         this.activeModal.close('Close click');
      }
    }
  }
  
  signInWithGoogle(): void {
    this.auth.googleLogin()
      .then(() => this.afterSignIn());
  }
  signInWithFacebook(): void {
    this.auth.facebookLogin()
      .then(() => this.afterSignIn());
  }

}
