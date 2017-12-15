import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { UserModel } from '../../models/UserModel';
import { UserService } from '../../services/user.service';

@Component({
    template: ""
})
export class ExternalSignedInComponent implements OnInit {
    constructor(private activatedRoute: ActivatedRoute, private router: Router, private userService: UserService) {
    }

    ngOnInit(): void {
        // get the token from the url
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            this.userService.external(params.token).subscribe((user: UserModel) => {
                // get the url to redirect to
                let url = params.returnUrl;

                // now go to the home page
                this.router.navigateByUrl(url);
            });
        });
    }
}