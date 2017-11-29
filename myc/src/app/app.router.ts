import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { WelcomeComponent } from './welcome/welcome.component';
import { CreateMealComponent } from './create-meal/create-meal.component';
import { ViewMealsComponent } from './view-meals/view-meals.component';
import { MyMealsComponent } from './my-meals/my-meals.component';
import { ProfileComponent } from './profile/profile.component';

export const router: Routes = [
    { path: '', redirectTo: 'welcome', pathMatch: 'full' },
    { path: 'welcome', component: WelcomeComponent },
    { path: 'create_meal', component: CreateMealComponent },
    { path: 'view_meals', component: ViewMealsComponent },
    { path: 'my_meals', component: MyMealsComponent },
    { path: 'profile', component: ProfileComponent }
];

export const routes: ModuleWithProviders = RouterModule.forRoot(router);