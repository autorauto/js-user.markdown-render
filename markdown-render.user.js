// ==UserScript==
// @name        markdown-render
// @namespace   com.houseofivy
// @description renders markdown files
//
// @version     0.007
// @//updateURL   https://raw.githubusercontent.com/rivy/gms-markdown_viewer.custom-css/master/markdown_viewer.custom-css.user.js
//
// file extension: .m(arkdown|kdn?|d(o?wn)?)
// @include     file://*.markdown
// @include     file://*.mkdn
// @include     file://*.mkd
// @include     file://*.mdown
// @include     file://*.mdwn
// @include     file://*.md
//
// @require     https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js
//
// @grant       none
// ==/UserScript==

(function( /* USERjs */ ){
'use strict';

var protocol = document.location.protocol; if (protocol === 'file:') { protocol = 'https:'; }
var required_js = [
  // NOTE: see library CDN ref @ https://cdnjs.com
  [
  // syntax highlighter (with plugins)
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/prism.min.js",
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/line-highlight/prism-line-highlight.min.js",
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/line-numbers/prism-line-numbers.min.js",
  ],
  [
  // syntax highlighter grammers (ToDO: change to lazy loading)
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/components/prism-haskell.min.js",
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/components/prism-perl.min.js",
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/components/prism-python.min.js",
  ],
  // markdown conversion
  protocol+"//cdnjs.cloudflare.com/ajax/libs/markdown-it/8.3.1/markdown-it.min.js",
  ];
var optional_css = [
  // basic
  protocol+"//raw.githubusercontent.com/rivy/js-user.markdown-render/master/css/s.css",
  // syntax highlighter
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/themes/prism.min.css",
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/themes/prism-solarizedlight.min.css",
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/line-highlight/prism-line-highlight.min.css",
  protocol+"//cdnjs.cloudflare.com/ajax/libs/prism/1.6.0/plugins/line-numbers/prism-line-numbers.min.css",
  ];

load_js_inorder( required_js, function(){
    console.log('rendering');
    document.body.innerHTML = render( document.body.textContent );
    });

load_css( optional_css );


// #### subs

function load_css( uri ) {
var styles = Array.from(uri);
styles.forEach( function( style ){
    console.log( 'load_css:style = ' + style );
    $.get( style, function(css){
       $('<style type="text/css"></style>')
       .html(css)
       .appendTo("head");
       });
});
}

function load_js_inorder( uri, callback, timeout ) {
callback = callback || function(){};
timeout = timeout || ( 2 * 1000 );
var scripts = Array.from(uri);
if (scripts.length > 0) {
    var script = scripts.shift();
    console.log('load_js_inorder:script = ' + script);
    console.log('load_js_inorder:scripts[' + scripts.length + '] = ' + scripts);
    var true_callback;
    if (scripts.length === 0) { true_callback = callback; } else { true_callback = function(){ load_js_inorder( scripts, callback, timeout ); }; }
    if ( $.isArray(script) ) { load_js( script, true_callback, timeout ); }
    else {
      $.ajax( script, { cache: true, dataType: 'script', timeout: timeout } )
       .done( function() {
          console.log('ajax:load:success:' + script);
          true_callback();
          })
       .fail( () => { console.log('$:getScript:FAIL: ' + script); } )
      ;
    }
}
}

function load_js( uri, callback, timeout ){
callback = callback || function(){};
timeout = timeout || ( 10 * 1000 );
// jQuery
var scripts = Array.from(uri);
var progress = 0;
scripts.forEach( function( script ){
    console.log( 'load_js:script = ' + script );
    $.ajax( script, { cache: true, dataType: 'script', timeout: timeout } )
     .done( function() {
        console.log('ajax:load:success:[' + progress + ']' + script);
        if (++progress == scripts.length) callback();
        })
     .fail( () => { console.log('$:getScript:FAIL: ' + script); } )
    ;
});
}

function highlight_code ( s, lang ) {
    console.log('here#1: '+lang);
    // //let grammer = Prism.languages[lang];
    // // let grammer = get_prism_grammer(lang);
    // const prismLang = Prism.languages[lang];
    // if (grammer) {
    //     console.log('here#2: '+ lang);
    //     try {
    //         return Prism.highlight(s, grammer).value;
    //     } catch (__) {}
    // }
    var grammer = Prism.languages[lang];
    if (grammer) {
        console.log('here#2: '+ lang);
        return Prism.highlight( s, grammer);
    }
}

function get_prism_grammer(lang, callback){
    var grammer = Prism.languages[lang];
//    if (grammer !== undefined) {
//       }
    return grammer;
}

const DEFAULTS = {
    plugins: [],
    init: () => {}
};
function p_highlight(text, lang) {
    const prismLang = Prism.languages[lang];
    if (prismLang) {
        return Prism.highlight(text, prismLang);
    }
}

var md;
function render( text ){
    md = md || new markdownit({
      html: true,
      highlight: highlight_code,
      });
    return md.render(text);
    }

})( /* window.USERjs = window.USERjs || {} */ );

