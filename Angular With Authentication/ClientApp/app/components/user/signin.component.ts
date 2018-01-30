import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    templateUrl: './signin.component.html'
})
export class SigninComponent {
    returnUrl = "/home";

    constructor(private router: Router) { }

    continue(): void {
        this.router.navigateByUrl("/home");
    }
}