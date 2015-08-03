// page init
jQuery(function() {
	initInputs();
	initScrollPage();
	jQuery('input, textarea').placeholder();
});

/*
 * Browser platform detection
 */
PlatformDetect = (function() {
	var detectModules = {};

	return {
		options: {
			cssPath: window.pathInfo ? pathInfo.base + pathInfo.css : 'css/'
		},
		addModule: function(obj) {
			detectModules[obj.type] = obj;
		},
		addRule: function(rule) {
			if (this.matchRule(rule)) {
				this.applyRule(rule);
				return true;
			}
		},
		matchRule: function(rule) {
			return detectModules[rule.type].matchRule(rule);
		},
		applyRule: function(rule) {
			var head = document.getElementsByTagName('head')[0], fragment, cssText;
			if (rule.css) {
				cssText = '<link rel="stylesheet" href="' + this.options.cssPath + rule.css + '" />';
				if (head) {
					fragment = document.createElement('div');
					fragment.innerHTML = cssText;
					head.appendChild(fragment.childNodes[0]);
				} else {
					document.write(cssText);
				}
			}
			if (rule.meta) {
				if (head) {
					fragment = document.createElement('div');
					fragment.innerHTML = rule.meta;
					head.appendChild(fragment.childNodes[0]);
				} else {
					document.write(rule.meta);
				}
			}
		},
		matchVersions: function(host, target) {
			target = target.toString();
			host = host.toString();

			var majorVersionMatch = parseInt(target, 10) === parseInt(host, 10);
			var minorVersionMatch = (host.length > target.length ? host.indexOf(target) : target.indexOf(host)) === 0;

			return majorVersionMatch && minorVersionMatch;
		}
	};
}());

// All Mobile detection
PlatformDetect.addModule({
	type: 'allmobile',
	uaMatch: function(str) {
		if (!this.ua) {
			this.ua = navigator.userAgent.toLowerCase();
		}
		return this.ua.indexOf(str.toLowerCase()) != -1;
	},
	matchRule: function(rule) {
		return this.uaMatch('mobi') || this.uaMatch('midp') || this.uaMatch('ppc') || this.uaMatch('webos') || this.uaMatch('android') || this.uaMatch('phone os') || this.uaMatch('touch');
	}
});

// Detect rules
PlatformDetect.addRule({ type: 'allmobile', css: 'allmobile.css' });

// clear inputs on focus
function initInputs() {
	PlaceholderInput.replaceByOptions({
		// filter options
		clearInputs: true,
		clearTextareas: true,
		clearPasswords: true,
		skipClass: 'default',
		// input options
		wrapWithElement: false,
		showUntilTyping: false,
		getParentByClass: false,
		placeholderAttr: 'value'
	});
}


// full page init
function initScrollPage() {
	var page = jQuery('body'),
		win = jQuery(window),
		wrapper = jQuery('#wrapper'),
		allSections = wrapper.find('.slide'),
		activeClass = 'section-active',
		hideClass = 'hide',
		animSpeed = 10;
	// detect device type
	var isTouchDevice = /Windows Phone/.test(navigator.userAgent) || ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;
	
	allSections.eq(0).addClass(activeClass);
	wrapper.onepage_scroll({
		sectionContainer: '.slide',
		pagination: true,
		loop: false,
		beforeMove: function(index) {
			var nav = jQuery('.onepage-pagination');
			if (index === 1) {
				nav.addClass(hideClass);
			} else {
				nav.removeClass(hideClass);
			}
			allSections.removeClass(activeClass);
			allSections.eq(index - 1).addClass(activeClass);

			if (!isTouchDevice) {
				// bg parallax
				page.animate({
					backgroundPositionY: -win.height() / 5 * index + 1 + 'px',
				}, {
				duration: animSpeed,
				queue: false,
				complete: function() {
						page.css({ 'background-position': '50%' + (-win.height() / 5 * index + 1) + 'px' });
					}
				});
			}
		}
	});

	jQuery('.onepage-pagination').addClass(hideClass);

	// anchor links handler
	wrapper.find('.icon').each(function() {
		var link = jQuery(this);
		link.on('click', function(e) {
			e.preventDefault();
			wrapper.moveDown();
		});
	});
}

