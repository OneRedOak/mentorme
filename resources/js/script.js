"use strict";
var o = {
	//Blog Settings
	home: {
		slider: {
			animation: 'fade', //transition type. 'fade', 'slide'
			slideshowSpeed: 6000, //slideshow speed in milliseconds
			animationSpeed: 1000, //transition speed
			easing: 'easeOutQuad' //transition easing
		}
	},
	blog: {
		posts_per_page: 2, //post to be loaded/shown per page
		masonry: {
			enabled: false, //enable (true) or disable(false) the masonry effect for blog
			columns: 2, //masonry columns number
			right_gap: '2.5%', //the gap between posts in percents
			bottom_gap: 48 // if set to -1 right_gap will be used as bottom_gap
		},
		history: {
			pagination: 'page', //deeplink value when paginating. Exp: #/blog/page/2
			category: 'category', //deeplink value when a category is loaded. Exp: #/blog/category/html
			archives: 'archives', //deeplink value when an archive is loaded. Exp: #/blog/archives/july
			post: 'post' //deeplink value when post is loaded. Exp: #/blog/post/designing-a-website-in-browser
		}
	},

	// Project/Works Gallery Settings
	works: {
		load_more_limit: 3, //number of items to be loaded when "[   +   ]" (load more) is requested
		masonry: {
			enabled: false, //enable (true) or disable(false) the masonry effect for blog
			columns: 1, //masonry columns number
			right_gap: '1%', //the gap between posts in percents
			bottom_gap: -1 //if set to -1 right_gap will be used as bottom_gap
		},
		history: {
			category: 'category', //deeplink value when a category is filtered. Exp: #/works/category/other
			post: 'project' //deeplink value when project is loaded. Exp: #/works/project/year-of-2013
		},
		project_slider: {
			animation: 'slide', //transition type. 'fade', 'slide'
			slideshowSpeed: 6000, //slideshow speed in milliseconds
			animationSpeed: 600, //transition speed
			easing: 'easeInOutExpo' //transition easing
		}
	},

	//Global/Page Animation Timing and Easing Settings
	image_saturation: 0.3, //the amount of saturation applied to images from 0 to 1 where 0 is no saturation (grayscale) and 1 is normal saturation. *Note: no over-saturation is available.
	page_scroll_speed: 600, //speed of page scroll animation
	page_scroll_easing: 'easeInOutExpo', //easing of page scroll animation 
	page_switch_speed: 600, //page switch animation speed
	page_switch_easing: 'easeOutExpo', //page switch animation easing
	submenu_animation_speed: 300, //submenu animation speed
	submenu_animation_easing: 'easeOutQuad', //submenu animation easing
	filter_animateion_speed: 600, //animation speed when works/projects gallery is filtered
	filter_animateion_easing: 'easeInOutQuad', //animation easing when works/projects gallery is filtered
	animations_speed: 600, //global animation speed
	animations_easing: 'easeInOutQuart', //global animation easing

	use_logo_in_dynamic_naviagtion: true, //whether or not to use the logo in the dynamic naviagtion
	use_deeplink: true //enable or disable deeplink functionality
};



var firstLoad = true;
var deeplink;
var windoWidth = 0;
var is_mobile = false;
var is_404 = false;
var past = '';
var is_nav_open = false;
var current_section;
var section;

var hover_images = '.project-thumb img, .project-media img, .avatar img, .media-gallery img, .post-thumb img, .fetured-thumb img, .slides img';

