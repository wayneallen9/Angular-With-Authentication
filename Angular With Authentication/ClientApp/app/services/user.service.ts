import { ChangePasswordModel } from '../models/ChangePasswordModel';
import { Inject, Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { HttpService } from './http.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { NewPasswordModel } from '../models/NewPasswordModel';
import { RegisterUserModel } from '../models/RegisterUserModel';
import { ResendConfirmationEmailModel } from '../models/ResendConfirmationEmailModel';
import { ResetPasswordModel } from '../models/ResetPasswordModel';
import { SignInUserModel } from '../models/SignInUserModel';
import { UserModel } from '../models/UserModel';

@Injectable()
export class UserService {
    constructor(private httpService: HttpService, @Inject('BASE_URL') private baseUrl: string) {
        httpService.claims.subscribe((claims: any | null) => {
            // are there any claims
            if (claims) {
                // populate the values from the claims
                this.email = claims.sub;
                this.isEmailConfirmed.next(claims.isemailconfirmed);
                this.isExternal.next(claims.isexternal);
                this.isSignedIn.next(true);
            } else {
                // reset the values
                this.email = null;
                this.isEmailConfirmed.next(false);
                this.isExternal.next(false);
                this.isSignedIn.next(false);
            }
        });
    }

    email: string|null;
    isEmailConfirmed = new BehaviorSubject<boolean>(false);
    isExternal = new BehaviorSubject<boolean>(false);
    isSignedIn = new BehaviorSubject<boolean>(false);

    changePassword(model: ChangePasswordModel): Observable<string | null> {
        return this.httpService.post(`${this.baseUrl}api/Users/ChangePassword`, model).map((response: Response) => {
            return response.ok ? null : response.text();
        });
    }

    getByEmail(email: string): Observable<UserModel | null> {
        return this.httpService.get(`${this.baseUrl}api/Users/GetByEmail`, {
            params: {
                "email": email
            }
        }).map((response: Response) => {
            // were we able to get?
            return response.ok ? response.json() as UserModel : null;
        });
    }

    getByUserName(email: string): Observable<UserModel | null> {
        return this.httpService.get(`${this.baseUrl}api/Users/GetByUserName`, {
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
        return this.httpService.post(`${this.baseUrl}api/Users/GetCurrent`, null).map((response: Response) => {
            return response.ok ? response.json() : null;
        });
    }

    /*private initialiseFromToken(token: string) {
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
    }*/

    /*private initialise(): void {
        // get the token from local storage
        const token = this.localStorage.getItem("token");

        // now initialise the user
        this.initialiseFromToken(token);
    }*/

    newPassword(model: NewPasswordModel): Observable<boolean> {
        return this.httpService.post(`${this.baseUrl}api/Users/NewPassword`, model).map((response: Response) => {
            // 200 result means update was successful
            return true;
        }, () => {
            // any other result means update was not successful
            return false;
        });
    }

    register(model: RegisterUserModel): Observable<UserModel | null> {
        return this.httpService.post(`${this.baseUrl}api/Users/Register`, model).map((response: Response) => {
            // set up the current user from the server response
            return response.ok ? response.json() : null;
        });
    }

    resendEmailConfirmation(model: ResendConfirmationEmailModel): Observable<boolean> {
        return this.httpService.post(`${this.baseUrl}api/Users/ResendConfirmationEmail`, model).map((response: Response) => {
            return response.ok;
        });
    }

    resetPassword(model: ResetPasswordModel): Observable<Response> {
        return this.httpService.post(`${this.baseUrl}api/Users/ResetPassword`, model);
    }

    signIn(model: SignInUserModel): Observable<UserModel | null> {
        return this.httpService.post(`${this.baseUrl}api/Users/SignIn`, model).map((response: Response) => {
            // if the sign in is successful, the server will return the user details
            return response.ok && response.text() ? response.json() : null;
        });
    }

    signOut(): void {
        // sign the user out on the server
        this.httpService.post(`${this.baseUrl}api/Users/SignOut`, null).subscribe();

        // clear the properties
        this.email = null;
        this.isEmailConfirmed.next(false);
        this.isExternal.next(false);
        this.isSignedIn.next(false);

        // delete the token
        this.httpService.clearToken();
    }
}