import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { ComponentCanDeactivate } from '../../services/pendingchanges.guard.service';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { RecaptchaDirective } from '../../directives/recaptcha.directive';
import { UserService } from '../../services/user.service';
import { UserModel } from '../../models/UserModel';

@Component({
    selector: 'register',
    templateUrl: './register.component.html'
})
export class RegisterComponent implements ComponentCanDeactivate, OnInit {
    error: string | null;
    @ViewChild(RecaptchaDirective) recaptchaDirective:RecaptchaDirective;
    registerForm: FormGroup;
    submitting = false;

    constructor(private changeDetectorRef:ChangeDetectorRef, private formBuilder: FormBuilder, private router:Router, private userService:UserService) { }

    canDeactivate(): boolean | Observable<boolean> {
        return !this.registerForm.dirty;
    }

    ngOnInit() {
        this.registerForm = new FormGroup({
            email: new FormControl('', [Validators.email, Validators.required], this.validateEmailUnique.bind(this)),
            passwords: this.formBuilder.group({
                password: ['', [Validators.maxLength(24), Validators.minLength(6), Validators.required]],    
                confirm: ['', Validators.required]
            }, { validator: this.validatePasswordConfirmation }),
            recaptcha: new FormControl('', Validators.required)
        });
    }

    recaptchaed(value: string):void {
        this.setRecaptchaValue(value);
    }

    private setRecaptchaValue(value: string): void {
        // get the recaptcha field
        let recaptchaControl = this.registerForm.get("recaptcha")!;

        // update the value to be posted to the server
        recaptchaControl.setValue(value);

        // revalidate
        this.registerForm.updateValueAndValidity();

        this.changeDetectorRef.detectChanges();
    }

    private resetForm(): void {
        this.registerForm.reset();
        this.submitting = false;
        this.setRecaptchaValue("");
        this.recaptchaDirective.reset();
    }

    submit(form: FormGroup) {
        // is the form valid?
        if (form.invalid) return;

        // show that the form is being submitted
        this.submitting = true;

        // submit to the server
        this.userService.register({
            email: form.get("email")!.value,
            password: form.get("passwords")!.get("password")!.value,
            recaptcha: form.get("recaptcha")!.value
        }).subscribe((user:UserModel) => {
            // reset the form so it can be submitted again
            this.resetForm();

            // show the confirmation screen
            this.router.navigateByUrl("/confirm");
        }, (error:any) => {
            // show the error message
            this.error = "An unexpected error occurred.  Please try again later.";

            // reset Recaptcha so it can be submitted again
            this.setRecaptchaValue("");
            this.recaptchaDirective.reset();

            // the form has been submitted
            this.submitting = false;
        });
    }

    private validateEmailUnique(control: AbstractControl) {
        return this.userService.getByUserName(control.value).map((response) => {
            return response ? { emailNotUnique: true } : null;
        });
    }

    private validatePasswordConfirmation(control: AbstractControl): { [key: string]: boolean } | null {
        return control.get('password')!.value === control.get('confirm')!.value ? null : { nomatch: true };
    }
}