$(window).load(function()
{
	scrollto( 0 );


	var the_page = $('body');
	deeplink = new $.Deeplink(); 

	if( the_page.hasClass('home-page') )
	{
		//history.set(['blog', 'hello-world']);
		section = new Object();

		$('body>section').each(function()
		{
			//HOME
			if( $(this).hasClass('home-template') && $(this).Home )
			{
				section[$(this).attr('id')] = $(this).Home(o, deeplink, {
				hold: true,
				onready: function()
				{
					
				}
			});
		}
		//WORKS
		else if( $(this).hasClass('works-template') && $(this).Works )
		{
			section[$(this).attr('id')] = $(this).Works(o, deeplink, {
			onsetup: function()
			{
				//setupWorksFilters( $(this) );
			}
			});
		}
		//BLOG
		else if( $(this).hasClass('blog-template') && $(this).Blog )
		{
			section[$(this).attr('id')] = $(this).Blog(o, deeplink);
		}
		//ABOUT
		else if( $(this).hasClass('about-template') && $(this).Standart )
		{
			section[$(this).attr('id')] = $(this).Standart(o, deeplink);
		}
		//CONTACTS
		else if( $(this).hasClass('contacts-template') && $(this).Contacts )
		{
			section[$(this).attr('id')] = $(this).Contacts(o, deeplink);
		}
		//STANDART
		else if( $(this).hasClass('standart-template') && $(this).Standart )
		{
			section[$(this).attr('id')] = $(this).Standart(o, deeplink);
		}
		});

		for(var sec in section)
		{
			if(section[sec].on404)
			{
				section[sec].on404 = function(message)
				{
					console.warn('404', message ? message : '');
					deeplink.replace(['404']);
				}
			}
		}

		past = deeplink.get();

		deeplink.changed = function(state)
		{
			if(!o.use_deeplink)
			{
				return;
			}
			historyHandeler(state);
			past = deeplink.get();
		}

		var state = deeplink.get();
		//deeplink.changed(state);
	}

	function historyHandeler(state)
	{
		if(state && state != '' && state[1] && state[1] != '' )
		{
			if(section[state[1]] != undefined )
			{
				if(section[state[1]].go)
				{
					section[state[1]].go(state, past);
				}
				scrollto(section[state[1]]);
			}
			else
			{
				if(state[1] != '404')
				{
				//console.warn('Could Not Find The Section');
					deeplink.replace(['404']);
				}
			}
		}

		//console.log(state[1]);
		if(state[1] == '404')
		{
			is_404 = true;
		}
		else
		{
			is_404 = false;
		}

		_do404();
	}

	/* Global Navigation handler */
	if( the_page.hasClass('home-page') )
	{
		$(document).on('click', '.nav li a, a.logo', function(e)
		{
			e.preventDefault();
			var tag = $(this).attr('href').substring(1);

			deeplink.set([tag]);
			scrollto( $('#' + tag) );
		});

		pageFromCookie();
	}
	else
	{
		var the_path = window.location.pathname.split('/');
		var the_file = the_path[the_path.length - 1];
		makeCookie('element', the_file + window.location.hash, 60);
		window.location.href = "./";
	}









	/* PAGE IS LOADED HANDELER */

	var AjaxQueueLength = AjaxQueue.length;

	if( $('body').hasClass('home-page') )
	{
		var preload = setInterval(function()
		{
			var __total = $('.c-image').length;
			var __processed = $('.c-canvas').length;

			//console.log('loading...', __total, __processed, AjaxQueue.length, AjaxQueueLength);

			if(isIE() > 8 || isIE() < 0)
			{
				if(__total == __processed)
				{
					//console.log('LOADED');
					AjaxQueueReady();
					AjaxQueueLength = AjaxQueue.length;
				}
			}
			else
			{
				//console.log('LOADED IE 8');
				AjaxQueueReady();
				AjaxQueueLength = AjaxQueue.length;
			}
			
			
		}, 500);
	}

	function AjaxQueueReady()
	{
		//console.log('all sections ready');
		$.when.apply($, AjaxQueue).then(function(ajaxInfo) {
			// Do something with each response
			//console.log('ajax loaded', AjaxQueue);
			
			
			for(var sec in section)
			{
				if(section[sec].hasClass('home-template') && section[sec].setup)
				{
					section[sec].setup();
				}
			}

			var state = deeplink.get();

			AjaxQueue = new Array();
			clearInterval(preload);
			firstLoad = false;
			
			setTimeout(function()
			{
				$('.overlay').delay(o.page_scroll_speed)
				.fadeOut(o.animations_speed, o.animations_easing, function()
				{

				});
				deeplink.changed(state);
			}, 
			o.page_switch_speed);



			if( the_page.hasClass('home-page') )
			{
				//pageFromCookie();
				deleteCookie('element');
			}
		}, function()
		{
			//AjaxQueueReady();
			//console.log('error in $.when');
		});
	}

	/* Apply BoxLoader Class */
	$('.box-loader').each(function()
	{
		$(this).BoxLoader(o);
	});


	/* Apply MediaBox Plugin */
	var MediaBox = $.mediaBox({
		element: 'a.mediabox',
		gallery: '.media-gallery, .project-media',
		duration: o.slide_in_speed,
		easing: 'easeOutExpo',
		onChange: function()
		{

		}
	});


















	$('body>section').on('mouseenter', '.section-nav-label', function()
	{
		if(!$(this).hasClass('to-map'))
		{
			var sect = $('body>section').has($(this));
			var _sect_nav = $(this).siblings('ul');
			var _sect_info = $(this).siblings('.section-info');

			var openees = _sect_nav.add(_sect_info);

			//console.log(openees);
			openees.stop(true, true).fadeIn(o.submenu_animation_speed, o.submenu_animation_easing);
		

			sect.find('.heading').mouseleave(function()
			{
				openees.fadeOut(o.submenu_animation_speed, o.submenu_animation_easing);
			});
		}
	});





	
	
});




