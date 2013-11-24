"use strict";

/* Works Page Template Class */
(function($)
{
	$.fn.Works = function(options, deeplink, __callbacks)
	{
		var use_external_filter = true;
		var filterable_gallery = false;
		var _this_ = this;
		var o = options;
		var name = this.attr('id');
		var container = '.section-holder';
		var heading = '.heading';
		var posts = '.works-gallery>li';
		var ext_filter = '.works-filter li';
		var filter = '.works-filter li';
		var additional_filter = 'a.category';
		var filter_opener = '.section-nav-label';
		var to_category = '.project-details a.category';
		var project_details = '.project-details';

		var info_label = '.info';
		var info = '.section-info';

		var to_post = 'a.to-project';
		var load_more = 'a.load-more';
		var close = 'a.close';
		var next = 'a.next';
		var previous = 'a.previous';
		var page_number = '.page-number'

		var post_count = 0;
		var real_post_count = 0;
		var current_post = 0;
		var current_category = 'all'
		var history = o.works.history;

		var slider_next = 'a.next-slide';
		var slider_prev = 'a.prev-slide'

		var is_in_post = false;

		this.ready = false;
		this.source_url = this.attr('data-source');
		this.Posts = null;
		var is_first_load = true;

		var callbacks = __callbacks ? __callbacks : {};
		var default_callbacks = {
			onsetup: function(){},
			on404: function(){},
			onready: function(_this_){}
		};
	
		$.extend(true, _this_, default_callbacks, callbacks);

		this.reset = function()
		{
			_this_.unloadPost();
			if(current_category != 'all')
			{
				current_category = 'all';
				_this_.Posts.reorder();
			}
			
		}

		this.go = function(state, past)
		{
			if(!o.use_deeplink)
			{
				return;
			}
			switch(state[2])
			{
				case history.category:

					_this_.unloadPost();

					if(state[3] != 'all' )
					{
						var found_cat = false;
						
						_this_.find(posts).add(_this_.stored.find(posts)).each(function()
						{
							var _tags = $(this).attr('data-tag');
							var re = new RegExp(state[3]); // RegExp('\b' + state[3] + '\b');
							var res = re.exec(_tags);

							if( res )
							{
								current_category = state[3];
								found_cat = true;

								console.log(res)
								return false;
							}
						});

						if( found_cat )
						{
							_this_.Posts.reorder();
						}
						else
						{
							_404('Could not find the category');
						}
						//console.log(_this_.stored.find(filter).find('a[href="#'+ state[3] +'"]').length);
						/*if( _this_.find(filter).find('a[href="#'+ state[3] +'"]').length > 0 )
						{
							current_category = state[3];
							//_this_.unloadPost();
							
						}
						else if(_this_.stored && _this_.stored.find(filter).find('a[href="#'+ state[3] +'"]').length > 0)
						{
							current_category = state[3];
							//_this_.unloadPost();
							_this_.Posts.reorder();
						}*/
						
					}else{
						current_category = state[3];
						if(!is_in_post)
						{
							_this_.Posts.reorder();
						}
						
					}
					
					

				break;

				case history.post:

					var selector = 'li[data-slug="'+ state[3] +'"]';
					//console.log(selector)

					if(_this_.find(posts).filter(selector).length > 0)
					{

						var _lis = _this_.find(posts);
						doLoadPost(_lis);
						//console.log('real');
						break;
					}
					else if(_this_.find(posts).filter(selector).length == 0 && _this_.stored && _this_.stored.find(posts).filter(selector).length > 0)
					{

						var _lis = _this_.stored.find(posts).filter('.matched');
						doLoadPost(_lis);
						//console.log('stored');
						break;
					}
					else
					{
						_this_.loadMore(state[3], {
							success:function()
							{
								var _lis = _this_.stored.find(posts);
								doLoadPost(_lis);
							},
							error: function()
							{
								_404('The requested project could not be found');
							}
						}, true);
						//console.log('none');
					}
				break;
				default:
					_this_.reset();
			}

			/* Loading post with given list item */
			function doLoadPost(_lis)
			{
				var _li = _lis.filter('li[data-slug="'+ state[3] +'"]');
				var _to_post = _li.find(to_post);
				var _url = _to_post.attr('href');
				var _index = _lis.index(_li);
				//console.log(_li,_index);

				var _dir = current_post > _index ? 'prev' : 'next';

				_this_.loadPost(_url, false, function()
				{
					current_post = _index;
					//console.log(current_post);
				}, is_in_post ? _dir : 'next');
			}

		}

		this.setup = function()
		{
			post_count = _this_.find(posts).length;

			if(filterable_gallery)
			{
				_this_.Posts = _this_.find(posts).parent('ul').filtergallery( _this_.find(filter), {
					duration: o.filter_animateion_speed,
					easing: o.filter_animateion_easing,
					autostart: true,
					masonry: {
						enable: o.works.masonry.enabled,
						columns: o.works.masonry.columns,
						bottom_gap: o.works.masonry.bottom_gap,
						right_gap: o.works.masonry.right_gap
					},
					before: function(__tag)
					{
						current_category = __tag;
						if(!o.use_deeplink)
						{
							_this_.Posts.reorder();
							return;
						}

						deeplink.set([name, history.category, current_category]);
					},
					start: function(obj)
					{
						post_count = obj.length;
						var filter_text = _this_.find(filter).find('a[href="#'+ current_category +'"]').html();
						_this_.find(filter_opener).html(filter_text);
						//console.log('on filter: '+obj.length)
					},
					update: function(i)
					{
						
					},
					complete: function(obj)
					{
						//post_count = obj.length;
					}
				});

				_this_.Posts.reorder();
			}
			else
			{
				_this_.Posts = {
					reorder: function(__callback)
					{
						
						//console.log($(ext_filter + 'a').parent('li'));



						switchAnimate(_this_, function()
						{
							$(ext_filter).removeClass('active');
							$(ext_filter).find('a[href="#'+ current_category +'"]').parent().addClass('active');

							_this_.find(posts).hide();
							_this_.find(posts).removeClass('matched');
							if(current_category == 'all')
							{
								_this_.find(posts).show();
								_this_.find(posts).addClass('matched');
							}

							_this_.find(posts).each(function()
							{
								var _tags = $(this).attr('data-tag');
								var re = new RegExp(current_category);
								var res = re.exec(_tags);
								if( res )
								{
									$(this).show();
									$(this).addClass('matched');
								}
							});

							var count = _this_.find(posts).filter('.matched').length;
							//console.log(count);

							post_count = count;

							var filter_text = _this_.find(filter).find('a[href="#'+ current_category +'"]').html();
							_this_.find(filter_opener).html(filter_text);

							/*====*/
							if(__callback)
							{
								__callback();
							}
						});
					},
					more: function(__items, __noscroll)
					{
						if(current_category != 'all')
						{
							if(!o.use_deeplink)
							{
								current_category = 'all';
							}else{
								current_category = 'all';
								deeplink.ignor()
								deeplink.set([name, history.category, current_category]);
							}

							_this_.Posts.reorder(function()
							{
								addMore(__items, __noscroll);
							});

						}else{
							addMore(__items, __noscroll);
						}//end if current_category != 'all'
					}
				}
			}
			
			_this_.stored = _this_.find(container).children();

			if(is_first_load)
			{
				_this_.Posts.reorder();
				is_first_load = false;
			}

			_this_.onsetup();
		}

		function addMore(__items, __noscroll)
		{
			var gallery = _this_.find(posts).parent('ul');
			if(__items)
			{
				__items.hide();
				__items.addClass('matched');

				var loaded = 0;
				var total = $('img', __items).length;

				
				$(__items).appendTo(gallery);

				$('img', __items).load(function()
				{
					if(loaded == total - 1)
					{
						//console.log('all images are loaded', __items);

						__items.each(function(i)
						{
							var _h = $(this).height();
							var _mb = parseInt( _this_.find(posts).eq(0).css('margin-bottom') );
							var delay = !__noscroll ? (o.animations_speed * i) + 100 : 0;
							var dur = !__noscroll ? o.animations_speed : 0;

							//console.log(_h,_mb);
							$(this).css({
								height: 0,
								opacity: 0,
								'margin-bottom': 0,
								display: 'block'
							}).delay(delay).animate({
								height: _h,
								'margin-bottom': _mb,
								opacity: 1
							},{
								duration: dur,
								easing: o.animations_easing
							});
						});
					}
					
					loaded++;
					
				});

				if(__noscroll)
				{
					//do nothing for now
				}else{
					setTimeout(function()
					{
						scrollto( __items.eq(0).offset().top - parseInt(_this_.css('margin-top')) - $('#header').height() );
					}, o.page_switch_speed);

					//console.log('addMore scroll', __noscroll);
				}

				post_count = real_post_count;
				
			}
		}

		this.loadPost = function(__url, __save, __loaded, __dir)
		{
			var _obj = {
				section: _this_, 
				url: __url,
				page_container: _this_.find(container),
				data_container: container, 
				animate: true, 
				direction: __dir ? __dir : 'next', 
				success: function()
				{
					is_in_post = true;
					if(__loaded)
					{
						__loaded();
					}
					//make_controls();
					//make_close();
					updateControls();
					imgCanvas();
				},
				slider: true
			};

			switchPage(_obj);
		}

		this.unloadPost = function()
		{
			if(is_in_post)
			{
				var _obj = { 
					section: _this_, 
					page_container: _this_.find(container),
					data_container: container,
					callback: function()
					{
						
					}
				};
				switchBack(_obj);
				is_in_post = false;
			}
		}









		this.setupSlider = function(__ready)
		{
			var slider = _this_.find('.project-media.slider');
			if(_this_.find('.project-media-list').length > 0 && slider.length > 0 && !is_mobile)
			{

				slider.flexslider({
					animation: o.works.project_slider.animation,
					easing: o.works.project_slider.easing,
					slideshowSpeed: o.works.project_slider.slideshowSpeed,
					animationSpeed: o.works.project_slider.animationSpeed,
					controlNav: false,
					selector: ".project-media-list > li",
					animationLoop: true,
					smoothHeight: true,
					useCSS: true,
					prevText: "",
					nextText: "",
					initDelay: 0,
					pauseOnAction: true,
					pauseOnHover: false,
					slideshow: false,
					directionNav: false,
					start: function(__slider)
					{
						slider.css({
							visibility: 'visible'
						}).animate({
							/*height: _this_.find('.project-media-list li').eq(0).height()*/
						},{
							queue: false,
							duration: o.page_switch_speed,
							easing: o.page_switch_easing
						});

						if(__ready)
						{
							__ready();
						}
					}
				});

				_this_.slider = slider.data('flexslider');
				//sl.flexAnimate(2);
			}

			if(is_mobile)
			{
				slider.removeClass('slider');
				if(__ready)
				{
					__ready();
				}
			}


		}


		_this_.on('click', slider_next, function(e)
		{
			e.preventDefault();
			_this_.slider.flexslider("next");
		});

		_this_.on('click', slider_prev, function(e)
		{
			e.preventDefault();
			_this_.slider.flexslider("prev");
		});






		this.loadMore = function(__limit, __callbacks, __noscroll)
		{

			loadData({
				section: _this_, 
				url: _this_.source_url,
				success: function(data)
				{
					var _posts = $(data).find(posts);
					var total = _posts.length;



					if(typeof(__limit) == 'number')
					{

						if(real_post_count != _posts.length)
						{
							var new_items = _posts.slice(real_post_count, real_post_count + __limit);
							real_post_count = real_post_count + new_items.length;
							//console.log(_posts, real_post_count)
							_this_.Posts.more(new_items, __noscroll);
						}
						

						
					}
					else if(typeof(__limit) == 'string')
					{
						var selector = 'li[data-slug="'+ __limit +'"]';
						var _li = _posts.filter(selector);
						var _index = _posts.index(_li);
						if(_li.length > 0)
						{
							var new_items = _posts.slice( real_post_count, _index + 1 );
							real_post_count = real_post_count + new_items.length;
							_this_.Posts.more(new_items, __noscroll);

							

							if(__callbacks.success)
							{
								__callbacks.success();
							}
						}else{
							if(__callbacks.error)
							{
								__callbacks.error();
							}
						}
					}
					

					if(real_post_count >= total)
					{
						_this_.find(load_more).css({
							visibility: 'hidden'
						});
					}

					imgCanvas();
				}
			})
		}

		/* user interaction event handlers */

		_this_.on('click', to_category, function(e)
		{
			e.preventDefault();
			current_category = $(this).attr('href').substring(1);

			if(!o.use_deeplink)
			{
				_this_.Posts.reorder();
				return;
			}
			
			//console.log(current_category)
			deeplink.set([name, history.category, current_category]);

		});


		_this_.on('click', to_post, function(e)
		{
			e.preventDefault();
			var _url = $(this).attr('href');
			var _lis = _this_.find(posts);
			var _li = _lis.has($(this));
			var _index = _lis.index(_li);

			var _slug = _li.attr('data-slug');

			//console.log('to-project is', _lis)

			if(!o.use_deeplink)
			{
				_this_.loadPost(_url, true, function()
				{
					current_post = _index;
				});
				return;
			}
			//console.log(current_post)
			//console.log(_lis);

			deeplink.set([name, history.post, _slug]);
			
		});

		_this_.on('click', load_more, function(e)
		{
			e.preventDefault();
			_this_.loadMore(o.works.load_more_limit);
		});





		_this_.on('click', close, function(e)
		{
			e.preventDefault();
			if(!o.use_deeplink)
			{
				_this_.unloadPost();
				return;
			}

			deeplink.set([name, history.category, current_category]);
		});

		_this_.on('click', next, function(e)
		{
			e.preventDefault();
			//console.log(current_post + 1)
			if(current_post < post_count - 1)
			{
				var _li = _this_.stored.find(posts).filter('li.matched').eq(current_post + 1);
				var _next_post = _li.find(to_post);
				var _slug = _li.attr('data-slug');

				if(_next_post.length > 0)
				{
					if(!o.use_deeplink)
					{
						_this_.loadPost(_next_post.attr('href'), false, function()
						{
							current_post++;
						}, 'next');
						return;
					}
				}
				deeplink.set([name, history.post, _slug]);
			}

			
		});

		_this_.on('click', previous, function(e)
		{
			e.preventDefault();
			
			if(current_post > 0)
			{
				var _li = _this_.stored.find(posts).filter('li.matched').eq(current_post - 1);
				var _prev_post = _li.find(to_post);
				var _slug = _li.attr('data-slug');

				if(_prev_post.length > 0)
				{
					if(!o.use_deeplink)
					{
						_this_.loadPost(_prev_post.attr('href'), false, function()
						{
							current_post--;
						}, 'prev');
						return;
					}
				}
				deeplink.set([name, history.post, _slug]);
				//console.log(current_post - 1, _slug)
			}
		});


		if(use_external_filter)
		{
			_this_.on('click', filter + ' a', function(e)
			{
				e.preventDefault();
				current_category = $(this).attr('href').substring(1);
				if(!o.use_deeplink)
				{
					_this_.Posts.reorder();
					return;
				}
				deeplink.set([name, history.category, current_category]);
			});

			$('body').on('click', ext_filter + ' a', function(e)
			{
				e.preventDefault();
				current_category = $(this).attr('href').substring(1);
				if(!o.use_deeplink)
				{
					_this_.Posts.reorder();
					return;
				}
				deeplink.set([name, history.category, current_category]);
			});

			
		}

		_this_.on('click', additional_filter, function(e)
		{
			e.preventDefault();
			current_category = $(this).attr('href').substring(1);
			if(!o.use_deeplink)
			{
				_this_.Posts.reorder();
				return;
			}
			deeplink.set([name, history.category, current_category]);
		});

		
		

		/* Handy functions */
		function make_controls()
		{
			var _controles = '<div class="page-controls"><a class="previous" href="#"></a><span class="page-number">[1/1]</span><a class="next" href="#"></a></div>';
			if( _this_.find('.page-controls').length == 0 )
			{
				_this_.find(project_details).prepend(_controles);
			}
		}

		function make_close()
		{
			var _close = '<a href="#" class="close"></a>';
			if( _this_.find('.close').length == 0 )
			{
				_this_.find(heading).after(_close);
			}
			
		}

		function updateControls()
		{
			if(current_post >= post_count - 1)
			{
				_this_.find(next).css({
					visibility: 'hidden'
				});
			}else{
				_this_.find(next).css({
					visibility: 'visible'
				});
			}

			if(current_post <= 0)
			{
				_this_.find(previous).css({
					visibility: 'hidden'
				});
			}else{
				_this_.find(previous).css({
					visibility: 'visible'
				});
			}

			var page_num = '[1/1]';
				page_num = '[' + (current_post + 1) + '/' + post_count + ']';

			_this_.find(page_number).html(page_num);
		}

		function _404(__message)
		{
			_this_.reset();
			_this_.on404(__message);
		}

		real_post_count = _this_.find(posts).length;
		this.setup();

		/*$(window).resize(function()
		{
			//console.log(windoWidth, o.works.masonry.columns);
			//_this_.Posts.setColumns(o.works.masonry.columns);
			_this_.Posts.reset();
		});*/

		var preloader = $('<div>').addClass('preloader');
		this.loading = function()
		{
			preloader.appendTo('body');
		}

		this.loaded = function()
		{
			preloader.remove();
		}

		this.ready = true;
		return this;
	}
})(jQuery);

