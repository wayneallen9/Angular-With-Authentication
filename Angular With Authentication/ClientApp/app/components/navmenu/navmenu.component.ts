import { Component, Output, EventEmitter, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
    selector: 'nav-menu',
    templateUrl: './navmenu.component.html',
    styleUrls: ['./navmenu.component.css']
})
export class NavMenuComponent {
    isCollapsed = true;
    isExternal = false;
    isSignedIn = false;
    @Output() showSignIn = new EventEmitter();

    constructor(private userService: UserService, private router: Router) {
        userService.isExternal.subscribe((value: boolean) => {
            this.isExternal = value;
        });

        userService.isSignedIn.subscribe((value: boolean) => {
            this.isSignedIn = value;
        });
    }

    @HostListener('document:click')
    click():void {
        this.isCollapsed = true;
    }

    signIn($event: Event):boolean {
        $event.preventDefault();

        this.showSignIn.emit();

        return false;
    }

    signOut($event:Event): boolean {
        $event.preventDefault();

        // sign the user out
        this.userService.signOut();

        // return to the home page
        this.router.navigate(["home"]);

        return false;
    }

    toggle($event: Event): boolean {
        // prevent propogation
        $event.preventDefault();
        $event.stopPropagation();

        // toggle the state
        this.isCollapsed = !this.isCollapsed;

        return false;
    }
}
