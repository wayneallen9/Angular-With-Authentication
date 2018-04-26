require("bootstrap");

import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";

declare const $: any;

@Directive({
    selector: "[collapse]"
})
export class CollapseDirective implements OnChanges, OnInit {
    constructor(private readonly elementRef: ElementRef) {

    }

    @Input() collapse: boolean;
    private collapsed = true;
    private initialised = false;
    private jqueryElement: any;

    private changeState(collapsed: boolean): void {
        if (collapsed) {
            this.jqueryElement.collapse("hide");
        } else {
            this.jqueryElement.collapse("show");
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.collapse) {
            // save the value
            this.collapsed = changes.collapse.currentValue;

            // don't do anything until the directive is initialised
            if (this.initialised) this.changeState(this.collapsed);
        }
    }

    ngOnInit(): void {
        // initialise the collapse
        this.jqueryElement = $(this.elementRef.nativeElement);
        this.jqueryElement.collapse();

        // set the default state
        this.changeState(this.collapsed);

        // the control is initialised
        this.initialised = true;
    }
}