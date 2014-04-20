MicrofilmJS is a jQuery plugin used to display a horizontal list of summary slides and expanding the selected slide into a detail view using transition animations. Slides can be navigated and interacted with using the mouse, keyboard or touch. It also supports a table-of-contents navigation, navigation using location hashes, filtering slides based on tagged classes and plays nice with mobile devices.

## Requires
- jQuery
- jquery.mousewheel.js (optional)


### Default configs
```javascript
var configs = {
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
    }
```


### Events
microfilm.seek
microfilm.show
microfilm.next
microfilm.previous


## Demo
View demo.html http://jawish.github.io/microfilmjs/demo.html


## License
MIT License
