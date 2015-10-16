/*global define*/
define( ["qlik"], function ( qlik ) {
	'use strict';
	var BTN_SELECTED = 'qui-button-selected', BTN = 'qui-button', SELECT = 'qui-select', INPUT = 'qui-input';

	function createVariable ( name ) {
		var app = qlik.currApp();
		//from 2.1: check if variable exists
		if ( app.variable.getByName ) {
			app.variable.getByName( name ).then( function () {
				//variable already exist
			}, function () {
				//create variable
				app.variable.create( name );
			} );
		} else {
			//create variable - ignore errors
			app.variable.create( name );
		}
	}

	return {
		initialProperties: {
			version: "2.0.0",
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
									change: function ( data ) {
										createVariable( data.variableName );
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
									}
								}
							}
						}
					}
				}
			}
		},
		paint: function ( $element, layout ) {
			var html = "", ext = this;
			if ( layout.render === 'b' ) {
				layout.alternatives.forEach( function ( alt ) {
					var clazz = alt.value === layout.variableValue ? BTN_SELECTED : BTN;
					html += "<button class='" + clazz + "' data-alt='" + alt.value + "'>" + alt.label + "</button>";
				} );
			} else if ( layout.render === 's' ) {
				html += '<select class="' + SELECT + '">';
				layout.alternatives.forEach( function ( alt ) {
					var sel = alt.value === layout.variableValue ? 'selected' : '';
					html += "<option value='" + alt.value + "' " + sel + " >" + alt.label + "</option>";
				} );
				html += '</select>';
			} else if ( layout.render === 'l' ) {
				html += '<input type="range" min="0" max="100" style="width:98%" value="' + layout.variableValue + '"/>';
			} else {
				html += '<input class="' + INPUT + '" type="text"  value="' + (typeof layout.variableValue === "string" ? layout.variableValue : "") + '" />';
			}
			$element.html( html ).find( 'button' ).on( 'qv-activate', function () {
				var val = $( this ).data( 'alt' ) + '';
				qlik.currApp( ext ).variable.setContent( layout.variableName, val );
			} );
			$element.find( 'select, input' ).on( 'change', function () {
				var val = $( this ).val() + '';
				qlik.currApp( ext ).variable.setContent( layout.variableName, val );
			} )
		}
	};

} )
;
