import { ActivatedRoute, Params, RoutesRecognized, Router } from '@angular/router';
import { AuthHttp, JwtHelper } from 'angular2-jwt';
import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable  } from 'rxjs';
import { RequestOptionsArgs, Response } from '@angular/http';

@Injectable()
export class HttpService {
    claims = new BehaviorSubject<any | null>(null);
    private initialiseClaims = true;

    constructor(activatedRoute: ActivatedRoute, private authHttp: AuthHttp, @Inject('LOCALSTORAGE') private localStorage: any) {
        activatedRoute.queryParams.subscribe((params: Params) => {
            // is there a token in the query parameters
            const token = params.token;
            if (!token) return;

            // save the token
            this.localStorage.setItem("token", token);

            // update the claims
            this.updateClaims(); 
        });

        // set the default value for the claim
        this.updateClaims();
    }

    clearToken() {
        // remove the token from storage
        this.localStorage.removeItem("token");

        // clear the claims
        this.claims.next(null);
    }

    get(url: string, options?: RequestOptionsArgs | undefined): Observable<Response> {
        return this.authHttp.get(url, options).map((response: Response) => {
            // check for a token in the response
            if (response.ok) this.setToken(response);

            return response;
        });
    }

    hasToken(): boolean {
        const token = this.localStorage.getItem("token");
        if (!token) return true;

        var jwtHelper = new JwtHelper();
        return !jwtHelper.isTokenExpired(token);
    }

    post(url:string, body:any, options?: RequestOptionsArgs | undefined): Observable<Response> {
        return this.authHttp.post(url, body, options).map((response: Response) => {
            // check for a token in the response
            if (response.ok) this.setToken(response);

            return response;
        });
    }

    private setToken(response:Response): void {
        // was the token passed as a Http header?
        const token = response.headers!.get("X-jwt");
        if (!token) return;

        // save the token to local storage
        this.localStorage.setItem("token", token);

        // update the claims
        this.updateClaims();
    }

    private updateClaims(): void {
        // get the token from local storage
        const token = this.localStorage.getItem("token");
        if (!token) {
            // clear the claims
            this.claims.next(null);

            return;
        }

        // has the token expired?
        var jwtHelper = new JwtHelper();
        if (jwtHelper.isTokenExpired(token)) {
            // clear the claims
            this.claims.next(null);

            return;
        }

        // extract the claims
        this.claims.next(jwtHelper.decodeToken(token!));
    }
}