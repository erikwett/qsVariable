/*global define*/
define(["qlik"], function(qlik) {
    'use strict';
    var BTN_SELECTED = 'qui-button-selected',
        BTN = 'qui-button',
        SELECT = 'qui-select',
        INPUT = 'qui-input';

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
    return {
        initialProperties: {
            variableValue: {},
            variableName: "",
            render: "f",
            alternatives: []
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
                                        data.variableValue.qStringExpression = '=' + data.variableName;
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
                                            label: "Value"
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
                                }
                            }
                        }
                    }
                }
            }
        },
        paint: function($element, layout) {
            var wrapper = createElement('div'),
                ext = this;
            if (layout.render === 'b') {
                layout.alternatives.forEach(function(alt) {
                    var clazz = alt.value === layout.variableValue ? BTN_SELECTED : BTN;
                    var btn = createElement('button', clazz, alt.label);
                    btn.onclick = function() {
                        qlik.currApp(ext).variable.setContent(layout.variableName, alt.value);
                    }
                    wrapper.appendChild(btn);
                });
            } else if (layout.render === 's') {
                var sel = createElement('select', SELECT);
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
                range.type = 'range';
                range.min = layout.min || 0;
                range.max = layout.max || 100;
                range.step = layout.step || 1;
                range.value = layout.variableValue;
                range.title = layout.variableValue;
                range.style.width = '98%';
                range.onchange = function() {
                    qlik.currApp(ext).variable.setContent(layout.variableName, this.value);
                }
                wrapper.appendChild(range);
            } else {
                var fld = createElement('input', INPUT);
                fld.type = 'text';
                fld.value = layout.variableValue;
                fld.onchange = function() {
                    qlik.currApp(ext).variable.setContent(layout.variableName, this.value);
                }
                wrapper.appendChild(fld);
            }
            var elem = $element[0];
            if (elem.childNodes.length === 0) {
                elem.appendChild(wrapper);
            } else {
                elem.replaceChild(wrapper, elem.childNodes[0]);
            }
        }
    };

});