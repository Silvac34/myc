import { Component, OnInit} from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from "../services/auth.service";
import { MessengerCheckboxService } from "../services/messenger-checkbox.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [AuthService]
})
export class LoginComponent implements OnInit {

  constructor(public auth: AuthService, public activeModal: NgbActiveModal, public router: Router, private messengerCheckbox: MessengerCheckboxService) { }
  
  ngOnInit() {
    
  }

  private afterSignIn(): void {
    if((this.router.url === "/create_meal" || this.router.url === "/view_meals")){
      this.messengerCheckbox.initializeFbMessenger();
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
