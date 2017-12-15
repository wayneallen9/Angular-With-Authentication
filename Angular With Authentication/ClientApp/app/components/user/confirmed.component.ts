import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    templateUrl: './confirmed.component.html'
})
export class ConfirmedComponent {
    constructor(private router: Router) { }

    forgotPassword(): void {
        this.router.navigateByUrl("/forgot");
    }

    goHome(): void {
        this.router.navigateByUrl("/home");
    }
}