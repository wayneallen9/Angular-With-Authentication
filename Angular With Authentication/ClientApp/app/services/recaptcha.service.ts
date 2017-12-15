import { Inject, Injectable } from '@angular/core';
import { ScriptLoaderService } from './script.loader.service';
import { BehaviorSubject } from 'rxjs';

declare var config: any;

interface IRecaptchaWindow extends Window {
    grecaptcha: any;
    onrecaptchaloaded: () => void;
}

@Injectable()
export class RecaptchaService {
    private loaded = new BehaviorSubject<boolean>(false);
    private recaptchaWindow: IRecaptchaWindow;

    constructor(@Inject(ScriptLoaderService) scriptLoaderService: ScriptLoaderService) {
        // are we running on the client?
        if (typeof window === "undefined") return;

        // save a reference to the current browser window
        this.recaptchaWindow = window as IRecaptchaWindow;

        // add a callback for when Recaptcha is initialised
        this.recaptchaWindow.onrecaptchaloaded = () => {
            // let any observers know that we are ready
            this.loaded.next(true);
        };

        // now load the recaptcha library
        scriptLoaderService.load("https://www.google.com/recaptcha/api.js?onload=onrecaptchaloaded&render=explicit");
    }

    render(element: HTMLDivElement | string, options?:any): BehaviorSubject<number> {
        // create the observable to return
        var behaviorSubject = new BehaviorSubject<number>(0);

        // we must be running on the client
        if (!this.recaptchaWindow) return behaviorSubject;

        // add the public key to the options
        let optionsWithKey = Object.assign({ sitekey: config.recaptchaKey }, options);

        // is Recaptcha initialised?
        if (this.loaded.value) {
            // Recaptcha is initialised, so the element can be rendered immediately
            behaviorSubject.next(this.recaptchaWindow.grecaptcha.render(element, optionsWithKey));
        } else {
            // Recaptcha isn't initialised yet, so we need to wait for it to initialised before rendering
            this.loaded.subscribe((value: boolean) => {
                if (value) behaviorSubject.next(this.recaptchaWindow.grecaptcha.render(element, optionsWithKey));
            });
        }

        return behaviorSubject;
    }

    reset(id:Number): void {
        // we must be running on the client
        if (!this.recaptchaWindow) return;

        // if Recaptcha isn't initialised, there's no need to do anything - because the element can't have been rendered
        if (!this.loaded.value) return;

        this.recaptchaWindow.grecaptcha.reset(id);
    }
}