/*================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================*/

/* Blog Page Template Class */
(function($)
{
	$.fn.Blog = function(options, deeplink, __callbacks)
	{
		var _this_ = this;
		var o = options;
		var name = this.attr('id');
		var container = '.section-holder';
		var heading = '.heading';
		var posts = '.blog-posts li';
		var filter = '.blog-categories li a, .blog-archives li a';
		var category = '.blog-categories li a, a.category';
		var archive = '.blog-archives li a, a.post-date, a.blog-post-date';
		var archive_nav = '.blog-archives li a';

		var filter_opener = '.section-nav-label';

		var page_numbers = 'a.to-page';

		var to_post = 'a.read-more';
		var close = 'a.close';
		var next = 'a.next';
		var previous = 'a.previous';
		var page_number = '.page-number';

		var post_count = 0;
		var current_post = 0;
		var page_count = 0;
		var current_page = 0;

		var current_category = 'all';
		var is_archive = false;

		var history = o.blog.history;
		this.source_url = this.attr('data-source');

		var is_in_post = false;

		this.ready = false;
		this.Posts = null;

		var callbacks = __callbacks ? __callbacks : {};
		var default_callbacks = {
			onsetup: function(){},
			on404: function(){},
			onready: function(_this_){}
		};
	
		$.extend(true, _this_, default_callbacks, callbacks);

		this.reset = function(state, past)
		{
			is_archive = false;
			if(past && past[1] != name)
			{

			}
			else
			{
				_this_.filterPage('all');
			}
			

			_this_.unloadPost();
		}

		this.go = function(state, past)
		{
			is_archive = false;
			//console.log(state, past);
			if(!o.use_deeplink)
			{
				return;
			}
			switch(state[2])
			{
				case history.category:

					if(is_in_post)
					{
						_this_.unloadPost(null, true);
						//break;
					}

					if( _this_.find(category).filter('a[href="#'+ state[3] +'"]').length > 0 )
					{
						current_category = state[3];
						_this_.filterPage(current_category);
						doSwitchCatPage();
					}
					else if(_this_.stored && _this_.stored.find(category).filter('a[href="#'+ state[3] +'"]').length > 0)
					{
						current_category = state[3];
						_this_.filterPage(current_category);
						doSwitchCatPage();
					}
					else
					{
						//console.log(current_category)
						_404('Could not find the category');
					}

				break;
				case history.archives:

					if(is_in_post)
					{
						_this_.unloadPost(null, true);
						//break;
					}

					if( _this_.find(archive).filter('a[href="#'+ state[3] +'"]').length > 0 )
					{
						current_category = state[3];
						is_archive = true;
						_this_.filterPage(current_category);
						doSwitchCatPage();
					}
					else if(_this_.stored && _this_.stored.find(archive).filter('a[href="#'+ state[3] +'"]').length > 0)
					{
						current_category = state[3];
						is_archive = true;
						_this_.filterPage(current_category);
						doSwitchCatPage();
					}
					else
					{

						_404('Could not find the archive');
					}

				break;
				case history.pagination:

					if(is_in_post)
					{
						_this_.unloadPost();
					}

					var pagination = parseInt(state[3]) - 1;
					//console.log(pagination, page_count);

					if(page_count == 0)
					{
						_this_.loadPage(function(data)
						{
							current_page = pagination;
							_this_.updatePage(data);
							//console.log(pagination, page_count);
							
						});
					}
					else
					{
						if(pagination >= 0 && pagination <= page_count - 1)
						{
							doSwitchPage(pagination);
						}
					}

				break;

				case history.post:
					var selector = 'li[data-slug="'+ state[3] +'"]';

					if(_this_.find(posts).filter(selector).length > 0)
					{
						var _lis = _this_.find(posts);
						doLoadPost(_lis);
						//console.log('real');
						break;
					}
					else if(_this_.stored && _this_.stored.find(posts).filter(selector).length > 0)
					{
						var _lis = _this_.stored.posts;
						doLoadPost(_lis);
						//console.log('stored');
						break;
					}
					else
					{
						_this_.loadPage(function(data)
						{
							current_page = 0;
							_this_.updatePage(data, true);

							var _lis = _this_.stored.posts;
							doLoadPost(_lis);
						});
						//console.log('none');
					}
				break;
				default:
					_this_.reset(state, past);
			}

			/* Switch the page after it was setup and updated */
			function doSwitchCatPage()
			{
				if(state[4] == history.pagination)
				{
					if(state[5] != undefined && state[5] != '')
					{
						doSwitchPage(parseInt(state[5]) - 1);
					}
				}
			}

			/* Loading post with given list items */
			function doLoadPost(_lis)
			{
				var _li = _lis.filter('li[data-slug="'+ state[3] +'"]');
				var _to_post = _li.find(to_post);
				var _url = _to_post.attr('href');
				var _index = _lis.index(_li);

				_this_.loadPost(_url, false, function()
				{
					current_post = _index;
					//console.log(current_post);
				});
			}

		}

		this.setup = function(__data)
		{
			_this_.stored = _this_.find(container).children();
			$(window).resize(function()
			{
				if(o.blog.masonry.enabled)
				{
					masonry(_this_.find(posts));
				}
					
			});
			
		}

		this.updatePage = function(__data, __store_all)
		{
			if(__data)
			{
				if(current_category == 'all')
				{
					_this_.stored.posts = __data.find(posts);
				}
				else
				{
					var _filtered_posts = $();
					__data.find(posts).each(function()
					{
						var _tags = $(this).attr('data-tag');
						var re = new RegExp(current_category);
						var res = re.exec(_tags);

						if( res )
						{
							_filtered_posts.push( this );
						}
					});

					if(_filtered_posts.length > 0)
					{
						_this_.stored.posts = _filtered_posts;

						
					}else{
						var _obj = {
							section: _this_, 
							page_container: _this_.find(container),
							data_container: container,
							callback: function()
							{
								
							}
						};
						switchBack(_obj);
						console.warn('no items found under "' + current_category + '" category or archive');

						this.filterPage('all');
					}
				}

				var filter_text = _this_.find(filter).filter('a[href="#'+ current_category +'"]').html();
				_this_.find(filter_opener).html(filter_text);

				//console.log('news updated', filter_text)
				
				if(_this_.stored.posts)
				{
					page_count = Math.ceil(_this_.stored.posts.length / o.blog.posts_per_page);
					_this_.Posts = _this_.find(posts).parent('ul');
					_this_.Posts.empty();
					_this_.Posts.append(
						_this_.stored.posts.slice(
							current_page * o.blog.posts_per_page, current_page * o.blog.posts_per_page + o.blog.posts_per_page
						)
					);

					make_controls();

				}
				

				
			}else{
				//current_category = 'all';
			}

			if(o.blog.masonry.enabled)
			{
				masonry(_this_.find(posts));
			}
			updateControls();

			//check if images in posts are loaded
			var _i = 0;
			var img_length = _this_.find(posts).find('img').length;
			
			_this_.find(posts).find('img').load(function()
			{
				if(_i >= img_length - 1)
				{
					if(o.blog.masonry.enabled)
					{
						masonry(_this_.find(posts));

					}
				}
				_i++;
			});

			imgCanvas();
		}

		this.loadPage = function(__success)
		{
			loadData({
				section: _this_, 
				url: _this_.source_url,
				success: function(data)
				{

					if(__success)
					{
						__success($(data));

					}
				},
				error: function()
				{

				}
			});
		}

		this.loadPost = function(__url, __save, __loaded, __dir)
		{
			var _obj = {
				section: _this_, 
				url: __url,
				page_container: _this_.find(container),
				data_container: container, 
				animate: true, 
				direction: __dir ? __dir : 'next',
				success: function()
				{
					if(__loaded)
					{
						__loaded();
					}
					
					applyCategoryClass();
					//make_close();
					updateControls();

					is_in_post = true;
				}
			};
			switchPage(_obj);
		}

		this.unloadPost = function(__callback, __half)
		{
			if(is_in_post)
			{
				var _obj = {
					section: _this_, 
					page_container: _this_.find(container),
					data_container: container,
					callback: function()
					{
						if(__callback)
						{
							__callback();
						}
					}
				};
				is_in_post = false;
				switchBack(_obj, __half);
				
			}
		}

		this.filterPage = function(__tag)
		{
			var _obj = {
				section: _this_,
				url: _this_.source_url,
				do_not_append: true,
				page_container: _this_.find(container),
				animate: false, 
				direction: 'next',
				success: function(__data)
				{
					current_page = 0;
					current_category = __tag;
					updateControls();
					_this_.updatePage(__data);
				},
				complete: function()
				{
					applyCategoryClass();

				}
			};
			switchPage(_obj);
		}




		/* user interaction event handlers */
		_this_.on('click', to_post, function(e)
		{
			e.preventDefault();
			var _url = $(this).attr('href');
			var _lis = _this_.find(posts);
			var _li = _lis.has($(this));

			var _slug = _li.attr('data-slug');

			if(!o.use_deeplink)
			{
				_this_.loadPost(_url, true, function()
				{
					
				});
				return;
			}
			//console.log(_lis);

			deeplink.set([name, history.post, _slug]);
			
		});

		




		_this_.on('click', close, function(e)
		{
			e.preventDefault();
			if(!o.use_deeplink)
			{
				_this_.unloadPost();
				return;
			}
			if(current_category != 'all')
			{
				var cat_or_arch = _this_.find(category).filter('a[href="#' + current_category + '"]').length > 0 ? history.category : history.archives;
				deeplink.set([name, cat_or_arch, current_category]);
			}
			else
			{
				deeplink.set([name, history.pagination, current_page + 1]);
			}
			
		});

		_this_.on('click', next, function(e)
		{
			//console.log('next');
			e.preventDefault();
			
			if(current_page < page_count - 1)
			{
				if(!o.use_deeplink)
				{
					var _obj = {
						section: _this_, 
						url: _this_.source_url,
						do_not_append: true,
						page_container: _this_.find(container),
						animate: false, 
						direction: 'next',
						success: function(__data)
						{
							current_page++;
							updateControls();
							_this_.updatePage(__data);
						}
					};
					switchPage(_obj);
					return;
				}
				if(current_category == 'all')
				{
					deeplink.set([name, history.pagination, (current_page + 1) + 1]);
				}
				else if(current_category != 'all' && !is_archive)
				{
					deeplink.set([name, history.category, current_category, history.pagination, (current_page + 1) + 1]);
				}
				else if(current_category != 'all' && is_archive)
				{
					deeplink.set([name, history.archives, current_category, history.pagination, (current_page + 1) + 1]);
				}
				
			}
		});

		_this_.on('click', previous, function(e)
		{
			e.preventDefault();
			if(current_page > 0)
			{
				if(!o.use_deeplink)
				{
					var _obj = {
						section: _this_, 
						url: _this_.source_url,
						do_not_append: true,
						page_container: _this_.find(container),
						animate: false, 
						direction: 'prev',
						success: function(__data)
						{
							current_page--;
							updateControls();
							_this_.updatePage(__data);
						}
					};
					switchPage(_obj);
					return;
				}
				if(current_category == 'all')
				{
					deeplink.set([name, history.pagination, (current_page - 1) + 1]);
				}
				else if(current_category != 'all' && !is_archive)
				{
					deeplink.set([name, history.category, current_category, history.pagination, (current_page - 1) + 1]);
				}
				else if(current_category != 'all' && is_archive)
				{
					deeplink.set([name, history.archives, current_category, history.pagination, (current_page - 1) + 1]);
				}
			}
		});




		_this_.on('click', page_numbers, function(e) 
		{
			e.preventDefault();

			var page_num = parseInt( $(this).attr('href').substring(1) );
			if(current_category == 'all')
			{
				deeplink.set([name, history.pagination, page_num]);
			}
			else if(current_category != 'all' && !is_archive)
			{
				deeplink.set([name, history.category, current_category, history.pagination, page_num]);
			}
			else if(current_category != 'all' && is_archive)
			{
				deeplink.set([name, history.archives, current_category, history.pagination, page_num]);
			}
		});











		_this_.on('click', category, function(e)
		{
			e.preventDefault();
			var _tag = $(this).attr('href').substring(1);
			if(!o.use_deeplink)
			{
				_this_.filterPage(_tag);
				return;
			}
			deeplink.set([name, history.category, _tag]);
			
		});

		_this_.on('click', archive, function(e)
		{
			//console.log('archive');
			e.preventDefault();
			var _tag = $(this).attr('href').substring(1);
			if(!o.use_deeplink)
			{
				_this_.filterPage(_tag);
				return;
			}
			deeplink.set([name, history.archives, _tag]);
		});





		/* Handy functions */
		function doSwitchPage(pagination)
		{
			var _obj = {
				section: _this_, 
				url: _this_.source_url,
				do_not_append: true,
				page_container: _this_.find(container),
				animate: false, 
				direction: pagination > current_page ? 'next' : 'prev',
				success: function(__data)
				{
					current_page = pagination;
					updateControls();
					_this_.updatePage(__data);
				}
			};
			switchPage(_obj);
		}

		function applyCategoryClass()
		{

			_this_.find(filter).parent().removeClass('active');

			_this_.find(filter).each(function()
			{
				var _tags = $(this).attr('href').substring(1);
				var re = new RegExp(current_category);
				var res = re.exec(_tags);

				if( res )
				{
					$(this).parent().addClass('active');
				}
			});
		}

		function percent(__container, __percent)
		{
			var num = parseFloat( __percent.substring(0, __percent.length - 1) );
			var percent = Math.floor(__container.width() * num / 100);
			return percent;
		}
		
		function masonry(__matched)
		{
			var mathItems = new Array();
			if(  typeof(o.blog.masonry.right_gap) == 'number' )
			{
				var column_width = $(__matched[0]).width() + o.blog.masonry.right_gap;
			}
			else if( typeof(o.blog.masonry.right_gap) == 'string' )
			{
				var column_width = $(__matched[0]).width() + percent(_this_.find(posts).parent('ul'), o.blog.masonry.right_gap);
			}

			var bottom_gap = 0;
			if(o.blog.masonry.bottom_gap < 0)
			{
				bottom_gap = percent(_this_.find(posts).parent('ul'), o.blog.masonry.right_gap)
			}else{
				bottom_gap = o.blog.masonry.bottom_gap;
			}

			var last_item = __matched.eq(__matched.length - 1);
			var max_height_arr = new Array();
			var max_height = _this_.find(posts).parent('ul').height();

			__matched.css({
				position: 'absolute'
			});

			__matched.each(function(i)
			{
				var item = $(this);
				
				mathItems[i] = {
					'y' : item.position().top,
					'x' : item.position().left,
					'height' : item.height(),
					'width' : item.width(),
					'item' : item
				}

				mathItems[i].x = column_width * (i % o.blog.masonry.columns)

				if(i < o.blog.masonry.columns)
				{
					mathItems[i].y = 0;
				}
				else
				{
					mathItems[i].y = (mathItems[i - o.blog.masonry.columns].y + mathItems[i - o.blog.masonry.columns].height) + bottom_gap;
				}

				item.css({
					top: mathItems[i].y,
					left: mathItems[i].x
				});
			});

			$.each(mathItems, function(i)
			{
				max_height_arr.push( mathItems[i].y + mathItems[i].height );
			});

			//console.log(max_height_arr);

			max_height = Math.max.apply(Math, max_height_arr);
			_this_.Posts.css({
				height: max_height
			});
		}

		function make_controls()
		{
			var _controles = $('<div class="page-controls"></div>');
			var _prev = $('<a class="previous" href="#"></a>');
			var _next = $('<a class="next" href="#"></a>');

			_this_.find('.page-controls').remove();

			if(page_count > 1)
			{
				_controles.append(_prev);
				for(var i = 0; i < page_count; i++)
				{
					var _pn = $('<a class="to-page" href="#' + (i + 1) + '">' + (i + 1) + '</a>');
					_controles.append(_pn);
				}
				_controles.append(_next);
				_this_.find(container).append(_controles);
			}

			
		}

		function make_close()
		{
			var _close = '<a href="#" class="close"></a>';
			if( _this_.find('.close').length == 0 )
			{
				_this_.find(heading).after(_close);
			}
		}

		function updateControls()
		{
			if(current_page >= page_count - 1)
			{
				_this_.find(next).hide();
			}else{
				_this_.find(next).show();
			}

			if(current_page <= 0)
			{
				_this_.find(previous).hide();
			}else{
				_this_.find(previous).show();
			}

			_this_.find(page_numbers).hide();

			for(var i = 0; i < page_count; i++)
			{
				_this_.find(page_numbers).eq(i).show();
			}
			

			_this_.find(page_numbers).removeClass('active')
						.filter('a[href="#' + (current_page + 1) + '"]')
						.addClass('active');

			var page_num = '[1/1]';
			
			page_num = (current_page + 1) + '/' + page_count;

			_this_.find(page_number).html(page_num);
		}


		function _404(__message)
		{
			_this_.reset();
			_this_.on404(__message);
		}

		
		this.loadPage(function(data)
		{
			_this_.updatePage(data);
		});
		
		this.setup();

		this.on404 = function(__message){};

		this.ready = true;
		return this;
	}
})(jQuery);