/*! http://mths.be/placeholder v2.0.7 by @mathias */
;(function(window, document, $) {

	// Opera Mini v7 doesn’t support placeholder although its DOM seems to indicate so
	var isOperaMini = Object.prototype.toString.call(window.operamini) == '[object OperaMini]';
	var isInputSupported = 'placeholder' in document.createElement('input') && !isOperaMini;
	var isTextareaSupported = 'placeholder' in document.createElement('textarea') && !isOperaMini;
	var prototype = $.fn;
	var valHooks = $.valHooks;
	var propHooks = $.propHooks;
	var hooks;
	var placeholder;

	if (isInputSupported && isTextareaSupported) {

		placeholder = prototype.placeholder = function() {
			return this;
		};

		placeholder.input = placeholder.textarea = true;

	} else {

		placeholder = prototype.placeholder = function() {
			var $this = this;
			$this
				.filter((isInputSupported ? 'textarea' : ':input') + '[placeholder]')
				.not('.placeholder')
				.bind({
					'focus.placeholder': clearPlaceholder,
					'blur.placeholder': setPlaceholder
				})
				.data('placeholder-enabled', true)
				.trigger('blur.placeholder');
			return $this;
		};

		placeholder.input = isInputSupported;
		placeholder.textarea = isTextareaSupported;

		hooks = {
			'get': function(element) {
				var $element = $(element);

				var $passwordInput = $element.data('placeholder-password');
				if ($passwordInput) {
					return $passwordInput[0].value;
				}

				return $element.data('placeholder-enabled') && $element.hasClass('placeholder') ? '' : element.value;
			},
			'set': function(element, value) {
				var $element = $(element);

				var $passwordInput = $element.data('placeholder-password');
				if ($passwordInput) {
					return $passwordInput[0].value = value;
				}

				if (!$element.data('placeholder-enabled')) {
					return element.value = value;
				}
				if (value == '') {
					element.value = value;
					// Issue #56: Setting the placeholder causes problems if the element continues to have focus.
					if (element != safeActiveElement()) {
						// We can't use `triggerHandler` here because of dummy text/password inputs :(
						setPlaceholder.call(element);
					}
				} else if ($element.hasClass('placeholder')) {
					clearPlaceholder.call(element, true, value) || (element.value = value);
				} else {
					element.value = value;
				}
				// `set` can not return `undefined`; see http://jsapi.info/jquery/1.7.1/val#L2363
				return $element;
			}
		};

		if (!isInputSupported) {
			valHooks.input = hooks;
			propHooks.value = hooks;
		}
		if (!isTextareaSupported) {
			valHooks.textarea = hooks;
			propHooks.value = hooks;
		}

		$(function() {
			// Look for forms
			$(document).delegate('form', 'submit.placeholder', function() {
				// Clear the placeholder values so they don't get submitted
				var $inputs = $('.placeholder', this).each(clearPlaceholder);
				setTimeout(function() {
					$inputs.each(setPlaceholder);
				}, 10);
			});
		});

		// Clear placeholder values upon page reload
		$(window).bind('beforeunload.placeholder', function() {
			$('.placeholder').each(function() {
				this.value = '';
			});
		});

	}

	function args(elem) {
		// Return an object of element attributes
		var newAttrs = {};
		var rinlinejQuery = /^jQuery\d+$/;
		$.each(elem.attributes, function(i, attr) {
			if (attr.specified && !rinlinejQuery.test(attr.name)) {
				newAttrs[attr.name] = attr.value;
			}
		});
		return newAttrs;
	}

	function clearPlaceholder(event, value) {
		var input = this;
		var $input = $(input);
		if (input.value == $input.attr('placeholder') && $input.hasClass('placeholder')) {
			if ($input.data('placeholder-password')) {
				$input = $input.hide().next().show().attr('id', $input.removeAttr('id').data('placeholder-id'));
				// If `clearPlaceholder` was called from `$.valHooks.input.set`
				if (event === true) {
					return $input[0].value = value;
				}
				$input.focus();
			} else {
				input.value = '';
				$input.removeClass('placeholder');
				input == safeActiveElement() && input.select();
			}
		}
	}

	function setPlaceholder() {
		var $replacement;
		var input = this;
		var $input = $(input);
		var id = this.id;
		if (input.value == '') {
			if (input.type == 'password') {
				if (!$input.data('placeholder-textinput')) {
					try {
						$replacement = $input.clone().attr({ 'type': 'text' });
					} catch(e) {
						$replacement = $('<input>').attr($.extend(args(this), { 'type': 'text' }));
					}
					$replacement
						.removeAttr('name')
						.data({
							'placeholder-password': $input,
							'placeholder-id': id
						})
						.bind('focus.placeholder', clearPlaceholder);
					$input
						.data({
							'placeholder-textinput': $replacement,
							'placeholder-id': id
						})
						.before($replacement);
				}
				$input = $input.removeAttr('id').hide().prev().attr('id', id).show();
				// Note: `$input[0] != input` now!
			}
			$input.addClass('placeholder');
			$input[0].value = $input.attr('placeholder');
		} else {
			$input.removeClass('placeholder');
		}
	}

	function safeActiveElement() {
		// Avoid IE9 `document.activeElement` of death
		// https://github.com/mathiasbynens/jquery-placeholder/pull/99
		try {
			return document.activeElement;
		} catch (err) {}
	}

}(this, document, jQuery));

