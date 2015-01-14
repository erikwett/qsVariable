define(["qlik"], function(qlik) {
	var BTN_SELECTED = 'qui-button-selected qirby-button-selected', BTN = 'qui-button qirby-button', SELECT = 'qui-select qirby-select', INPUT = 'qui-input qirby-input';

	return {
		initialProperties : {
			version : 1.0,
			variableValue : {},
			variableName : "",
			render : "f",
			alternatives : []
		},
		definition : {
			type : "items",
			component : "accordion",
			items : {
				settings : {
					uses : "settings",
					items : {
						variable : {
							type : "items",
							label : "Variable",
							items : {
								name : {
									ref : "variableName",
									label : "Name",
									type : "string",
									change : function(data) {
										//create variable - ignore errors
										qlik.currApp().variable.create(data.variableName);
										data.variableValue.qStringExpression = '=' + data.variableName;
									}
								},
								render : {
									type : "string",
									component : "dropdown",
									label : "Render as",
									ref : "render",
									options : [{
										value : "b",
										label : "Button"
									}, {
										value : "s",
										label : "Select"
									}, {
										value : "f",
										label : "Field"
									}, {
										value : "l",
										label : "Slider"
									}],
									defaultValue : "f"
								},
								alternatives : {
									type : "array",
									ref : "alternatives",
									label : "Alternatives",
									itemTitleRef : "label",
									allowAdd : true,
									allowRemove : true,
									addTranslation : "Add Alternative",
									items : {
										value : {
											type : "string",
											ref : "value",
											label : "Value"
										},
										label : {
											type : "string",
											ref : "label",
											label : "Label"
										}
									}
								}
							}
						}
					}
				}
			}
		},
		paint : function($element, layout) {
			var html = "", ext = this;
			if(layout.render === 'b') {
				layout.alternatives.forEach(function(alt) {
					var clazz = alt.value === layout.variableValue ? BTN_SELECTED : BTN;
					html += "<button class='" + clazz + "' data-alt='" + alt.value + "'>" + alt.label + "</button>";
				});
			} else if(layout.render === 's') {
				html += '<select class="' + SELECT + '">';
				layout.alternatives.forEach(function(alt) {
					var sel = alt.value === layout.variableValue ? 'selected' : '';
					html += "<option value='" + alt.value + "' " + sel + " >" + alt.label + "</option>";
				});
				html += '</select>';
			} else if(layout.render === 'l') {
				html += '<input type="range" min="0" max="100" style="width:98%" value="' + layout.variableValue + '"/>';
			} else {
				html += '<input class="' + INPUT + '" type="text"  value="' + layout.variableValue + '" />';
			}
			$element.html(html).find('button').on('qv-activate', function() {
				var val = $(this).data('alt') + '';
				qlik.currApp(ext).variable.setContent(layout.variableName, val);
			});
			$element.find('select, input').on('change', function() {
				var val = $(this).val() + '';
				qlik.currApp(ext).variable.setContent(layout.variableName, val);
			})
		}
	};

});
