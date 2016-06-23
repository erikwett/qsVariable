/*global define*/
define(["qlik", "./util", "./properties"], function (qlik, util, prop) {
    'use strict';

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
                        return selected ? 'qui-button-selected lui-button lui-button--success' : 'qui-button lui-button';
                    case 'select':
                        return 'qui-select lui-select';
                    case 'input':
                        return 'qui-input lui-input';
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

    util.addStyleSheet("extensions/variable/variable.css");
    return {
        initialProperties: prop.initialProperties,
        definition: prop.definition,
        paint: function ($element, layout) {
            var wrapper = util.createElement('div', layout.style || 'qlik'),
                width = getWidth(layout),
                ext = this;
            if (layout.render === 'b') {
                layout.alternatives.forEach(function (alt) {
                    var btn = util.createElement('button', getClass(layout.style, 'button',
                        alt.value === layout.variableValue), alt.label);
                    btn.onclick = function () {
                        qlik.currApp(ext).variable.setContent(layout.variableName, alt.value);
                    };
                    btn.style.width = width;
                    wrapper.appendChild(btn);
                });
            } else if (layout.render === 's') {
                var sel = util.createElement('select', getClass(layout.style, 'select'));
                sel.style.width = width;
                layout.alternatives.forEach(function (alt) {
                    var opt = util.createElement('option', undefined, alt.label);
                    opt.value = alt.value;
                    opt.selected = alt.value === layout.variableValue;
                    sel.appendChild(opt);
                });
                sel.onchange = function () {
                    qlik.currApp(ext).variable.setContent(layout.variableName, this.value);
                };
                wrapper.appendChild(sel);
            } else if (layout.render === 'l') {
                var range = util.createElement('input');
                range.style.width = width;
                range.type = 'range';
                range.min = layout.min || 0;
                range.max = layout.max || 100;
                range.step = layout.step || 1;
                range.value = layout.variableValue;
                //range.style.width = '98%';
                range.onchange = function () {
                    if (this.label) {
                        this.label.style.left = calcPercent(this) + "%";
                        this.label.textContent = this.value;
                    } else {
                        this.title = this.value;
                    }
                    qlik.currApp(ext).variable.setContent(layout.variableName, this.value);
                };
                range.oninput = function () {
                    if (this.label) {
                        this.label.style.left = calcPercent(this) + "%";
                        this.label.textContent = this.value;
                    } else {
                        this.title = this.value;
                    }
                };
                wrapper.appendChild(range);
                if (layout.rangelabel) {
                    var labelwrap = util.createElement('div', 'labelwrap');
                    range.label = util.createElement('div', 'rangelabel', layout.variableValue);
                    range.label.style.left = calcPercent(range) + "%";
                    labelwrap.appendChild(range.label);
                    wrapper.appendChild(labelwrap);
                } else {
                    range.title = layout.variableValue;
                }
            } else {
                var fld = util.createElement('input', getClass(layout.style, 'input'));
                fld.style.width = width;
                fld.type = 'text';
                fld.value = layout.variableValue;
                fld.onchange = function () {
                    qlik.currApp(ext).variable.setContent(layout.variableName, this.value);
                };
                wrapper.appendChild(fld);
            }
            util.setChild($element[0], wrapper);
        }
    };

});