// placeholder class
;(function(){
	var placeholderCollection = [];
	PlaceholderInput = function() {
		this.options = {
			element:null,
			showUntilTyping:false,
			wrapWithElement:false,
			getParentByClass:false,
			showPasswordBullets:false,
			placeholderAttr:'value',
			inputFocusClass:'focus',
			inputActiveClass:'text-active',
			parentFocusClass:'parent-focus',
			parentActiveClass:'parent-active',
			labelFocusClass:'label-focus',
			labelActiveClass:'label-active',
			fakeElementClass:'input-placeholder-text'
		};
		placeholderCollection.push(this);
		this.init.apply(this,arguments);
	};
	PlaceholderInput.refreshAllInputs = function(except) {
		for(var i = 0; i < placeholderCollection.length; i++) {
			if(except !== placeholderCollection[i]) {
				placeholderCollection[i].refreshState();
			}
		}
	};
	PlaceholderInput.replaceByOptions = function(opt) {
		var inputs = [].concat(
			convertToArray(document.getElementsByTagName('input')),
			convertToArray(document.getElementsByTagName('textarea'))
		);
		for(var i = 0; i < inputs.length; i++) {
			if(inputs[i].className.indexOf(opt.skipClass) < 0) {
				var inputType = getInputType(inputs[i]);
				var placeholderValue = inputs[i].getAttribute('placeholder');
				if(opt.focusOnly || (opt.clearInputs && (inputType === 'text' || inputType === 'email' || placeholderValue)) ||
					(opt.clearTextareas && inputType === 'textarea') ||
					(opt.clearPasswords && inputType === 'password')
				) {
					new PlaceholderInput({
						element:inputs[i],
						focusOnly: opt.focusOnly,
						wrapWithElement:opt.wrapWithElement,
						showUntilTyping:opt.showUntilTyping,
						getParentByClass:opt.getParentByClass,
						showPasswordBullets:opt.showPasswordBullets,
						placeholderAttr: placeholderValue ? 'placeholder' : opt.placeholderAttr
					});
				}
			}
		}
	};
	PlaceholderInput.prototype = {
		init: function(opt) {
			this.setOptions(opt);
			if(this.element && this.element.PlaceholderInst) {
				this.element.PlaceholderInst.refreshClasses();
			} else {
				this.element.PlaceholderInst = this;
				if(this.elementType !== 'radio' || this.elementType !== 'checkbox' || this.elementType !== 'file') {
					this.initElements();
					this.attachEvents();
					this.refreshClasses();
				}
			}
		},
		setOptions: function(opt) {
			for(var p in opt) {
				if(opt.hasOwnProperty(p)) {
					this.options[p] = opt[p];
				}
			}
			if(this.options.element) {
				this.element = this.options.element;
				this.elementType = getInputType(this.element);
				if(this.options.focusOnly) {
					this.wrapWithElement = false;
				} else {
					if(this.elementType === 'password' && this.options.showPasswordBullets && !this.options.showUntilTyping) {
						this.wrapWithElement = false;
					} else {
						this.wrapWithElement = this.elementType === 'password' || this.options.showUntilTyping ? true : this.options.wrapWithElement;
					}
				}
				this.setPlaceholderValue(this.options.placeholderAttr);
			}
		},
		setPlaceholderValue: function(attr) {
			this.origValue = (attr === 'value' ? this.element.defaultValue : (this.element.getAttribute(attr) || ''));
			if(this.options.placeholderAttr !== 'value') {
				this.element.removeAttribute(this.options.placeholderAttr);
			}
		},
		initElements: function() {
			// create fake element if needed
			if(this.wrapWithElement) {
				this.fakeElement = document.createElement('span');
				this.fakeElement.className = this.options.fakeElementClass;
				this.fakeElement.innerHTML += this.origValue;
				this.fakeElement.style.color = getStyle(this.element, 'color');
				this.fakeElement.style.position = 'absolute';
				this.element.parentNode.insertBefore(this.fakeElement, this.element);
				
				if(this.element.value === this.origValue || !this.element.value) {
					this.element.value = '';
					this.togglePlaceholderText(true);
				} else {
					this.togglePlaceholderText(false);
				}
			} else if(!this.element.value && this.origValue.length) {
				this.element.value = this.origValue;
			}
			// get input label
			if(this.element.id) {
				this.labels = document.getElementsByTagName('label');
				for(var i = 0; i < this.labels.length; i++) {
					if(this.labels[i].htmlFor === this.element.id) {
						this.labelFor = this.labels[i];
						break;
					}
				}
			}
			// get parent node (or parentNode by className)
			this.elementParent = this.element.parentNode;
			if(typeof this.options.getParentByClass === 'string') {
				var el = this.element;
				while(el.parentNode) {
					if(hasClass(el.parentNode, this.options.getParentByClass)) {
						this.elementParent = el.parentNode;
						break;
					} else {
						el = el.parentNode;
					}
				}
			}
		},
		attachEvents: function() {
			this.element.onfocus = bindScope(this.focusHandler, this);
			this.element.onblur = bindScope(this.blurHandler, this);
			if(this.options.showUntilTyping) {
				this.element.onkeydown = bindScope(this.typingHandler, this);
				this.element.onpaste = bindScope(this.typingHandler, this);
			}
			if(this.wrapWithElement) this.fakeElement.onclick = bindScope(this.focusSetter, this);
		},
		togglePlaceholderText: function(state) {
			if(!this.element.readOnly && !this.options.focusOnly) {
				if(this.wrapWithElement) {
					this.fakeElement.style.display = state ? '' : 'none';
				} else {
					this.element.value = state ? this.origValue : '';
				}
			}
		},
		focusSetter: function() {
			this.element.focus();
		},
		focusHandler: function() {
			clearInterval(this.checkerInterval);
			this.checkerInterval = setInterval(bindScope(this.intervalHandler,this), 1);
			this.focused = true;
			if(!this.element.value.length || this.element.value === this.origValue) {
				if(!this.options.showUntilTyping) {
					this.togglePlaceholderText(false);
				}
			}
			this.refreshClasses();
		},
		blurHandler: function() {
			clearInterval(this.checkerInterval);
			this.focused = false;
			if(!this.element.value.length || this.element.value === this.origValue) {
				this.togglePlaceholderText(true);
			}
			this.refreshClasses();
			PlaceholderInput.refreshAllInputs(this);
		},
		typingHandler: function() {
			setTimeout(bindScope(function(){
				if(this.element.value.length) {
					this.togglePlaceholderText(false);
					this.refreshClasses();
				}
			},this), 10);
		},
		intervalHandler: function() {
			if(typeof this.tmpValue === 'undefined') {
				this.tmpValue = this.element.value;
			}
			if(this.tmpValue != this.element.value) {
				PlaceholderInput.refreshAllInputs(this);
			}
		},
		refreshState: function() {
			if(this.wrapWithElement) {
				if(this.element.value.length && this.element.value !== this.origValue) {
					this.togglePlaceholderText(false);
				} else if(!this.element.value.length) {
					this.togglePlaceholderText(true);
				}
			}
			this.refreshClasses();
		},
		refreshClasses: function() {
			this.textActive = this.focused || (this.element.value.length && this.element.value !== this.origValue);
			this.setStateClass(this.element, this.options.inputFocusClass,this.focused);
			this.setStateClass(this.elementParent, this.options.parentFocusClass,this.focused);
			this.setStateClass(this.labelFor, this.options.labelFocusClass,this.focused);
			this.setStateClass(this.element, this.options.inputActiveClass, this.textActive);
			this.setStateClass(this.elementParent, this.options.parentActiveClass, this.textActive);
			this.setStateClass(this.labelFor, this.options.labelActiveClass, this.textActive);
		},
		setStateClass: function(el,cls,state) {
			if(!el) return; else if(state) addClass(el,cls); else removeClass(el,cls);
		}
	};
	
	// utility functions
	function convertToArray(collection) {
		var arr = [];
		for (var i = 0, ref = arr.length = collection.length; i < ref; i++) {
			arr[i] = collection[i];
		}
		return arr;
	}
	function getInputType(input) {
		return (input.type ? input.type : input.tagName).toLowerCase();
	}
	function hasClass(el,cls) {
		return el.className ? el.className.match(new RegExp('(\\s|^)'+cls+'(\\s|$)')) : false;
	}
	function addClass(el,cls) {
		if (!hasClass(el,cls)) el.className += " "+cls;
	}
	function removeClass(el,cls) {
		if (hasClass(el,cls)) {el.className=el.className.replace(new RegExp('(\\s|^)'+cls+'(\\s|$)'),' ');}
	}
	function bindScope(f, scope) {
		return function() {return f.apply(scope, arguments);};
	}
	function getStyle(el, prop) {
		if (document.defaultView && document.defaultView.getComputedStyle) {
			return document.defaultView.getComputedStyle(el, null)[prop];
		} else if (el.currentStyle) {
			return el.currentStyle[prop];
		} else {
			return el.style[prop];
		}
	}
}());

