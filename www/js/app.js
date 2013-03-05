
var app = {
	debug: 1,
	cPage: null,

	initPage: function() {
		app.cPage = "page00";

		if(app.debug) console.log("init Page");

		$('body').live("swipeleft", function(){
			var nextpage = $("#wrapper ."+ app.cPage).next('div[data-role="page"]');
			if(nextpage.get(0)) {
				app.cPage = nextpage.data('cpage');
				//$("#wrapper .ui-page-active").removeClass('ui-page-active');
				$.mobile.changePage(nextpage, 'slide');
				if(app.debug) console.log("slide to next Page ", app.cPage);
			}
		});
		$('body').live("swiperight", function(){
			var prevpage = $("#wrapper ."+ app.cPage).prev('div[data-role="page"]');
			if(prevpage.get(0)) {
				app.cPage = prevpage.data('cpage');
				//$("#wrapper .ui-page-active").removeClass('ui-page-active');
				$.mobile.changePage(prevpage, 'slide', true);
				if(app.debug) console.log("slide to prev Page ", app.cPage);
			}
		});
	}
}


$(document).ready(function() {
	app.initPage();
	$.mobile.allowCrossDomainPages = true;
});

/*
$(document).bind("mobileinit", function(){
	//apply overrides here
	app.initPage();
	$.mobile.allowCrossDomainPages = true;
});
*/
