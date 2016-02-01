/*global define, require*/
define(["qlik"], function (qlik) {
    'use strict';

    function createElement(tag, cls, html) {
        var el = document.createElement(tag);
        if (cls) {
            el.className = cls;
        }
        if (html !== undefined) {
            el.innerHTML = html;
        }
        return el;
    }

    function setChild(el, ch) {
        if (el.childNodes.length === 0) {
            el.appendChild(ch);
        } else {
            el.replaceChild(ch, el.childNodes[0]);
        }
    }

    function addStyleSheet(href) {
        var link = createElement('link');
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = require.toUrl(href);
        document.head.appendChild(link);
    }

    function createVariable(name) {
        var app = qlik.currApp();
        //from 2.1: check if variable exists
        if (app.variable.getByName) {
            app.variable.getByName(name).then(function () {
                //variable already exist
            }, function () {
                //create variable
                app.variable.create(name);
            });
        } else {
            //create variable - ignore errors
            app.variable.create(name);
        }
    }
    return {
        createElement: createElement,
        setChild: setChild,
        addStyleSheet: addStyleSheet,
        createVariable: createVariable
    };
});
