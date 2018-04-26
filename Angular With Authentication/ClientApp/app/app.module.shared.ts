import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppAuthModule } from './app.module.auth';
import { AppRoutingModule } from './app-routing.module';

import { AccountComponent } from './components/user/account.component';
import { AppComponent } from './components/app/app.component';
import { ConfirmComponent } from './components/user/confirm.component';
import { ConfirmedComponent } from './components/user/confirmed.component';
import { ExpiredComponent } from './components/user/expired.component';
import { ExternalSignedInComponent } from './components/user/external.signedin.component';
import { ExternalSignInComponent } from './components/user/external.signin.component';
import { ForgotComponent } from './components/user/forgot.component';
import { NavMenuComponent } from './components/navmenu/navmenu.component';
import { HomeComponent } from './components/home/home.component';
import { FetchDataComponent } from './components/fetchdata/fetchdata.component';
import { CounterComponent } from './components/counter/counter.component';
import { NewPasswordComponent } from './components/user/new.password.component';
import { RegisterComponent } from './components/user/register.component';
import { SigninComponent } from './components/user/signin.component';
import { SigninFormComponent } from './components/user/signin.form.component';
import { UnauthorisedComponent } from './components/user/unauthorised.component';

import { HttpService } from './services/http.service';
import { RecaptchaService } from './services/recaptcha.service';
import { RegisteredGuardService } from './services/registered.guard.service';
import { ScriptLoaderService } from './services/script.loader.service';
import { SignedInGuardService } from './services/signedin.guard.service';
import { UserService } from './services/user.service';

import { CollapseDirective } from './directives/collapse.directive';
import { RecaptchaDirective } from './directives/recaptcha.directive';

@NgModule({
    declarations: [
        CollapseDirective,
        RecaptchaDirective,
        AccountComponent,
        AppComponent,
        ConfirmComponent,
        ConfirmedComponent,
        ExpiredComponent,
        ExternalSignedInComponent,
        ExternalSignInComponent,
        ForgotComponent,
        NavMenuComponent,
        CounterComponent,
        FetchDataComponent,
        HomeComponent,
        NewPasswordComponent,
        RegisterComponent,
        SigninComponent,
        SigninFormComponent,
        UnauthorisedComponent
    ],
    imports: [
        AppAuthModule,
        AppRoutingModule,
        CommonModule,
        HttpModule,
        ReactiveFormsModule
    ],
    providers: [
        HttpService,
        { provide:'LOCALSTORAGE', useFactory: getLocalStorage },
        RecaptchaService,
        RegisteredGuardService,
        SignedInGuardService,
        ScriptLoaderService,
        UserService
    ]
})
export class AppModuleShared {
}

export function getLocalStorage(): Storage {
    return (typeof window !== "undefined") ? window.localStorage : {
        length: 0,
        clear: () => { },
        getItem: (key: string) => null,
        key: (index: number) => null,
        removeItem: (key: string) => { },
        setItem: (key: string) => { }
    };
}