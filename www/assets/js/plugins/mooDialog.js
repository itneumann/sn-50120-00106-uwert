var mooDialog = new Class({

	Implements: [Events, Options],
	options: {
		'className': 'mooDialog',
		'overlayFade': 0.6,
		'Type': 'alert',
		'Text': 'Hier fehlt Text! Bitte ändern!',
		'Title': false,
		'Width': 400,
		'Height': false,
		'Closer': false,
		'btnNo' : 'Nein',
		'btnYes': 'Ja',
		'btnOk' : 'Ok',
		'autoShow': true,
		'debug': false
	},
	overrideAlert: true,
	dialog : null,
	overlay: null,
	container: null,
	cObj:{Title: false, Body: false},
	isIE9lt: false,
	isIE8lt: false,
	isIE7lt: false,

	/*
	onOk : null,
	onYes: null,
	onNo : null,
	*/
	/* Initialisierung */
	initialize: function(type, options){

		if(Browser.ie 		&& Browser.version < 9) this.isIE9lt = true;
		if(Browser.ie 		&& Browser.version < 8) this.isIE8lt = true;
		if(Browser.ie 		&& Browser.version < 7) this.isIE7lt = true;

		if($defined($('mooDialog'))) {
			this.dialog = $('mooDialog');
			this.overlay = $('mooDialogOverlay');
			this.deconsturct();
		}
		this.Type = type;
		this.setOptions(options);
		this.container = document.body;

		this.onOk  = options.onOk||function(){ /* do nothing */ return; };
		this.onNo  = options.onNo||function(){ /* do nothing */ return; };
		this.onYes = options.onYes||function(){ /* do nothing */ return; };

		this.createDialog();
		this.createOverlay();
		if(this.options.autoShow) this.show();
	},

	deconsturct: function() {
		if(this.dialog)  this.dialog.destroy();
		if(this.overlay) this.overlay.destroy();
	},

	createOverlay: function() {
		this.options.debug?console.log("create DialogOverlay"):false;
		this.overlay = new Element('div', {'id': 'mooDialogOverlay', 'class': this.options.className+'Overlay'}).fade('hide').inject(this.container, 'top');
	},

	createDialog: function() {
		this.options.debug?console.log("create Dialog"):false;

		this.dialog = new Element('div', {'id': 'mooDialog', 'class': this.options.className}).fade('hide').inject(this.container, 'top');
		if(this.options.Title) this.addTitle(this.options.Title, this.options.Closer);
		this.cObj.Body = new Element('div', {'class': 'mooDialogBody', 'html': this.options.Text.replace(/\n/g,'<br/>')}).inject(this.dialog);
		this.options.Height?this.cObj.Body.setStyle('height', this.options.Height):false;
		this.cObj.Body?this.cObj.Body.setStyle('width', this.options.Width):false;
		this.dialog.setStyle('marginTop', 0-(this.cObj.Body.getStyle('height').toInt()/2));
		this.dialog.setStyle('marginLeft', 0-(this.cObj.Body.getStyle('width').toInt()/2));

		switch(this.Type){
			case 'alert': this.addButton(this.options.btnOk, function(e){this.hide(); this.onOk(); }.bind(this)); break;
			case 'confirm':
				this.addButton(this.options.btnYes, function(e){ this.hide(); this.onYes(); }.bind(this));
				this.addButton(this.options.btnNo, function(e){this.hide(); this.onNo(); }.bind(this));
			break;
		}
	},

	update: function() {

	},

	addTitle: function(text, closer){
		this.cObj.Title = new Element('div', {'class': 'mooDialogTitle', 'html': text});
		if(closer) new Element('img', {'src': '/clear.gif', 'class': 'mooDialogCloser'}).addEvent('click', function(e){this.hide()}.bind(this)).inject(this.cObj.Title);
		this.cObj.Title.inject(this.dialog, 'top');
	},

	addButton: function(text, funct, clName, opts){
		if(!this.cObj.Buttons) this.cObj.Buttons = new Element('div', {'class': 'mooDialogButtons'}).inject(this.dialog, 'bottom');
		if(clName == 'link') {
			var button = new Element('a', {'class': 'mooDialogButton'+(clName?' '+ clName:''), 'text':text});
			if(opts.url) button.set('href', opts.url);
			if(opts.target) button.set('target', opts.target);
		} else {
			var button = new Element('span', {'class': 'mooDialogButton'+(clName?' '+ clName:''), 'text':text});
		}
		button.addEvent('click', funct);
		button.inject(this.cObj.Buttons, 'bottom');
	},


	/* Dialog anzeigen  */
	show: function() {
		this.overlay.fade(this.isIE9lt ? 'show' : this.options.overlayFade);
		this.dialog.fade('show');
	},

	hide: function() {
		this.deconsturct();
	}
});
