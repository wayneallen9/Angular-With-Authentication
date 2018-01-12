import { Component, OnInit } from '@angular/core';
import { ComponentCanDeactivate } from '../../services/pendingchanges.guard.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { UserService } from '../../services/user.service';

@Component({
    styleUrls: ['./account.component.less'],
    templateUrl: './account.component.html'
})
export class AccountComponent implements ComponentCanDeactivate, OnInit {
    error: string | null;
    changed = false;
    changePasswordForm: FormGroup;
    submitting = false;

    constructor(private formBuilder: FormBuilder, private userService:UserService) { }

    canDeactivate(): boolean | Observable<boolean> {
        return !this.changePasswordForm.dirty;
    }

    currentPasswordHasError(): boolean {
        return this.changePasswordForm.get('oldPassword')!.invalid && this.changePasswordForm.get('oldPassword')!.dirty;
    }

    ngOnInit(): void {
        this.changePasswordForm = new FormGroup({
            oldPassword: new FormControl('', [Validators.maxLength(24), Validators.minLength(6), Validators.required]),
            passwords: this.formBuilder.group({
                newPassword: ['', [Validators.maxLength(24), Validators.minLength(6), Validators.required]],
                confirm: ['', Validators.required]
            }, { validator: this.validatePasswordConfirmation }),
        });
    }

    submit(form: FormGroup): void {
        // is the form ok?
        if (form.invalid) return;

        // set the flags
        this.changed = false;
        this.error = null;
        this.submitting = true;

        // now make the change
        this.userService.changePassword({
            newPassword: this.changePasswordForm.get("passwords")!.get("newPassword")!.value,
            oldPassword: this.changePasswordForm.get("oldPassword")!.value
        }).subscribe((response: string | null) => {
            if (response) {
                this.error = "An unexpected error occurred.  Please try again later.";
            } else {
                this.changed = true;
            }

            // reset the form
            this.changePasswordForm.reset();
            this.submitting = false;
        }, (error: Response) => {
            if (error.status === 400) {
                this.error = "Current password incorrect.";
            } else {
                this.error = "An unexpected error occurred.  Please try again later.";
            }

            // reset the form
            this.changePasswordForm.reset();
            this.submitting = false;
        })
    }

    private validatePasswordConfirmation(control: AbstractControl): { [key: string]: boolean } | null {
        return control.get('newPassword')!.value === control.get('confirm')!.value ? null : { nomatch: true };
    }
}