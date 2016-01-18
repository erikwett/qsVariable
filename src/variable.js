/*global define*/
define(["qlik"], function(qlik) {
    'use strict';

    function addStyleSheet(href) {
        var link = createElement('link');
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = require.toUrl(href);
        document.head.appendChild(link);
    }


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

    function createVariable(name) {
        var app = qlik.currApp();
        //from 2.1: check if variable exists
        if (app.variable.getByName) {
            app.variable.getByName(name).then(function() {
                //variable already exist
            }, function() {
                //create variable
                app.variable.create(name);
            });
        } else {
            //create variable - ignore errors
            app.variable.create(name);
        }
    }

    function calcPercent(el) {
        return (el.value - el.min) * 100 / (el.max - el.min);
    }

    function getClass(style, type, selected) {
        switch (style) {
            case "material":
            case "bootstrap":
                if (selected) {
                    return "selected";
                }
                break;
            default:
                switch (type) {
                    case 'button':
                        return selected ? 'qui-button-selected' : 'qui-button';
                    case 'select':
                        return 'qui-select';
                    case 'input':
                        return 'qui-input';
                }
        }
    }

    function getWidth(layout) {
        if (layout.render === "l") {
            return "98%";
        }
        if (layout.width === "custom") {
            return layout.customwidth;
        }
        if (layout.width === "fill") {
            if (layout.render !== "b") {
                return "100%";
            }
            return "calc( " + 100 / layout.alternatives.length + "% - 3px)";
        }
    }

    addStyleSheet("extensions/variable/variable.css");
    return {
        initialProperties: {
            variableValue: {},
            variableName: "",
            render: "f",
            alternatives: [],
            min: 0,
            max: 100,
            step: 1,
            style: "qlik",
            width: "",
            customwidth: ""
        },
        definition: {
            type: "items",
            component: "accordion",
            items: {
                settings: {
                    uses: "settings",
                    items: {
                        variable: {
                            type: "items",
                            label: "Variable",
                            items: {
                                name: {
                                    ref: "variableName",
                                    label: "Name",
                                    type: "string",
                                    change: function(data) {
                                        createVariable(data.variableName);
                                        data.variableValue = data.variableValue || {};
                                        data.variableValue.qStringExpression = '=' + data.variableName;
                                    }
                                },
                                style: {
                                    type: "string",
                                    component: "dropdown",
                                    label: "Style",
                                    ref: "style",
                                    options: [{
                                        value: "qlik",
                                        label: "Qlik"
                                    }, {
                                        value: "bootstrap",
                                        label: "Bootstrap"
                                    }, {
                                        value: "material",
                                        label: "Material"
                                    }]
                                },
                                width: {
                                    type: "string",
                                    component: "dropdown",
                                    label: "Width",
                                    ref: "width",
                                    options: [{
                                        value: "",
                                        label: "Default"
                                    }, {
                                        value: "fill",
                                        label: "Fill"
                                    }, {
                                        value: "custom",
                                        label: "Custom"
                                    }]
                                },
                                customwidth: {
                                    type: "string",
                                    ref: "customwidth",
                                    label: "Custom width",
                                    expression: "optional",
                                    show: function(data) {
                                        return data.width === "custom";
                                    }
                                },
                                render: {
                                    type: "string",
                                    component: "dropdown",
                                    label: "Render as",
                                    ref: "render",
                                    options: [{
                                        value: "b",
                                        label: "Button"
                                    }, {
                                        value: "s",
                                        label: "Select"
                                    }, {
                                        value: "f",
                                        label: "Field"
                                    }, {
                                        value: "l",
                                        label: "Slider"
                                    }],
                                    defaultValue: "f"
                                },
                                alternatives: {
                                    type: "array",
                                    ref: "alternatives",
                                    label: "Alternatives",
                                    itemTitleRef: "label",
                                    allowAdd: true,
                                    allowRemove: true,
                                    addTranslation: "Add Alternative",
                                    items: {
                                        value: {
                                            type: "string",
                                            ref: "value",
                                            label: "Value",
                                            expression: "optional"
                                        },
                                        label: {
                                            type: "string",
                                            ref: "label",
                                            label: "Label",
                                            expression: "optional"
                                        }
                                    },
                                    show: function(data) {
                                        return data.render === "b" || data.render === "s";
                                    }
                                },
                                min: {
                                    ref: "min",
                                    label: "Min",
                                    type: "number",
                                    defaultValue: 0,
                                    show: function(data) {
                                        return data.render === "l";
                                    }
                                },
                                max: {
                                    ref: "max",
                                    label: "Max",
                                    type: "number",
                                    defaultValue: 100,
                                    show: function(data) {
                                        return data.render === "l";
                                    }
                                },
                                step: {
                                    ref: "step",
                                    label: "Step",
                                    type: "number",
                                    defaultValue: 1,
                                    show: function(data) {
                                        return data.render === "l";
                                    }
                                },
                                rangelabel: {
                                    ref: "rangelabel",
                                    label: "Slider label",
                                    type: "boolean",
                                    defaultValue: false,
                                    show: function(data) {
                                        return data.render === "l";
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        paint: function($element, layout) {
            var wrapper = createElement('div', layout.style || 'qlik'),
                width = getWidth(layout),
                ext = this;
            if (layout.render === 'b') {
                layout.alternatives.forEach(function(alt) {
                    var btn = createElement('button', getClass(layout.style, 'button',
                        alt.value === layout.variableValue), alt.label);
                    btn.onclick = function() {
                        qlik.currApp(ext).variable.setContent(layout.variableName, alt.value);
                    };
                    btn.style.width = width;
                    wrapper.appendChild(btn);
                });
            } else if (layout.render === 's') {
                var sel = createElement('select', getClass(layout.style, 'select'));
                sel.style.width = width;
                layout.alternatives.forEach(function(alt) {
                    var opt = createElement('option', undefined, alt.label);
                    opt.value = alt.value;
                    opt.selected = alt.value === layout.variableValue;
                    sel.appendChild(opt);
                });
                sel.onchange = function() {
                    qlik.currApp(ext).variable.setContent(layout.variableName, this.value);
                }
                wrapper.appendChild(sel);
            } else if (layout.render === 'l') {
                var range = createElement('input');
                range.style.width = width;
                range.type = 'range';
                range.min = layout.min || 0;
                range.max = layout.max || 100;
                range.step = layout.step || 1;
                range.value = layout.variableValue;
                //range.style.width = '98%';
                range.onchange = function() {
                    if (this.label) {
                        this.label.style.left = calcPercent(this) + "%";
                        this.label.textContent = this.value;
                    } else {
                        this.title = this.value;
                    }
                    qlik.currApp(ext).variable.setContent(layout.variableName, this.value);
                }
                range.oninput = function() {
                    if (this.label) {
                        this.label.style.left = calcPercent(this) + "%";
                        this.label.textContent = this.value;
                    } else {
                        this.title = this.value;
                    }
                }
                wrapper.appendChild(range);
                if (layout.rangelabel) {
                    var labelwrap = createElement('div', 'labelwrap');
                    range.label = createElement('div', 'rangelabel', layout.variableValue);
                    range.label.style.left = calcPercent(range) + "%";
                    labelwrap.appendChild(range.label);
                    wrapper.appendChild(labelwrap);
                } else {
                    range.title = layout.variableValue;
                }
            } else {
                var fld = createElement('input', getClass(layout.style, 'input'));
                fld.style.width = width;
                fld.type = 'text';
                fld.value = layout.variableValue;
                fld.onchange = function() {
                    qlik.currApp(ext).variable.setContent(layout.variableName, this.value);
                }
                wrapper.appendChild(fld);
            }
            setChild($element[0], wrapper);
        }
    };

});
