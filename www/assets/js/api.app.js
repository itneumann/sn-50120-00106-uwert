
var api = {
	debug: 0,
	Dialog: null,
	currPage: false,
	useLocalStore: false,

	parseFunct: function(e) { if(typeof e != 'object') e=$(e); e.getElements("[data-funct]").each(function(e){api.initFunct(e)}); },
	initFunct:  function(e) { var f=e.get('data-funct') , o=e.get('data-opts'); if(o&&(o!='' && o != null)) { o=JSON.decode("{"+o+"}"); } else { o={}; } if(api[f])api[f](e,o); },
	//scroller: {newsListing: false, newsDetails: false },
	views : {},

	showInfo: function(node,opt) {
		node.addEvent('click', function(evt) {
			evt.preventDefault();
			if(typeof mooDialog != 'undefined'){
				api.Dialog = new mooDialog("alert", {Text: opt.text, Closer:false});
			} else {
				alert(opt.text);
			}
		});
	},

	initForm: function (mainForm, opt) {
		//alert("initForm");
		if(typeof mooForm == 'undefined') return;
		//alert("initForm");
		var cssTags = [];
		for(var field in opt) {
			switch (field) {
				case 'input': var types = opt.input.split(","); for(var i=0; i < types.length; i++) { cssTags.push('input[type="'+ types[i] +'"]'); }; break;
				default: cssTags.push(field); break;
			}
		}

		var elements = mainForm.getElements(cssTags.length ? cssTags.join(", ") : 'select, input');
		this.mooForm = new mooForm(elements);
	},


	Pages: {
		ready: false,
		apps: [
			{ name: 'calc', node: 'appCalc', load:false}
			/*
			{ name: 'call', node: 'appCall', load:false},
			{ name: 'imprint', node: 'appImprint', load:false},
			{ name: 'news', node: 'appNews', load:false}
			*/
		],

		init: function() {
			this.apps.each(function(page, idx) {
				if(api.debug && !window.console) api.debug=0;
				if(!$(page.node)) { page.load = true; api.views[page.node] = false; return; } else {api.views[page.node] = true;};
				if(api.debug) console.log("Load Page "+ page.name +" set "+ page.node +" display = none ");
				$(page.node).addClass('hide');
				if($(page.node).get('html') != ''){
					if(api.debug == 2) console.log("Page "+ page.name +" must not Loadetset");
					api.Pages.after(idx, page, false);
					return;
				};

				if(api.debug) console.log("Load Page "+ page.node +" Server");

				new Request.HTML({
					url: appPath + page.name +".html",
					onSuccess: function(tree, elms, htmlStr, jsStr){
						if(api.debug) console.log("Load Page "+ page.node +" Server Success");
						api.Pages.after(idx, page, htmlStr);
					},
					onError: function() {
						node.getElement('button span').removeClass('loading');
						alert(opt.failmsg);
					}
				}).get();
			});
		},

		after: function(idx, page, htmlStr) {
			if(api.debug) console.log("afterLoad Page "+ page.node +" set content");
			if(htmlStr != false){
				$(page.node).set('html', htmlStr);
				api.parseFunct(page.node);
			}

			this.apps[idx].load = true; api.Pages.ready = true;
			this.apps.each(function(p,i) { if(!p.load) api.Pages.ready = false; });
			if(api.Pages.ready) setTimeout(api.Pages.run, 1000);
		},

		run: function() {
			$('appNav').getElement('a[data-page="appCalc"]').fireEvent('click');
		}

	},

	initAppMenu: function(node, opt) {
		node.getElements('a').each( function(item){
			if(item.getParent('li').hasClass('activ')) {
				api.currPage = {
					appPage: $(item.get('data-page')),
					appMenu: item.getParent('li')
				};
			}
			item.addEvent('click', function(evt) {
				if(evt) evt.preventDefault();
				if(api.views.appCall) $('appCall').addClass('hide');
				if(api.currPage) {
					api.currPage.appPage.addClass('hide');
					api.currPage.appMenu.removeClass('activ');
				}
				api.currPage = {
					appPage: $(item.get('data-page')).removeClass('hide'),
					appMenu: item.getParent('li').addClass('activ')
				};
				/*
				api.currPage.appPage.getElements('.scrollable').each(function(e){
					e.scroller = new ScrollerBar(e);
				});
				*/
			});
		});
	},

	initFormCalc: function (node, opt) {
		api.initForm(node, {'select':true, 'input':'text,radio,checkbox'});

		api.shareLink = $$('#appLinks .share')[0] ? $$('#appLinks .share')[0] : false;
		if(api.shareLink) api.shareLink.addClass('disabled');

		if(Browser.ie && Browser.version < 7) return;
		var contractChange, calcResult,
			selCon=$('data_contract'),
			selPay= $('data_paymethod'), optPay,
			selRun=$('data_runtime_type'), optRun,
			inpRun=$('data_runtime'),
			inpAmo = $('data_amount').set('value', ""),
			optNoRel = '<option>'+ opt.norel +'</option>',
			coIx, data;
		selCon.selectedIndex = 0;
		selPay.set('disabled', true).selectedIndex = 0; selPay.fireEvent('disabled');
		selRun.set('disabled', true).selectedIndex = 0; selRun.fireEvent('disabled');
		inpRun.set('disabled',true).set('value', "");   inpRun.fireEvent('disabled');
		optPay = selPay.get('html');
		optRun = selRun.get('html');

		contractChange = function(evt) {
			coIx = selCon.selectedIndex;
			if(coIx > 0) {
				var data = JSON.decode("{"+ selCon.getElements('option')[coIx].get('data-opt') +"}");
				if(data.type == '1' || data.type == '4') {
					selPay.set('html', optPay).set('disabled', false).selectedIndex = 0;
					selRun.set('html', optNoRel).set('disabled', true).selectedIndex = 0;
					inpRun.set('disabled', true).set('value', "");
					inpAmo.set('value', '');
				} else if(data.type == '2') {
					selPay.set('html', optPay).set('disabled', true).selectedIndex = 5;   selPay.fireEvent('change');
					selRun.set('html', optNoRel).set('disabled', true).selectedIndex = 0; selRun.fireEvent('change');
					inpRun.set('disabled', true).set('value', "");
					inpAmo.set('value', '');
				} else if(data.type == '3') {
					selPay.set('html', optNoRel).set('disabled', true).selectedIndex = 0; selPay.fireEvent('change');
					selRun.set('html', optNoRel).set('disabled', true).selectedIndex = 0; selRun.fireEvent('change');
					inpRun.set('disabled', true).set('value', "");
					inpAmo.set('value', '');
				} else {
					selPay.set('html', optPay).set('disabled', false).selectedIndex = 0; selPay.fireEvent('change');
					selRun.set('html', optRun).set('disabled', false).selectedIndex = 0; selRun.fireEvent('change');
					inpRun.set('disabled', false).set('value', '');
					inpAmo.set('value', '');
				}
			} else {
				selPay.set('html', optPay).set('disabled', true).selectedIndex = 0; selPay.fireEvent('change');
				selRun.set('html', optPay).set('disabled', true).selectedIndex = 0; selRun.fireEvent('change');
				inpAmo.set('value', "");
				inpRun.set('disabled', true).set('value', "");
			}

			if(selPay.get('disabled')) selPay.fireEvent('disabled'); else selPay.fireEvent('enable');
			if(selRun.get('disabled')) selRun.fireEvent('disabled'); else selRun.fireEvent('enable');
			if(inpRun.get('disabled')) inpRun.fireEvent('disabled'); else inpRun.fireEvent('enable');
			//if(api.shareLink) api.shareLink.addClass('disabled');
		};
		selCon.addEvent('change', contractChange);

		node.addEvent('submit', function(evt){
			evt.preventDefault();
			if(node.getElement('button span').hasClass('loading')) return;
			node.getElement('button span').addClass('loading');
			var cId = selCon.get('value');

			if(api.debug) console.log("APP is Offline");
			var failValue = false;
			node.getElements('input:not(.disabled)').each(function(elm) {
				if( elm.get('value') == '') failValue = true;
			});
			node.getElements('select:not(.disabled)').each(function(elm) {
				if( elm.get('value') == '') failValue = true;
			});

			if(failValue) {
				alert(opt.failmsg);
				node.getElement('button span').removeClass('loading');
				return false;
			};

			if(api.debug) console.log("Load data/contracts.xml and search contract data for "+ cId);

			new Request({
				url: 'data/contracts.xml',
				onSuccess: function(data, xmlData){
					if(api.debug) console.log("Load data/contracts.xml Success");

					var cData = {};
					xmlData.getElements('contract').each(function(c){
						cData[c.getElement('id').get('text')] = {
							'name': c.getElement('name').get('text'),
							'calctype': c.getElement('calctype').get('text'),
							'commission': c.getElement('commission').get('text'),
							'followcalctype': c.getElement('followcalctype').get('text'),
							'followcommissions': c.getElement('followcommissions').get('text')
						};
					});

					cData = api.appCalc.calcProvision(cData);
					alert(JSON.encode(cData));
					$('appResult').getElement('.result span').set('html', cData.amount);
					$('appResult').getElement('.hours span').set('html', cData.hours);
					node.getElement('button span').removeClass('loading');
				},
				onError: function() {
					if(api.debug) console.log("Load data/contracts.xml Fail");
					node.getElement('button span').removeClass('loading');
					alert(opt.failmsg);
				}
			}).get();
		});

	},

	initFormCall: function (node, opt) {
		if(Browser.ie && Browser.version < 7) return;

		node.addEvent('submit', function(evt){
			evt.preventDefault();
			node.getElement('button span').addClass('loading');

			new Request.JSON({
				url: node.get('action').replace('#form', '') +"?mod=AJAX&contract="+ $('data_contract').get('value'),
				onSuccess: function(data){
					node.getElement('button span').removeClass('loading');
					if(data.status == 'OK') {
						if(typeof mooDialog != 'undefined') {
							api.Dialog = new mooDialog("alert", { Text: opt.okmsg, onOk:function(){ /*$('ajaxFormCall').reset();*/ $('appCall').getElement('.back a').fireEvent('click');}, Closer:false});
						} else {
							alert(opt.okmsg); /* $('ajaxFormCall').reset();*/ $('appCall').getElement('.back a').fireEvent('click');
						}
					} else {
						alert(opt.failmsg);
					}
				},

				onError: function() {
					node.getElement('button span').removeClass('loading');
					alert(opt.failmsg);
				}
			}).post(node.toQueryString());
		});

		$('appCall').getElement('.back a').addEvent('click', function(evt){
			if(evt) evt.preventDefault();
			$('appCall').addClass('hide');
			$('appCalc').removeClass('hide');
		});
	},

	appNews: {
		isInit: false,
		cType: 'consumer',
		cDetails: null,
		cListing: null,

		init: function() {
			if(this.isInit) return;
			this.cListing = $('appNewsList').getElements('.head');

			this.cListing.each(function(item){
				item.setStyle('cursor', 'pointer').getParent('article').addClass('close');
				var pObj = item.getParent('article');
				item.cObj = {
					'article': pObj,
					'details': pObj.getElement('.details'),
					'content': pObj.getElement('.content'),
					'cHeight': false
				};

				item.cObj.details.set('tween', {duration:500, property: 'height', link: 'cancel'});

				item.addEvent('click', function(evt) {
					if(evt) evt.preventDefault();
					api.appNews.toggleDetails(item);
				});
			});
		},

		toggleDetails: function (el) {
			if(!el.cObj.cHeight){ el.cObj.cHeight = el.cObj.content.getSize().y + 20;}

			if(el.cObj.article.hasClass('open')) {
				el.cObj.details.get('tween').start(0);
				el.cObj.article.removeClass('open').addClass('close');
			} else {
				el.cObj.details.get('tween').start(el.cObj.cHeight);
				$$('#appNewsList .open .head').each(function(item){
					item.cObj.article.removeClass('open').addClass('close');
					item.cObj.details.get('tween').start(0);
				});
				el.cObj.article.removeClass('close').addClass('open');
			}
		}
	},

	initDatePicker: function(elm, opts) {
		if(typeof mooDatePicker == 'undefined') return;
		var pBtn = elm.getElement(opts.btn);
		if(pBtn) pBtn.setStyle('display', 'block');

		var dOpts = {
			pickerClass: 'datepicker_vista',
			allowEmpty: opts.allowEmpty || true,
			toggleElements: opts.btn || null,
			timePicker: opts.time || false,
			timePickerOnly: opts.timeonly || false,
			format: opts.format || 'd.m.Y'+ (opts.time ? ' H:i' : ''),
			days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
			months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
			inputOutputFormat: "Y-d-m H:i"
		};
		new mooDatePicker(elm, dOpts);
	},

	appCalc: {
		calcProvision: function($cData) {
			var $amount=0, $hours=0, cId = $('data_contract').get('value');
			//alert($cData);
			$cData = $cData[cId];
			var $runtime = parseInt($('data_runtime').get('value')),
				$calctype = $cData.calctype,
				$payamount = parseInt($('data_amount').get('value')),
				$paymethod = parseInt($('data_paymethod').get('value')),
				$commission = parseFloat($cData.commission),
				$runtimetype = $('data_runtime_type').get('value');

			if($('data_paymethod').get('value') == '0') { $calctype = '2'; }
			if($runtimetype == 'm') {
				//$paymethod = 1;
				$runtime = $runtime / 12;
				$runtimetype == 'j';
			}
			if(api.debug) console.log("Calc "+ $cData.name +" by calctye "+ $calctype);
			switch ($calctype){
				case '0': $amount = (($payamount * $paymethod) * $runtime) * ($commission / 100); break;
				case '1': $amount = (($payamount * $paymethod) / 12) * $commission; break;
				case '2': $amount = $payamount * ($commission / 100); break;
				case '3': $amount = $payamount * ($commission / 100); break;
				case '4': $amount = ($payamount * $paymethod) * ($commission / 100); break;
			};

			$hours = $amount / 150;
			if(api.debug) console.log("Calc "+ $cData.name +" by calctye("+ $calctype +") and commission("+ $commission +") = amount("+ $amount +") hours("+ $hours +")");
			return {'amount': ($amount).formatMoney(2, ',', '.'), 'hours': Math.floor($hours)};
		},

		initLinks: function(el, opt) {
			el.getElements('a.ajax').each(function(item){
				if(item.hasClass('share')) {
					item.addEvent('click', function(evt) {
						if(evt) evt.preventDefault();
						if(item.hasClass('disabled')) return;
						var cInd = $('data_contract').selectedIndex;
						var contractName = $('data_contract').getElements('option')[cInd].get('text');
						var contractHour = $('appResult').getElement('.hours span').get('text');
						var MsgText = cInd ? opt.shareText : opt.shareAltText;
						MsgText = MsgText.replace('##CONTRACT##', contractName);
						MsgText = MsgText.replace('##HOURS##', contractHour);
						var infoMsgText = '<b>'+ opt.shareTitle +'</b>\n\n' + '<span style="font-size:13px;">'+ MsgText +'</span>';

						api.Dialog = new mooDialog("share", {Text: infoMsgText, Closer:false, autoShow:false});
						api.Dialog.addButton('Facebook', function(e){ api.Dialog.hide(); api.facebook.onInit(MsgText); }, 'share');
						api.Dialog.addButton('Twitter', function(e){ api.Dialog.hide(); }, 'link', { url:'http://twitter.com/home?status='+ escape(opt.twShareText + opt.twShareUrl), target:"_blank"});
						api.Dialog.addButton('Abbrechen', function(e){ api.Dialog.hide(); }, 'share');

						api.Dialog.show();
					});
				}

				if(item.hasClass('request')) {
					item.addEvent('click', function(evt) {
						if(evt) evt.preventDefault();
						if(item.hasClass('disabled')) return;
						$('appCalc').addClass('hide');
						$('appCall').removeClass('hide');
					});
				}

				if(item.hasClass('ebook')) {
					item.addEvent('click', function(evt) {
						if(evt) evt.preventDefault();
						if(item.hasClass('disabled')) return;
						alert("E-Book bestellen");
					});
				}

			});

			if(api.views.appCall) {
				$('appCall').getElements('#appHead .back a').each(function(item){
					item.addEvent('click', function(evt) {
						if(evt) evt.preventDefault();
						$('ajaxFormCall').reset();
						$('appCall').addClass('hide');
						$('appCalc').removeClass('hide');
					});
				});
			}
		}
	},

	newsInit: function(e, o) { api.appNews.init(); },
	calcLinks:  function(e, o) { api.appCalc.initLinks(e, o); },


	facebook: {
		loaded: false,
		inited: false,
		connected: false,
		postMsg: null,

		onInit: function(msg) {
			if(msg) api.facebook.postMsg = msg;
			if(!api.facebook.inited) {
				api.facebook.writeScript();
				setTimeout(function(){ api.facebook.onInit();}, 100);
				return;
			}
			if(!api.facebook.loaded) {
				setTimeout(function(){ api.facebook.onInit();}, 100);
				return;
			}

			if(!api.facebook.connected){
				FB.login(function(response) {
					if(response.status == "connected"){
						api.facebook.connected = true;
						api.facebook.onInit();
					}
				});
				return;
			}

			if(api.facebook.connected){
				api.facebook.postToFeed();
			}
		},

		writeScript: function() {
			if(!api.facebook.inited) {
				/*
				var fbScript = document.createElement('script');
				fbScript.src = document.location.protocol + '//connect.facebook.net/en_US/all.js';
				fbScript.async = true;
				*/
				var fbScript = new Element('script', {src: document.location.protocol + '//connect.facebook.net/en_US/all.js', async:true});
				fbScript.inject($('fb-root'), 'after');
				api.facebook.inited = true;
			}
		},

		onLoginStatus: function(response) {
			if (response.status == "connected" && response.authResponse) {
				if(api.debug) console.log("FB.onLoginStatus: logged in");
				api.facebook.connected = true;
			} else {
				if(api.debug) console.log("FB.onLoginStatus: NOT logged in");
				api.facebook.connected = false;
			}
		},

		onStatusChange: function (response){
			if (response.status=="connected" && response.authResponse){
				if(api.debug) console.log("FB.onStatusChange: logged in");
				api.facebook.connected = true;
			} else {
				if(api.debug) console.log("FB.onStatusChange: NOT logged in");
				api.facebook.connected = false;
			}
		},

		postToFeed: function () {
			//FB.api('/me', function(response1) {
				if(api.debug) console.log(api.facebook.postMsg);
				var obj = {
					method: 'feed',
					display: 'popup',
					name: 'Transparenz Manager Basic',
					link: fbAppPage,
					picture: fbAppImg,
					caption: 'Der Vertrags-Provisions-Rechner von vdh24.de',
					description: api.facebook.postMsg
				};
				function callback(response3) {}
				FB.ui(obj, callback);
				//FB.ui(obj, function (response2) {});
			//});
		}
	},

	Alert: function(message) { if(typeof mooDialog != 'undefined') api.Dialog = new mooDialog("alert", {Text: message, Closer:false}); else alert(message); }
};

//api.requirePlugs();

window.addEvent('domready', function(){
	window.alert = function(msg) { api.Alert(msg); };
	//$('appIntro').setStyle('display', 'block');
	api.Pages.init();
	$$("[data-funct]").each(function(e){api.initFunct(e)});
});
/*
window.fbAsyncInit = function()	{
	FB.Event.subscribe('auth.statusChange', api.facebook.onStatusChange);
	FB.init({
		appId  : fbAppID,
		status : true,
		cookie : true,
		xfbml  : false
	});
	FB.getLoginStatus(api.facebook.onLoginStatus);
	api.facebook.loaded = true;
};
*/

Number.prototype.formatMoney = function(c, d, t){ var n = this, c = isNaN(c = Math.abs(c)) ? 2 : c, d = d == undefined ? "," : d, t = t == undefined ? "." : t, s = n < 0 ? "-" : "", i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "", j = (j = i.length) > 3 ? j % 3 : 0; return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : ""); };

