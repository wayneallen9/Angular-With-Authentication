import { ComponentCanDeactivate } from '../../services/pendingchanges.guard.service';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { Observable } from 'rxjs';
import { RecaptchaDirective } from '../../directives/recaptcha.directive';
import { UserService } from '../../services/user.service';
import { UserModel } from '../../models/UserModel';

@Component({
    templateUrl:'./new.password.component.html'
})
export class NewPasswordComponent implements ComponentCanDeactivate, OnInit {
    changed = false;
    error: string | null;
    @ViewChild(RecaptchaDirective) recaptchaDirective: RecaptchaDirective;
    newPasswordForm: FormGroup;
    submitting = false;
    token: string;
    userId: string;

    constructor(private activatedRoute: ActivatedRoute, private changeDetectorRef: ChangeDetectorRef, private formBuilder: FormBuilder, private userService: UserService) { }

    canDeactivate(): boolean | Observable<boolean> {
        return !this.newPasswordForm.dirty;
    }

    ngOnInit() {
        this.newPasswordForm = new FormGroup({
            passwords: this.formBuilder.group({
                password: ['', [Validators.maxLength(24), Validators.minLength(6), Validators.required]],
                confirm: ['', Validators.required]
            }, { validator: this.validatePasswordConfirmation }),
            recaptcha: new FormControl('', Validators.required)
        });

        this.activatedRoute.queryParams.subscribe((params: Params) => {
            this.token = params.token;
            this.userId = params.userId;
        });
    }

    recaptchaed(value: string): void {
        this.setRecaptchaValue(value);
    }

    private setRecaptchaValue(value: string): void {
        // get the recaptcha field
        let recaptchaControl = this.newPasswordForm.get("recaptcha")!;

        // update the value to be posted to the server
        recaptchaControl.setValue(value);

        // revalidate
        this.newPasswordForm.updateValueAndValidity();
        this.changeDetectorRef.detectChanges();
    }

    private resetForm(): void {
        this.newPasswordForm.get("passwords")!.get("password")!.setValue("");
        this.newPasswordForm.get("passwords")!.get("confirm")!.setValue("");
        this.submitting = false;
        this.setRecaptchaValue("");
        this.recaptchaDirective.reset();
    }

    submit(form: FormGroup) {
        // is the form valid?
        if (form.invalid) return;

        // show that the form is being submitted
        this.error = "";
        this.submitting = true;

        // submit to the server
        this.userService.newPassword({
            password: form.get("passwords")!.get("password")!.value,
            recaptcha: form.get("recaptcha")!.value,
            token: this.token,
            userId: this.userId
        }).subscribe((value: boolean) => {
            // reset the form so it can be submitted again
            form.reset();

            // reset recaptcha
            this.recaptchaDirective.reset();

            // set the flags
            this.changed = true;
            this.submitting = false;
        }, (error: any) => {
            // show the error message
            this.error = error.text();

            // reset the form so it can be submitted again
            form.reset();

            // reset recaptcha
            this.recaptchaDirective.reset();

            // the form has been submitted
            this.submitting = false;
        });
    }

    private validatePasswordConfirmation(control: AbstractControl): { [key: string]: boolean } | null {
        return control.get('password')!.value === control.get('confirm')!.value ? null : { nomatch: true };
    }}