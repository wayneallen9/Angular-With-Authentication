import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RecaptchaDirective } from '../../directives/recaptcha.directive';
import { Response } from '@angular/http';
import { UserService } from '../../services/user.service';

@Component({
    styleUrls: ['./forgot.component.less'],
    templateUrl: './forgot.component.html'
})
export class ForgotComponent implements OnInit {
    error: string;
    forgotForm: FormGroup;
    @ViewChild(RecaptchaDirective) recaptchaDirective: RecaptchaDirective;
    resent = false;
    submitting = false;

    constructor(private changeDetectorRef: ChangeDetectorRef, private userService:UserService) { }

    ngOnInit(): void {
        this.forgotForm = new FormGroup({
            email: new FormControl('', [Validators.email, Validators.required]),
            recaptcha: new FormControl('', Validators.required)
        });  
    }

    recaptchaed(value: string): void {
        this.setRecaptchaValue(value);
    }

    private setRecaptchaValue(value: string): void {
        // get the recaptcha field
        let recaptchaControl = this.forgotForm.get("recaptcha")!;

        // update the value to be posted to the server
        recaptchaControl.setValue(value);

        // revalidate
        this.forgotForm.updateValueAndValidity();

        this.changeDetectorRef.detectChanges();
    }

    submit(form: FormGroup): void {
        if (form.invalid) return;

        // set the flags
        this.error = "";
        this.resent = false;
        this.submitting = true;

        // send the request to the server
        this.userService.resetPassword({
            email: this.forgotForm.get("email")!.value,
            recaptcha: this.forgotForm.get("recaptcha")!.value
        }).subscribe((response: Response) => {
            // reset the form
            this.forgotForm.reset();

            // reset the recaptcha
            this.recaptchaDirective.reset();

            // set the flags
            this.resent = true;
            this.submitting = false;
        }, () => {
            // reset the form
            this.forgotForm.reset();

            // reset the recaptcha
            this.recaptchaDirective.reset();

            // show the error
            this.error = "Unable to reset your password.  Please retry later."

            // set the flags
            this.submitting = false;
        });
    }
}