/*================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================*/

/* Home Page Template Class */
(function($)
{
	$.fn.Home = function(options, deeplink, __callbacks)
	{
		var _this_ = this;
		var o = options;
		var name = this.attr('id');

		var slider = _this_.find('.slider');
		var slideshowSpeed = o.home.slider.slideshowSpeed;
		var animationSpeed = o.home.slider.animationSpeed;
		var pauseOnHover = false;

		var slider_next = '.page-controls a.next';
		var slider_prev = '.page-controls a.previous';

		var callbacks = __callbacks ? __callbacks : {};
		var default_callbacks = {
			onsetup: function(){},
			on404: function(){},
			onready: function(_this_){},

			hold: false
		};
		
		this.ready = false;
		$.extend(true, _this_, default_callbacks, callbacks);

		this.setup = function()
		{
			slider.flexslider({
				animation: o.home.slider.animation,
				easing: o.home.slider.easing,
				slideshowSpeed: slideshowSpeed,
				animationSpeed: animationSpeed,
				direction: "horizontal",
				controlNav: true,
				directionNav: false,
				selector: ".slides > li",
				animationLoop: true,
				smoothHeight: false,
				useCSS: false,
				prevText: "",
				nextText: "",
				initDelay: 0,
				pauseOnAction: true,
				pauseOnHover: pauseOnHover,
				start: function(slider)
				{
					var captions = slider.find(".slides li").eq(slider.currentSlide).find('.caption');
					captions.hide();
					if(captions.length > 0 )
					{
						var init_pos = captions.eq(slider.currentSlide).position().left;
							rollInCaptions(captions, slider);
							
					}
					
					sliderTimer.current(slider.currentSlide);
					sliderTimer.start();

					slider.find('.flex-direction-nav a, .flex-control-nav.flex-control-paging a').on('click', function()
					{
						sliderTimer.lock();
					});
					if(!window.HTMLCanvasElement)
					{
						slider.find('.flex-control-nav.flex-control-paging li').css({
							'background-image': 'url(resources/images/style/slider-timer.png)'
						});
					}
				},
				after: function(slider)
				{
					var captions = slider.find(".slides li").eq(slider.currentSlide).find('.caption');
					if(captions.length > 0 )
					{
						rollInCaptions(captions, slider);
					}
					sliderTimer.current(slider.currentSlide);
					sliderTimer.start();
				},
				before: function(slider)
				{
					sliderTimer.finish();
					var captions = slider.find(".slides li").eq(slider.animatingTo).find('.caption');
					captions.hide();
				}
			});

		}

		_this_.on('click', slider_next, function(e)
		{
			e.preventDefault();
			slider.flexslider("next");
		});

		_this_.on('click', slider_prev, function(e)
		{
			e.preventDefault();
			slider.flexslider("prev");
		});

		var sliderTimer = {
			i: 0,
			anim: {value: 0},
			canvas: null,
			ctx: null,
			interval: null,
			control: $(),
			locked: false,
			lock: function()
			{
				sliderTimer.locked = true;
			},
			current: function(current)
			{
				sliderTimer.control = slider.find('.flex-control-nav.flex-control-paging li').eq(current);
			},
			start: function()
			{
				if(window.HTMLCanvasElement)
				{
					$(sliderTimer.anim).stop(false, true);
					sliderTimer.canvas.hide();
					sliderTimer.control.append(sliderTimer.canvas);
					sliderTimer.anim.value = 0;
				}else{
					sliderTimer.anim.value = 0;
					slider.find('.flex-control-nav.flex-control-paging li').css({
						'background-position': '0px center'
					});
				}

				sliderTimer.play();
			},
			pause: function()
			{
				if(window.HTMLCanvasElement)
				{
					$(sliderTimer.anim).stop(false, false);
					//console.log('stop timer');
				}
				else
				{
					$(sliderTimer.anim).stop(false, false);
					//console.log('stop timer');
				}
			},
			resume: function()
			{
				sliderTimer.play();
				//console.log('resume timer');
			},
			play: function()
			{
				if(sliderTimer.locked)
				{
					return;
				}

				if(window.HTMLCanvasElement)
				{
					sliderTimer.canvas.show();
					
					$(sliderTimer.anim).animate({
						value: 360
					},{
						queue: false,
						duration: (slideshowSpeed - animationSpeed),
						easing: 'linear',
						step: function(now, fx)
						{
							drawCircle(sliderTimer.ctx, sliderTimer.canvas, now);
						},
						complete: function()
						{
							sliderTimer.canvas.fadeOut(animationSpeed/2);
						}
					});
				}
				else
				{
					$(sliderTimer.anim).animate({
						value: 51
					},{
						queue: false,
						duration: (slideshowSpeed - animationSpeed),
						easing: 'linear',
						step: function(now, fx)
						{
							sliderTimer.control.css({
								'background-position': (0 - Math.ceil(now) * 22) + 'px center'
							})
						},
						complete: function()
						{
							sliderTimer.control.css({
								'background-position': '0px center'
							});
						}
					});
				}
				
			},
			finish: function()
			{
				if(sliderTimer.locked)
				{
					return;
				}
			}
		}


		if(window.HTMLCanvasElement)
		{
			var canvas = $('<canvas width="23px" height="23px">').addClass('slider-timer');
			var ctx = canvas[0].getContext("2d");
			sliderTimer.canvas = canvas;
			sliderTimer.ctx = ctx;
			drawCircle(ctx, canvas, 0);
		}

		function drawCircle(ctx, canvas, degree)
		{
			ctx.clearRect(0, 0, 24, 24);
			//draw a circle
			ctx.beginPath();
			ctx.arc(11.5, 11.5, 9.5, Math.PI * 1.5, (Math.PI * 1.5) + (degree * (Math.PI / 180)), false);
			ctx.moveTo(0, 0);
			ctx.closePath();
			ctx.strokeStyle = "#e9562a";
			ctx.lineWidth = 2;
			ctx.stroke();
		}
		if(pauseOnHover)
		{
			slider.hover(sliderTimer.pause, sliderTimer.resume);
		}


		function rollInCaptions(captions, slider)
		{
			captions.each(function(i)
			{
				var caption = $(this);
				var dir = $(this).attr('data-direction');

				$(this).show();

				var position_x = parseInt( $(this).attr('data-offset-left') );
				var position_y = parseInt( $(this).attr('data-offset-top') );

				//console.log(position_y, position_x);

				$(this).css({
					top: position_y,
					left: dir == undefined || dir == 'right' ? slider.width() + 20 : 0 - (slider.width() + 20)
				}).delay(200 * i).animate({
					left: position_x
				},{
					duration: o.page_switch_speed,
					easing: o.page_switch_easing
				});
				
			});
		}

		if(!this.hold)
		{
			this.setup();
		}
		

		this.on404 = function(__message){};

		this.ready = true;
		return this;
	}
})(jQuery);

