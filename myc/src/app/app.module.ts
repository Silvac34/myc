import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from './../environments/environment';

import { AppComponent } from './app.component';
import { routes } from './app.router';

import { AngularFontAwesomeModule } from 'angular-font-awesome/angular-font-awesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

//services
import { AgmCoreModule } from '@agm/core';
import { GoogleMapService } from './services/google-map.service';
import { CurrencyService } from './services/currency.service';

// translation with ngx-translate
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

//router
import { CreateMealComponent } from './create-meal/create-meal.component';
import { ViewMealsComponent } from './view-meals/view-meals.component';
import { MyMealsComponent } from './my-meals/my-meals.component';
import { WelcomeComponent } from './welcome/welcome.component';
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
    PhotoGalleryComponent
  ],
  imports: [
    AgmCoreModule.forRoot({
      apiKey: "AIzaSyBwwM-TMFz42n8ZDaGHF-8rGt76cdoXN8M",
      libraries: ["places"]
    }),
    BrowserModule,
    AngularFontAwesomeModule,
    ReactiveFormsModule,
    routes,
    NgbModule.forRoot(),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    })
  ],
  providers: [GoogleMapService, CurrencyService],
  bootstrap: [AppComponent]
})

export class AppModule { }
