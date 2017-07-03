/*global define, require*/
define([], function () {
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

	return {
		createElement: createElement,
		setChild: setChild,
		addStyleSheet: addStyleSheet
	};
});
