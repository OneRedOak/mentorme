(function($){ 
	jQuery.fn.filtergallery = function(_filter, _options)
	{
		//defining element and filter variables 
		var element = this,
			
			filter = _filter;
		
		//asign default option
		var defaults = {
			duration: 750,
			attribute: 'data-tag',
			items: element.children(),
			active: 'fg-active',
			filter: {
						auto: false,
						all: '',
						before: '',
						after: ''
					},
			autostart: true,
			external: '.external-filter',
			easing: 'swing',
			max_all: 0,
			masonry: {
				enable: false,
				columns: 2,
				right_gap: 0,
				bottom_gap: -1
			},
			before: function(__tag)
			{
				element.reorder(__tag);
			},
			start: function(){},
			complete: function(){},
			update: function(){}
		};
		//extend default option
		var o = $.extend(true, {}, defaults, _options); 
		
		//other variables
		var itempos = new Array();
		var mathItems = new Array();
		var current_filter_public = '';
		var items = o.items,
			elemenHeight = 0,
			new_height = 0;

		this.setColumns = function(__value)
		{
			o.masonry.columns = __value;
		}
		
		//init plugin structure
		function _init()
		{
			items.each(function(i)
			{
				var item = $(this);
				item.addClass('matched');
				elemenHeight = element.height();

				itempos[i] = {
					'y' : item.position().top,
					'x' : item.position().left,
					'height' : item.height(),
					'width' : item.width()
				};

				mathItems[i] = {
					'y' : item.position().top,
					'x' : item.position().left,
					'height' : item.height(),
					'width' : item.width(),
					'item' : item
				}
				//set element height
				element.css({
					'height' : elemenHeight
				});
			});
			//set absolute positions
			items.each(function(i)
			{
				var item = $(this);
				item.css({
					'position' : 'absolute',
					'top' : itempos[i].y,
					'left' :  itempos[i].x
				})
				item.data( '_height', item.height() );
			})
			//generate filter tags if auto generation of filters set to true
			if(o.filter.auto)
			{
				_buildFilter();
			}
			//filter by first tag if auto filtering set to true
			if(o.autostart && filter.find('a:first').length > 0)
			{
				var firstanchor = filter.find('a:first'),
					tag = firstanchor.attr('href').substr(1);
				//add active class to the first filter element
				_activeclass( firstanchor );
				//check if the first filter element is not "all" then continue 
				//if the first element is all plugin-will not continue until any filter element is clicked
				if(tag != 'all')
				{
					_reorder( _checkmatches(tag), false, false );
				}
			}

			_masonry(items);

			if(o.masonry.enable)
			{
				_reorder( _checkmatches('all'), false, false );
			}
			//Filter click handeler
			filter.find('a').on('click', function()
			{
				var tag = $(this).attr('href').substr(1);
				//call to add the active class
				_activeclass( $(this) );
				//trace('click');
				o.before(tag);
				return false;
			});

			//filter by external filters

			element.on('click', o.external, function(e)
			{
				e.preventDefault();
				var tag = $(this).attr('href').substr(1);
				o.before(tag);
				
				var all_filters = filter.find('a');
				//
				all_filters.each(function()
				{
					if($(this).attr('href').substr(1) == tag)
					{
						_activeclass( $(this) )
					}
				});
				//
			});
		}

		function percent(__container, __percent)
		{
			var num = parseInt( __percent.substring(0, __percent.length - 1) );
			var percent = Math.floor(__container.width() * num / 100);
			return percent;
		}

		function _masonry(__matched)
		{
			mathItems = new Array();
			if(  typeof(o.masonry.right_gap) == 'number' )
			{
				var column_width = $(__matched[0]).width() + o.masonry.right_gap;
			}
			else if( typeof(o.masonry.right_gap) == 'string' )
			{
				var column_width = $(__matched[0]).width() + percent(element, o.masonry.right_gap);
			}

			var bottom_gap = 0;
			if(o.masonry.bottom_gap < 0)
			{
				bottom_gap = percent(element, o.masonry.right_gap)
			}else{
				bottom_gap = o.masonry.bottom_gap;
			}

			$.each(__matched,function(i)
			{
				var item = $(this);
				mathItems[i] = {
					'y' : item.position().top,
					'x' : item.position().left,
					'height' : item.height(),
					'width' : item.width(),
					'item' : item
				}

				mathItems[i].x = column_width * (i % o.masonry.columns)

				if(i < o.masonry.columns)
				{
					mathItems[i].y = 0;
				}
				else
				{
					mathItems[i].y = (mathItems[i - o.masonry.columns].y + mathItems[i - o.masonry.columns].height) + bottom_gap;
				}
			});
		}

		this.reorder = function(__tag, __no_anim)
		{
			_reorder( _checkmatches(__tag), __no_anim ? true : false, true );

			//get the filter anchor tag with href value = __tag
			var anchors = filter.find('a');
			var anchor;
			anchors.each(function()
			{
				if( $(this).attr('href').substring(1) == __tag )
				{
					anchor = $(this);
				}
				
			})
			if(anchor != undefined)
			{
				_activeclass(anchor);
			}
			//console.log('doing reorder on callback');
		}
		//
		function _activeclass(__anchor)
		{
			var container = __anchor.parentsUntil(filter),
				active = $(container[container.length - 1]),
				rest = active.siblings();
			//check if fliter anchor tags hav parents or these are the children of the filter container
			if(active.length > 0)
			{
				//removing active class from the rest
				rest.removeClass(o.active);
				filter.children().removeClass(o.active);
				//applying class to the active filter
				active.addClass(o.active);
			}else{
				//removing active class from the rest of anchor tags
				__anchor.siblings().removeClass(o.active)
				//applying class to the active anchor filter
				__anchor.addClass(o.active);
			}
			current_filter_public = __anchor.attr('href').substr(1);
		}
		//build filter depending on tags that are present in items
		function _buildFilter()
		{
			var tags = [],
				tag = [];
			
			items.each(function(i)
			{
				var item = $(this),
					tagGroup = item.attr(o.attribute).split(',');
				//trim whitespaces from each tag
				$.each(tagGroup, function(key, value)
				{
					value = $.trim(value);
					tagGroup[key] = value;
				});
				tag.push(tagGroup);
				//merge all tags into one array
				tags = $.merge( tags, tag[i] );
			});
			//remove duplicate items from array
			$.unique(tags);
			//adding show all tag if defined
			if( o.filter.all != '' )
			{
				_createFilterItem( o.filter.all, 'all' );
			}
			
			//formate tags, text and href attribute values of anchor elements
			$.each(tags, function(key, value)
			{
				var __tag = value.toLowerCase().split(' ').join('_');
				_createFilterItem(value, __tag);
			});
			
			//create and add tags to filter
			function _createFilterItem(__text, __tag)
			{
				//create container for anchor element based on before and after values from options
				var tagcontainer = o.filter.before + o.filter.after;
				
				//create default anchor element
				var a = $('<a>',{
						html: __text,
						href: '#' + __tag
					})
				//add newly created anchor elemet to the filter
				a.appendTo(filter);
				//wrap above anchor element in the container
				if(tagcontainer != '')
				{
					a.wrap(tagcontainer)
				}
			}
		}
		//check for matches using the tag value of filter and tags put on gallery items
		function _checkmatches(__tag)
		{
			var matched = [],
				rest = [];
			//getting tags from gallery elements
			items.each(function(i)
			{
				var item = $(this),
					tags = item.attr(o.attribute).split(',')
				//looping through the tags
				$.each(tags, function(key, value)
				{
					value = $.trim(value);
					tags[key] = value;
					//checking if there is a match
					if(__tag == value )
					{
						//adding all items to an array that match 
						matched.push(item);
					}
				});
				//checking if the tag was all
				if(__tag == 'all')
				{
					//adding all items to array
					if(o.max_all > 0)
					{
						if(i < o.max_all)
						{
							matched.push(item);
						}
					}
					else
					{
						matched.push(item);
					}
					
				}
			});
			//call to reorder function with argument: array with all matched elements
			return matched;
		}
		
		//reorder items gallery according to tag(s)
		function _reorder(__matched, __no_anim, __call_comp)
		{
			var forStep = {scale: 1}
			var start = { position: 0 },
				end = { position: 100 };
			//callback on start
			o.start(__matched);
			
			//animate all items to their initial positions

			_masonry(__matched);
			
			items.each(function(i)
			{
				var item = $(this);
				item.removeClass('matched');

				if($.browser.msie && parseInt($.browser.version, 10) < 9 )
				{
					item.stop().animate({
						top: itempos[i].y,
						left: itempos[i].x,
						opacity: 0
					}, {
						queue: false,
						duration: __no_anim ? 0 : o.duration,
						easing: o.easing
					});
				}
				else
				{
					item.stop().animate({
						opacity: 0
					}, {
						queue: false,
						duration: __no_anim ? 0 : o.duration,
						easing: o.easing,
						complete: function()
						{
							$(this).hide();
							/*$(this).css({
								top: itempos[i].y,
								left: itempos[i].x,
							});*/
						}
					});

					/*$(forStep).animate({
						scale: 0
					}, {
						queue: false,
						duration: __no_anim ? 0 : o.duration,
						easing: o.easing,
						step: function(now, fx)
						{
							item.css({
								'transform': 'scale('+now+','+now+')',
								'-ms-transform': 'scale('+now+','+now+')',
								'-webkit-transform': 'scale('+now+','+now+')',
								'-o-transform': 'scale('+now+','+now+')',
								'-moz-transform': 'scale('+now+','+now+')'
							})
						}
					});*/

				}
			});

			//animate the matched elements to their new positions
			$.each(__matched,function(i)
			{
				//console.log(mathItems[i].x);
				var item = $(this);
				item.addClass('matched');
				
				if($.browser.msie && parseInt($.browser.version, 10) < 9 )
				{
					item.stop().show().animate({
						top: o.masonry.enable ? mathItems[i].y : itempos[i].y,
						left: o.masonry.enable ? mathItems[i].x : itempos[i].x,
						opacity: 1
					}, {
						queue: false,
						duration: __no_anim ? 0 : o.duration,
						easing: o.easing
					});
				}
				else
				{
					item.stop().show().animate({
						top: o.masonry.enable ? mathItems[i].y : itempos[i].y,
						left: o.masonry.enable ? mathItems[i].x : itempos[i].x,
						opacity: 1
					}, {
						queue: false,
						duration: __no_anim ? 0 : o.duration,
						easing: o.easing,
					});

					/*$(forStep).animate({
						scale: 1
					}, {
						queue: false,
						duration: __no_anim ? 0 : o.duration,
						easing: o.easing,
						step: function(now, fx)
						{
							item.css({
								'transform': 'scale('+now+','+now+')',
								'-ms-transform': 'scale('+now+','+now+')',
								'-webkit-transform': 'scale('+now+','+now+')',
								'-o-transform': 'scale('+now+','+now+')',
								'-moz-transform': 'scale('+now+','+now+')'
							})
						}
					});*/
				}
			});
			
			//adjust element height
			var item_y_poses = new Array();

			$.each(__matched, function(i)
			{
				item_y_poses.push( 
					o.masonry.enable ? mathItems[i].y + mathItems[i].height : itempos[i].y + itempos[i].height
				);
			});
			new_height = Math.max.apply(Math, item_y_poses);
			//console.log(new_height);
			element.stop(true, false).animate({
				height : new_height
			}, 
			{
				queue: false,
				duration: __no_anim ? 0 : o.duration,
				easing: o.easing
			});

			//callback functions update and complete
			$(start).animate(end,{
				duration : __no_anim ? 0 : o.duration, 
				easing : 'linear',
				step: function( now, fx )
				{
					o.update(now, __matched);
				},
				complete: function()
				{
					if(__call_comp)
					{
						o.complete(__matched);
					}
				}	
			});
			
		}
		//initiate plugin functionality
		_init();
		
		//method to handle position reset when browser window is resized
		this.reset = function(){
			//trace('reset...')
			_masonry(items);
			items.each(function(i)
			{
				var item = $(this);
				
				item.css({
					'position' : 'static',
					'display'  : 'inline-block'
				});
				
				if($.browser.msie && parseInt($.browser.version, 10) < 9 )
				{
					item.css({
						top: o.masonry.enable ? mathItems[i].y : itempos[i].y,
						left: o.masonry.enable ? mathItems[i].x : itempos[i].x,
						opacity: 0
					});
				}
				else
				{
					item.css({
						top: o.masonry.enable ? mathItems[i].y : itempos[i].y,
						left: o.masonry.enable ? mathItems[i].x : itempos[i].x,
						opacity: 0
					});
				}
				
			});
			
			items.each(function(i)
			{
				var item = $(this);
				elemenHeight = element.height();
				
				itempos[i] = {
					'y' : item.position().top,
					'x' : item.position().left,
					'height' : item.height(),
					'width' : item.width()
				};
				//reset element height
				element.css({
					'height' : elemenHeight
				});
			});
			//reset absolute positions
			items.each(function(i)
			{
				var item = $(this)
				item.css({
					'position' : 'absolute',
					top: o.masonry.enable ? mathItems[i].y : itempos[i].y,
					left: o.masonry.enable ? mathItems[i].x : itempos[i].x
				});
				item.data( '_height', item.height() );
			});
			_reorder( _checkmatches(current_filter_public), true, false );
			
		}

		this.more = function(__new_item)
		{
			//console.log('more called on: ', this);
			__new_item.appendTo(element);
			console.log('loaded');

			__new_item.css({
				'opacity': 0
			});
			
			items = element.children();

			items.each(function(i)
			{
				var item = $(this);
				
				item.css({
					'position' : 'static',
					'display'  : 'inline-block'
				});
				
			});
			
			items.each(function(i)
			{
				var item = $(this);
				elemenHeight = element.height();
				
				itempos[i] = {
					'y' : item.position().top,
					'x' : item.position().left,
					'height' : item.height(),
					'width' : item.width()
				};
				//reset element height
				element.css({
					'height' : elemenHeight
				});
			});

			_masonry(items);
			//reset absolute positions
			items.each(function(i)
			{
				var item = $(this)
				item.css({
					'position' : 'absolute',
					top: o.masonry.enable ? mathItems[i].y : itempos[i].y,
					left: o.masonry.enable ? mathItems[i].x : itempos[i].x
				});
				item.data( '_height', item.height() );
			});

			_reorder( _checkmatches(current_filter_public), false, false );
		}
		return this;
	}
	
})(jQuery);