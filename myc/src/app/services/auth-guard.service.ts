import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRoute, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { NgbdModalLoginContent } from '../welcome/welcome.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Injectable()
export class AuthGuardService implements CanActivate {
  redirectUrl: string;
  constructor(public auth: AuthService, private router: Router, private modalService: NgbModal, private route: ActivatedRoute) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;
    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {
    if (this.auth.userId) { 
      //après log in, on relance la navigation vers la page qui a la authGuard et donc on passe par ici donc on supprime le redirectUrl
      this.redirectUrl = null;
      return true; 
    }
    else{
      //open modal for logging in
      this.redirectUrl = url;
      this.modalService.open(NgbdModalLoginContent);
      return false;
    }
  }
}