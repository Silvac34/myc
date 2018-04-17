import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { NgbdModalLoginContent } from '../welcome/welcome.component';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';


@Injectable()
export class AuthGuardService implements CanActivate {
    redirectUrl: string;
  constructor(private auth: AuthService, private router: Router, private modalService: NgbModal) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let url: string = state.url;
    // Store the attempted URL for redirecting
    this.redirectUrl = url;
    return this.checkLogin(url);
  }

  checkLogin(url: string): boolean {
    if (this.auth.userId) { return true; }

    // Navigate to the login page with extras
    //this.router.navigate(['/login']);
    this.modalService.open(NgbdModalLoginContent);
    return false;
  }
  
}