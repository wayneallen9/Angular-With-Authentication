import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Response } from '@angular/http';
import { Router } from '@angular/router';
import { UserModel } from '../../models/UserModel';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'signin',
    templateUrl:'./signin.form.component.html'
})
export class SigninFormComponent implements OnInit {
    error = false;
    @Output() signedin = new EventEmitter<UserModel>();
    signInForm: FormGroup;
    submitting = false;
    unknown = false;

    constructor(private changeDetectorRef: ChangeDetectorRef, private userService:UserService) {}
    ngOnInit(): void {
        this.signInForm = new FormGroup({
            email: new FormControl('', [Validators.email, Validators.required]),
            password: new FormControl('', [Validators.required])
        });
    }

    private resetForm(): void {
        this.signInForm.reset();
        this.submitting = false;
        this.unknown = false;
    }

    private resetPassword(): void {
        this.signInForm.get("password")!.setValue("");

        // revalidate
        this.signInForm.updateValueAndValidity();
        this.changeDetectorRef.detectChanges();
    }

    submit(form: FormGroup): void {
        if (form.invalid) return;

        // the form is submitting
        this.error = false;
        this.submitting = true;
        this.unknown = false;

        // try and sign in
        this.userService.signIn({
            email: this.signInForm.get("email")!.value,
            password: this.signInForm.get("password")!.value
        }).subscribe((response: UserModel): void => {
            if (response) {
                // reset the form so it can be used again
                this.resetForm();

                // let the caller know that we have logged in
                this.signedin.emit(response);
            } else {
                // set the flags
                this.submitting = false;
                this.unknown = true;

                // reset the form
                this.resetPassword();
            }
        }, () => {
            // set the flags
            this.error = true;
            this.submitting = false;

            // reset the form
            this.resetPassword();
        });
    }
}