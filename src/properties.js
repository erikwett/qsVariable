/*global define*/
define(['qlik', './moment-with-locales'], function (qlik, moment) {
	'use strict';
	var variableList, variableListPromise;

	function getPromise() {
		if (!variableListPromise) {
			variableListPromise = qlik.currApp().createGenericObject({
				qVariableListDef: {
					qType: 'variable'
				}
			}).then(function (reply) {
				variableList = reply.layout.qVariableList.qItems.map(function (item) {
					return {
						value: item.qName,
						label: item.qName
					};
				});
				return variableList;
			});
		}
		return variableListPromise;
	}

	function stringify(layout) {
		return JSON.stringify([layout.variableName,
			layout.render,
			layout.valueType,
			layout.alternatives,
			layout.dynamicvalues,
			layout.min,
			layout.max,
			layout.step,
			layout.style,
			layout.width,
			layout.customwidth,
			layout.vert,
			layout.updateondrag
		]);
	}

	function cloneSetup(layout) {
		var clone = stringify(layout);
		return {
			changed: function (layout) {
				return stringify(layout) !== clone;
			}
		};
	}
	return {
		cloneSetup: cloneSetup,
		initialProperties: {
			variableValue: {},
			variableName: '',
			render: 'f',
			valueType: 'x',
			alternatives: [],
			dynamicvalues: '',
			min: 0,
			max: 100,
			step: 1,
			style: 'qlik',
			width: '',
			mlocale: 'en',
			customwidth: '',
			updateondrag: false
		},
		definition: {
			type: 'items',
			component: 'accordion',
			items: {
				settings: {
					uses: 'settings',
					items: {
						variable: {
							type: 'items',
							label: 'Variable',
							items: {
								name: {
									ref: 'variableName',
									label: 'Name',
									type: 'string',
									component: 'dropdown',
									options: function () {
										if (variableList) {
											return variableList;
										}
										return getPromise();
									},
									change: function (data) {
										data.variableValue = data.variableValue || {};
										data.variableValue.qStringExpression = '="' + data.variableName + '"';
									}
								},
								render: {
									type: 'string',
									component: 'dropdown',
									label: 'Show as',
									ref: 'render',
									options: [{
										value: 'b',
										label: 'Buttons'
									}, {
										value: 's',
										label: 'Drop down'
									}, {
										value: 'f',
										label: 'Input Field'
									}, {
										value: 'p',
										label: 'Date Picker'
									}, {
										value: 'l',
										label: 'Slider'
									}],
									defaultValue: 'f'
								},
								style: {
									type: 'string',
									component: 'dropdown',
									label: 'Style',
									ref: 'style',
									options: [{
										value: 'qlik',
										label: 'Qlik'
									}, {
										value: 'bootstrap',
										label: 'Bootstrap'
									}, {
										value: 'material',
										label: 'Material'
									}]
								},
								width: {
									type: 'string',
									component: 'dropdown',
									label: 'Width',
									ref: 'width',
									options: [{
										value: '',
										label: 'Default'
									}, {
										value: 'fill',
										label: 'Fill'
									}, {
										value: 'custom',
										label: 'Custom'
									}]
								},
								customwidth: {
									type: 'string',
									ref: 'customwidth',
									label: 'Custom width',
									expression: 'optional',
									show: function (data) {
										return data.width === 'custom';
									}
								},
								mlocale: {
									type: 'string',
									ref: 'mlocale',
									component: 'dropdown',
									label: 'Moment.js locales',
									options: function() {
										var locales = [];
										locales = moment.locales().map(function(locale) {
											return {
												value: locale,
												label: locale
											}
										});
										return locales;
									},
									show: function (data) {
										return data.render === 'p';
									}
								},
								vert: {
									type: 'boolean',
									label: 'Vertical',
									ref: 'vert',
									defaultValue: false,
									show: function (data) {
										return data.render === 'l';
									}
								},
								updateondrag: {
									type: 'boolean',
									label: 'Update on drag',
									ref: 'updateondrag',
									defaultValue: false,
									show: function (data) {
										return data.render === 'l';
									}
								},
								thinHeader:{
									type: 'boolean',
									ref: 'thinHeader',
									label: 'Thin header',
									defaultValue: false
								}
							}
						},
						values: {
							type: 'items',
							label: 'Values',
							show: function (data) {
								return data.render != 'f';
							},
							items: {
								valueType: {
									type: 'string',
									component: 'dropdown',
									label: 'Fixed or dynamic values',
									ref: 'valueType',
									options: [{
										value: 'x',
										label: 'Fixed'
									}, {
										value: 'd',
										label: 'Dynamic'
									}],
									defaultValue: 'x',
									show: function (data) {
										return ['b', 's'].indexOf(data.render) > -1;
									}
								},
								dynamicvalues: {
									type: 'string',
									ref: 'dynamicvalues',
									label: 'Dynamic values',
									expression: 'optional',
									show: function (data) {
										return ['b', 's'].indexOf(data.render) > -1 && data.valueType === 'd';
									}
								},
								dynamictext: {
									component: 'text',
									label: 'Use | to separate values and ~ to separate value and label, like this: value1|value2 or value1~label1|value2~label2)',
									show: function (data) {
										return ['b', 's'].indexOf(data.render) > -1 && data.valueType === 'd';
									}
								},
								alternatives: {
									type: 'array',
									ref: 'alternatives',
									label: 'Alternatives',
									itemTitleRef: 'label',
									allowAdd: true,
									allowRemove: true,
									addTranslation: 'Add Alternative',
									items: {
										value: {
											type: 'string',
											ref: 'value',
											label: 'Value',
											expression: 'optional'
										},
										label: {
											type: 'string',
											ref: 'label',
											label: 'Label',
											expression: 'optional'
										}
									},
									show: function (data) {
										return ['b', 's'].indexOf(data.render) > -1 && data.valueType !== 'd';
									}
								},
								min: {
									ref: 'min',
									label: 'Min',
									type: 'number',
									defaultValue: 0,
									expression: 'optional',
									show: function (data) {
										return data.render === 'l';
									}
								},
								max: {
									ref: 'max',
									label: 'Max',
									type: 'number',
									defaultValue: 100,
									expression: 'optional',
									show: function (data) {
										return data.render === 'l';
									}
								},
								step: {
									ref: 'step',
									label: 'Step',
									type: 'number',
									defaultValue: 1,
									expression: 'optional',
									show: function (data) {
										return data.render === 'l';
									}
								},
								rangelabel: {
									ref: 'rangelabel',
									label: 'Slider label',
									type: 'boolean',
									defaultValue: false,
									show: function (data) {
										return data.render === 'l';
									}
								}
							}
						}
					}
				}
			}
		},
		support: {
			export: true
		}
	};
});
