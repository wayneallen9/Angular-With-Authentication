import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RecaptchaDirective } from '../../directives/recaptcha.directive';
import { UserService } from '../../services/user.service';

@Component({
    styleUrls: ['./confirm.component.less'],
    templateUrl: './confirm.component.html'
})
export class ConfirmComponent implements OnInit {
    constructor(private changeDetectorRef: ChangeDetectorRef, private userService: UserService) { }

    confirmForm: FormGroup;
    email: string|null;
    error: string;
    @ViewChild(RecaptchaDirective) recaptchaDirective: RecaptchaDirective;
    submitted = false;
    submitting = false;

    ngOnInit(): void {
        this.confirmForm = new FormGroup({
            email: new FormControl(this.userService.email, [Validators.email, Validators.required]),
            recaptcha: new FormControl("", [Validators.required])
        });
        this.email = this.userService.email;
    }

    recaptchaed(value: string): void {
        this.setRecaptchaValue(value);
    }

    private setRecaptchaValue(value: string): void {
        // get the recaptcha field
        let recaptchaControl = this.confirmForm.get("recaptcha")!;

        // update the value to be posted to the server
        recaptchaControl.setValue(value);

        // revalidate
        this.confirmForm.updateValueAndValidity();

        this.changeDetectorRef.detectChanges();
    }

    submit(confirmForm: FormGroup): void {
        // confirm that the form is valid
        if (confirmForm.invalid) return;

        // the form is being submit
        this.submitted = false;
        this.submitting = true;

        // resend the email
        this.userService.resendEmailConfirmation({
            email: this.confirmForm.get("email")!.value,
            recaptcha: this.confirmForm.get("recaptcha")!.value
        }).subscribe((value: boolean) => {
            // ajax call is completed
            this.submitting = false;

            // was the resend successful?
            if (value) {
                this.submitted = true;
            } else {
                this.error = "Unable to resend confirmation email.  Please retry later."
            }

            // reset recaptcha
            this.setRecaptchaValue("");
            this.recaptchaDirective.reset();
        });
    }
}