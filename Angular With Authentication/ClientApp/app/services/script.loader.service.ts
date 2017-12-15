import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface IHTMLScriptElement extends HTMLScriptElement {
    onreadystatechange: null | (() => void);
    readyState: string;
}

@Injectable()
export class ScriptLoaderService {
    load(url: string): BehaviorSubject<boolean> {
        var behaviorSubject = new BehaviorSubject<boolean>(false);

        // only run in the browser
        if (typeof document === "undefined") return behaviorSubject;

        // add the script to the page
        var script = document.createElement("script") as IHTMLScriptElement;
        script.type = "text/javascript";

        if (script.readyState) {  //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" ||
                    script.readyState == "complete") {
                    script.onreadystatechange = null;
                    behaviorSubject.next(true);
                }
            };
        } else {  //Others
            script.onload = function () {
                behaviorSubject.next(true);
            };
        }

        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);

        return behaviorSubject;
    }
}