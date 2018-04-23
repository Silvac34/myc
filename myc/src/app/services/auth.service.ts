import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/switchMap'
import { User } from '../data-model/user';

@Injectable()
export class AuthService {
  user: Observable<User>;
  userMeta: Observable<any>;
  userCol: AngularFirestoreDocument<any>;
  userId: string;
  authState: any = null;
  redirectUrl: string;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    public router: Router
    ){ 
      this.user = this.afAuth.authState
        .switchMap(user => {
          if (user) {
            this.userId = user.uid;
            return this.afs.doc<User>(`users/${user.uid}`).valueChanges()
          } else {
            return Observable.of(null)
          }
        });
      this.userMeta = this.afAuth.authState
        .switchMap(userMeta => {
          if (userMeta) {
            return this.afs.doc<User>(`users/${userMeta.uid}`).snapshotChanges()
          } else {
            return Observable.of(null)
          }
        });
    }

  facebookLogin() {
    const provider = new firebase.auth.FacebookAuthProvider();
    return this.oAuthLogin(provider);
  }
  
  googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return this.oAuthLogin(provider);
  }
  
  private oAuthLogin(provider) {
    return this.afAuth.auth.signInWithPopup(provider)
      .then((credential) => {
        this.updateUserData(credential, provider.providerId)
      })
  }
  
  private updateUserData(credential, provider) {//ajouter les reviews dans les infos du user quand il est crée
    const user = credential.additionalUserInfo; //on récupère toutes les données relatives au réseau social auquel on se connecte
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(`users/${credential.user.uid}`); //on récupère l'id de l'utilisateur
    let privateInfoInput = {
      email: user.profile.email
    };
    let data: Object = {};
    if(provider == "facebook.com") {
      data = {
        first_name: user.profile.first_name,
        last_name: user.profile.last_name,
        gender: user.profile.gender,
        facebook_id: user.profile.id,
        google_id: null,
        link: user.profile.link,
        last_connexion_from: user.profile.locale,
        picture: user.profile.picture.data.url,
        privateInfo: privateInfoInput
      };
    }
    else if(provider == "google.com") {
      data = {
        first_name: user.profile.family_name,
        last_name: user.profile.given_name,
        gender: user.profile.gender,
        facebook_id: null,
        google_id: user.profile.id,
        link: user.profile.link,
        last_connexion_from: user.profile.locale,
        picture: user.profile.picture,
        privateInfo: privateInfoInput
      };
    }
    if(user.isNewUser === false) {
      return userRef.update(data);
    }
    else {
      data["reviews"] = {"positive": 0, "neutral": 0, "negative": 0}
      return userRef.set(data);
    }
  }
  
  signOut() {
    //on supprime redirectUrl de authGuard
    this.afAuth.auth.signOut().then(() => {
        this.userId = null;
        this.router.navigate(['/welcome']);
    });
  }
}


