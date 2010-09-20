window['Sandbox'] = (function(window, document, undefined) {

  // A Boolean flag that, when set, determines whether or not the browser
  // supports setting the '__proto__' property on the Window object.
  // Firefox, for example, supports __proto__ on other Objects, but not Window.
  var supportsProto;
  
  
  function Sandbox(bare) {
    
    if (bare === false) {
      throw new Error("NOT YET IMPLEMENTED: Make a GitHub Issue if you need this...");
    }  
    
      // Append to document so that 'contentWindow' is accessible
      var iframe = document.createElement("iframe");
      // Make the 'iframe' invisible, so it doesn't affect the HTML layout.
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      // Get a reference to the 'global' scope, and document instance
      var windowInstance = iframe['contentWindow'], documentInstance = windowInstance['document'];
      this['global'] = windowInstance;

      // Get a 'binded' eval function so we can execute arbitary JS inside the
      // new scope.
      var script = document.createElement("script"),
        text = "e=function(s){return eval('with(window) { ' + s + '}');}";
      script.setAttribute('type', 'text/javascript');
      if (!!script['canHaveChildren']) { 
        script.appendChild(document.createTextNode(text)); 
      } else { 
        script.text = text; 
      }
      var head = documentInstance['getElementsByTagName']("head")[0];
      head.appendChild(script);
      head.removeChild(script);
      this['eval'] = windowInstance['e'];
      delete windowInstance['e'];

      // Define the getScript function, which returns a Script instance that
      // will be executed inside the sandboxed 'scope'.
      this['load'] = function(filename, callback) {
        var str = "_s = document.createElement('script'); "+
          "_s.setAttribute('type','text/javascript'); "+
          "_s.setAttribute('src','"+filename.replace(/'/g, '\\\'')+"'); ";
        if (callback) {
          function cb() {
            callback();
          }
          this['eval'](str);
          windowInstance['_s'].onload = cb;
          str = "";
        }
        this['eval'](str + "document.getElementsByTagName('head')[0].appendChild(_s); delete _s;");
      }
      
      // Synchronous load using XHR. This is discouraged.
      this['loadSync'] = function(filename) {
        throw new Error("NOT YET IMPLEMENTED: Make a GitHub Issue if you need this...");
      }


      // The scope that an iframe creates for us is polluted with a bunch of
      // DOM and window properties. We need to try our best to remove access to
      // as much of the default 'window' as possible, and provide the scope with
      // as close to a 'bare' JS environment as possible. Especially 'parent'
      // needs to be restricted, which provides access to the page's global
      // scope (very bad!).
      if (supportsProto === true) {
        windowInstance['__proto__'] = Object.prototype;
      } else if (supportsProto === false) {
        obliterateConstructor.call(this, windowInstance);
      } else {
        function fail() {
          //console.log("browser DOES NOT support '__proto__'");
          supportsProto = false;
          obliterateConstructor.call(this, windowInstance);
        }
        try {
          // We're gonna test if the browser supports the '__proto__' property
          // on the Window object. If it does, then it makes cleaning up any
          // properties inherited from the 'prototype' a lot easier.
          if (windowInstance['__proto__']) {
            var proto = windowInstance['__proto__'];
            proto['_$'] = true;
            if (windowInstance['_$'] !== true) {
              fail();
            }
            windowInstance['__proto__'] = Object.prototype;
            if (!!windowInstance['_$']) {
              // If we set '__proto__', but '_$' still exists, then setting that
              // property is not supported on the 'Window' at least, resort to obliteration.
              delete proto['_$'];
              windowInstance['__proto__'] = proto;
              fail();
            }
            // If we got to here without any errors being thrown, and without "fail()"
            // being called, then it seems as though the browser supports __proto__!
            if (supportsProto !== false) {
              //console.log("browser supports '__proto__'!!");
              supportsProto = true;
            }
          }
        } catch(e) {
          fail();
        }        
      }
      try {
          windowInstance['constructor'] = windowInstance['Window'] = windowInstance['DOMWindow']=undefined;
      } catch(e){}
      
      // Inside the sandbox scope, use the 'global' property if you MUST get a reference
      // to the sandbox's global scope (in reality, the 'iframe's Window object). This is
      // encouraged over the use of 'window', since that seems impossible to hide in all
      // browsers.
      windowInstance['global'] = windowInstance;
  }

  function obliterate(proto, prop) {
    try {
      proto[prop] = undefined;
      if (!proto[prop]) return;
    } catch(e){}
    var value;
    if ("__defineGetter__" in proto) {
      try {
        proto.__defineGetter__(prop, function() {
          return value;
        });
        proto.__defineSetter__(prop, function(v) {
          value = v;
        });
      } catch(ex) {}
    }
    proto[prop] = undefined;
  }

  function obliterateConstructor(windowInstance) {
    //console.log("attempting to obliterate the constructor's prototype");
    var windowConstructor = windowInstance['constructor'] || windowInstance['DOMWindow'] || windowInstance['Window'],
      windowProto = windowConstructor ? windowConstructor.prototype : windowConstructor['__proto__'];
    if (windowProto) {
      for (var i in windowProto) {
        try {
          delete windowProto[i];
        } catch(e){}
      }
      for (var i in windowProto) {
        obliterate(windowProto, i);
      }
    } else {
      //console.log("could not find 'prototype'");
    }
  }

  return Sandbox;
})(window, document)
