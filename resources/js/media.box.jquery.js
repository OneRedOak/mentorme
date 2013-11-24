(function($)
{ 
	jQuery.mediaBox = function(_options)
	{

		//defining element
		var element = this;
		
		//asign default option
		var defaults = {
			element: 'a.mediabox',
			gallery: '.media-gallery',
			duration: 500,
			easing: 'linear',
			onChange: function(){},
			onOpen: function(){},
			onComplete: function(){},
			onLoad: function(){},
			onNext: function(){},
			onPrevious: function(){},
			onClose: function(){}
		};
		//extend default option
		var o = $.extend(true, {}, defaults, _options);

		if( typeof(o.element) != 'string' )
		{
			throw new Error('Property "element" must be a selector not ' + typeof(o.element) + '. Example: "a.mediabox".');
		}

		if( typeof(o.gallery) != 'string' )
		{
			throw new Error('Property "gallery" must be a selector not ' + typeof(o.gallery) + '. Example: "ul.media-box".');
		}

		//
		var body = $('body');
		var box = new Box();

		function getGalleriesString()
		{
			var galleries = o.gallery.replace(/\s/g, '').split(',');

			for(var i = 0; i < galleries.length; i++)
			{
				galleries[i] = galleries[i] + ' a';
			}

			//console.log(galleries);

			return galleries.join(', ');
		}
		

		function Box()
		{
			var box = this;
			var container = $('<div class="media-box"></div>');
			var ie8bg = $('<div class="bg"></div>');
			var media_holder = $('<div class="media-box-media"></div>');
			var title_holder = $('<div class="media-box-title"></div>');
			var controls_holder = $('<div class="media-box-controls"></div>');
			var back = $('<a class="media-box-back" href="#back"></a>');
			var next = $('<a class="media-box-next" href="#next"></a>');
			var close = $('<a class="media-box-close" href="#close"></a>');
			var was_closed = true;

			this.ie8bg = ie8bg;
			this.container = container;
			this.media = new Object();
			this.gallery = $();
			this.current = 0;

			//apply initial css properties
			media_holder.css({
				opacity: 0
			});


			function Gallery(__anchor)
			{
				//
				var anchors = $();
				anchors = $(o.gallery).has( __anchor ).find('a');

				return anchors;
			}



			function URL(__url)
			{
				var patterns = {
					image: /^.*\.(jpeg|jpg|gif|png)$/,
					youtube: /^.*((youtu.be\/)|(v\/)|(watch\?))v?=?([^#\&\?]*).*/,
					vimeo: /^.*(vimeo.com)\/(\d+)/
				};

				var match = null;

				for(var pattern in patterns)
				{
					match = __url.match(patterns[pattern]);
					
					if(match)
					{
						//console.log('Provided URL is', pattern );
						//console.log( match );
						var proccesed = {
							url: __url,
							type: pattern,
							id: match[match.length - 1]
						}
					}
				}
				return proccesed;
			}

			this.load = function(__anchor, __direction)
			{
				var index = 0;
				var url = '';
				var title = '';

				if(typeof(__anchor) != 'string')
				{
					index = box.gallery.index(__anchor);
					url = __anchor.attr('href');
					title = __anchor.attr('title') != undefined ? __anchor.attr('title') : '';

					//console.log(url);
				}
				else
				{
					index = 0;
					url = __anchor;
				}

				var urlObject = new URL(url);

				switch(urlObject.type)
				{
					case 'image':
						var src = urlObject.url;
						if(isIE() < 9 )
						{
							src = urlObject.url + '?c=' + Math.random(10) * 100;
						}
						var img = $('<img />').attr('src', src).
							load(function()
							{
								loadComplete(img, title, index, __direction )
							});
					break;
					case 'youtube':
						var width = typeof(__anchor) != 'string' && __anchor.attr('data-dimension') != undefined ? __anchor.attr('data-dimension').split('x')[0] : '840';

						var height = typeof(__anchor) != 'string' && __anchor.attr('data-dimension') != undefined ? __anchor.attr('data-dimension').split('x')[1] : '520';

						//console.log(width,height);

						var iframe = $('<iframe id="media-box-youtube" width="'+width+'" height="'+height+'" src="http://www.youtube.com/embed/'+ urlObject.id + '" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');

						iframe.hide();
						loadComplete(iframe, title, index, __direction );

					break;
					case 'vimeo':
						var width = typeof(__anchor) != 'string' && __anchor.attr('data-dimension') != undefined ? __anchor.attr('data-dimension').split('x')[0] : '840';

						var height = typeof(__anchor) != 'string' && __anchor.attr('data-dimension') != undefined ? __anchor.attr('data-dimension').split('x')[1] : '520';

						//console.log(width,height);

						var iframe = $('<iframe src="http://player.vimeo.com/video/'+urlObject.id+'" width="'+width+'" height="'+height+'" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>');

						iframe.hide();
						loadComplete(iframe, title, index, __direction );

					break;
					default:
						var width = typeof(__anchor) != 'string' && __anchor.attr('data-dimension') != undefined ? __anchor.attr('data-dimension').split('x')[0] : '840';

						var height = typeof(__anchor) != 'string' && __anchor.attr('data-dimension') != undefined ? __anchor.attr('data-dimension').split('x')[1] : '520';

						//console.log(width,height);

						var iframe = $('<iframe src="'+url+'" width="'+width+'" height="'+height+'" frameborder="0"></iframe>');

						iframe.hide();
						loadComplete(iframe, title, index, __direction );

					break;
				}
				
			}

			function loadComplete(__media, __title, __index, __direction )
			{
				box.current = __index;

				box.media.slideIn(__media, __title, __direction);
				box.updateControls();

				was_closed ? o.onLoad() : o.onChange();
				was_closed = false;

				console.log('loaded');
			}

			//
			this.adjustMedia = function()
			{
				var center_v = $(window).height() / 2 - media_holder.height() / 2;
				var center_h = $(window).width() / 2 - media_holder.width() / 2;
				media_holder.css({
					'top': center_v,
					'left': center_h
				});
			}

			this.Open = function(__anchor)
			{
				was_closed = true;
				box.gallery = $();

				if(typeof(__anchor) != 'string')
				{
					box.gallery = new Gallery( __anchor );
				}

				if(isIE() < 9 )
				{
					box.ie8bg.appendTo(box.container);
				}
				box.container.appendTo(body);

				

				box.container.fadeIn(o.duration, o.easing);
				media_holder.empty();
				controls_holder.empty();

				if(box.gallery.length > 0)
				{
					controls_holder.append(back).append(close).append(next);
				}else{
					controls_holder.append(close);
				}

				/*IE fix if the background-color and color are animated with jQuery*/
				close.css({
					'color': '',
					'background-color': ''
				});

				box.load( __anchor );
				o.onOpen();
				//console.log(box.gallery, $(this));
			}

			this.Close = function()
			{
				box.container.fadeOut(o.duration, o.easing, function()
				{
					box.container.remove();
				});
			}

			this.Next = function()
			{
				var url = box.gallery.eq(box.current + 1);
				box.load( url, 'next' );
				o.onNext();
			}

			this.Previous = function()
			{
				var url = box.gallery.eq(box.current - 1);
				box.load( url, 'prev' );
				o.onPrevious();
			}


			this.media.slideIn = function(__media, __title, __direction)
			{
				title_holder.html(__title != '' ? '<p>'+__title+'</p>' : '');

				box.media.slideOut(function()
				{
					console.log('out');
					media_holder.empty();
					__media.appendTo(media_holder);

					if(!__media.is('iframe'))
					{
						doSlideIn();
					}
					else
					{
						media_holder.find('iframe').load(function()
							{
								$(this).show();
								doSlideIn();
							});
					}


					
					
					function doSlideIn()
					{
						console.log('in');
						var center_v = $(window).height() / 2 - media_holder.height() / 2;
						var center_h = ($(window).width() - 22) / 2 - media_holder.width() / 2;

						$(media_holder, title_holder).css({
							'top': center_v,
							'left': __direction != 'prev' ? center_h + 50 : center_h - 50,
							'opacity': 0
						}).animate({
							'left': center_h,
							'opacity': 1
						},{
							queue: false,
							duration: o.duration,
							easing: o.easing
						});
					}
					
				}, __direction);

				
			}

			this.media.slideOut = function( __callback, __direction )
			{
				var center_v = $(window).height() / 2 - media_holder.height() / 2;
				var center_h = ($(window).width() - 22) / 2 - media_holder.width() / 2;

				$(media_holder, title_holder).animate({
					'left': __direction != 'prev' ? center_h - 50 : center_h + 50
				},{
					queue: false,
					duration: o.duration,
					easing: o.easing,
					complete: function()
					{
						if(__callback)
						{
							__callback();
						}
					}
				});

				$(media_holder, title_holder).animate({
					'opacity': 0
				},{
					queue: false,
					duration: o.duration / 2,
					easing: o.easing
				});
			}

			this.updateControls = function()
			{
				if(box.current < 1)
				{
					back.css({
						cursor: 'default'
					}).animate({
						opacity: 0
					},{
						queue: false,
						duration: o.duration,
						easing: o.easing
					});
				}
				else
				{
					back.css({
						cursor: 'pointer'
					}).animate({
						opacity: 1
					},{
						queue: false,
						duration: o.duration,
						easing: o.easing
					});
				}

				if(box.current > box.gallery.length - 2)
				{
					next.css({
						cursor: 'default'
					}).animate({
						opacity: 0
					},{
						queue: false,
						duration: o.duration,
						easing: o.easing
					});
				}
				else
				{
					next.css({
						cursor: 'pointer'
					}).animate({
						opacity: 1
					},{
						queue: false,
						duration: o.duration,
						easing: o.easing
					});
				}
			}


			$(document).on( 'click', 'a.media-box-back', function(e)
			{
				e.preventDefault();
				if(box.current > 0)
				{
					box.Previous();
				}
			});

			$(document).on( 'click', 'a.media-box-next', function(e)
			{
				e.preventDefault();
				if(box.current < box.gallery.length)
				{
					box.Next();
				}
			});

			$(document).on( 'click', 'a.media-box-close', function(e)
			{
				e.preventDefault();
				box.Close();
				o.onClose();
			});

			//
			container.hide().append(media_holder).append(title_holder).append(controls_holder);

			return this;
		}

		//on element click
		$(document).on('click', o.element, function(e)
		{
			e.preventDefault();
			box.Open( $(this) );
		});

		$(document).on('click', getGalleriesString(), function(e)
		{
			e.preventDefault();
			box.Open( $(this) );
		});

		
		//adjust the media to the center of window when borowser is resized
		$(window).on('resize', function()
		{
			box.adjustMedia();
		});

		function isIE()
		{
			return navigator.appVersion.indexOf("MSIE") != -1 ? parseFloat(navigator.appVersion.split("MSIE")[1]) : -1
		}

		//box.Open( 'resources/images/gallery/images/02.jpg' );

		return box;
	}
	
})(jQuery);