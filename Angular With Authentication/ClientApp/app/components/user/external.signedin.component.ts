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
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            // get the user from the server
            this.userService.external(params.token).subscribe();

            // if there is a redirect, do it
            this.router.navigateByUrl(params.returnUrl ? params.returnUrl : "/home");
        });
    }
}