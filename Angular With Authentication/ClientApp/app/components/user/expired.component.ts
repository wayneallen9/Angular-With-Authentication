import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { HttpService } from '../../services/http.service';

@Component({
    templateUrl: './expired.component.html'
})
export class ExpiredComponent implements OnInit {
    private returnUrl: string;

    constructor(private activatedRouter: ActivatedRoute, httpService: HttpService, private router: Router) {
        httpService.clearToken();
    }

    ngOnInit(): void {
        this.activatedRouter.queryParams.subscribe((params: Params) => {
            this.returnUrl = params.returnUrl;
        })
    }

    signedIn(): void {
        this.router.navigateByUrl(this.returnUrl ? this.returnUrl : "/home");
    }
}