/*================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================*/

/* Contacts Page Template Class */
(function($)
{
	$.fn.Contacts = function(options, deeplink, __callbacks)
	{
		var _this_ = this;
		var o = options;
		var name = this.attr('id');

		var map = '.google-map';

		var map_opener = 'a.to-map';
		var label_open = '.map-open';
		var label_closed = '.map-closed';

		var is_map_open = false;
		var is_map_loaded = false;

		/* contact form variables */
		var form = '.contact-form';
		var fields = 'input:not(input[type="submit"]), textarea, select';

		var close_map = $('<a href="#">').addClass('close-map');

		//this.map_opener_top_pos = this.find(map_opener).parent().position().top;
		

		var callbacks = __callbacks ? __callbacks : {};
		var default_callbacks = {
			onsetup: function(){},
			on404: function(){},
			onready: function(_this_){}
		};
		
		this.ready = false;
		$.extend(true, _this_, default_callbacks, callbacks);

		this.loadMap = function(mobile)
		{

			_this_.map_container = $( $('<div>').append(_this_.find(map).clone()).html() );

			var Map = _this_.find(map);
			var lat_long = new google.maps.LatLng(
					parseFloat(Map.attr('data-latitude')), 
					parseFloat(Map.attr('data-longitude'))
				);

			var mapOptions = {
				center: lat_long,
				zoom: parseInt(Map.attr('data-zoom')),
				mapTypeId: google.maps.MapTypeId[
					Map.attr('data-type') && Map.attr('data-type') != '' ? Map.attr('data-type') : 'ROADMAP'
				]
			};
			var gMap = new google.maps.Map(Map[0], mapOptions);

			if(Map.attr('data-pointer-title') != undefined)
			{
				var marker = new google.maps.Marker({
					position: lat_long,
					map: gMap,
					title: Map.attr('data-pointer-title')
				});
			}

			_this_.find(map_opener).addClass('loading-opener');

			google.maps.event.addListener(gMap, 'idle', function()
			{
				is_map_loaded = true;
				_this_.find(map_opener).removeClass('loading-opener');
				_this_.openMap();
			});
		}

		this.openMap = function()
		{
			//console.log(_this_.find(map));
			_this_.find(map).css({
				visibility: 'visible'
			}).animate({
				left: 0,
				opacity: 1
			},{
				queue: false,
				duration: o.page_switch_speed,
				specialEasing: {
					left: o.page_switch_easing,
					opacity: 'easeOutQuad'
				},
				complete: function()
				{
					is_map_open = true;
					_this_.prepend(close_map);

					close_map.animate({
						opacity: 1
					}, {
						queue: false,
						duration: o.page_switch_speed,
						easing: o.page_switch_easing
					});


				}
			});
			

		}

		this.closeMap = function()
		{
			close_map.animate({
				opacity: 0
			}, {
				queue: false,
				duration: o.page_switch_speed / 2,
				easing: o.page_switch_easing,
				complete: function()
				{
					close_map.remove();
				}
			});

			_this_.find(map).animate({
				left: -50,
				opacity: 0
			},{
				queue: false,
				duration: o.page_switch_speed,
				specialEasing: {
					left: o.page_switch_easing,
					opacity: 'easeOutExpo'
				},
				complete: function()
				{
					_this_.find(map).css({
						visibility: 'hidden'
					}).remove();

					_this_.append(_this_.map_container);

					is_map_loaded = false;
					is_map_open = false;
				}
			});

			
		}


		_this_.on('click', map_opener, function(e)
		{
			//e.preventDefault();
			if(is_mobile)
			{
				var Map = _this_.find(map);
				var lat = parseFloat(Map.attr('data-latitude'));
				var lon = parseFloat(Map.attr('data-longitude'));
				var zoom = parseInt(Map.attr('data-zoom'));

				var url = 'https://maps.google.com/maps?q='+lat+','+lon+'&hl=en&ll='+lat+','+lon+'&z='+ zoom +'';

				$(this).attr('href', url).attr('target', '_blank');

				return true;
			}
			else
			{

				if(!is_map_open)
				{
					if(!is_map_loaded)
					{
						_this_.loadMap();
					}else{
						_this_.openMap();
					}
				}else{
					_this_.closeMap();
				}
				return false;
			}
			
		});

		_this_.on('click', '.close-map', function(e)
		{
			e.preventDefault();
			_this_.closeMap();
		});


		/* Contact form functionality */
		function _form()
		{
			_this_.find(form).submit(function(e)
			{
				e.preventDefault();
				var form = $(this);
				var url = form.attr('action');
				var data = form.find(fields).serialize();

				//console.log("here");				

				form.find('[type="submit"]').attr('disabled', 'disabled');

				$.ajax({
					type: "POST",
					url: url,
					data: data,
					error: function(jqXHR, textStatus, errorThrown)
					{

					},
					success: function(data, textStatus, jqXHR)
					{
						//console.log(data);

						var tooltip = $('<div>');
						var _data = $.parseJSON( data );
						if(_data.error && _data.error != 'global')
						{
							form.find(fields).css({
								'border-color': ''
							});

							$('.field-error').fadeOut('fast', function()
							{
								$(this).remove();
							});

							var error_field = form.find('[name="'+ _data.error +'"]');
							error_field.css({
								'border-color': '#ff5050'
							});
							
							tooltip.attr('class', 'field-error message-box error');
							tooltip.html(_data.message);
							tooltip.hide().appendTo(form).fadeIn('fast');
							tooltip.css({
								top: form.find('[type="submit"]').position().top,
								left: form.find('[type="submit"]').position().left + form.find('[type="submit"]').outerWidth(true) + 10
							});
							form.find('[type="submit"]').removeAttr('disabled');
							
						}
						else if(_data.error && _data.error == 'global')
						{
							form.find(fields).css({
								'border-color': ''
							});

							$('.field-error').fadeOut('fast', function()
							{
								$(this).remove();
							});
							
							tooltip.attr('class', 'field-error message-box error');
							tooltip.html(_data.message);
							tooltip.hide().appendTo(form).fadeIn('fast');
							tooltip.css({
								top: form.find('[type="submit"]').position().top,
								left: form.find('[type="submit"]').position().left + form.find('[type="submit"]').outerWidth(true) + 10
							});

							tooltip.delay(10000).fadeOut('slow', function()
							{
								$(this).remove();
								form.find('[type="submit"]').removeAttr('disabled');
							});
						}
						else
						{
							//$('.field-error').fadeOut('fast', function()
							//{
							//	$(this).remove();
							//});

							//form.find(fields).css({
							//	'border-color': ''
							//});
							//tooltip.attr('class', 'form-success message-box success');
							//tooltip.html(_data.message);
							//tooltip.hide().appendTo(form).fadeIn('fast');
							//tooltip.css({
							//	top: form.find('[type="submit"]').position().top,
							//	left: form.find('[type="submit"]').position().left + form.find('[type="submit"]').outerWidth(true) + 10
							//});

							form.find(fields).val('');

							tooltip.delay(4000).fadeOut('slow', function()
							{
								//$(this).remove();
								form.find('[type="submit"]').removeAttr('disabled');
							});
							//$("#match_results_cover").hide();
							//$("#match_results_cover").show();
							$("#mentor_data").html(_data.message);
							scrollto($("#scrole_to"));

						}

							

						//console.log(data);
					}
				})

			});
			
		}




		
		_form();
		this.on404 = function(__message){};

		this.ready = true;
		return this;
	}
})(jQuery);

