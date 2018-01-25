import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
    template: ""
})
export class ExternalSignedInComponent implements OnInit {
    constructor(private activatedRoute: ActivatedRoute, private router: Router) { }

    ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            // redirect to the end route
            this.router.navigateByUrl(params.returnUrl ? params.returnUrl : "/home");
        });
    }
}