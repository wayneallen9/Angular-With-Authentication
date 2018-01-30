import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from '../services/user.service';
import { Observable } from 'rxjs';

@Injectable()
export class SignedInGuardService implements CanActivate {
    constructor(private userService: UserService, private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> | Promise<boolean> {
        if (!this.userService.isSignedIn.value) {
            this.router.navigate(['/unauthorised'], {
                queryParams: {
                    returnUrl: state.url
                }
            });
        }
        else if (!this.userService.isEmailConfirmed.value) {
            this.router.navigate(['/confirm'], {
                queryParams: {
                    return: state.url
                }
            });
        }

        return true;
    }
}