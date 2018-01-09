import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { RegisteredGuardService } from './services/registered.guard.service';
import { SignedInGuardService } from './services/signedin.guard.service';

import { AccountComponent } from './components/user/account.component';
import { ConfirmComponent } from './components/user/confirm.component';
import { ConfirmedComponent } from './components/user/confirmed.component';
import { ExternalSignedInComponent } from './components/user/external.signedin.component';
import { ForgotComponent } from './components/user/forgot.component';
import { HomeComponent } from './components/home/home.component';
import { CounterComponent } from './components/counter/counter.component';
import { FetchDataComponent } from './components/fetchdata/fetchdata.component';
import { NewPasswordComponent } from './components/user/new.password.component';
import { RegisterComponent } from './components/user/register.component';
import { SigninComponent } from './components/user/signin.component';
import { UnauthorisedComponent } from './components/user/unauthorised.component';

const appRoutes: Routes = [
    { path: '', redirectTo: 'home', pathMatch: 'full' },
    { path: 'account', component: AccountComponent, canActivate: [RegisteredGuardService] },
    { path: 'confirmed', component: ConfirmedComponent },
    { path: 'external', component: ExternalSignedInComponent },
    { path: 'forgot', component: ForgotComponent },
    { path: 'home', component: HomeComponent },
    { path: 'counter', component: CounterComponent },
    { path: 'fetch-data', component: FetchDataComponent, canActivate: [SignedInGuardService] },
    { path: 'newpassword', component: NewPasswordComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'signin', component: SigninComponent },
    { path: 'unauthorised', component: UnauthorisedComponent },
    { path: 'confirm', component: ConfirmComponent, canActivate: [RegisteredGuardService] },
    { path: '**', redirectTo: 'home' }
];

@NgModule({
    imports: [
        RouterModule.forRoot(
            appRoutes,
            { enableTracing: true } // <-- debugging purposes only
        )
    ],
    exports: [
        RouterModule
    ]
})
export class AppRoutingModule { }