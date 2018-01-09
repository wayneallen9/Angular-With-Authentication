import { ActivatedRoute, Params, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
    constructor(private activatedRoute:ActivatedRoute, private router:Router, private userService: UserService) { }

    ngOnInit(): void {
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            // if there is a token parameter, save it to local storage
            if (params.token) this.userService.saveJwtToken(params.token);

            // if there is a redirect, do it
            if (params.returnUrl) this.router.navigateByUrl(params.returnUrl);
        });

        // try and get the current user
        this.userService.getCurrent().subscribe();
    }
}