/*================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================================*/

/* Standart Page Template Class */
(function($)
{
	$.fn.Standart = function(options, deeplink, __callbacks)
	{
		var _this_ = this;
		var o = options;
		var name = this.attr('id');

		var callbacks = __callbacks ? __callbacks : {};
		var default_callbacks = {
			onsetup: function(){},
			on404: function(){},
			onready: function(_this_){}
		};
		
		this.ready = false;
		$.extend(true, _this_, default_callbacks, callbacks);

		this.on404 = function(__message){};

		this.ready = true;
		return this;
	}
})(jQuery);






/* Box Loader Class */
(function($) 
{
	$.fn.BoxLoader = function(options, __callbacks)
	{
		var _this_ = this;
		var o = options;
		var name = this.attr('id');

		var loader_links = 'a.box-loader-link';
		var loader_data_container = '.box-loader-data';
		var box_loader_activate = 'a.box-loader-activate'
		var active_on_load = '.bl-activeate-on-child-link';
		var active_class_to_add = 'active';
		var nav_title = '.box-loader-nav-title';

		var callbacks = __callbacks ? __callbacks : {};
		var default_callbacks = {
			onsetup: function(){},
			on404: function(){},
			onready: function(_this_){}
		};
		
		this.ready = false;
		$.extend(true, _this_, default_callbacks, callbacks);

		this.setup = function()
		{
			var activator = _this_.find(box_loader_activate);
			if(activator.length > 0)
			{
				//console.log(activator);
				if(activator.length > 1)
				{
					var _href = $(activator[0]).attr('href');
					_this_.loadData(_href, activator[0]);
				}else{
					var _href = $(activator).attr('href');
					_this_.loadData(_href, activator);
				}
			}
		}


		this.loadData = function(__href, __element)
		{
			if(__href && __href != '' && __href != '#')
			{
				var _url = __href.split('#')[0];
				var _data_container = '#' + __href.split('#')[1];

				if(_this_.find(active_on_load).length > 0)
				{
					_this_.find(active_on_load)
						.removeClass(active_class_to_add)
						.has(__element).addClass(active_class_to_add);
				}else{
					_this_.find(loader_links).removeClass(active_class_to_add);
					__element.addClass(active_class_to_add);
				}
				

				var _obj = {
					section: _this_, 
					url: _url,
					page_container: _this_.find(loader_data_container),
					data_container: _data_container ? _data_container : 'body',
					data_container_self: true,
					advanced_height: true,
					direction: 'next', 
					success: function(data)
					{
						//console.log('loaded');
						imgCanvas();

					},
					complete: function()
					{
						//console.log('complete');
					},
					error: function(code)
					{
						//console.log(code);
					}
				};

				var text = _this_.find(loader_links).filter('a[href="'+ __href +'"]');
				if (text.length > 0)
				{
					_this_.find(nav_title).html(text.html());
				}

				switchPage(_obj);
			}
		}

		_this_.on('click', loader_links, function(e)
		{
			e.preventDefault();
			var _href = $(this).attr('href');

			_this_.loadData(_href, $(this));
		});

		this.setup();

		this.on404 = function(__message){};

		this.ready = true;
		return this;
	}
})(jQuery);















