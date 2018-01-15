import { AuthHttp, tokenNotExpired } from 'angular2-jwt';
import { ChangePasswordModel } from '../models/ChangePasswordModel';
import { DOCUMENT } from '@angular/platform-browser';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Headers, Http, RequestOptionsArgs, Response } from '@angular/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { NewPasswordModel } from '../models/NewPasswordModel';
import { RegisterUserModel } from '../models/RegisterUserModel';
import { ResendConfirmationEmailModel } from '../models/ResendConfirmationEmailModel';
import { ResetPasswordModel } from '../models/ResetPasswordModel';
import { SignInUserModel } from '../models/SignInUserModel';
import { UserModel } from '../models/UserModel';

@Injectable()
export class UserService {
    constructor(@Inject(DOCUMENT) private document:any, private authHttp: AuthHttp, private http:Http, @Inject('BASE_URL') private baseUrl: string, @Inject('LOCALSTORAGE') private localStorage:any, @Inject(PLATFORM_ID) private platformId: any) {}

    email: string|null;
    isEmailConfirmed = new BehaviorSubject<boolean>(false);
    isExternal = new BehaviorSubject<boolean>(false);
    isSignedIn = new BehaviorSubject<boolean>(false);

    changePassword(model: ChangePasswordModel): Observable<string | null> {
        return this.authHttp.post(`${this.baseUrl}api/Users/ChangePassword`, model).map((response: Response) => {
            return response.ok ? null : response.text();
        });
    }

    external(token: string): Observable<UserModel | null> {
        // save the token
        this.saveJwtToken(token);

        // now request the user details
        return this.getCurrent();
    }

    getByEmail(email: string): Observable<UserModel | null> {
        return this.http.get(`${this.baseUrl}api/Users/GetByEmail`, {
            params: {
                "email": email
            }
        }).map((response: Response) => {
            // were we able to get?
            return response.ok ? response.json() as UserModel : null;
        });
    }

    getByUserName(email: string): Observable<UserModel | null> {
        return this.http.get(`${this.baseUrl}api/Users/GetByUserName`, {
            params: {
                "email": email
            }
        }).map((response: Response) => {
            // were we able to get?
            return response.ok ? response.json() as UserModel : null;
        });
    }

    getCurrent(): Observable<UserModel | null> {
        // if the token has expired, return null
        if (!tokenNotExpired()) return new BehaviorSubject<UserModel | null>(null);

        // has the token expired?
        return this.authHttp.post(`${this.baseUrl}api/Users/GetCurrent`, null).map((response: Response) => {
            return this.setUpCurrentUser(response);
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

    register(model: RegisterUserModel): Observable<UserModel | null> {
        return this.http.post(`${this.baseUrl}api/Users/Register`, model).map((response: Response) => {
            // set up the current user from the server response
            return this.setUpCurrentUser(response);
        });
    }

    private setUpCurrentUser(response: Response): UserModel | null {
        // was a response returned?
        if (response.text()) {
            // get the user details
            const user = response.json() as UserModel;

            // set the service properties
            this.email = user.email;
            this.isEmailConfirmed.next(user.emailConfirmed);
            this.isExternal.next(user.isExternal);
            this.isSignedIn.next(true);

            return user;
        } else {
            this.email = null;
            this.isEmailConfirmed.next(false);
            this.isExternal.next(false);
            this.isSignedIn.next(false);

            return null;
        }
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

    saveJwtToken(token: string) {
        // only do token management on the browser
        if (isPlatformBrowser(this.platformId)) {
            // save the token in local storage
            this.localStorage.setItem("token", token);
        }
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
        this.authHttp.post(`${this.baseUrl}api/Users/SignOut`, null).subscribe();

        // clear the properties
        this.email = null;
        this.isEmailConfirmed.next(false);
        this.isExternal.next(false);
        this.isSignedIn.next(false);

        // only do token management on the browser
        if (isPlatformBrowser(this.platformId)) {
            // delete the token
            this.localStorage.removeItem("token");
        }
    }
}