/*
import { Injectable } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from '../data-model/user';
import * as firebase from 'firebase/app';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class AuthService {

  authState: any = null;
  private usersCollection: AngularFirestoreCollection<User>;
  users: Observable<User[]>;
  
  constructor(private afAuth: AngularFireAuth,private db: AngularFireDatabase, private afs: AngularFireStore) {
    this.usersCollection = afs.collection<User>('users');
    this.users = this.usersCollection.valueChanges();
    this.afAuth.authState.subscribe((auth) => {
      this.authState = auth
    });
  }
    


  // Returns true if user is logged in
  get authenticated(): boolean {
    return this.authState !== null;
  }

  // Returns current user data
  get currentUser(): any {
    return this.authenticated ? this.authState : null;
  }

  // Returns
  get currentUserObservable(): any {
    return this.afAuth.authState
  }

  // Returns current user UID
  get currentUserId(): string {
    return this.authenticated ? this.authState.uid : '';
  }

  // Anonymous User
  get currentUserAnonymous(): boolean {
    return this.authenticated ? this.authState.isAnonymous : false
  }

  // Returns current user display name or Guest
  get currentUserDisplayName(): string {
    if (!this.authState) { return 'guest' }
    else if (this.currentUserAnonymous) { return 'anonymous' }
    else { return this.authState['displayName'] || 'User without a Name' }
  }

  //// Social Auth ////
  googleLogin() {
    const provider = new firebase.auth.GoogleAuthProvider()
    return this.socialSignIn(provider);
  }

  facebookLogin() {
    const provider = new firebase.auth.FacebookAuthProvider();
    return this.socialSignIn(provider);
  }

  private socialSignIn(provider) {
    if(provider.providerId == "facebook.com") {
      return this.afAuth.auth.signInWithPopup(provider)
      .then((credential) =>  {
          this.authState = credential.user
          this.updateUserFacebookData(credential.additionalUserInfo)
      })
      .catch(error => console.log(error));
    }
    else if (provider.providerId == "google.com") {
      return this.afAuth.auth.signInWithPopup(provider)
      .then((credential) =>  {
          this.authState = credential.user
          this.updateUserGoogleData(credential.additionalUserInfo)
      })
      .catch(error => console.log(error));
    }
    else {
      return this.afAuth.auth.signInWithPopup(provider)
      .then((credential) =>  {
          this.authState = credential.user
          this.updateUserData()
      })
      .catch(error => console.log(error));
    }
  }


  //// Anonymous Auth ////
  anonymousLogin() {
    return this.afAuth.auth.signInAnonymously()
    .then((user) => {
      this.authState = user
      this.updateUserData()
    })
    .catch(error => console.log(error));
  }

  //// Email/Password Auth ////
  emailSignUp(email:string, password:string) {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password)
      .then((user) => {
        this.authState = user
        this.updateUserData()
      })
      .catch(error => console.log(error));
  }

  emailLogin(email:string, password:string) {
     return this.afAuth.auth.signInWithEmailAndPassword(email, password)
       .then((user) => {
         this.authState = user
         this.updateUserData()
       })
       .catch(error => console.log(error));
  }

  // Sends email allowing user to reset password
  resetPassword(email: string) {
    var auth = firebase.auth();

    return auth.sendPasswordResetEmail(email)
      .then(() => console.log("email sent"))
      .catch((error) => console.log(error))
  }


  //// Sign Out ////
  signOut(): void {
    this.afAuth.auth.signOut();
  }


  //// Helpers ////
  private updateUserFacebookData(additionalUserInfo: any): void {
  // Writes user name and email to realtime db
  // useful if your app displays information about users or for admin features
    //let path = `users/${this.currentUserId}`; // Endpoint on firebase
    let privateInfoInput = {
      email: additionalUserInfo.profile.email
    };
    let data = {
                  first_name: additionalUserInfo.profile.first_name,
                  last_name: additionalUserInfo.profile.last_name,
                  gender: additionalUserInfo.profile.gender,
                  facebook_id: additionalUserInfo.profile.id,
                  google_id: null,
                  link: additionalUserInfo.profile.link,
                  last_connexion_from: additionalUserInfo.profile.locale,
                  picture: additionalUserInfo.profile.picture.data.url,
                  privateInfo: privateInfoInput
                };
    this.usersCollection.add(data);
    //this.db.object(path).update(data)
    //.catch(error => console.log(error));
  }
  
  
   //// Helpers ////
  private updateUserGoogleData(additionalUserInfo: any): void {
  // Writes user name and email to realtime db
  // useful if your app displays information about users or for admin features
    let path = `users/${this.currentUserId}`; // Endpoint on firebase
    let privateInfoInput = {
      email: additionalUserInfo.profile.email
    };
    let data = {
                  first_name: additionalUserInfo.profile.family_name,
                  last_name: additionalUserInfo.profile.given_name,
                  gender: additionalUserInfo.profile.gender,
                  facebook_id: null,
                  google_id: additionalUserInfo.profile.id,
                  link: additionalUserInfo.profile.link,
                  last_connexion_from: additionalUserInfo.profile.locale,
                  picture: additionalUserInfo.profile.picture,
                  privateInfo: privateInfoInput
                };

    this.db.object(path).update(data)
    .catch(error => console.log(error));
  }
  
  //// Helpers ////
  private updateUserData(): void {
  // Writes user name and email to realtime db
  // useful if your app displays information about users or for admin features
    let path = `users/${this.currentUserId}`; // Endpoint on firebase
    let data = {
                  email: this.authState.email,
                  name: this.authState.displayName
                }

    this.db.object(path).update(data)
    .catch(error => console.log(error));

  }

}*/