/* Ajax Loader */
var retries = 0;
var AjaxQueue = new Array();

function loadData(__object)
{
	if(__object.url && typeof(__object.url) == 'string')
	{
		if(firstLoad)
		{
			AjaxQueue.push( toAjax(__object) );
		}
		else
		{
			toAjax(__object);
		}
	}
}

var toAjax = function(__object)
{
	//console.log('sending to ajax', AjaxQueue);

	$('.mobile-preloader').show();

	return $.ajax({
		type: "GET",
		url: __object.url,
		dataType: 'text',
		context: document.body,
		cache: true,
		error: function(jqXHR, textStatus, errorThrown)
		{
			retries++;
			//console.log('Error lodaing data')
			if(retries < 3)
			{
				loadData(__object);
			}
			else
			{
				retries = 0;
				if(__object.error)
				{
					__object.error(textStatus);
				}
			}
			
		},
		statusCode: {
			404: function()
			{
				if(__object.section)
				{
					__object.section.on404('Could Not Load Data');
				}
			},
			412: function()
			{
				if(retries < 3)
				{
					loadData(__object);
				}
				else
				{
					retries = 0;
					if(__object.error)
					{
						__object.error(textStatus);
					}
				}
			}
		},
		beforeSend: function(jqXHR, textStatus)
		{
			jqXHR.setRequestHeader('Cache-Control', 'max-age=604800');
			if(__object.before)
			{
				__object.before();
			}
		},
		success: function(data, textStatus, jqXHR)
		{
			if(__object.success)
			{
				try
				{
					var doc = document.implementation.createHTMLDocument('');
					doc.documentElement.innerHTML = data;
				}
				catch(error)
				{
					var pattern = "<body[^>]*>([^<]*(?:(?!<\/?body)<[^<]*)*)<\/body\s*>";
					var re = new RegExp(pattern, 'i');
					var resault = re.exec(data);

					//console.log(resault[0]);
					if(resault)
					{
						var docIE = $(resault);
						docIE.find('head, script, style, meta, title, link').remove();
						var doc = docIE[0];
					}else{
						//console.error('The loaded document can not be parsed.');
					}
						
						
				}

				//console.log(doc);

				__object.success(doc);
			}
			retries = 0;
			$('.mobile-preloader').hide();
		}
	});
}

