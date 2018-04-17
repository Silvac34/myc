import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { environment } from './../environments/environment';

import { AppComponent } from './app.component';
import { routes } from './app.router';

import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Connexion to database firestore

import { AngularFireModule } from 'angularfire2';
import { AngularFirestoreModule } from 'angularfire2/firestore';

// Connexion to auth firebase
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';

//Facebook SDK
import { FacebookModule } from 'ngx-facebook';

//services
import { AuthService } from './services/auth.service'; //authentification firebase
import { AgmCoreModule } from '@agm/core'; //google-map
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window'; //info windows for gmap
import { GoogleMapService } from './services/google-map.service'; //google-map créer par moi même
import { CurrencyService } from './services/currency.service'; // pour obtenir le symbol de la monnaie selon le pays
import { GetUserService } from './services/get-user.service'; // on obtient les données associés à un utilisateur
import { MealsService } from './services/meals.service'; // fonctions relatives aux meals
import { MessengerCheckboxService } from './services/messenger-checkbox.service'; // fonctions relatives aux meals

// translation with ngx-translate
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { registerLocaleData } from '@angular/common';

//rajout de langues en locale pour que fonctionne le pipe 'date'
import localeFr from '@angular/common/locales/fr';
import localeEn from '@angular/common/locales/en';

registerLocaleData(localeEn, 'en-US');
registerLocaleData(localeFr, 'fr-FR');

//router
import { CreateMealComponent } from './create-meal/create-meal.component';
import { ViewMealsComponent } from './view-meals/view-meals.component';
import { MyMealsComponent } from './my-meals/my-meals.component';
import { WelcomeComponent, NgbdModalLoginContent } from './welcome/welcome.component';
import { ProfileComponent } from './profile/profile.component';
import { ConceptComponent } from './footer/information/concept/concept.component';
import { FaqComponent } from './footer/information/faq/faq.component';
import { TeamComponent } from './footer/information/team/team.component';
import { GeneralPoliciesComponent } from './footer/legal/general-policies/general-policies.component';
import { GuidelinesComponent } from './footer/legal/guidelines/guidelines.component';
import { PrivacyPolicyComponent } from './footer/legal/privacy-policy/privacy-policy.component';
import { TermsAndConditionsComponent } from './footer/legal/terms-and-conditions/terms-and-conditions.component';
import { CareersComponent } from './footer/more/careers/careers.component';
import { ContactComponent } from './footer/more/contact/contact.component';
import { PhotoGalleryComponent } from './footer/more/photo-gallery/photo-gallery.component';
import { LoginComponent } from './login/login.component';
import { MyMealDtldComponent } from './my-meal-dtld/my-meal-dtld.component';

//view-meals
import { FilterComponent } from './view-meals/filter/filter.component';
import { ListComponent } from './view-meals/container/list/list.component';
import { MapComponent } from './view-meals/container/map/map.component';
import { ViewMealDtldComponent } from './view-meals/view-meal-dtld/view-meal-dtld.component';

//external modules
import { NgCircleProgressModule } from 'ng-circle-progress';
import { NgProgressModule } from '@ngx-progressbar/core';
import { NgProgressRouterModule } from '@ngx-progressbar/router';

//Pipes
import { LimitToPipe } from './pipes/limit-to.pipe';
import { DateTranslatePipe } from './pipes/date-translate.pipe';
import { ReversePipe } from './pipes/reverse.pipe';
import { AgePipe } from './pipes/age.pipe';
import { DateRangePipe, PricePipe, DaysPipe, PreferencePipe, HelpingTypePipe, CityPipe } from './pipes/meals.pipe';
import { CurrencySymbolPipe } from './pipes/currencySymbol.pipe';
import { UsersSubscribedMealDtldPipe } from './pipes/users-subscribed-meal-dtld.pipe';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

@NgModule({
  declarations: [
    AppComponent,
    CreateMealComponent,
    ViewMealsComponent,
    MyMealsComponent,
    WelcomeComponent,
    NgbdModalLoginContent,
    ProfileComponent,
    ConceptComponent,
    FaqComponent,
    TeamComponent,
    GeneralPoliciesComponent,
    GuidelinesComponent,
    PrivacyPolicyComponent,
    TermsAndConditionsComponent,
    CareersComponent,
    ContactComponent,
    PhotoGalleryComponent,
    LoginComponent,
    FilterComponent,
    ListComponent,
    MapComponent,
    ViewMealDtldComponent,
    LimitToPipe,
    DateTranslatePipe,
    ReversePipe,
    DaysPipe,
    DateRangePipe,
    PreferencePipe,
    HelpingTypePipe,
    PricePipe,
    PricePipe,
    CityPipe,
    AgePipe,
    CurrencySymbolPipe,
    UsersSubscribedMealDtldPipe,
    MyMealDtldComponent
  ],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: environment.googleMapKey,
      libraries: ["places"]
    }),
    AgmSnazzyInfoWindowModule,
    BrowserModule,
    AngularFontAwesomeModule,
    ReactiveFormsModule,
    FormsModule,
    routes,
    FacebookModule.forRoot(),
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFirestoreModule.enablePersistence(),
    AngularFireDatabaseModule,
    AngularFireAuthModule,
    NgbModule.forRoot(),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    // Specify ng-circle-progress as an import
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 26,
      outerStrokeWidth: 10,
      innerStrokeWidth: 10,
      space: -10,
      outerStrokeColor: "#45ccce",
      outerStrokeLinecap : "butt",
      showInnerStroke: true,
      innerStrokeColor: "#e7e8ea",
      animation: true,
      animationDuration: 300,
      showSubtitle: false,
      showUnits: false,
      titleFontSize: '14'
    }),
    NgProgressModule.forRoot(),
    NgProgressRouterModule
  ],
  providers: [GoogleMapService, CurrencyService, AuthService, GetUserService, MealsService, MessengerCheckboxService],
  bootstrap: [AppComponent],
  entryComponents: [FilterComponent, NgbdModalLoginContent, ViewMealDtldComponent]
})

export class AppModule { }
