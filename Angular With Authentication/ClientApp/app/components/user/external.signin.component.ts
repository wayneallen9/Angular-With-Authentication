import { ActivatedRoute, Params, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'external',
    templateUrl: './external.signin.component.html'
})
export class ExternalSignInComponent implements OnInit {
    externalSignInForm: FormGroup;

    constructor(private activatedRoute:ActivatedRoute, private router:Router, private userService: UserService) { }

    ngOnInit(): void {
        // get the return url
        let returnUrl: string | null = null;
        this.activatedRoute.queryParams.subscribe((params: Params) => {
            returnUrl = params.return ? params.return : this.router.url;
        });

        this.externalSignInForm = new FormGroup({
            id: new FormControl(),
            returnUrl: new FormControl(returnUrl)
        });
    }

    setProvider(provider: String): boolean {
        // set the value of the id
        this.externalSignInForm.get("id")!.setValue(provider);

        return true;
    }

    submit($event: Event): void {
        // get the target form
        var form = $event.currentTarget as HTMLFormElement;

        // now submit it
        form.submit();
    }
}