/* Animations */
function switchPage(__data)
{
	$('.mobile-preloader').show();
	__data.page_container.css({
		height: __data.advanced_height ? __data.section.height() - (__data.section.height() - __data.page_container.height()) : __data.section.height()
	}).animate({
		left: __data.direction == 'prev' ? !is_mobile ? 25 : 0 : !is_mobile ? -25 : 0,
		opacity: 0
	},{
		queue: false,
		duration: !is_mobile ? o.page_switch_speed : 1,
		specialEasing: {
			left: o.page_switch_easing,
			opacity: 'easeOutExpo'
		},
		complete: function()
		{
			$('.mobile-preloader').hide();
			if(__data.url)
			{
				if(!__data.do_not_append)
				{
					__data.page_container.empty();
				}
				loadData({
					section: __data.section,
					url: __data.url,
					success: function(data)
					{

						var new_content_data = !__data.data_container_self ? $(data).find(__data.data_container).children() : $(data).find(__data.data_container);

						//console.log(new_content_data);
						if(!__data.do_not_append)
						{
							__data.page_container.append(new_content_data)
						}

						var has_slider = __data.section.find('.project-media.slider').length > 0 ? true : false;
						
						var imgs = new_content_data.find('img').length;

						if(imgs > 0)
						{
							var im = 0;

							if(__data.section.loading)
							{
								__data.section.loading();
							}

							new_content_data.find('img').on('load', function()
							{
								im++;
								//console.log(imgs, im)
								if(imgs == im)
								{
									if(__data.section.loaded)
									{
										__data.section.loaded();
									}

									//console.log(new_content_data.find(hover_images).length)
									setTimeout(function()
									{
										continuePageSwitch(__data);
									}, 200);
									
								}
							});
							
						}
						else
						{
							continuePageSwitch(__data);
						}

						if(__data.success)
						{
							__data.success($(data));	
						}
						
					},
					error: function(code)
					{
						switchBack(__data);
						if(__data.error)
						{
							__data.error(code);	
						}
					}

				});
			}
			else
			{
				__data.page_container.css({
					left: __data.direction == 'prev' ? !is_mobile ? -50 : 0 : !is_mobile ? 50 : 0,
					opacity: 0,
					height: 'auto'
				}).animate({
					left: 0,
					opacity: 1
				},{
					queue: false,
					duration: o.page_switch_speed,
					specialEasing: {
						left: o.page_switch_easing,
						opacity: 'easeOutQuad'
					}
				});

				if(__data.callback)
				{
					__data.callback();	
				}
			}
			
		}
	});
}

