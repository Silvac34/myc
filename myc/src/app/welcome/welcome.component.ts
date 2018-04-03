import { Component, OnInit } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from "../services/auth.service";

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  constructor(private modalService: NgbModal, public auth: AuthService) { 
  }
  
  sloganText: String;

  ngOnInit() {
    this.sloganText = 'INDEX.SLOGAN_2';
  }
  
  openModalFilter(content) {
    this.modalService.open(NgbdModalLoginContent)
  }
  

}

@Component({
  selector: 'ngbd-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title" translate>LOGIN.TITLE</h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss('Cross click')">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <app-login></app-login>
    </div>
    <div class="modal-footer">
      <button type="button" class="btn btn-outline-dark" (click)="activeModal.close('Close click')" translate>LOGIN.CLOSE</button>
    </div>
  `
})
export class NgbdModalLoginContent {
  constructor(public activeModal: NgbActiveModal) {}
}