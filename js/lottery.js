;(function (root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define('lottery/lottery',factory);
  } else {
    root.Lottery = factory();
  }
})(window, function () {
  (function(){
    var init = false;
    Function.prototype.extend = function(props) {
      init = true;
      var proto = new this();
      function Class() {
        if (init) { // initialize
          // restore constructor
          this.constructor = Class;
          
          for (var name in props) {
            if (typeof proto[name] == "function" && 
              typeof props[name] == "function") {
              this[name] = function(name, fn) {
                return function() {
                  var tmp = this._super;
                  this._super = fn;
                  var result =  props[name].apply(this, arguments);
                  this._super = tmp;
                  return result; 
                }
              }(name, proto[name]);  
            }
            else {
              this[name] = props[name];
            }
          }
        }
        
        if (!init && this.init) { //create new object
          this.init.apply(this, arguments);
        }
      }
      init = false;
      Class.prototype = proto;
      return Class;
    }
  })();

  var id = 0,
    isHtml5 = /iphone|android|ipad/gi.test(navigator.userAgent.toLowerCase());

  function getFlash(name) {
    if (window.navigator.userAgent.indexOf("MSIE") != -1) {
      return document.getElementById(name);
    } else {
      var obj = document[name];
      if (obj && obj.length) {
        for (var n = 0; n < obj.length; ++n) {
          if (obj[n].nodeName.toUpperCase() == 'EMBED')
            return obj[n];
        }
      } else {
        return obj;
      }
    }
  };

  function getFlashHtml(id,swfurl,params,width,height,bgcolor,wmode,collect){
    wmode = wmode || 'transparent';
    var paramArr = [];
    for(var prop in params){
      paramArr.push(prop+"="+encodeURIComponent(params[prop]!=null?params[prop]:""));
    }
    var paramStr = paramArr.join('&');
    return ['<object align="middle" height="',height,'" width="',width,'" id="',id,'" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=9,0,0,0" classid="clsid:d27cdb6e-ae6d-11cf-96b8-444553540000">',
      '<param value="true" name="allowFullScreen">','<param value="',swfurl,'" name="movie">',
      '<param value="high" name="quality">','<param name="FlashVars" value="',paramStr,'" />',(bgcolor && bgcolor!='')?('<param name="bgcolor" value="'+bgcolor+'" />'):'',
      '<param value="',wmode,'" name="wmode">','<param value="always" name="allowScriptAccess"><param name="allowFullScreen" value="true">',
      '<embed align="middle" ',(bgcolor && bgcolor!='')?('bgcolor="'+bgcolor+'"'):'',' FlashVars="',paramStr,'" height="',height,'" width="',width,'" pluginspage="http://www.macromedia.com/go/getflashplayer" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" name="',id,'" quality="high" wmode="',wmode,'" src="',swfurl,'"/>',
      '</object>'].join('');
  };

  function animate(t) {
    return 1 - (t-1) * (t-1);
  }

  var Lottery = Events.extend();

  Lottery.prototype.init = function(container,prizeNum,startRotation) {
    var wrap = document.getElementById(container);
    var _this = this;
    this.id = ++id;
  
    if(isHtml5) {
      var light = document.createElement('div');
      var top = ( wrap.offsetHeight - 305 ) / 2;
      var left = ( wrap.offsetWidth - 128 ) / 2;
      light.style.cssText = 'display:block;width:128px;height:215px;background:url(../img/light.png);position:absolute;top:'+top+'px;left:'+left+'px;';
      wrap.appendChild(light);
      
      var button = document.createElement('a');
      button.href = '#';
      var top = ( wrap.offsetHeight - 106 ) / 2;
      var left = ( wrap.offsetWidth - 106 ) / 2;
      button.style.cssText = 'display:block;width:106px;height:106px;background:url(../img/button.png);position:absolute;top:'+top+'px;left:'+left+'px;';
      wrap.appendChild(button);

      button.onclick = function(e) {
        e.preventDefault();
        _this.trigger('click');
      }

      var H5Instance = {};

      var currentRotation = 0;
      var state = 0; //0 默认状诚缓慢转动 ; 1 摇奖状态 ; 2 停止状态 
      light.style.webkitTransformOrigin = 'center 70%';

      function step() {
        switch(state) {
          case 0 :
              currentRotation++;
              light.style.webkitTransform = 'rotate('+currentRotation+'deg)';
              if(currentRotation > 10000) {
                currentRotation = currentRotation % 360;
              }
            break;
          case 1 :
              if (time <= 1200) {
                currentRotation = benginRotation + (endRotation - benginRotation) * animate(time / 1200);
                
                if (time == 1200) {
                  _this.trigger('resultEnd',resultOnNum);
                }
              }else if(time > 1800) {
                _this.reset();
              }
              time += 12;
              light.style.webkitTransform = 'rotate('+currentRotation+'deg)';
            break;
          case 2 :
            break;
        }
       
        webkitRequestAnimationFrame(step);
      }

      webkitRequestAnimationFrame(step);

      var benginRotation;
      var endRotation;
      var resultOnNum;
      var time = 0;

      H5Instance.resultOn = function(num) {
        button.style.cursor = 'default';
        endRotation = currentRotation + (360 - currentRotation % 360) + 360 * 3 + 360 * (num - startRotation -1 ) / prizeNum ;
        benginRotation = currentRotation;
        time = 0;
        resultOnNum = num;
        state = 1;
      }

      H5Instance.stop = function() {
        state = 2;
      }

      H5Instance.reset = function() {
        state = 0;
        button.style.cursor = 'pointer';
      }
      _this.H5Instance = H5Instance;

    }else{
      window['lottery'+id+'Click'] = function() {
        _this.trigger('click');
      }

      window['lottery'+id+'ResultEnd'] = function(num) {
        _this.trigger('resultEnd',num);
      }
      wrap.innerHTML = getFlashHtml('lottery'+this.id,'../js/lottery.swf',{id:this.id,startRotation:startRotation,prizeNum:prizeNum},328,328,'#ffffff','transparent');
    }
  }

  Lottery.prototype.getObject = function() {
    if(isHtml5) {
      return this.H5Instance;
    }else{
      return getFlash('lottery' + this.id);
    }
  }
    
  Lottery.prototype.stop = function() {
    this.getObject().stop();
    this.trigger('stop');
  }

  Lottery.prototype.resultOn = function(num) {
    this.getObject().resultOn(num);
  }

  Lottery.prototype.reset = function() {
    this.getObject().reset();
  }
  return Lottery;
})
