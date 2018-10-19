import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { User } from '../data-model/user';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';
import { Router, Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

@Injectable()
export class GetUserService implements Resolve<any> {
    private userDoc: AngularFirestoreDocument<User>;
    user: Observable<User>;

    constructor(private afs: AngularFirestore, private router: Router) { }
    
    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): any {
        let id = route.paramMap.get('id');
        return this.getPrivateUserFromId(id).take(1).map(result => {
          if (result) {
            return this.userDoc;
          } else { // id not found
            this.router.navigate(['/view_meals']);
            return null;
          }
        });
    }

    getUserFromId(userId: string) {
        this.userDoc = this.afs.doc<User>('users/' + userId);
        return this.user = this.userDoc.valueChanges().map(actions => {
            if(actions) {
                delete actions.privateInfo;
            }
            return actions;
        });
    }
    
    getPrivateUserFromId(userId: string) {
        this.userDoc = this.afs.doc<User>('users/' + userId);
        return this.user = this.userDoc.valueChanges().map(actions => {
            return actions;
        });
    }
       
}