/*
 * Window Height CSS rules
 */
;(function() {
	var styleSheet;

	var getWindowHeight = function() {
		return window.innerHeight || document.documentElement.clientHeight;
	};

	var createStyleTag = function() {
		// create style tag
		var styleTag = jQuery('<style>').appendTo('head');
		styleSheet = styleTag.prop('sheet') || styleTag.prop('styleSheet');

		// crossbrowser style handling
		var addCSSRule = function(selector, rules, index) {
			if (styleSheet.insertRule) {
				styleSheet.insertRule(selector + '{' + rules + '}', index);
			} else {
				styleSheet.addRule(selector, rules, index);
			}
		};

		// create style rules
		addCSSRule('.win-min-height', 'min-height:0');
		addCSSRule('.win-height', 'height:auto');
		addCSSRule('.win-max-height', 'max-height:100%');
		resizeHandler();
	};

	var resizeHandler = function() {
		// handle changes in style rules
		var currentWindowHeight = getWindowHeight(),
			styleRules = styleSheet.cssRules || styleSheet.rules;
		jQuery.each(styleRules, function(index, currentRule) {
			var currentProperty = currentRule.selectorText.toLowerCase().replace('.win-', '').replace('-h', 'H');
			currentRule.style[currentProperty] = currentWindowHeight + 'px';
		});
	};

	createStyleTag();
	jQuery(window).on('resize orientationchange', resizeHandler);
}());