function continuePageSwitch(__data)
{
	__data.page_container.css({
		left: __data.direction == 'prev' ? !is_mobile ? -50 : 0 : !is_mobile ? 50 : 0,
		opacity: 0,
		height: 'auto'
	}).animate({
		left: 0,
		opacity: 1
	},{
		queue: false,
		duration: !is_mobile ? o.page_switch_speed : 1,
		specialEasing: {
			left: o.page_switch_easing,
			opacity: 'easeOutQuad'
		},
		complete: function()
		{
			if(__data.complete)
			{
				__data.complete();
			}
		}
	});
}

function switchBack(__data, __stop)
{
	__data.page_container.animate({
		left: !is_mobile ? 25 : 0,
		opacity: !is_mobile ? 0 : 1
	},{
		queue: false,
		duration: !is_mobile ? o.page_switch_speed : 1,
		specialEasing: {
			left: o.page_switch_easing,
			opacity: 'easeOutExpo'
		},
		complete: function()
		{
			__data.page_container.empty();

			if(__data.section.stored)
			{
				__data.section.stored.appendTo(__data.page_container);
				__data.section.setup();
			}
			//console.log('<----', __stop);

			if(!__stop)
			{
				__data.page_container.css({
					left: !is_mobile ? -50 : 0,
					opacity: !is_mobile ? 0 : 1,
					height: 'auto'
				}).animate({
					left: 0,
					opacity: 1
				},{
					queue: false,
					duration: !is_mobile ? o.page_switch_speed : 1,
					specialEasing: {
						left: o.page_switch_easing,
						opacity: 'easeOutQuad'
					}
				});
			}

			

			if(__data.callback)
			{
				__data.callback();
			}
		}
	});
}

function switchAnimate(__section, __complete)
{
	var holder = __section.find('.section-holder');

	holder.animate({
		opacity: 0,
		left: -25
	},{
		queue: false,
		duration: !is_mobile ? o.page_switch_speed : 0,
		specialEasing: {
			left: o.page_switch_easing,
			opacity: o.page_switch_easing
		},
		complete: function()
		{
			if(__complete)
			{
				__complete();
			}
			holder.css({
				opacity: 0,
				left: 50
			}).animate({
				opacity: 1,
				left: 0
			},{
				queue: false,
				duration: !is_mobile ? o.page_switch_speed : 0,
				specialEasing: {
					left: o.page_switch_easing,
					opacity: 'easeOutQuad'
				},
				complete: function()
				{
					
				}
			});

		}
	});
}



/* HISTORY CLASS */
(function($)
{
	$.Deeplink = function()
	{
		var deeplink = this;
		deeplink.ignor_hash = false;
		deeplink.state = new Array();
		deeplink.is_HTML5 = window.history && window.history.pushState ? true : false
		function getState()
		{
			var hash = window.location.hash;
			var state = hash != "" && hash.substring(0,2) == "#/" ? hash.split('/') : hash;
			return state;
		}
		function setState(hash)
		{
			if(window.location.hash !=  '#' + hash)
			{
				window.location.hash = hash;
			}else{
				//deeplink.changed( deeplink.state );
			}
			//console.log(window.location.hash, hash);
			return true;
		}
		function replaceState(state)
		{
			var new_location = window.location.toString().split('#');
			//console.log(new_location);
			window.location.replace( new_location[0] + '#/' +state.join('/') );
			return true;
		}
		this.set = function(state)
		{
			var hash = '/' + state.join('/');
			setState(hash);
		}
		this.replace = function(state)
		{
			replaceState(state);
		}
		this.get = function()
		{
			return getState();
		}
		this.changed = function(){}
		this.ignor = function()
		{
			deeplink.ignor_hash = true;
		}
		this.unignor = function()
		{
			deeplink.ignor_hash = false;
		}
		$(window).on('hashchange', function() 
		{
			if(!deeplink.ignor_hash)
			{
				deeplink.state = getState();
				deeplink.changed( deeplink.state );
			}
			deeplink.unignor();
			//console.log('Hash Changed!', getState());
		});
		return this;
	}
})(jQuery);