$(window).scroll(function(e)
{
	var winTop = $(window).scrollTop();
	var bodyHt = $(document).height();
	var vpHt = $(window).height();
	var current_section;

	$('body>section').each(function(i)
	{
		var _section = $(this);
		var edgeMargin = $(window).height();
		var topRange = $(window).height() / 3;

		var loc = $(this).offset().top;
		if( ( loc > winTop - edgeMargin && ( loc < winTop + topRange || ( winTop + vpHt ) >= bodyHt ) ) )
		{
			$('.nav li').removeClass('current').eq(i).addClass('current');
			current_section = _section;

			$('.nav-select option').removeAttr('selected');

			$('.nav-select option[value="' + $('#nav-wrap .nav li.current a').attr('href') + '"]')
				.attr('selected', 'selected');
		}

		if( winTop > $('body>section').eq(0).height() )
		{
			fixNav()
		}
		else if(winTop < $('body>section').eq(0).offset().top + $('body>section').eq(0).height() / 2)
		{
			unfixNav(winTop)
		}
	});
});







/* Fixed Nav  */
/*====================================================================*/
var is_fixing = false;
var is_fixed = false;
function fixNav() {
	if( !is_fixing && !is_fixed ) {
		$('#header').css({
			position: 'fixed',
			top: 0 - $('#header').height()
		}).animate({
			top: 0
		},{
			queue: false,
			duration: o.navigation_animations_speed * 1000,
			easing: o.navigation_animations_easing,
			complete: function() {
				
				is_fixing = false;
			}
		});
	}
	is_fixed = true;
	is_fixing = true;
}


function unfixNav(_top) {
	if( is_fixing && is_fixed ) {
		$('#header').css({
			position: 'absolute',
			top: _top
		}).animate({
			top: 0
		},{
			queue: false,
			duration: o.navigation_animations_speed * 1000,
			easing: o.navigation_animations_easing,
			complete: function() {
				is_fixing = false;
			}
		});
	}
	is_fixed = false;
	is_fixing = false;
}



















/*====================================================================*/
/*===================== Elements Functionality =======================*/
/*====================================================================*/

/*--------------------------------*/
/*-------Tabs Functionality-------*/
/*--------------------------------*/

$(document).on('click', '.tab-box .tab-btns a', function(e)
{
	e.preventDefault();
	e.stopPropagation();

	var _this = $(this);
	var _this_box = _this.parentsUntil('.tab-box').parent('.tab-box');
	var _index = $(this).parent('li').index();
	var _tabs = _this_box.find('.tabs li');
	var _this_tab = _tabs.eq(_index);
	var _tab_btns_cont = _this_box.find('.tab-btns');
	var _tab_btns = _this_box.find('.tab-btns li');
	var _adj_height = _this_tab.outerHeight(true) + _tab_btns_cont.outerHeight(true);
	var _this_tab_btn = _this.parent('li');

	_tab_btns.removeClass('active-tab');
	_this_tab_btn.addClass('active-tab');

	_tabs.css({
		position: 'absolute'
	});

	_this_box.css({
		height: _adj_height
	});

	_tabs.fadeOut(o.animations_speed);
	_this_tab.fadeIn(o.animations_speed);
});


