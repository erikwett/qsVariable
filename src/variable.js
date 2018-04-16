/*global define*/
define(['qlik', './util', './properties', './tiny-date-picker', './style'], function (qlik, util, prop, TinyDatePicker) {
	'use strict';

	function calcPercent(el) {
		return (el.value - el.min) * 100 / (el.max - el.min);
	}

	function setVariableValue(ext, name, value) {
		var app = qlik.currApp(ext);
		// work-around for Qlik Sense 3.2 Bug:
		// currApp with param returns invalid app object
		//enable if you are using 3.2 and extension does not work
		//if (app.model.constructor.name !== 'App') {
		//	app = qlik.currApp();
		//}
		app.variable.setContent(name, value);
	}

	function getClass(style, type, selected) {
		switch (style) {
			case 'material':
			case 'bootstrap':
				if (selected) {
					return 'selected';
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
		if (layout.render === 'l') {
			return '98%';
		}
		if (layout.width === 'custom') {
			return layout.customwidth;
		}
		if (layout.width === 'fill') {
			if (layout.render !== 'b') {
				return '100%';
			}
			return 'calc( ' + 100 / layout.alternatives.length + '% - 3px)';
		}
	}

	function setLabel(slider, vert) {
		if (slider.label) {
			if (vert) {
				slider.label.style.bottom = calcPercent(slider) + '%';
			} else {
				slider.label.style.left = calcPercent(slider) + '%';
			}
			slider.label.textContent = slider.value;
		} else {
			slider.title = slider.value;
		}
	}

	function getAlternatives(text) {
		return text.split('|').map(function (item) {
			var arr = item.split('~');
			return {
				value: arr[0],
				label: arr.length > 1 ? arr[1] : arr[0]
			};
		});
	}

	function showValue(element, layout) {
		// find elements
		var elements = element.querySelectorAll('input, button, option');

		for (var index = 0; index < elements.length; index++) {
			var el = elements[index];
			switch (el.tagName) {
				case 'INPUT':
					el.value = layout.variableValue;
					setLabel(el, layout.vert);
					break;
				case 'OPTION':
					el.selected = (el.value === layout.variableValue);
					break;
				case 'BUTTON':
					el.className = getClass(layout.style, 'button', el.dataset.value === layout.variableValue);
					break;
				default:
					console.log('showValue', el);
			}
		}
	}
	return {
		initialProperties: prop.initialProperties,
		definition: prop.definition,
		support: prop.support,
		paint: function ($element, layout) {
			if (layout.thinHeader) {
				$element.closest('.qv-object-variable').addClass('thin-header');
			} else {
				$element.closest('.qv-object-variable').removeClass('thin-header');
			}
			if (this.oldSetup && !this.oldSetup.changed(layout)) {
				showValue($element[0], layout);
				return qlik.Promise.resolve();
			}
			this.oldSetup = prop.cloneSetup(layout);
			var wrapper = util.createElement('div', layout.style || 'qlik'),
				width = getWidth(layout),
				alternatives = layout.valueType === 'd' ? getAlternatives(layout.dynamicvalues) : layout.alternatives,
				ext = this;
			if (layout.vert) {
				wrapper.classList.add('vert');
			}
			if (layout.render === 'b') {
				alternatives.forEach(function (alt) {
					var btn = util.createElement('button', getClass(layout.style, 'button',
						alt.value === layout.variableValue), alt.label);
					btn.onclick = function () {
						setVariableValue(ext, layout.variableName, alt.value);
					};
					btn.dataset.value = alt.value;
					btn.style.width = width;
					wrapper.appendChild(btn);
				});
			} else if (layout.render === 's') {
				var sel = util.createElement('select', getClass(layout.style, 'select'));
				sel.style.width = width;
				alternatives.forEach(function (alt) {
					var opt = util.createElement('option', undefined, alt.label);
					opt.value = alt.value;
					opt.selected = alt.value === layout.variableValue;
					sel.appendChild(opt);
				});
				sel.onchange = function () {
					setVariableValue(ext, layout.variableName, this.value);
				};
				wrapper.appendChild(sel);
			} else if (layout.render === 'l') {
				var range = util.createElement('input');
				if (layout.vert) {
					range.style.width = $element.height() + 'px';
					range.style.left = '-' + (($element.height() - $element.width()) / 2) + 'px';
				} else {
					range.style.width = width;
				}
				range.type = 'range';
				range.min = layout.min || 0;
				range.max = layout.max || 100;
				range.step = layout.step || 1;
				range.value = layout.variableValue;
				//range.style.width = '98%';
				range.onchange = function () {
					setLabel(this, layout.vert);
					setVariableValue(ext, layout.variableName, this.value);
				};
				range.oninput = function () {
					setLabel(this, layout.vert);
					if (layout.updateondrag) {
						setVariableValue(ext, layout.variableName, this.value);
					}
				};
				wrapper.appendChild(range);
				if (layout.rangelabel) {
					var labelwrap = util.createElement('div', 'labelwrap');
					range.label = util.createElement('div', 'rangelabel', layout.variableValue);
					labelwrap.appendChild(range.label);
					wrapper.appendChild(labelwrap);
				}
				setLabel(range, layout.vert);
			} else if (layout.render === 'p') {
				/* Date picker */
				var fld = util.createElement('input', getClass(layout.style, 'input'));
				fld.style.width = width;
				fld.type = 'text';
				fld.value = layout.variableValue;
				fld.onchange = function () {
					setVariableValue(ext, layout.variableName, this.value);
				};
				wrapper.appendChild(fld);
				TinyDatePicker(fld);
			} else {
				var fld = util.createElement('input', getClass(layout.style, 'input'));
				fld.style.width = width;
				fld.type = 'text';
				fld.value = layout.variableValue;
				fld.onchange = function () {
					setVariableValue(ext, layout.variableName, this.value);
				};
				wrapper.appendChild(fld);
			}
			util.setChild($element[0], wrapper);
			return qlik.Promise.resolve();
		}
	};

});
