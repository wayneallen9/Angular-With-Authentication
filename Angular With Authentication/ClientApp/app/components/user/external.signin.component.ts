import { ActivatedRoute, Params, Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'external',
    templateUrl: './external.signin.component.html'
})
export class ExternalSignInComponent implements OnInit {
    externalSignInForm: FormGroup;
    @Input() returnUrl: string;

    constructor(private activatedRoute:ActivatedRoute, private router:Router, private userService: UserService) { }

    ngOnInit(): void {
        this.externalSignInForm = new FormGroup({
            id: new FormControl(),
            returnUrl: new FormControl(this.returnUrl)
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