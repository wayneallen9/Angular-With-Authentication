import { Component } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { Router } from '@angular/router';

@Component({
    templateUrl: './confirmed.component.html'
})
export class ConfirmedComponent {
    constructor(httpService: HttpService, private router: Router) {
        // the user needs to sign in again to regenerate a token
        httpService.clearToken();
    }

    goHome(): void {
        this.router.navigateByUrl("/home");
    }
}