/*--------------------------------*/
/*------Toggle Functionality------*/
/*--------------------------------*/

$(document).on('click', '.toggle>li>a', function(e)
{
	e.preventDefault();
	var _this = $(this);
	var _this_toggle = _this.parent('li');
	var _main_toggle = _this.parentsUntil('ul.toggle').parent('ul.toggle');
	var _this_content = _this_toggle.children('div.toggle-item-content');
	var _all_contents = _main_toggle.find('div.toggle-item-content');

	if( _main_toggle.hasClass('accordion') )
	{
		if( !_this_toggle.hasClass('open-item') && !_this_toggle.hasClass('open') )
		{
			_all_contents.stop(true, true).slideUp(o.animations_speed, o.animations_easing);
			_main_toggle.find('li').removeClass('open-item');
			_this_content.stop(true, true).slideDown(o.animations_speed, o.animations_easing, function()
			{
				_main_toggle.find('li').removeClass('open');
			});
			_this_toggle.addClass('open-item');
		}
	}
	else
	{
		if( _this_toggle.hasClass('open-item') || _this_toggle.hasClass('open') )
		{
			_this_toggle.removeClass('open-item');
			_this_content.stop(true, true).slideUp(o.animations_speed, o.animations_easing, function()
			{
				_this_toggle.removeClass('open');
			});
		}else{
			_this_toggle.addClass('open-item');
			_this_content.stop(true, true).slideDown(o.animations_speed, o.animations_easing);
		}
	}
});














/* Page scroll Handlers */
/*====================================================================*/
function scrollto(__element, __duration)
{
	if(is_mobile)
	{
		if(__element.length > 0)
		{
			var where = $('section').index(__element) == 0 ? 0 : __element.offset().top - parseInt(__element.css('margin-top') );
			$('html, body').scrollTop(where);
		}
	}
	else
	{
		if(typeof(__element) == 'number')
		{
			$('html, body').animate({
				scrollTop: __element
			},{
				queue: false,
				duration: __duration ? __duration : o.page_scroll_speed,
				easing: o.page_scroll_easing,
				complete: function()
				{

				}
			});
			return
		}
		//console.log(__element)
		if($(__element).length > 0)
		{
			$('html, body').animate({
				scrollTop: $('section').index(__element) == 0 ? 0 : __element.offset().top - parseInt(__element.css('margin-top') )
			},{
				queue: false,
				duration: __duration ? __duration : o.page_scroll_speed,
				easing: o.page_scroll_easing,
				complete: function()
				{

				}
			});
		}
	}
}

/* Cookie Manager */

function pageFromCookie()
{
	var cookie_element = getCookie('element');

	
	if(cookie_element)
	{
		//check for section
		for(var sec in section)
		{
			var attr = section[sec].attr('data-source');
			if( attr && attr == cookie_element.split('#')[0])
			{
				deeplink.set( [section[sec].attr('id')] );
				return;
			}
		}
		//check for post
		for(var sec in section)
		{
			var anchor = section[sec].find('a[href="'+ cookie_element +'"]');
			
			if(anchor.length > 0)
			{
				//console.log(anchor.eq(0));
				anchor.eq(0).click();

				return;
			}
		}
		//check for content in section
		for(var sec in section)
		{
			var all_anchors = section[sec].find('a');
			all_anchors.each(function()
			{
				var href = $(this).attr('href');
				if(href && href.split('#')[0] == cookie_element)
				{
					deeplink.set( [section[sec].attr('id')] );
					$(this).click();
					//console.log('found, no hash')
					return;
				}
				if(href && href == cookie_element)
				{
					deeplink.set( [section[sec].attr('id')] );
					$(this).click();
					//console.log('found with hash')
					return;
				}
			});
		}
	}
}

function makeCookie(name, value, duration)
{
	if (duration) 
	{
		var date = new Date();
		date.setTime(date.getTime() + (duration * 1000));
		var expires = "; expires=" + date.toGMTString();
	}
	else 
	{
		var expires = "";
	}
	var cookie = name + "=" + value + expires + "; path=/";

	document.cookie = cookie;
}

