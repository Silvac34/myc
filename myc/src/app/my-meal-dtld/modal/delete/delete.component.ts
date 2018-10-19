import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AngularFirestore } from 'angularfire2/firestore';
import { Meal } from '../../../data-model/meal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-delete',
  templateUrl: './delete.component.html',
  styleUrls: ['./delete.component.scss']
})
export class DeleteComponent {
  @Input() mealId: string;
  
  constructor(public activeModal: NgbActiveModal, private afs: AngularFirestore, public router: Router) { }
  
  delete() {
    //rajouter une fonction qui supprime le repas
    this.afs.doc<Meal>(`meals/${this.mealId}`).delete().then(result => {
      this.activeModal.close();
      this.router.navigate(['/view_meals']);
    })
    .catch(error => {
      console.error(error);
    });
  }
}
