import { Injectable, NgZone } from '@angular/core';

@Injectable()
export class MessengerCheckboxService {
    
    private progress: number;
    
    constructor(private ngZone: NgZone) { }

    initializeFbMessenger() {
        this.progress = 0; //mesure le progrès de chargement de la page (permet de lancer le FB.XFBML.parse() après que la vue soit chargée
        this.ngZone.runOutsideAngular(() => {
          this.increaseProgress(() => {
            // reenter the Angular zone and display done
            this.ngZone.run(() => {
            });
          });
        });
    }
      
    //fonction qui permet de mesurer (et d'augmenter) le progrès de chargement de la page
    increaseProgress(doneCallback: () => void) {
        this.progress += 1;
        if (this.progress < 100) {
          window.setTimeout(() => this.increaseProgress(doneCallback), 10);
        } else {
          if (window["FB"]) {
            window["FB"]["XFBML"].parse(); //on parse le plugin checkbox pour qu'il apparaisse
          };
          doneCallback();
        }
    }
    
      
  confirmOptIn(app_id, page_id, userId, user_ref) {
    window["FB"]["AppEvents"].logEvent('MessengerCheckboxUserConfirmation', null, {
      'app_id': app_id,
      'page_id': page_id,
      'ref': userId,
      'user_ref': user_ref
    });
  }
}
