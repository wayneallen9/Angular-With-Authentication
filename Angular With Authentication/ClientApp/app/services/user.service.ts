import { AuthHttp, JwtHelper } from 'angular2-jwt';
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
    constructor( @Inject(DOCUMENT) private document: any, private authHttp: AuthHttp, private http: Http, @Inject('BASE_URL') private baseUrl: string, @Inject('LOCALSTORAGE') private localStorage: any, @Inject(PLATFORM_ID) private platformId: any) {
        // set the default state for the user
        this.initialise();
    }

    email: string|null;
    isEmailConfirmed = new BehaviorSubject<boolean>(false);
    isExternal = new BehaviorSubject<boolean>(false);
    isSignedIn = new BehaviorSubject<boolean>(false);

    changePassword(model: ChangePasswordModel): Observable<string | null> {
        return this.authHttp.post(`${this.baseUrl}api/Users/ChangePassword`, model).map((response: Response) => {
            return response.ok ? null : response.text();
        });
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
        // has the token expired?
        return this.authHttp.post(`${this.baseUrl}api/Users/GetCurrent`, null).map((response: Response) => {
            return response.text() ? response.json() : null;
        });
    }

    private initialiseFromToken(token: string) {
        // if the token is empty, don't do anything
        if (!token) return;

        const jwtHelper = new JwtHelper();

        try {
            // is the token still valid?
            if (jwtHelper.isTokenExpired(token)) return;

            // the user is signed in
            this.isSignedIn.next(true);

            // extract the claims from the token
            const claims = jwtHelper.decodeToken(token);

            // populate the values from the claims
            this.email = claims.sub;
            this.isEmailConfirmed.next(claims.isemailconfirmed);
            this.isExternal.next(claims.isexternal);
        }
        catch (e) { }
    }

    private initialise(): void {
        // get the token from local storage
        const token = this.localStorage.getItem("token");

        // now initialise the user
        this.initialiseFromToken(token);
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
            // update the token
            this.saveJwtToken(this.getJwtToken(response));

            // set up the current user from the server response
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

    saveJwtToken(token: string) {
        // save the token in localstorage
        this.localStorage.setItem("token", token);

        // populate the user from the token
        this.initialiseFromToken(token);
    }

    signIn(model: SignInUserModel): Observable<UserModel | null> {
        return this.http.post(`${this.baseUrl}api/Users/SignIn`, model).map((response: Response) => {
            // update the user state
            this.saveJwtToken(this.getJwtToken(response));

            // if the sign in is successful, the server will return the user details
            return (response.text()) ? response.json() : null;
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

        // delete the token
        this.localStorage.removeItem("token");
    }
}