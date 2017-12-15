import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
    styleUrls: ['./account.component.less'],
    templateUrl: './account.component.html'
})
export class AccountComponent implements OnInit {
    error = false;
    changed = false;
    changePasswordForm: FormGroup;
    submitting = false;

    constructor(private formBuilder: FormBuilder, private userService:UserService) { }

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
        this.error = false;
        this.submitting = true;

        // now make the change
        this.userService.changePassword({
            newPassword: this.changePasswordForm.get("passwords")!.get("newPassword")!.value,
            oldPassword: this.changePasswordForm.get("oldPassword")!.value
        }).subscribe((response: string | null) => {
            if (response) {
                this.error = true;
            } else {
                this.changed = true;
            }

            // reset the form
            this.changePasswordForm.reset();
            this.submitting = false;
        }, error => {
            this.error = true;

            // reset the form
            this.changePasswordForm.reset();
            this.submitting = false;
        })
    }

    private validatePasswordConfirmation(control: AbstractControl): { [key: string]: boolean } | null {
        return control.get('newPassword')!.value === control.get('confirm')!.value ? null : { nomatch: true };
    }
}