/* ===========================================================
 * jquery-onepage-scroll.js v1.3.1
 * ===========================================================
 * Copyright 2013 Pete Rojwongsuriya.
 * http://www.thepetedesign.com
 *
 * Create an Apple-like website that let user scroll
 * one page at a time
 *
 * Credit: Eike Send for the awesome swipe event
 * https://github.com/peachananr/onepage-scroll
 *
 * License: GPL v3
 *
 * ========================================================== */
!function(e){var t={sectionContainer:"section",easing:"ease",animationTime:1e3,pagination:true,updateURL:false,keyboard:true,beforeMove:null,afterMove:null,loop:true,responsiveFallback:false,direction:"vertical"};e.fn.swipeEvents=function(){return this.each(function(){function i(e){var i=e.originalEvent.touches;if(i&&i.length){t=i[0].pageX;n=i[0].pageY;r.bind("touchmove",s)}}function s(e){var i=e.originalEvent.touches;if(i&&i.length){var o=t-i[0].pageX;var u=n-i[0].pageY;if(o>=50){r.trigger("swipeLeft")}if(o<=-50){r.trigger("swipeRight")}if(u>=50){r.trigger("swipeUp")}if(u<=-50){r.trigger("swipeDown")}if(Math.abs(o)>=50||Math.abs(u)>=50){r.unbind("touchmove",s)}}}var t,n,r=e(this);r.bind("touchstart",i)})};e.fn.onepage_scroll=function(n){function o(){var t=false;var n=typeof r.responsiveFallback;if(n=="number"){t=e(window).width()<r.responsiveFallback}if(n=="boolean"){t=r.responsiveFallback}if(n=="function"){valFunction=r.responsiveFallback();t=valFunction;typeOFv=typeof t;if(typeOFv=="number"){t=e(window).width()<valFunction}}if(t){e("body").addClass("disabled-onepage-scroll");e(document).unbind("mousewheel DOMMouseScroll MozMousePixelScroll");i.swipeEvents().unbind("swipeDown swipeUp")}else{if(e("body").hasClass("disabled-onepage-scroll")){e("body").removeClass("disabled-onepage-scroll");e("html, body, .wrapper").animate({scrollTop:0},"fast")}i.swipeEvents().bind("swipeDown",function(t){if(!e("body").hasClass("disabled-onepage-scroll"))t.preventDefault();i.moveUp()}).bind("swipeUp",function(t){if(!e("body").hasClass("disabled-onepage-scroll"))t.preventDefault();i.moveDown()});e(document).bind("mousewheel DOMMouseScroll MozMousePixelScroll",function(e){e.preventDefault();var t=e.originalEvent.wheelDelta||-e.originalEvent.detail;u(e,t)})}}function u(e,t){deltaOfInterest=t;var n=(new Date).getTime();if(n-lastAnimation<quietPeriod+r.animationTime){e.preventDefault();return}if(deltaOfInterest<0){i.moveDown()}else{i.moveUp()}lastAnimation=n}var r=e.extend({},t,n),i=e(this),s=e(r.sectionContainer);total=s.length,status="off",topPos=0,leftPos=0,lastAnimation=0,quietPeriod=500,paginationList="";e.fn.transformPage=function(t,n,r){if(typeof t.beforeMove=="function")t.beforeMove(r);if(e("html").hasClass("ie8")){if(t.direction=="horizontal"){var s=i.width()/100*n;e(this).animate({left:s+"px"},t.animationTime)}else{var s=i.height()/100*n;e(this).animate({top:s+"px"},t.animationTime)}}else{e(this).css({"-webkit-transform":t.direction=="horizontal"?"translate3d("+n+"%, 0, 0)":"translate3d(0, "+n+"%, 0)","-webkit-transition":"all "+t.animationTime+"ms "+t.easing,"-moz-transform":t.direction=="horizontal"?"translate3d("+n+"%, 0, 0)":"translate3d(0, "+n+"%, 0)","-moz-transition":"all "+t.animationTime+"ms "+t.easing,"-ms-transform":t.direction=="horizontal"?"translate3d("+n+"%, 0, 0)":"translate3d(0, "+n+"%, 0)","-ms-transition":"all "+t.animationTime+"ms "+t.easing,transform:t.direction=="horizontal"?"translate3d("+n+"%, 0, 0)":"translate3d(0, "+n+"%, 0)",transition:"all "+t.animationTime+"ms "+t.easing})}e(this).one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",function(e){if(typeof t.afterMove=="function")t.afterMove(r)})};e.fn.moveDown=function(){var t=e(this);index=e(r.sectionContainer+".active").data("index");current=e(r.sectionContainer+"[data-index='"+index+"']");next=e(r.sectionContainer+"[data-index='"+(index+1)+"']");if(next.length<1){if(r.loop==true){pos=0;next=e(r.sectionContainer+"[data-index='1']")}else{return}}else{pos=index*100*-1}if(typeof r.beforeMove=="function")r.beforeMove(next.data("index"));current.removeClass("active");next.addClass("active");if(r.pagination==true){e(".onepage-pagination li a"+"[data-index='"+index+"']").removeClass("active");e(".onepage-pagination li a"+"[data-index='"+next.data("index")+"']").addClass("active")}e("body")[0].className=e("body")[0].className.replace(/\bviewing-page-\d.*?\b/g,"");e("body").addClass("viewing-page-"+next.data("index"));if(history.replaceState&&r.updateURL==true){var n=window.location.href.substr(0,window.location.href.indexOf("#"))+"#"+(index+1);history.pushState({},document.title,n)}t.transformPage(r,pos,next.data("index"))};e.fn.moveUp=function(){var t=e(this);index=e(r.sectionContainer+".active").data("index");current=e(r.sectionContainer+"[data-index='"+index+"']");next=e(r.sectionContainer+"[data-index='"+(index-1)+"']");if(next.length<1){if(r.loop==true){pos=(total-1)*100*-1;next=e(r.sectionContainer+"[data-index='"+total+"']")}else{return}}else{pos=(next.data("index")-1)*100*-1}if(typeof r.beforeMove=="function")r.beforeMove(next.data("index"));current.removeClass("active");next.addClass("active");if(r.pagination==true){e(".onepage-pagination li a"+"[data-index='"+index+"']").removeClass("active");e(".onepage-pagination li a"+"[data-index='"+next.data("index")+"']").addClass("active")}e("body")[0].className=e("body")[0].className.replace(/\bviewing-page-\d.*?\b/g,"");e("body").addClass("viewing-page-"+next.data("index"));if(history.replaceState&&r.updateURL==true){var n=window.location.href.substr(0,window.location.href.indexOf("#"))+"#"+(index-1);history.pushState({},document.title,n)}t.transformPage(r,pos,next.data("index"))};e.fn.moveTo=function(t){current=e(r.sectionContainer+".active");next=e(r.sectionContainer+"[data-index='"+t+"']");if(next.length>0){if(typeof r.beforeMove=="function")r.beforeMove(next.data("index"));current.removeClass("active");next.addClass("active");e(".onepage-pagination li a"+".active").removeClass("active");e(".onepage-pagination li a"+"[data-index='"+t+"']").addClass("active");e("body")[0].className=e("body")[0].className.replace(/\bviewing-page-\d.*?\b/g,"");e("body").addClass("viewing-page-"+next.data("index"));pos=(t-1)*100*-1;if(history.replaceState&&r.updateURL==true){var n=window.location.href.substr(0,window.location.href.indexOf("#"))+"#"+(t-1);history.pushState({},document.title,n)}i.transformPage(r,pos,t)}};i.addClass("onepage-wrapper").css("position","relative");e.each(s,function(t){e(this).css({position:"absolute",top:topPos+"%"}).addClass("section").attr("data-index",t+1);e(this).css({position:"absolute",left:r.direction=="horizontal"?leftPos+"%":0,top:r.direction=="vertical"||r.direction!="horizontal"?topPos+"%":0});if(r.direction=="horizontal")leftPos=leftPos+100;else topPos=topPos+100;if(r.pagination==true){paginationList+="<li><a data-index='"+(t+1)+"' href='#"+(t+1)+"'></a></li>"}});i.swipeEvents().bind("swipeDown",function(t){if(!e("body").hasClass("disabled-onepage-scroll"))t.preventDefault();i.moveUp()}).bind("swipeUp",function(t){if(!e("body").hasClass("disabled-onepage-scroll"))t.preventDefault();i.moveDown()});if(r.pagination==true){if(e("ul.onepage-pagination").length<1)e("<ul class='onepage-pagination'></ul>").prependTo("body");if(r.direction=="horizontal"){posLeft=i.find(".onepage-pagination").width()/2*-1;i.find(".onepage-pagination").css("margin-left",posLeft)}else{posTop=i.find(".onepage-pagination").height()/2*-1;i.find(".onepage-pagination").css("margin-top",posTop)}e("ul.onepage-pagination").html(paginationList)}if(window.location.hash!=""&&window.location.hash!="#1"){init_index=window.location.hash.replace("#","");if(parseInt(init_index)<=total&&parseInt(init_index)>0){e(r.sectionContainer+"[data-index='"+init_index+"']").addClass("active");e("body").addClass("viewing-page-"+init_index);if(r.pagination==true)e(".onepage-pagination li a"+"[data-index='"+init_index+"']").addClass("active");next=e(r.sectionContainer+"[data-index='"+init_index+"']");if(next){next.addClass("active");if(r.pagination==true)e(".onepage-pagination li a"+"[data-index='"+init_index+"']").addClass("active");e("body")[0].className=e("body")[0].className.replace(/\bviewing-page-\d.*?\b/g,"");e("body").addClass("viewing-page-"+next.data("index"));if(history.replaceState&&r.updateURL==true){var a=window.location.href.substr(0,window.location.href.indexOf("#"))+"#"+init_index;history.pushState({},document.title,a)}}pos=(init_index-1)*100*-1;i.transformPage(r,pos,init_index)}else{e(r.sectionContainer+"[data-index='1']").addClass("active");e("body").addClass("viewing-page-1");if(r.pagination==true)e(".onepage-pagination li a"+"[data-index='1']").addClass("active")}}else{e(r.sectionContainer+"[data-index='1']").addClass("active");e("body").addClass("viewing-page-1");if(r.pagination==true)e(".onepage-pagination li a"+"[data-index='1']").addClass("active")}if(r.pagination==true){e(".onepage-pagination li a").click(function(){var t=e(this).data("index");i.moveTo(t)})}e(document).bind("mousewheel DOMMouseScroll MozMousePixelScroll",function(t){t.preventDefault();var n=t.originalEvent.wheelDelta||-t.originalEvent.detail;if(!e("body").hasClass("disabled-onepage-scroll"))u(t,n)});if(r.responsiveFallback!=false){e(window).resize(function(){o()});o()}if(r.keyboard==true){e(document).keydown(function(t){var n=t.target.tagName.toLowerCase();if(!e("body").hasClass("disabled-onepage-scroll")){switch(t.which){case 38:if(n!="input"&&n!="textarea")i.moveUp();break;case 40:if(n!="input"&&n!="textarea")i.moveDown();break;case 32:if(n!="input"&&n!="textarea")i.moveDown();break;case 33:if(n!="input"&&n!="textarea")i.moveUp();break;case 34:if(n!="input"&&n!="textarea")i.moveDown();break;default:return}}})}return false}}(window.jQuery)
