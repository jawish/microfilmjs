/** 
 * microfilm.js
 * Browsable, filterable slides
 * 
 * @author  Jawish Hameed <jaa@semicolon.com.mv>
 * @copyright   Semicolon Pvt Ltd <semicolon.com.mv>
 * @license MIT
 * @version 1.4 (02-03-2014)
 */
;(function ($) {
    var plugin = 'microfilm',
        $plugin,
        $this,
        activeId = 1,
        openId = 0,
        displayPages = [],
        displayOffset = 0,
        pages = [],
        activeFilter = 'all',
        pageWidthLarge;

    // Private function definitions
    function filterPages(category) {
        displayPages = [];
        activeFilter = category;
        
        for (var i = 0, max = pages.length; i < max; i++) {
            if (!pages[i].hasClass(activeFilter) && activeFilter != 'all') {
                pages[i].fadeOut();
                $($plugin.settings.tocLinkSelector+'[data-target="' + pages[i].attr('data-id') + '"]').addClass('disabled');
            }
            else {
                pages[i].fadeIn();
                displayPages.push(pages[i].attr('data-id'));
                $($plugin.settings.tocLinkSelector+'[data-target="' + pages[i].attr('data-id') + '"]').removeClass('disabled');
            }
        }
        
        // Set the first visible page as active
        activeId = displayPages[0];
        displayOffset = 0;
        
        // Seek the newly active page
        $this.trigger('microfilm.seek');
    }
    
    function seekPage(e, open) {
        // Stop any animation underway
        $this.find('.container').stop();
        
        // Reset open page
        if (openId > 0) {
            var $openElem = pages[openId - 1];
            $openElem.removeClass('large').find('.full').hide().empty();
            $openElem.animate({width: $plugin.settings.pageWidth}, $plugin.settings.pageCloseDuration, $plugin.settings.pageCloseEasing, function () {
                $openElem.find('.preview').fadeIn();
            });
            openId = 0;
        }
        
        $this.find('.container').animate({left: -(displayOffset) * ($plugin.settings.pageWidth + $plugin.settings.pageSeparation)}, $plugin.settings.pageSeekDuration, $plugin.settings.pageSeekEasing, function() {
            if (open == true) {
                openId = activeId;
                
                var $activeElem = pages[activeId - 1];
                $activeElem.find('.preview').hide();
                $.ajax({
                    dataType: 'html',
                    beforeSend: function() { $activeElem.addClass('loading'); },
                    error: function() { $activeElem.removeClass('loading'); $this.trigger('microfilm.seek'); },
                    success: function (data) {
						// Create an iframe and load the content into it
						$('<iframe scrolling="no" />').load(function() {
							var iframe = $activeElem.find('.full iframe');
							
							// Add content to iframe
							iframe.contents().find('body').html(data);
							
							// Set iframe width and height
							iframe.contents().find('body').css('margin',0,'width', pageWidthLarge);
							iframe.css('height', iframe.contents().find('body').css('height'));
						}).appendTo($activeElem.find('.full'));
						
						// Enlarge the page into full and show
                        $activeElem
                        .addClass('large')
                        .animate({width: pageWidthLarge}, $plugin.settings.pageOpenDuration, $plugin.settings.pageOpenEasing, function () {
                            $activeElem.removeClass('loading');
                            $activeElem.find('.full').fadeIn();
                        });
                    },
                    data:{
                        xmlhttp: true
                    },
                    url: $activeElem.find('a.permalink').attr('href')
                });
            }
        });
    }
    
    function resize(e) {
        var _visibleWidth = $('body').innerWidth();
        
        pageWidthLarge = $plugin.settings.pageWidthLarge;
        if (_visibleWidth < pageWidthLarge) {
            pageWidthLarge = _visibleWidth - ($plugin.settings.pageSeparation * 2);
        }
        
        if (_visibleWidth <= $plugin.settings.pageWidthLarge) {
            $($plugin.settings.navNextSelector).addClass('mobile');
            $($plugin.settings.navPreviousSelector).addClass('mobile');
        }
        else {
            $($plugin.settings.navNextSelector).removeClass('mobile');
            $($plugin.settings.navPreviousSelector).removeClass('mobile');
        }
    }
    
    function previous(e) {
        // Decrement counter
        if (displayOffset - 1 >= 0) {
            displayOffset--;
        }
        
        $(this).trigger('microfilm.seek');
    }
    
    function next(e) {
        // Increment counter
        if (displayPages.length > displayOffset + 1) {
            displayOffset++;
        }
        
        // Seek the newly active page
        $this.trigger('microfilm.seek');
    }
    
    function jump(e) {
        activeId = $(this).attr('data-target');
        displayOffset = getOffsetById(activeId);
        
        $this.trigger('microfilm.seek');
    }
    
    function openPage(e) {
        e.preventDefault();
        activeId = $(this).attr('data-id');
        displayOffset = getOffsetById(activeId);
        
        $this.trigger('microfilm.seek', [true]);
    }
    
    function closePage() {
        $this.trigger('microfilm.seek');
    }
    
    function getOffsetById(id) {
        // Calculate current offset of the selected page
        for (var i = 0, max = displayPages.length; i <= max; i++) {
            if (displayPages[i] == id) {
                return i;
            }
        }
    }
    
    function navMouseFollow(e) {
        $elem = $(this).find('a');
        $elem.css('top', e.pageY - ($elem.height() / 2));
    }
    
    function navMouseLeave(e) {
        $(this).find('a').animate({top: $(this).data('top')}, 200, 'linear');
    }

    var methods = {
        init : function (options) {
            // Setup options
            $plugin.settings = $.extend({}, $.fn[plugin].defaults, options);
            
            // Iterate over applied elements
            return this.each(function () {
                $this = $(this);
                
                var _index = 1;
                var _hash = null;
                
                if (location.hash) {
                    _hash = location.hash.replace('#/','');
                }
                
                $this.find($plugin.settings.pageSelector).each(function() {
                    $elem = $(this);
                    
                    // Set page element id
                    $elem.attr('data-id', _index);
                    
                    if (openId == 0) {
                        // Seek and open any page marked active
                        if ($elem.hasClass('active')) activeId = openId = _index;

                        // Seek and open any page requested in the hash
                        if (_hash != null && ($elem.attr('data-hash') == _hash || _index == _hash)) activeId = openId = _index;
                    }
                    
                    pages.push($(this));
                    
                    // Attach event handlers to permalink class anchors
                    $(this).find($plugin.settings.permaLinkSelector).attr('data-id', _index);
                    
                    _index++;
                });
                
                // Calculate and store page count
                displayPageCount = pages.length;
                
                // Set up element event handler
                $this
                .bind('microfilm.seek', {}, seekPage)
                .bind('microfilm.show', {}, openPage)
                .bind('microfilm.next', {}, next)
                .bind('microfilm.previous', {}, previous);
                
                // Attach event handlers to permalink class anchors
                $($plugin.settings.permaLinkSelector).bind('click', {}, openPage);
                
                // Setup event handlers for navigation buttons
                $($plugin.settings.navPreviousSelector).bind('click', {}, previous).bind('mousemove', navMouseFollow).bind('mouseleave', navMouseLeave).data('top', $($plugin.settings.navPreviousSelector).find('a').css('top'));
                $($plugin.settings.navNextSelector).bind('click', {}, next).bind('mousemove', navMouseFollow).bind('mouseleave', navMouseLeave).data('top', $($plugin.settings.navNextSelector).find('a').css('top'));
                
                // Setup event handlers for ToC links
                $($plugin.settings.tocLinkSelector).bind('click', {}, jump);
                
                // Setup event handlers for page close links
                $($plugin.settings.closeLinkSelector).bind('click', {}, closePage);
                
                // Setup event handler for window resize effects on nav
                $(window).bind('resize', {}, resize);
                
                // Setup mousewheel event handling, if use enabled
                if ($plugin.settings.useMouseWheel) {
                    $(window).bind('mousewheel', function(e, delta) {
                        if (openId == 0) {
                            if (delta > 0) {
                                $this.trigger('microfilm.next');
                            }
                            else {
                                $this.trigger('microfilm.previous');
                            }
                        }
                    });
                }
                
                // Setup keyboard hooks for navigation
                $(window).bind('keydown', {}, function (e) {
                    if (openId == 0) {
                        if (e.keyCode == 37) $this.trigger('microfilm.previous');
                        if (e.keyCode == 39) $this.trigger('microfilm.next');
                    }
                });
                
                // Setup filter hooks
                $($plugin.settings.filterSelector).bind('click', function (e) {
                    filterPages($(this).attr('data-category'));
                });
                
                $(window).trigger('resize');
                filterPages($plugin.settings.initialFilter);
                $this.trigger('microfilm.seek', [(openId > 0)]);
            });
        },
        filter : function (category) {
            filterPages(category);
        },
        destroy : function () {
            return this.each(function () {});
        }
    };

    // Add the plugin to jQuery
    $plugin = $.fn[plugin] = function (method) {
        // Handle method calls
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('Method ' +  method + ' does not exist on jQuery.' + plugin);
        }
    };

    // Setup plugin defaults
    $.fn[plugin].defaults = {
        pageSelector: '.page',
        filterSelector: 'a.filters',
        initialFilter: 'all',
        pageWidth: 300,
        pageSeparation: 10,
        pageWidthLarge: 900,
        tocLinkSelector: 'li a',
        permaLinkSelector: '.permalink',
        pageCloseDuration: 300,
        pageCloseEasing: 'swing',
        pageSeekDuration: 500,
        pageSeekEasing: 'swing',
        pageOpenEasing: 'swing',
        pageOpenDuration: 300,
        navNextSelector: '.next',
        navPreviousSelector: '.previous',
        closeLinkSelector: '.close',
        useMouseWheel: true
    };
    
    // Hold configured settings
    $.fn[plugin].settings = {};
    
})(jQuery);
