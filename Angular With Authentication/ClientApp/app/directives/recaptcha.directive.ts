import { Directive, ElementRef, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { BehaviorSubject } from "rxjs";
import { RecaptchaService } from "../services/recaptcha.service";

@Directive({
    selector: '[recaptcha]'
})
export class RecaptchaDirective implements OnInit {
    private id: number;
    @Output() recaptchaed = new EventEmitter<string>();
    @Input("recaptcha") key: string;

    constructor(private element: ElementRef, private recaptchaService: RecaptchaService) {
    }

    ngOnInit(): void {
        // render the control
        this.recaptchaService.render(this.element.nativeElement, {
            callback: (value: string) => {
                this.recaptchaed.emit(value);
            }
        }).subscribe((value: number) => {
            this.id = value;
        });
    }

    reset(): void {
        this.recaptchaService.reset(this.id);
    }
}