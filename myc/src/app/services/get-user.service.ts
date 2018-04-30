import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { User } from '../data-model/user';

@Injectable()
export class GetUserService {
    private userDoc: AngularFirestoreDocument<User>;
    user: Observable<User>;

  constructor(private afs: AngularFirestore) { }

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
