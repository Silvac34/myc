import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { CreateMealComponent } from './create-meal/create-meal.component';
import { ViewMealsComponent } from './view-meals/view-meals.component';
import { MyMealsComponent } from './my-meals/my-meals.component';
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
import { MyMealDtldComponent } from './my-meal-dtld/my-meal-dtld.component';

export const router: Routes = [
    { path: '', redirectTo: 'welcome', pathMatch: 'full' },
    { path: 'welcome', component: WelcomeComponent },
    { path: 'create_meal', component: CreateMealComponent },
    { path: 'view_meals', component: ViewMealsComponent },
    { path: 'my_meals', component: MyMealsComponent },
    { path: 'my_meals/:id', component: MyMealDtldComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'footer_more_contact', component: ContactComponent },
    { path: 'footer_information_team', component: TeamComponent },
    { path: 'footer_information_concept', component: ConceptComponent },
    { path: 'footer_information_FAQ', component: FaqComponent },
    { path: 'footer_legal_terms_and_conditions', component: TermsAndConditionsComponent },
    { path: 'footer_legal_privacy_policy', component: PrivacyPolicyComponent },
    { path: 'footer_legal_general_policies', component: GeneralPoliciesComponent },
    { path: 'footer_legal_guidelines', component: GuidelinesComponent },
    { path: 'footer_more_careers', component: CareersComponent },
    { path: 'footer_more_photo_gallery', component: PhotoGalleryComponent }
];

export const routes: ModuleWithProviders = RouterModule.forRoot(router);