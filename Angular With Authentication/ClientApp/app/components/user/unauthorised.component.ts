﻿import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/operator/filter';

@Component({
    templateUrl: './unauthorised.component.html'
})
export class UnauthorisedComponent implements OnInit {
    returnUrl:string;

    constructor(private route:ActivatedRoute, private router: Router) { }

    confirm(): void {
        this.router.navigateByUrl("/confirm");
    }

    continue(): void {
        // the user has signed in, so continue to the return route
        this.router.navigateByUrl(this.returnUrl);
    }

    forgotPassword(): void {
        this.router.navigateByUrl("/forgot");
    }

    ngOnInit(): void {
        this.route.queryParams
            .subscribe(params => {
                this.returnUrl = params.returnUrl;
            });
    }
}