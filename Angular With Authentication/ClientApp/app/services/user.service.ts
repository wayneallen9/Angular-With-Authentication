import { ChangePasswordModel } from '../models/ChangePasswordModel';
import { DOCUMENT } from '@angular/platform-browser';
import { Inject, Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { NewPasswordModel } from '../models/NewPasswordModel';
import { RegisterUserModel } from '../models/RegisterUserModel';
import { ResendConfirmationEmailModel } from '../models/ResendConfirmationEmailModel';
import { ResetPasswordModel } from '../models/ResetPasswordModel';
import { SignInUserModel } from '../models/SignInUserModel';
import { UserModel } from '../models/UserModel';

@Injectable()
export class UserService {
    constructor(@Inject(DOCUMENT) private document:any, private http: Http, @Inject('BASE_URL') private baseUrl: string) {}

    email: string|null;
    isEmailConfirmed = new BehaviorSubject<boolean>(false);
    isExternal = new BehaviorSubject<boolean>(false);
    isSignedIn = new BehaviorSubject<boolean>(false);

    changePassword(model: ChangePasswordModel): Observable<string | null> {
        return this.http.post(`${this.baseUrl}api/Users/ChangePassword`, model).map((response: Response) => {
            return response.ok ? null : response.text();
        });
    }

    external(token: string): Observable<UserModel> {
        // save the token
        this.saveJwtToken(token);

        // now request the user details
        return this.http.post(`${this.baseUrl}api/Users/GetCurrent`, null).map((response: Response) => {
            // get the user details
            var user = response.json() as UserModel;

            // set the service properties
            this.email = user.email;
            this.isEmailConfirmed.next(true);
            this.isExternal.next(true);
            this.isSignedIn.next(true);

            return user;
        });
    }

    get(email: string): Observable<UserModel | null> {
        return this.http.get(`${this.baseUrl}api/Users/GetByEmail`, {
            params: {
                "email": email
            }
        }).map((response: Response) => {
            // were we able to get?
            return response.ok ? response.json() as UserModel : null;
        });
    }

    newPassword(model: NewPasswordModel): Observable<boolean> {
        return this.http.post(`${this.baseUrl}api/Users/NewPassword`, model).map((response: Response) => {
            // update the JWT token from the response
            this.saveJwtToken(this.getJwtToken(response));

            // 200 result means update was successful
            return true;
        }, () => {
            // any other result means update was not successful
            return false;
        });
    }

    register(model: RegisterUserModel): Observable<UserModel> {
        return this.http.post(`${this.baseUrl}api/Users/Register`, model).map((response: Response) => {
            // get the user details
            const user = response.json() as UserModel;

            // set the service properties
            this.email = user.email;
            this.isEmailConfirmed.next(false);
            this.isSignedIn.next(true);

            return response.json();
        });
    }

    resendEmailConfirmation(model: ResendConfirmationEmailModel): Observable<boolean> {
        return this.http.post(`${this.baseUrl}api/Users/ResendConfirmationEmail`, model).map((response: Response) => {
            return response.ok;
        });
    }

    resetPassword(model: ResetPasswordModel): Observable<Response> {
        return this.http.post(`${this.baseUrl}api/Users/ResetPassword`, model);
    }

    private getJwtToken(response: Response) {
        return response.headers!.get("X-jwt")!;
    }

    private saveJwtToken(token:string) {
        // save the token in local storage
        localStorage.setItem("token", token);
    }

    signIn(model: SignInUserModel): Observable<UserModel | null> {
        return this.http.post(`${this.baseUrl}api/Users/SignIn`, model).map((response: Response) => {
            // if the sign in is successful, the server will return the user details
            if (response.text()) {
                // get the user details
                var user = response.json() as UserModel;

                // the response content is null if it was an invalid email/password combination
                if (user) {
                    this.saveJwtToken(this.getJwtToken(response));

                    this.email = user.email;
                    this.isEmailConfirmed.next(user.emailConfirmed);
                    this.isSignedIn.next(true);
                }

                return user;
            }

            return null;
        });
    }

    signOut(): void {
        // sign the user out on the server
        this.http.post(`${this.baseUrl}api/Users/SignOut`, null).subscribe();

        // clear the properties
        this.email = null;
        this.isEmailConfirmed.next(false);
        this.isExternal.next(false);
        this.isSignedIn.next(false);

        // delete the token
        localStorage.removeItem("token");
    }
}