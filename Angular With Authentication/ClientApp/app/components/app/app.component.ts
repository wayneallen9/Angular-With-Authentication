import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { UserModel } from '../../models/UserModel';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent {
    @ViewChild("signInModal")
    signInModal: ModalDirective;
    user: UserModel;

    constructor(private router: Router) { }

    closeSignIn(user: UserModel): void {
        // hide the modal
        this.signInModal.hide();

        // save the current user
        this.user = user;

        // do we need to show the awaiting verification message?
        if (!user.emailConfirmed) this.router.navigateByUrl("/confirm");
    }

    forgotPassword(): void {
        // hide the modal
        this.signInModal.hide();

        // let the user reset
        this.router.navigateByUrl("/forgot");
    }

    register(): void {
        // hide the modal
        this.signInModal.hide();
    }

    signIn(): void {
        this.signInModal.show();
    }
}