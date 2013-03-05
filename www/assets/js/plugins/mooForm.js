/*
description: mooForm, "Make your form controls look how you want them to". Porting of uniform, from jQuery to mootools.
license: MIT-style
authors:
- [Stefano Ceschi Berrini - @stecb](http://steweb.it)

requires:
- core/1.4: '*'

provides: [mooForm]
*/

var mooForm = new Class({
	Implements : [Options, Events],

	options: {
		selectClass:        'mooForm-select',
		radioClass:         'mooForm-radio',
		checkboxClass:      'mooForm-checker',
		textClass:          'mooForm-text',
		fileClass:          'mooForm-uploader',
		filenameClass:      'mooForm-filename',
		fileBtnClass:       'mooForm-action',
		fileDefaultText:    'No file selected',
		fileBtnText:        'Choose File',
		checkedClass:       'mooForm-checked',
		focusClass:         'mooForm-focus',
		disabledClass:      'mooForm-disabled',
		buttonClass:        'mooForm-button',
		activeClass:        'mooForm-active',
		hoverClass:         'mooForm-hover',
		useID:              true,
		idPrefix:           'mooForm',
		resetSelector:      false,
		autoHide:           true
	},
	elements : [],
	debug: 0,

	initialize : function(elements, options){
		this.setOptions(options);
		this.support = {};
		if(Browser.ie && Browser.version < 7){
			this.support.selectOpacity = false;
		} else {
			this.support.selectOpacity = true;
		}

		elements.each(function(element){
			if(!element.hasClass('unstyled')) {
				//element.store('styled', true);
				this._process_uniform(element);
			}
		}.bind(this));

		return this;

	},

	lookup : function( elements ){
		elements.each(function(element){
			if(!element.retrieve('styled') && !element.hasClass('unstyled')){
				//element.store('styled', true);
				this._process_uniform(element);
			}
		}.bind(this));
	},

	_process_uniform : function( elem ){
		if(this.support.selectOpacity){
			if(elem.get('tag') === "select"){
				/* element is a select */
				if(!elem.get("multiple")) {
					/* element is not a multi-select */
					if(elem.get("size") == undefined || elem.get("size") <= 1){
						this._doSelect(elem);
					}
				}
			} else if(elem.get("type") === "checkbox") {
				/* element is a checkbox */
				this._doCheckbox(elem);
			} else if(elem.get("type") === "radio") {
				/* element is a radio */
				this._doRadio(elem);
			} else if(elem.get("type") === "file") {
				/* element is a file upload */
				this._doFile(elem);
			} else if(elem.get("type") === "text" || elem.get("type") === "password" || elem.get("type") === "email") {
				this._doInput(elem);
			} else if(elem.get("tag") === "textarea") {
				/* this._doTextarea(elem); */
			} else if(elem.get("tag") === "a" || elem.get("type") === "submit" || elem.get("type") === "reset" || elem.get("tag") === "button" || elem.get("type") === "button") {
				/* this._doButton(elem); */
			}

		}
	},

	noSelect : function(elem) {
		function f() {
			return false;
		};
		elem.onselectstart = elem.ondragstart = f; /*  Webkit & IE */
		//elem.addEvent('mousedown',f).setStyles({ MozUserSelect: 'none' });
	},

	storeElement : function(elem) { this.elements.push(elem); },

	_doSelect : function( elem ){
		var elmWidth = elem.getStyle("width") ? elem.getStyle("width") : elem.getWidth()+'px';

		if(this.debug) console.log("mooForm: init Select Field '"+ elem.get('name') +"' mit width:"+ elmWidth);

		var divElement = new Element('div.mooForm', {styles:{width: elmWidth}})
		var spanElement = new Element('span');
		var valueElement = new Element('em');

		if(!elem.getStyle("display") === "none" && this.options.autoHide){
			divElement.hide();
		}
		divElement.addClass(this.options.selectClass);
		if(this.options.useID && !!elem.get("id")){
			divElement.set("id", this.options.idPrefix+"-"+elem.get("id"));
		}

		var selected = elem.getSelected();
		if(selected.length === 0) selected = [elem.getFirst()];
		valueElement.set('html',selected[0].get('html'));
		elem.setStyle('opacity', 0).setStyle('visibility','');

		divElement.wraps(elem);
		spanElement.inject(elem, 'before').adopt(valueElement);

		divElement.addEvent('mouseover', function() { if(!elem.get("disabled")){ elem.focus(); } });
		/* redefine variables */
		if(elem.value == 0 || !elem.value) valueElement.addClass('defaultValue'); else valueElement.removeClass('defaultValue');
		elem.addEvents({
			"change": function() {
				valueElement.set('text', elem.getSelected()[0].get('text'));
				if(elem.value == 0 || !elem.value) valueElement.addClass('defaultValue'); else valueElement.removeClass('defaultValue');
				divElement.removeClass(this.options.activeClass);
			}.bind(this),
			/*
			"mousedown": function() { divElement.addClass(this.options.activeClass); }.bind(this),
			"touchbegin": function() { divElement.addClass(this.options.activeClass); }.bind(this),
			"mouseup": function() { divElement.removeClass(this.options.activeClass); }.bind(this),
			"touchend": function() { divElement.removeClass(this.options.activeClass); }.bind(this),
			"click": function() {  if(!elem.get("disabled")) divElement.removeClass(this.options.activeClass); }.bind(this),
			"mouseenter": function() { divElement.addClass(this.options.hoverClass); }.bind(this),
			"mouseleave": function() { divElement.addClass(this.options.hoverClass); divElement.removeClass(this.options.activeClass); }.bind(this),
			"mouseover":function() { if(!divElement.hasClass(this.options.focusClass)) divElement.addClass(this.options.hoverClass); }.bind(this),
			"mouseout":function() { if(!divElement.hasClass(this.options.focusClass)) divElement.removeClass(this.options.hoverClass); }.bind(this),
			*/
			"blur": function() { divElement.removeClass(this.options.focusClass); divElement.removeClass(this.options.activeClass); }.bind(this),
			"focus": function() { divElement.addClass(this.options.focusClass); divElement.removeClass(this.options.hoverClass); }.bind(this),
			"keyup": function() { valueElement.set('text', elem.getSelected()[0].get('text')); },
			"disabled": function() { divElement.addClass(this.options.disabledClass); }.bind(this),
			"enable": function() { divElement.removeClass(this.options.disabledClass); }.bind(this)
		});

		/* handle disabled state */
		if(elem.get("disabled")) elem.fireEvent("disabled");

		this.noSelect(spanElement);
		this.storeElement(elem);
	},

	_doCheckbox : function( elem ){
		var divElement = new Element('div.mooForm'), spanElement = new Element('span');
		if(!elem.getStyle("display") === "none" && this.options.autoHide) divElement.hide();
		divElement.addClass(this.options.checkboxClass);
		/* assign the id of the element */
		if(this.options.useID && !!elem.get("id")) divElement.set("id", this.options.idPrefix+"-"+elem.get("id"));
		/* wrap with the proper elements */
		divElement.inject(elem, 'before').adopt(elem);
		spanElement.inject(elem, 'before').adopt(elem);
		/* redefine variables */
		spanElement = elem.getParent();
		divElement = spanElement.getParent();
		/* hide normal input and add focus classes */
		elem.setStyle('opacity',0).setStyle('visibility','').addEvents({
			/*
			"mouseover":function() { if(!divElement.hasClass(this.options.focusClass)) divElement.addClass(this.options.hoverClass); }.bind(this),
			"mouseout":function() { if(!divElement.hasClass(this.options.focusClass)) divElement.removeClass(this.options.hoverClass); }.bind(this)
			"touchend": function() { if(!elem.get("checked")) spanElement.removeClass(this.options.checkedClass); else spanElement.addClass(this.options.checkedClass); }.bind(this),
			"mousedown": function() { divElement.addClass(this.options.activeClass); }.bind(this),
			"touchbegin": function() { divElement.addClass(this.options.activeClass); }.bind(this),
			"mouseup": function() { divElement.removeClass(this.options.activeClass); }.bind(this),
			"touchend": function() { divElement.removeClass(this.options.activeClass); }.bind(this),
			"mouseenter": function() { divElement.addClass(this.options.hoverClass); }.bind(this),
			"mouseleave": function() { divElement.removeClass(this.options.hoverClass); divElement.removeClass(this.options.activeClass); }.bind(this),
			*/
			"focus": function() { divElement.addClass(this.options.focusClass); }.bind(this),
			"blur": function() { divElement.removeClass(this.options.focusClass); }.bind(this),
			"click": function() { if(!elem.get("checked")) spanElement.removeClass(this.options.checkedClass); else spanElement.addClass(this.options.checkedClass); }.bind(this),
			"disabled": function() { divElement.addClass(this.options.disabledClass); }.bind(this),
			"enable": function() { divElement.removeClass(this.options.disabledClass); }.bind(this)
		});
		/* handle defaults */
		if(elem.get("checked")) spanElement.addClass(this.options.checkedClass);
		/* handle disabled state */
		if(elem.get("disabled")) elem.fireEvent("disabled");
		this.storeElement(elem);
	},

	_doRadio : function( elem ){
		var divElement = new Element('div.mooForm'), spanElement = new Element('span');
		if(!elem.getStyle("display") === "none" && this.options.autoHide) divElement.hide();
		divElement.addClass(this.options.radioClass);
		if(this.options.useID && !!elem.get("id")) divElement.set("id", this.options.idPrefix+"-"+elem.get("id"));
		/* wrap with the proper elements */
		divElement.inject(elem, 'before').adopt(elem);
		spanElement.inject(elem, 'before').adopt(elem);
		/* redefine variables */
		spanElement = elem.getParent();
		divElement = spanElement.getParent();
		/* hide normal input and add focus classes */
		elem.setStyle("opacity", 0).setStyle('visibility','').addEvents({
			/*
			"touchend" : function(){ if(!elem.get("checked")){ spanElement.removeClass(this.options.checkedClass); }else{ var classes = this.options.radioClass.split(" ")[0]; $$("." + classes + " span." + this.options.checkedClass + " input[name='" + elem.get('name') + "']").getParent().removeClass(this.options.checkedClass); spanElement.addClass(this.options.checkedClass); } }.bind(this),
			"mousedown": function() { if(!elem.get("disabled")) divElement.addClass(this.options.activeClass); }.bind(this),
			"touchend": function() { if(!elem.get("disabled")) divElement.addClass(this.options.activeClass); }.bind(this),
			"mouseup": function() { divElement.removeClass(this.options.activeClass); }.bind(this),
			"touchbegin": function() { divElement.removeClass(this.options.activeClass); }.bind(this),
			"mouseenter": function() { divElement.addClass(this.options.hoverClass); }.bind(this),
			"mouseleave": function() { divElement.removeClass(this.options.hoverClass); divElement.removeClass(this.options.activeClass); }.bind(this),
			"touchend": function() { divElement.addClass(this.options.hoverClass); }.bind(this)
			*/
			"focus": function() { divElement.addClass(this.options.focusClass); }.bind(this),
			"blur": function(){ divElement.removeClass(this.options.focusClass); }.bind(this),
			"click": function(){ if(!elem.get("checked")) { spanElement.removeClass(this.options.checkedClass); } else { var classes = this.options.radioClass.split(" ")[0]; $$("." + classes + " span." + this.options.checkedClass + " input[name='" + elem.get('name') + "']").getParent().removeClass(this.options.checkedClass); spanElement.addClass(this.options.checkedClass); } }.bind(this),
			"disabled": function() { divElement.addClass(this.options.disabledClass); }.bind(this),
			"enable": function() { divElement.removeClass(this.options.disabledClass); }.bind(this)
		});
		/* handle defaults */
		if(elem.get("checked")) spanElement.addClass(this.options.checkedClass);
		/* handle disabled state */
		if(elem.get("disabled")) elem.fireEvent("disabled");
		this.storeElement(elem);
	},

	_doFile : function(elem){
		var divElement = new Element('div'), filenameTag = new Element('span').set('text', this.options.fileDefaultText), btnElement = new Element('span').set('text', this.options.fileBtnText);
		if(!elem.getStyle("display") === "none" && this.options.autoHide) divElement.hide();
		divElement.addClass(this.options.fileClass);
		filenameTag.addClass(this.options.filenameClass);
		btnElement.addClass(this.options.fileBtnClass);
		if(this.options.useID && !!elem.get("id")) divElement.set("id", this.options.idPrefix+"-"+elem.get("id"));
		/* wrap with the proper elements */
		divElement.inject(elem, 'before').adopt(elem);
		btnElement.inject(elem,'after');
		filenameTag.inject(elem,'after');
		/* redefine variables */
		divElement = elem.getParent("div");
		filenameTag = elem.getSiblings("."+this.options.filenameClass)[0];
		btnElement = elem.getSiblings("."+this.options.fileBtnClass)[0];
		/* set the size */
		if(!elem.get("size")) {
			var divWidth = divElement.getSize().x;
			/* $el.css("width", divWidth); */
			elem.set("size", divWidth/10);
		}
		/* actions */
		var setFilename = function() {
			var filename = elem.get('value');
			if (filename === '') { filename = this.options.fileDefaultText; } else { filename = filename.split(/[\/\\]+/); filename = filename[(filename.length-1)]; }
			filenameTag.set('text',filename);
		}.bind(this);
		/*  Account for input saved across refreshes */
		setFilename();
		elem.setStyle("opacity", 0).setStyle('visibility','').addEvents({
			"focus": function(){ divElement.addClass(this.options.focusClass); }.bind(this),
			"blur": function(){ divElement.removeClass(this.options.focusClass); }.bind(this),
			"mousedown": function() { if(!elem.get("disabled")) divElement.addClass(this.options.activeClass); }.bind(this),
			"mouseup": function() { divElement.removeClass(this.options.activeClass); }.bind(this),
			"mouseenter": function() { divElement.addClass(this.options.hoverClass); }.bind(this),
			"mouseleave": function() { divElement.removeClass(this.options.hoverClass); divElement.removeClass(this.options.activeClass); }.bind(this),
			"disabled": function() { divElement.addClass(this.options.disabledClass); }.bind(this),
			"enable": function() { divElement.removeClass(this.options.disabledClass); }.bind(this)
		});

		if (Browser.ie){
			/* IE7 doesn't fire onChange until blur or second fire. */
			elem.addEvent('click', function() { setTimeout(setFilename, 0); });
		}else{
			/* All other browsers behave properly */
			elem.addEvent('change', setFilename);
		}
		/* handle defaults */
		if(elem.get("disabled")) elem.fireEvent("disabled");
		this.noSelect(filenameTag);
		this.noSelect(btnElement);
		this.storeElement(elem);
	},

	_doInput : function( elem ){
		var elmWidth = elem.getStyle("width") ? elem.getStyle("width") : elem.getWidth()+'px';
		if(this.debug) console.log("mooForm: init Input Field["+ elem.get('type') +"] '"+ elem.get('name') +"' mit width:"+ elmWidth);

		var divElement = new Element('div.mooForm',{styles:{width:elmWidth}}), spanElement = new Element('span');
		if(!elem.getStyle("display") === "none" && this.options.autoHide) divElement.hide();
		divElement.addClass(this.options.textClass);
		if(this.options.useID && !!elem.get("id")) divElement.set("id", this.options.idPrefix+"-"+elem.get("id"));
		divElement.wraps(elem);
		spanElement.inject(elem, 'after');

		elem.addEvents({
			/*
			"mousedown": function() { divElement.addClass(this.options.activeClass); }.bind(this),
			"touchbegin": function() { divElement.addClass(this.options.activeClass); }.bind(this),
			"mouseup": function() { divElement.removeClass(this.options.activeClass); }.bind(this),
			"touchend": function() { divElement.removeClass(this.options.activeClass); }.bind(this),
			"click": function() {  if(!elem.get("disabled")) divElement.removeClass(this.options.activeClass); }.bind(this),
			"mouseenter": function() { divElement.addClass(this.options.hoverClass); }.bind(this),
			"mouseleave": function() { divElement.addClass(this.options.hoverClass); divElement.removeClass(this.options.activeClass); }.bind(this),
			*/
			"mouseover":function() { if(!divElement.hasClass(this.options.focusClass)) divElement.addClass(this.options.hoverClass); }.bind(this),
			"mouseout":function() { if(!divElement.hasClass(this.options.focusClass)) divElement.removeClass(this.options.hoverClass); }.bind(this),
			"blur": function() { divElement.removeClass(this.options.focusClass); divElement.removeClass(this.options.activeClass); }.bind(this),
			"focus": function() { divElement.addClass(this.options.focusClass); divElement.removeClass(this.options.hoverClass); }.bind(this),
			"disabled": function() { divElement.addClass(this.options.disabledClass); }.bind(this),
			"enable": function() { divElement.removeClass(this.options.disabledClass); }.bind(this)
		});
		/* handle disabled state */
		if(elem.get("disabled")) elem.fireEvent("disabled");
		this.storeElement(elem);
	},

	update : function(elem){
		var _this = this, o = this.options;
		if(elem === undefined) elem = this.elements;
		elem.each(function(el){
			if(el.get('tag') === "select"){
				/* element is a select */
				var spanTag = el.getPrevious(), divTag = el.getParent("div");
				divTag.removeClass(o.hoverClass).removeClass(o.focusClass).removeClass(o.activeClass);
				/* reset current selected text */
				spanTag.set('html',el.getSelected()[0].get('html'));
				if(el.get("disabled")) divTag.addClass(o.disabledClass); else divTag.removeClass(o.disabledClass);
			} else if(el.get('type') === "checkbox") {
				/* element is a checkbox */
				var spanTag = el.getParent("span"), divTag = el.getParent("div");
				divTag.removeClass(o.hoverClass).removeClass(o.focusClass).removeClass(o.activeClass);
				spanTag.removeClass(o.checkedClass);
				if(el.get("checked")) spanTag.addClass(o.checkedClass);
				if(el.get("disabled")) divTag.addClass(o.disabledClass); else divTag.removeClass(o.disabledClass);
			} else if(el.get('type') === "radio") {
				/* element is a radio */
				var spanTag = el.getParent("span"), divTag = el.getParent("div");
				divTag.removeClass(o.hoverClass).removeClass(o.focusClass).removeClass(o.activeClass);
				spanTag.removeClass(o.checkedClass);
				if(el.get("checked")) spanTag.addClass(o.checkedClass);
				if(el.get("disabled")) divTag.addClass(o.disabledClass); else divTag.removeClass(o.disabledClass);
			} else if(el.get('type') === "file") {
				var divTag = el.getParent("div"), filenameTag = el.getSiblings(o.filenameClass), btnTag = el.getSiblings(o.fileBtnClass);
				divTag.removeClass(o.hoverClass).removeClass(o.focusClass).removeClass(o.activeClass);
				filenameTag.set('text',el.get('value'));
				if(el.get("disabled")) divTag.addClass(o.disabledClass); else divTag.removeClass(o.disabledClass);
			}
			/*
			else if($e.is(":submit") || $e.is(":reset") || $e.is("button") || $e.is("a") || elem.is("input[type=button]")) {
				var divTag = $e.closest("div");
				divTag.removeClass(options.hoverClass+" "+options.focusClass+" "+options.activeClass);
				if($e.is(":disabled")) divTag.addClass(options.disabledClass); else divTag.removeClass(options.disabledClass);
			}
			*/
		});
	}
});