function getCookie(name)
{
	var the_name = name + "=";
	var cookie_arr = document.cookie.split('; ');

	for(var i = 0; i < cookie_arr.length; i++) 
	{
		var c = cookie_arr[i];
		if( c.indexOf(the_name) == 0)
		{
			return c.substring(the_name.length, c.length);
		}
	}
	return null;
}

function deleteCookie(name)
{
	makeCookie(name, '', -1);
}


/* Responsive */

$(document).ready(function()
{
	responsive();
});

$(window).resize(function()
{
	responsive();
});

var past_image_saturation = o.image_saturation;

function responsive()
{
	windoWidth = $(window).width();
	if(windoWidth <= 740)
	{
		is_mobile = true;
	}
	
	if(windoWidth > 740)
	{
		is_mobile = false;
	}

	if(is_mobile)
	{
		o.image_saturation = 1;
		/* preloader */
		$('.mobile-preloader').remove();

		var preloader = $('<div>').attr('class', 'mobile-preloader').hide();
		$('body').append(preloader);

		/* navigation */
		$('.nav-select').remove();

		if( windoWidth < 480 )
		{
			var _nav = $('<select>').attr('class', 'nav-select');
			$('.main-navigation .nav li').each(function()
			{
				var option = $('<option>').attr('value', $('a', this).attr('href')).html($('a', this).html());
				_nav.append(option);
				_nav.appendTo('.main-navigation');
			});

			_nav.change(function()
			{
				$('.main-navigation .nav li a[href="'+ $(this).val() +'"]').click();
			});
		}
		
	}
	else
	{
		o.image_saturation = past_image_saturation;
		$('.mobile-preloader').remove();
		$('.nav-select').remove();
	}
}


function _do404()
{
	
}

function isIE()
{
	return navigator.appVersion.indexOf("MSIE") != -1 ? parseFloat(navigator.appVersion.split("MSIE")[1]) : -1
}





















































function imgCanvas(__callback)
{
	var loaded = 0;
	var total = $(hover_images).not('.c-image').not('.c-canvas').length;

	$(hover_images).not('.c-image').not('.c-canvas').each(function(l)
	{
		if(o.image_saturation < 1 && (isIE() > 8 || isIE() < 0) )
		{
			process(this);
			$(this).css({
				opacity: o.image_saturation
			});
		}
		//console.log('prepare for canvas');
	});


	function process(img)
	{
		$(img).addClass('c-image');
		$('<img/>').attr( 'src', $(img).attr('src') ).load(function()
		{
			loaded++;
			//console.log('loaded for canvas');
			var r_img = this;
			var canvas = $('<canvas>').attr({
				'width': r_img.width,
				'height': r_img.height
			})[0];
			var ctx = canvas.getContext('2d');

			ctx.drawImage(r_img, 0, 0);

			var imgData = ctx.getImageData( 0, 0, canvas.width, canvas.height );

			for (var i = 0; i < imgData.data.length; i += 4) 
			{
					imgData.data[i] = imgData.data[i+1] = imgData.data[i+2] = desaturate(imgData.data[i],imgData.data[i+1], imgData.data[i+2]);
			}

			ctx.putImageData(imgData, 0, 0);

			var new_image_data_url = canvas.toDataURL('image/jpeg');
			var new_img = $('<img class="c-canvas">').attr('src', new_image_data_url);

			//console.log(new_img);

			$(img).before(new_img);

			if(loaded == total && __callback)
			{
				//console.log('calling back from imgCanvas');
				__callback();
			}
		});

		
	}
}



function desaturate(r, g, b)
{
	return parseInt((0.2125 * r) + (0.7154 * g) + (0.0721 * b), 10);
}

if(o.image_saturation < 1 && (isIE() > 8 || isIE() < 0) )
{
	$(document).on('mouseenter', hover_images, function(e)
	{
		$(this).animate({
			opacity: 1
		},{
			queue: false,
			duration: o.animations_speed,
			easing: o.submenu_animation_easing
		});
	});

	$(document).on('mouseleave', hover_images, function(e)
	{
		$(this).animate({
			opacity: o.image_saturation
		},{
			queue: false,
			duration: o.animations_speed,
			easing: o.submenu_animation_easing
		});
	});
}