(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/leaflet/dist/leaflet-src.js
  var require_leaflet_src = __commonJS({
    "node_modules/leaflet/dist/leaflet-src.js"(exports, module) {
      (function(global2, factory) {
        typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global2 = typeof globalThis !== "undefined" ? globalThis : global2 || self, factory(global2.leaflet = {}));
      })(exports, function(exports2) {
        "use strict";
        var version = "1.9.3";
        function extend16(dest) {
          var i, j, len, src;
          for (j = 1, len = arguments.length; j < len; j++) {
            src = arguments[j];
            for (i in src) {
              dest[i] = src[i];
            }
          }
          return dest;
        }
        var create$2 = Object.create || function() {
          function F() {
          }
          return function(proto) {
            F.prototype = proto;
            return new F();
          };
        }();
        function bind(fn, obj) {
          var slice = Array.prototype.slice;
          if (fn.bind) {
            return fn.bind.apply(fn, slice.call(arguments, 1));
          }
          var args = slice.call(arguments, 2);
          return function() {
            return fn.apply(obj, args.length ? args.concat(slice.call(arguments)) : arguments);
          };
        }
        var lastId = 0;
        function stamp2(obj) {
          if (!("_leaflet_id" in obj)) {
            obj["_leaflet_id"] = ++lastId;
          }
          return obj._leaflet_id;
        }
        function throttle(fn, time, context) {
          var lock, args, wrapperFn, later;
          later = function() {
            lock = false;
            if (args) {
              wrapperFn.apply(context, args);
              args = false;
            }
          };
          wrapperFn = function() {
            if (lock) {
              args = arguments;
            } else {
              fn.apply(context, arguments);
              setTimeout(later, time);
              lock = true;
            }
          };
          return wrapperFn;
        }
        function wrapNum(x, range, includeMax) {
          var max = range[1], min = range[0], d = max - min;
          return x === max && includeMax ? x : ((x - min) % d + d) % d + min;
        }
        function falseFn() {
          return false;
        }
        function formatNum(num, precision) {
          if (precision === false) {
            return num;
          }
          var pow = Math.pow(10, precision === void 0 ? 6 : precision);
          return Math.round(num * pow) / pow;
        }
        function trim(str) {
          return str.trim ? str.trim() : str.replace(/^\s+|\s+$/g, "");
        }
        function splitWords(str) {
          return trim(str).split(/\s+/);
        }
        function setOptions(obj, options) {
          if (!Object.prototype.hasOwnProperty.call(obj, "options")) {
            obj.options = obj.options ? create$2(obj.options) : {};
          }
          for (var i in options) {
            obj.options[i] = options[i];
          }
          return obj.options;
        }
        function getParamString(obj, existingUrl, uppercase) {
          var params = [];
          for (var i in obj) {
            params.push(encodeURIComponent(uppercase ? i.toUpperCase() : i) + "=" + encodeURIComponent(obj[i]));
          }
          return (!existingUrl || existingUrl.indexOf("?") === -1 ? "?" : "&") + params.join("&");
        }
        var templateRe = /\{ *([\w_ -]+) *\}/g;
        function template2(str, data) {
          return str.replace(templateRe, function(str2, key) {
            var value = data[key];
            if (value === void 0) {
              throw new Error("No value provided for variable " + str2);
            } else if (typeof value === "function") {
              value = value(data);
            }
            return value;
          });
        }
        var isArray = Array.isArray || function(obj) {
          return Object.prototype.toString.call(obj) === "[object Array]";
        };
        function indexOf(array, el) {
          for (var i = 0; i < array.length; i++) {
            if (array[i] === el) {
              return i;
            }
          }
          return -1;
        }
        var emptyImageUrl = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
        function getPrefixed(name) {
          return window["webkit" + name] || window["moz" + name] || window["ms" + name];
        }
        var lastTime = 0;
        function timeoutDefer(fn) {
          var time = +new Date(), timeToCall = Math.max(0, 16 - (time - lastTime));
          lastTime = time + timeToCall;
          return window.setTimeout(fn, timeToCall);
        }
        var requestFn = window.requestAnimationFrame || getPrefixed("RequestAnimationFrame") || timeoutDefer;
        var cancelFn = window.cancelAnimationFrame || getPrefixed("CancelAnimationFrame") || getPrefixed("CancelRequestAnimationFrame") || function(id) {
          window.clearTimeout(id);
        };
        function requestAnimFrame(fn, context, immediate) {
          if (immediate && requestFn === timeoutDefer) {
            fn.call(context);
          } else {
            return requestFn.call(window, bind(fn, context));
          }
        }
        function cancelAnimFrame(id) {
          if (id) {
            cancelFn.call(window, id);
          }
        }
        var Util20 = {
          __proto__: null,
          extend: extend16,
          create: create$2,
          bind,
          get lastId() {
            return lastId;
          },
          stamp: stamp2,
          throttle,
          wrapNum,
          falseFn,
          formatNum,
          trim,
          splitWords,
          setOptions,
          getParamString,
          template: template2,
          isArray,
          indexOf,
          emptyImageUrl,
          requestFn,
          cancelFn,
          requestAnimFrame,
          cancelAnimFrame
        };
        function Class3() {
        }
        Class3.extend = function(props) {
          var NewClass = function() {
            setOptions(this);
            if (this.initialize) {
              this.initialize.apply(this, arguments);
            }
            this.callInitHooks();
          };
          var parentProto = NewClass.__super__ = this.prototype;
          var proto = create$2(parentProto);
          proto.constructor = NewClass;
          NewClass.prototype = proto;
          for (var i in this) {
            if (Object.prototype.hasOwnProperty.call(this, i) && i !== "prototype" && i !== "__super__") {
              NewClass[i] = this[i];
            }
          }
          if (props.statics) {
            extend16(NewClass, props.statics);
          }
          if (props.includes) {
            checkDeprecatedMixinEvents(props.includes);
            extend16.apply(null, [proto].concat(props.includes));
          }
          extend16(proto, props);
          delete proto.statics;
          delete proto.includes;
          if (proto.options) {
            proto.options = parentProto.options ? create$2(parentProto.options) : {};
            extend16(proto.options, props.options);
          }
          proto._initHooks = [];
          proto.callInitHooks = function() {
            if (this._initHooksCalled) {
              return;
            }
            if (parentProto.callInitHooks) {
              parentProto.callInitHooks.call(this);
            }
            this._initHooksCalled = true;
            for (var i2 = 0, len = proto._initHooks.length; i2 < len; i2++) {
              proto._initHooks[i2].call(this);
            }
          };
          return NewClass;
        };
        Class3.include = function(props) {
          var parentOptions = this.prototype.options;
          extend16(this.prototype, props);
          if (props.options) {
            this.prototype.options = parentOptions;
            this.mergeOptions(props.options);
          }
          return this;
        };
        Class3.mergeOptions = function(options) {
          extend16(this.prototype.options, options);
          return this;
        };
        Class3.addInitHook = function(fn) {
          var args = Array.prototype.slice.call(arguments, 1);
          var init = typeof fn === "function" ? fn : function() {
            this[fn].apply(this, args);
          };
          this.prototype._initHooks = this.prototype._initHooks || [];
          this.prototype._initHooks.push(init);
          return this;
        };
        function checkDeprecatedMixinEvents(includes) {
          if (typeof L === "undefined" || !L || !L.Mixin) {
            return;
          }
          includes = isArray(includes) ? includes : [includes];
          for (var i = 0; i < includes.length; i++) {
            if (includes[i] === L.Mixin.Events) {
              console.warn("Deprecated include of L.Mixin.Events: this property will be removed in future releases, please inherit from L.Evented instead.", new Error().stack);
            }
          }
        }
        var Events = {
          on: function(types, fn, context) {
            if (typeof types === "object") {
              for (var type in types) {
                this._on(type, types[type], fn);
              }
            } else {
              types = splitWords(types);
              for (var i = 0, len = types.length; i < len; i++) {
                this._on(types[i], fn, context);
              }
            }
            return this;
          },
          off: function(types, fn, context) {
            if (!arguments.length) {
              delete this._events;
            } else if (typeof types === "object") {
              for (var type in types) {
                this._off(type, types[type], fn);
              }
            } else {
              types = splitWords(types);
              var removeAll = arguments.length === 1;
              for (var i = 0, len = types.length; i < len; i++) {
                if (removeAll) {
                  this._off(types[i]);
                } else {
                  this._off(types[i], fn, context);
                }
              }
            }
            return this;
          },
          _on: function(type, fn, context, _once) {
            if (typeof fn !== "function") {
              console.warn("wrong listener type: " + typeof fn);
              return;
            }
            if (this._listens(type, fn, context) !== false) {
              return;
            }
            if (context === this) {
              context = void 0;
            }
            var newListener = { fn, ctx: context };
            if (_once) {
              newListener.once = true;
            }
            this._events = this._events || {};
            this._events[type] = this._events[type] || [];
            this._events[type].push(newListener);
          },
          _off: function(type, fn, context) {
            var listeners, i, len;
            if (!this._events) {
              return;
            }
            listeners = this._events[type];
            if (!listeners) {
              return;
            }
            if (arguments.length === 1) {
              if (this._firingCount) {
                for (i = 0, len = listeners.length; i < len; i++) {
                  listeners[i].fn = falseFn;
                }
              }
              delete this._events[type];
              return;
            }
            if (typeof fn !== "function") {
              console.warn("wrong listener type: " + typeof fn);
              return;
            }
            var index2 = this._listens(type, fn, context);
            if (index2 !== false) {
              var listener = listeners[index2];
              if (this._firingCount) {
                listener.fn = falseFn;
                this._events[type] = listeners = listeners.slice();
              }
              listeners.splice(index2, 1);
            }
          },
          fire: function(type, data, propagate) {
            if (!this.listens(type, propagate)) {
              return this;
            }
            var event = extend16({}, data, {
              type,
              target: this,
              sourceTarget: data && data.sourceTarget || this
            });
            if (this._events) {
              var listeners = this._events[type];
              if (listeners) {
                this._firingCount = this._firingCount + 1 || 1;
                for (var i = 0, len = listeners.length; i < len; i++) {
                  var l = listeners[i];
                  var fn = l.fn;
                  if (l.once) {
                    this.off(type, fn, l.ctx);
                  }
                  fn.call(l.ctx || this, event);
                }
                this._firingCount--;
              }
            }
            if (propagate) {
              this._propagateEvent(event);
            }
            return this;
          },
          listens: function(type, fn, context, propagate) {
            if (typeof type !== "string") {
              console.warn('"string" type argument expected');
            }
            var _fn = fn;
            if (typeof fn !== "function") {
              propagate = !!fn;
              _fn = void 0;
              context = void 0;
            }
            var listeners = this._events && this._events[type];
            if (listeners && listeners.length) {
              if (this._listens(type, _fn, context) !== false) {
                return true;
              }
            }
            if (propagate) {
              for (var id in this._eventParents) {
                if (this._eventParents[id].listens(type, fn, context, propagate)) {
                  return true;
                }
              }
            }
            return false;
          },
          _listens: function(type, fn, context) {
            if (!this._events) {
              return false;
            }
            var listeners = this._events[type] || [];
            if (!fn) {
              return !!listeners.length;
            }
            if (context === this) {
              context = void 0;
            }
            for (var i = 0, len = listeners.length; i < len; i++) {
              if (listeners[i].fn === fn && listeners[i].ctx === context) {
                return i;
              }
            }
            return false;
          },
          once: function(types, fn, context) {
            if (typeof types === "object") {
              for (var type in types) {
                this._on(type, types[type], fn, true);
              }
            } else {
              types = splitWords(types);
              for (var i = 0, len = types.length; i < len; i++) {
                this._on(types[i], fn, context, true);
              }
            }
            return this;
          },
          addEventParent: function(obj) {
            this._eventParents = this._eventParents || {};
            this._eventParents[stamp2(obj)] = obj;
            return this;
          },
          removeEventParent: function(obj) {
            if (this._eventParents) {
              delete this._eventParents[stamp2(obj)];
            }
            return this;
          },
          _propagateEvent: function(e) {
            for (var id in this._eventParents) {
              this._eventParents[id].fire(e.type, extend16({
                layer: e.target,
                propagatedFrom: e.target
              }, e), true);
            }
          }
        };
        Events.addEventListener = Events.on;
        Events.removeEventListener = Events.clearAllEventListeners = Events.off;
        Events.addOneTimeEventListener = Events.once;
        Events.fireEvent = Events.fire;
        Events.hasEventListeners = Events.listens;
        var Evented3 = Class3.extend(Events);
        function Point3(x, y, round) {
          this.x = round ? Math.round(x) : x;
          this.y = round ? Math.round(y) : y;
        }
        var trunc = Math.trunc || function(v) {
          return v > 0 ? Math.floor(v) : Math.ceil(v);
        };
        Point3.prototype = {
          clone: function() {
            return new Point3(this.x, this.y);
          },
          add: function(point7) {
            return this.clone()._add(toPoint(point7));
          },
          _add: function(point7) {
            this.x += point7.x;
            this.y += point7.y;
            return this;
          },
          subtract: function(point7) {
            return this.clone()._subtract(toPoint(point7));
          },
          _subtract: function(point7) {
            this.x -= point7.x;
            this.y -= point7.y;
            return this;
          },
          divideBy: function(num) {
            return this.clone()._divideBy(num);
          },
          _divideBy: function(num) {
            this.x /= num;
            this.y /= num;
            return this;
          },
          multiplyBy: function(num) {
            return this.clone()._multiplyBy(num);
          },
          _multiplyBy: function(num) {
            this.x *= num;
            this.y *= num;
            return this;
          },
          scaleBy: function(point7) {
            return new Point3(this.x * point7.x, this.y * point7.y);
          },
          unscaleBy: function(point7) {
            return new Point3(this.x / point7.x, this.y / point7.y);
          },
          round: function() {
            return this.clone()._round();
          },
          _round: function() {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            return this;
          },
          floor: function() {
            return this.clone()._floor();
          },
          _floor: function() {
            this.x = Math.floor(this.x);
            this.y = Math.floor(this.y);
            return this;
          },
          ceil: function() {
            return this.clone()._ceil();
          },
          _ceil: function() {
            this.x = Math.ceil(this.x);
            this.y = Math.ceil(this.y);
            return this;
          },
          trunc: function() {
            return this.clone()._trunc();
          },
          _trunc: function() {
            this.x = trunc(this.x);
            this.y = trunc(this.y);
            return this;
          },
          distanceTo: function(point7) {
            point7 = toPoint(point7);
            var x = point7.x - this.x, y = point7.y - this.y;
            return Math.sqrt(x * x + y * y);
          },
          equals: function(point7) {
            point7 = toPoint(point7);
            return point7.x === this.x && point7.y === this.y;
          },
          contains: function(point7) {
            point7 = toPoint(point7);
            return Math.abs(point7.x) <= Math.abs(this.x) && Math.abs(point7.y) <= Math.abs(this.y);
          },
          toString: function() {
            return "Point(" + formatNum(this.x) + ", " + formatNum(this.y) + ")";
          }
        };
        function toPoint(x, y, round) {
          if (x instanceof Point3) {
            return x;
          }
          if (isArray(x)) {
            return new Point3(x[0], x[1]);
          }
          if (x === void 0 || x === null) {
            return x;
          }
          if (typeof x === "object" && "x" in x && "y" in x) {
            return new Point3(x.x, x.y);
          }
          return new Point3(x, y, round);
        }
        function Bounds2(a, b) {
          if (!a) {
            return;
          }
          var points = b ? [a, b] : a;
          for (var i = 0, len = points.length; i < len; i++) {
            this.extend(points[i]);
          }
        }
        Bounds2.prototype = {
          extend: function(obj) {
            var min2, max2;
            if (!obj) {
              return this;
            }
            if (obj instanceof Point3 || typeof obj[0] === "number" || "x" in obj) {
              min2 = max2 = toPoint(obj);
            } else {
              obj = toBounds(obj);
              min2 = obj.min;
              max2 = obj.max;
              if (!min2 || !max2) {
                return this;
              }
            }
            if (!this.min && !this.max) {
              this.min = min2.clone();
              this.max = max2.clone();
            } else {
              this.min.x = Math.min(min2.x, this.min.x);
              this.max.x = Math.max(max2.x, this.max.x);
              this.min.y = Math.min(min2.y, this.min.y);
              this.max.y = Math.max(max2.y, this.max.y);
            }
            return this;
          },
          getCenter: function(round) {
            return toPoint(
              (this.min.x + this.max.x) / 2,
              (this.min.y + this.max.y) / 2,
              round
            );
          },
          getBottomLeft: function() {
            return toPoint(this.min.x, this.max.y);
          },
          getTopRight: function() {
            return toPoint(this.max.x, this.min.y);
          },
          getTopLeft: function() {
            return this.min;
          },
          getBottomRight: function() {
            return this.max;
          },
          getSize: function() {
            return this.max.subtract(this.min);
          },
          contains: function(obj) {
            var min, max;
            if (typeof obj[0] === "number" || obj instanceof Point3) {
              obj = toPoint(obj);
            } else {
              obj = toBounds(obj);
            }
            if (obj instanceof Bounds2) {
              min = obj.min;
              max = obj.max;
            } else {
              min = max = obj;
            }
            return min.x >= this.min.x && max.x <= this.max.x && min.y >= this.min.y && max.y <= this.max.y;
          },
          intersects: function(bounds3) {
            bounds3 = toBounds(bounds3);
            var min = this.min, max = this.max, min2 = bounds3.min, max2 = bounds3.max, xIntersects = max2.x >= min.x && min2.x <= max.x, yIntersects = max2.y >= min.y && min2.y <= max.y;
            return xIntersects && yIntersects;
          },
          overlaps: function(bounds3) {
            bounds3 = toBounds(bounds3);
            var min = this.min, max = this.max, min2 = bounds3.min, max2 = bounds3.max, xOverlaps = max2.x > min.x && min2.x < max.x, yOverlaps = max2.y > min.y && min2.y < max.y;
            return xOverlaps && yOverlaps;
          },
          isValid: function() {
            return !!(this.min && this.max);
          },
          pad: function(bufferRatio) {
            var min = this.min, max = this.max, heightBuffer = Math.abs(min.x - max.x) * bufferRatio, widthBuffer = Math.abs(min.y - max.y) * bufferRatio;
            return toBounds(
              toPoint(min.x - heightBuffer, min.y - widthBuffer),
              toPoint(max.x + heightBuffer, max.y + widthBuffer)
            );
          },
          equals: function(bounds3) {
            if (!bounds3) {
              return false;
            }
            bounds3 = toBounds(bounds3);
            return this.min.equals(bounds3.getTopLeft()) && this.max.equals(bounds3.getBottomRight());
          }
        };
        function toBounds(a, b) {
          if (!a || a instanceof Bounds2) {
            return a;
          }
          return new Bounds2(a, b);
        }
        function LatLngBounds3(corner1, corner2) {
          if (!corner1) {
            return;
          }
          var latlngs = corner2 ? [corner1, corner2] : corner1;
          for (var i = 0, len = latlngs.length; i < len; i++) {
            this.extend(latlngs[i]);
          }
        }
        LatLngBounds3.prototype = {
          extend: function(obj) {
            var sw = this._southWest, ne = this._northEast, sw2, ne2;
            if (obj instanceof LatLng3) {
              sw2 = obj;
              ne2 = obj;
            } else if (obj instanceof LatLngBounds3) {
              sw2 = obj._southWest;
              ne2 = obj._northEast;
              if (!sw2 || !ne2) {
                return this;
              }
            } else {
              return obj ? this.extend(toLatLng(obj) || toLatLngBounds(obj)) : this;
            }
            if (!sw && !ne) {
              this._southWest = new LatLng3(sw2.lat, sw2.lng);
              this._northEast = new LatLng3(ne2.lat, ne2.lng);
            } else {
              sw.lat = Math.min(sw2.lat, sw.lat);
              sw.lng = Math.min(sw2.lng, sw.lng);
              ne.lat = Math.max(ne2.lat, ne.lat);
              ne.lng = Math.max(ne2.lng, ne.lng);
            }
            return this;
          },
          pad: function(bufferRatio) {
            var sw = this._southWest, ne = this._northEast, heightBuffer = Math.abs(sw.lat - ne.lat) * bufferRatio, widthBuffer = Math.abs(sw.lng - ne.lng) * bufferRatio;
            return new LatLngBounds3(
              new LatLng3(sw.lat - heightBuffer, sw.lng - widthBuffer),
              new LatLng3(ne.lat + heightBuffer, ne.lng + widthBuffer)
            );
          },
          getCenter: function() {
            return new LatLng3(
              (this._southWest.lat + this._northEast.lat) / 2,
              (this._southWest.lng + this._northEast.lng) / 2
            );
          },
          getSouthWest: function() {
            return this._southWest;
          },
          getNorthEast: function() {
            return this._northEast;
          },
          getNorthWest: function() {
            return new LatLng3(this.getNorth(), this.getWest());
          },
          getSouthEast: function() {
            return new LatLng3(this.getSouth(), this.getEast());
          },
          getWest: function() {
            return this._southWest.lng;
          },
          getSouth: function() {
            return this._southWest.lat;
          },
          getEast: function() {
            return this._northEast.lng;
          },
          getNorth: function() {
            return this._northEast.lat;
          },
          contains: function(obj) {
            if (typeof obj[0] === "number" || obj instanceof LatLng3 || "lat" in obj) {
              obj = toLatLng(obj);
            } else {
              obj = toLatLngBounds(obj);
            }
            var sw = this._southWest, ne = this._northEast, sw2, ne2;
            if (obj instanceof LatLngBounds3) {
              sw2 = obj.getSouthWest();
              ne2 = obj.getNorthEast();
            } else {
              sw2 = ne2 = obj;
            }
            return sw2.lat >= sw.lat && ne2.lat <= ne.lat && sw2.lng >= sw.lng && ne2.lng <= ne.lng;
          },
          intersects: function(bounds3) {
            bounds3 = toLatLngBounds(bounds3);
            var sw = this._southWest, ne = this._northEast, sw2 = bounds3.getSouthWest(), ne2 = bounds3.getNorthEast(), latIntersects = ne2.lat >= sw.lat && sw2.lat <= ne.lat, lngIntersects = ne2.lng >= sw.lng && sw2.lng <= ne.lng;
            return latIntersects && lngIntersects;
          },
          overlaps: function(bounds3) {
            bounds3 = toLatLngBounds(bounds3);
            var sw = this._southWest, ne = this._northEast, sw2 = bounds3.getSouthWest(), ne2 = bounds3.getNorthEast(), latOverlaps = ne2.lat > sw.lat && sw2.lat < ne.lat, lngOverlaps = ne2.lng > sw.lng && sw2.lng < ne.lng;
            return latOverlaps && lngOverlaps;
          },
          toBBoxString: function() {
            return [this.getWest(), this.getSouth(), this.getEast(), this.getNorth()].join(",");
          },
          equals: function(bounds3, maxMargin) {
            if (!bounds3) {
              return false;
            }
            bounds3 = toLatLngBounds(bounds3);
            return this._southWest.equals(bounds3.getSouthWest(), maxMargin) && this._northEast.equals(bounds3.getNorthEast(), maxMargin);
          },
          isValid: function() {
            return !!(this._southWest && this._northEast);
          }
        };
        function toLatLngBounds(a, b) {
          if (a instanceof LatLngBounds3) {
            return a;
          }
          return new LatLngBounds3(a, b);
        }
        function LatLng3(lat, lng, alt) {
          if (isNaN(lat) || isNaN(lng)) {
            throw new Error("Invalid LatLng object: (" + lat + ", " + lng + ")");
          }
          this.lat = +lat;
          this.lng = +lng;
          if (alt !== void 0) {
            this.alt = +alt;
          }
        }
        LatLng3.prototype = {
          equals: function(obj, maxMargin) {
            if (!obj) {
              return false;
            }
            obj = toLatLng(obj);
            var margin = Math.max(
              Math.abs(this.lat - obj.lat),
              Math.abs(this.lng - obj.lng)
            );
            return margin <= (maxMargin === void 0 ? 1e-9 : maxMargin);
          },
          toString: function(precision) {
            return "LatLng(" + formatNum(this.lat, precision) + ", " + formatNum(this.lng, precision) + ")";
          },
          distanceTo: function(other) {
            return Earth.distance(this, toLatLng(other));
          },
          wrap: function() {
            return Earth.wrapLatLng(this);
          },
          toBounds: function(sizeInMeters) {
            var latAccuracy = 180 * sizeInMeters / 40075017, lngAccuracy = latAccuracy / Math.cos(Math.PI / 180 * this.lat);
            return toLatLngBounds(
              [this.lat - latAccuracy, this.lng - lngAccuracy],
              [this.lat + latAccuracy, this.lng + lngAccuracy]
            );
          },
          clone: function() {
            return new LatLng3(this.lat, this.lng, this.alt);
          }
        };
        function toLatLng(a, b, c) {
          if (a instanceof LatLng3) {
            return a;
          }
          if (isArray(a) && typeof a[0] !== "object") {
            if (a.length === 3) {
              return new LatLng3(a[0], a[1], a[2]);
            }
            if (a.length === 2) {
              return new LatLng3(a[0], a[1]);
            }
            return null;
          }
          if (a === void 0 || a === null) {
            return a;
          }
          if (typeof a === "object" && "lat" in a) {
            return new LatLng3(a.lat, "lng" in a ? a.lng : a.lon, a.alt);
          }
          if (b === void 0) {
            return null;
          }
          return new LatLng3(a, b, c);
        }
        var CRS2 = {
          latLngToPoint: function(latlng, zoom2) {
            var projectedPoint = this.projection.project(latlng), scale3 = this.scale(zoom2);
            return this.transformation._transform(projectedPoint, scale3);
          },
          pointToLatLng: function(point7, zoom2) {
            var scale3 = this.scale(zoom2), untransformedPoint = this.transformation.untransform(point7, scale3);
            return this.projection.unproject(untransformedPoint);
          },
          project: function(latlng) {
            return this.projection.project(latlng);
          },
          unproject: function(point7) {
            return this.projection.unproject(point7);
          },
          scale: function(zoom2) {
            return 256 * Math.pow(2, zoom2);
          },
          zoom: function(scale3) {
            return Math.log(scale3 / 256) / Math.LN2;
          },
          getProjectedBounds: function(zoom2) {
            if (this.infinite) {
              return null;
            }
            var b = this.projection.bounds, s = this.scale(zoom2), min = this.transformation.transform(b.min, s), max = this.transformation.transform(b.max, s);
            return new Bounds2(min, max);
          },
          infinite: false,
          wrapLatLng: function(latlng) {
            var lng = this.wrapLng ? wrapNum(latlng.lng, this.wrapLng, true) : latlng.lng, lat = this.wrapLat ? wrapNum(latlng.lat, this.wrapLat, true) : latlng.lat, alt = latlng.alt;
            return new LatLng3(lat, lng, alt);
          },
          wrapLatLngBounds: function(bounds3) {
            var center = bounds3.getCenter(), newCenter = this.wrapLatLng(center), latShift = center.lat - newCenter.lat, lngShift = center.lng - newCenter.lng;
            if (latShift === 0 && lngShift === 0) {
              return bounds3;
            }
            var sw = bounds3.getSouthWest(), ne = bounds3.getNorthEast(), newSw = new LatLng3(sw.lat - latShift, sw.lng - lngShift), newNe = new LatLng3(ne.lat - latShift, ne.lng - lngShift);
            return new LatLngBounds3(newSw, newNe);
          }
        };
        var Earth = extend16({}, CRS2, {
          wrapLng: [-180, 180],
          R: 6371e3,
          distance: function(latlng1, latlng2) {
            var rad = Math.PI / 180, lat1 = latlng1.lat * rad, lat2 = latlng2.lat * rad, sinDLat = Math.sin((latlng2.lat - latlng1.lat) * rad / 2), sinDLon = Math.sin((latlng2.lng - latlng1.lng) * rad / 2), a = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon, c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            return this.R * c;
          }
        });
        var earthRadius = 6378137;
        var SphericalMercator = {
          R: earthRadius,
          MAX_LATITUDE: 85.0511287798,
          project: function(latlng) {
            var d = Math.PI / 180, max = this.MAX_LATITUDE, lat = Math.max(Math.min(max, latlng.lat), -max), sin = Math.sin(lat * d);
            return new Point3(
              this.R * latlng.lng * d,
              this.R * Math.log((1 + sin) / (1 - sin)) / 2
            );
          },
          unproject: function(point7) {
            var d = 180 / Math.PI;
            return new LatLng3(
              (2 * Math.atan(Math.exp(point7.y / this.R)) - Math.PI / 2) * d,
              point7.x * d / this.R
            );
          },
          bounds: function() {
            var d = earthRadius * Math.PI;
            return new Bounds2([-d, -d], [d, d]);
          }()
        };
        function Transformation2(a, b, c, d) {
          if (isArray(a)) {
            this._a = a[0];
            this._b = a[1];
            this._c = a[2];
            this._d = a[3];
            return;
          }
          this._a = a;
          this._b = b;
          this._c = c;
          this._d = d;
        }
        Transformation2.prototype = {
          transform: function(point7, scale3) {
            return this._transform(point7.clone(), scale3);
          },
          _transform: function(point7, scale3) {
            scale3 = scale3 || 1;
            point7.x = scale3 * (this._a * point7.x + this._b);
            point7.y = scale3 * (this._c * point7.y + this._d);
            return point7;
          },
          untransform: function(point7, scale3) {
            scale3 = scale3 || 1;
            return new Point3(
              (point7.x / scale3 - this._b) / this._a,
              (point7.y / scale3 - this._d) / this._c
            );
          }
        };
        function toTransformation(a, b, c, d) {
          return new Transformation2(a, b, c, d);
        }
        var EPSG3857 = extend16({}, Earth, {
          code: "EPSG:3857",
          projection: SphericalMercator,
          transformation: function() {
            var scale3 = 0.5 / (Math.PI * SphericalMercator.R);
            return toTransformation(scale3, 0.5, -scale3, 0.5);
          }()
        });
        var EPSG900913 = extend16({}, EPSG3857, {
          code: "EPSG:900913"
        });
        function svgCreate(name) {
          return document.createElementNS("http://www.w3.org/2000/svg", name);
        }
        function pointsToPath(rings, closed) {
          var str = "", i, j, len, len2, points, p;
          for (i = 0, len = rings.length; i < len; i++) {
            points = rings[i];
            for (j = 0, len2 = points.length; j < len2; j++) {
              p = points[j];
              str += (j ? "L" : "M") + p.x + " " + p.y;
            }
            str += closed ? Browser5.svg ? "z" : "x" : "";
          }
          return str || "M0 0";
        }
        var style = document.documentElement.style;
        var ie = "ActiveXObject" in window;
        var ielt9 = ie && !document.addEventListener;
        var edge = "msLaunchUri" in navigator && !("documentMode" in document);
        var webkit = userAgentContains("webkit");
        var android = userAgentContains("android");
        var android23 = userAgentContains("android 2") || userAgentContains("android 3");
        var webkitVer = parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1], 10);
        var androidStock = android && userAgentContains("Google") && webkitVer < 537 && !("AudioNode" in window);
        var opera = !!window.opera;
        var chrome = !edge && userAgentContains("chrome");
        var gecko = userAgentContains("gecko") && !webkit && !opera && !ie;
        var safari = !chrome && userAgentContains("safari");
        var phantom = userAgentContains("phantom");
        var opera12 = "OTransition" in style;
        var win = navigator.platform.indexOf("Win") === 0;
        var ie3d = ie && "transition" in style;
        var webkit3d = "WebKitCSSMatrix" in window && "m11" in new window.WebKitCSSMatrix() && !android23;
        var gecko3d = "MozPerspective" in style;
        var any3d = !window.L_DISABLE_3D && (ie3d || webkit3d || gecko3d) && !opera12 && !phantom;
        var mobile = typeof orientation !== "undefined" || userAgentContains("mobile");
        var mobileWebkit = mobile && webkit;
        var mobileWebkit3d = mobile && webkit3d;
        var msPointer = !window.PointerEvent && window.MSPointerEvent;
        var pointer = !!(window.PointerEvent || msPointer);
        var touchNative = "ontouchstart" in window || !!window.TouchEvent;
        var touch = !window.L_NO_TOUCH && (touchNative || pointer);
        var mobileOpera = mobile && opera;
        var mobileGecko = mobile && gecko;
        var retina = (window.devicePixelRatio || window.screen.deviceXDPI / window.screen.logicalXDPI) > 1;
        var passiveEvents = function() {
          var supportsPassiveOption = false;
          try {
            var opts = Object.defineProperty({}, "passive", {
              get: function() {
                supportsPassiveOption = true;
              }
            });
            window.addEventListener("testPassiveEventSupport", falseFn, opts);
            window.removeEventListener("testPassiveEventSupport", falseFn, opts);
          } catch (e) {
          }
          return supportsPassiveOption;
        }();
        var canvas$1 = function() {
          return !!document.createElement("canvas").getContext;
        }();
        var svg$1 = !!(document.createElementNS && svgCreate("svg").createSVGRect);
        var inlineSvg = !!svg$1 && function() {
          var div = document.createElement("div");
          div.innerHTML = "<svg/>";
          return (div.firstChild && div.firstChild.namespaceURI) === "http://www.w3.org/2000/svg";
        }();
        var vml = !svg$1 && function() {
          try {
            var div = document.createElement("div");
            div.innerHTML = '<v:shape adj="1"/>';
            var shape = div.firstChild;
            shape.style.behavior = "url(#default#VML)";
            return shape && typeof shape.adj === "object";
          } catch (e) {
            return false;
          }
        }();
        var mac = navigator.platform.indexOf("Mac") === 0;
        var linux = navigator.platform.indexOf("Linux") === 0;
        function userAgentContains(str) {
          return navigator.userAgent.toLowerCase().indexOf(str) >= 0;
        }
        var Browser5 = {
          ie,
          ielt9,
          edge,
          webkit,
          android,
          android23,
          androidStock,
          opera,
          chrome,
          gecko,
          safari,
          phantom,
          opera12,
          win,
          ie3d,
          webkit3d,
          gecko3d,
          any3d,
          mobile,
          mobileWebkit,
          mobileWebkit3d,
          msPointer,
          pointer,
          touch,
          touchNative,
          mobileOpera,
          mobileGecko,
          retina,
          passiveEvents,
          canvas: canvas$1,
          svg: svg$1,
          vml,
          inlineSvg,
          mac,
          linux
        };
        var POINTER_DOWN = Browser5.msPointer ? "MSPointerDown" : "pointerdown";
        var POINTER_MOVE = Browser5.msPointer ? "MSPointerMove" : "pointermove";
        var POINTER_UP = Browser5.msPointer ? "MSPointerUp" : "pointerup";
        var POINTER_CANCEL = Browser5.msPointer ? "MSPointerCancel" : "pointercancel";
        var pEvent = {
          touchstart: POINTER_DOWN,
          touchmove: POINTER_MOVE,
          touchend: POINTER_UP,
          touchcancel: POINTER_CANCEL
        };
        var handle = {
          touchstart: _onPointerStart,
          touchmove: _handlePointer,
          touchend: _handlePointer,
          touchcancel: _handlePointer
        };
        var _pointers = {};
        var _pointerDocListener = false;
        function addPointerListener(obj, type, handler) {
          if (type === "touchstart") {
            _addPointerDocListener();
          }
          if (!handle[type]) {
            console.warn("wrong event specified:", type);
            return falseFn;
          }
          handler = handle[type].bind(this, handler);
          obj.addEventListener(pEvent[type], handler, false);
          return handler;
        }
        function removePointerListener(obj, type, handler) {
          if (!pEvent[type]) {
            console.warn("wrong event specified:", type);
            return;
          }
          obj.removeEventListener(pEvent[type], handler, false);
        }
        function _globalPointerDown(e) {
          _pointers[e.pointerId] = e;
        }
        function _globalPointerMove(e) {
          if (_pointers[e.pointerId]) {
            _pointers[e.pointerId] = e;
          }
        }
        function _globalPointerUp(e) {
          delete _pointers[e.pointerId];
        }
        function _addPointerDocListener() {
          if (!_pointerDocListener) {
            document.addEventListener(POINTER_DOWN, _globalPointerDown, true);
            document.addEventListener(POINTER_MOVE, _globalPointerMove, true);
            document.addEventListener(POINTER_UP, _globalPointerUp, true);
            document.addEventListener(POINTER_CANCEL, _globalPointerUp, true);
            _pointerDocListener = true;
          }
        }
        function _handlePointer(handler, e) {
          if (e.pointerType === (e.MSPOINTER_TYPE_MOUSE || "mouse")) {
            return;
          }
          e.touches = [];
          for (var i in _pointers) {
            e.touches.push(_pointers[i]);
          }
          e.changedTouches = [e];
          handler(e);
        }
        function _onPointerStart(handler, e) {
          if (e.MSPOINTER_TYPE_TOUCH && e.pointerType === e.MSPOINTER_TYPE_TOUCH) {
            preventDefault(e);
          }
          _handlePointer(handler, e);
        }
        function makeDblclick(event) {
          var newEvent = {}, prop, i;
          for (i in event) {
            prop = event[i];
            newEvent[i] = prop && prop.bind ? prop.bind(event) : prop;
          }
          event = newEvent;
          newEvent.type = "dblclick";
          newEvent.detail = 2;
          newEvent.isTrusted = false;
          newEvent._simulated = true;
          return newEvent;
        }
        var delay = 200;
        function addDoubleTapListener(obj, handler) {
          obj.addEventListener("dblclick", handler);
          var last = 0, detail;
          function simDblclick(e) {
            if (e.detail !== 1) {
              detail = e.detail;
              return;
            }
            if (e.pointerType === "mouse" || e.sourceCapabilities && !e.sourceCapabilities.firesTouchEvents) {
              return;
            }
            var path = getPropagationPath(e);
            if (path.some(function(el) {
              return el instanceof HTMLLabelElement && el.attributes.for;
            }) && !path.some(function(el) {
              return el instanceof HTMLInputElement || el instanceof HTMLSelectElement;
            })) {
              return;
            }
            var now = Date.now();
            if (now - last <= delay) {
              detail++;
              if (detail === 2) {
                handler(makeDblclick(e));
              }
            } else {
              detail = 1;
            }
            last = now;
          }
          obj.addEventListener("click", simDblclick);
          return {
            dblclick: handler,
            simDblclick
          };
        }
        function removeDoubleTapListener(obj, handlers) {
          obj.removeEventListener("dblclick", handlers.dblclick);
          obj.removeEventListener("click", handlers.simDblclick);
        }
        var TRANSFORM = testProp(
          ["transform", "webkitTransform", "OTransform", "MozTransform", "msTransform"]
        );
        var TRANSITION = testProp(
          ["webkitTransition", "transition", "OTransition", "MozTransition", "msTransition"]
        );
        var TRANSITION_END = TRANSITION === "webkitTransition" || TRANSITION === "OTransition" ? TRANSITION + "End" : "transitionend";
        function get(id) {
          return typeof id === "string" ? document.getElementById(id) : id;
        }
        function getStyle(el, style2) {
          var value = el.style[style2] || el.currentStyle && el.currentStyle[style2];
          if ((!value || value === "auto") && document.defaultView) {
            var css = document.defaultView.getComputedStyle(el, null);
            value = css ? css[style2] : null;
          }
          return value === "auto" ? null : value;
        }
        function create$1(tagName, className, container) {
          var el = document.createElement(tagName);
          el.className = className || "";
          if (container) {
            container.appendChild(el);
          }
          return el;
        }
        function remove(el) {
          var parent = el.parentNode;
          if (parent) {
            parent.removeChild(el);
          }
        }
        function empty(el) {
          while (el.firstChild) {
            el.removeChild(el.firstChild);
          }
        }
        function toFront(el) {
          var parent = el.parentNode;
          if (parent && parent.lastChild !== el) {
            parent.appendChild(el);
          }
        }
        function toBack(el) {
          var parent = el.parentNode;
          if (parent && parent.firstChild !== el) {
            parent.insertBefore(el, parent.firstChild);
          }
        }
        function hasClass(el, name) {
          if (el.classList !== void 0) {
            return el.classList.contains(name);
          }
          var className = getClass(el);
          return className.length > 0 && new RegExp("(^|\\s)" + name + "(\\s|$)").test(className);
        }
        function addClass(el, name) {
          if (el.classList !== void 0) {
            var classes = splitWords(name);
            for (var i = 0, len = classes.length; i < len; i++) {
              el.classList.add(classes[i]);
            }
          } else if (!hasClass(el, name)) {
            var className = getClass(el);
            setClass(el, (className ? className + " " : "") + name);
          }
        }
        function removeClass(el, name) {
          if (el.classList !== void 0) {
            el.classList.remove(name);
          } else {
            setClass(el, trim((" " + getClass(el) + " ").replace(" " + name + " ", " ")));
          }
        }
        function setClass(el, name) {
          if (el.className.baseVal === void 0) {
            el.className = name;
          } else {
            el.className.baseVal = name;
          }
        }
        function getClass(el) {
          if (el.correspondingElement) {
            el = el.correspondingElement;
          }
          return el.className.baseVal === void 0 ? el.className : el.className.baseVal;
        }
        function setOpacity(el, value) {
          if ("opacity" in el.style) {
            el.style.opacity = value;
          } else if ("filter" in el.style) {
            _setOpacityIE(el, value);
          }
        }
        function _setOpacityIE(el, value) {
          var filter = false, filterName = "DXImageTransform.Microsoft.Alpha";
          try {
            filter = el.filters.item(filterName);
          } catch (e) {
            if (value === 1) {
              return;
            }
          }
          value = Math.round(value * 100);
          if (filter) {
            filter.Enabled = value !== 100;
            filter.Opacity = value;
          } else {
            el.style.filter += " progid:" + filterName + "(opacity=" + value + ")";
          }
        }
        function testProp(props) {
          var style2 = document.documentElement.style;
          for (var i = 0; i < props.length; i++) {
            if (props[i] in style2) {
              return props[i];
            }
          }
          return false;
        }
        function setTransform(el, offset, scale3) {
          var pos = offset || new Point3(0, 0);
          el.style[TRANSFORM] = (Browser5.ie3d ? "translate(" + pos.x + "px," + pos.y + "px)" : "translate3d(" + pos.x + "px," + pos.y + "px,0)") + (scale3 ? " scale(" + scale3 + ")" : "");
        }
        function setPosition(el, point7) {
          el._leaflet_pos = point7;
          if (Browser5.any3d) {
            setTransform(el, point7);
          } else {
            el.style.left = point7.x + "px";
            el.style.top = point7.y + "px";
          }
        }
        function getPosition(el) {
          return el._leaflet_pos || new Point3(0, 0);
        }
        var disableTextSelection;
        var enableTextSelection;
        var _userSelect;
        if ("onselectstart" in document) {
          disableTextSelection = function() {
            on(window, "selectstart", preventDefault);
          };
          enableTextSelection = function() {
            off(window, "selectstart", preventDefault);
          };
        } else {
          var userSelectProperty = testProp(
            ["userSelect", "WebkitUserSelect", "OUserSelect", "MozUserSelect", "msUserSelect"]
          );
          disableTextSelection = function() {
            if (userSelectProperty) {
              var style2 = document.documentElement.style;
              _userSelect = style2[userSelectProperty];
              style2[userSelectProperty] = "none";
            }
          };
          enableTextSelection = function() {
            if (userSelectProperty) {
              document.documentElement.style[userSelectProperty] = _userSelect;
              _userSelect = void 0;
            }
          };
        }
        function disableImageDrag() {
          on(window, "dragstart", preventDefault);
        }
        function enableImageDrag() {
          off(window, "dragstart", preventDefault);
        }
        var _outlineElement, _outlineStyle;
        function preventOutline(element) {
          while (element.tabIndex === -1) {
            element = element.parentNode;
          }
          if (!element.style) {
            return;
          }
          restoreOutline();
          _outlineElement = element;
          _outlineStyle = element.style.outline;
          element.style.outline = "none";
          on(window, "keydown", restoreOutline);
        }
        function restoreOutline() {
          if (!_outlineElement) {
            return;
          }
          _outlineElement.style.outline = _outlineStyle;
          _outlineElement = void 0;
          _outlineStyle = void 0;
          off(window, "keydown", restoreOutline);
        }
        function getSizedParentNode(element) {
          do {
            element = element.parentNode;
          } while ((!element.offsetWidth || !element.offsetHeight) && element !== document.body);
          return element;
        }
        function getScale(element) {
          var rect = element.getBoundingClientRect();
          return {
            x: rect.width / element.offsetWidth || 1,
            y: rect.height / element.offsetHeight || 1,
            boundingClientRect: rect
          };
        }
        var DomUtil17 = {
          __proto__: null,
          TRANSFORM,
          TRANSITION,
          TRANSITION_END,
          get,
          getStyle,
          create: create$1,
          remove,
          empty,
          toFront,
          toBack,
          hasClass,
          addClass,
          removeClass,
          setClass,
          getClass,
          setOpacity,
          testProp,
          setTransform,
          setPosition,
          getPosition,
          get disableTextSelection() {
            return disableTextSelection;
          },
          get enableTextSelection() {
            return enableTextSelection;
          },
          disableImageDrag,
          enableImageDrag,
          preventOutline,
          restoreOutline,
          getSizedParentNode,
          getScale
        };
        function on(obj, types, fn, context) {
          if (types && typeof types === "object") {
            for (var type in types) {
              addOne(obj, type, types[type], fn);
            }
          } else {
            types = splitWords(types);
            for (var i = 0, len = types.length; i < len; i++) {
              addOne(obj, types[i], fn, context);
            }
          }
          return this;
        }
        var eventsKey = "_leaflet_events";
        function off(obj, types, fn, context) {
          if (arguments.length === 1) {
            batchRemove(obj);
            delete obj[eventsKey];
          } else if (types && typeof types === "object") {
            for (var type in types) {
              removeOne(obj, type, types[type], fn);
            }
          } else {
            types = splitWords(types);
            if (arguments.length === 2) {
              batchRemove(obj, function(type2) {
                return indexOf(types, type2) !== -1;
              });
            } else {
              for (var i = 0, len = types.length; i < len; i++) {
                removeOne(obj, types[i], fn, context);
              }
            }
          }
          return this;
        }
        function batchRemove(obj, filterFn) {
          for (var id in obj[eventsKey]) {
            var type = id.split(/\d/)[0];
            if (!filterFn || filterFn(type)) {
              removeOne(obj, type, null, null, id);
            }
          }
        }
        var mouseSubst = {
          mouseenter: "mouseover",
          mouseleave: "mouseout",
          wheel: !("onwheel" in window) && "mousewheel"
        };
        function addOne(obj, type, fn, context) {
          var id = type + stamp2(fn) + (context ? "_" + stamp2(context) : "");
          if (obj[eventsKey] && obj[eventsKey][id]) {
            return this;
          }
          var handler = function(e) {
            return fn.call(context || obj, e || window.event);
          };
          var originalHandler = handler;
          if (!Browser5.touchNative && Browser5.pointer && type.indexOf("touch") === 0) {
            handler = addPointerListener(obj, type, handler);
          } else if (Browser5.touch && type === "dblclick") {
            handler = addDoubleTapListener(obj, handler);
          } else if ("addEventListener" in obj) {
            if (type === "touchstart" || type === "touchmove" || type === "wheel" || type === "mousewheel") {
              obj.addEventListener(mouseSubst[type] || type, handler, Browser5.passiveEvents ? { passive: false } : false);
            } else if (type === "mouseenter" || type === "mouseleave") {
              handler = function(e) {
                e = e || window.event;
                if (isExternalTarget(obj, e)) {
                  originalHandler(e);
                }
              };
              obj.addEventListener(mouseSubst[type], handler, false);
            } else {
              obj.addEventListener(type, originalHandler, false);
            }
          } else {
            obj.attachEvent("on" + type, handler);
          }
          obj[eventsKey] = obj[eventsKey] || {};
          obj[eventsKey][id] = handler;
        }
        function removeOne(obj, type, fn, context, id) {
          id = id || type + stamp2(fn) + (context ? "_" + stamp2(context) : "");
          var handler = obj[eventsKey] && obj[eventsKey][id];
          if (!handler) {
            return this;
          }
          if (!Browser5.touchNative && Browser5.pointer && type.indexOf("touch") === 0) {
            removePointerListener(obj, type, handler);
          } else if (Browser5.touch && type === "dblclick") {
            removeDoubleTapListener(obj, handler);
          } else if ("removeEventListener" in obj) {
            obj.removeEventListener(mouseSubst[type] || type, handler, false);
          } else {
            obj.detachEvent("on" + type, handler);
          }
          obj[eventsKey][id] = null;
        }
        function stopPropagation(e) {
          if (e.stopPropagation) {
            e.stopPropagation();
          } else if (e.originalEvent) {
            e.originalEvent._stopped = true;
          } else {
            e.cancelBubble = true;
          }
          return this;
        }
        function disableScrollPropagation(el) {
          addOne(el, "wheel", stopPropagation);
          return this;
        }
        function disableClickPropagation(el) {
          on(el, "mousedown touchstart dblclick contextmenu", stopPropagation);
          el["_leaflet_disable_click"] = true;
          return this;
        }
        function preventDefault(e) {
          if (e.preventDefault) {
            e.preventDefault();
          } else {
            e.returnValue = false;
          }
          return this;
        }
        function stop(e) {
          preventDefault(e);
          stopPropagation(e);
          return this;
        }
        function getPropagationPath(ev) {
          if (ev.composedPath) {
            return ev.composedPath();
          }
          var path = [];
          var el = ev.target;
          while (el) {
            path.push(el);
            el = el.parentNode;
          }
          return path;
        }
        function getMousePosition(e, container) {
          if (!container) {
            return new Point3(e.clientX, e.clientY);
          }
          var scale3 = getScale(container), offset = scale3.boundingClientRect;
          return new Point3(
            (e.clientX - offset.left) / scale3.x - container.clientLeft,
            (e.clientY - offset.top) / scale3.y - container.clientTop
          );
        }
        var wheelPxFactor = Browser5.linux && Browser5.chrome ? window.devicePixelRatio : Browser5.mac ? window.devicePixelRatio * 3 : window.devicePixelRatio > 0 ? 2 * window.devicePixelRatio : 1;
        function getWheelDelta(e) {
          return Browser5.edge ? e.wheelDeltaY / 2 : e.deltaY && e.deltaMode === 0 ? -e.deltaY / wheelPxFactor : e.deltaY && e.deltaMode === 1 ? -e.deltaY * 20 : e.deltaY && e.deltaMode === 2 ? -e.deltaY * 60 : e.deltaX || e.deltaZ ? 0 : e.wheelDelta ? (e.wheelDeltaY || e.wheelDelta) / 2 : e.detail && Math.abs(e.detail) < 32765 ? -e.detail * 20 : e.detail ? e.detail / -32765 * 60 : 0;
        }
        function isExternalTarget(el, e) {
          var related = e.relatedTarget;
          if (!related) {
            return true;
          }
          try {
            while (related && related !== el) {
              related = related.parentNode;
            }
          } catch (err) {
            return false;
          }
          return related !== el;
        }
        var DomEvent13 = {
          __proto__: null,
          on,
          off,
          stopPropagation,
          disableScrollPropagation,
          disableClickPropagation,
          preventDefault,
          stop,
          getPropagationPath,
          getMousePosition,
          getWheelDelta,
          isExternalTarget,
          addListener: on,
          removeListener: off
        };
        var PosAnimation = Evented3.extend({
          run: function(el, newPos, duration, easeLinearity) {
            this.stop();
            this._el = el;
            this._inProgress = true;
            this._duration = duration || 0.25;
            this._easeOutPower = 1 / Math.max(easeLinearity || 0.5, 0.2);
            this._startPos = getPosition(el);
            this._offset = newPos.subtract(this._startPos);
            this._startTime = +new Date();
            this.fire("start");
            this._animate();
          },
          stop: function() {
            if (!this._inProgress) {
              return;
            }
            this._step(true);
            this._complete();
          },
          _animate: function() {
            this._animId = requestAnimFrame(this._animate, this);
            this._step();
          },
          _step: function(round) {
            var elapsed = +new Date() - this._startTime, duration = this._duration * 1e3;
            if (elapsed < duration) {
              this._runFrame(this._easeOut(elapsed / duration), round);
            } else {
              this._runFrame(1);
              this._complete();
            }
          },
          _runFrame: function(progress, round) {
            var pos = this._startPos.add(this._offset.multiplyBy(progress));
            if (round) {
              pos._round();
            }
            setPosition(this._el, pos);
            this.fire("step");
          },
          _complete: function() {
            cancelAnimFrame(this._animId);
            this._inProgress = false;
            this.fire("end");
          },
          _easeOut: function(t) {
            return 1 - Math.pow(1 - t, this._easeOutPower);
          }
        });
        var Map4 = Evented3.extend({
          options: {
            crs: EPSG3857,
            center: void 0,
            zoom: void 0,
            minZoom: void 0,
            maxZoom: void 0,
            layers: [],
            maxBounds: void 0,
            renderer: void 0,
            zoomAnimation: true,
            zoomAnimationThreshold: 4,
            fadeAnimation: true,
            markerZoomAnimation: true,
            transform3DLimit: 8388608,
            zoomSnap: 1,
            zoomDelta: 1,
            trackResize: true
          },
          initialize: function(id, options) {
            options = setOptions(this, options);
            this._handlers = [];
            this._layers = {};
            this._zoomBoundLayers = {};
            this._sizeChanged = true;
            this._initContainer(id);
            this._initLayout();
            this._onResize = bind(this._onResize, this);
            this._initEvents();
            if (options.maxBounds) {
              this.setMaxBounds(options.maxBounds);
            }
            if (options.zoom !== void 0) {
              this._zoom = this._limitZoom(options.zoom);
            }
            if (options.center && options.zoom !== void 0) {
              this.setView(toLatLng(options.center), options.zoom, { reset: true });
            }
            this.callInitHooks();
            this._zoomAnimated = TRANSITION && Browser5.any3d && !Browser5.mobileOpera && this.options.zoomAnimation;
            if (this._zoomAnimated) {
              this._createAnimProxy();
              on(this._proxy, TRANSITION_END, this._catchTransitionEnd, this);
            }
            this._addLayers(this.options.layers);
          },
          setView: function(center, zoom2, options) {
            zoom2 = zoom2 === void 0 ? this._zoom : this._limitZoom(zoom2);
            center = this._limitCenter(toLatLng(center), zoom2, this.options.maxBounds);
            options = options || {};
            this._stop();
            if (this._loaded && !options.reset && options !== true) {
              if (options.animate !== void 0) {
                options.zoom = extend16({ animate: options.animate }, options.zoom);
                options.pan = extend16({ animate: options.animate, duration: options.duration }, options.pan);
              }
              var moved = this._zoom !== zoom2 ? this._tryAnimatedZoom && this._tryAnimatedZoom(center, zoom2, options.zoom) : this._tryAnimatedPan(center, options.pan);
              if (moved) {
                clearTimeout(this._sizeTimer);
                return this;
              }
            }
            this._resetView(center, zoom2, options.pan && options.pan.noMoveStart);
            return this;
          },
          setZoom: function(zoom2, options) {
            if (!this._loaded) {
              this._zoom = zoom2;
              return this;
            }
            return this.setView(this.getCenter(), zoom2, { zoom: options });
          },
          zoomIn: function(delta, options) {
            delta = delta || (Browser5.any3d ? this.options.zoomDelta : 1);
            return this.setZoom(this._zoom + delta, options);
          },
          zoomOut: function(delta, options) {
            delta = delta || (Browser5.any3d ? this.options.zoomDelta : 1);
            return this.setZoom(this._zoom - delta, options);
          },
          setZoomAround: function(latlng, zoom2, options) {
            var scale3 = this.getZoomScale(zoom2), viewHalf = this.getSize().divideBy(2), containerPoint = latlng instanceof Point3 ? latlng : this.latLngToContainerPoint(latlng), centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale3), newCenter = this.containerPointToLatLng(viewHalf.add(centerOffset));
            return this.setView(newCenter, zoom2, { zoom: options });
          },
          _getBoundsCenterZoom: function(bounds3, options) {
            options = options || {};
            bounds3 = bounds3.getBounds ? bounds3.getBounds() : toLatLngBounds(bounds3);
            var paddingTL = toPoint(options.paddingTopLeft || options.padding || [0, 0]), paddingBR = toPoint(options.paddingBottomRight || options.padding || [0, 0]), zoom2 = this.getBoundsZoom(bounds3, false, paddingTL.add(paddingBR));
            zoom2 = typeof options.maxZoom === "number" ? Math.min(options.maxZoom, zoom2) : zoom2;
            if (zoom2 === Infinity) {
              return {
                center: bounds3.getCenter(),
                zoom: zoom2
              };
            }
            var paddingOffset = paddingBR.subtract(paddingTL).divideBy(2), swPoint = this.project(bounds3.getSouthWest(), zoom2), nePoint = this.project(bounds3.getNorthEast(), zoom2), center = this.unproject(swPoint.add(nePoint).divideBy(2).add(paddingOffset), zoom2);
            return {
              center,
              zoom: zoom2
            };
          },
          fitBounds: function(bounds3, options) {
            bounds3 = toLatLngBounds(bounds3);
            if (!bounds3.isValid()) {
              throw new Error("Bounds are not valid.");
            }
            var target = this._getBoundsCenterZoom(bounds3, options);
            return this.setView(target.center, target.zoom, options);
          },
          fitWorld: function(options) {
            return this.fitBounds([[-90, -180], [90, 180]], options);
          },
          panTo: function(center, options) {
            return this.setView(center, this._zoom, { pan: options });
          },
          panBy: function(offset, options) {
            offset = toPoint(offset).round();
            options = options || {};
            if (!offset.x && !offset.y) {
              return this.fire("moveend");
            }
            if (options.animate !== true && !this.getSize().contains(offset)) {
              this._resetView(this.unproject(this.project(this.getCenter()).add(offset)), this.getZoom());
              return this;
            }
            if (!this._panAnim) {
              this._panAnim = new PosAnimation();
              this._panAnim.on({
                "step": this._onPanTransitionStep,
                "end": this._onPanTransitionEnd
              }, this);
            }
            if (!options.noMoveStart) {
              this.fire("movestart");
            }
            if (options.animate !== false) {
              addClass(this._mapPane, "leaflet-pan-anim");
              var newPos = this._getMapPanePos().subtract(offset).round();
              this._panAnim.run(this._mapPane, newPos, options.duration || 0.25, options.easeLinearity);
            } else {
              this._rawPanBy(offset);
              this.fire("move").fire("moveend");
            }
            return this;
          },
          flyTo: function(targetCenter, targetZoom, options) {
            options = options || {};
            if (options.animate === false || !Browser5.any3d) {
              return this.setView(targetCenter, targetZoom, options);
            }
            this._stop();
            var from = this.project(this.getCenter()), to = this.project(targetCenter), size = this.getSize(), startZoom = this._zoom;
            targetCenter = toLatLng(targetCenter);
            targetZoom = targetZoom === void 0 ? startZoom : targetZoom;
            var w0 = Math.max(size.x, size.y), w1 = w0 * this.getZoomScale(startZoom, targetZoom), u1 = to.distanceTo(from) || 1, rho = 1.42, rho2 = rho * rho;
            function r(i) {
              var s1 = i ? -1 : 1, s2 = i ? w1 : w0, t1 = w1 * w1 - w0 * w0 + s1 * rho2 * rho2 * u1 * u1, b1 = 2 * s2 * rho2 * u1, b = t1 / b1, sq = Math.sqrt(b * b + 1) - b;
              var log = sq < 1e-9 ? -18 : Math.log(sq);
              return log;
            }
            function sinh(n) {
              return (Math.exp(n) - Math.exp(-n)) / 2;
            }
            function cosh(n) {
              return (Math.exp(n) + Math.exp(-n)) / 2;
            }
            function tanh(n) {
              return sinh(n) / cosh(n);
            }
            var r0 = r(0);
            function w(s) {
              return w0 * (cosh(r0) / cosh(r0 + rho * s));
            }
            function u(s) {
              return w0 * (cosh(r0) * tanh(r0 + rho * s) - sinh(r0)) / rho2;
            }
            function easeOut(t) {
              return 1 - Math.pow(1 - t, 1.5);
            }
            var start = Date.now(), S = (r(1) - r0) / rho, duration = options.duration ? 1e3 * options.duration : 1e3 * S * 0.8;
            function frame() {
              var t = (Date.now() - start) / duration, s = easeOut(t) * S;
              if (t <= 1) {
                this._flyToFrame = requestAnimFrame(frame, this);
                this._move(
                  this.unproject(from.add(to.subtract(from).multiplyBy(u(s) / u1)), startZoom),
                  this.getScaleZoom(w0 / w(s), startZoom),
                  { flyTo: true }
                );
              } else {
                this._move(targetCenter, targetZoom)._moveEnd(true);
              }
            }
            this._moveStart(true, options.noMoveStart);
            frame.call(this);
            return this;
          },
          flyToBounds: function(bounds3, options) {
            var target = this._getBoundsCenterZoom(bounds3, options);
            return this.flyTo(target.center, target.zoom, options);
          },
          setMaxBounds: function(bounds3) {
            bounds3 = toLatLngBounds(bounds3);
            if (this.listens("moveend", this._panInsideMaxBounds)) {
              this.off("moveend", this._panInsideMaxBounds);
            }
            if (!bounds3.isValid()) {
              this.options.maxBounds = null;
              return this;
            }
            this.options.maxBounds = bounds3;
            if (this._loaded) {
              this._panInsideMaxBounds();
            }
            return this.on("moveend", this._panInsideMaxBounds);
          },
          setMinZoom: function(zoom2) {
            var oldZoom = this.options.minZoom;
            this.options.minZoom = zoom2;
            if (this._loaded && oldZoom !== zoom2) {
              this.fire("zoomlevelschange");
              if (this.getZoom() < this.options.minZoom) {
                return this.setZoom(zoom2);
              }
            }
            return this;
          },
          setMaxZoom: function(zoom2) {
            var oldZoom = this.options.maxZoom;
            this.options.maxZoom = zoom2;
            if (this._loaded && oldZoom !== zoom2) {
              this.fire("zoomlevelschange");
              if (this.getZoom() > this.options.maxZoom) {
                return this.setZoom(zoom2);
              }
            }
            return this;
          },
          panInsideBounds: function(bounds3, options) {
            this._enforcingBounds = true;
            var center = this.getCenter(), newCenter = this._limitCenter(center, this._zoom, toLatLngBounds(bounds3));
            if (!center.equals(newCenter)) {
              this.panTo(newCenter, options);
            }
            this._enforcingBounds = false;
            return this;
          },
          panInside: function(latlng, options) {
            options = options || {};
            var paddingTL = toPoint(options.paddingTopLeft || options.padding || [0, 0]), paddingBR = toPoint(options.paddingBottomRight || options.padding || [0, 0]), pixelCenter = this.project(this.getCenter()), pixelPoint = this.project(latlng), pixelBounds = this.getPixelBounds(), paddedBounds = toBounds([pixelBounds.min.add(paddingTL), pixelBounds.max.subtract(paddingBR)]), paddedSize = paddedBounds.getSize();
            if (!paddedBounds.contains(pixelPoint)) {
              this._enforcingBounds = true;
              var centerOffset = pixelPoint.subtract(paddedBounds.getCenter());
              var offset = paddedBounds.extend(pixelPoint).getSize().subtract(paddedSize);
              pixelCenter.x += centerOffset.x < 0 ? -offset.x : offset.x;
              pixelCenter.y += centerOffset.y < 0 ? -offset.y : offset.y;
              this.panTo(this.unproject(pixelCenter), options);
              this._enforcingBounds = false;
            }
            return this;
          },
          invalidateSize: function(options) {
            if (!this._loaded) {
              return this;
            }
            options = extend16({
              animate: false,
              pan: true
            }, options === true ? { animate: true } : options);
            var oldSize = this.getSize();
            this._sizeChanged = true;
            this._lastCenter = null;
            var newSize = this.getSize(), oldCenter = oldSize.divideBy(2).round(), newCenter = newSize.divideBy(2).round(), offset = oldCenter.subtract(newCenter);
            if (!offset.x && !offset.y) {
              return this;
            }
            if (options.animate && options.pan) {
              this.panBy(offset);
            } else {
              if (options.pan) {
                this._rawPanBy(offset);
              }
              this.fire("move");
              if (options.debounceMoveend) {
                clearTimeout(this._sizeTimer);
                this._sizeTimer = setTimeout(bind(this.fire, this, "moveend"), 200);
              } else {
                this.fire("moveend");
              }
            }
            return this.fire("resize", {
              oldSize,
              newSize
            });
          },
          stop: function() {
            this.setZoom(this._limitZoom(this._zoom));
            if (!this.options.zoomSnap) {
              this.fire("viewreset");
            }
            return this._stop();
          },
          locate: function(options) {
            options = this._locateOptions = extend16({
              timeout: 1e4,
              watch: false
            }, options);
            if (!("geolocation" in navigator)) {
              this._handleGeolocationError({
                code: 0,
                message: "Geolocation not supported."
              });
              return this;
            }
            var onResponse = bind(this._handleGeolocationResponse, this), onError = bind(this._handleGeolocationError, this);
            if (options.watch) {
              this._locationWatchId = navigator.geolocation.watchPosition(onResponse, onError, options);
            } else {
              navigator.geolocation.getCurrentPosition(onResponse, onError, options);
            }
            return this;
          },
          stopLocate: function() {
            if (navigator.geolocation && navigator.geolocation.clearWatch) {
              navigator.geolocation.clearWatch(this._locationWatchId);
            }
            if (this._locateOptions) {
              this._locateOptions.setView = false;
            }
            return this;
          },
          _handleGeolocationError: function(error) {
            if (!this._container._leaflet_id) {
              return;
            }
            var c = error.code, message = error.message || (c === 1 ? "permission denied" : c === 2 ? "position unavailable" : "timeout");
            if (this._locateOptions.setView && !this._loaded) {
              this.fitWorld();
            }
            this.fire("locationerror", {
              code: c,
              message: "Geolocation error: " + message + "."
            });
          },
          _handleGeolocationResponse: function(pos) {
            if (!this._container._leaflet_id) {
              return;
            }
            var lat = pos.coords.latitude, lng = pos.coords.longitude, latlng = new LatLng3(lat, lng), bounds3 = latlng.toBounds(pos.coords.accuracy * 2), options = this._locateOptions;
            if (options.setView) {
              var zoom2 = this.getBoundsZoom(bounds3);
              this.setView(latlng, options.maxZoom ? Math.min(zoom2, options.maxZoom) : zoom2);
            }
            var data = {
              latlng,
              bounds: bounds3,
              timestamp: pos.timestamp
            };
            for (var i in pos.coords) {
              if (typeof pos.coords[i] === "number") {
                data[i] = pos.coords[i];
              }
            }
            this.fire("locationfound", data);
          },
          addHandler: function(name, HandlerClass) {
            if (!HandlerClass) {
              return this;
            }
            var handler = this[name] = new HandlerClass(this);
            this._handlers.push(handler);
            if (this.options[name]) {
              handler.enable();
            }
            return this;
          },
          remove: function() {
            this._initEvents(true);
            if (this.options.maxBounds) {
              this.off("moveend", this._panInsideMaxBounds);
            }
            if (this._containerId !== this._container._leaflet_id) {
              throw new Error("Map container is being reused by another instance");
            }
            try {
              delete this._container._leaflet_id;
              delete this._containerId;
            } catch (e) {
              this._container._leaflet_id = void 0;
              this._containerId = void 0;
            }
            if (this._locationWatchId !== void 0) {
              this.stopLocate();
            }
            this._stop();
            remove(this._mapPane);
            if (this._clearControlPos) {
              this._clearControlPos();
            }
            if (this._resizeRequest) {
              cancelAnimFrame(this._resizeRequest);
              this._resizeRequest = null;
            }
            this._clearHandlers();
            if (this._loaded) {
              this.fire("unload");
            }
            var i;
            for (i in this._layers) {
              this._layers[i].remove();
            }
            for (i in this._panes) {
              remove(this._panes[i]);
            }
            this._layers = [];
            this._panes = [];
            delete this._mapPane;
            delete this._renderer;
            return this;
          },
          createPane: function(name, container) {
            var className = "leaflet-pane" + (name ? " leaflet-" + name.replace("Pane", "") + "-pane" : ""), pane = create$1("div", className, container || this._mapPane);
            if (name) {
              this._panes[name] = pane;
            }
            return pane;
          },
          getCenter: function() {
            this._checkIfLoaded();
            if (this._lastCenter && !this._moved()) {
              return this._lastCenter.clone();
            }
            return this.layerPointToLatLng(this._getCenterLayerPoint());
          },
          getZoom: function() {
            return this._zoom;
          },
          getBounds: function() {
            var bounds3 = this.getPixelBounds(), sw = this.unproject(bounds3.getBottomLeft()), ne = this.unproject(bounds3.getTopRight());
            return new LatLngBounds3(sw, ne);
          },
          getMinZoom: function() {
            return this.options.minZoom === void 0 ? this._layersMinZoom || 0 : this.options.minZoom;
          },
          getMaxZoom: function() {
            return this.options.maxZoom === void 0 ? this._layersMaxZoom === void 0 ? Infinity : this._layersMaxZoom : this.options.maxZoom;
          },
          getBoundsZoom: function(bounds3, inside, padding) {
            bounds3 = toLatLngBounds(bounds3);
            padding = toPoint(padding || [0, 0]);
            var zoom2 = this.getZoom() || 0, min = this.getMinZoom(), max = this.getMaxZoom(), nw = bounds3.getNorthWest(), se = bounds3.getSouthEast(), size = this.getSize().subtract(padding), boundsSize = toBounds(this.project(se, zoom2), this.project(nw, zoom2)).getSize(), snap = Browser5.any3d ? this.options.zoomSnap : 1, scalex = size.x / boundsSize.x, scaley = size.y / boundsSize.y, scale3 = inside ? Math.max(scalex, scaley) : Math.min(scalex, scaley);
            zoom2 = this.getScaleZoom(scale3, zoom2);
            if (snap) {
              zoom2 = Math.round(zoom2 / (snap / 100)) * (snap / 100);
              zoom2 = inside ? Math.ceil(zoom2 / snap) * snap : Math.floor(zoom2 / snap) * snap;
            }
            return Math.max(min, Math.min(max, zoom2));
          },
          getSize: function() {
            if (!this._size || this._sizeChanged) {
              this._size = new Point3(
                this._container.clientWidth || 0,
                this._container.clientHeight || 0
              );
              this._sizeChanged = false;
            }
            return this._size.clone();
          },
          getPixelBounds: function(center, zoom2) {
            var topLeftPoint = this._getTopLeftPoint(center, zoom2);
            return new Bounds2(topLeftPoint, topLeftPoint.add(this.getSize()));
          },
          getPixelOrigin: function() {
            this._checkIfLoaded();
            return this._pixelOrigin;
          },
          getPixelWorldBounds: function(zoom2) {
            return this.options.crs.getProjectedBounds(zoom2 === void 0 ? this.getZoom() : zoom2);
          },
          getPane: function(pane) {
            return typeof pane === "string" ? this._panes[pane] : pane;
          },
          getPanes: function() {
            return this._panes;
          },
          getContainer: function() {
            return this._container;
          },
          getZoomScale: function(toZoom, fromZoom) {
            var crs = this.options.crs;
            fromZoom = fromZoom === void 0 ? this._zoom : fromZoom;
            return crs.scale(toZoom) / crs.scale(fromZoom);
          },
          getScaleZoom: function(scale3, fromZoom) {
            var crs = this.options.crs;
            fromZoom = fromZoom === void 0 ? this._zoom : fromZoom;
            var zoom2 = crs.zoom(scale3 * crs.scale(fromZoom));
            return isNaN(zoom2) ? Infinity : zoom2;
          },
          project: function(latlng, zoom2) {
            zoom2 = zoom2 === void 0 ? this._zoom : zoom2;
            return this.options.crs.latLngToPoint(toLatLng(latlng), zoom2);
          },
          unproject: function(point7, zoom2) {
            zoom2 = zoom2 === void 0 ? this._zoom : zoom2;
            return this.options.crs.pointToLatLng(toPoint(point7), zoom2);
          },
          layerPointToLatLng: function(point7) {
            var projectedPoint = toPoint(point7).add(this.getPixelOrigin());
            return this.unproject(projectedPoint);
          },
          latLngToLayerPoint: function(latlng) {
            var projectedPoint = this.project(toLatLng(latlng))._round();
            return projectedPoint._subtract(this.getPixelOrigin());
          },
          wrapLatLng: function(latlng) {
            return this.options.crs.wrapLatLng(toLatLng(latlng));
          },
          wrapLatLngBounds: function(latlng) {
            return this.options.crs.wrapLatLngBounds(toLatLngBounds(latlng));
          },
          distance: function(latlng1, latlng2) {
            return this.options.crs.distance(toLatLng(latlng1), toLatLng(latlng2));
          },
          containerPointToLayerPoint: function(point7) {
            return toPoint(point7).subtract(this._getMapPanePos());
          },
          layerPointToContainerPoint: function(point7) {
            return toPoint(point7).add(this._getMapPanePos());
          },
          containerPointToLatLng: function(point7) {
            var layerPoint = this.containerPointToLayerPoint(toPoint(point7));
            return this.layerPointToLatLng(layerPoint);
          },
          latLngToContainerPoint: function(latlng) {
            return this.layerPointToContainerPoint(this.latLngToLayerPoint(toLatLng(latlng)));
          },
          mouseEventToContainerPoint: function(e) {
            return getMousePosition(e, this._container);
          },
          mouseEventToLayerPoint: function(e) {
            return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(e));
          },
          mouseEventToLatLng: function(e) {
            return this.layerPointToLatLng(this.mouseEventToLayerPoint(e));
          },
          _initContainer: function(id) {
            var container = this._container = get(id);
            if (!container) {
              throw new Error("Map container not found.");
            } else if (container._leaflet_id) {
              throw new Error("Map container is already initialized.");
            }
            on(container, "scroll", this._onScroll, this);
            this._containerId = stamp2(container);
          },
          _initLayout: function() {
            var container = this._container;
            this._fadeAnimated = this.options.fadeAnimation && Browser5.any3d;
            addClass(container, "leaflet-container" + (Browser5.touch ? " leaflet-touch" : "") + (Browser5.retina ? " leaflet-retina" : "") + (Browser5.ielt9 ? " leaflet-oldie" : "") + (Browser5.safari ? " leaflet-safari" : "") + (this._fadeAnimated ? " leaflet-fade-anim" : ""));
            var position = getStyle(container, "position");
            if (position !== "absolute" && position !== "relative" && position !== "fixed" && position !== "sticky") {
              container.style.position = "relative";
            }
            this._initPanes();
            if (this._initControlPos) {
              this._initControlPos();
            }
          },
          _initPanes: function() {
            var panes = this._panes = {};
            this._paneRenderers = {};
            this._mapPane = this.createPane("mapPane", this._container);
            setPosition(this._mapPane, new Point3(0, 0));
            this.createPane("tilePane");
            this.createPane("overlayPane");
            this.createPane("shadowPane");
            this.createPane("markerPane");
            this.createPane("tooltipPane");
            this.createPane("popupPane");
            if (!this.options.markerZoomAnimation) {
              addClass(panes.markerPane, "leaflet-zoom-hide");
              addClass(panes.shadowPane, "leaflet-zoom-hide");
            }
          },
          _resetView: function(center, zoom2, noMoveStart) {
            setPosition(this._mapPane, new Point3(0, 0));
            var loading = !this._loaded;
            this._loaded = true;
            zoom2 = this._limitZoom(zoom2);
            this.fire("viewprereset");
            var zoomChanged = this._zoom !== zoom2;
            this._moveStart(zoomChanged, noMoveStart)._move(center, zoom2)._moveEnd(zoomChanged);
            this.fire("viewreset");
            if (loading) {
              this.fire("load");
            }
          },
          _moveStart: function(zoomChanged, noMoveStart) {
            if (zoomChanged) {
              this.fire("zoomstart");
            }
            if (!noMoveStart) {
              this.fire("movestart");
            }
            return this;
          },
          _move: function(center, zoom2, data, supressEvent) {
            if (zoom2 === void 0) {
              zoom2 = this._zoom;
            }
            var zoomChanged = this._zoom !== zoom2;
            this._zoom = zoom2;
            this._lastCenter = center;
            this._pixelOrigin = this._getNewPixelOrigin(center);
            if (!supressEvent) {
              if (zoomChanged || data && data.pinch) {
                this.fire("zoom", data);
              }
              this.fire("move", data);
            } else if (data && data.pinch) {
              this.fire("zoom", data);
            }
            return this;
          },
          _moveEnd: function(zoomChanged) {
            if (zoomChanged) {
              this.fire("zoomend");
            }
            return this.fire("moveend");
          },
          _stop: function() {
            cancelAnimFrame(this._flyToFrame);
            if (this._panAnim) {
              this._panAnim.stop();
            }
            return this;
          },
          _rawPanBy: function(offset) {
            setPosition(this._mapPane, this._getMapPanePos().subtract(offset));
          },
          _getZoomSpan: function() {
            return this.getMaxZoom() - this.getMinZoom();
          },
          _panInsideMaxBounds: function() {
            if (!this._enforcingBounds) {
              this.panInsideBounds(this.options.maxBounds);
            }
          },
          _checkIfLoaded: function() {
            if (!this._loaded) {
              throw new Error("Set map center and zoom first.");
            }
          },
          _initEvents: function(remove2) {
            this._targets = {};
            this._targets[stamp2(this._container)] = this;
            var onOff = remove2 ? off : on;
            onOff(this._container, "click dblclick mousedown mouseup mouseover mouseout mousemove contextmenu keypress keydown keyup", this._handleDOMEvent, this);
            if (this.options.trackResize) {
              onOff(window, "resize", this._onResize, this);
            }
            if (Browser5.any3d && this.options.transform3DLimit) {
              (remove2 ? this.off : this.on).call(this, "moveend", this._onMoveEnd);
            }
          },
          _onResize: function() {
            cancelAnimFrame(this._resizeRequest);
            this._resizeRequest = requestAnimFrame(
              function() {
                this.invalidateSize({ debounceMoveend: true });
              },
              this
            );
          },
          _onScroll: function() {
            this._container.scrollTop = 0;
            this._container.scrollLeft = 0;
          },
          _onMoveEnd: function() {
            var pos = this._getMapPanePos();
            if (Math.max(Math.abs(pos.x), Math.abs(pos.y)) >= this.options.transform3DLimit) {
              this._resetView(this.getCenter(), this.getZoom());
            }
          },
          _findEventTargets: function(e, type) {
            var targets = [], target, isHover = type === "mouseout" || type === "mouseover", src = e.target || e.srcElement, dragging = false;
            while (src) {
              target = this._targets[stamp2(src)];
              if (target && (type === "click" || type === "preclick") && this._draggableMoved(target)) {
                dragging = true;
                break;
              }
              if (target && target.listens(type, true)) {
                if (isHover && !isExternalTarget(src, e)) {
                  break;
                }
                targets.push(target);
                if (isHover) {
                  break;
                }
              }
              if (src === this._container) {
                break;
              }
              src = src.parentNode;
            }
            if (!targets.length && !dragging && !isHover && this.listens(type, true)) {
              targets = [this];
            }
            return targets;
          },
          _isClickDisabled: function(el) {
            while (el && el !== this._container) {
              if (el["_leaflet_disable_click"]) {
                return true;
              }
              el = el.parentNode;
            }
          },
          _handleDOMEvent: function(e) {
            var el = e.target || e.srcElement;
            if (!this._loaded || el["_leaflet_disable_events"] || e.type === "click" && this._isClickDisabled(el)) {
              return;
            }
            var type = e.type;
            if (type === "mousedown") {
              preventOutline(el);
            }
            this._fireDOMEvent(e, type);
          },
          _mouseEvents: ["click", "dblclick", "mouseover", "mouseout", "contextmenu"],
          _fireDOMEvent: function(e, type, canvasTargets) {
            if (e.type === "click") {
              var synth = extend16({}, e);
              synth.type = "preclick";
              this._fireDOMEvent(synth, synth.type, canvasTargets);
            }
            var targets = this._findEventTargets(e, type);
            if (canvasTargets) {
              var filtered = [];
              for (var i = 0; i < canvasTargets.length; i++) {
                if (canvasTargets[i].listens(type, true)) {
                  filtered.push(canvasTargets[i]);
                }
              }
              targets = filtered.concat(targets);
            }
            if (!targets.length) {
              return;
            }
            if (type === "contextmenu") {
              preventDefault(e);
            }
            var target = targets[0];
            var data = {
              originalEvent: e
            };
            if (e.type !== "keypress" && e.type !== "keydown" && e.type !== "keyup") {
              var isMarker = target.getLatLng && (!target._radius || target._radius <= 10);
              data.containerPoint = isMarker ? this.latLngToContainerPoint(target.getLatLng()) : this.mouseEventToContainerPoint(e);
              data.layerPoint = this.containerPointToLayerPoint(data.containerPoint);
              data.latlng = isMarker ? target.getLatLng() : this.layerPointToLatLng(data.layerPoint);
            }
            for (i = 0; i < targets.length; i++) {
              targets[i].fire(type, data, true);
              if (data.originalEvent._stopped || targets[i].options.bubblingMouseEvents === false && indexOf(this._mouseEvents, type) !== -1) {
                return;
              }
            }
          },
          _draggableMoved: function(obj) {
            obj = obj.dragging && obj.dragging.enabled() ? obj : this;
            return obj.dragging && obj.dragging.moved() || this.boxZoom && this.boxZoom.moved();
          },
          _clearHandlers: function() {
            for (var i = 0, len = this._handlers.length; i < len; i++) {
              this._handlers[i].disable();
            }
          },
          whenReady: function(callback, context) {
            if (this._loaded) {
              callback.call(context || this, { target: this });
            } else {
              this.on("load", callback, context);
            }
            return this;
          },
          _getMapPanePos: function() {
            return getPosition(this._mapPane) || new Point3(0, 0);
          },
          _moved: function() {
            var pos = this._getMapPanePos();
            return pos && !pos.equals([0, 0]);
          },
          _getTopLeftPoint: function(center, zoom2) {
            var pixelOrigin = center && zoom2 !== void 0 ? this._getNewPixelOrigin(center, zoom2) : this.getPixelOrigin();
            return pixelOrigin.subtract(this._getMapPanePos());
          },
          _getNewPixelOrigin: function(center, zoom2) {
            var viewHalf = this.getSize()._divideBy(2);
            return this.project(center, zoom2)._subtract(viewHalf)._add(this._getMapPanePos())._round();
          },
          _latLngToNewLayerPoint: function(latlng, zoom2, center) {
            var topLeft = this._getNewPixelOrigin(center, zoom2);
            return this.project(latlng, zoom2)._subtract(topLeft);
          },
          _latLngBoundsToNewLayerBounds: function(latLngBounds2, zoom2, center) {
            var topLeft = this._getNewPixelOrigin(center, zoom2);
            return toBounds([
              this.project(latLngBounds2.getSouthWest(), zoom2)._subtract(topLeft),
              this.project(latLngBounds2.getNorthWest(), zoom2)._subtract(topLeft),
              this.project(latLngBounds2.getSouthEast(), zoom2)._subtract(topLeft),
              this.project(latLngBounds2.getNorthEast(), zoom2)._subtract(topLeft)
            ]);
          },
          _getCenterLayerPoint: function() {
            return this.containerPointToLayerPoint(this.getSize()._divideBy(2));
          },
          _getCenterOffset: function(latlng) {
            return this.latLngToLayerPoint(latlng).subtract(this._getCenterLayerPoint());
          },
          _limitCenter: function(center, zoom2, bounds3) {
            if (!bounds3) {
              return center;
            }
            var centerPoint = this.project(center, zoom2), viewHalf = this.getSize().divideBy(2), viewBounds = new Bounds2(centerPoint.subtract(viewHalf), centerPoint.add(viewHalf)), offset = this._getBoundsOffset(viewBounds, bounds3, zoom2);
            if (Math.abs(offset.x) <= 1 && Math.abs(offset.y) <= 1) {
              return center;
            }
            return this.unproject(centerPoint.add(offset), zoom2);
          },
          _limitOffset: function(offset, bounds3) {
            if (!bounds3) {
              return offset;
            }
            var viewBounds = this.getPixelBounds(), newBounds = new Bounds2(viewBounds.min.add(offset), viewBounds.max.add(offset));
            return offset.add(this._getBoundsOffset(newBounds, bounds3));
          },
          _getBoundsOffset: function(pxBounds, maxBounds, zoom2) {
            var projectedMaxBounds = toBounds(
              this.project(maxBounds.getNorthEast(), zoom2),
              this.project(maxBounds.getSouthWest(), zoom2)
            ), minOffset = projectedMaxBounds.min.subtract(pxBounds.min), maxOffset = projectedMaxBounds.max.subtract(pxBounds.max), dx = this._rebound(minOffset.x, -maxOffset.x), dy = this._rebound(minOffset.y, -maxOffset.y);
            return new Point3(dx, dy);
          },
          _rebound: function(left, right) {
            return left + right > 0 ? Math.round(left - right) / 2 : Math.max(0, Math.ceil(left)) - Math.max(0, Math.floor(right));
          },
          _limitZoom: function(zoom2) {
            var min = this.getMinZoom(), max = this.getMaxZoom(), snap = Browser5.any3d ? this.options.zoomSnap : 1;
            if (snap) {
              zoom2 = Math.round(zoom2 / snap) * snap;
            }
            return Math.max(min, Math.min(max, zoom2));
          },
          _onPanTransitionStep: function() {
            this.fire("move");
          },
          _onPanTransitionEnd: function() {
            removeClass(this._mapPane, "leaflet-pan-anim");
            this.fire("moveend");
          },
          _tryAnimatedPan: function(center, options) {
            var offset = this._getCenterOffset(center)._trunc();
            if ((options && options.animate) !== true && !this.getSize().contains(offset)) {
              return false;
            }
            this.panBy(offset, options);
            return true;
          },
          _createAnimProxy: function() {
            var proxy = this._proxy = create$1("div", "leaflet-proxy leaflet-zoom-animated");
            this._panes.mapPane.appendChild(proxy);
            this.on("zoomanim", function(e) {
              var prop = TRANSFORM, transform = this._proxy.style[prop];
              setTransform(this._proxy, this.project(e.center, e.zoom), this.getZoomScale(e.zoom, 1));
              if (transform === this._proxy.style[prop] && this._animatingZoom) {
                this._onZoomTransitionEnd();
              }
            }, this);
            this.on("load moveend", this._animMoveEnd, this);
            this._on("unload", this._destroyAnimProxy, this);
          },
          _destroyAnimProxy: function() {
            remove(this._proxy);
            this.off("load moveend", this._animMoveEnd, this);
            delete this._proxy;
          },
          _animMoveEnd: function() {
            var c = this.getCenter(), z = this.getZoom();
            setTransform(this._proxy, this.project(c, z), this.getZoomScale(z, 1));
          },
          _catchTransitionEnd: function(e) {
            if (this._animatingZoom && e.propertyName.indexOf("transform") >= 0) {
              this._onZoomTransitionEnd();
            }
          },
          _nothingToAnimate: function() {
            return !this._container.getElementsByClassName("leaflet-zoom-animated").length;
          },
          _tryAnimatedZoom: function(center, zoom2, options) {
            if (this._animatingZoom) {
              return true;
            }
            options = options || {};
            if (!this._zoomAnimated || options.animate === false || this._nothingToAnimate() || Math.abs(zoom2 - this._zoom) > this.options.zoomAnimationThreshold) {
              return false;
            }
            var scale3 = this.getZoomScale(zoom2), offset = this._getCenterOffset(center)._divideBy(1 - 1 / scale3);
            if (options.animate !== true && !this.getSize().contains(offset)) {
              return false;
            }
            requestAnimFrame(function() {
              this._moveStart(true, false)._animateZoom(center, zoom2, true);
            }, this);
            return true;
          },
          _animateZoom: function(center, zoom2, startAnim, noUpdate) {
            if (!this._mapPane) {
              return;
            }
            if (startAnim) {
              this._animatingZoom = true;
              this._animateToCenter = center;
              this._animateToZoom = zoom2;
              addClass(this._mapPane, "leaflet-zoom-anim");
            }
            this.fire("zoomanim", {
              center,
              zoom: zoom2,
              noUpdate
            });
            if (!this._tempFireZoomEvent) {
              this._tempFireZoomEvent = this._zoom !== this._animateToZoom;
            }
            this._move(this._animateToCenter, this._animateToZoom, void 0, true);
            setTimeout(bind(this._onZoomTransitionEnd, this), 250);
          },
          _onZoomTransitionEnd: function() {
            if (!this._animatingZoom) {
              return;
            }
            if (this._mapPane) {
              removeClass(this._mapPane, "leaflet-zoom-anim");
            }
            this._animatingZoom = false;
            this._move(this._animateToCenter, this._animateToZoom, void 0, true);
            if (this._tempFireZoomEvent) {
              this.fire("zoom");
            }
            delete this._tempFireZoomEvent;
            this.fire("move");
            this._moveEnd(true);
          }
        });
        function createMap(id, options) {
          return new Map4(id, options);
        }
        var Control8 = Class3.extend({
          options: {
            position: "topright"
          },
          initialize: function(options) {
            setOptions(this, options);
          },
          getPosition: function() {
            return this.options.position;
          },
          setPosition: function(position) {
            var map = this._map;
            if (map) {
              map.removeControl(this);
            }
            this.options.position = position;
            if (map) {
              map.addControl(this);
            }
            return this;
          },
          getContainer: function() {
            return this._container;
          },
          addTo: function(map) {
            this.remove();
            this._map = map;
            var container = this._container = this.onAdd(map), pos = this.getPosition(), corner = map._controlCorners[pos];
            addClass(container, "leaflet-control");
            if (pos.indexOf("bottom") !== -1) {
              corner.insertBefore(container, corner.firstChild);
            } else {
              corner.appendChild(container);
            }
            this._map.on("unload", this.remove, this);
            return this;
          },
          remove: function() {
            if (!this._map) {
              return this;
            }
            remove(this._container);
            if (this.onRemove) {
              this.onRemove(this._map);
            }
            this._map.off("unload", this.remove, this);
            this._map = null;
            return this;
          },
          _refocusOnMap: function(e) {
            if (this._map && e && e.screenX > 0 && e.screenY > 0) {
              this._map.getContainer().focus();
            }
          }
        });
        var control2 = function(options) {
          return new Control8(options);
        };
        Map4.include({
          addControl: function(control3) {
            control3.addTo(this);
            return this;
          },
          removeControl: function(control3) {
            control3.remove();
            return this;
          },
          _initControlPos: function() {
            var corners = this._controlCorners = {}, l = "leaflet-", container = this._controlContainer = create$1("div", l + "control-container", this._container);
            function createCorner(vSide, hSide) {
              var className = l + vSide + " " + l + hSide;
              corners[vSide + hSide] = create$1("div", className, container);
            }
            createCorner("top", "left");
            createCorner("top", "right");
            createCorner("bottom", "left");
            createCorner("bottom", "right");
          },
          _clearControlPos: function() {
            for (var i in this._controlCorners) {
              remove(this._controlCorners[i]);
            }
            remove(this._controlContainer);
            delete this._controlCorners;
            delete this._controlContainer;
          }
        });
        var Layers = Control8.extend({
          options: {
            collapsed: true,
            position: "topright",
            autoZIndex: true,
            hideSingleBase: false,
            sortLayers: false,
            sortFunction: function(layerA, layerB, nameA, nameB) {
              return nameA < nameB ? -1 : nameB < nameA ? 1 : 0;
            }
          },
          initialize: function(baseLayers, overlays, options) {
            setOptions(this, options);
            this._layerControlInputs = [];
            this._layers = [];
            this._lastZIndex = 0;
            this._handlingClick = false;
            for (var i in baseLayers) {
              this._addLayer(baseLayers[i], i);
            }
            for (i in overlays) {
              this._addLayer(overlays[i], i, true);
            }
          },
          onAdd: function(map) {
            this._initLayout();
            this._update();
            this._map = map;
            map.on("zoomend", this._checkDisabledLayers, this);
            for (var i = 0; i < this._layers.length; i++) {
              this._layers[i].layer.on("add remove", this._onLayerChange, this);
            }
            return this._container;
          },
          addTo: function(map) {
            Control8.prototype.addTo.call(this, map);
            return this._expandIfNotCollapsed();
          },
          onRemove: function() {
            this._map.off("zoomend", this._checkDisabledLayers, this);
            for (var i = 0; i < this._layers.length; i++) {
              this._layers[i].layer.off("add remove", this._onLayerChange, this);
            }
          },
          addBaseLayer: function(layer, name) {
            this._addLayer(layer, name);
            return this._map ? this._update() : this;
          },
          addOverlay: function(layer, name) {
            this._addLayer(layer, name, true);
            return this._map ? this._update() : this;
          },
          removeLayer: function(layer) {
            layer.off("add remove", this._onLayerChange, this);
            var obj = this._getLayer(stamp2(layer));
            if (obj) {
              this._layers.splice(this._layers.indexOf(obj), 1);
            }
            return this._map ? this._update() : this;
          },
          expand: function() {
            addClass(this._container, "leaflet-control-layers-expanded");
            this._section.style.height = null;
            var acceptableHeight = this._map.getSize().y - (this._container.offsetTop + 50);
            if (acceptableHeight < this._section.clientHeight) {
              addClass(this._section, "leaflet-control-layers-scrollbar");
              this._section.style.height = acceptableHeight + "px";
            } else {
              removeClass(this._section, "leaflet-control-layers-scrollbar");
            }
            this._checkDisabledLayers();
            return this;
          },
          collapse: function() {
            removeClass(this._container, "leaflet-control-layers-expanded");
            return this;
          },
          _initLayout: function() {
            var className = "leaflet-control-layers", container = this._container = create$1("div", className), collapsed = this.options.collapsed;
            container.setAttribute("aria-haspopup", true);
            disableClickPropagation(container);
            disableScrollPropagation(container);
            var section = this._section = create$1("section", className + "-list");
            if (collapsed) {
              this._map.on("click", this.collapse, this);
              on(container, {
                mouseenter: this._expandSafely,
                mouseleave: this.collapse
              }, this);
            }
            var link = this._layersLink = create$1("a", className + "-toggle", container);
            link.href = "#";
            link.title = "Layers";
            link.setAttribute("role", "button");
            on(link, {
              keydown: function(e) {
                if (e.keyCode === 13) {
                  this._expandSafely();
                }
              },
              click: function(e) {
                preventDefault(e);
                this._expandSafely();
              }
            }, this);
            if (!collapsed) {
              this.expand();
            }
            this._baseLayersList = create$1("div", className + "-base", section);
            this._separator = create$1("div", className + "-separator", section);
            this._overlaysList = create$1("div", className + "-overlays", section);
            container.appendChild(section);
          },
          _getLayer: function(id) {
            for (var i = 0; i < this._layers.length; i++) {
              if (this._layers[i] && stamp2(this._layers[i].layer) === id) {
                return this._layers[i];
              }
            }
          },
          _addLayer: function(layer, name, overlay) {
            if (this._map) {
              layer.on("add remove", this._onLayerChange, this);
            }
            this._layers.push({
              layer,
              name,
              overlay
            });
            if (this.options.sortLayers) {
              this._layers.sort(bind(function(a, b) {
                return this.options.sortFunction(a.layer, b.layer, a.name, b.name);
              }, this));
            }
            if (this.options.autoZIndex && layer.setZIndex) {
              this._lastZIndex++;
              layer.setZIndex(this._lastZIndex);
            }
            this._expandIfNotCollapsed();
          },
          _update: function() {
            if (!this._container) {
              return this;
            }
            empty(this._baseLayersList);
            empty(this._overlaysList);
            this._layerControlInputs = [];
            var baseLayersPresent, overlaysPresent, i, obj, baseLayersCount = 0;
            for (i = 0; i < this._layers.length; i++) {
              obj = this._layers[i];
              this._addItem(obj);
              overlaysPresent = overlaysPresent || obj.overlay;
              baseLayersPresent = baseLayersPresent || !obj.overlay;
              baseLayersCount += !obj.overlay ? 1 : 0;
            }
            if (this.options.hideSingleBase) {
              baseLayersPresent = baseLayersPresent && baseLayersCount > 1;
              this._baseLayersList.style.display = baseLayersPresent ? "" : "none";
            }
            this._separator.style.display = overlaysPresent && baseLayersPresent ? "" : "none";
            return this;
          },
          _onLayerChange: function(e) {
            if (!this._handlingClick) {
              this._update();
            }
            var obj = this._getLayer(stamp2(e.target));
            var type = obj.overlay ? e.type === "add" ? "overlayadd" : "overlayremove" : e.type === "add" ? "baselayerchange" : null;
            if (type) {
              this._map.fire(type, obj);
            }
          },
          _createRadioElement: function(name, checked) {
            var radioHtml = '<input type="radio" class="leaflet-control-layers-selector" name="' + name + '"' + (checked ? ' checked="checked"' : "") + "/>";
            var radioFragment = document.createElement("div");
            radioFragment.innerHTML = radioHtml;
            return radioFragment.firstChild;
          },
          _addItem: function(obj) {
            var label = document.createElement("label"), checked = this._map.hasLayer(obj.layer), input;
            if (obj.overlay) {
              input = document.createElement("input");
              input.type = "checkbox";
              input.className = "leaflet-control-layers-selector";
              input.defaultChecked = checked;
            } else {
              input = this._createRadioElement("leaflet-base-layers_" + stamp2(this), checked);
            }
            this._layerControlInputs.push(input);
            input.layerId = stamp2(obj.layer);
            on(input, "click", this._onInputClick, this);
            var name = document.createElement("span");
            name.innerHTML = " " + obj.name;
            var holder = document.createElement("span");
            label.appendChild(holder);
            holder.appendChild(input);
            holder.appendChild(name);
            var container = obj.overlay ? this._overlaysList : this._baseLayersList;
            container.appendChild(label);
            this._checkDisabledLayers();
            return label;
          },
          _onInputClick: function() {
            var inputs = this._layerControlInputs, input, layer;
            var addedLayers = [], removedLayers = [];
            this._handlingClick = true;
            for (var i = inputs.length - 1; i >= 0; i--) {
              input = inputs[i];
              layer = this._getLayer(input.layerId).layer;
              if (input.checked) {
                addedLayers.push(layer);
              } else if (!input.checked) {
                removedLayers.push(layer);
              }
            }
            for (i = 0; i < removedLayers.length; i++) {
              if (this._map.hasLayer(removedLayers[i])) {
                this._map.removeLayer(removedLayers[i]);
              }
            }
            for (i = 0; i < addedLayers.length; i++) {
              if (!this._map.hasLayer(addedLayers[i])) {
                this._map.addLayer(addedLayers[i]);
              }
            }
            this._handlingClick = false;
            this._refocusOnMap();
          },
          _checkDisabledLayers: function() {
            var inputs = this._layerControlInputs, input, layer, zoom2 = this._map.getZoom();
            for (var i = inputs.length - 1; i >= 0; i--) {
              input = inputs[i];
              layer = this._getLayer(input.layerId).layer;
              input.disabled = layer.options.minZoom !== void 0 && zoom2 < layer.options.minZoom || layer.options.maxZoom !== void 0 && zoom2 > layer.options.maxZoom;
            }
          },
          _expandIfNotCollapsed: function() {
            if (this._map && !this.options.collapsed) {
              this.expand();
            }
            return this;
          },
          _expandSafely: function() {
            var section = this._section;
            on(section, "click", preventDefault);
            this.expand();
            setTimeout(function() {
              off(section, "click", preventDefault);
            });
          }
        });
        var layers = function(baseLayers, overlays, options) {
          return new Layers(baseLayers, overlays, options);
        };
        var Zoom = Control8.extend({
          options: {
            position: "topleft",
            zoomInText: '<span aria-hidden="true">+</span>',
            zoomInTitle: "Zoom in",
            zoomOutText: '<span aria-hidden="true">&#x2212;</span>',
            zoomOutTitle: "Zoom out"
          },
          onAdd: function(map) {
            var zoomName = "leaflet-control-zoom", container = create$1("div", zoomName + " leaflet-bar"), options = this.options;
            this._zoomInButton = this._createButton(
              options.zoomInText,
              options.zoomInTitle,
              zoomName + "-in",
              container,
              this._zoomIn
            );
            this._zoomOutButton = this._createButton(
              options.zoomOutText,
              options.zoomOutTitle,
              zoomName + "-out",
              container,
              this._zoomOut
            );
            this._updateDisabled();
            map.on("zoomend zoomlevelschange", this._updateDisabled, this);
            return container;
          },
          onRemove: function(map) {
            map.off("zoomend zoomlevelschange", this._updateDisabled, this);
          },
          disable: function() {
            this._disabled = true;
            this._updateDisabled();
            return this;
          },
          enable: function() {
            this._disabled = false;
            this._updateDisabled();
            return this;
          },
          _zoomIn: function(e) {
            if (!this._disabled && this._map._zoom < this._map.getMaxZoom()) {
              this._map.zoomIn(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
            }
          },
          _zoomOut: function(e) {
            if (!this._disabled && this._map._zoom > this._map.getMinZoom()) {
              this._map.zoomOut(this._map.options.zoomDelta * (e.shiftKey ? 3 : 1));
            }
          },
          _createButton: function(html, title, className, container, fn) {
            var link = create$1("a", className, container);
            link.innerHTML = html;
            link.href = "#";
            link.title = title;
            link.setAttribute("role", "button");
            link.setAttribute("aria-label", title);
            disableClickPropagation(link);
            on(link, "click", stop);
            on(link, "click", fn, this);
            on(link, "click", this._refocusOnMap, this);
            return link;
          },
          _updateDisabled: function() {
            var map = this._map, className = "leaflet-disabled";
            removeClass(this._zoomInButton, className);
            removeClass(this._zoomOutButton, className);
            this._zoomInButton.setAttribute("aria-disabled", "false");
            this._zoomOutButton.setAttribute("aria-disabled", "false");
            if (this._disabled || map._zoom === map.getMinZoom()) {
              addClass(this._zoomOutButton, className);
              this._zoomOutButton.setAttribute("aria-disabled", "true");
            }
            if (this._disabled || map._zoom === map.getMaxZoom()) {
              addClass(this._zoomInButton, className);
              this._zoomInButton.setAttribute("aria-disabled", "true");
            }
          }
        });
        Map4.mergeOptions({
          zoomControl: true
        });
        Map4.addInitHook(function() {
          if (this.options.zoomControl) {
            this.zoomControl = new Zoom();
            this.addControl(this.zoomControl);
          }
        });
        var zoom = function(options) {
          return new Zoom(options);
        };
        var Scale2 = Control8.extend({
          options: {
            position: "bottomleft",
            maxWidth: 100,
            metric: true,
            imperial: true
          },
          onAdd: function(map) {
            var className = "leaflet-control-scale", container = create$1("div", className), options = this.options;
            this._addScales(options, className + "-line", container);
            map.on(options.updateWhenIdle ? "moveend" : "move", this._update, this);
            map.whenReady(this._update, this);
            return container;
          },
          onRemove: function(map) {
            map.off(this.options.updateWhenIdle ? "moveend" : "move", this._update, this);
          },
          _addScales: function(options, className, container) {
            if (options.metric) {
              this._mScale = create$1("div", className, container);
            }
            if (options.imperial) {
              this._iScale = create$1("div", className, container);
            }
          },
          _update: function() {
            var map = this._map, y = map.getSize().y / 2;
            var maxMeters = map.distance(
              map.containerPointToLatLng([0, y]),
              map.containerPointToLatLng([this.options.maxWidth, y])
            );
            this._updateScales(maxMeters);
          },
          _updateScales: function(maxMeters) {
            if (this.options.metric && maxMeters) {
              this._updateMetric(maxMeters);
            }
            if (this.options.imperial && maxMeters) {
              this._updateImperial(maxMeters);
            }
          },
          _updateMetric: function(maxMeters) {
            var meters = this._getRoundNum(maxMeters), label = meters < 1e3 ? meters + " m" : meters / 1e3 + " km";
            this._updateScale(this._mScale, label, meters / maxMeters);
          },
          _updateImperial: function(maxMeters) {
            var maxFeet = maxMeters * 3.2808399, maxMiles, miles, feet;
            if (maxFeet > 5280) {
              maxMiles = maxFeet / 5280;
              miles = this._getRoundNum(maxMiles);
              this._updateScale(this._iScale, miles + " mi", miles / maxMiles);
            } else {
              feet = this._getRoundNum(maxFeet);
              this._updateScale(this._iScale, feet + " ft", feet / maxFeet);
            }
          },
          _updateScale: function(scale3, text, ratio) {
            scale3.style.width = Math.round(this.options.maxWidth * ratio) + "px";
            scale3.innerHTML = text;
          },
          _getRoundNum: function(num) {
            var pow10 = Math.pow(10, (Math.floor(num) + "").length - 1), d = num / pow10;
            d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;
            return pow10 * d;
          }
        });
        var scale2 = function(options) {
          return new Scale2(options);
        };
        var ukrainianFlag = '<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8" class="leaflet-attribution-flag"><path fill="#4C7BE1" d="M0 0h12v4H0z"/><path fill="#FFD500" d="M0 4h12v3H0z"/><path fill="#E0BC00" d="M0 7h12v1H0z"/></svg>';
        var Attribution = Control8.extend({
          options: {
            position: "bottomright",
            prefix: '<a href="https://leafletjs.com" title="A JavaScript library for interactive maps">' + (Browser5.inlineSvg ? ukrainianFlag + " " : "") + "Leaflet</a>"
          },
          initialize: function(options) {
            setOptions(this, options);
            this._attributions = {};
          },
          onAdd: function(map) {
            map.attributionControl = this;
            this._container = create$1("div", "leaflet-control-attribution");
            disableClickPropagation(this._container);
            for (var i in map._layers) {
              if (map._layers[i].getAttribution) {
                this.addAttribution(map._layers[i].getAttribution());
              }
            }
            this._update();
            map.on("layeradd", this._addAttribution, this);
            return this._container;
          },
          onRemove: function(map) {
            map.off("layeradd", this._addAttribution, this);
          },
          _addAttribution: function(ev) {
            if (ev.layer.getAttribution) {
              this.addAttribution(ev.layer.getAttribution());
              ev.layer.once("remove", function() {
                this.removeAttribution(ev.layer.getAttribution());
              }, this);
            }
          },
          setPrefix: function(prefix) {
            this.options.prefix = prefix;
            this._update();
            return this;
          },
          addAttribution: function(text) {
            if (!text) {
              return this;
            }
            if (!this._attributions[text]) {
              this._attributions[text] = 0;
            }
            this._attributions[text]++;
            this._update();
            return this;
          },
          removeAttribution: function(text) {
            if (!text) {
              return this;
            }
            if (this._attributions[text]) {
              this._attributions[text]--;
              this._update();
            }
            return this;
          },
          _update: function() {
            if (!this._map) {
              return;
            }
            var attribs = [];
            for (var i in this._attributions) {
              if (this._attributions[i]) {
                attribs.push(i);
              }
            }
            var prefixAndAttribs = [];
            if (this.options.prefix) {
              prefixAndAttribs.push(this.options.prefix);
            }
            if (attribs.length) {
              prefixAndAttribs.push(attribs.join(", "));
            }
            this._container.innerHTML = prefixAndAttribs.join(' <span aria-hidden="true">|</span> ');
          }
        });
        Map4.mergeOptions({
          attributionControl: true
        });
        Map4.addInitHook(function() {
          if (this.options.attributionControl) {
            new Attribution().addTo(this);
          }
        });
        var attribution = function(options) {
          return new Attribution(options);
        };
        Control8.Layers = Layers;
        Control8.Zoom = Zoom;
        Control8.Scale = Scale2;
        Control8.Attribution = Attribution;
        control2.layers = layers;
        control2.zoom = zoom;
        control2.scale = scale2;
        control2.attribution = attribution;
        var Handler = Class3.extend({
          initialize: function(map) {
            this._map = map;
          },
          enable: function() {
            if (this._enabled) {
              return this;
            }
            this._enabled = true;
            this.addHooks();
            return this;
          },
          disable: function() {
            if (!this._enabled) {
              return this;
            }
            this._enabled = false;
            this.removeHooks();
            return this;
          },
          enabled: function() {
            return !!this._enabled;
          }
        });
        Handler.addTo = function(map, name) {
          map.addHandler(name, this);
          return this;
        };
        var Mixin = { Events };
        var START = Browser5.touch ? "touchstart mousedown" : "mousedown";
        var Draggable = Evented3.extend({
          options: {
            clickTolerance: 3
          },
          initialize: function(element, dragStartTarget, preventOutline2, options) {
            setOptions(this, options);
            this._element = element;
            this._dragStartTarget = dragStartTarget || element;
            this._preventOutline = preventOutline2;
          },
          enable: function() {
            if (this._enabled) {
              return;
            }
            on(this._dragStartTarget, START, this._onDown, this);
            this._enabled = true;
          },
          disable: function() {
            if (!this._enabled) {
              return;
            }
            if (Draggable._dragging === this) {
              this.finishDrag(true);
            }
            off(this._dragStartTarget, START, this._onDown, this);
            this._enabled = false;
            this._moved = false;
          },
          _onDown: function(e) {
            if (!this._enabled) {
              return;
            }
            this._moved = false;
            if (hasClass(this._element, "leaflet-zoom-anim")) {
              return;
            }
            if (e.touches && e.touches.length !== 1) {
              if (Draggable._dragging === this) {
                this.finishDrag();
              }
              return;
            }
            if (Draggable._dragging || e.shiftKey || e.which !== 1 && e.button !== 1 && !e.touches) {
              return;
            }
            Draggable._dragging = this;
            if (this._preventOutline) {
              preventOutline(this._element);
            }
            disableImageDrag();
            disableTextSelection();
            if (this._moving) {
              return;
            }
            this.fire("down");
            var first = e.touches ? e.touches[0] : e, sizedParent = getSizedParentNode(this._element);
            this._startPoint = new Point3(first.clientX, first.clientY);
            this._startPos = getPosition(this._element);
            this._parentScale = getScale(sizedParent);
            var mouseevent = e.type === "mousedown";
            on(document, mouseevent ? "mousemove" : "touchmove", this._onMove, this);
            on(document, mouseevent ? "mouseup" : "touchend touchcancel", this._onUp, this);
          },
          _onMove: function(e) {
            if (!this._enabled) {
              return;
            }
            if (e.touches && e.touches.length > 1) {
              this._moved = true;
              return;
            }
            var first = e.touches && e.touches.length === 1 ? e.touches[0] : e, offset = new Point3(first.clientX, first.clientY)._subtract(this._startPoint);
            if (!offset.x && !offset.y) {
              return;
            }
            if (Math.abs(offset.x) + Math.abs(offset.y) < this.options.clickTolerance) {
              return;
            }
            offset.x /= this._parentScale.x;
            offset.y /= this._parentScale.y;
            preventDefault(e);
            if (!this._moved) {
              this.fire("dragstart");
              this._moved = true;
              addClass(document.body, "leaflet-dragging");
              this._lastTarget = e.target || e.srcElement;
              if (window.SVGElementInstance && this._lastTarget instanceof window.SVGElementInstance) {
                this._lastTarget = this._lastTarget.correspondingUseElement;
              }
              addClass(this._lastTarget, "leaflet-drag-target");
            }
            this._newPos = this._startPos.add(offset);
            this._moving = true;
            this._lastEvent = e;
            this._updatePosition();
          },
          _updatePosition: function() {
            var e = { originalEvent: this._lastEvent };
            this.fire("predrag", e);
            setPosition(this._element, this._newPos);
            this.fire("drag", e);
          },
          _onUp: function() {
            if (!this._enabled) {
              return;
            }
            this.finishDrag();
          },
          finishDrag: function(noInertia) {
            removeClass(document.body, "leaflet-dragging");
            if (this._lastTarget) {
              removeClass(this._lastTarget, "leaflet-drag-target");
              this._lastTarget = null;
            }
            off(document, "mousemove touchmove", this._onMove, this);
            off(document, "mouseup touchend touchcancel", this._onUp, this);
            enableImageDrag();
            enableTextSelection();
            if (this._moved && this._moving) {
              this.fire("dragend", {
                noInertia,
                distance: this._newPos.distanceTo(this._startPos)
              });
            }
            this._moving = false;
            Draggable._dragging = false;
          }
        });
        function simplify(points, tolerance) {
          if (!tolerance || !points.length) {
            return points.slice();
          }
          var sqTolerance = tolerance * tolerance;
          points = _reducePoints(points, sqTolerance);
          points = _simplifyDP(points, sqTolerance);
          return points;
        }
        function pointToSegmentDistance(p, p1, p2) {
          return Math.sqrt(_sqClosestPointOnSegment(p, p1, p2, true));
        }
        function closestPointOnSegment(p, p1, p2) {
          return _sqClosestPointOnSegment(p, p1, p2);
        }
        function _simplifyDP(points, sqTolerance) {
          var len = points.length, ArrayConstructor = typeof Uint8Array !== void 0 + "" ? Uint8Array : Array, markers = new ArrayConstructor(len);
          markers[0] = markers[len - 1] = 1;
          _simplifyDPStep(points, markers, sqTolerance, 0, len - 1);
          var i, newPoints = [];
          for (i = 0; i < len; i++) {
            if (markers[i]) {
              newPoints.push(points[i]);
            }
          }
          return newPoints;
        }
        function _simplifyDPStep(points, markers, sqTolerance, first, last) {
          var maxSqDist = 0, index2, i, sqDist;
          for (i = first + 1; i <= last - 1; i++) {
            sqDist = _sqClosestPointOnSegment(points[i], points[first], points[last], true);
            if (sqDist > maxSqDist) {
              index2 = i;
              maxSqDist = sqDist;
            }
          }
          if (maxSqDist > sqTolerance) {
            markers[index2] = 1;
            _simplifyDPStep(points, markers, sqTolerance, first, index2);
            _simplifyDPStep(points, markers, sqTolerance, index2, last);
          }
        }
        function _reducePoints(points, sqTolerance) {
          var reducedPoints = [points[0]];
          for (var i = 1, prev = 0, len = points.length; i < len; i++) {
            if (_sqDist(points[i], points[prev]) > sqTolerance) {
              reducedPoints.push(points[i]);
              prev = i;
            }
          }
          if (prev < len - 1) {
            reducedPoints.push(points[len - 1]);
          }
          return reducedPoints;
        }
        var _lastCode;
        function clipSegment(a, b, bounds3, useLastCode, round) {
          var codeA = useLastCode ? _lastCode : _getBitCode(a, bounds3), codeB = _getBitCode(b, bounds3), codeOut, p, newCode;
          _lastCode = codeB;
          while (true) {
            if (!(codeA | codeB)) {
              return [a, b];
            }
            if (codeA & codeB) {
              return false;
            }
            codeOut = codeA || codeB;
            p = _getEdgeIntersection(a, b, codeOut, bounds3, round);
            newCode = _getBitCode(p, bounds3);
            if (codeOut === codeA) {
              a = p;
              codeA = newCode;
            } else {
              b = p;
              codeB = newCode;
            }
          }
        }
        function _getEdgeIntersection(a, b, code, bounds3, round) {
          var dx = b.x - a.x, dy = b.y - a.y, min = bounds3.min, max = bounds3.max, x, y;
          if (code & 8) {
            x = a.x + dx * (max.y - a.y) / dy;
            y = max.y;
          } else if (code & 4) {
            x = a.x + dx * (min.y - a.y) / dy;
            y = min.y;
          } else if (code & 2) {
            x = max.x;
            y = a.y + dy * (max.x - a.x) / dx;
          } else if (code & 1) {
            x = min.x;
            y = a.y + dy * (min.x - a.x) / dx;
          }
          return new Point3(x, y, round);
        }
        function _getBitCode(p, bounds3) {
          var code = 0;
          if (p.x < bounds3.min.x) {
            code |= 1;
          } else if (p.x > bounds3.max.x) {
            code |= 2;
          }
          if (p.y < bounds3.min.y) {
            code |= 4;
          } else if (p.y > bounds3.max.y) {
            code |= 8;
          }
          return code;
        }
        function _sqDist(p1, p2) {
          var dx = p2.x - p1.x, dy = p2.y - p1.y;
          return dx * dx + dy * dy;
        }
        function _sqClosestPointOnSegment(p, p1, p2, sqDist) {
          var x = p1.x, y = p1.y, dx = p2.x - x, dy = p2.y - y, dot = dx * dx + dy * dy, t;
          if (dot > 0) {
            t = ((p.x - x) * dx + (p.y - y) * dy) / dot;
            if (t > 1) {
              x = p2.x;
              y = p2.y;
            } else if (t > 0) {
              x += dx * t;
              y += dy * t;
            }
          }
          dx = p.x - x;
          dy = p.y - y;
          return sqDist ? dx * dx + dy * dy : new Point3(x, y);
        }
        function isFlat(latlngs) {
          return !isArray(latlngs[0]) || typeof latlngs[0][0] !== "object" && typeof latlngs[0][0] !== "undefined";
        }
        function _flat(latlngs) {
          console.warn("Deprecated use of _flat, please use L.LineUtil.isFlat instead.");
          return isFlat(latlngs);
        }
        function polylineCenter(latlngs, crs) {
          var i, halfDist, segDist, dist, p1, p2, ratio, center;
          if (!latlngs || latlngs.length === 0) {
            throw new Error("latlngs not passed");
          }
          if (!isFlat(latlngs)) {
            console.warn("latlngs are not flat! Only the first ring will be used");
            latlngs = latlngs[0];
          }
          var points = [];
          for (var j in latlngs) {
            points.push(crs.project(toLatLng(latlngs[j])));
          }
          var len = points.length;
          for (i = 0, halfDist = 0; i < len - 1; i++) {
            halfDist += points[i].distanceTo(points[i + 1]) / 2;
          }
          if (halfDist === 0) {
            center = points[0];
          } else {
            for (i = 0, dist = 0; i < len - 1; i++) {
              p1 = points[i];
              p2 = points[i + 1];
              segDist = p1.distanceTo(p2);
              dist += segDist;
              if (dist > halfDist) {
                ratio = (dist - halfDist) / segDist;
                center = [
                  p2.x - ratio * (p2.x - p1.x),
                  p2.y - ratio * (p2.y - p1.y)
                ];
                break;
              }
            }
          }
          return crs.unproject(toPoint(center));
        }
        var LineUtil = {
          __proto__: null,
          simplify,
          pointToSegmentDistance,
          closestPointOnSegment,
          clipSegment,
          _getEdgeIntersection,
          _getBitCode,
          _sqClosestPointOnSegment,
          isFlat,
          _flat,
          polylineCenter
        };
        function clipPolygon(points, bounds3, round) {
          var clippedPoints, edges = [1, 4, 2, 8], i, j, k, a, b, len, edge2, p;
          for (i = 0, len = points.length; i < len; i++) {
            points[i]._code = _getBitCode(points[i], bounds3);
          }
          for (k = 0; k < 4; k++) {
            edge2 = edges[k];
            clippedPoints = [];
            for (i = 0, len = points.length, j = len - 1; i < len; j = i++) {
              a = points[i];
              b = points[j];
              if (!(a._code & edge2)) {
                if (b._code & edge2) {
                  p = _getEdgeIntersection(b, a, edge2, bounds3, round);
                  p._code = _getBitCode(p, bounds3);
                  clippedPoints.push(p);
                }
                clippedPoints.push(a);
              } else if (!(b._code & edge2)) {
                p = _getEdgeIntersection(b, a, edge2, bounds3, round);
                p._code = _getBitCode(p, bounds3);
                clippedPoints.push(p);
              }
            }
            points = clippedPoints;
          }
          return points;
        }
        function polygonCenter(latlngs, crs) {
          var i, j, p1, p2, f, area, x, y, center;
          if (!latlngs || latlngs.length === 0) {
            throw new Error("latlngs not passed");
          }
          if (!isFlat(latlngs)) {
            console.warn("latlngs are not flat! Only the first ring will be used");
            latlngs = latlngs[0];
          }
          var points = [];
          for (var k in latlngs) {
            points.push(crs.project(toLatLng(latlngs[k])));
          }
          var len = points.length;
          area = x = y = 0;
          for (i = 0, j = len - 1; i < len; j = i++) {
            p1 = points[i];
            p2 = points[j];
            f = p1.y * p2.x - p2.y * p1.x;
            x += (p1.x + p2.x) * f;
            y += (p1.y + p2.y) * f;
            area += f * 3;
          }
          if (area === 0) {
            center = points[0];
          } else {
            center = [x / area, y / area];
          }
          return crs.unproject(toPoint(center));
        }
        var PolyUtil = {
          __proto__: null,
          clipPolygon,
          polygonCenter
        };
        var LonLat = {
          project: function(latlng) {
            return new Point3(latlng.lng, latlng.lat);
          },
          unproject: function(point7) {
            return new LatLng3(point7.y, point7.x);
          },
          bounds: new Bounds2([-180, -90], [180, 90])
        };
        var Mercator = {
          R: 6378137,
          R_MINOR: 6356752314245179e-9,
          bounds: new Bounds2([-2003750834279e-5, -1549657073972e-5], [2003750834279e-5, 1876465623138e-5]),
          project: function(latlng) {
            var d = Math.PI / 180, r = this.R, y = latlng.lat * d, tmp = this.R_MINOR / r, e = Math.sqrt(1 - tmp * tmp), con = e * Math.sin(y);
            var ts = Math.tan(Math.PI / 4 - y / 2) / Math.pow((1 - con) / (1 + con), e / 2);
            y = -r * Math.log(Math.max(ts, 1e-10));
            return new Point3(latlng.lng * d * r, y);
          },
          unproject: function(point7) {
            var d = 180 / Math.PI, r = this.R, tmp = this.R_MINOR / r, e = Math.sqrt(1 - tmp * tmp), ts = Math.exp(-point7.y / r), phi = Math.PI / 2 - 2 * Math.atan(ts);
            for (var i = 0, dphi = 0.1, con; i < 15 && Math.abs(dphi) > 1e-7; i++) {
              con = e * Math.sin(phi);
              con = Math.pow((1 - con) / (1 + con), e / 2);
              dphi = Math.PI / 2 - 2 * Math.atan(ts * con) - phi;
              phi += dphi;
            }
            return new LatLng3(phi * d, point7.x * d / r);
          }
        };
        var index = {
          __proto__: null,
          LonLat,
          Mercator,
          SphericalMercator
        };
        var EPSG3395 = extend16({}, Earth, {
          code: "EPSG:3395",
          projection: Mercator,
          transformation: function() {
            var scale3 = 0.5 / (Math.PI * Mercator.R);
            return toTransformation(scale3, 0.5, -scale3, 0.5);
          }()
        });
        var EPSG4326 = extend16({}, Earth, {
          code: "EPSG:4326",
          projection: LonLat,
          transformation: toTransformation(1 / 180, 1, -1 / 180, 0.5)
        });
        var Simple = extend16({}, CRS2, {
          projection: LonLat,
          transformation: toTransformation(1, 0, -1, 0),
          scale: function(zoom2) {
            return Math.pow(2, zoom2);
          },
          zoom: function(scale3) {
            return Math.log(scale3) / Math.LN2;
          },
          distance: function(latlng1, latlng2) {
            var dx = latlng2.lng - latlng1.lng, dy = latlng2.lat - latlng1.lat;
            return Math.sqrt(dx * dx + dy * dy);
          },
          infinite: true
        });
        CRS2.Earth = Earth;
        CRS2.EPSG3395 = EPSG3395;
        CRS2.EPSG3857 = EPSG3857;
        CRS2.EPSG900913 = EPSG900913;
        CRS2.EPSG4326 = EPSG4326;
        CRS2.Simple = Simple;
        var Layer = Evented3.extend({
          options: {
            pane: "overlayPane",
            attribution: null,
            bubblingMouseEvents: true
          },
          addTo: function(map) {
            map.addLayer(this);
            return this;
          },
          remove: function() {
            return this.removeFrom(this._map || this._mapToAdd);
          },
          removeFrom: function(obj) {
            if (obj) {
              obj.removeLayer(this);
            }
            return this;
          },
          getPane: function(name) {
            return this._map.getPane(name ? this.options[name] || name : this.options.pane);
          },
          addInteractiveTarget: function(targetEl) {
            this._map._targets[stamp2(targetEl)] = this;
            return this;
          },
          removeInteractiveTarget: function(targetEl) {
            delete this._map._targets[stamp2(targetEl)];
            return this;
          },
          getAttribution: function() {
            return this.options.attribution;
          },
          _layerAdd: function(e) {
            var map = e.target;
            if (!map.hasLayer(this)) {
              return;
            }
            this._map = map;
            this._zoomAnimated = map._zoomAnimated;
            if (this.getEvents) {
              var events = this.getEvents();
              map.on(events, this);
              this.once("remove", function() {
                map.off(events, this);
              }, this);
            }
            this.onAdd(map);
            this.fire("add");
            map.fire("layeradd", { layer: this });
          }
        });
        Map4.include({
          addLayer: function(layer) {
            if (!layer._layerAdd) {
              throw new Error("The provided object is not a Layer.");
            }
            var id = stamp2(layer);
            if (this._layers[id]) {
              return this;
            }
            this._layers[id] = layer;
            layer._mapToAdd = this;
            if (layer.beforeAdd) {
              layer.beforeAdd(this);
            }
            this.whenReady(layer._layerAdd, layer);
            return this;
          },
          removeLayer: function(layer) {
            var id = stamp2(layer);
            if (!this._layers[id]) {
              return this;
            }
            if (this._loaded) {
              layer.onRemove(this);
            }
            delete this._layers[id];
            if (this._loaded) {
              this.fire("layerremove", { layer });
              layer.fire("remove");
            }
            layer._map = layer._mapToAdd = null;
            return this;
          },
          hasLayer: function(layer) {
            return stamp2(layer) in this._layers;
          },
          eachLayer: function(method, context) {
            for (var i in this._layers) {
              method.call(context, this._layers[i]);
            }
            return this;
          },
          _addLayers: function(layers2) {
            layers2 = layers2 ? isArray(layers2) ? layers2 : [layers2] : [];
            for (var i = 0, len = layers2.length; i < len; i++) {
              this.addLayer(layers2[i]);
            }
          },
          _addZoomLimit: function(layer) {
            if (!isNaN(layer.options.maxZoom) || !isNaN(layer.options.minZoom)) {
              this._zoomBoundLayers[stamp2(layer)] = layer;
              this._updateZoomLevels();
            }
          },
          _removeZoomLimit: function(layer) {
            var id = stamp2(layer);
            if (this._zoomBoundLayers[id]) {
              delete this._zoomBoundLayers[id];
              this._updateZoomLevels();
            }
          },
          _updateZoomLevels: function() {
            var minZoom = Infinity, maxZoom = -Infinity, oldZoomSpan = this._getZoomSpan();
            for (var i in this._zoomBoundLayers) {
              var options = this._zoomBoundLayers[i].options;
              minZoom = options.minZoom === void 0 ? minZoom : Math.min(minZoom, options.minZoom);
              maxZoom = options.maxZoom === void 0 ? maxZoom : Math.max(maxZoom, options.maxZoom);
            }
            this._layersMaxZoom = maxZoom === -Infinity ? void 0 : maxZoom;
            this._layersMinZoom = minZoom === Infinity ? void 0 : minZoom;
            if (oldZoomSpan !== this._getZoomSpan()) {
              this.fire("zoomlevelschange");
            }
            if (this.options.maxZoom === void 0 && this._layersMaxZoom && this.getZoom() > this._layersMaxZoom) {
              this.setZoom(this._layersMaxZoom);
            }
            if (this.options.minZoom === void 0 && this._layersMinZoom && this.getZoom() < this._layersMinZoom) {
              this.setZoom(this._layersMinZoom);
            }
          }
        });
        var LayerGroup4 = Layer.extend({
          initialize: function(layers2, options) {
            setOptions(this, options);
            this._layers = {};
            var i, len;
            if (layers2) {
              for (i = 0, len = layers2.length; i < len; i++) {
                this.addLayer(layers2[i]);
              }
            }
          },
          addLayer: function(layer) {
            var id = this.getLayerId(layer);
            this._layers[id] = layer;
            if (this._map) {
              this._map.addLayer(layer);
            }
            return this;
          },
          removeLayer: function(layer) {
            var id = layer in this._layers ? layer : this.getLayerId(layer);
            if (this._map && this._layers[id]) {
              this._map.removeLayer(this._layers[id]);
            }
            delete this._layers[id];
            return this;
          },
          hasLayer: function(layer) {
            var layerId = typeof layer === "number" ? layer : this.getLayerId(layer);
            return layerId in this._layers;
          },
          clearLayers: function() {
            return this.eachLayer(this.removeLayer, this);
          },
          invoke: function(methodName) {
            var args = Array.prototype.slice.call(arguments, 1), i, layer;
            for (i in this._layers) {
              layer = this._layers[i];
              if (layer[methodName]) {
                layer[methodName].apply(layer, args);
              }
            }
            return this;
          },
          onAdd: function(map) {
            this.eachLayer(map.addLayer, map);
          },
          onRemove: function(map) {
            this.eachLayer(map.removeLayer, map);
          },
          eachLayer: function(method, context) {
            for (var i in this._layers) {
              method.call(context, this._layers[i]);
            }
            return this;
          },
          getLayer: function(id) {
            return this._layers[id];
          },
          getLayers: function() {
            var layers2 = [];
            this.eachLayer(layers2.push, layers2);
            return layers2;
          },
          setZIndex: function(zIndex) {
            return this.invoke("setZIndex", zIndex);
          },
          getLayerId: function(layer) {
            return stamp2(layer);
          }
        });
        var layerGroup = function(layers2, options) {
          return new LayerGroup4(layers2, options);
        };
        var FeatureGroup = LayerGroup4.extend({
          addLayer: function(layer) {
            if (this.hasLayer(layer)) {
              return this;
            }
            layer.addEventParent(this);
            LayerGroup4.prototype.addLayer.call(this, layer);
            return this.fire("layeradd", { layer });
          },
          removeLayer: function(layer) {
            if (!this.hasLayer(layer)) {
              return this;
            }
            if (layer in this._layers) {
              layer = this._layers[layer];
            }
            layer.removeEventParent(this);
            LayerGroup4.prototype.removeLayer.call(this, layer);
            return this.fire("layerremove", { layer });
          },
          setStyle: function(style2) {
            return this.invoke("setStyle", style2);
          },
          bringToFront: function() {
            return this.invoke("bringToFront");
          },
          bringToBack: function() {
            return this.invoke("bringToBack");
          },
          getBounds: function() {
            var bounds3 = new LatLngBounds3();
            for (var id in this._layers) {
              var layer = this._layers[id];
              bounds3.extend(layer.getBounds ? layer.getBounds() : layer.getLatLng());
            }
            return bounds3;
          }
        });
        var featureGroup = function(layers2, options) {
          return new FeatureGroup(layers2, options);
        };
        var Icon = Class3.extend({
          options: {
            popupAnchor: [0, 0],
            tooltipAnchor: [0, 0],
            crossOrigin: false
          },
          initialize: function(options) {
            setOptions(this, options);
          },
          createIcon: function(oldIcon) {
            return this._createIcon("icon", oldIcon);
          },
          createShadow: function(oldIcon) {
            return this._createIcon("shadow", oldIcon);
          },
          _createIcon: function(name, oldIcon) {
            var src = this._getIconUrl(name);
            if (!src) {
              if (name === "icon") {
                throw new Error("iconUrl not set in Icon options (see the docs).");
              }
              return null;
            }
            var img = this._createImg(src, oldIcon && oldIcon.tagName === "IMG" ? oldIcon : null);
            this._setIconStyles(img, name);
            if (this.options.crossOrigin || this.options.crossOrigin === "") {
              img.crossOrigin = this.options.crossOrigin === true ? "" : this.options.crossOrigin;
            }
            return img;
          },
          _setIconStyles: function(img, name) {
            var options = this.options;
            var sizeOption = options[name + "Size"];
            if (typeof sizeOption === "number") {
              sizeOption = [sizeOption, sizeOption];
            }
            var size = toPoint(sizeOption), anchor = toPoint(name === "shadow" && options.shadowAnchor || options.iconAnchor || size && size.divideBy(2, true));
            img.className = "leaflet-marker-" + name + " " + (options.className || "");
            if (anchor) {
              img.style.marginLeft = -anchor.x + "px";
              img.style.marginTop = -anchor.y + "px";
            }
            if (size) {
              img.style.width = size.x + "px";
              img.style.height = size.y + "px";
            }
          },
          _createImg: function(src, el) {
            el = el || document.createElement("img");
            el.src = src;
            return el;
          },
          _getIconUrl: function(name) {
            return Browser5.retina && this.options[name + "RetinaUrl"] || this.options[name + "Url"];
          }
        });
        function icon(options) {
          return new Icon(options);
        }
        var IconDefault = Icon.extend({
          options: {
            iconUrl: "marker-icon.png",
            iconRetinaUrl: "marker-icon-2x.png",
            shadowUrl: "marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            tooltipAnchor: [16, -28],
            shadowSize: [41, 41]
          },
          _getIconUrl: function(name) {
            if (typeof IconDefault.imagePath !== "string") {
              IconDefault.imagePath = this._detectIconPath();
            }
            return (this.options.imagePath || IconDefault.imagePath) + Icon.prototype._getIconUrl.call(this, name);
          },
          _stripUrl: function(path) {
            var strip = function(str, re, idx) {
              var match = re.exec(str);
              return match && match[idx];
            };
            path = strip(path, /^url\((['"])?(.+)\1\)$/, 2);
            return path && strip(path, /^(.*)marker-icon\.png$/, 1);
          },
          _detectIconPath: function() {
            var el = create$1("div", "leaflet-default-icon-path", document.body);
            var path = getStyle(el, "background-image") || getStyle(el, "backgroundImage");
            document.body.removeChild(el);
            path = this._stripUrl(path);
            if (path) {
              return path;
            }
            var link = document.querySelector('link[href$="leaflet.css"]');
            if (!link) {
              return "";
            }
            return link.href.substring(0, link.href.length - "leaflet.css".length - 1);
          }
        });
        var MarkerDrag = Handler.extend({
          initialize: function(marker3) {
            this._marker = marker3;
          },
          addHooks: function() {
            var icon2 = this._marker._icon;
            if (!this._draggable) {
              this._draggable = new Draggable(icon2, icon2, true);
            }
            this._draggable.on({
              dragstart: this._onDragStart,
              predrag: this._onPreDrag,
              drag: this._onDrag,
              dragend: this._onDragEnd
            }, this).enable();
            addClass(icon2, "leaflet-marker-draggable");
          },
          removeHooks: function() {
            this._draggable.off({
              dragstart: this._onDragStart,
              predrag: this._onPreDrag,
              drag: this._onDrag,
              dragend: this._onDragEnd
            }, this).disable();
            if (this._marker._icon) {
              removeClass(this._marker._icon, "leaflet-marker-draggable");
            }
          },
          moved: function() {
            return this._draggable && this._draggable._moved;
          },
          _adjustPan: function(e) {
            var marker3 = this._marker, map = marker3._map, speed = this._marker.options.autoPanSpeed, padding = this._marker.options.autoPanPadding, iconPos = getPosition(marker3._icon), bounds3 = map.getPixelBounds(), origin = map.getPixelOrigin();
            var panBounds = toBounds(
              bounds3.min._subtract(origin).add(padding),
              bounds3.max._subtract(origin).subtract(padding)
            );
            if (!panBounds.contains(iconPos)) {
              var movement = toPoint(
                (Math.max(panBounds.max.x, iconPos.x) - panBounds.max.x) / (bounds3.max.x - panBounds.max.x) - (Math.min(panBounds.min.x, iconPos.x) - panBounds.min.x) / (bounds3.min.x - panBounds.min.x),
                (Math.max(panBounds.max.y, iconPos.y) - panBounds.max.y) / (bounds3.max.y - panBounds.max.y) - (Math.min(panBounds.min.y, iconPos.y) - panBounds.min.y) / (bounds3.min.y - panBounds.min.y)
              ).multiplyBy(speed);
              map.panBy(movement, { animate: false });
              this._draggable._newPos._add(movement);
              this._draggable._startPos._add(movement);
              setPosition(marker3._icon, this._draggable._newPos);
              this._onDrag(e);
              this._panRequest = requestAnimFrame(this._adjustPan.bind(this, e));
            }
          },
          _onDragStart: function() {
            this._oldLatLng = this._marker.getLatLng();
            this._marker.closePopup && this._marker.closePopup();
            this._marker.fire("movestart").fire("dragstart");
          },
          _onPreDrag: function(e) {
            if (this._marker.options.autoPan) {
              cancelAnimFrame(this._panRequest);
              this._panRequest = requestAnimFrame(this._adjustPan.bind(this, e));
            }
          },
          _onDrag: function(e) {
            var marker3 = this._marker, shadow = marker3._shadow, iconPos = getPosition(marker3._icon), latlng = marker3._map.layerPointToLatLng(iconPos);
            if (shadow) {
              setPosition(shadow, iconPos);
            }
            marker3._latlng = latlng;
            e.latlng = latlng;
            e.oldLatLng = this._oldLatLng;
            marker3.fire("move", e).fire("drag", e);
          },
          _onDragEnd: function(e) {
            cancelAnimFrame(this._panRequest);
            delete this._oldLatLng;
            this._marker.fire("moveend").fire("dragend", e);
          }
        });
        var Marker = Layer.extend({
          options: {
            icon: new IconDefault(),
            interactive: true,
            keyboard: true,
            title: "",
            alt: "Marker",
            zIndexOffset: 0,
            opacity: 1,
            riseOnHover: false,
            riseOffset: 250,
            pane: "markerPane",
            shadowPane: "shadowPane",
            bubblingMouseEvents: false,
            autoPanOnFocus: true,
            draggable: false,
            autoPan: false,
            autoPanPadding: [50, 50],
            autoPanSpeed: 10
          },
          initialize: function(latlng, options) {
            setOptions(this, options);
            this._latlng = toLatLng(latlng);
          },
          onAdd: function(map) {
            this._zoomAnimated = this._zoomAnimated && map.options.markerZoomAnimation;
            if (this._zoomAnimated) {
              map.on("zoomanim", this._animateZoom, this);
            }
            this._initIcon();
            this.update();
          },
          onRemove: function(map) {
            if (this.dragging && this.dragging.enabled()) {
              this.options.draggable = true;
              this.dragging.removeHooks();
            }
            delete this.dragging;
            if (this._zoomAnimated) {
              map.off("zoomanim", this._animateZoom, this);
            }
            this._removeIcon();
            this._removeShadow();
          },
          getEvents: function() {
            return {
              zoom: this.update,
              viewreset: this.update
            };
          },
          getLatLng: function() {
            return this._latlng;
          },
          setLatLng: function(latlng) {
            var oldLatLng = this._latlng;
            this._latlng = toLatLng(latlng);
            this.update();
            return this.fire("move", { oldLatLng, latlng: this._latlng });
          },
          setZIndexOffset: function(offset) {
            this.options.zIndexOffset = offset;
            return this.update();
          },
          getIcon: function() {
            return this.options.icon;
          },
          setIcon: function(icon2) {
            this.options.icon = icon2;
            if (this._map) {
              this._initIcon();
              this.update();
            }
            if (this._popup) {
              this.bindPopup(this._popup, this._popup.options);
            }
            return this;
          },
          getElement: function() {
            return this._icon;
          },
          update: function() {
            if (this._icon && this._map) {
              var pos = this._map.latLngToLayerPoint(this._latlng).round();
              this._setPos(pos);
            }
            return this;
          },
          _initIcon: function() {
            var options = this.options, classToAdd = "leaflet-zoom-" + (this._zoomAnimated ? "animated" : "hide");
            var icon2 = options.icon.createIcon(this._icon), addIcon = false;
            if (icon2 !== this._icon) {
              if (this._icon) {
                this._removeIcon();
              }
              addIcon = true;
              if (options.title) {
                icon2.title = options.title;
              }
              if (icon2.tagName === "IMG") {
                icon2.alt = options.alt || "";
              }
            }
            addClass(icon2, classToAdd);
            if (options.keyboard) {
              icon2.tabIndex = "0";
              icon2.setAttribute("role", "button");
            }
            this._icon = icon2;
            if (options.riseOnHover) {
              this.on({
                mouseover: this._bringToFront,
                mouseout: this._resetZIndex
              });
            }
            if (this.options.autoPanOnFocus) {
              on(icon2, "focus", this._panOnFocus, this);
            }
            var newShadow = options.icon.createShadow(this._shadow), addShadow = false;
            if (newShadow !== this._shadow) {
              this._removeShadow();
              addShadow = true;
            }
            if (newShadow) {
              addClass(newShadow, classToAdd);
              newShadow.alt = "";
            }
            this._shadow = newShadow;
            if (options.opacity < 1) {
              this._updateOpacity();
            }
            if (addIcon) {
              this.getPane().appendChild(this._icon);
            }
            this._initInteraction();
            if (newShadow && addShadow) {
              this.getPane(options.shadowPane).appendChild(this._shadow);
            }
          },
          _removeIcon: function() {
            if (this.options.riseOnHover) {
              this.off({
                mouseover: this._bringToFront,
                mouseout: this._resetZIndex
              });
            }
            if (this.options.autoPanOnFocus) {
              off(this._icon, "focus", this._panOnFocus, this);
            }
            remove(this._icon);
            this.removeInteractiveTarget(this._icon);
            this._icon = null;
          },
          _removeShadow: function() {
            if (this._shadow) {
              remove(this._shadow);
            }
            this._shadow = null;
          },
          _setPos: function(pos) {
            if (this._icon) {
              setPosition(this._icon, pos);
            }
            if (this._shadow) {
              setPosition(this._shadow, pos);
            }
            this._zIndex = pos.y + this.options.zIndexOffset;
            this._resetZIndex();
          },
          _updateZIndex: function(offset) {
            if (this._icon) {
              this._icon.style.zIndex = this._zIndex + offset;
            }
          },
          _animateZoom: function(opt) {
            var pos = this._map._latLngToNewLayerPoint(this._latlng, opt.zoom, opt.center).round();
            this._setPos(pos);
          },
          _initInteraction: function() {
            if (!this.options.interactive) {
              return;
            }
            addClass(this._icon, "leaflet-interactive");
            this.addInteractiveTarget(this._icon);
            if (MarkerDrag) {
              var draggable = this.options.draggable;
              if (this.dragging) {
                draggable = this.dragging.enabled();
                this.dragging.disable();
              }
              this.dragging = new MarkerDrag(this);
              if (draggable) {
                this.dragging.enable();
              }
            }
          },
          setOpacity: function(opacity) {
            this.options.opacity = opacity;
            if (this._map) {
              this._updateOpacity();
            }
            return this;
          },
          _updateOpacity: function() {
            var opacity = this.options.opacity;
            if (this._icon) {
              setOpacity(this._icon, opacity);
            }
            if (this._shadow) {
              setOpacity(this._shadow, opacity);
            }
          },
          _bringToFront: function() {
            this._updateZIndex(this.options.riseOffset);
          },
          _resetZIndex: function() {
            this._updateZIndex(0);
          },
          _panOnFocus: function() {
            var map = this._map;
            if (!map) {
              return;
            }
            var iconOpts = this.options.icon.options;
            var size = iconOpts.iconSize ? toPoint(iconOpts.iconSize) : toPoint(0, 0);
            var anchor = iconOpts.iconAnchor ? toPoint(iconOpts.iconAnchor) : toPoint(0, 0);
            map.panInside(this._latlng, {
              paddingTopLeft: anchor,
              paddingBottomRight: size.subtract(anchor)
            });
          },
          _getPopupAnchor: function() {
            return this.options.icon.options.popupAnchor;
          },
          _getTooltipAnchor: function() {
            return this.options.icon.options.tooltipAnchor;
          }
        });
        function marker2(latlng, options) {
          return new Marker(latlng, options);
        }
        var Path2 = Layer.extend({
          options: {
            stroke: true,
            color: "#3388ff",
            weight: 3,
            opacity: 1,
            lineCap: "round",
            lineJoin: "round",
            dashArray: null,
            dashOffset: null,
            fill: false,
            fillColor: null,
            fillOpacity: 0.2,
            fillRule: "evenodd",
            interactive: true,
            bubblingMouseEvents: true
          },
          beforeAdd: function(map) {
            this._renderer = map.getRenderer(this);
          },
          onAdd: function() {
            this._renderer._initPath(this);
            this._reset();
            this._renderer._addPath(this);
          },
          onRemove: function() {
            this._renderer._removePath(this);
          },
          redraw: function() {
            if (this._map) {
              this._renderer._updatePath(this);
            }
            return this;
          },
          setStyle: function(style2) {
            setOptions(this, style2);
            if (this._renderer) {
              this._renderer._updateStyle(this);
              if (this.options.stroke && style2 && Object.prototype.hasOwnProperty.call(style2, "weight")) {
                this._updateBounds();
              }
            }
            return this;
          },
          bringToFront: function() {
            if (this._renderer) {
              this._renderer._bringToFront(this);
            }
            return this;
          },
          bringToBack: function() {
            if (this._renderer) {
              this._renderer._bringToBack(this);
            }
            return this;
          },
          getElement: function() {
            return this._path;
          },
          _reset: function() {
            this._project();
            this._update();
          },
          _clickTolerance: function() {
            return (this.options.stroke ? this.options.weight / 2 : 0) + (this._renderer.options.tolerance || 0);
          }
        });
        var CircleMarker = Path2.extend({
          options: {
            fill: true,
            radius: 10
          },
          initialize: function(latlng, options) {
            setOptions(this, options);
            this._latlng = toLatLng(latlng);
            this._radius = this.options.radius;
          },
          setLatLng: function(latlng) {
            var oldLatLng = this._latlng;
            this._latlng = toLatLng(latlng);
            this.redraw();
            return this.fire("move", { oldLatLng, latlng: this._latlng });
          },
          getLatLng: function() {
            return this._latlng;
          },
          setRadius: function(radius) {
            this.options.radius = this._radius = radius;
            return this.redraw();
          },
          getRadius: function() {
            return this._radius;
          },
          setStyle: function(options) {
            var radius = options && options.radius || this._radius;
            Path2.prototype.setStyle.call(this, options);
            this.setRadius(radius);
            return this;
          },
          _project: function() {
            this._point = this._map.latLngToLayerPoint(this._latlng);
            this._updateBounds();
          },
          _updateBounds: function() {
            var r = this._radius, r2 = this._radiusY || r, w = this._clickTolerance(), p = [r + w, r2 + w];
            this._pxBounds = new Bounds2(this._point.subtract(p), this._point.add(p));
          },
          _update: function() {
            if (this._map) {
              this._updatePath();
            }
          },
          _updatePath: function() {
            this._renderer._updateCircle(this);
          },
          _empty: function() {
            return this._radius && !this._renderer._bounds.intersects(this._pxBounds);
          },
          _containsPoint: function(p) {
            return p.distanceTo(this._point) <= this._radius + this._clickTolerance();
          }
        });
        function circleMarker4(latlng, options) {
          return new CircleMarker(latlng, options);
        }
        var Circle = CircleMarker.extend({
          initialize: function(latlng, options, legacyOptions) {
            if (typeof options === "number") {
              options = extend16({}, legacyOptions, { radius: options });
            }
            setOptions(this, options);
            this._latlng = toLatLng(latlng);
            if (isNaN(this.options.radius)) {
              throw new Error("Circle radius cannot be NaN");
            }
            this._mRadius = this.options.radius;
          },
          setRadius: function(radius) {
            this._mRadius = radius;
            return this.redraw();
          },
          getRadius: function() {
            return this._mRadius;
          },
          getBounds: function() {
            var half = [this._radius, this._radiusY || this._radius];
            return new LatLngBounds3(
              this._map.layerPointToLatLng(this._point.subtract(half)),
              this._map.layerPointToLatLng(this._point.add(half))
            );
          },
          setStyle: Path2.prototype.setStyle,
          _project: function() {
            var lng = this._latlng.lng, lat = this._latlng.lat, map = this._map, crs = map.options.crs;
            if (crs.distance === Earth.distance) {
              var d = Math.PI / 180, latR = this._mRadius / Earth.R / d, top = map.project([lat + latR, lng]), bottom = map.project([lat - latR, lng]), p = top.add(bottom).divideBy(2), lat2 = map.unproject(p).lat, lngR = Math.acos((Math.cos(latR * d) - Math.sin(lat * d) * Math.sin(lat2 * d)) / (Math.cos(lat * d) * Math.cos(lat2 * d))) / d;
              if (isNaN(lngR) || lngR === 0) {
                lngR = latR / Math.cos(Math.PI / 180 * lat);
              }
              this._point = p.subtract(map.getPixelOrigin());
              this._radius = isNaN(lngR) ? 0 : p.x - map.project([lat2, lng - lngR]).x;
              this._radiusY = p.y - top.y;
            } else {
              var latlng2 = crs.unproject(crs.project(this._latlng).subtract([this._mRadius, 0]));
              this._point = map.latLngToLayerPoint(this._latlng);
              this._radius = this._point.x - map.latLngToLayerPoint(latlng2).x;
            }
            this._updateBounds();
          }
        });
        function circle(latlng, options, legacyOptions) {
          return new Circle(latlng, options, legacyOptions);
        }
        var Polyline = Path2.extend({
          options: {
            smoothFactor: 1,
            noClip: false
          },
          initialize: function(latlngs, options) {
            setOptions(this, options);
            this._setLatLngs(latlngs);
          },
          getLatLngs: function() {
            return this._latlngs;
          },
          setLatLngs: function(latlngs) {
            this._setLatLngs(latlngs);
            return this.redraw();
          },
          isEmpty: function() {
            return !this._latlngs.length;
          },
          closestLayerPoint: function(p) {
            var minDistance = Infinity, minPoint = null, closest = _sqClosestPointOnSegment, p1, p2;
            for (var j = 0, jLen = this._parts.length; j < jLen; j++) {
              var points = this._parts[j];
              for (var i = 1, len = points.length; i < len; i++) {
                p1 = points[i - 1];
                p2 = points[i];
                var sqDist = closest(p, p1, p2, true);
                if (sqDist < minDistance) {
                  minDistance = sqDist;
                  minPoint = closest(p, p1, p2);
                }
              }
            }
            if (minPoint) {
              minPoint.distance = Math.sqrt(minDistance);
            }
            return minPoint;
          },
          getCenter: function() {
            if (!this._map) {
              throw new Error("Must add layer to map before using getCenter()");
            }
            return polylineCenter(this._defaultShape(), this._map.options.crs);
          },
          getBounds: function() {
            return this._bounds;
          },
          addLatLng: function(latlng, latlngs) {
            latlngs = latlngs || this._defaultShape();
            latlng = toLatLng(latlng);
            latlngs.push(latlng);
            this._bounds.extend(latlng);
            return this.redraw();
          },
          _setLatLngs: function(latlngs) {
            this._bounds = new LatLngBounds3();
            this._latlngs = this._convertLatLngs(latlngs);
          },
          _defaultShape: function() {
            return isFlat(this._latlngs) ? this._latlngs : this._latlngs[0];
          },
          _convertLatLngs: function(latlngs) {
            var result = [], flat = isFlat(latlngs);
            for (var i = 0, len = latlngs.length; i < len; i++) {
              if (flat) {
                result[i] = toLatLng(latlngs[i]);
                this._bounds.extend(result[i]);
              } else {
                result[i] = this._convertLatLngs(latlngs[i]);
              }
            }
            return result;
          },
          _project: function() {
            var pxBounds = new Bounds2();
            this._rings = [];
            this._projectLatlngs(this._latlngs, this._rings, pxBounds);
            if (this._bounds.isValid() && pxBounds.isValid()) {
              this._rawPxBounds = pxBounds;
              this._updateBounds();
            }
          },
          _updateBounds: function() {
            var w = this._clickTolerance(), p = new Point3(w, w);
            if (!this._rawPxBounds) {
              return;
            }
            this._pxBounds = new Bounds2([
              this._rawPxBounds.min.subtract(p),
              this._rawPxBounds.max.add(p)
            ]);
          },
          _projectLatlngs: function(latlngs, result, projectedBounds) {
            var flat = latlngs[0] instanceof LatLng3, len = latlngs.length, i, ring;
            if (flat) {
              ring = [];
              for (i = 0; i < len; i++) {
                ring[i] = this._map.latLngToLayerPoint(latlngs[i]);
                projectedBounds.extend(ring[i]);
              }
              result.push(ring);
            } else {
              for (i = 0; i < len; i++) {
                this._projectLatlngs(latlngs[i], result, projectedBounds);
              }
            }
          },
          _clipPoints: function() {
            var bounds3 = this._renderer._bounds;
            this._parts = [];
            if (!this._pxBounds || !this._pxBounds.intersects(bounds3)) {
              return;
            }
            if (this.options.noClip) {
              this._parts = this._rings;
              return;
            }
            var parts = this._parts, i, j, k, len, len2, segment, points;
            for (i = 0, k = 0, len = this._rings.length; i < len; i++) {
              points = this._rings[i];
              for (j = 0, len2 = points.length; j < len2 - 1; j++) {
                segment = clipSegment(points[j], points[j + 1], bounds3, j, true);
                if (!segment) {
                  continue;
                }
                parts[k] = parts[k] || [];
                parts[k].push(segment[0]);
                if (segment[1] !== points[j + 1] || j === len2 - 2) {
                  parts[k].push(segment[1]);
                  k++;
                }
              }
            }
          },
          _simplifyPoints: function() {
            var parts = this._parts, tolerance = this.options.smoothFactor;
            for (var i = 0, len = parts.length; i < len; i++) {
              parts[i] = simplify(parts[i], tolerance);
            }
          },
          _update: function() {
            if (!this._map) {
              return;
            }
            this._clipPoints();
            this._simplifyPoints();
            this._updatePath();
          },
          _updatePath: function() {
            this._renderer._updatePoly(this);
          },
          _containsPoint: function(p, closed) {
            var i, j, k, len, len2, part, w = this._clickTolerance();
            if (!this._pxBounds || !this._pxBounds.contains(p)) {
              return false;
            }
            for (i = 0, len = this._parts.length; i < len; i++) {
              part = this._parts[i];
              for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
                if (!closed && j === 0) {
                  continue;
                }
                if (pointToSegmentDistance(p, part[k], part[j]) <= w) {
                  return true;
                }
              }
            }
            return false;
          }
        });
        function polyline3(latlngs, options) {
          return new Polyline(latlngs, options);
        }
        Polyline._flat = _flat;
        var Polygon = Polyline.extend({
          options: {
            fill: true
          },
          isEmpty: function() {
            return !this._latlngs.length || !this._latlngs[0].length;
          },
          getCenter: function() {
            if (!this._map) {
              throw new Error("Must add layer to map before using getCenter()");
            }
            return polygonCenter(this._defaultShape(), this._map.options.crs);
          },
          _convertLatLngs: function(latlngs) {
            var result = Polyline.prototype._convertLatLngs.call(this, latlngs), len = result.length;
            if (len >= 2 && result[0] instanceof LatLng3 && result[0].equals(result[len - 1])) {
              result.pop();
            }
            return result;
          },
          _setLatLngs: function(latlngs) {
            Polyline.prototype._setLatLngs.call(this, latlngs);
            if (isFlat(this._latlngs)) {
              this._latlngs = [this._latlngs];
            }
          },
          _defaultShape: function() {
            return isFlat(this._latlngs[0]) ? this._latlngs[0] : this._latlngs[0][0];
          },
          _clipPoints: function() {
            var bounds3 = this._renderer._bounds, w = this.options.weight, p = new Point3(w, w);
            bounds3 = new Bounds2(bounds3.min.subtract(p), bounds3.max.add(p));
            this._parts = [];
            if (!this._pxBounds || !this._pxBounds.intersects(bounds3)) {
              return;
            }
            if (this.options.noClip) {
              this._parts = this._rings;
              return;
            }
            for (var i = 0, len = this._rings.length, clipped; i < len; i++) {
              clipped = clipPolygon(this._rings[i], bounds3, true);
              if (clipped.length) {
                this._parts.push(clipped);
              }
            }
          },
          _updatePath: function() {
            this._renderer._updatePoly(this, true);
          },
          _containsPoint: function(p) {
            var inside = false, part, p1, p2, i, j, k, len, len2;
            if (!this._pxBounds || !this._pxBounds.contains(p)) {
              return false;
            }
            for (i = 0, len = this._parts.length; i < len; i++) {
              part = this._parts[i];
              for (j = 0, len2 = part.length, k = len2 - 1; j < len2; k = j++) {
                p1 = part[j];
                p2 = part[k];
                if (p1.y > p.y !== p2.y > p.y && p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x) {
                  inside = !inside;
                }
              }
            }
            return inside || Polyline.prototype._containsPoint.call(this, p, true);
          }
        });
        function polygon(latlngs, options) {
          return new Polygon(latlngs, options);
        }
        var GeoJSON = FeatureGroup.extend({
          initialize: function(geojson, options) {
            setOptions(this, options);
            this._layers = {};
            if (geojson) {
              this.addData(geojson);
            }
          },
          addData: function(geojson) {
            var features = isArray(geojson) ? geojson : geojson.features, i, len, feature;
            if (features) {
              for (i = 0, len = features.length; i < len; i++) {
                feature = features[i];
                if (feature.geometries || feature.geometry || feature.features || feature.coordinates) {
                  this.addData(feature);
                }
              }
              return this;
            }
            var options = this.options;
            if (options.filter && !options.filter(geojson)) {
              return this;
            }
            var layer = geometryToLayer(geojson, options);
            if (!layer) {
              return this;
            }
            layer.feature = asFeature(geojson);
            layer.defaultOptions = layer.options;
            this.resetStyle(layer);
            if (options.onEachFeature) {
              options.onEachFeature(geojson, layer);
            }
            return this.addLayer(layer);
          },
          resetStyle: function(layer) {
            if (layer === void 0) {
              return this.eachLayer(this.resetStyle, this);
            }
            layer.options = extend16({}, layer.defaultOptions);
            this._setLayerStyle(layer, this.options.style);
            return this;
          },
          setStyle: function(style2) {
            return this.eachLayer(function(layer) {
              this._setLayerStyle(layer, style2);
            }, this);
          },
          _setLayerStyle: function(layer, style2) {
            if (layer.setStyle) {
              if (typeof style2 === "function") {
                style2 = style2(layer.feature);
              }
              layer.setStyle(style2);
            }
          }
        });
        function geometryToLayer(geojson, options) {
          var geometry = geojson.type === "Feature" ? geojson.geometry : geojson, coords2 = geometry ? geometry.coordinates : null, layers2 = [], pointToLayer = options && options.pointToLayer, _coordsToLatLng = options && options.coordsToLatLng || coordsToLatLng, latlng, latlngs, i, len;
          if (!coords2 && !geometry) {
            return null;
          }
          switch (geometry.type) {
            case "Point":
              latlng = _coordsToLatLng(coords2);
              return _pointToLayer(pointToLayer, geojson, latlng, options);
            case "MultiPoint":
              for (i = 0, len = coords2.length; i < len; i++) {
                latlng = _coordsToLatLng(coords2[i]);
                layers2.push(_pointToLayer(pointToLayer, geojson, latlng, options));
              }
              return new FeatureGroup(layers2);
            case "LineString":
            case "MultiLineString":
              latlngs = coordsToLatLngs(coords2, geometry.type === "LineString" ? 0 : 1, _coordsToLatLng);
              return new Polyline(latlngs, options);
            case "Polygon":
            case "MultiPolygon":
              latlngs = coordsToLatLngs(coords2, geometry.type === "Polygon" ? 1 : 2, _coordsToLatLng);
              return new Polygon(latlngs, options);
            case "GeometryCollection":
              for (i = 0, len = geometry.geometries.length; i < len; i++) {
                var geoLayer = geometryToLayer({
                  geometry: geometry.geometries[i],
                  type: "Feature",
                  properties: geojson.properties
                }, options);
                if (geoLayer) {
                  layers2.push(geoLayer);
                }
              }
              return new FeatureGroup(layers2);
            case "FeatureCollection":
              for (i = 0, len = geometry.features.length; i < len; i++) {
                var featureLayer = geometryToLayer(geometry.features[i], options);
                if (featureLayer) {
                  layers2.push(featureLayer);
                }
              }
              return new FeatureGroup(layers2);
            default:
              throw new Error("Invalid GeoJSON object.");
          }
        }
        function _pointToLayer(pointToLayerFn, geojson, latlng, options) {
          return pointToLayerFn ? pointToLayerFn(geojson, latlng) : new Marker(latlng, options && options.markersInheritOptions && options);
        }
        function coordsToLatLng(coords2) {
          return new LatLng3(coords2[1], coords2[0], coords2[2]);
        }
        function coordsToLatLngs(coords2, levelsDeep, _coordsToLatLng) {
          var latlngs = [];
          for (var i = 0, len = coords2.length, latlng; i < len; i++) {
            latlng = levelsDeep ? coordsToLatLngs(coords2[i], levelsDeep - 1, _coordsToLatLng) : (_coordsToLatLng || coordsToLatLng)(coords2[i]);
            latlngs.push(latlng);
          }
          return latlngs;
        }
        function latLngToCoords(latlng, precision) {
          latlng = toLatLng(latlng);
          return latlng.alt !== void 0 ? [formatNum(latlng.lng, precision), formatNum(latlng.lat, precision), formatNum(latlng.alt, precision)] : [formatNum(latlng.lng, precision), formatNum(latlng.lat, precision)];
        }
        function latLngsToCoords(latlngs, levelsDeep, closed, precision) {
          var coords2 = [];
          for (var i = 0, len = latlngs.length; i < len; i++) {
            coords2.push(levelsDeep ? latLngsToCoords(latlngs[i], isFlat(latlngs[i]) ? 0 : levelsDeep - 1, closed, precision) : latLngToCoords(latlngs[i], precision));
          }
          if (!levelsDeep && closed) {
            coords2.push(coords2[0].slice());
          }
          return coords2;
        }
        function getFeature(layer, newGeometry) {
          return layer.feature ? extend16({}, layer.feature, { geometry: newGeometry }) : asFeature(newGeometry);
        }
        function asFeature(geojson) {
          if (geojson.type === "Feature" || geojson.type === "FeatureCollection") {
            return geojson;
          }
          return {
            type: "Feature",
            properties: {},
            geometry: geojson
          };
        }
        var PointToGeoJSON = {
          toGeoJSON: function(precision) {
            return getFeature(this, {
              type: "Point",
              coordinates: latLngToCoords(this.getLatLng(), precision)
            });
          }
        };
        Marker.include(PointToGeoJSON);
        Circle.include(PointToGeoJSON);
        CircleMarker.include(PointToGeoJSON);
        Polyline.include({
          toGeoJSON: function(precision) {
            var multi = !isFlat(this._latlngs);
            var coords2 = latLngsToCoords(this._latlngs, multi ? 1 : 0, false, precision);
            return getFeature(this, {
              type: (multi ? "Multi" : "") + "LineString",
              coordinates: coords2
            });
          }
        });
        Polygon.include({
          toGeoJSON: function(precision) {
            var holes = !isFlat(this._latlngs), multi = holes && !isFlat(this._latlngs[0]);
            var coords2 = latLngsToCoords(this._latlngs, multi ? 2 : holes ? 1 : 0, true, precision);
            if (!holes) {
              coords2 = [coords2];
            }
            return getFeature(this, {
              type: (multi ? "Multi" : "") + "Polygon",
              coordinates: coords2
            });
          }
        });
        LayerGroup4.include({
          toMultiPoint: function(precision) {
            var coords2 = [];
            this.eachLayer(function(layer) {
              coords2.push(layer.toGeoJSON(precision).geometry.coordinates);
            });
            return getFeature(this, {
              type: "MultiPoint",
              coordinates: coords2
            });
          },
          toGeoJSON: function(precision) {
            var type = this.feature && this.feature.geometry && this.feature.geometry.type;
            if (type === "MultiPoint") {
              return this.toMultiPoint(precision);
            }
            var isGeometryCollection = type === "GeometryCollection", jsons = [];
            this.eachLayer(function(layer) {
              if (layer.toGeoJSON) {
                var json = layer.toGeoJSON(precision);
                if (isGeometryCollection) {
                  jsons.push(json.geometry);
                } else {
                  var feature = asFeature(json);
                  if (feature.type === "FeatureCollection") {
                    jsons.push.apply(jsons, feature.features);
                  } else {
                    jsons.push(feature);
                  }
                }
              }
            });
            if (isGeometryCollection) {
              return getFeature(this, {
                geometries: jsons,
                type: "GeometryCollection"
              });
            }
            return {
              type: "FeatureCollection",
              features: jsons
            };
          }
        });
        function geoJSON(geojson, options) {
          return new GeoJSON(geojson, options);
        }
        var geoJson4 = geoJSON;
        var ImageOverlay = Layer.extend({
          options: {
            opacity: 1,
            alt: "",
            interactive: false,
            crossOrigin: false,
            errorOverlayUrl: "",
            zIndex: 1,
            className: ""
          },
          initialize: function(url, bounds3, options) {
            this._url = url;
            this._bounds = toLatLngBounds(bounds3);
            setOptions(this, options);
          },
          onAdd: function() {
            if (!this._image) {
              this._initImage();
              if (this.options.opacity < 1) {
                this._updateOpacity();
              }
            }
            if (this.options.interactive) {
              addClass(this._image, "leaflet-interactive");
              this.addInteractiveTarget(this._image);
            }
            this.getPane().appendChild(this._image);
            this._reset();
          },
          onRemove: function() {
            remove(this._image);
            if (this.options.interactive) {
              this.removeInteractiveTarget(this._image);
            }
          },
          setOpacity: function(opacity) {
            this.options.opacity = opacity;
            if (this._image) {
              this._updateOpacity();
            }
            return this;
          },
          setStyle: function(styleOpts) {
            if (styleOpts.opacity) {
              this.setOpacity(styleOpts.opacity);
            }
            return this;
          },
          bringToFront: function() {
            if (this._map) {
              toFront(this._image);
            }
            return this;
          },
          bringToBack: function() {
            if (this._map) {
              toBack(this._image);
            }
            return this;
          },
          setUrl: function(url) {
            this._url = url;
            if (this._image) {
              this._image.src = url;
            }
            return this;
          },
          setBounds: function(bounds3) {
            this._bounds = toLatLngBounds(bounds3);
            if (this._map) {
              this._reset();
            }
            return this;
          },
          getEvents: function() {
            var events = {
              zoom: this._reset,
              viewreset: this._reset
            };
            if (this._zoomAnimated) {
              events.zoomanim = this._animateZoom;
            }
            return events;
          },
          setZIndex: function(value) {
            this.options.zIndex = value;
            this._updateZIndex();
            return this;
          },
          getBounds: function() {
            return this._bounds;
          },
          getElement: function() {
            return this._image;
          },
          _initImage: function() {
            var wasElementSupplied = this._url.tagName === "IMG";
            var img = this._image = wasElementSupplied ? this._url : create$1("img");
            addClass(img, "leaflet-image-layer");
            if (this._zoomAnimated) {
              addClass(img, "leaflet-zoom-animated");
            }
            if (this.options.className) {
              addClass(img, this.options.className);
            }
            img.onselectstart = falseFn;
            img.onmousemove = falseFn;
            img.onload = bind(this.fire, this, "load");
            img.onerror = bind(this._overlayOnError, this, "error");
            if (this.options.crossOrigin || this.options.crossOrigin === "") {
              img.crossOrigin = this.options.crossOrigin === true ? "" : this.options.crossOrigin;
            }
            if (this.options.zIndex) {
              this._updateZIndex();
            }
            if (wasElementSupplied) {
              this._url = img.src;
              return;
            }
            img.src = this._url;
            img.alt = this.options.alt;
          },
          _animateZoom: function(e) {
            var scale3 = this._map.getZoomScale(e.zoom), offset = this._map._latLngBoundsToNewLayerBounds(this._bounds, e.zoom, e.center).min;
            setTransform(this._image, offset, scale3);
          },
          _reset: function() {
            var image = this._image, bounds3 = new Bounds2(
              this._map.latLngToLayerPoint(this._bounds.getNorthWest()),
              this._map.latLngToLayerPoint(this._bounds.getSouthEast())
            ), size = bounds3.getSize();
            setPosition(image, bounds3.min);
            image.style.width = size.x + "px";
            image.style.height = size.y + "px";
          },
          _updateOpacity: function() {
            setOpacity(this._image, this.options.opacity);
          },
          _updateZIndex: function() {
            if (this._image && this.options.zIndex !== void 0 && this.options.zIndex !== null) {
              this._image.style.zIndex = this.options.zIndex;
            }
          },
          _overlayOnError: function() {
            this.fire("error");
            var errorUrl = this.options.errorOverlayUrl;
            if (errorUrl && this._url !== errorUrl) {
              this._url = errorUrl;
              this._image.src = errorUrl;
            }
          },
          getCenter: function() {
            return this._bounds.getCenter();
          }
        });
        var imageOverlay = function(url, bounds3, options) {
          return new ImageOverlay(url, bounds3, options);
        };
        var VideoOverlay = ImageOverlay.extend({
          options: {
            autoplay: true,
            loop: true,
            keepAspectRatio: true,
            muted: false,
            playsInline: true
          },
          _initImage: function() {
            var wasElementSupplied = this._url.tagName === "VIDEO";
            var vid = this._image = wasElementSupplied ? this._url : create$1("video");
            addClass(vid, "leaflet-image-layer");
            if (this._zoomAnimated) {
              addClass(vid, "leaflet-zoom-animated");
            }
            if (this.options.className) {
              addClass(vid, this.options.className);
            }
            vid.onselectstart = falseFn;
            vid.onmousemove = falseFn;
            vid.onloadeddata = bind(this.fire, this, "load");
            if (wasElementSupplied) {
              var sourceElements = vid.getElementsByTagName("source");
              var sources = [];
              for (var j = 0; j < sourceElements.length; j++) {
                sources.push(sourceElements[j].src);
              }
              this._url = sourceElements.length > 0 ? sources : [vid.src];
              return;
            }
            if (!isArray(this._url)) {
              this._url = [this._url];
            }
            if (!this.options.keepAspectRatio && Object.prototype.hasOwnProperty.call(vid.style, "objectFit")) {
              vid.style["objectFit"] = "fill";
            }
            vid.autoplay = !!this.options.autoplay;
            vid.loop = !!this.options.loop;
            vid.muted = !!this.options.muted;
            vid.playsInline = !!this.options.playsInline;
            for (var i = 0; i < this._url.length; i++) {
              var source = create$1("source");
              source.src = this._url[i];
              vid.appendChild(source);
            }
          }
        });
        function videoOverlay(video, bounds3, options) {
          return new VideoOverlay(video, bounds3, options);
        }
        var SVGOverlay = ImageOverlay.extend({
          _initImage: function() {
            var el = this._image = this._url;
            addClass(el, "leaflet-image-layer");
            if (this._zoomAnimated) {
              addClass(el, "leaflet-zoom-animated");
            }
            if (this.options.className) {
              addClass(el, this.options.className);
            }
            el.onselectstart = falseFn;
            el.onmousemove = falseFn;
          }
        });
        function svgOverlay(el, bounds3, options) {
          return new SVGOverlay(el, bounds3, options);
        }
        var DivOverlay = Layer.extend({
          options: {
            interactive: false,
            offset: [0, 0],
            className: "",
            pane: void 0,
            content: ""
          },
          initialize: function(options, source) {
            if (options && (options instanceof LatLng3 || isArray(options))) {
              this._latlng = toLatLng(options);
              setOptions(this, source);
            } else {
              setOptions(this, options);
              this._source = source;
            }
            if (this.options.content) {
              this._content = this.options.content;
            }
          },
          openOn: function(map) {
            map = arguments.length ? map : this._source._map;
            if (!map.hasLayer(this)) {
              map.addLayer(this);
            }
            return this;
          },
          close: function() {
            if (this._map) {
              this._map.removeLayer(this);
            }
            return this;
          },
          toggle: function(layer) {
            if (this._map) {
              this.close();
            } else {
              if (arguments.length) {
                this._source = layer;
              } else {
                layer = this._source;
              }
              this._prepareOpen();
              this.openOn(layer._map);
            }
            return this;
          },
          onAdd: function(map) {
            this._zoomAnimated = map._zoomAnimated;
            if (!this._container) {
              this._initLayout();
            }
            if (map._fadeAnimated) {
              setOpacity(this._container, 0);
            }
            clearTimeout(this._removeTimeout);
            this.getPane().appendChild(this._container);
            this.update();
            if (map._fadeAnimated) {
              setOpacity(this._container, 1);
            }
            this.bringToFront();
            if (this.options.interactive) {
              addClass(this._container, "leaflet-interactive");
              this.addInteractiveTarget(this._container);
            }
          },
          onRemove: function(map) {
            if (map._fadeAnimated) {
              setOpacity(this._container, 0);
              this._removeTimeout = setTimeout(bind(remove, void 0, this._container), 200);
            } else {
              remove(this._container);
            }
            if (this.options.interactive) {
              removeClass(this._container, "leaflet-interactive");
              this.removeInteractiveTarget(this._container);
            }
          },
          getLatLng: function() {
            return this._latlng;
          },
          setLatLng: function(latlng) {
            this._latlng = toLatLng(latlng);
            if (this._map) {
              this._updatePosition();
              this._adjustPan();
            }
            return this;
          },
          getContent: function() {
            return this._content;
          },
          setContent: function(content) {
            this._content = content;
            this.update();
            return this;
          },
          getElement: function() {
            return this._container;
          },
          update: function() {
            if (!this._map) {
              return;
            }
            this._container.style.visibility = "hidden";
            this._updateContent();
            this._updateLayout();
            this._updatePosition();
            this._container.style.visibility = "";
            this._adjustPan();
          },
          getEvents: function() {
            var events = {
              zoom: this._updatePosition,
              viewreset: this._updatePosition
            };
            if (this._zoomAnimated) {
              events.zoomanim = this._animateZoom;
            }
            return events;
          },
          isOpen: function() {
            return !!this._map && this._map.hasLayer(this);
          },
          bringToFront: function() {
            if (this._map) {
              toFront(this._container);
            }
            return this;
          },
          bringToBack: function() {
            if (this._map) {
              toBack(this._container);
            }
            return this;
          },
          _prepareOpen: function(latlng) {
            var source = this._source;
            if (!source._map) {
              return false;
            }
            if (source instanceof FeatureGroup) {
              source = null;
              var layers2 = this._source._layers;
              for (var id in layers2) {
                if (layers2[id]._map) {
                  source = layers2[id];
                  break;
                }
              }
              if (!source) {
                return false;
              }
              this._source = source;
            }
            if (!latlng) {
              if (source.getCenter) {
                latlng = source.getCenter();
              } else if (source.getLatLng) {
                latlng = source.getLatLng();
              } else if (source.getBounds) {
                latlng = source.getBounds().getCenter();
              } else {
                throw new Error("Unable to get source layer LatLng.");
              }
            }
            this.setLatLng(latlng);
            if (this._map) {
              this.update();
            }
            return true;
          },
          _updateContent: function() {
            if (!this._content) {
              return;
            }
            var node = this._contentNode;
            var content = typeof this._content === "function" ? this._content(this._source || this) : this._content;
            if (typeof content === "string") {
              node.innerHTML = content;
            } else {
              while (node.hasChildNodes()) {
                node.removeChild(node.firstChild);
              }
              node.appendChild(content);
            }
            this.fire("contentupdate");
          },
          _updatePosition: function() {
            if (!this._map) {
              return;
            }
            var pos = this._map.latLngToLayerPoint(this._latlng), offset = toPoint(this.options.offset), anchor = this._getAnchor();
            if (this._zoomAnimated) {
              setPosition(this._container, pos.add(anchor));
            } else {
              offset = offset.add(pos).add(anchor);
            }
            var bottom = this._containerBottom = -offset.y, left = this._containerLeft = -Math.round(this._containerWidth / 2) + offset.x;
            this._container.style.bottom = bottom + "px";
            this._container.style.left = left + "px";
          },
          _getAnchor: function() {
            return [0, 0];
          }
        });
        Map4.include({
          _initOverlay: function(OverlayClass, content, latlng, options) {
            var overlay = content;
            if (!(overlay instanceof OverlayClass)) {
              overlay = new OverlayClass(options).setContent(content);
            }
            if (latlng) {
              overlay.setLatLng(latlng);
            }
            return overlay;
          }
        });
        Layer.include({
          _initOverlay: function(OverlayClass, old, content, options) {
            var overlay = content;
            if (overlay instanceof OverlayClass) {
              setOptions(overlay, options);
              overlay._source = this;
            } else {
              overlay = old && !options ? old : new OverlayClass(options, this);
              overlay.setContent(content);
            }
            return overlay;
          }
        });
        var Popup = DivOverlay.extend({
          options: {
            pane: "popupPane",
            offset: [0, 7],
            maxWidth: 300,
            minWidth: 50,
            maxHeight: null,
            autoPan: true,
            autoPanPaddingTopLeft: null,
            autoPanPaddingBottomRight: null,
            autoPanPadding: [5, 5],
            keepInView: false,
            closeButton: true,
            autoClose: true,
            closeOnEscapeKey: true,
            className: ""
          },
          openOn: function(map) {
            map = arguments.length ? map : this._source._map;
            if (!map.hasLayer(this) && map._popup && map._popup.options.autoClose) {
              map.removeLayer(map._popup);
            }
            map._popup = this;
            return DivOverlay.prototype.openOn.call(this, map);
          },
          onAdd: function(map) {
            DivOverlay.prototype.onAdd.call(this, map);
            map.fire("popupopen", { popup: this });
            if (this._source) {
              this._source.fire("popupopen", { popup: this }, true);
              if (!(this._source instanceof Path2)) {
                this._source.on("preclick", stopPropagation);
              }
            }
          },
          onRemove: function(map) {
            DivOverlay.prototype.onRemove.call(this, map);
            map.fire("popupclose", { popup: this });
            if (this._source) {
              this._source.fire("popupclose", { popup: this }, true);
              if (!(this._source instanceof Path2)) {
                this._source.off("preclick", stopPropagation);
              }
            }
          },
          getEvents: function() {
            var events = DivOverlay.prototype.getEvents.call(this);
            if (this.options.closeOnClick !== void 0 ? this.options.closeOnClick : this._map.options.closePopupOnClick) {
              events.preclick = this.close;
            }
            if (this.options.keepInView) {
              events.moveend = this._adjustPan;
            }
            return events;
          },
          _initLayout: function() {
            var prefix = "leaflet-popup", container = this._container = create$1(
              "div",
              prefix + " " + (this.options.className || "") + " leaflet-zoom-animated"
            );
            var wrapper = this._wrapper = create$1("div", prefix + "-content-wrapper", container);
            this._contentNode = create$1("div", prefix + "-content", wrapper);
            disableClickPropagation(container);
            disableScrollPropagation(this._contentNode);
            on(container, "contextmenu", stopPropagation);
            this._tipContainer = create$1("div", prefix + "-tip-container", container);
            this._tip = create$1("div", prefix + "-tip", this._tipContainer);
            if (this.options.closeButton) {
              var closeButton = this._closeButton = create$1("a", prefix + "-close-button", container);
              closeButton.setAttribute("role", "button");
              closeButton.setAttribute("aria-label", "Close popup");
              closeButton.href = "#close";
              closeButton.innerHTML = '<span aria-hidden="true">&#215;</span>';
              on(closeButton, "click", function(ev) {
                preventDefault(ev);
                this.close();
              }, this);
            }
          },
          _updateLayout: function() {
            var container = this._contentNode, style2 = container.style;
            style2.width = "";
            style2.whiteSpace = "nowrap";
            var width = container.offsetWidth;
            width = Math.min(width, this.options.maxWidth);
            width = Math.max(width, this.options.minWidth);
            style2.width = width + 1 + "px";
            style2.whiteSpace = "";
            style2.height = "";
            var height = container.offsetHeight, maxHeight = this.options.maxHeight, scrolledClass = "leaflet-popup-scrolled";
            if (maxHeight && height > maxHeight) {
              style2.height = maxHeight + "px";
              addClass(container, scrolledClass);
            } else {
              removeClass(container, scrolledClass);
            }
            this._containerWidth = this._container.offsetWidth;
          },
          _animateZoom: function(e) {
            var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center), anchor = this._getAnchor();
            setPosition(this._container, pos.add(anchor));
          },
          _adjustPan: function() {
            if (!this.options.autoPan) {
              return;
            }
            if (this._map._panAnim) {
              this._map._panAnim.stop();
            }
            if (this._autopanning) {
              this._autopanning = false;
              return;
            }
            var map = this._map, marginBottom = parseInt(getStyle(this._container, "marginBottom"), 10) || 0, containerHeight = this._container.offsetHeight + marginBottom, containerWidth = this._containerWidth, layerPos = new Point3(this._containerLeft, -containerHeight - this._containerBottom);
            layerPos._add(getPosition(this._container));
            var containerPos = map.layerPointToContainerPoint(layerPos), padding = toPoint(this.options.autoPanPadding), paddingTL = toPoint(this.options.autoPanPaddingTopLeft || padding), paddingBR = toPoint(this.options.autoPanPaddingBottomRight || padding), size = map.getSize(), dx = 0, dy = 0;
            if (containerPos.x + containerWidth + paddingBR.x > size.x) {
              dx = containerPos.x + containerWidth - size.x + paddingBR.x;
            }
            if (containerPos.x - dx - paddingTL.x < 0) {
              dx = containerPos.x - paddingTL.x;
            }
            if (containerPos.y + containerHeight + paddingBR.y > size.y) {
              dy = containerPos.y + containerHeight - size.y + paddingBR.y;
            }
            if (containerPos.y - dy - paddingTL.y < 0) {
              dy = containerPos.y - paddingTL.y;
            }
            if (dx || dy) {
              if (this.options.keepInView) {
                this._autopanning = true;
              }
              map.fire("autopanstart").panBy([dx, dy]);
            }
          },
          _getAnchor: function() {
            return toPoint(this._source && this._source._getPopupAnchor ? this._source._getPopupAnchor() : [0, 0]);
          }
        });
        var popup = function(options, source) {
          return new Popup(options, source);
        };
        Map4.mergeOptions({
          closePopupOnClick: true
        });
        Map4.include({
          openPopup: function(popup2, latlng, options) {
            this._initOverlay(Popup, popup2, latlng, options).openOn(this);
            return this;
          },
          closePopup: function(popup2) {
            popup2 = arguments.length ? popup2 : this._popup;
            if (popup2) {
              popup2.close();
            }
            return this;
          }
        });
        Layer.include({
          bindPopup: function(content, options) {
            this._popup = this._initOverlay(Popup, this._popup, content, options);
            if (!this._popupHandlersAdded) {
              this.on({
                click: this._openPopup,
                keypress: this._onKeyPress,
                remove: this.closePopup,
                move: this._movePopup
              });
              this._popupHandlersAdded = true;
            }
            return this;
          },
          unbindPopup: function() {
            if (this._popup) {
              this.off({
                click: this._openPopup,
                keypress: this._onKeyPress,
                remove: this.closePopup,
                move: this._movePopup
              });
              this._popupHandlersAdded = false;
              this._popup = null;
            }
            return this;
          },
          openPopup: function(latlng) {
            if (this._popup) {
              if (!(this instanceof FeatureGroup)) {
                this._popup._source = this;
              }
              if (this._popup._prepareOpen(latlng || this._latlng)) {
                this._popup.openOn(this._map);
              }
            }
            return this;
          },
          closePopup: function() {
            if (this._popup) {
              this._popup.close();
            }
            return this;
          },
          togglePopup: function() {
            if (this._popup) {
              this._popup.toggle(this);
            }
            return this;
          },
          isPopupOpen: function() {
            return this._popup ? this._popup.isOpen() : false;
          },
          setPopupContent: function(content) {
            if (this._popup) {
              this._popup.setContent(content);
            }
            return this;
          },
          getPopup: function() {
            return this._popup;
          },
          _openPopup: function(e) {
            if (!this._popup || !this._map) {
              return;
            }
            stop(e);
            var target = e.layer || e.target;
            if (this._popup._source === target && !(target instanceof Path2)) {
              if (this._map.hasLayer(this._popup)) {
                this.closePopup();
              } else {
                this.openPopup(e.latlng);
              }
              return;
            }
            this._popup._source = target;
            this.openPopup(e.latlng);
          },
          _movePopup: function(e) {
            this._popup.setLatLng(e.latlng);
          },
          _onKeyPress: function(e) {
            if (e.originalEvent.keyCode === 13) {
              this._openPopup(e);
            }
          }
        });
        var Tooltip = DivOverlay.extend({
          options: {
            pane: "tooltipPane",
            offset: [0, 0],
            direction: "auto",
            permanent: false,
            sticky: false,
            opacity: 0.9
          },
          onAdd: function(map) {
            DivOverlay.prototype.onAdd.call(this, map);
            this.setOpacity(this.options.opacity);
            map.fire("tooltipopen", { tooltip: this });
            if (this._source) {
              this.addEventParent(this._source);
              this._source.fire("tooltipopen", { tooltip: this }, true);
            }
          },
          onRemove: function(map) {
            DivOverlay.prototype.onRemove.call(this, map);
            map.fire("tooltipclose", { tooltip: this });
            if (this._source) {
              this.removeEventParent(this._source);
              this._source.fire("tooltipclose", { tooltip: this }, true);
            }
          },
          getEvents: function() {
            var events = DivOverlay.prototype.getEvents.call(this);
            if (!this.options.permanent) {
              events.preclick = this.close;
            }
            return events;
          },
          _initLayout: function() {
            var prefix = "leaflet-tooltip", className = prefix + " " + (this.options.className || "") + " leaflet-zoom-" + (this._zoomAnimated ? "animated" : "hide");
            this._contentNode = this._container = create$1("div", className);
            this._container.setAttribute("role", "tooltip");
            this._container.setAttribute("id", "leaflet-tooltip-" + stamp2(this));
          },
          _updateLayout: function() {
          },
          _adjustPan: function() {
          },
          _setPosition: function(pos) {
            var subX, subY, map = this._map, container = this._container, centerPoint = map.latLngToContainerPoint(map.getCenter()), tooltipPoint = map.layerPointToContainerPoint(pos), direction = this.options.direction, tooltipWidth = container.offsetWidth, tooltipHeight = container.offsetHeight, offset = toPoint(this.options.offset), anchor = this._getAnchor();
            if (direction === "top") {
              subX = tooltipWidth / 2;
              subY = tooltipHeight;
            } else if (direction === "bottom") {
              subX = tooltipWidth / 2;
              subY = 0;
            } else if (direction === "center") {
              subX = tooltipWidth / 2;
              subY = tooltipHeight / 2;
            } else if (direction === "right") {
              subX = 0;
              subY = tooltipHeight / 2;
            } else if (direction === "left") {
              subX = tooltipWidth;
              subY = tooltipHeight / 2;
            } else if (tooltipPoint.x < centerPoint.x) {
              direction = "right";
              subX = 0;
              subY = tooltipHeight / 2;
            } else {
              direction = "left";
              subX = tooltipWidth + (offset.x + anchor.x) * 2;
              subY = tooltipHeight / 2;
            }
            pos = pos.subtract(toPoint(subX, subY, true)).add(offset).add(anchor);
            removeClass(container, "leaflet-tooltip-right");
            removeClass(container, "leaflet-tooltip-left");
            removeClass(container, "leaflet-tooltip-top");
            removeClass(container, "leaflet-tooltip-bottom");
            addClass(container, "leaflet-tooltip-" + direction);
            setPosition(container, pos);
          },
          _updatePosition: function() {
            var pos = this._map.latLngToLayerPoint(this._latlng);
            this._setPosition(pos);
          },
          setOpacity: function(opacity) {
            this.options.opacity = opacity;
            if (this._container) {
              setOpacity(this._container, opacity);
            }
          },
          _animateZoom: function(e) {
            var pos = this._map._latLngToNewLayerPoint(this._latlng, e.zoom, e.center);
            this._setPosition(pos);
          },
          _getAnchor: function() {
            return toPoint(this._source && this._source._getTooltipAnchor && !this.options.sticky ? this._source._getTooltipAnchor() : [0, 0]);
          }
        });
        var tooltip = function(options, source) {
          return new Tooltip(options, source);
        };
        Map4.include({
          openTooltip: function(tooltip2, latlng, options) {
            this._initOverlay(Tooltip, tooltip2, latlng, options).openOn(this);
            return this;
          },
          closeTooltip: function(tooltip2) {
            tooltip2.close();
            return this;
          }
        });
        Layer.include({
          bindTooltip: function(content, options) {
            if (this._tooltip && this.isTooltipOpen()) {
              this.unbindTooltip();
            }
            this._tooltip = this._initOverlay(Tooltip, this._tooltip, content, options);
            this._initTooltipInteractions();
            if (this._tooltip.options.permanent && this._map && this._map.hasLayer(this)) {
              this.openTooltip();
            }
            return this;
          },
          unbindTooltip: function() {
            if (this._tooltip) {
              this._initTooltipInteractions(true);
              this.closeTooltip();
              this._tooltip = null;
            }
            return this;
          },
          _initTooltipInteractions: function(remove2) {
            if (!remove2 && this._tooltipHandlersAdded) {
              return;
            }
            var onOff = remove2 ? "off" : "on", events = {
              remove: this.closeTooltip,
              move: this._moveTooltip
            };
            if (!this._tooltip.options.permanent) {
              events.mouseover = this._openTooltip;
              events.mouseout = this.closeTooltip;
              events.click = this._openTooltip;
              if (this._map) {
                this._addFocusListeners();
              } else {
                events.add = this._addFocusListeners;
              }
            } else {
              events.add = this._openTooltip;
            }
            if (this._tooltip.options.sticky) {
              events.mousemove = this._moveTooltip;
            }
            this[onOff](events);
            this._tooltipHandlersAdded = !remove2;
          },
          openTooltip: function(latlng) {
            if (this._tooltip) {
              if (!(this instanceof FeatureGroup)) {
                this._tooltip._source = this;
              }
              if (this._tooltip._prepareOpen(latlng)) {
                this._tooltip.openOn(this._map);
                if (this.getElement) {
                  this._setAriaDescribedByOnLayer(this);
                } else if (this.eachLayer) {
                  this.eachLayer(this._setAriaDescribedByOnLayer, this);
                }
              }
            }
            return this;
          },
          closeTooltip: function() {
            if (this._tooltip) {
              return this._tooltip.close();
            }
          },
          toggleTooltip: function() {
            if (this._tooltip) {
              this._tooltip.toggle(this);
            }
            return this;
          },
          isTooltipOpen: function() {
            return this._tooltip.isOpen();
          },
          setTooltipContent: function(content) {
            if (this._tooltip) {
              this._tooltip.setContent(content);
            }
            return this;
          },
          getTooltip: function() {
            return this._tooltip;
          },
          _addFocusListeners: function() {
            if (this.getElement) {
              this._addFocusListenersOnLayer(this);
            } else if (this.eachLayer) {
              this.eachLayer(this._addFocusListenersOnLayer, this);
            }
          },
          _addFocusListenersOnLayer: function(layer) {
            var el = layer.getElement();
            if (el) {
              on(el, "focus", function() {
                this._tooltip._source = layer;
                this.openTooltip();
              }, this);
              on(el, "blur", this.closeTooltip, this);
            }
          },
          _setAriaDescribedByOnLayer: function(layer) {
            var el = layer.getElement();
            if (el) {
              el.setAttribute("aria-describedby", this._tooltip._container.id);
            }
          },
          _openTooltip: function(e) {
            if (!this._tooltip || !this._map || this._map.dragging && this._map.dragging.moving()) {
              return;
            }
            this._tooltip._source = e.layer || e.target;
            this.openTooltip(this._tooltip.options.sticky ? e.latlng : void 0);
          },
          _moveTooltip: function(e) {
            var latlng = e.latlng, containerPoint, layerPoint;
            if (this._tooltip.options.sticky && e.originalEvent) {
              containerPoint = this._map.mouseEventToContainerPoint(e.originalEvent);
              layerPoint = this._map.containerPointToLayerPoint(containerPoint);
              latlng = this._map.layerPointToLatLng(layerPoint);
            }
            this._tooltip.setLatLng(latlng);
          }
        });
        var DivIcon = Icon.extend({
          options: {
            iconSize: [12, 12],
            html: false,
            bgPos: null,
            className: "leaflet-div-icon"
          },
          createIcon: function(oldIcon) {
            var div = oldIcon && oldIcon.tagName === "DIV" ? oldIcon : document.createElement("div"), options = this.options;
            if (options.html instanceof Element) {
              empty(div);
              div.appendChild(options.html);
            } else {
              div.innerHTML = options.html !== false ? options.html : "";
            }
            if (options.bgPos) {
              var bgPos = toPoint(options.bgPos);
              div.style.backgroundPosition = -bgPos.x + "px " + -bgPos.y + "px";
            }
            this._setIconStyles(div, "icon");
            return div;
          },
          createShadow: function() {
            return null;
          }
        });
        function divIcon(options) {
          return new DivIcon(options);
        }
        Icon.Default = IconDefault;
        var GridLayer = Layer.extend({
          options: {
            tileSize: 256,
            opacity: 1,
            updateWhenIdle: Browser5.mobile,
            updateWhenZooming: true,
            updateInterval: 200,
            zIndex: 1,
            bounds: null,
            minZoom: 0,
            maxZoom: void 0,
            maxNativeZoom: void 0,
            minNativeZoom: void 0,
            noWrap: false,
            pane: "tilePane",
            className: "",
            keepBuffer: 2
          },
          initialize: function(options) {
            setOptions(this, options);
          },
          onAdd: function() {
            this._initContainer();
            this._levels = {};
            this._tiles = {};
            this._resetView();
          },
          beforeAdd: function(map) {
            map._addZoomLimit(this);
          },
          onRemove: function(map) {
            this._removeAllTiles();
            remove(this._container);
            map._removeZoomLimit(this);
            this._container = null;
            this._tileZoom = void 0;
          },
          bringToFront: function() {
            if (this._map) {
              toFront(this._container);
              this._setAutoZIndex(Math.max);
            }
            return this;
          },
          bringToBack: function() {
            if (this._map) {
              toBack(this._container);
              this._setAutoZIndex(Math.min);
            }
            return this;
          },
          getContainer: function() {
            return this._container;
          },
          setOpacity: function(opacity) {
            this.options.opacity = opacity;
            this._updateOpacity();
            return this;
          },
          setZIndex: function(zIndex) {
            this.options.zIndex = zIndex;
            this._updateZIndex();
            return this;
          },
          isLoading: function() {
            return this._loading;
          },
          redraw: function() {
            if (this._map) {
              this._removeAllTiles();
              var tileZoom = this._clampZoom(this._map.getZoom());
              if (tileZoom !== this._tileZoom) {
                this._tileZoom = tileZoom;
                this._updateLevels();
              }
              this._update();
            }
            return this;
          },
          getEvents: function() {
            var events = {
              viewprereset: this._invalidateAll,
              viewreset: this._resetView,
              zoom: this._resetView,
              moveend: this._onMoveEnd
            };
            if (!this.options.updateWhenIdle) {
              if (!this._onMove) {
                this._onMove = throttle(this._onMoveEnd, this.options.updateInterval, this);
              }
              events.move = this._onMove;
            }
            if (this._zoomAnimated) {
              events.zoomanim = this._animateZoom;
            }
            return events;
          },
          createTile: function() {
            return document.createElement("div");
          },
          getTileSize: function() {
            var s = this.options.tileSize;
            return s instanceof Point3 ? s : new Point3(s, s);
          },
          _updateZIndex: function() {
            if (this._container && this.options.zIndex !== void 0 && this.options.zIndex !== null) {
              this._container.style.zIndex = this.options.zIndex;
            }
          },
          _setAutoZIndex: function(compare) {
            var layers2 = this.getPane().children, edgeZIndex = -compare(-Infinity, Infinity);
            for (var i = 0, len = layers2.length, zIndex; i < len; i++) {
              zIndex = layers2[i].style.zIndex;
              if (layers2[i] !== this._container && zIndex) {
                edgeZIndex = compare(edgeZIndex, +zIndex);
              }
            }
            if (isFinite(edgeZIndex)) {
              this.options.zIndex = edgeZIndex + compare(-1, 1);
              this._updateZIndex();
            }
          },
          _updateOpacity: function() {
            if (!this._map) {
              return;
            }
            if (Browser5.ielt9) {
              return;
            }
            setOpacity(this._container, this.options.opacity);
            var now = +new Date(), nextFrame = false, willPrune = false;
            for (var key in this._tiles) {
              var tile = this._tiles[key];
              if (!tile.current || !tile.loaded) {
                continue;
              }
              var fade = Math.min(1, (now - tile.loaded) / 200);
              setOpacity(tile.el, fade);
              if (fade < 1) {
                nextFrame = true;
              } else {
                if (tile.active) {
                  willPrune = true;
                } else {
                  this._onOpaqueTile(tile);
                }
                tile.active = true;
              }
            }
            if (willPrune && !this._noPrune) {
              this._pruneTiles();
            }
            if (nextFrame) {
              cancelAnimFrame(this._fadeFrame);
              this._fadeFrame = requestAnimFrame(this._updateOpacity, this);
            }
          },
          _onOpaqueTile: falseFn,
          _initContainer: function() {
            if (this._container) {
              return;
            }
            this._container = create$1("div", "leaflet-layer " + (this.options.className || ""));
            this._updateZIndex();
            if (this.options.opacity < 1) {
              this._updateOpacity();
            }
            this.getPane().appendChild(this._container);
          },
          _updateLevels: function() {
            var zoom2 = this._tileZoom, maxZoom = this.options.maxZoom;
            if (zoom2 === void 0) {
              return void 0;
            }
            for (var z in this._levels) {
              z = Number(z);
              if (this._levels[z].el.children.length || z === zoom2) {
                this._levels[z].el.style.zIndex = maxZoom - Math.abs(zoom2 - z);
                this._onUpdateLevel(z);
              } else {
                remove(this._levels[z].el);
                this._removeTilesAtZoom(z);
                this._onRemoveLevel(z);
                delete this._levels[z];
              }
            }
            var level = this._levels[zoom2], map = this._map;
            if (!level) {
              level = this._levels[zoom2] = {};
              level.el = create$1("div", "leaflet-tile-container leaflet-zoom-animated", this._container);
              level.el.style.zIndex = maxZoom;
              level.origin = map.project(map.unproject(map.getPixelOrigin()), zoom2).round();
              level.zoom = zoom2;
              this._setZoomTransform(level, map.getCenter(), map.getZoom());
              falseFn(level.el.offsetWidth);
              this._onCreateLevel(level);
            }
            this._level = level;
            return level;
          },
          _onUpdateLevel: falseFn,
          _onRemoveLevel: falseFn,
          _onCreateLevel: falseFn,
          _pruneTiles: function() {
            if (!this._map) {
              return;
            }
            var key, tile;
            var zoom2 = this._map.getZoom();
            if (zoom2 > this.options.maxZoom || zoom2 < this.options.minZoom) {
              this._removeAllTiles();
              return;
            }
            for (key in this._tiles) {
              tile = this._tiles[key];
              tile.retain = tile.current;
            }
            for (key in this._tiles) {
              tile = this._tiles[key];
              if (tile.current && !tile.active) {
                var coords2 = tile.coords;
                if (!this._retainParent(coords2.x, coords2.y, coords2.z, coords2.z - 5)) {
                  this._retainChildren(coords2.x, coords2.y, coords2.z, coords2.z + 2);
                }
              }
            }
            for (key in this._tiles) {
              if (!this._tiles[key].retain) {
                this._removeTile(key);
              }
            }
          },
          _removeTilesAtZoom: function(zoom2) {
            for (var key in this._tiles) {
              if (this._tiles[key].coords.z !== zoom2) {
                continue;
              }
              this._removeTile(key);
            }
          },
          _removeAllTiles: function() {
            for (var key in this._tiles) {
              this._removeTile(key);
            }
          },
          _invalidateAll: function() {
            for (var z in this._levels) {
              remove(this._levels[z].el);
              this._onRemoveLevel(Number(z));
              delete this._levels[z];
            }
            this._removeAllTiles();
            this._tileZoom = void 0;
          },
          _retainParent: function(x, y, z, minZoom) {
            var x2 = Math.floor(x / 2), y2 = Math.floor(y / 2), z2 = z - 1, coords2 = new Point3(+x2, +y2);
            coords2.z = +z2;
            var key = this._tileCoordsToKey(coords2), tile = this._tiles[key];
            if (tile && tile.active) {
              tile.retain = true;
              return true;
            } else if (tile && tile.loaded) {
              tile.retain = true;
            }
            if (z2 > minZoom) {
              return this._retainParent(x2, y2, z2, minZoom);
            }
            return false;
          },
          _retainChildren: function(x, y, z, maxZoom) {
            for (var i = 2 * x; i < 2 * x + 2; i++) {
              for (var j = 2 * y; j < 2 * y + 2; j++) {
                var coords2 = new Point3(i, j);
                coords2.z = z + 1;
                var key = this._tileCoordsToKey(coords2), tile = this._tiles[key];
                if (tile && tile.active) {
                  tile.retain = true;
                  continue;
                } else if (tile && tile.loaded) {
                  tile.retain = true;
                }
                if (z + 1 < maxZoom) {
                  this._retainChildren(i, j, z + 1, maxZoom);
                }
              }
            }
          },
          _resetView: function(e) {
            var animating = e && (e.pinch || e.flyTo);
            this._setView(this._map.getCenter(), this._map.getZoom(), animating, animating);
          },
          _animateZoom: function(e) {
            this._setView(e.center, e.zoom, true, e.noUpdate);
          },
          _clampZoom: function(zoom2) {
            var options = this.options;
            if (void 0 !== options.minNativeZoom && zoom2 < options.minNativeZoom) {
              return options.minNativeZoom;
            }
            if (void 0 !== options.maxNativeZoom && options.maxNativeZoom < zoom2) {
              return options.maxNativeZoom;
            }
            return zoom2;
          },
          _setView: function(center, zoom2, noPrune, noUpdate) {
            var tileZoom = Math.round(zoom2);
            if (this.options.maxZoom !== void 0 && tileZoom > this.options.maxZoom || this.options.minZoom !== void 0 && tileZoom < this.options.minZoom) {
              tileZoom = void 0;
            } else {
              tileZoom = this._clampZoom(tileZoom);
            }
            var tileZoomChanged = this.options.updateWhenZooming && tileZoom !== this._tileZoom;
            if (!noUpdate || tileZoomChanged) {
              this._tileZoom = tileZoom;
              if (this._abortLoading) {
                this._abortLoading();
              }
              this._updateLevels();
              this._resetGrid();
              if (tileZoom !== void 0) {
                this._update(center);
              }
              if (!noPrune) {
                this._pruneTiles();
              }
              this._noPrune = !!noPrune;
            }
            this._setZoomTransforms(center, zoom2);
          },
          _setZoomTransforms: function(center, zoom2) {
            for (var i in this._levels) {
              this._setZoomTransform(this._levels[i], center, zoom2);
            }
          },
          _setZoomTransform: function(level, center, zoom2) {
            var scale3 = this._map.getZoomScale(zoom2, level.zoom), translate = level.origin.multiplyBy(scale3).subtract(this._map._getNewPixelOrigin(center, zoom2)).round();
            if (Browser5.any3d) {
              setTransform(level.el, translate, scale3);
            } else {
              setPosition(level.el, translate);
            }
          },
          _resetGrid: function() {
            var map = this._map, crs = map.options.crs, tileSize = this._tileSize = this.getTileSize(), tileZoom = this._tileZoom;
            var bounds3 = this._map.getPixelWorldBounds(this._tileZoom);
            if (bounds3) {
              this._globalTileRange = this._pxBoundsToTileRange(bounds3);
            }
            this._wrapX = crs.wrapLng && !this.options.noWrap && [
              Math.floor(map.project([0, crs.wrapLng[0]], tileZoom).x / tileSize.x),
              Math.ceil(map.project([0, crs.wrapLng[1]], tileZoom).x / tileSize.y)
            ];
            this._wrapY = crs.wrapLat && !this.options.noWrap && [
              Math.floor(map.project([crs.wrapLat[0], 0], tileZoom).y / tileSize.x),
              Math.ceil(map.project([crs.wrapLat[1], 0], tileZoom).y / tileSize.y)
            ];
          },
          _onMoveEnd: function() {
            if (!this._map || this._map._animatingZoom) {
              return;
            }
            this._update();
          },
          _getTiledPixelBounds: function(center) {
            var map = this._map, mapZoom = map._animatingZoom ? Math.max(map._animateToZoom, map.getZoom()) : map.getZoom(), scale3 = map.getZoomScale(mapZoom, this._tileZoom), pixelCenter = map.project(center, this._tileZoom).floor(), halfSize = map.getSize().divideBy(scale3 * 2);
            return new Bounds2(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
          },
          _update: function(center) {
            var map = this._map;
            if (!map) {
              return;
            }
            var zoom2 = this._clampZoom(map.getZoom());
            if (center === void 0) {
              center = map.getCenter();
            }
            if (this._tileZoom === void 0) {
              return;
            }
            var pixelBounds = this._getTiledPixelBounds(center), tileRange = this._pxBoundsToTileRange(pixelBounds), tileCenter = tileRange.getCenter(), queue = [], margin = this.options.keepBuffer, noPruneRange = new Bounds2(
              tileRange.getBottomLeft().subtract([margin, -margin]),
              tileRange.getTopRight().add([margin, -margin])
            );
            if (!(isFinite(tileRange.min.x) && isFinite(tileRange.min.y) && isFinite(tileRange.max.x) && isFinite(tileRange.max.y))) {
              throw new Error("Attempted to load an infinite number of tiles");
            }
            for (var key in this._tiles) {
              var c = this._tiles[key].coords;
              if (c.z !== this._tileZoom || !noPruneRange.contains(new Point3(c.x, c.y))) {
                this._tiles[key].current = false;
              }
            }
            if (Math.abs(zoom2 - this._tileZoom) > 1) {
              this._setView(center, zoom2);
              return;
            }
            for (var j = tileRange.min.y; j <= tileRange.max.y; j++) {
              for (var i = tileRange.min.x; i <= tileRange.max.x; i++) {
                var coords2 = new Point3(i, j);
                coords2.z = this._tileZoom;
                if (!this._isValidTile(coords2)) {
                  continue;
                }
                var tile = this._tiles[this._tileCoordsToKey(coords2)];
                if (tile) {
                  tile.current = true;
                } else {
                  queue.push(coords2);
                }
              }
            }
            queue.sort(function(a, b) {
              return a.distanceTo(tileCenter) - b.distanceTo(tileCenter);
            });
            if (queue.length !== 0) {
              if (!this._loading) {
                this._loading = true;
                this.fire("loading");
              }
              var fragment = document.createDocumentFragment();
              for (i = 0; i < queue.length; i++) {
                this._addTile(queue[i], fragment);
              }
              this._level.el.appendChild(fragment);
            }
          },
          _isValidTile: function(coords2) {
            var crs = this._map.options.crs;
            if (!crs.infinite) {
              var bounds3 = this._globalTileRange;
              if (!crs.wrapLng && (coords2.x < bounds3.min.x || coords2.x > bounds3.max.x) || !crs.wrapLat && (coords2.y < bounds3.min.y || coords2.y > bounds3.max.y)) {
                return false;
              }
            }
            if (!this.options.bounds) {
              return true;
            }
            var tileBounds = this._tileCoordsToBounds(coords2);
            return toLatLngBounds(this.options.bounds).overlaps(tileBounds);
          },
          _keyToBounds: function(key) {
            return this._tileCoordsToBounds(this._keyToTileCoords(key));
          },
          _tileCoordsToNwSe: function(coords2) {
            var map = this._map, tileSize = this.getTileSize(), nwPoint = coords2.scaleBy(tileSize), sePoint = nwPoint.add(tileSize), nw = map.unproject(nwPoint, coords2.z), se = map.unproject(sePoint, coords2.z);
            return [nw, se];
          },
          _tileCoordsToBounds: function(coords2) {
            var bp = this._tileCoordsToNwSe(coords2), bounds3 = new LatLngBounds3(bp[0], bp[1]);
            if (!this.options.noWrap) {
              bounds3 = this._map.wrapLatLngBounds(bounds3);
            }
            return bounds3;
          },
          _tileCoordsToKey: function(coords2) {
            return coords2.x + ":" + coords2.y + ":" + coords2.z;
          },
          _keyToTileCoords: function(key) {
            var k = key.split(":"), coords2 = new Point3(+k[0], +k[1]);
            coords2.z = +k[2];
            return coords2;
          },
          _removeTile: function(key) {
            var tile = this._tiles[key];
            if (!tile) {
              return;
            }
            remove(tile.el);
            delete this._tiles[key];
            this.fire("tileunload", {
              tile: tile.el,
              coords: this._keyToTileCoords(key)
            });
          },
          _initTile: function(tile) {
            addClass(tile, "leaflet-tile");
            var tileSize = this.getTileSize();
            tile.style.width = tileSize.x + "px";
            tile.style.height = tileSize.y + "px";
            tile.onselectstart = falseFn;
            tile.onmousemove = falseFn;
            if (Browser5.ielt9 && this.options.opacity < 1) {
              setOpacity(tile, this.options.opacity);
            }
          },
          _addTile: function(coords2, container) {
            var tilePos = this._getTilePos(coords2), key = this._tileCoordsToKey(coords2);
            var tile = this.createTile(this._wrapCoords(coords2), bind(this._tileReady, this, coords2));
            this._initTile(tile);
            if (this.createTile.length < 2) {
              requestAnimFrame(bind(this._tileReady, this, coords2, null, tile));
            }
            setPosition(tile, tilePos);
            this._tiles[key] = {
              el: tile,
              coords: coords2,
              current: true
            };
            container.appendChild(tile);
            this.fire("tileloadstart", {
              tile,
              coords: coords2
            });
          },
          _tileReady: function(coords2, err, tile) {
            if (err) {
              this.fire("tileerror", {
                error: err,
                tile,
                coords: coords2
              });
            }
            var key = this._tileCoordsToKey(coords2);
            tile = this._tiles[key];
            if (!tile) {
              return;
            }
            tile.loaded = +new Date();
            if (this._map._fadeAnimated) {
              setOpacity(tile.el, 0);
              cancelAnimFrame(this._fadeFrame);
              this._fadeFrame = requestAnimFrame(this._updateOpacity, this);
            } else {
              tile.active = true;
              this._pruneTiles();
            }
            if (!err) {
              addClass(tile.el, "leaflet-tile-loaded");
              this.fire("tileload", {
                tile: tile.el,
                coords: coords2
              });
            }
            if (this._noTilesToLoad()) {
              this._loading = false;
              this.fire("load");
              if (Browser5.ielt9 || !this._map._fadeAnimated) {
                requestAnimFrame(this._pruneTiles, this);
              } else {
                setTimeout(bind(this._pruneTiles, this), 250);
              }
            }
          },
          _getTilePos: function(coords2) {
            return coords2.scaleBy(this.getTileSize()).subtract(this._level.origin);
          },
          _wrapCoords: function(coords2) {
            var newCoords = new Point3(
              this._wrapX ? wrapNum(coords2.x, this._wrapX) : coords2.x,
              this._wrapY ? wrapNum(coords2.y, this._wrapY) : coords2.y
            );
            newCoords.z = coords2.z;
            return newCoords;
          },
          _pxBoundsToTileRange: function(bounds3) {
            var tileSize = this.getTileSize();
            return new Bounds2(
              bounds3.min.unscaleBy(tileSize).floor(),
              bounds3.max.unscaleBy(tileSize).ceil().subtract([1, 1])
            );
          },
          _noTilesToLoad: function() {
            for (var key in this._tiles) {
              if (!this._tiles[key].loaded) {
                return false;
              }
            }
            return true;
          }
        });
        function gridLayer(options) {
          return new GridLayer(options);
        }
        var TileLayer2 = GridLayer.extend({
          options: {
            minZoom: 0,
            maxZoom: 18,
            subdomains: "abc",
            errorTileUrl: "",
            zoomOffset: 0,
            tms: false,
            zoomReverse: false,
            detectRetina: false,
            crossOrigin: false,
            referrerPolicy: false
          },
          initialize: function(url, options) {
            this._url = url;
            options = setOptions(this, options);
            if (options.detectRetina && Browser5.retina && options.maxZoom > 0) {
              options.tileSize = Math.floor(options.tileSize / 2);
              if (!options.zoomReverse) {
                options.zoomOffset++;
                options.maxZoom = Math.max(options.minZoom, options.maxZoom - 1);
              } else {
                options.zoomOffset--;
                options.minZoom = Math.min(options.maxZoom, options.minZoom + 1);
              }
              options.minZoom = Math.max(0, options.minZoom);
            } else if (!options.zoomReverse) {
              options.maxZoom = Math.max(options.minZoom, options.maxZoom);
            } else {
              options.minZoom = Math.min(options.maxZoom, options.minZoom);
            }
            if (typeof options.subdomains === "string") {
              options.subdomains = options.subdomains.split("");
            }
            this.on("tileunload", this._onTileRemove);
          },
          setUrl: function(url, noRedraw) {
            if (this._url === url && noRedraw === void 0) {
              noRedraw = true;
            }
            this._url = url;
            if (!noRedraw) {
              this.redraw();
            }
            return this;
          },
          createTile: function(coords2, done) {
            var tile = document.createElement("img");
            on(tile, "load", bind(this._tileOnLoad, this, done, tile));
            on(tile, "error", bind(this._tileOnError, this, done, tile));
            if (this.options.crossOrigin || this.options.crossOrigin === "") {
              tile.crossOrigin = this.options.crossOrigin === true ? "" : this.options.crossOrigin;
            }
            if (typeof this.options.referrerPolicy === "string") {
              tile.referrerPolicy = this.options.referrerPolicy;
            }
            tile.alt = "";
            tile.src = this.getTileUrl(coords2);
            return tile;
          },
          getTileUrl: function(coords2) {
            var data = {
              r: Browser5.retina ? "@2x" : "",
              s: this._getSubdomain(coords2),
              x: coords2.x,
              y: coords2.y,
              z: this._getZoomForUrl()
            };
            if (this._map && !this._map.options.crs.infinite) {
              var invertedY = this._globalTileRange.max.y - coords2.y;
              if (this.options.tms) {
                data["y"] = invertedY;
              }
              data["-y"] = invertedY;
            }
            return template2(this._url, extend16(data, this.options));
          },
          _tileOnLoad: function(done, tile) {
            if (Browser5.ielt9) {
              setTimeout(bind(done, this, null, tile), 0);
            } else {
              done(null, tile);
            }
          },
          _tileOnError: function(done, tile, e) {
            var errorUrl = this.options.errorTileUrl;
            if (errorUrl && tile.getAttribute("src") !== errorUrl) {
              tile.src = errorUrl;
            }
            done(e, tile);
          },
          _onTileRemove: function(e) {
            e.tile.onload = null;
          },
          _getZoomForUrl: function() {
            var zoom2 = this._tileZoom, maxZoom = this.options.maxZoom, zoomReverse = this.options.zoomReverse, zoomOffset = this.options.zoomOffset;
            if (zoomReverse) {
              zoom2 = maxZoom - zoom2;
            }
            return zoom2 + zoomOffset;
          },
          _getSubdomain: function(tilePoint) {
            var index2 = Math.abs(tilePoint.x + tilePoint.y) % this.options.subdomains.length;
            return this.options.subdomains[index2];
          },
          _abortLoading: function() {
            var i, tile;
            for (i in this._tiles) {
              if (this._tiles[i].coords.z !== this._tileZoom) {
                tile = this._tiles[i].el;
                tile.onload = falseFn;
                tile.onerror = falseFn;
                if (!tile.complete) {
                  tile.src = emptyImageUrl;
                  var coords2 = this._tiles[i].coords;
                  remove(tile);
                  delete this._tiles[i];
                  this.fire("tileabort", {
                    tile,
                    coords: coords2
                  });
                }
              }
            }
          },
          _removeTile: function(key) {
            var tile = this._tiles[key];
            if (!tile) {
              return;
            }
            tile.el.setAttribute("src", emptyImageUrl);
            return GridLayer.prototype._removeTile.call(this, key);
          },
          _tileReady: function(coords2, err, tile) {
            if (!this._map || tile && tile.getAttribute("src") === emptyImageUrl) {
              return;
            }
            return GridLayer.prototype._tileReady.call(this, coords2, err, tile);
          }
        });
        function tileLayer(url, options) {
          return new TileLayer2(url, options);
        }
        var TileLayerWMS = TileLayer2.extend({
          defaultWmsParams: {
            service: "WMS",
            request: "GetMap",
            layers: "",
            styles: "",
            format: "image/jpeg",
            transparent: false,
            version: "1.1.1"
          },
          options: {
            crs: null,
            uppercase: false
          },
          initialize: function(url, options) {
            this._url = url;
            var wmsParams = extend16({}, this.defaultWmsParams);
            for (var i in options) {
              if (!(i in this.options)) {
                wmsParams[i] = options[i];
              }
            }
            options = setOptions(this, options);
            var realRetina = options.detectRetina && Browser5.retina ? 2 : 1;
            var tileSize = this.getTileSize();
            wmsParams.width = tileSize.x * realRetina;
            wmsParams.height = tileSize.y * realRetina;
            this.wmsParams = wmsParams;
          },
          onAdd: function(map) {
            this._crs = this.options.crs || map.options.crs;
            this._wmsVersion = parseFloat(this.wmsParams.version);
            var projectionKey = this._wmsVersion >= 1.3 ? "crs" : "srs";
            this.wmsParams[projectionKey] = this._crs.code;
            TileLayer2.prototype.onAdd.call(this, map);
          },
          getTileUrl: function(coords2) {
            var tileBounds = this._tileCoordsToNwSe(coords2), crs = this._crs, bounds3 = toBounds(crs.project(tileBounds[0]), crs.project(tileBounds[1])), min = bounds3.min, max = bounds3.max, bbox = (this._wmsVersion >= 1.3 && this._crs === EPSG4326 ? [min.y, min.x, max.y, max.x] : [min.x, min.y, max.x, max.y]).join(","), url = TileLayer2.prototype.getTileUrl.call(this, coords2);
            return url + getParamString(this.wmsParams, url, this.options.uppercase) + (this.options.uppercase ? "&BBOX=" : "&bbox=") + bbox;
          },
          setParams: function(params, noRedraw) {
            extend16(this.wmsParams, params);
            if (!noRedraw) {
              this.redraw();
            }
            return this;
          }
        });
        function tileLayerWMS(url, options) {
          return new TileLayerWMS(url, options);
        }
        TileLayer2.WMS = TileLayerWMS;
        tileLayer.wms = tileLayerWMS;
        var Renderer = Layer.extend({
          options: {
            padding: 0.1
          },
          initialize: function(options) {
            setOptions(this, options);
            stamp2(this);
            this._layers = this._layers || {};
          },
          onAdd: function() {
            if (!this._container) {
              this._initContainer();
              if (this._zoomAnimated) {
                addClass(this._container, "leaflet-zoom-animated");
              }
            }
            this.getPane().appendChild(this._container);
            this._update();
            this.on("update", this._updatePaths, this);
          },
          onRemove: function() {
            this.off("update", this._updatePaths, this);
            this._destroyContainer();
          },
          getEvents: function() {
            var events = {
              viewreset: this._reset,
              zoom: this._onZoom,
              moveend: this._update,
              zoomend: this._onZoomEnd
            };
            if (this._zoomAnimated) {
              events.zoomanim = this._onAnimZoom;
            }
            return events;
          },
          _onAnimZoom: function(ev) {
            this._updateTransform(ev.center, ev.zoom);
          },
          _onZoom: function() {
            this._updateTransform(this._map.getCenter(), this._map.getZoom());
          },
          _updateTransform: function(center, zoom2) {
            var scale3 = this._map.getZoomScale(zoom2, this._zoom), viewHalf = this._map.getSize().multiplyBy(0.5 + this.options.padding), currentCenterPoint = this._map.project(this._center, zoom2), topLeftOffset = viewHalf.multiplyBy(-scale3).add(currentCenterPoint).subtract(this._map._getNewPixelOrigin(center, zoom2));
            if (Browser5.any3d) {
              setTransform(this._container, topLeftOffset, scale3);
            } else {
              setPosition(this._container, topLeftOffset);
            }
          },
          _reset: function() {
            this._update();
            this._updateTransform(this._center, this._zoom);
            for (var id in this._layers) {
              this._layers[id]._reset();
            }
          },
          _onZoomEnd: function() {
            for (var id in this._layers) {
              this._layers[id]._project();
            }
          },
          _updatePaths: function() {
            for (var id in this._layers) {
              this._layers[id]._update();
            }
          },
          _update: function() {
            var p = this.options.padding, size = this._map.getSize(), min = this._map.containerPointToLayerPoint(size.multiplyBy(-p)).round();
            this._bounds = new Bounds2(min, min.add(size.multiplyBy(1 + p * 2)).round());
            this._center = this._map.getCenter();
            this._zoom = this._map.getZoom();
          }
        });
        var Canvas2 = Renderer.extend({
          options: {
            tolerance: 0
          },
          getEvents: function() {
            var events = Renderer.prototype.getEvents.call(this);
            events.viewprereset = this._onViewPreReset;
            return events;
          },
          _onViewPreReset: function() {
            this._postponeUpdatePaths = true;
          },
          onAdd: function() {
            Renderer.prototype.onAdd.call(this);
            this._draw();
          },
          _initContainer: function() {
            var container = this._container = document.createElement("canvas");
            on(container, "mousemove", this._onMouseMove, this);
            on(container, "click dblclick mousedown mouseup contextmenu", this._onClick, this);
            on(container, "mouseout", this._handleMouseOut, this);
            container["_leaflet_disable_events"] = true;
            this._ctx = container.getContext("2d");
          },
          _destroyContainer: function() {
            cancelAnimFrame(this._redrawRequest);
            delete this._ctx;
            remove(this._container);
            off(this._container);
            delete this._container;
          },
          _updatePaths: function() {
            if (this._postponeUpdatePaths) {
              return;
            }
            var layer;
            this._redrawBounds = null;
            for (var id in this._layers) {
              layer = this._layers[id];
              layer._update();
            }
            this._redraw();
          },
          _update: function() {
            if (this._map._animatingZoom && this._bounds) {
              return;
            }
            Renderer.prototype._update.call(this);
            var b = this._bounds, container = this._container, size = b.getSize(), m = Browser5.retina ? 2 : 1;
            setPosition(container, b.min);
            container.width = m * size.x;
            container.height = m * size.y;
            container.style.width = size.x + "px";
            container.style.height = size.y + "px";
            if (Browser5.retina) {
              this._ctx.scale(2, 2);
            }
            this._ctx.translate(-b.min.x, -b.min.y);
            this.fire("update");
          },
          _reset: function() {
            Renderer.prototype._reset.call(this);
            if (this._postponeUpdatePaths) {
              this._postponeUpdatePaths = false;
              this._updatePaths();
            }
          },
          _initPath: function(layer) {
            this._updateDashArray(layer);
            this._layers[stamp2(layer)] = layer;
            var order = layer._order = {
              layer,
              prev: this._drawLast,
              next: null
            };
            if (this._drawLast) {
              this._drawLast.next = order;
            }
            this._drawLast = order;
            this._drawFirst = this._drawFirst || this._drawLast;
          },
          _addPath: function(layer) {
            this._requestRedraw(layer);
          },
          _removePath: function(layer) {
            var order = layer._order;
            var next = order.next;
            var prev = order.prev;
            if (next) {
              next.prev = prev;
            } else {
              this._drawLast = prev;
            }
            if (prev) {
              prev.next = next;
            } else {
              this._drawFirst = next;
            }
            delete layer._order;
            delete this._layers[stamp2(layer)];
            this._requestRedraw(layer);
          },
          _updatePath: function(layer) {
            this._extendRedrawBounds(layer);
            layer._project();
            layer._update();
            this._requestRedraw(layer);
          },
          _updateStyle: function(layer) {
            this._updateDashArray(layer);
            this._requestRedraw(layer);
          },
          _updateDashArray: function(layer) {
            if (typeof layer.options.dashArray === "string") {
              var parts = layer.options.dashArray.split(/[, ]+/), dashArray = [], dashValue, i;
              for (i = 0; i < parts.length; i++) {
                dashValue = Number(parts[i]);
                if (isNaN(dashValue)) {
                  return;
                }
                dashArray.push(dashValue);
              }
              layer.options._dashArray = dashArray;
            } else {
              layer.options._dashArray = layer.options.dashArray;
            }
          },
          _requestRedraw: function(layer) {
            if (!this._map) {
              return;
            }
            this._extendRedrawBounds(layer);
            this._redrawRequest = this._redrawRequest || requestAnimFrame(this._redraw, this);
          },
          _extendRedrawBounds: function(layer) {
            if (layer._pxBounds) {
              var padding = (layer.options.weight || 0) + 1;
              this._redrawBounds = this._redrawBounds || new Bounds2();
              this._redrawBounds.extend(layer._pxBounds.min.subtract([padding, padding]));
              this._redrawBounds.extend(layer._pxBounds.max.add([padding, padding]));
            }
          },
          _redraw: function() {
            this._redrawRequest = null;
            if (this._redrawBounds) {
              this._redrawBounds.min._floor();
              this._redrawBounds.max._ceil();
            }
            this._clear();
            this._draw();
            this._redrawBounds = null;
          },
          _clear: function() {
            var bounds3 = this._redrawBounds;
            if (bounds3) {
              var size = bounds3.getSize();
              this._ctx.clearRect(bounds3.min.x, bounds3.min.y, size.x, size.y);
            } else {
              this._ctx.save();
              this._ctx.setTransform(1, 0, 0, 1, 0, 0);
              this._ctx.clearRect(0, 0, this._container.width, this._container.height);
              this._ctx.restore();
            }
          },
          _draw: function() {
            var layer, bounds3 = this._redrawBounds;
            this._ctx.save();
            if (bounds3) {
              var size = bounds3.getSize();
              this._ctx.beginPath();
              this._ctx.rect(bounds3.min.x, bounds3.min.y, size.x, size.y);
              this._ctx.clip();
            }
            this._drawing = true;
            for (var order = this._drawFirst; order; order = order.next) {
              layer = order.layer;
              if (!bounds3 || layer._pxBounds && layer._pxBounds.intersects(bounds3)) {
                layer._updatePath();
              }
            }
            this._drawing = false;
            this._ctx.restore();
          },
          _updatePoly: function(layer, closed) {
            if (!this._drawing) {
              return;
            }
            var i, j, len2, p, parts = layer._parts, len = parts.length, ctx = this._ctx;
            if (!len) {
              return;
            }
            ctx.beginPath();
            for (i = 0; i < len; i++) {
              for (j = 0, len2 = parts[i].length; j < len2; j++) {
                p = parts[i][j];
                ctx[j ? "lineTo" : "moveTo"](p.x, p.y);
              }
              if (closed) {
                ctx.closePath();
              }
            }
            this._fillStroke(ctx, layer);
          },
          _updateCircle: function(layer) {
            if (!this._drawing || layer._empty()) {
              return;
            }
            var p = layer._point, ctx = this._ctx, r = Math.max(Math.round(layer._radius), 1), s = (Math.max(Math.round(layer._radiusY), 1) || r) / r;
            if (s !== 1) {
              ctx.save();
              ctx.scale(1, s);
            }
            ctx.beginPath();
            ctx.arc(p.x, p.y / s, r, 0, Math.PI * 2, false);
            if (s !== 1) {
              ctx.restore();
            }
            this._fillStroke(ctx, layer);
          },
          _fillStroke: function(ctx, layer) {
            var options = layer.options;
            if (options.fill) {
              ctx.globalAlpha = options.fillOpacity;
              ctx.fillStyle = options.fillColor || options.color;
              ctx.fill(options.fillRule || "evenodd");
            }
            if (options.stroke && options.weight !== 0) {
              if (ctx.setLineDash) {
                ctx.setLineDash(layer.options && layer.options._dashArray || []);
              }
              ctx.globalAlpha = options.opacity;
              ctx.lineWidth = options.weight;
              ctx.strokeStyle = options.color;
              ctx.lineCap = options.lineCap;
              ctx.lineJoin = options.lineJoin;
              ctx.stroke();
            }
          },
          _onClick: function(e) {
            var point7 = this._map.mouseEventToLayerPoint(e), layer, clickedLayer;
            for (var order = this._drawFirst; order; order = order.next) {
              layer = order.layer;
              if (layer.options.interactive && layer._containsPoint(point7)) {
                if (!(e.type === "click" || e.type === "preclick") || !this._map._draggableMoved(layer)) {
                  clickedLayer = layer;
                }
              }
            }
            this._fireEvent(clickedLayer ? [clickedLayer] : false, e);
          },
          _onMouseMove: function(e) {
            if (!this._map || this._map.dragging.moving() || this._map._animatingZoom) {
              return;
            }
            var point7 = this._map.mouseEventToLayerPoint(e);
            this._handleMouseHover(e, point7);
          },
          _handleMouseOut: function(e) {
            var layer = this._hoveredLayer;
            if (layer) {
              removeClass(this._container, "leaflet-interactive");
              this._fireEvent([layer], e, "mouseout");
              this._hoveredLayer = null;
              this._mouseHoverThrottled = false;
            }
          },
          _handleMouseHover: function(e, point7) {
            if (this._mouseHoverThrottled) {
              return;
            }
            var layer, candidateHoveredLayer;
            for (var order = this._drawFirst; order; order = order.next) {
              layer = order.layer;
              if (layer.options.interactive && layer._containsPoint(point7)) {
                candidateHoveredLayer = layer;
              }
            }
            if (candidateHoveredLayer !== this._hoveredLayer) {
              this._handleMouseOut(e);
              if (candidateHoveredLayer) {
                addClass(this._container, "leaflet-interactive");
                this._fireEvent([candidateHoveredLayer], e, "mouseover");
                this._hoveredLayer = candidateHoveredLayer;
              }
            }
            this._fireEvent(this._hoveredLayer ? [this._hoveredLayer] : false, e);
            this._mouseHoverThrottled = true;
            setTimeout(bind(function() {
              this._mouseHoverThrottled = false;
            }, this), 32);
          },
          _fireEvent: function(layers2, e, type) {
            this._map._fireDOMEvent(e, type || e.type, layers2);
          },
          _bringToFront: function(layer) {
            var order = layer._order;
            if (!order) {
              return;
            }
            var next = order.next;
            var prev = order.prev;
            if (next) {
              next.prev = prev;
            } else {
              return;
            }
            if (prev) {
              prev.next = next;
            } else if (next) {
              this._drawFirst = next;
            }
            order.prev = this._drawLast;
            this._drawLast.next = order;
            order.next = null;
            this._drawLast = order;
            this._requestRedraw(layer);
          },
          _bringToBack: function(layer) {
            var order = layer._order;
            if (!order) {
              return;
            }
            var next = order.next;
            var prev = order.prev;
            if (prev) {
              prev.next = next;
            } else {
              return;
            }
            if (next) {
              next.prev = prev;
            } else if (prev) {
              this._drawLast = prev;
            }
            order.prev = null;
            order.next = this._drawFirst;
            this._drawFirst.prev = order;
            this._drawFirst = order;
            this._requestRedraw(layer);
          }
        });
        function canvas(options) {
          return Browser5.canvas ? new Canvas2(options) : null;
        }
        var vmlCreate = function() {
          try {
            document.namespaces.add("lvml", "urn:schemas-microsoft-com:vml");
            return function(name) {
              return document.createElement("<lvml:" + name + ' class="lvml">');
            };
          } catch (e) {
          }
          return function(name) {
            return document.createElement("<" + name + ' xmlns="urn:schemas-microsoft.com:vml" class="lvml">');
          };
        }();
        var vmlMixin = {
          _initContainer: function() {
            this._container = create$1("div", "leaflet-vml-container");
          },
          _update: function() {
            if (this._map._animatingZoom) {
              return;
            }
            Renderer.prototype._update.call(this);
            this.fire("update");
          },
          _initPath: function(layer) {
            var container = layer._container = vmlCreate("shape");
            addClass(container, "leaflet-vml-shape " + (this.options.className || ""));
            container.coordsize = "1 1";
            layer._path = vmlCreate("path");
            container.appendChild(layer._path);
            this._updateStyle(layer);
            this._layers[stamp2(layer)] = layer;
          },
          _addPath: function(layer) {
            var container = layer._container;
            this._container.appendChild(container);
            if (layer.options.interactive) {
              layer.addInteractiveTarget(container);
            }
          },
          _removePath: function(layer) {
            var container = layer._container;
            remove(container);
            layer.removeInteractiveTarget(container);
            delete this._layers[stamp2(layer)];
          },
          _updateStyle: function(layer) {
            var stroke = layer._stroke, fill = layer._fill, options = layer.options, container = layer._container;
            container.stroked = !!options.stroke;
            container.filled = !!options.fill;
            if (options.stroke) {
              if (!stroke) {
                stroke = layer._stroke = vmlCreate("stroke");
              }
              container.appendChild(stroke);
              stroke.weight = options.weight + "px";
              stroke.color = options.color;
              stroke.opacity = options.opacity;
              if (options.dashArray) {
                stroke.dashStyle = isArray(options.dashArray) ? options.dashArray.join(" ") : options.dashArray.replace(/( *, *)/g, " ");
              } else {
                stroke.dashStyle = "";
              }
              stroke.endcap = options.lineCap.replace("butt", "flat");
              stroke.joinstyle = options.lineJoin;
            } else if (stroke) {
              container.removeChild(stroke);
              layer._stroke = null;
            }
            if (options.fill) {
              if (!fill) {
                fill = layer._fill = vmlCreate("fill");
              }
              container.appendChild(fill);
              fill.color = options.fillColor || options.color;
              fill.opacity = options.fillOpacity;
            } else if (fill) {
              container.removeChild(fill);
              layer._fill = null;
            }
          },
          _updateCircle: function(layer) {
            var p = layer._point.round(), r = Math.round(layer._radius), r2 = Math.round(layer._radiusY || r);
            this._setPath(layer, layer._empty() ? "M0 0" : "AL " + p.x + "," + p.y + " " + r + "," + r2 + " 0," + 65535 * 360);
          },
          _setPath: function(layer, path) {
            layer._path.v = path;
          },
          _bringToFront: function(layer) {
            toFront(layer._container);
          },
          _bringToBack: function(layer) {
            toBack(layer._container);
          }
        };
        var create = Browser5.vml ? vmlCreate : svgCreate;
        var SVG2 = Renderer.extend({
          _initContainer: function() {
            this._container = create("svg");
            this._container.setAttribute("pointer-events", "none");
            this._rootGroup = create("g");
            this._container.appendChild(this._rootGroup);
          },
          _destroyContainer: function() {
            remove(this._container);
            off(this._container);
            delete this._container;
            delete this._rootGroup;
            delete this._svgSize;
          },
          _update: function() {
            if (this._map._animatingZoom && this._bounds) {
              return;
            }
            Renderer.prototype._update.call(this);
            var b = this._bounds, size = b.getSize(), container = this._container;
            if (!this._svgSize || !this._svgSize.equals(size)) {
              this._svgSize = size;
              container.setAttribute("width", size.x);
              container.setAttribute("height", size.y);
            }
            setPosition(container, b.min);
            container.setAttribute("viewBox", [b.min.x, b.min.y, size.x, size.y].join(" "));
            this.fire("update");
          },
          _initPath: function(layer) {
            var path = layer._path = create("path");
            if (layer.options.className) {
              addClass(path, layer.options.className);
            }
            if (layer.options.interactive) {
              addClass(path, "leaflet-interactive");
            }
            this._updateStyle(layer);
            this._layers[stamp2(layer)] = layer;
          },
          _addPath: function(layer) {
            if (!this._rootGroup) {
              this._initContainer();
            }
            this._rootGroup.appendChild(layer._path);
            layer.addInteractiveTarget(layer._path);
          },
          _removePath: function(layer) {
            remove(layer._path);
            layer.removeInteractiveTarget(layer._path);
            delete this._layers[stamp2(layer)];
          },
          _updatePath: function(layer) {
            layer._project();
            layer._update();
          },
          _updateStyle: function(layer) {
            var path = layer._path, options = layer.options;
            if (!path) {
              return;
            }
            if (options.stroke) {
              path.setAttribute("stroke", options.color);
              path.setAttribute("stroke-opacity", options.opacity);
              path.setAttribute("stroke-width", options.weight);
              path.setAttribute("stroke-linecap", options.lineCap);
              path.setAttribute("stroke-linejoin", options.lineJoin);
              if (options.dashArray) {
                path.setAttribute("stroke-dasharray", options.dashArray);
              } else {
                path.removeAttribute("stroke-dasharray");
              }
              if (options.dashOffset) {
                path.setAttribute("stroke-dashoffset", options.dashOffset);
              } else {
                path.removeAttribute("stroke-dashoffset");
              }
            } else {
              path.setAttribute("stroke", "none");
            }
            if (options.fill) {
              path.setAttribute("fill", options.fillColor || options.color);
              path.setAttribute("fill-opacity", options.fillOpacity);
              path.setAttribute("fill-rule", options.fillRule || "evenodd");
            } else {
              path.setAttribute("fill", "none");
            }
          },
          _updatePoly: function(layer, closed) {
            this._setPath(layer, pointsToPath(layer._parts, closed));
          },
          _updateCircle: function(layer) {
            var p = layer._point, r = Math.max(Math.round(layer._radius), 1), r2 = Math.max(Math.round(layer._radiusY), 1) || r, arc = "a" + r + "," + r2 + " 0 1,0 ";
            var d = layer._empty() ? "M0 0" : "M" + (p.x - r) + "," + p.y + arc + r * 2 + ",0 " + arc + -r * 2 + ",0 ";
            this._setPath(layer, d);
          },
          _setPath: function(layer, path) {
            layer._path.setAttribute("d", path);
          },
          _bringToFront: function(layer) {
            toFront(layer._path);
          },
          _bringToBack: function(layer) {
            toBack(layer._path);
          }
        });
        if (Browser5.vml) {
          SVG2.include(vmlMixin);
        }
        function svg(options) {
          return Browser5.svg || Browser5.vml ? new SVG2(options) : null;
        }
        Map4.include({
          getRenderer: function(layer) {
            var renderer = layer.options.renderer || this._getPaneRenderer(layer.options.pane) || this.options.renderer || this._renderer;
            if (!renderer) {
              renderer = this._renderer = this._createRenderer();
            }
            if (!this.hasLayer(renderer)) {
              this.addLayer(renderer);
            }
            return renderer;
          },
          _getPaneRenderer: function(name) {
            if (name === "overlayPane" || name === void 0) {
              return false;
            }
            var renderer = this._paneRenderers[name];
            if (renderer === void 0) {
              renderer = this._createRenderer({ pane: name });
              this._paneRenderers[name] = renderer;
            }
            return renderer;
          },
          _createRenderer: function(options) {
            return this.options.preferCanvas && canvas(options) || svg(options);
          }
        });
        var Rectangle = Polygon.extend({
          initialize: function(latLngBounds2, options) {
            Polygon.prototype.initialize.call(this, this._boundsToLatLngs(latLngBounds2), options);
          },
          setBounds: function(latLngBounds2) {
            return this.setLatLngs(this._boundsToLatLngs(latLngBounds2));
          },
          _boundsToLatLngs: function(latLngBounds2) {
            latLngBounds2 = toLatLngBounds(latLngBounds2);
            return [
              latLngBounds2.getSouthWest(),
              latLngBounds2.getNorthWest(),
              latLngBounds2.getNorthEast(),
              latLngBounds2.getSouthEast()
            ];
          }
        });
        function rectangle2(latLngBounds2, options) {
          return new Rectangle(latLngBounds2, options);
        }
        SVG2.create = create;
        SVG2.pointsToPath = pointsToPath;
        GeoJSON.geometryToLayer = geometryToLayer;
        GeoJSON.coordsToLatLng = coordsToLatLng;
        GeoJSON.coordsToLatLngs = coordsToLatLngs;
        GeoJSON.latLngToCoords = latLngToCoords;
        GeoJSON.latLngsToCoords = latLngsToCoords;
        GeoJSON.getFeature = getFeature;
        GeoJSON.asFeature = asFeature;
        Map4.mergeOptions({
          boxZoom: true
        });
        var BoxZoom = Handler.extend({
          initialize: function(map) {
            this._map = map;
            this._container = map._container;
            this._pane = map._panes.overlayPane;
            this._resetStateTimeout = 0;
            map.on("unload", this._destroy, this);
          },
          addHooks: function() {
            on(this._container, "mousedown", this._onMouseDown, this);
          },
          removeHooks: function() {
            off(this._container, "mousedown", this._onMouseDown, this);
          },
          moved: function() {
            return this._moved;
          },
          _destroy: function() {
            remove(this._pane);
            delete this._pane;
          },
          _resetState: function() {
            this._resetStateTimeout = 0;
            this._moved = false;
          },
          _clearDeferredResetState: function() {
            if (this._resetStateTimeout !== 0) {
              clearTimeout(this._resetStateTimeout);
              this._resetStateTimeout = 0;
            }
          },
          _onMouseDown: function(e) {
            if (!e.shiftKey || e.which !== 1 && e.button !== 1) {
              return false;
            }
            this._clearDeferredResetState();
            this._resetState();
            disableTextSelection();
            disableImageDrag();
            this._startPoint = this._map.mouseEventToContainerPoint(e);
            on(document, {
              contextmenu: stop,
              mousemove: this._onMouseMove,
              mouseup: this._onMouseUp,
              keydown: this._onKeyDown
            }, this);
          },
          _onMouseMove: function(e) {
            if (!this._moved) {
              this._moved = true;
              this._box = create$1("div", "leaflet-zoom-box", this._container);
              addClass(this._container, "leaflet-crosshair");
              this._map.fire("boxzoomstart");
            }
            this._point = this._map.mouseEventToContainerPoint(e);
            var bounds3 = new Bounds2(this._point, this._startPoint), size = bounds3.getSize();
            setPosition(this._box, bounds3.min);
            this._box.style.width = size.x + "px";
            this._box.style.height = size.y + "px";
          },
          _finish: function() {
            if (this._moved) {
              remove(this._box);
              removeClass(this._container, "leaflet-crosshair");
            }
            enableTextSelection();
            enableImageDrag();
            off(document, {
              contextmenu: stop,
              mousemove: this._onMouseMove,
              mouseup: this._onMouseUp,
              keydown: this._onKeyDown
            }, this);
          },
          _onMouseUp: function(e) {
            if (e.which !== 1 && e.button !== 1) {
              return;
            }
            this._finish();
            if (!this._moved) {
              return;
            }
            this._clearDeferredResetState();
            this._resetStateTimeout = setTimeout(bind(this._resetState, this), 0);
            var bounds3 = new LatLngBounds3(
              this._map.containerPointToLatLng(this._startPoint),
              this._map.containerPointToLatLng(this._point)
            );
            this._map.fitBounds(bounds3).fire("boxzoomend", { boxZoomBounds: bounds3 });
          },
          _onKeyDown: function(e) {
            if (e.keyCode === 27) {
              this._finish();
              this._clearDeferredResetState();
              this._resetState();
            }
          }
        });
        Map4.addInitHook("addHandler", "boxZoom", BoxZoom);
        Map4.mergeOptions({
          doubleClickZoom: true
        });
        var DoubleClickZoom = Handler.extend({
          addHooks: function() {
            this._map.on("dblclick", this._onDoubleClick, this);
          },
          removeHooks: function() {
            this._map.off("dblclick", this._onDoubleClick, this);
          },
          _onDoubleClick: function(e) {
            var map = this._map, oldZoom = map.getZoom(), delta = map.options.zoomDelta, zoom2 = e.originalEvent.shiftKey ? oldZoom - delta : oldZoom + delta;
            if (map.options.doubleClickZoom === "center") {
              map.setZoom(zoom2);
            } else {
              map.setZoomAround(e.containerPoint, zoom2);
            }
          }
        });
        Map4.addInitHook("addHandler", "doubleClickZoom", DoubleClickZoom);
        Map4.mergeOptions({
          dragging: true,
          inertia: true,
          inertiaDeceleration: 3400,
          inertiaMaxSpeed: Infinity,
          easeLinearity: 0.2,
          worldCopyJump: false,
          maxBoundsViscosity: 0
        });
        var Drag = Handler.extend({
          addHooks: function() {
            if (!this._draggable) {
              var map = this._map;
              this._draggable = new Draggable(map._mapPane, map._container);
              this._draggable.on({
                dragstart: this._onDragStart,
                drag: this._onDrag,
                dragend: this._onDragEnd
              }, this);
              this._draggable.on("predrag", this._onPreDragLimit, this);
              if (map.options.worldCopyJump) {
                this._draggable.on("predrag", this._onPreDragWrap, this);
                map.on("zoomend", this._onZoomEnd, this);
                map.whenReady(this._onZoomEnd, this);
              }
            }
            addClass(this._map._container, "leaflet-grab leaflet-touch-drag");
            this._draggable.enable();
            this._positions = [];
            this._times = [];
          },
          removeHooks: function() {
            removeClass(this._map._container, "leaflet-grab");
            removeClass(this._map._container, "leaflet-touch-drag");
            this._draggable.disable();
          },
          moved: function() {
            return this._draggable && this._draggable._moved;
          },
          moving: function() {
            return this._draggable && this._draggable._moving;
          },
          _onDragStart: function() {
            var map = this._map;
            map._stop();
            if (this._map.options.maxBounds && this._map.options.maxBoundsViscosity) {
              var bounds3 = toLatLngBounds(this._map.options.maxBounds);
              this._offsetLimit = toBounds(
                this._map.latLngToContainerPoint(bounds3.getNorthWest()).multiplyBy(-1),
                this._map.latLngToContainerPoint(bounds3.getSouthEast()).multiplyBy(-1).add(this._map.getSize())
              );
              this._viscosity = Math.min(1, Math.max(0, this._map.options.maxBoundsViscosity));
            } else {
              this._offsetLimit = null;
            }
            map.fire("movestart").fire("dragstart");
            if (map.options.inertia) {
              this._positions = [];
              this._times = [];
            }
          },
          _onDrag: function(e) {
            if (this._map.options.inertia) {
              var time = this._lastTime = +new Date(), pos = this._lastPos = this._draggable._absPos || this._draggable._newPos;
              this._positions.push(pos);
              this._times.push(time);
              this._prunePositions(time);
            }
            this._map.fire("move", e).fire("drag", e);
          },
          _prunePositions: function(time) {
            while (this._positions.length > 1 && time - this._times[0] > 50) {
              this._positions.shift();
              this._times.shift();
            }
          },
          _onZoomEnd: function() {
            var pxCenter = this._map.getSize().divideBy(2), pxWorldCenter = this._map.latLngToLayerPoint([0, 0]);
            this._initialWorldOffset = pxWorldCenter.subtract(pxCenter).x;
            this._worldWidth = this._map.getPixelWorldBounds().getSize().x;
          },
          _viscousLimit: function(value, threshold) {
            return value - (value - threshold) * this._viscosity;
          },
          _onPreDragLimit: function() {
            if (!this._viscosity || !this._offsetLimit) {
              return;
            }
            var offset = this._draggable._newPos.subtract(this._draggable._startPos);
            var limit = this._offsetLimit;
            if (offset.x < limit.min.x) {
              offset.x = this._viscousLimit(offset.x, limit.min.x);
            }
            if (offset.y < limit.min.y) {
              offset.y = this._viscousLimit(offset.y, limit.min.y);
            }
            if (offset.x > limit.max.x) {
              offset.x = this._viscousLimit(offset.x, limit.max.x);
            }
            if (offset.y > limit.max.y) {
              offset.y = this._viscousLimit(offset.y, limit.max.y);
            }
            this._draggable._newPos = this._draggable._startPos.add(offset);
          },
          _onPreDragWrap: function() {
            var worldWidth = this._worldWidth, halfWidth = Math.round(worldWidth / 2), dx = this._initialWorldOffset, x = this._draggable._newPos.x, newX1 = (x - halfWidth + dx) % worldWidth + halfWidth - dx, newX2 = (x + halfWidth + dx) % worldWidth - halfWidth - dx, newX = Math.abs(newX1 + dx) < Math.abs(newX2 + dx) ? newX1 : newX2;
            this._draggable._absPos = this._draggable._newPos.clone();
            this._draggable._newPos.x = newX;
          },
          _onDragEnd: function(e) {
            var map = this._map, options = map.options, noInertia = !options.inertia || e.noInertia || this._times.length < 2;
            map.fire("dragend", e);
            if (noInertia) {
              map.fire("moveend");
            } else {
              this._prunePositions(+new Date());
              var direction = this._lastPos.subtract(this._positions[0]), duration = (this._lastTime - this._times[0]) / 1e3, ease = options.easeLinearity, speedVector = direction.multiplyBy(ease / duration), speed = speedVector.distanceTo([0, 0]), limitedSpeed = Math.min(options.inertiaMaxSpeed, speed), limitedSpeedVector = speedVector.multiplyBy(limitedSpeed / speed), decelerationDuration = limitedSpeed / (options.inertiaDeceleration * ease), offset = limitedSpeedVector.multiplyBy(-decelerationDuration / 2).round();
              if (!offset.x && !offset.y) {
                map.fire("moveend");
              } else {
                offset = map._limitOffset(offset, map.options.maxBounds);
                requestAnimFrame(function() {
                  map.panBy(offset, {
                    duration: decelerationDuration,
                    easeLinearity: ease,
                    noMoveStart: true,
                    animate: true
                  });
                });
              }
            }
          }
        });
        Map4.addInitHook("addHandler", "dragging", Drag);
        Map4.mergeOptions({
          keyboard: true,
          keyboardPanDelta: 80
        });
        var Keyboard = Handler.extend({
          keyCodes: {
            left: [37],
            right: [39],
            down: [40],
            up: [38],
            zoomIn: [187, 107, 61, 171],
            zoomOut: [189, 109, 54, 173]
          },
          initialize: function(map) {
            this._map = map;
            this._setPanDelta(map.options.keyboardPanDelta);
            this._setZoomDelta(map.options.zoomDelta);
          },
          addHooks: function() {
            var container = this._map._container;
            if (container.tabIndex <= 0) {
              container.tabIndex = "0";
            }
            on(container, {
              focus: this._onFocus,
              blur: this._onBlur,
              mousedown: this._onMouseDown
            }, this);
            this._map.on({
              focus: this._addHooks,
              blur: this._removeHooks
            }, this);
          },
          removeHooks: function() {
            this._removeHooks();
            off(this._map._container, {
              focus: this._onFocus,
              blur: this._onBlur,
              mousedown: this._onMouseDown
            }, this);
            this._map.off({
              focus: this._addHooks,
              blur: this._removeHooks
            }, this);
          },
          _onMouseDown: function() {
            if (this._focused) {
              return;
            }
            var body = document.body, docEl = document.documentElement, top = body.scrollTop || docEl.scrollTop, left = body.scrollLeft || docEl.scrollLeft;
            this._map._container.focus();
            window.scrollTo(left, top);
          },
          _onFocus: function() {
            this._focused = true;
            this._map.fire("focus");
          },
          _onBlur: function() {
            this._focused = false;
            this._map.fire("blur");
          },
          _setPanDelta: function(panDelta) {
            var keys = this._panKeys = {}, codes = this.keyCodes, i, len;
            for (i = 0, len = codes.left.length; i < len; i++) {
              keys[codes.left[i]] = [-1 * panDelta, 0];
            }
            for (i = 0, len = codes.right.length; i < len; i++) {
              keys[codes.right[i]] = [panDelta, 0];
            }
            for (i = 0, len = codes.down.length; i < len; i++) {
              keys[codes.down[i]] = [0, panDelta];
            }
            for (i = 0, len = codes.up.length; i < len; i++) {
              keys[codes.up[i]] = [0, -1 * panDelta];
            }
          },
          _setZoomDelta: function(zoomDelta) {
            var keys = this._zoomKeys = {}, codes = this.keyCodes, i, len;
            for (i = 0, len = codes.zoomIn.length; i < len; i++) {
              keys[codes.zoomIn[i]] = zoomDelta;
            }
            for (i = 0, len = codes.zoomOut.length; i < len; i++) {
              keys[codes.zoomOut[i]] = -zoomDelta;
            }
          },
          _addHooks: function() {
            on(document, "keydown", this._onKeyDown, this);
          },
          _removeHooks: function() {
            off(document, "keydown", this._onKeyDown, this);
          },
          _onKeyDown: function(e) {
            if (e.altKey || e.ctrlKey || e.metaKey) {
              return;
            }
            var key = e.keyCode, map = this._map, offset;
            if (key in this._panKeys) {
              if (!map._panAnim || !map._panAnim._inProgress) {
                offset = this._panKeys[key];
                if (e.shiftKey) {
                  offset = toPoint(offset).multiplyBy(3);
                }
                if (map.options.maxBounds) {
                  offset = map._limitOffset(toPoint(offset), map.options.maxBounds);
                }
                if (map.options.worldCopyJump) {
                  var newLatLng = map.wrapLatLng(map.unproject(map.project(map.getCenter()).add(offset)));
                  map.panTo(newLatLng);
                } else {
                  map.panBy(offset);
                }
              }
            } else if (key in this._zoomKeys) {
              map.setZoom(map.getZoom() + (e.shiftKey ? 3 : 1) * this._zoomKeys[key]);
            } else if (key === 27 && map._popup && map._popup.options.closeOnEscapeKey) {
              map.closePopup();
            } else {
              return;
            }
            stop(e);
          }
        });
        Map4.addInitHook("addHandler", "keyboard", Keyboard);
        Map4.mergeOptions({
          scrollWheelZoom: true,
          wheelDebounceTime: 40,
          wheelPxPerZoomLevel: 60
        });
        var ScrollWheelZoom = Handler.extend({
          addHooks: function() {
            on(this._map._container, "wheel", this._onWheelScroll, this);
            this._delta = 0;
          },
          removeHooks: function() {
            off(this._map._container, "wheel", this._onWheelScroll, this);
          },
          _onWheelScroll: function(e) {
            var delta = getWheelDelta(e);
            var debounce = this._map.options.wheelDebounceTime;
            this._delta += delta;
            this._lastMousePos = this._map.mouseEventToContainerPoint(e);
            if (!this._startTime) {
              this._startTime = +new Date();
            }
            var left = Math.max(debounce - (+new Date() - this._startTime), 0);
            clearTimeout(this._timer);
            this._timer = setTimeout(bind(this._performZoom, this), left);
            stop(e);
          },
          _performZoom: function() {
            var map = this._map, zoom2 = map.getZoom(), snap = this._map.options.zoomSnap || 0;
            map._stop();
            var d2 = this._delta / (this._map.options.wheelPxPerZoomLevel * 4), d3 = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(d2)))) / Math.LN2, d4 = snap ? Math.ceil(d3 / snap) * snap : d3, delta = map._limitZoom(zoom2 + (this._delta > 0 ? d4 : -d4)) - zoom2;
            this._delta = 0;
            this._startTime = null;
            if (!delta) {
              return;
            }
            if (map.options.scrollWheelZoom === "center") {
              map.setZoom(zoom2 + delta);
            } else {
              map.setZoomAround(this._lastMousePos, zoom2 + delta);
            }
          }
        });
        Map4.addInitHook("addHandler", "scrollWheelZoom", ScrollWheelZoom);
        var tapHoldDelay = 600;
        Map4.mergeOptions({
          tapHold: Browser5.touchNative && Browser5.safari && Browser5.mobile,
          tapTolerance: 15
        });
        var TapHold = Handler.extend({
          addHooks: function() {
            on(this._map._container, "touchstart", this._onDown, this);
          },
          removeHooks: function() {
            off(this._map._container, "touchstart", this._onDown, this);
          },
          _onDown: function(e) {
            clearTimeout(this._holdTimeout);
            if (e.touches.length !== 1) {
              return;
            }
            var first = e.touches[0];
            this._startPos = this._newPos = new Point3(first.clientX, first.clientY);
            this._holdTimeout = setTimeout(bind(function() {
              this._cancel();
              if (!this._isTapValid()) {
                return;
              }
              on(document, "touchend", preventDefault);
              on(document, "touchend touchcancel", this._cancelClickPrevent);
              this._simulateEvent("contextmenu", first);
            }, this), tapHoldDelay);
            on(document, "touchend touchcancel contextmenu", this._cancel, this);
            on(document, "touchmove", this._onMove, this);
          },
          _cancelClickPrevent: function cancelClickPrevent() {
            off(document, "touchend", preventDefault);
            off(document, "touchend touchcancel", cancelClickPrevent);
          },
          _cancel: function() {
            clearTimeout(this._holdTimeout);
            off(document, "touchend touchcancel contextmenu", this._cancel, this);
            off(document, "touchmove", this._onMove, this);
          },
          _onMove: function(e) {
            var first = e.touches[0];
            this._newPos = new Point3(first.clientX, first.clientY);
          },
          _isTapValid: function() {
            return this._newPos.distanceTo(this._startPos) <= this._map.options.tapTolerance;
          },
          _simulateEvent: function(type, e) {
            var simulatedEvent = new MouseEvent(type, {
              bubbles: true,
              cancelable: true,
              view: window,
              screenX: e.screenX,
              screenY: e.screenY,
              clientX: e.clientX,
              clientY: e.clientY
            });
            simulatedEvent._simulated = true;
            e.target.dispatchEvent(simulatedEvent);
          }
        });
        Map4.addInitHook("addHandler", "tapHold", TapHold);
        Map4.mergeOptions({
          touchZoom: Browser5.touch,
          bounceAtZoomLimits: true
        });
        var TouchZoom = Handler.extend({
          addHooks: function() {
            addClass(this._map._container, "leaflet-touch-zoom");
            on(this._map._container, "touchstart", this._onTouchStart, this);
          },
          removeHooks: function() {
            removeClass(this._map._container, "leaflet-touch-zoom");
            off(this._map._container, "touchstart", this._onTouchStart, this);
          },
          _onTouchStart: function(e) {
            var map = this._map;
            if (!e.touches || e.touches.length !== 2 || map._animatingZoom || this._zooming) {
              return;
            }
            var p1 = map.mouseEventToContainerPoint(e.touches[0]), p2 = map.mouseEventToContainerPoint(e.touches[1]);
            this._centerPoint = map.getSize()._divideBy(2);
            this._startLatLng = map.containerPointToLatLng(this._centerPoint);
            if (map.options.touchZoom !== "center") {
              this._pinchStartLatLng = map.containerPointToLatLng(p1.add(p2)._divideBy(2));
            }
            this._startDist = p1.distanceTo(p2);
            this._startZoom = map.getZoom();
            this._moved = false;
            this._zooming = true;
            map._stop();
            on(document, "touchmove", this._onTouchMove, this);
            on(document, "touchend touchcancel", this._onTouchEnd, this);
            preventDefault(e);
          },
          _onTouchMove: function(e) {
            if (!e.touches || e.touches.length !== 2 || !this._zooming) {
              return;
            }
            var map = this._map, p1 = map.mouseEventToContainerPoint(e.touches[0]), p2 = map.mouseEventToContainerPoint(e.touches[1]), scale3 = p1.distanceTo(p2) / this._startDist;
            this._zoom = map.getScaleZoom(scale3, this._startZoom);
            if (!map.options.bounceAtZoomLimits && (this._zoom < map.getMinZoom() && scale3 < 1 || this._zoom > map.getMaxZoom() && scale3 > 1)) {
              this._zoom = map._limitZoom(this._zoom);
            }
            if (map.options.touchZoom === "center") {
              this._center = this._startLatLng;
              if (scale3 === 1) {
                return;
              }
            } else {
              var delta = p1._add(p2)._divideBy(2)._subtract(this._centerPoint);
              if (scale3 === 1 && delta.x === 0 && delta.y === 0) {
                return;
              }
              this._center = map.unproject(map.project(this._pinchStartLatLng, this._zoom).subtract(delta), this._zoom);
            }
            if (!this._moved) {
              map._moveStart(true, false);
              this._moved = true;
            }
            cancelAnimFrame(this._animRequest);
            var moveFn = bind(map._move, map, this._center, this._zoom, { pinch: true, round: false }, void 0);
            this._animRequest = requestAnimFrame(moveFn, this, true);
            preventDefault(e);
          },
          _onTouchEnd: function() {
            if (!this._moved || !this._zooming) {
              this._zooming = false;
              return;
            }
            this._zooming = false;
            cancelAnimFrame(this._animRequest);
            off(document, "touchmove", this._onTouchMove, this);
            off(document, "touchend touchcancel", this._onTouchEnd, this);
            if (this._map.options.zoomAnimation) {
              this._map._animateZoom(this._center, this._map._limitZoom(this._zoom), true, this._map.options.zoomSnap);
            } else {
              this._map._resetView(this._center, this._map._limitZoom(this._zoom));
            }
          }
        });
        Map4.addInitHook("addHandler", "touchZoom", TouchZoom);
        Map4.BoxZoom = BoxZoom;
        Map4.DoubleClickZoom = DoubleClickZoom;
        Map4.Drag = Drag;
        Map4.Keyboard = Keyboard;
        Map4.ScrollWheelZoom = ScrollWheelZoom;
        Map4.TapHold = TapHold;
        Map4.TouchZoom = TouchZoom;
        exports2.Bounds = Bounds2;
        exports2.Browser = Browser5;
        exports2.CRS = CRS2;
        exports2.Canvas = Canvas2;
        exports2.Circle = Circle;
        exports2.CircleMarker = CircleMarker;
        exports2.Class = Class3;
        exports2.Control = Control8;
        exports2.DivIcon = DivIcon;
        exports2.DivOverlay = DivOverlay;
        exports2.DomEvent = DomEvent13;
        exports2.DomUtil = DomUtil17;
        exports2.Draggable = Draggable;
        exports2.Evented = Evented3;
        exports2.FeatureGroup = FeatureGroup;
        exports2.GeoJSON = GeoJSON;
        exports2.GridLayer = GridLayer;
        exports2.Handler = Handler;
        exports2.Icon = Icon;
        exports2.ImageOverlay = ImageOverlay;
        exports2.LatLng = LatLng3;
        exports2.LatLngBounds = LatLngBounds3;
        exports2.Layer = Layer;
        exports2.LayerGroup = LayerGroup4;
        exports2.LineUtil = LineUtil;
        exports2.Map = Map4;
        exports2.Marker = Marker;
        exports2.Mixin = Mixin;
        exports2.Path = Path2;
        exports2.Point = Point3;
        exports2.PolyUtil = PolyUtil;
        exports2.Polygon = Polygon;
        exports2.Polyline = Polyline;
        exports2.Popup = Popup;
        exports2.PosAnimation = PosAnimation;
        exports2.Projection = index;
        exports2.Rectangle = Rectangle;
        exports2.Renderer = Renderer;
        exports2.SVG = SVG2;
        exports2.SVGOverlay = SVGOverlay;
        exports2.TileLayer = TileLayer2;
        exports2.Tooltip = Tooltip;
        exports2.Transformation = Transformation2;
        exports2.Util = Util20;
        exports2.VideoOverlay = VideoOverlay;
        exports2.bind = bind;
        exports2.bounds = toBounds;
        exports2.canvas = canvas;
        exports2.circle = circle;
        exports2.circleMarker = circleMarker4;
        exports2.control = control2;
        exports2.divIcon = divIcon;
        exports2.extend = extend16;
        exports2.featureGroup = featureGroup;
        exports2.geoJSON = geoJSON;
        exports2.geoJson = geoJson4;
        exports2.gridLayer = gridLayer;
        exports2.icon = icon;
        exports2.imageOverlay = imageOverlay;
        exports2.latLng = toLatLng;
        exports2.latLngBounds = toLatLngBounds;
        exports2.layerGroup = layerGroup;
        exports2.map = createMap;
        exports2.marker = marker2;
        exports2.point = toPoint;
        exports2.polygon = polygon;
        exports2.polyline = polyline3;
        exports2.popup = popup;
        exports2.rectangle = rectangle2;
        exports2.setOptions = setOptions;
        exports2.stamp = stamp2;
        exports2.svg = svg;
        exports2.svgOverlay = svgOverlay;
        exports2.tileLayer = tileLayer;
        exports2.tooltip = tooltip;
        exports2.transformation = toTransformation;
        exports2.version = version;
        exports2.videoOverlay = videoOverlay;
        var oldL = window.L;
        exports2.noConflict = function() {
          window.L = oldL;
          return this;
        };
        window.L = exports2;
      });
    }
  });

  // node_modules/jquery/dist/jquery.js
  var require_jquery = __commonJS({
    "node_modules/jquery/dist/jquery.js"(exports, module) {
      (function(global2, factory) {
        if (typeof module === "object" && typeof module.exports === "object") {
          module.exports = global2.document ? factory(global2, true) : function(w) {
            if (!w.document) {
              throw new Error("jQuery requires a window with a document");
            }
            return factory(w);
          };
        } else {
          factory(global2);
        }
      })(typeof window !== "undefined" ? window : exports, function(window2, noGlobal) {
        var arr = [];
        var slice = arr.slice;
        var concat = arr.concat;
        var push = arr.push;
        var indexOf = arr.indexOf;
        var class2type = {};
        var toString = class2type.toString;
        var hasOwn = class2type.hasOwnProperty;
        var support = {};
        var document2 = window2.document, version = "2.1.4", jQuery6 = function(selector, context) {
          return new jQuery6.fn.init(selector, context);
        }, rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, rmsPrefix = /^-ms-/, rdashAlpha = /-([\da-z])/gi, fcamelCase = function(all, letter) {
          return letter.toUpperCase();
        };
        jQuery6.fn = jQuery6.prototype = {
          jquery: version,
          constructor: jQuery6,
          selector: "",
          length: 0,
          toArray: function() {
            return slice.call(this);
          },
          get: function(num) {
            return num != null ? num < 0 ? this[num + this.length] : this[num] : slice.call(this);
          },
          pushStack: function(elems) {
            var ret = jQuery6.merge(this.constructor(), elems);
            ret.prevObject = this;
            ret.context = this.context;
            return ret;
          },
          each: function(callback, args) {
            return jQuery6.each(this, callback, args);
          },
          map: function(callback) {
            return this.pushStack(jQuery6.map(this, function(elem, i) {
              return callback.call(elem, i, elem);
            }));
          },
          slice: function() {
            return this.pushStack(slice.apply(this, arguments));
          },
          first: function() {
            return this.eq(0);
          },
          last: function() {
            return this.eq(-1);
          },
          eq: function(i) {
            var len = this.length, j = +i + (i < 0 ? len : 0);
            return this.pushStack(j >= 0 && j < len ? [this[j]] : []);
          },
          end: function() {
            return this.prevObject || this.constructor(null);
          },
          push,
          sort: arr.sort,
          splice: arr.splice
        };
        jQuery6.extend = jQuery6.fn.extend = function() {
          var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;
          if (typeof target === "boolean") {
            deep = target;
            target = arguments[i] || {};
            i++;
          }
          if (typeof target !== "object" && !jQuery6.isFunction(target)) {
            target = {};
          }
          if (i === length) {
            target = this;
            i--;
          }
          for (; i < length; i++) {
            if ((options = arguments[i]) != null) {
              for (name in options) {
                src = target[name];
                copy = options[name];
                if (target === copy) {
                  continue;
                }
                if (deep && copy && (jQuery6.isPlainObject(copy) || (copyIsArray = jQuery6.isArray(copy)))) {
                  if (copyIsArray) {
                    copyIsArray = false;
                    clone = src && jQuery6.isArray(src) ? src : [];
                  } else {
                    clone = src && jQuery6.isPlainObject(src) ? src : {};
                  }
                  target[name] = jQuery6.extend(deep, clone, copy);
                } else if (copy !== void 0) {
                  target[name] = copy;
                }
              }
            }
          }
          return target;
        };
        jQuery6.extend({
          expando: "jQuery" + (version + Math.random()).replace(/\D/g, ""),
          isReady: true,
          error: function(msg) {
            throw new Error(msg);
          },
          noop: function() {
          },
          isFunction: function(obj) {
            return jQuery6.type(obj) === "function";
          },
          isArray: Array.isArray,
          isWindow: function(obj) {
            return obj != null && obj === obj.window;
          },
          isNumeric: function(obj) {
            return !jQuery6.isArray(obj) && obj - parseFloat(obj) + 1 >= 0;
          },
          isPlainObject: function(obj) {
            if (jQuery6.type(obj) !== "object" || obj.nodeType || jQuery6.isWindow(obj)) {
              return false;
            }
            if (obj.constructor && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
              return false;
            }
            return true;
          },
          isEmptyObject: function(obj) {
            var name;
            for (name in obj) {
              return false;
            }
            return true;
          },
          type: function(obj) {
            if (obj == null) {
              return obj + "";
            }
            return typeof obj === "object" || typeof obj === "function" ? class2type[toString.call(obj)] || "object" : typeof obj;
          },
          globalEval: function(code) {
            var script, indirect = eval;
            code = jQuery6.trim(code);
            if (code) {
              if (code.indexOf("use strict") === 1) {
                script = document2.createElement("script");
                script.text = code;
                document2.head.appendChild(script).parentNode.removeChild(script);
              } else {
                indirect(code);
              }
            }
          },
          camelCase: function(string) {
            return string.replace(rmsPrefix, "ms-").replace(rdashAlpha, fcamelCase);
          },
          nodeName: function(elem, name) {
            return elem.nodeName && elem.nodeName.toLowerCase() === name.toLowerCase();
          },
          each: function(obj, callback, args) {
            var value, i = 0, length = obj.length, isArray = isArraylike(obj);
            if (args) {
              if (isArray) {
                for (; i < length; i++) {
                  value = callback.apply(obj[i], args);
                  if (value === false) {
                    break;
                  }
                }
              } else {
                for (i in obj) {
                  value = callback.apply(obj[i], args);
                  if (value === false) {
                    break;
                  }
                }
              }
            } else {
              if (isArray) {
                for (; i < length; i++) {
                  value = callback.call(obj[i], i, obj[i]);
                  if (value === false) {
                    break;
                  }
                }
              } else {
                for (i in obj) {
                  value = callback.call(obj[i], i, obj[i]);
                  if (value === false) {
                    break;
                  }
                }
              }
            }
            return obj;
          },
          trim: function(text) {
            return text == null ? "" : (text + "").replace(rtrim, "");
          },
          makeArray: function(arr2, results) {
            var ret = results || [];
            if (arr2 != null) {
              if (isArraylike(Object(arr2))) {
                jQuery6.merge(
                  ret,
                  typeof arr2 === "string" ? [arr2] : arr2
                );
              } else {
                push.call(ret, arr2);
              }
            }
            return ret;
          },
          inArray: function(elem, arr2, i) {
            return arr2 == null ? -1 : indexOf.call(arr2, elem, i);
          },
          merge: function(first, second) {
            var len = +second.length, j = 0, i = first.length;
            for (; j < len; j++) {
              first[i++] = second[j];
            }
            first.length = i;
            return first;
          },
          grep: function(elems, callback, invert) {
            var callbackInverse, matches = [], i = 0, length = elems.length, callbackExpect = !invert;
            for (; i < length; i++) {
              callbackInverse = !callback(elems[i], i);
              if (callbackInverse !== callbackExpect) {
                matches.push(elems[i]);
              }
            }
            return matches;
          },
          map: function(elems, callback, arg) {
            var value, i = 0, length = elems.length, isArray = isArraylike(elems), ret = [];
            if (isArray) {
              for (; i < length; i++) {
                value = callback(elems[i], i, arg);
                if (value != null) {
                  ret.push(value);
                }
              }
            } else {
              for (i in elems) {
                value = callback(elems[i], i, arg);
                if (value != null) {
                  ret.push(value);
                }
              }
            }
            return concat.apply([], ret);
          },
          guid: 1,
          proxy: function(fn, context) {
            var tmp, args, proxy;
            if (typeof context === "string") {
              tmp = fn[context];
              context = fn;
              fn = tmp;
            }
            if (!jQuery6.isFunction(fn)) {
              return void 0;
            }
            args = slice.call(arguments, 2);
            proxy = function() {
              return fn.apply(context || this, args.concat(slice.call(arguments)));
            };
            proxy.guid = fn.guid = fn.guid || jQuery6.guid++;
            return proxy;
          },
          now: Date.now,
          support
        });
        jQuery6.each("Boolean Number String Function Array Date RegExp Object Error".split(" "), function(i, name) {
          class2type["[object " + name + "]"] = name.toLowerCase();
        });
        function isArraylike(obj) {
          var length = "length" in obj && obj.length, type = jQuery6.type(obj);
          if (type === "function" || jQuery6.isWindow(obj)) {
            return false;
          }
          if (obj.nodeType === 1 && length) {
            return true;
          }
          return type === "array" || length === 0 || typeof length === "number" && length > 0 && length - 1 in obj;
        }
        var Sizzle = function(window3) {
          var i, support2, Expr, getText, isXML, tokenize, compile, select, outermostContext, sortInput, hasDuplicate, setDocument, document3, docElem2, documentIsHTML, rbuggyQSA, rbuggyMatches, matches, contains, expando = "sizzle" + 1 * new Date(), preferredDoc = window3.document, dirruns = 0, done = 0, classCache = createCache(), tokenCache = createCache(), compilerCache = createCache(), sortOrder = function(a, b) {
            if (a === b) {
              hasDuplicate = true;
            }
            return 0;
          }, MAX_NEGATIVE = 1 << 31, hasOwn2 = {}.hasOwnProperty, arr2 = [], pop = arr2.pop, push_native = arr2.push, push2 = arr2.push, slice2 = arr2.slice, indexOf2 = function(list, elem) {
            var i2 = 0, len = list.length;
            for (; i2 < len; i2++) {
              if (list[i2] === elem) {
                return i2;
              }
            }
            return -1;
          }, booleans = "checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped", whitespace = "[\\x20\\t\\r\\n\\f]", characterEncoding = "(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+", identifier = characterEncoding.replace("w", "w#"), attributes = "\\[" + whitespace + "*(" + characterEncoding + ")(?:" + whitespace + "*([*^$|!~]?=)" + whitespace + `*(?:'((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)"|(` + identifier + "))|)" + whitespace + "*\\]", pseudos = ":(" + characterEncoding + `)(?:\\((('((?:\\\\.|[^\\\\'])*)'|"((?:\\\\.|[^\\\\"])*)")|((?:\\\\.|[^\\\\()[\\]]|` + attributes + ")*)|.*)\\)|)", rwhitespace = new RegExp(whitespace + "+", "g"), rtrim2 = new RegExp("^" + whitespace + "+|((?:^|[^\\\\])(?:\\\\.)*)" + whitespace + "+$", "g"), rcomma = new RegExp("^" + whitespace + "*," + whitespace + "*"), rcombinators = new RegExp("^" + whitespace + "*([>+~]|" + whitespace + ")" + whitespace + "*"), rattributeQuotes = new RegExp("=" + whitespace + `*([^\\]'"]*?)` + whitespace + "*\\]", "g"), rpseudo = new RegExp(pseudos), ridentifier = new RegExp("^" + identifier + "$"), matchExpr = {
            "ID": new RegExp("^#(" + characterEncoding + ")"),
            "CLASS": new RegExp("^\\.(" + characterEncoding + ")"),
            "TAG": new RegExp("^(" + characterEncoding.replace("w", "w*") + ")"),
            "ATTR": new RegExp("^" + attributes),
            "PSEUDO": new RegExp("^" + pseudos),
            "CHILD": new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\(" + whitespace + "*(even|odd|(([+-]|)(\\d*)n|)" + whitespace + "*(?:([+-]|)" + whitespace + "*(\\d+)|))" + whitespace + "*\\)|)", "i"),
            "bool": new RegExp("^(?:" + booleans + ")$", "i"),
            "needsContext": new RegExp("^" + whitespace + "*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\(" + whitespace + "*((?:-\\d)?\\d*)" + whitespace + "*\\)|)(?=[^-]|$)", "i")
          }, rinputs = /^(?:input|select|textarea|button)$/i, rheader = /^h\d$/i, rnative = /^[^{]+\{\s*\[native \w/, rquickExpr2 = /^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/, rsibling = /[+~]/, rescape = /'|\\/g, runescape = new RegExp("\\\\([\\da-f]{1,6}" + whitespace + "?|(" + whitespace + ")|.)", "ig"), funescape = function(_, escaped, escapedWhitespace) {
            var high = "0x" + escaped - 65536;
            return high !== high || escapedWhitespace ? escaped : high < 0 ? String.fromCharCode(high + 65536) : String.fromCharCode(high >> 10 | 55296, high & 1023 | 56320);
          }, unloadHandler = function() {
            setDocument();
          };
          try {
            push2.apply(
              arr2 = slice2.call(preferredDoc.childNodes),
              preferredDoc.childNodes
            );
            arr2[preferredDoc.childNodes.length].nodeType;
          } catch (e) {
            push2 = {
              apply: arr2.length ? function(target, els) {
                push_native.apply(target, slice2.call(els));
              } : function(target, els) {
                var j = target.length, i2 = 0;
                while (target[j++] = els[i2++]) {
                }
                target.length = j - 1;
              }
            };
          }
          function Sizzle2(selector, context, results, seed) {
            var match, elem, m, nodeType, i2, groups, old, nid, newContext, newSelector;
            if ((context ? context.ownerDocument || context : preferredDoc) !== document3) {
              setDocument(context);
            }
            context = context || document3;
            results = results || [];
            nodeType = context.nodeType;
            if (typeof selector !== "string" || !selector || nodeType !== 1 && nodeType !== 9 && nodeType !== 11) {
              return results;
            }
            if (!seed && documentIsHTML) {
              if (nodeType !== 11 && (match = rquickExpr2.exec(selector))) {
                if (m = match[1]) {
                  if (nodeType === 9) {
                    elem = context.getElementById(m);
                    if (elem && elem.parentNode) {
                      if (elem.id === m) {
                        results.push(elem);
                        return results;
                      }
                    } else {
                      return results;
                    }
                  } else {
                    if (context.ownerDocument && (elem = context.ownerDocument.getElementById(m)) && contains(context, elem) && elem.id === m) {
                      results.push(elem);
                      return results;
                    }
                  }
                } else if (match[2]) {
                  push2.apply(results, context.getElementsByTagName(selector));
                  return results;
                } else if ((m = match[3]) && support2.getElementsByClassName) {
                  push2.apply(results, context.getElementsByClassName(m));
                  return results;
                }
              }
              if (support2.qsa && (!rbuggyQSA || !rbuggyQSA.test(selector))) {
                nid = old = expando;
                newContext = context;
                newSelector = nodeType !== 1 && selector;
                if (nodeType === 1 && context.nodeName.toLowerCase() !== "object") {
                  groups = tokenize(selector);
                  if (old = context.getAttribute("id")) {
                    nid = old.replace(rescape, "\\$&");
                  } else {
                    context.setAttribute("id", nid);
                  }
                  nid = "[id='" + nid + "'] ";
                  i2 = groups.length;
                  while (i2--) {
                    groups[i2] = nid + toSelector(groups[i2]);
                  }
                  newContext = rsibling.test(selector) && testContext(context.parentNode) || context;
                  newSelector = groups.join(",");
                }
                if (newSelector) {
                  try {
                    push2.apply(
                      results,
                      newContext.querySelectorAll(newSelector)
                    );
                    return results;
                  } catch (qsaError) {
                  } finally {
                    if (!old) {
                      context.removeAttribute("id");
                    }
                  }
                }
              }
            }
            return select(selector.replace(rtrim2, "$1"), context, results, seed);
          }
          function createCache() {
            var keys = [];
            function cache(key, value) {
              if (keys.push(key + " ") > Expr.cacheLength) {
                delete cache[keys.shift()];
              }
              return cache[key + " "] = value;
            }
            return cache;
          }
          function markFunction(fn) {
            fn[expando] = true;
            return fn;
          }
          function assert(fn) {
            var div = document3.createElement("div");
            try {
              return !!fn(div);
            } catch (e) {
              return false;
            } finally {
              if (div.parentNode) {
                div.parentNode.removeChild(div);
              }
              div = null;
            }
          }
          function addHandle(attrs, handler) {
            var arr3 = attrs.split("|"), i2 = attrs.length;
            while (i2--) {
              Expr.attrHandle[arr3[i2]] = handler;
            }
          }
          function siblingCheck(a, b) {
            var cur = b && a, diff = cur && a.nodeType === 1 && b.nodeType === 1 && (~b.sourceIndex || MAX_NEGATIVE) - (~a.sourceIndex || MAX_NEGATIVE);
            if (diff) {
              return diff;
            }
            if (cur) {
              while (cur = cur.nextSibling) {
                if (cur === b) {
                  return -1;
                }
              }
            }
            return a ? 1 : -1;
          }
          function createInputPseudo(type) {
            return function(elem) {
              var name = elem.nodeName.toLowerCase();
              return name === "input" && elem.type === type;
            };
          }
          function createButtonPseudo(type) {
            return function(elem) {
              var name = elem.nodeName.toLowerCase();
              return (name === "input" || name === "button") && elem.type === type;
            };
          }
          function createPositionalPseudo(fn) {
            return markFunction(function(argument) {
              argument = +argument;
              return markFunction(function(seed, matches2) {
                var j, matchIndexes = fn([], seed.length, argument), i2 = matchIndexes.length;
                while (i2--) {
                  if (seed[j = matchIndexes[i2]]) {
                    seed[j] = !(matches2[j] = seed[j]);
                  }
                }
              });
            });
          }
          function testContext(context) {
            return context && typeof context.getElementsByTagName !== "undefined" && context;
          }
          support2 = Sizzle2.support = {};
          isXML = Sizzle2.isXML = function(elem) {
            var documentElement = elem && (elem.ownerDocument || elem).documentElement;
            return documentElement ? documentElement.nodeName !== "HTML" : false;
          };
          setDocument = Sizzle2.setDocument = function(node) {
            var hasCompare, parent, doc = node ? node.ownerDocument || node : preferredDoc;
            if (doc === document3 || doc.nodeType !== 9 || !doc.documentElement) {
              return document3;
            }
            document3 = doc;
            docElem2 = doc.documentElement;
            parent = doc.defaultView;
            if (parent && parent !== parent.top) {
              if (parent.addEventListener) {
                parent.addEventListener("unload", unloadHandler, false);
              } else if (parent.attachEvent) {
                parent.attachEvent("onunload", unloadHandler);
              }
            }
            documentIsHTML = !isXML(doc);
            support2.attributes = assert(function(div) {
              div.className = "i";
              return !div.getAttribute("className");
            });
            support2.getElementsByTagName = assert(function(div) {
              div.appendChild(doc.createComment(""));
              return !div.getElementsByTagName("*").length;
            });
            support2.getElementsByClassName = rnative.test(doc.getElementsByClassName);
            support2.getById = assert(function(div) {
              docElem2.appendChild(div).id = expando;
              return !doc.getElementsByName || !doc.getElementsByName(expando).length;
            });
            if (support2.getById) {
              Expr.find["ID"] = function(id, context) {
                if (typeof context.getElementById !== "undefined" && documentIsHTML) {
                  var m = context.getElementById(id);
                  return m && m.parentNode ? [m] : [];
                }
              };
              Expr.filter["ID"] = function(id) {
                var attrId = id.replace(runescape, funescape);
                return function(elem) {
                  return elem.getAttribute("id") === attrId;
                };
              };
            } else {
              delete Expr.find["ID"];
              Expr.filter["ID"] = function(id) {
                var attrId = id.replace(runescape, funescape);
                return function(elem) {
                  var node2 = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
                  return node2 && node2.value === attrId;
                };
              };
            }
            Expr.find["TAG"] = support2.getElementsByTagName ? function(tag, context) {
              if (typeof context.getElementsByTagName !== "undefined") {
                return context.getElementsByTagName(tag);
              } else if (support2.qsa) {
                return context.querySelectorAll(tag);
              }
            } : function(tag, context) {
              var elem, tmp = [], i2 = 0, results = context.getElementsByTagName(tag);
              if (tag === "*") {
                while (elem = results[i2++]) {
                  if (elem.nodeType === 1) {
                    tmp.push(elem);
                  }
                }
                return tmp;
              }
              return results;
            };
            Expr.find["CLASS"] = support2.getElementsByClassName && function(className, context) {
              if (documentIsHTML) {
                return context.getElementsByClassName(className);
              }
            };
            rbuggyMatches = [];
            rbuggyQSA = [];
            if (support2.qsa = rnative.test(doc.querySelectorAll)) {
              assert(function(div) {
                docElem2.appendChild(div).innerHTML = "<a id='" + expando + "'></a><select id='" + expando + "-\f]' msallowcapture=''><option selected=''></option></select>";
                if (div.querySelectorAll("[msallowcapture^='']").length) {
                  rbuggyQSA.push("[*^$]=" + whitespace + `*(?:''|"")`);
                }
                if (!div.querySelectorAll("[selected]").length) {
                  rbuggyQSA.push("\\[" + whitespace + "*(?:value|" + booleans + ")");
                }
                if (!div.querySelectorAll("[id~=" + expando + "-]").length) {
                  rbuggyQSA.push("~=");
                }
                if (!div.querySelectorAll(":checked").length) {
                  rbuggyQSA.push(":checked");
                }
                if (!div.querySelectorAll("a#" + expando + "+*").length) {
                  rbuggyQSA.push(".#.+[+~]");
                }
              });
              assert(function(div) {
                var input = doc.createElement("input");
                input.setAttribute("type", "hidden");
                div.appendChild(input).setAttribute("name", "D");
                if (div.querySelectorAll("[name=d]").length) {
                  rbuggyQSA.push("name" + whitespace + "*[*^$|!~]?=");
                }
                if (!div.querySelectorAll(":enabled").length) {
                  rbuggyQSA.push(":enabled", ":disabled");
                }
                div.querySelectorAll("*,:x");
                rbuggyQSA.push(",.*:");
              });
            }
            if (support2.matchesSelector = rnative.test(matches = docElem2.matches || docElem2.webkitMatchesSelector || docElem2.mozMatchesSelector || docElem2.oMatchesSelector || docElem2.msMatchesSelector)) {
              assert(function(div) {
                support2.disconnectedMatch = matches.call(div, "div");
                matches.call(div, "[s!='']:x");
                rbuggyMatches.push("!=", pseudos);
              });
            }
            rbuggyQSA = rbuggyQSA.length && new RegExp(rbuggyQSA.join("|"));
            rbuggyMatches = rbuggyMatches.length && new RegExp(rbuggyMatches.join("|"));
            hasCompare = rnative.test(docElem2.compareDocumentPosition);
            contains = hasCompare || rnative.test(docElem2.contains) ? function(a, b) {
              var adown = a.nodeType === 9 ? a.documentElement : a, bup = b && b.parentNode;
              return a === bup || !!(bup && bup.nodeType === 1 && (adown.contains ? adown.contains(bup) : a.compareDocumentPosition && a.compareDocumentPosition(bup) & 16));
            } : function(a, b) {
              if (b) {
                while (b = b.parentNode) {
                  if (b === a) {
                    return true;
                  }
                }
              }
              return false;
            };
            sortOrder = hasCompare ? function(a, b) {
              if (a === b) {
                hasDuplicate = true;
                return 0;
              }
              var compare = !a.compareDocumentPosition - !b.compareDocumentPosition;
              if (compare) {
                return compare;
              }
              compare = (a.ownerDocument || a) === (b.ownerDocument || b) ? a.compareDocumentPosition(b) : 1;
              if (compare & 1 || !support2.sortDetached && b.compareDocumentPosition(a) === compare) {
                if (a === doc || a.ownerDocument === preferredDoc && contains(preferredDoc, a)) {
                  return -1;
                }
                if (b === doc || b.ownerDocument === preferredDoc && contains(preferredDoc, b)) {
                  return 1;
                }
                return sortInput ? indexOf2(sortInput, a) - indexOf2(sortInput, b) : 0;
              }
              return compare & 4 ? -1 : 1;
            } : function(a, b) {
              if (a === b) {
                hasDuplicate = true;
                return 0;
              }
              var cur, i2 = 0, aup = a.parentNode, bup = b.parentNode, ap = [a], bp = [b];
              if (!aup || !bup) {
                return a === doc ? -1 : b === doc ? 1 : aup ? -1 : bup ? 1 : sortInput ? indexOf2(sortInput, a) - indexOf2(sortInput, b) : 0;
              } else if (aup === bup) {
                return siblingCheck(a, b);
              }
              cur = a;
              while (cur = cur.parentNode) {
                ap.unshift(cur);
              }
              cur = b;
              while (cur = cur.parentNode) {
                bp.unshift(cur);
              }
              while (ap[i2] === bp[i2]) {
                i2++;
              }
              return i2 ? siblingCheck(ap[i2], bp[i2]) : ap[i2] === preferredDoc ? -1 : bp[i2] === preferredDoc ? 1 : 0;
            };
            return doc;
          };
          Sizzle2.matches = function(expr, elements) {
            return Sizzle2(expr, null, null, elements);
          };
          Sizzle2.matchesSelector = function(elem, expr) {
            if ((elem.ownerDocument || elem) !== document3) {
              setDocument(elem);
            }
            expr = expr.replace(rattributeQuotes, "='$1']");
            if (support2.matchesSelector && documentIsHTML && (!rbuggyMatches || !rbuggyMatches.test(expr)) && (!rbuggyQSA || !rbuggyQSA.test(expr))) {
              try {
                var ret = matches.call(elem, expr);
                if (ret || support2.disconnectedMatch || elem.document && elem.document.nodeType !== 11) {
                  return ret;
                }
              } catch (e) {
              }
            }
            return Sizzle2(expr, document3, null, [elem]).length > 0;
          };
          Sizzle2.contains = function(context, elem) {
            if ((context.ownerDocument || context) !== document3) {
              setDocument(context);
            }
            return contains(context, elem);
          };
          Sizzle2.attr = function(elem, name) {
            if ((elem.ownerDocument || elem) !== document3) {
              setDocument(elem);
            }
            var fn = Expr.attrHandle[name.toLowerCase()], val = fn && hasOwn2.call(Expr.attrHandle, name.toLowerCase()) ? fn(elem, name, !documentIsHTML) : void 0;
            return val !== void 0 ? val : support2.attributes || !documentIsHTML ? elem.getAttribute(name) : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
          };
          Sizzle2.error = function(msg) {
            throw new Error("Syntax error, unrecognized expression: " + msg);
          };
          Sizzle2.uniqueSort = function(results) {
            var elem, duplicates = [], j = 0, i2 = 0;
            hasDuplicate = !support2.detectDuplicates;
            sortInput = !support2.sortStable && results.slice(0);
            results.sort(sortOrder);
            if (hasDuplicate) {
              while (elem = results[i2++]) {
                if (elem === results[i2]) {
                  j = duplicates.push(i2);
                }
              }
              while (j--) {
                results.splice(duplicates[j], 1);
              }
            }
            sortInput = null;
            return results;
          };
          getText = Sizzle2.getText = function(elem) {
            var node, ret = "", i2 = 0, nodeType = elem.nodeType;
            if (!nodeType) {
              while (node = elem[i2++]) {
                ret += getText(node);
              }
            } else if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
              if (typeof elem.textContent === "string") {
                return elem.textContent;
              } else {
                for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                  ret += getText(elem);
                }
              }
            } else if (nodeType === 3 || nodeType === 4) {
              return elem.nodeValue;
            }
            return ret;
          };
          Expr = Sizzle2.selectors = {
            cacheLength: 50,
            createPseudo: markFunction,
            match: matchExpr,
            attrHandle: {},
            find: {},
            relative: {
              ">": { dir: "parentNode", first: true },
              " ": { dir: "parentNode" },
              "+": { dir: "previousSibling", first: true },
              "~": { dir: "previousSibling" }
            },
            preFilter: {
              "ATTR": function(match) {
                match[1] = match[1].replace(runescape, funescape);
                match[3] = (match[3] || match[4] || match[5] || "").replace(runescape, funescape);
                if (match[2] === "~=") {
                  match[3] = " " + match[3] + " ";
                }
                return match.slice(0, 4);
              },
              "CHILD": function(match) {
                match[1] = match[1].toLowerCase();
                if (match[1].slice(0, 3) === "nth") {
                  if (!match[3]) {
                    Sizzle2.error(match[0]);
                  }
                  match[4] = +(match[4] ? match[5] + (match[6] || 1) : 2 * (match[3] === "even" || match[3] === "odd"));
                  match[5] = +(match[7] + match[8] || match[3] === "odd");
                } else if (match[3]) {
                  Sizzle2.error(match[0]);
                }
                return match;
              },
              "PSEUDO": function(match) {
                var excess, unquoted = !match[6] && match[2];
                if (matchExpr["CHILD"].test(match[0])) {
                  return null;
                }
                if (match[3]) {
                  match[2] = match[4] || match[5] || "";
                } else if (unquoted && rpseudo.test(unquoted) && (excess = tokenize(unquoted, true)) && (excess = unquoted.indexOf(")", unquoted.length - excess) - unquoted.length)) {
                  match[0] = match[0].slice(0, excess);
                  match[2] = unquoted.slice(0, excess);
                }
                return match.slice(0, 3);
              }
            },
            filter: {
              "TAG": function(nodeNameSelector) {
                var nodeName = nodeNameSelector.replace(runescape, funescape).toLowerCase();
                return nodeNameSelector === "*" ? function() {
                  return true;
                } : function(elem) {
                  return elem.nodeName && elem.nodeName.toLowerCase() === nodeName;
                };
              },
              "CLASS": function(className) {
                var pattern = classCache[className + " "];
                return pattern || (pattern = new RegExp("(^|" + whitespace + ")" + className + "(" + whitespace + "|$)")) && classCache(className, function(elem) {
                  return pattern.test(typeof elem.className === "string" && elem.className || typeof elem.getAttribute !== "undefined" && elem.getAttribute("class") || "");
                });
              },
              "ATTR": function(name, operator, check) {
                return function(elem) {
                  var result = Sizzle2.attr(elem, name);
                  if (result == null) {
                    return operator === "!=";
                  }
                  if (!operator) {
                    return true;
                  }
                  result += "";
                  return operator === "=" ? result === check : operator === "!=" ? result !== check : operator === "^=" ? check && result.indexOf(check) === 0 : operator === "*=" ? check && result.indexOf(check) > -1 : operator === "$=" ? check && result.slice(-check.length) === check : operator === "~=" ? (" " + result.replace(rwhitespace, " ") + " ").indexOf(check) > -1 : operator === "|=" ? result === check || result.slice(0, check.length + 1) === check + "-" : false;
                };
              },
              "CHILD": function(type, what, argument, first, last) {
                var simple = type.slice(0, 3) !== "nth", forward = type.slice(-4) !== "last", ofType = what === "of-type";
                return first === 1 && last === 0 ? function(elem) {
                  return !!elem.parentNode;
                } : function(elem, context, xml) {
                  var cache, outerCache, node, diff, nodeIndex, start, dir = simple !== forward ? "nextSibling" : "previousSibling", parent = elem.parentNode, name = ofType && elem.nodeName.toLowerCase(), useCache = !xml && !ofType;
                  if (parent) {
                    if (simple) {
                      while (dir) {
                        node = elem;
                        while (node = node[dir]) {
                          if (ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) {
                            return false;
                          }
                        }
                        start = dir = type === "only" && !start && "nextSibling";
                      }
                      return true;
                    }
                    start = [forward ? parent.firstChild : parent.lastChild];
                    if (forward && useCache) {
                      outerCache = parent[expando] || (parent[expando] = {});
                      cache = outerCache[type] || [];
                      nodeIndex = cache[0] === dirruns && cache[1];
                      diff = cache[0] === dirruns && cache[2];
                      node = nodeIndex && parent.childNodes[nodeIndex];
                      while (node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) {
                        if (node.nodeType === 1 && ++diff && node === elem) {
                          outerCache[type] = [dirruns, nodeIndex, diff];
                          break;
                        }
                      }
                    } else if (useCache && (cache = (elem[expando] || (elem[expando] = {}))[type]) && cache[0] === dirruns) {
                      diff = cache[1];
                    } else {
                      while (node = ++nodeIndex && node && node[dir] || (diff = nodeIndex = 0) || start.pop()) {
                        if ((ofType ? node.nodeName.toLowerCase() === name : node.nodeType === 1) && ++diff) {
                          if (useCache) {
                            (node[expando] || (node[expando] = {}))[type] = [dirruns, diff];
                          }
                          if (node === elem) {
                            break;
                          }
                        }
                      }
                    }
                    diff -= last;
                    return diff === first || diff % first === 0 && diff / first >= 0;
                  }
                };
              },
              "PSEUDO": function(pseudo, argument) {
                var args, fn = Expr.pseudos[pseudo] || Expr.setFilters[pseudo.toLowerCase()] || Sizzle2.error("unsupported pseudo: " + pseudo);
                if (fn[expando]) {
                  return fn(argument);
                }
                if (fn.length > 1) {
                  args = [pseudo, pseudo, "", argument];
                  return Expr.setFilters.hasOwnProperty(pseudo.toLowerCase()) ? markFunction(function(seed, matches2) {
                    var idx, matched = fn(seed, argument), i2 = matched.length;
                    while (i2--) {
                      idx = indexOf2(seed, matched[i2]);
                      seed[idx] = !(matches2[idx] = matched[i2]);
                    }
                  }) : function(elem) {
                    return fn(elem, 0, args);
                  };
                }
                return fn;
              }
            },
            pseudos: {
              "not": markFunction(function(selector) {
                var input = [], results = [], matcher = compile(selector.replace(rtrim2, "$1"));
                return matcher[expando] ? markFunction(function(seed, matches2, context, xml) {
                  var elem, unmatched = matcher(seed, null, xml, []), i2 = seed.length;
                  while (i2--) {
                    if (elem = unmatched[i2]) {
                      seed[i2] = !(matches2[i2] = elem);
                    }
                  }
                }) : function(elem, context, xml) {
                  input[0] = elem;
                  matcher(input, null, xml, results);
                  input[0] = null;
                  return !results.pop();
                };
              }),
              "has": markFunction(function(selector) {
                return function(elem) {
                  return Sizzle2(selector, elem).length > 0;
                };
              }),
              "contains": markFunction(function(text) {
                text = text.replace(runescape, funescape);
                return function(elem) {
                  return (elem.textContent || elem.innerText || getText(elem)).indexOf(text) > -1;
                };
              }),
              "lang": markFunction(function(lang) {
                if (!ridentifier.test(lang || "")) {
                  Sizzle2.error("unsupported lang: " + lang);
                }
                lang = lang.replace(runescape, funescape).toLowerCase();
                return function(elem) {
                  var elemLang;
                  do {
                    if (elemLang = documentIsHTML ? elem.lang : elem.getAttribute("xml:lang") || elem.getAttribute("lang")) {
                      elemLang = elemLang.toLowerCase();
                      return elemLang === lang || elemLang.indexOf(lang + "-") === 0;
                    }
                  } while ((elem = elem.parentNode) && elem.nodeType === 1);
                  return false;
                };
              }),
              "target": function(elem) {
                var hash = window3.location && window3.location.hash;
                return hash && hash.slice(1) === elem.id;
              },
              "root": function(elem) {
                return elem === docElem2;
              },
              "focus": function(elem) {
                return elem === document3.activeElement && (!document3.hasFocus || document3.hasFocus()) && !!(elem.type || elem.href || ~elem.tabIndex);
              },
              "enabled": function(elem) {
                return elem.disabled === false;
              },
              "disabled": function(elem) {
                return elem.disabled === true;
              },
              "checked": function(elem) {
                var nodeName = elem.nodeName.toLowerCase();
                return nodeName === "input" && !!elem.checked || nodeName === "option" && !!elem.selected;
              },
              "selected": function(elem) {
                if (elem.parentNode) {
                  elem.parentNode.selectedIndex;
                }
                return elem.selected === true;
              },
              "empty": function(elem) {
                for (elem = elem.firstChild; elem; elem = elem.nextSibling) {
                  if (elem.nodeType < 6) {
                    return false;
                  }
                }
                return true;
              },
              "parent": function(elem) {
                return !Expr.pseudos["empty"](elem);
              },
              "header": function(elem) {
                return rheader.test(elem.nodeName);
              },
              "input": function(elem) {
                return rinputs.test(elem.nodeName);
              },
              "button": function(elem) {
                var name = elem.nodeName.toLowerCase();
                return name === "input" && elem.type === "button" || name === "button";
              },
              "text": function(elem) {
                var attr;
                return elem.nodeName.toLowerCase() === "input" && elem.type === "text" && ((attr = elem.getAttribute("type")) == null || attr.toLowerCase() === "text");
              },
              "first": createPositionalPseudo(function() {
                return [0];
              }),
              "last": createPositionalPseudo(function(matchIndexes, length) {
                return [length - 1];
              }),
              "eq": createPositionalPseudo(function(matchIndexes, length, argument) {
                return [argument < 0 ? argument + length : argument];
              }),
              "even": createPositionalPseudo(function(matchIndexes, length) {
                var i2 = 0;
                for (; i2 < length; i2 += 2) {
                  matchIndexes.push(i2);
                }
                return matchIndexes;
              }),
              "odd": createPositionalPseudo(function(matchIndexes, length) {
                var i2 = 1;
                for (; i2 < length; i2 += 2) {
                  matchIndexes.push(i2);
                }
                return matchIndexes;
              }),
              "lt": createPositionalPseudo(function(matchIndexes, length, argument) {
                var i2 = argument < 0 ? argument + length : argument;
                for (; --i2 >= 0; ) {
                  matchIndexes.push(i2);
                }
                return matchIndexes;
              }),
              "gt": createPositionalPseudo(function(matchIndexes, length, argument) {
                var i2 = argument < 0 ? argument + length : argument;
                for (; ++i2 < length; ) {
                  matchIndexes.push(i2);
                }
                return matchIndexes;
              })
            }
          };
          Expr.pseudos["nth"] = Expr.pseudos["eq"];
          for (i in { radio: true, checkbox: true, file: true, password: true, image: true }) {
            Expr.pseudos[i] = createInputPseudo(i);
          }
          for (i in { submit: true, reset: true }) {
            Expr.pseudos[i] = createButtonPseudo(i);
          }
          function setFilters() {
          }
          setFilters.prototype = Expr.filters = Expr.pseudos;
          Expr.setFilters = new setFilters();
          tokenize = Sizzle2.tokenize = function(selector, parseOnly) {
            var matched, match, tokens, type, soFar, groups, preFilters, cached = tokenCache[selector + " "];
            if (cached) {
              return parseOnly ? 0 : cached.slice(0);
            }
            soFar = selector;
            groups = [];
            preFilters = Expr.preFilter;
            while (soFar) {
              if (!matched || (match = rcomma.exec(soFar))) {
                if (match) {
                  soFar = soFar.slice(match[0].length) || soFar;
                }
                groups.push(tokens = []);
              }
              matched = false;
              if (match = rcombinators.exec(soFar)) {
                matched = match.shift();
                tokens.push({
                  value: matched,
                  type: match[0].replace(rtrim2, " ")
                });
                soFar = soFar.slice(matched.length);
              }
              for (type in Expr.filter) {
                if ((match = matchExpr[type].exec(soFar)) && (!preFilters[type] || (match = preFilters[type](match)))) {
                  matched = match.shift();
                  tokens.push({
                    value: matched,
                    type,
                    matches: match
                  });
                  soFar = soFar.slice(matched.length);
                }
              }
              if (!matched) {
                break;
              }
            }
            return parseOnly ? soFar.length : soFar ? Sizzle2.error(selector) : tokenCache(selector, groups).slice(0);
          };
          function toSelector(tokens) {
            var i2 = 0, len = tokens.length, selector = "";
            for (; i2 < len; i2++) {
              selector += tokens[i2].value;
            }
            return selector;
          }
          function addCombinator(matcher, combinator, base) {
            var dir = combinator.dir, checkNonElements = base && dir === "parentNode", doneName = done++;
            return combinator.first ? function(elem, context, xml) {
              while (elem = elem[dir]) {
                if (elem.nodeType === 1 || checkNonElements) {
                  return matcher(elem, context, xml);
                }
              }
            } : function(elem, context, xml) {
              var oldCache, outerCache, newCache = [dirruns, doneName];
              if (xml) {
                while (elem = elem[dir]) {
                  if (elem.nodeType === 1 || checkNonElements) {
                    if (matcher(elem, context, xml)) {
                      return true;
                    }
                  }
                }
              } else {
                while (elem = elem[dir]) {
                  if (elem.nodeType === 1 || checkNonElements) {
                    outerCache = elem[expando] || (elem[expando] = {});
                    if ((oldCache = outerCache[dir]) && oldCache[0] === dirruns && oldCache[1] === doneName) {
                      return newCache[2] = oldCache[2];
                    } else {
                      outerCache[dir] = newCache;
                      if (newCache[2] = matcher(elem, context, xml)) {
                        return true;
                      }
                    }
                  }
                }
              }
            };
          }
          function elementMatcher(matchers) {
            return matchers.length > 1 ? function(elem, context, xml) {
              var i2 = matchers.length;
              while (i2--) {
                if (!matchers[i2](elem, context, xml)) {
                  return false;
                }
              }
              return true;
            } : matchers[0];
          }
          function multipleContexts(selector, contexts, results) {
            var i2 = 0, len = contexts.length;
            for (; i2 < len; i2++) {
              Sizzle2(selector, contexts[i2], results);
            }
            return results;
          }
          function condense(unmatched, map, filter, context, xml) {
            var elem, newUnmatched = [], i2 = 0, len = unmatched.length, mapped = map != null;
            for (; i2 < len; i2++) {
              if (elem = unmatched[i2]) {
                if (!filter || filter(elem, context, xml)) {
                  newUnmatched.push(elem);
                  if (mapped) {
                    map.push(i2);
                  }
                }
              }
            }
            return newUnmatched;
          }
          function setMatcher(preFilter, selector, matcher, postFilter, postFinder, postSelector) {
            if (postFilter && !postFilter[expando]) {
              postFilter = setMatcher(postFilter);
            }
            if (postFinder && !postFinder[expando]) {
              postFinder = setMatcher(postFinder, postSelector);
            }
            return markFunction(function(seed, results, context, xml) {
              var temp, i2, elem, preMap = [], postMap = [], preexisting = results.length, elems = seed || multipleContexts(selector || "*", context.nodeType ? [context] : context, []), matcherIn = preFilter && (seed || !selector) ? condense(elems, preMap, preFilter, context, xml) : elems, matcherOut = matcher ? postFinder || (seed ? preFilter : preexisting || postFilter) ? [] : results : matcherIn;
              if (matcher) {
                matcher(matcherIn, matcherOut, context, xml);
              }
              if (postFilter) {
                temp = condense(matcherOut, postMap);
                postFilter(temp, [], context, xml);
                i2 = temp.length;
                while (i2--) {
                  if (elem = temp[i2]) {
                    matcherOut[postMap[i2]] = !(matcherIn[postMap[i2]] = elem);
                  }
                }
              }
              if (seed) {
                if (postFinder || preFilter) {
                  if (postFinder) {
                    temp = [];
                    i2 = matcherOut.length;
                    while (i2--) {
                      if (elem = matcherOut[i2]) {
                        temp.push(matcherIn[i2] = elem);
                      }
                    }
                    postFinder(null, matcherOut = [], temp, xml);
                  }
                  i2 = matcherOut.length;
                  while (i2--) {
                    if ((elem = matcherOut[i2]) && (temp = postFinder ? indexOf2(seed, elem) : preMap[i2]) > -1) {
                      seed[temp] = !(results[temp] = elem);
                    }
                  }
                }
              } else {
                matcherOut = condense(
                  matcherOut === results ? matcherOut.splice(preexisting, matcherOut.length) : matcherOut
                );
                if (postFinder) {
                  postFinder(null, results, matcherOut, xml);
                } else {
                  push2.apply(results, matcherOut);
                }
              }
            });
          }
          function matcherFromTokens(tokens) {
            var checkContext, matcher, j, len = tokens.length, leadingRelative = Expr.relative[tokens[0].type], implicitRelative = leadingRelative || Expr.relative[" "], i2 = leadingRelative ? 1 : 0, matchContext = addCombinator(function(elem) {
              return elem === checkContext;
            }, implicitRelative, true), matchAnyContext = addCombinator(function(elem) {
              return indexOf2(checkContext, elem) > -1;
            }, implicitRelative, true), matchers = [function(elem, context, xml) {
              var ret = !leadingRelative && (xml || context !== outermostContext) || ((checkContext = context).nodeType ? matchContext(elem, context, xml) : matchAnyContext(elem, context, xml));
              checkContext = null;
              return ret;
            }];
            for (; i2 < len; i2++) {
              if (matcher = Expr.relative[tokens[i2].type]) {
                matchers = [addCombinator(elementMatcher(matchers), matcher)];
              } else {
                matcher = Expr.filter[tokens[i2].type].apply(null, tokens[i2].matches);
                if (matcher[expando]) {
                  j = ++i2;
                  for (; j < len; j++) {
                    if (Expr.relative[tokens[j].type]) {
                      break;
                    }
                  }
                  return setMatcher(
                    i2 > 1 && elementMatcher(matchers),
                    i2 > 1 && toSelector(
                      tokens.slice(0, i2 - 1).concat({ value: tokens[i2 - 2].type === " " ? "*" : "" })
                    ).replace(rtrim2, "$1"),
                    matcher,
                    i2 < j && matcherFromTokens(tokens.slice(i2, j)),
                    j < len && matcherFromTokens(tokens = tokens.slice(j)),
                    j < len && toSelector(tokens)
                  );
                }
                matchers.push(matcher);
              }
            }
            return elementMatcher(matchers);
          }
          function matcherFromGroupMatchers(elementMatchers, setMatchers) {
            var bySet = setMatchers.length > 0, byElement = elementMatchers.length > 0, superMatcher = function(seed, context, xml, results, outermost) {
              var elem, j, matcher, matchedCount = 0, i2 = "0", unmatched = seed && [], setMatched = [], contextBackup = outermostContext, elems = seed || byElement && Expr.find["TAG"]("*", outermost), dirrunsUnique = dirruns += contextBackup == null ? 1 : Math.random() || 0.1, len = elems.length;
              if (outermost) {
                outermostContext = context !== document3 && context;
              }
              for (; i2 !== len && (elem = elems[i2]) != null; i2++) {
                if (byElement && elem) {
                  j = 0;
                  while (matcher = elementMatchers[j++]) {
                    if (matcher(elem, context, xml)) {
                      results.push(elem);
                      break;
                    }
                  }
                  if (outermost) {
                    dirruns = dirrunsUnique;
                  }
                }
                if (bySet) {
                  if (elem = !matcher && elem) {
                    matchedCount--;
                  }
                  if (seed) {
                    unmatched.push(elem);
                  }
                }
              }
              matchedCount += i2;
              if (bySet && i2 !== matchedCount) {
                j = 0;
                while (matcher = setMatchers[j++]) {
                  matcher(unmatched, setMatched, context, xml);
                }
                if (seed) {
                  if (matchedCount > 0) {
                    while (i2--) {
                      if (!(unmatched[i2] || setMatched[i2])) {
                        setMatched[i2] = pop.call(results);
                      }
                    }
                  }
                  setMatched = condense(setMatched);
                }
                push2.apply(results, setMatched);
                if (outermost && !seed && setMatched.length > 0 && matchedCount + setMatchers.length > 1) {
                  Sizzle2.uniqueSort(results);
                }
              }
              if (outermost) {
                dirruns = dirrunsUnique;
                outermostContext = contextBackup;
              }
              return unmatched;
            };
            return bySet ? markFunction(superMatcher) : superMatcher;
          }
          compile = Sizzle2.compile = function(selector, match) {
            var i2, setMatchers = [], elementMatchers = [], cached = compilerCache[selector + " "];
            if (!cached) {
              if (!match) {
                match = tokenize(selector);
              }
              i2 = match.length;
              while (i2--) {
                cached = matcherFromTokens(match[i2]);
                if (cached[expando]) {
                  setMatchers.push(cached);
                } else {
                  elementMatchers.push(cached);
                }
              }
              cached = compilerCache(selector, matcherFromGroupMatchers(elementMatchers, setMatchers));
              cached.selector = selector;
            }
            return cached;
          };
          select = Sizzle2.select = function(selector, context, results, seed) {
            var i2, tokens, token, type, find, compiled = typeof selector === "function" && selector, match = !seed && tokenize(selector = compiled.selector || selector);
            results = results || [];
            if (match.length === 1) {
              tokens = match[0] = match[0].slice(0);
              if (tokens.length > 2 && (token = tokens[0]).type === "ID" && support2.getById && context.nodeType === 9 && documentIsHTML && Expr.relative[tokens[1].type]) {
                context = (Expr.find["ID"](token.matches[0].replace(runescape, funescape), context) || [])[0];
                if (!context) {
                  return results;
                } else if (compiled) {
                  context = context.parentNode;
                }
                selector = selector.slice(tokens.shift().value.length);
              }
              i2 = matchExpr["needsContext"].test(selector) ? 0 : tokens.length;
              while (i2--) {
                token = tokens[i2];
                if (Expr.relative[type = token.type]) {
                  break;
                }
                if (find = Expr.find[type]) {
                  if (seed = find(
                    token.matches[0].replace(runescape, funescape),
                    rsibling.test(tokens[0].type) && testContext(context.parentNode) || context
                  )) {
                    tokens.splice(i2, 1);
                    selector = seed.length && toSelector(tokens);
                    if (!selector) {
                      push2.apply(results, seed);
                      return results;
                    }
                    break;
                  }
                }
              }
            }
            (compiled || compile(selector, match))(
              seed,
              context,
              !documentIsHTML,
              results,
              rsibling.test(selector) && testContext(context.parentNode) || context
            );
            return results;
          };
          support2.sortStable = expando.split("").sort(sortOrder).join("") === expando;
          support2.detectDuplicates = !!hasDuplicate;
          setDocument();
          support2.sortDetached = assert(function(div1) {
            return div1.compareDocumentPosition(document3.createElement("div")) & 1;
          });
          if (!assert(function(div) {
            div.innerHTML = "<a href='#'></a>";
            return div.firstChild.getAttribute("href") === "#";
          })) {
            addHandle("type|href|height|width", function(elem, name, isXML2) {
              if (!isXML2) {
                return elem.getAttribute(name, name.toLowerCase() === "type" ? 1 : 2);
              }
            });
          }
          if (!support2.attributes || !assert(function(div) {
            div.innerHTML = "<input/>";
            div.firstChild.setAttribute("value", "");
            return div.firstChild.getAttribute("value") === "";
          })) {
            addHandle("value", function(elem, name, isXML2) {
              if (!isXML2 && elem.nodeName.toLowerCase() === "input") {
                return elem.defaultValue;
              }
            });
          }
          if (!assert(function(div) {
            return div.getAttribute("disabled") == null;
          })) {
            addHandle(booleans, function(elem, name, isXML2) {
              var val;
              if (!isXML2) {
                return elem[name] === true ? name.toLowerCase() : (val = elem.getAttributeNode(name)) && val.specified ? val.value : null;
              }
            });
          }
          return Sizzle2;
        }(window2);
        jQuery6.find = Sizzle;
        jQuery6.expr = Sizzle.selectors;
        jQuery6.expr[":"] = jQuery6.expr.pseudos;
        jQuery6.unique = Sizzle.uniqueSort;
        jQuery6.text = Sizzle.getText;
        jQuery6.isXMLDoc = Sizzle.isXML;
        jQuery6.contains = Sizzle.contains;
        var rneedsContext = jQuery6.expr.match.needsContext;
        var rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>|)$/;
        var risSimple = /^.[^:#\[\.,]*$/;
        function winnow(elements, qualifier, not) {
          if (jQuery6.isFunction(qualifier)) {
            return jQuery6.grep(elements, function(elem, i) {
              return !!qualifier.call(elem, i, elem) !== not;
            });
          }
          if (qualifier.nodeType) {
            return jQuery6.grep(elements, function(elem) {
              return elem === qualifier !== not;
            });
          }
          if (typeof qualifier === "string") {
            if (risSimple.test(qualifier)) {
              return jQuery6.filter(qualifier, elements, not);
            }
            qualifier = jQuery6.filter(qualifier, elements);
          }
          return jQuery6.grep(elements, function(elem) {
            return indexOf.call(qualifier, elem) >= 0 !== not;
          });
        }
        jQuery6.filter = function(expr, elems, not) {
          var elem = elems[0];
          if (not) {
            expr = ":not(" + expr + ")";
          }
          return elems.length === 1 && elem.nodeType === 1 ? jQuery6.find.matchesSelector(elem, expr) ? [elem] : [] : jQuery6.find.matches(expr, jQuery6.grep(elems, function(elem2) {
            return elem2.nodeType === 1;
          }));
        };
        jQuery6.fn.extend({
          find: function(selector) {
            var i, len = this.length, ret = [], self2 = this;
            if (typeof selector !== "string") {
              return this.pushStack(jQuery6(selector).filter(function() {
                for (i = 0; i < len; i++) {
                  if (jQuery6.contains(self2[i], this)) {
                    return true;
                  }
                }
              }));
            }
            for (i = 0; i < len; i++) {
              jQuery6.find(selector, self2[i], ret);
            }
            ret = this.pushStack(len > 1 ? jQuery6.unique(ret) : ret);
            ret.selector = this.selector ? this.selector + " " + selector : selector;
            return ret;
          },
          filter: function(selector) {
            return this.pushStack(winnow(this, selector || [], false));
          },
          not: function(selector) {
            return this.pushStack(winnow(this, selector || [], true));
          },
          is: function(selector) {
            return !!winnow(
              this,
              typeof selector === "string" && rneedsContext.test(selector) ? jQuery6(selector) : selector || [],
              false
            ).length;
          }
        });
        var rootjQuery, rquickExpr = /^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/, init = jQuery6.fn.init = function(selector, context) {
          var match, elem;
          if (!selector) {
            return this;
          }
          if (typeof selector === "string") {
            if (selector[0] === "<" && selector[selector.length - 1] === ">" && selector.length >= 3) {
              match = [null, selector, null];
            } else {
              match = rquickExpr.exec(selector);
            }
            if (match && (match[1] || !context)) {
              if (match[1]) {
                context = context instanceof jQuery6 ? context[0] : context;
                jQuery6.merge(this, jQuery6.parseHTML(
                  match[1],
                  context && context.nodeType ? context.ownerDocument || context : document2,
                  true
                ));
                if (rsingleTag.test(match[1]) && jQuery6.isPlainObject(context)) {
                  for (match in context) {
                    if (jQuery6.isFunction(this[match])) {
                      this[match](context[match]);
                    } else {
                      this.attr(match, context[match]);
                    }
                  }
                }
                return this;
              } else {
                elem = document2.getElementById(match[2]);
                if (elem && elem.parentNode) {
                  this.length = 1;
                  this[0] = elem;
                }
                this.context = document2;
                this.selector = selector;
                return this;
              }
            } else if (!context || context.jquery) {
              return (context || rootjQuery).find(selector);
            } else {
              return this.constructor(context).find(selector);
            }
          } else if (selector.nodeType) {
            this.context = this[0] = selector;
            this.length = 1;
            return this;
          } else if (jQuery6.isFunction(selector)) {
            return typeof rootjQuery.ready !== "undefined" ? rootjQuery.ready(selector) : selector(jQuery6);
          }
          if (selector.selector !== void 0) {
            this.selector = selector.selector;
            this.context = selector.context;
          }
          return jQuery6.makeArray(selector, this);
        };
        init.prototype = jQuery6.fn;
        rootjQuery = jQuery6(document2);
        var rparentsprev = /^(?:parents|prev(?:Until|All))/, guaranteedUnique = {
          children: true,
          contents: true,
          next: true,
          prev: true
        };
        jQuery6.extend({
          dir: function(elem, dir, until) {
            var matched = [], truncate = until !== void 0;
            while ((elem = elem[dir]) && elem.nodeType !== 9) {
              if (elem.nodeType === 1) {
                if (truncate && jQuery6(elem).is(until)) {
                  break;
                }
                matched.push(elem);
              }
            }
            return matched;
          },
          sibling: function(n, elem) {
            var matched = [];
            for (; n; n = n.nextSibling) {
              if (n.nodeType === 1 && n !== elem) {
                matched.push(n);
              }
            }
            return matched;
          }
        });
        jQuery6.fn.extend({
          has: function(target) {
            var targets = jQuery6(target, this), l = targets.length;
            return this.filter(function() {
              var i = 0;
              for (; i < l; i++) {
                if (jQuery6.contains(this, targets[i])) {
                  return true;
                }
              }
            });
          },
          closest: function(selectors, context) {
            var cur, i = 0, l = this.length, matched = [], pos = rneedsContext.test(selectors) || typeof selectors !== "string" ? jQuery6(selectors, context || this.context) : 0;
            for (; i < l; i++) {
              for (cur = this[i]; cur && cur !== context; cur = cur.parentNode) {
                if (cur.nodeType < 11 && (pos ? pos.index(cur) > -1 : cur.nodeType === 1 && jQuery6.find.matchesSelector(cur, selectors))) {
                  matched.push(cur);
                  break;
                }
              }
            }
            return this.pushStack(matched.length > 1 ? jQuery6.unique(matched) : matched);
          },
          index: function(elem) {
            if (!elem) {
              return this[0] && this[0].parentNode ? this.first().prevAll().length : -1;
            }
            if (typeof elem === "string") {
              return indexOf.call(jQuery6(elem), this[0]);
            }
            return indexOf.call(
              this,
              elem.jquery ? elem[0] : elem
            );
          },
          add: function(selector, context) {
            return this.pushStack(
              jQuery6.unique(
                jQuery6.merge(this.get(), jQuery6(selector, context))
              )
            );
          },
          addBack: function(selector) {
            return this.add(
              selector == null ? this.prevObject : this.prevObject.filter(selector)
            );
          }
        });
        function sibling(cur, dir) {
          while ((cur = cur[dir]) && cur.nodeType !== 1) {
          }
          return cur;
        }
        jQuery6.each({
          parent: function(elem) {
            var parent = elem.parentNode;
            return parent && parent.nodeType !== 11 ? parent : null;
          },
          parents: function(elem) {
            return jQuery6.dir(elem, "parentNode");
          },
          parentsUntil: function(elem, i, until) {
            return jQuery6.dir(elem, "parentNode", until);
          },
          next: function(elem) {
            return sibling(elem, "nextSibling");
          },
          prev: function(elem) {
            return sibling(elem, "previousSibling");
          },
          nextAll: function(elem) {
            return jQuery6.dir(elem, "nextSibling");
          },
          prevAll: function(elem) {
            return jQuery6.dir(elem, "previousSibling");
          },
          nextUntil: function(elem, i, until) {
            return jQuery6.dir(elem, "nextSibling", until);
          },
          prevUntil: function(elem, i, until) {
            return jQuery6.dir(elem, "previousSibling", until);
          },
          siblings: function(elem) {
            return jQuery6.sibling((elem.parentNode || {}).firstChild, elem);
          },
          children: function(elem) {
            return jQuery6.sibling(elem.firstChild);
          },
          contents: function(elem) {
            return elem.contentDocument || jQuery6.merge([], elem.childNodes);
          }
        }, function(name, fn) {
          jQuery6.fn[name] = function(until, selector) {
            var matched = jQuery6.map(this, fn, until);
            if (name.slice(-5) !== "Until") {
              selector = until;
            }
            if (selector && typeof selector === "string") {
              matched = jQuery6.filter(selector, matched);
            }
            if (this.length > 1) {
              if (!guaranteedUnique[name]) {
                jQuery6.unique(matched);
              }
              if (rparentsprev.test(name)) {
                matched.reverse();
              }
            }
            return this.pushStack(matched);
          };
        });
        var rnotwhite = /\S+/g;
        var optionsCache = {};
        function createOptions(options) {
          var object = optionsCache[options] = {};
          jQuery6.each(options.match(rnotwhite) || [], function(_, flag) {
            object[flag] = true;
          });
          return object;
        }
        jQuery6.Callbacks = function(options) {
          options = typeof options === "string" ? optionsCache[options] || createOptions(options) : jQuery6.extend({}, options);
          var memory, fired, firing, firingStart, firingLength, firingIndex, list = [], stack = !options.once && [], fire = function(data) {
            memory = options.memory && data;
            fired = true;
            firingIndex = firingStart || 0;
            firingStart = 0;
            firingLength = list.length;
            firing = true;
            for (; list && firingIndex < firingLength; firingIndex++) {
              if (list[firingIndex].apply(data[0], data[1]) === false && options.stopOnFalse) {
                memory = false;
                break;
              }
            }
            firing = false;
            if (list) {
              if (stack) {
                if (stack.length) {
                  fire(stack.shift());
                }
              } else if (memory) {
                list = [];
              } else {
                self2.disable();
              }
            }
          }, self2 = {
            add: function() {
              if (list) {
                var start = list.length;
                (function add(args) {
                  jQuery6.each(args, function(_, arg) {
                    var type = jQuery6.type(arg);
                    if (type === "function") {
                      if (!options.unique || !self2.has(arg)) {
                        list.push(arg);
                      }
                    } else if (arg && arg.length && type !== "string") {
                      add(arg);
                    }
                  });
                })(arguments);
                if (firing) {
                  firingLength = list.length;
                } else if (memory) {
                  firingStart = start;
                  fire(memory);
                }
              }
              return this;
            },
            remove: function() {
              if (list) {
                jQuery6.each(arguments, function(_, arg) {
                  var index;
                  while ((index = jQuery6.inArray(arg, list, index)) > -1) {
                    list.splice(index, 1);
                    if (firing) {
                      if (index <= firingLength) {
                        firingLength--;
                      }
                      if (index <= firingIndex) {
                        firingIndex--;
                      }
                    }
                  }
                });
              }
              return this;
            },
            has: function(fn) {
              return fn ? jQuery6.inArray(fn, list) > -1 : !!(list && list.length);
            },
            empty: function() {
              list = [];
              firingLength = 0;
              return this;
            },
            disable: function() {
              list = stack = memory = void 0;
              return this;
            },
            disabled: function() {
              return !list;
            },
            lock: function() {
              stack = void 0;
              if (!memory) {
                self2.disable();
              }
              return this;
            },
            locked: function() {
              return !stack;
            },
            fireWith: function(context, args) {
              if (list && (!fired || stack)) {
                args = args || [];
                args = [context, args.slice ? args.slice() : args];
                if (firing) {
                  stack.push(args);
                } else {
                  fire(args);
                }
              }
              return this;
            },
            fire: function() {
              self2.fireWith(this, arguments);
              return this;
            },
            fired: function() {
              return !!fired;
            }
          };
          return self2;
        };
        jQuery6.extend({
          Deferred: function(func) {
            var tuples = [
              ["resolve", "done", jQuery6.Callbacks("once memory"), "resolved"],
              ["reject", "fail", jQuery6.Callbacks("once memory"), "rejected"],
              ["notify", "progress", jQuery6.Callbacks("memory")]
            ], state = "pending", promise = {
              state: function() {
                return state;
              },
              always: function() {
                deferred.done(arguments).fail(arguments);
                return this;
              },
              then: function() {
                var fns = arguments;
                return jQuery6.Deferred(function(newDefer) {
                  jQuery6.each(tuples, function(i, tuple) {
                    var fn = jQuery6.isFunction(fns[i]) && fns[i];
                    deferred[tuple[1]](function() {
                      var returned = fn && fn.apply(this, arguments);
                      if (returned && jQuery6.isFunction(returned.promise)) {
                        returned.promise().done(newDefer.resolve).fail(newDefer.reject).progress(newDefer.notify);
                      } else {
                        newDefer[tuple[0] + "With"](this === promise ? newDefer.promise() : this, fn ? [returned] : arguments);
                      }
                    });
                  });
                  fns = null;
                }).promise();
              },
              promise: function(obj) {
                return obj != null ? jQuery6.extend(obj, promise) : promise;
              }
            }, deferred = {};
            promise.pipe = promise.then;
            jQuery6.each(tuples, function(i, tuple) {
              var list = tuple[2], stateString = tuple[3];
              promise[tuple[1]] = list.add;
              if (stateString) {
                list.add(function() {
                  state = stateString;
                }, tuples[i ^ 1][2].disable, tuples[2][2].lock);
              }
              deferred[tuple[0]] = function() {
                deferred[tuple[0] + "With"](this === deferred ? promise : this, arguments);
                return this;
              };
              deferred[tuple[0] + "With"] = list.fireWith;
            });
            promise.promise(deferred);
            if (func) {
              func.call(deferred, deferred);
            }
            return deferred;
          },
          when: function(subordinate) {
            var i = 0, resolveValues = slice.call(arguments), length = resolveValues.length, remaining = length !== 1 || subordinate && jQuery6.isFunction(subordinate.promise) ? length : 0, deferred = remaining === 1 ? subordinate : jQuery6.Deferred(), updateFunc = function(i2, contexts, values) {
              return function(value) {
                contexts[i2] = this;
                values[i2] = arguments.length > 1 ? slice.call(arguments) : value;
                if (values === progressValues) {
                  deferred.notifyWith(contexts, values);
                } else if (!--remaining) {
                  deferred.resolveWith(contexts, values);
                }
              };
            }, progressValues, progressContexts, resolveContexts;
            if (length > 1) {
              progressValues = new Array(length);
              progressContexts = new Array(length);
              resolveContexts = new Array(length);
              for (; i < length; i++) {
                if (resolveValues[i] && jQuery6.isFunction(resolveValues[i].promise)) {
                  resolveValues[i].promise().done(updateFunc(i, resolveContexts, resolveValues)).fail(deferred.reject).progress(updateFunc(i, progressContexts, progressValues));
                } else {
                  --remaining;
                }
              }
            }
            if (!remaining) {
              deferred.resolveWith(resolveContexts, resolveValues);
            }
            return deferred.promise();
          }
        });
        var readyList;
        jQuery6.fn.ready = function(fn) {
          jQuery6.ready.promise().done(fn);
          return this;
        };
        jQuery6.extend({
          isReady: false,
          readyWait: 1,
          holdReady: function(hold) {
            if (hold) {
              jQuery6.readyWait++;
            } else {
              jQuery6.ready(true);
            }
          },
          ready: function(wait) {
            if (wait === true ? --jQuery6.readyWait : jQuery6.isReady) {
              return;
            }
            jQuery6.isReady = true;
            if (wait !== true && --jQuery6.readyWait > 0) {
              return;
            }
            readyList.resolveWith(document2, [jQuery6]);
            if (jQuery6.fn.triggerHandler) {
              jQuery6(document2).triggerHandler("ready");
              jQuery6(document2).off("ready");
            }
          }
        });
        function completed() {
          document2.removeEventListener("DOMContentLoaded", completed, false);
          window2.removeEventListener("load", completed, false);
          jQuery6.ready();
        }
        jQuery6.ready.promise = function(obj) {
          if (!readyList) {
            readyList = jQuery6.Deferred();
            if (document2.readyState === "complete") {
              setTimeout(jQuery6.ready);
            } else {
              document2.addEventListener("DOMContentLoaded", completed, false);
              window2.addEventListener("load", completed, false);
            }
          }
          return readyList.promise(obj);
        };
        jQuery6.ready.promise();
        var access = jQuery6.access = function(elems, fn, key, value, chainable, emptyGet, raw) {
          var i = 0, len = elems.length, bulk = key == null;
          if (jQuery6.type(key) === "object") {
            chainable = true;
            for (i in key) {
              jQuery6.access(elems, fn, i, key[i], true, emptyGet, raw);
            }
          } else if (value !== void 0) {
            chainable = true;
            if (!jQuery6.isFunction(value)) {
              raw = true;
            }
            if (bulk) {
              if (raw) {
                fn.call(elems, value);
                fn = null;
              } else {
                bulk = fn;
                fn = function(elem, key2, value2) {
                  return bulk.call(jQuery6(elem), value2);
                };
              }
            }
            if (fn) {
              for (; i < len; i++) {
                fn(elems[i], key, raw ? value : value.call(elems[i], i, fn(elems[i], key)));
              }
            }
          }
          return chainable ? elems : bulk ? fn.call(elems) : len ? fn(elems[0], key) : emptyGet;
        };
        jQuery6.acceptData = function(owner) {
          return owner.nodeType === 1 || owner.nodeType === 9 || !+owner.nodeType;
        };
        function Data() {
          Object.defineProperty(this.cache = {}, 0, {
            get: function() {
              return {};
            }
          });
          this.expando = jQuery6.expando + Data.uid++;
        }
        Data.uid = 1;
        Data.accepts = jQuery6.acceptData;
        Data.prototype = {
          key: function(owner) {
            if (!Data.accepts(owner)) {
              return 0;
            }
            var descriptor = {}, unlock = owner[this.expando];
            if (!unlock) {
              unlock = Data.uid++;
              try {
                descriptor[this.expando] = { value: unlock };
                Object.defineProperties(owner, descriptor);
              } catch (e) {
                descriptor[this.expando] = unlock;
                jQuery6.extend(owner, descriptor);
              }
            }
            if (!this.cache[unlock]) {
              this.cache[unlock] = {};
            }
            return unlock;
          },
          set: function(owner, data, value) {
            var prop, unlock = this.key(owner), cache = this.cache[unlock];
            if (typeof data === "string") {
              cache[data] = value;
            } else {
              if (jQuery6.isEmptyObject(cache)) {
                jQuery6.extend(this.cache[unlock], data);
              } else {
                for (prop in data) {
                  cache[prop] = data[prop];
                }
              }
            }
            return cache;
          },
          get: function(owner, key) {
            var cache = this.cache[this.key(owner)];
            return key === void 0 ? cache : cache[key];
          },
          access: function(owner, key, value) {
            var stored;
            if (key === void 0 || key && typeof key === "string" && value === void 0) {
              stored = this.get(owner, key);
              return stored !== void 0 ? stored : this.get(owner, jQuery6.camelCase(key));
            }
            this.set(owner, key, value);
            return value !== void 0 ? value : key;
          },
          remove: function(owner, key) {
            var i, name, camel, unlock = this.key(owner), cache = this.cache[unlock];
            if (key === void 0) {
              this.cache[unlock] = {};
            } else {
              if (jQuery6.isArray(key)) {
                name = key.concat(key.map(jQuery6.camelCase));
              } else {
                camel = jQuery6.camelCase(key);
                if (key in cache) {
                  name = [key, camel];
                } else {
                  name = camel;
                  name = name in cache ? [name] : name.match(rnotwhite) || [];
                }
              }
              i = name.length;
              while (i--) {
                delete cache[name[i]];
              }
            }
          },
          hasData: function(owner) {
            return !jQuery6.isEmptyObject(
              this.cache[owner[this.expando]] || {}
            );
          },
          discard: function(owner) {
            if (owner[this.expando]) {
              delete this.cache[owner[this.expando]];
            }
          }
        };
        var data_priv = new Data();
        var data_user = new Data();
        var rbrace = /^(?:\{[\w\W]*\}|\[[\w\W]*\])$/, rmultiDash = /([A-Z])/g;
        function dataAttr(elem, key, data) {
          var name;
          if (data === void 0 && elem.nodeType === 1) {
            name = "data-" + key.replace(rmultiDash, "-$1").toLowerCase();
            data = elem.getAttribute(name);
            if (typeof data === "string") {
              try {
                data = data === "true" ? true : data === "false" ? false : data === "null" ? null : +data + "" === data ? +data : rbrace.test(data) ? jQuery6.parseJSON(data) : data;
              } catch (e) {
              }
              data_user.set(elem, key, data);
            } else {
              data = void 0;
            }
          }
          return data;
        }
        jQuery6.extend({
          hasData: function(elem) {
            return data_user.hasData(elem) || data_priv.hasData(elem);
          },
          data: function(elem, name, data) {
            return data_user.access(elem, name, data);
          },
          removeData: function(elem, name) {
            data_user.remove(elem, name);
          },
          _data: function(elem, name, data) {
            return data_priv.access(elem, name, data);
          },
          _removeData: function(elem, name) {
            data_priv.remove(elem, name);
          }
        });
        jQuery6.fn.extend({
          data: function(key, value) {
            var i, name, data, elem = this[0], attrs = elem && elem.attributes;
            if (key === void 0) {
              if (this.length) {
                data = data_user.get(elem);
                if (elem.nodeType === 1 && !data_priv.get(elem, "hasDataAttrs")) {
                  i = attrs.length;
                  while (i--) {
                    if (attrs[i]) {
                      name = attrs[i].name;
                      if (name.indexOf("data-") === 0) {
                        name = jQuery6.camelCase(name.slice(5));
                        dataAttr(elem, name, data[name]);
                      }
                    }
                  }
                  data_priv.set(elem, "hasDataAttrs", true);
                }
              }
              return data;
            }
            if (typeof key === "object") {
              return this.each(function() {
                data_user.set(this, key);
              });
            }
            return access(this, function(value2) {
              var data2, camelKey = jQuery6.camelCase(key);
              if (elem && value2 === void 0) {
                data2 = data_user.get(elem, key);
                if (data2 !== void 0) {
                  return data2;
                }
                data2 = data_user.get(elem, camelKey);
                if (data2 !== void 0) {
                  return data2;
                }
                data2 = dataAttr(elem, camelKey, void 0);
                if (data2 !== void 0) {
                  return data2;
                }
                return;
              }
              this.each(function() {
                var data3 = data_user.get(this, camelKey);
                data_user.set(this, camelKey, value2);
                if (key.indexOf("-") !== -1 && data3 !== void 0) {
                  data_user.set(this, key, value2);
                }
              });
            }, null, value, arguments.length > 1, null, true);
          },
          removeData: function(key) {
            return this.each(function() {
              data_user.remove(this, key);
            });
          }
        });
        jQuery6.extend({
          queue: function(elem, type, data) {
            var queue;
            if (elem) {
              type = (type || "fx") + "queue";
              queue = data_priv.get(elem, type);
              if (data) {
                if (!queue || jQuery6.isArray(data)) {
                  queue = data_priv.access(elem, type, jQuery6.makeArray(data));
                } else {
                  queue.push(data);
                }
              }
              return queue || [];
            }
          },
          dequeue: function(elem, type) {
            type = type || "fx";
            var queue = jQuery6.queue(elem, type), startLength = queue.length, fn = queue.shift(), hooks = jQuery6._queueHooks(elem, type), next = function() {
              jQuery6.dequeue(elem, type);
            };
            if (fn === "inprogress") {
              fn = queue.shift();
              startLength--;
            }
            if (fn) {
              if (type === "fx") {
                queue.unshift("inprogress");
              }
              delete hooks.stop;
              fn.call(elem, next, hooks);
            }
            if (!startLength && hooks) {
              hooks.empty.fire();
            }
          },
          _queueHooks: function(elem, type) {
            var key = type + "queueHooks";
            return data_priv.get(elem, key) || data_priv.access(elem, key, {
              empty: jQuery6.Callbacks("once memory").add(function() {
                data_priv.remove(elem, [type + "queue", key]);
              })
            });
          }
        });
        jQuery6.fn.extend({
          queue: function(type, data) {
            var setter = 2;
            if (typeof type !== "string") {
              data = type;
              type = "fx";
              setter--;
            }
            if (arguments.length < setter) {
              return jQuery6.queue(this[0], type);
            }
            return data === void 0 ? this : this.each(function() {
              var queue = jQuery6.queue(this, type, data);
              jQuery6._queueHooks(this, type);
              if (type === "fx" && queue[0] !== "inprogress") {
                jQuery6.dequeue(this, type);
              }
            });
          },
          dequeue: function(type) {
            return this.each(function() {
              jQuery6.dequeue(this, type);
            });
          },
          clearQueue: function(type) {
            return this.queue(type || "fx", []);
          },
          promise: function(type, obj) {
            var tmp, count = 1, defer = jQuery6.Deferred(), elements = this, i = this.length, resolve = function() {
              if (!--count) {
                defer.resolveWith(elements, [elements]);
              }
            };
            if (typeof type !== "string") {
              obj = type;
              type = void 0;
            }
            type = type || "fx";
            while (i--) {
              tmp = data_priv.get(elements[i], type + "queueHooks");
              if (tmp && tmp.empty) {
                count++;
                tmp.empty.add(resolve);
              }
            }
            resolve();
            return defer.promise(obj);
          }
        });
        var pnum = /[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source;
        var cssExpand = ["Top", "Right", "Bottom", "Left"];
        var isHidden = function(elem, el) {
          elem = el || elem;
          return jQuery6.css(elem, "display") === "none" || !jQuery6.contains(elem.ownerDocument, elem);
        };
        var rcheckableType = /^(?:checkbox|radio)$/i;
        (function() {
          var fragment = document2.createDocumentFragment(), div = fragment.appendChild(document2.createElement("div")), input = document2.createElement("input");
          input.setAttribute("type", "radio");
          input.setAttribute("checked", "checked");
          input.setAttribute("name", "t");
          div.appendChild(input);
          support.checkClone = div.cloneNode(true).cloneNode(true).lastChild.checked;
          div.innerHTML = "<textarea>x</textarea>";
          support.noCloneChecked = !!div.cloneNode(true).lastChild.defaultValue;
        })();
        var strundefined = "undefined";
        support.focusinBubbles = "onfocusin" in window2;
        var rkeyEvent = /^key/, rmouseEvent = /^(?:mouse|pointer|contextmenu)|click/, rfocusMorph = /^(?:focusinfocus|focusoutblur)$/, rtypenamespace = /^([^.]*)(?:\.(.+)|)$/;
        function returnTrue() {
          return true;
        }
        function returnFalse() {
          return false;
        }
        function safeActiveElement() {
          try {
            return document2.activeElement;
          } catch (err) {
          }
        }
        jQuery6.event = {
          global: {},
          add: function(elem, types, handler, data, selector) {
            var handleObjIn, eventHandle, tmp, events, t, handleObj, special, handlers, type, namespaces, origType, elemData = data_priv.get(elem);
            if (!elemData) {
              return;
            }
            if (handler.handler) {
              handleObjIn = handler;
              handler = handleObjIn.handler;
              selector = handleObjIn.selector;
            }
            if (!handler.guid) {
              handler.guid = jQuery6.guid++;
            }
            if (!(events = elemData.events)) {
              events = elemData.events = {};
            }
            if (!(eventHandle = elemData.handle)) {
              eventHandle = elemData.handle = function(e) {
                return typeof jQuery6 !== strundefined && jQuery6.event.triggered !== e.type ? jQuery6.event.dispatch.apply(elem, arguments) : void 0;
              };
            }
            types = (types || "").match(rnotwhite) || [""];
            t = types.length;
            while (t--) {
              tmp = rtypenamespace.exec(types[t]) || [];
              type = origType = tmp[1];
              namespaces = (tmp[2] || "").split(".").sort();
              if (!type) {
                continue;
              }
              special = jQuery6.event.special[type] || {};
              type = (selector ? special.delegateType : special.bindType) || type;
              special = jQuery6.event.special[type] || {};
              handleObj = jQuery6.extend({
                type,
                origType,
                data,
                handler,
                guid: handler.guid,
                selector,
                needsContext: selector && jQuery6.expr.match.needsContext.test(selector),
                namespace: namespaces.join(".")
              }, handleObjIn);
              if (!(handlers = events[type])) {
                handlers = events[type] = [];
                handlers.delegateCount = 0;
                if (!special.setup || special.setup.call(elem, data, namespaces, eventHandle) === false) {
                  if (elem.addEventListener) {
                    elem.addEventListener(type, eventHandle, false);
                  }
                }
              }
              if (special.add) {
                special.add.call(elem, handleObj);
                if (!handleObj.handler.guid) {
                  handleObj.handler.guid = handler.guid;
                }
              }
              if (selector) {
                handlers.splice(handlers.delegateCount++, 0, handleObj);
              } else {
                handlers.push(handleObj);
              }
              jQuery6.event.global[type] = true;
            }
          },
          remove: function(elem, types, handler, selector, mappedTypes) {
            var j, origCount, tmp, events, t, handleObj, special, handlers, type, namespaces, origType, elemData = data_priv.hasData(elem) && data_priv.get(elem);
            if (!elemData || !(events = elemData.events)) {
              return;
            }
            types = (types || "").match(rnotwhite) || [""];
            t = types.length;
            while (t--) {
              tmp = rtypenamespace.exec(types[t]) || [];
              type = origType = tmp[1];
              namespaces = (tmp[2] || "").split(".").sort();
              if (!type) {
                for (type in events) {
                  jQuery6.event.remove(elem, type + types[t], handler, selector, true);
                }
                continue;
              }
              special = jQuery6.event.special[type] || {};
              type = (selector ? special.delegateType : special.bindType) || type;
              handlers = events[type] || [];
              tmp = tmp[2] && new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)");
              origCount = j = handlers.length;
              while (j--) {
                handleObj = handlers[j];
                if ((mappedTypes || origType === handleObj.origType) && (!handler || handler.guid === handleObj.guid) && (!tmp || tmp.test(handleObj.namespace)) && (!selector || selector === handleObj.selector || selector === "**" && handleObj.selector)) {
                  handlers.splice(j, 1);
                  if (handleObj.selector) {
                    handlers.delegateCount--;
                  }
                  if (special.remove) {
                    special.remove.call(elem, handleObj);
                  }
                }
              }
              if (origCount && !handlers.length) {
                if (!special.teardown || special.teardown.call(elem, namespaces, elemData.handle) === false) {
                  jQuery6.removeEvent(elem, type, elemData.handle);
                }
                delete events[type];
              }
            }
            if (jQuery6.isEmptyObject(events)) {
              delete elemData.handle;
              data_priv.remove(elem, "events");
            }
          },
          trigger: function(event, data, elem, onlyHandlers) {
            var i, cur, tmp, bubbleType, ontype, handle, special, eventPath = [elem || document2], type = hasOwn.call(event, "type") ? event.type : event, namespaces = hasOwn.call(event, "namespace") ? event.namespace.split(".") : [];
            cur = tmp = elem = elem || document2;
            if (elem.nodeType === 3 || elem.nodeType === 8) {
              return;
            }
            if (rfocusMorph.test(type + jQuery6.event.triggered)) {
              return;
            }
            if (type.indexOf(".") >= 0) {
              namespaces = type.split(".");
              type = namespaces.shift();
              namespaces.sort();
            }
            ontype = type.indexOf(":") < 0 && "on" + type;
            event = event[jQuery6.expando] ? event : new jQuery6.Event(type, typeof event === "object" && event);
            event.isTrigger = onlyHandlers ? 2 : 3;
            event.namespace = namespaces.join(".");
            event.namespace_re = event.namespace ? new RegExp("(^|\\.)" + namespaces.join("\\.(?:.*\\.|)") + "(\\.|$)") : null;
            event.result = void 0;
            if (!event.target) {
              event.target = elem;
            }
            data = data == null ? [event] : jQuery6.makeArray(data, [event]);
            special = jQuery6.event.special[type] || {};
            if (!onlyHandlers && special.trigger && special.trigger.apply(elem, data) === false) {
              return;
            }
            if (!onlyHandlers && !special.noBubble && !jQuery6.isWindow(elem)) {
              bubbleType = special.delegateType || type;
              if (!rfocusMorph.test(bubbleType + type)) {
                cur = cur.parentNode;
              }
              for (; cur; cur = cur.parentNode) {
                eventPath.push(cur);
                tmp = cur;
              }
              if (tmp === (elem.ownerDocument || document2)) {
                eventPath.push(tmp.defaultView || tmp.parentWindow || window2);
              }
            }
            i = 0;
            while ((cur = eventPath[i++]) && !event.isPropagationStopped()) {
              event.type = i > 1 ? bubbleType : special.bindType || type;
              handle = (data_priv.get(cur, "events") || {})[event.type] && data_priv.get(cur, "handle");
              if (handle) {
                handle.apply(cur, data);
              }
              handle = ontype && cur[ontype];
              if (handle && handle.apply && jQuery6.acceptData(cur)) {
                event.result = handle.apply(cur, data);
                if (event.result === false) {
                  event.preventDefault();
                }
              }
            }
            event.type = type;
            if (!onlyHandlers && !event.isDefaultPrevented()) {
              if ((!special._default || special._default.apply(eventPath.pop(), data) === false) && jQuery6.acceptData(elem)) {
                if (ontype && jQuery6.isFunction(elem[type]) && !jQuery6.isWindow(elem)) {
                  tmp = elem[ontype];
                  if (tmp) {
                    elem[ontype] = null;
                  }
                  jQuery6.event.triggered = type;
                  elem[type]();
                  jQuery6.event.triggered = void 0;
                  if (tmp) {
                    elem[ontype] = tmp;
                  }
                }
              }
            }
            return event.result;
          },
          dispatch: function(event) {
            event = jQuery6.event.fix(event);
            var i, j, ret, matched, handleObj, handlerQueue = [], args = slice.call(arguments), handlers = (data_priv.get(this, "events") || {})[event.type] || [], special = jQuery6.event.special[event.type] || {};
            args[0] = event;
            event.delegateTarget = this;
            if (special.preDispatch && special.preDispatch.call(this, event) === false) {
              return;
            }
            handlerQueue = jQuery6.event.handlers.call(this, event, handlers);
            i = 0;
            while ((matched = handlerQueue[i++]) && !event.isPropagationStopped()) {
              event.currentTarget = matched.elem;
              j = 0;
              while ((handleObj = matched.handlers[j++]) && !event.isImmediatePropagationStopped()) {
                if (!event.namespace_re || event.namespace_re.test(handleObj.namespace)) {
                  event.handleObj = handleObj;
                  event.data = handleObj.data;
                  ret = ((jQuery6.event.special[handleObj.origType] || {}).handle || handleObj.handler).apply(matched.elem, args);
                  if (ret !== void 0) {
                    if ((event.result = ret) === false) {
                      event.preventDefault();
                      event.stopPropagation();
                    }
                  }
                }
              }
            }
            if (special.postDispatch) {
              special.postDispatch.call(this, event);
            }
            return event.result;
          },
          handlers: function(event, handlers) {
            var i, matches, sel, handleObj, handlerQueue = [], delegateCount = handlers.delegateCount, cur = event.target;
            if (delegateCount && cur.nodeType && (!event.button || event.type !== "click")) {
              for (; cur !== this; cur = cur.parentNode || this) {
                if (cur.disabled !== true || event.type !== "click") {
                  matches = [];
                  for (i = 0; i < delegateCount; i++) {
                    handleObj = handlers[i];
                    sel = handleObj.selector + " ";
                    if (matches[sel] === void 0) {
                      matches[sel] = handleObj.needsContext ? jQuery6(sel, this).index(cur) >= 0 : jQuery6.find(sel, this, null, [cur]).length;
                    }
                    if (matches[sel]) {
                      matches.push(handleObj);
                    }
                  }
                  if (matches.length) {
                    handlerQueue.push({ elem: cur, handlers: matches });
                  }
                }
              }
            }
            if (delegateCount < handlers.length) {
              handlerQueue.push({ elem: this, handlers: handlers.slice(delegateCount) });
            }
            return handlerQueue;
          },
          props: "altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
          fixHooks: {},
          keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function(event, original) {
              if (event.which == null) {
                event.which = original.charCode != null ? original.charCode : original.keyCode;
              }
              return event;
            }
          },
          mouseHooks: {
            props: "button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function(event, original) {
              var eventDoc, doc, body, button = original.button;
              if (event.pageX == null && original.clientX != null) {
                eventDoc = event.target.ownerDocument || document2;
                doc = eventDoc.documentElement;
                body = eventDoc.body;
                event.pageX = original.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0);
                event.pageY = original.clientY + (doc && doc.scrollTop || body && body.scrollTop || 0) - (doc && doc.clientTop || body && body.clientTop || 0);
              }
              if (!event.which && button !== void 0) {
                event.which = button & 1 ? 1 : button & 2 ? 3 : button & 4 ? 2 : 0;
              }
              return event;
            }
          },
          fix: function(event) {
            if (event[jQuery6.expando]) {
              return event;
            }
            var i, prop, copy, type = event.type, originalEvent = event, fixHook = this.fixHooks[type];
            if (!fixHook) {
              this.fixHooks[type] = fixHook = rmouseEvent.test(type) ? this.mouseHooks : rkeyEvent.test(type) ? this.keyHooks : {};
            }
            copy = fixHook.props ? this.props.concat(fixHook.props) : this.props;
            event = new jQuery6.Event(originalEvent);
            i = copy.length;
            while (i--) {
              prop = copy[i];
              event[prop] = originalEvent[prop];
            }
            if (!event.target) {
              event.target = document2;
            }
            if (event.target.nodeType === 3) {
              event.target = event.target.parentNode;
            }
            return fixHook.filter ? fixHook.filter(event, originalEvent) : event;
          },
          special: {
            load: {
              noBubble: true
            },
            focus: {
              trigger: function() {
                if (this !== safeActiveElement() && this.focus) {
                  this.focus();
                  return false;
                }
              },
              delegateType: "focusin"
            },
            blur: {
              trigger: function() {
                if (this === safeActiveElement() && this.blur) {
                  this.blur();
                  return false;
                }
              },
              delegateType: "focusout"
            },
            click: {
              trigger: function() {
                if (this.type === "checkbox" && this.click && jQuery6.nodeName(this, "input")) {
                  this.click();
                  return false;
                }
              },
              _default: function(event) {
                return jQuery6.nodeName(event.target, "a");
              }
            },
            beforeunload: {
              postDispatch: function(event) {
                if (event.result !== void 0 && event.originalEvent) {
                  event.originalEvent.returnValue = event.result;
                }
              }
            }
          },
          simulate: function(type, elem, event, bubble) {
            var e = jQuery6.extend(
              new jQuery6.Event(),
              event,
              {
                type,
                isSimulated: true,
                originalEvent: {}
              }
            );
            if (bubble) {
              jQuery6.event.trigger(e, null, elem);
            } else {
              jQuery6.event.dispatch.call(elem, e);
            }
            if (e.isDefaultPrevented()) {
              event.preventDefault();
            }
          }
        };
        jQuery6.removeEvent = function(elem, type, handle) {
          if (elem.removeEventListener) {
            elem.removeEventListener(type, handle, false);
          }
        };
        jQuery6.Event = function(src, props) {
          if (!(this instanceof jQuery6.Event)) {
            return new jQuery6.Event(src, props);
          }
          if (src && src.type) {
            this.originalEvent = src;
            this.type = src.type;
            this.isDefaultPrevented = src.defaultPrevented || src.defaultPrevented === void 0 && src.returnValue === false ? returnTrue : returnFalse;
          } else {
            this.type = src;
          }
          if (props) {
            jQuery6.extend(this, props);
          }
          this.timeStamp = src && src.timeStamp || jQuery6.now();
          this[jQuery6.expando] = true;
        };
        jQuery6.Event.prototype = {
          isDefaultPrevented: returnFalse,
          isPropagationStopped: returnFalse,
          isImmediatePropagationStopped: returnFalse,
          preventDefault: function() {
            var e = this.originalEvent;
            this.isDefaultPrevented = returnTrue;
            if (e && e.preventDefault) {
              e.preventDefault();
            }
          },
          stopPropagation: function() {
            var e = this.originalEvent;
            this.isPropagationStopped = returnTrue;
            if (e && e.stopPropagation) {
              e.stopPropagation();
            }
          },
          stopImmediatePropagation: function() {
            var e = this.originalEvent;
            this.isImmediatePropagationStopped = returnTrue;
            if (e && e.stopImmediatePropagation) {
              e.stopImmediatePropagation();
            }
            this.stopPropagation();
          }
        };
        jQuery6.each({
          mouseenter: "mouseover",
          mouseleave: "mouseout",
          pointerenter: "pointerover",
          pointerleave: "pointerout"
        }, function(orig, fix) {
          jQuery6.event.special[orig] = {
            delegateType: fix,
            bindType: fix,
            handle: function(event) {
              var ret, target = this, related = event.relatedTarget, handleObj = event.handleObj;
              if (!related || related !== target && !jQuery6.contains(target, related)) {
                event.type = handleObj.origType;
                ret = handleObj.handler.apply(this, arguments);
                event.type = fix;
              }
              return ret;
            }
          };
        });
        if (!support.focusinBubbles) {
          jQuery6.each({ focus: "focusin", blur: "focusout" }, function(orig, fix) {
            var handler = function(event) {
              jQuery6.event.simulate(fix, event.target, jQuery6.event.fix(event), true);
            };
            jQuery6.event.special[fix] = {
              setup: function() {
                var doc = this.ownerDocument || this, attaches = data_priv.access(doc, fix);
                if (!attaches) {
                  doc.addEventListener(orig, handler, true);
                }
                data_priv.access(doc, fix, (attaches || 0) + 1);
              },
              teardown: function() {
                var doc = this.ownerDocument || this, attaches = data_priv.access(doc, fix) - 1;
                if (!attaches) {
                  doc.removeEventListener(orig, handler, true);
                  data_priv.remove(doc, fix);
                } else {
                  data_priv.access(doc, fix, attaches);
                }
              }
            };
          });
        }
        jQuery6.fn.extend({
          on: function(types, selector, data, fn, one) {
            var origFn, type;
            if (typeof types === "object") {
              if (typeof selector !== "string") {
                data = data || selector;
                selector = void 0;
              }
              for (type in types) {
                this.on(type, selector, data, types[type], one);
              }
              return this;
            }
            if (data == null && fn == null) {
              fn = selector;
              data = selector = void 0;
            } else if (fn == null) {
              if (typeof selector === "string") {
                fn = data;
                data = void 0;
              } else {
                fn = data;
                data = selector;
                selector = void 0;
              }
            }
            if (fn === false) {
              fn = returnFalse;
            } else if (!fn) {
              return this;
            }
            if (one === 1) {
              origFn = fn;
              fn = function(event) {
                jQuery6().off(event);
                return origFn.apply(this, arguments);
              };
              fn.guid = origFn.guid || (origFn.guid = jQuery6.guid++);
            }
            return this.each(function() {
              jQuery6.event.add(this, types, fn, data, selector);
            });
          },
          one: function(types, selector, data, fn) {
            return this.on(types, selector, data, fn, 1);
          },
          off: function(types, selector, fn) {
            var handleObj, type;
            if (types && types.preventDefault && types.handleObj) {
              handleObj = types.handleObj;
              jQuery6(types.delegateTarget).off(
                handleObj.namespace ? handleObj.origType + "." + handleObj.namespace : handleObj.origType,
                handleObj.selector,
                handleObj.handler
              );
              return this;
            }
            if (typeof types === "object") {
              for (type in types) {
                this.off(type, selector, types[type]);
              }
              return this;
            }
            if (selector === false || typeof selector === "function") {
              fn = selector;
              selector = void 0;
            }
            if (fn === false) {
              fn = returnFalse;
            }
            return this.each(function() {
              jQuery6.event.remove(this, types, fn, selector);
            });
          },
          trigger: function(type, data) {
            return this.each(function() {
              jQuery6.event.trigger(type, data, this);
            });
          },
          triggerHandler: function(type, data) {
            var elem = this[0];
            if (elem) {
              return jQuery6.event.trigger(type, data, elem, true);
            }
          }
        });
        var rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi, rtagName = /<([\w:]+)/, rhtml = /<|&#?\w+;/, rnoInnerhtml = /<(?:script|style|link)/i, rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i, rscriptType = /^$|\/(?:java|ecma)script/i, rscriptTypeMasked = /^true\/(.*)/, rcleanScript = /^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g, wrapMap = {
          option: [1, "<select multiple='multiple'>", "</select>"],
          thead: [1, "<table>", "</table>"],
          col: [2, "<table><colgroup>", "</colgroup></table>"],
          tr: [2, "<table><tbody>", "</tbody></table>"],
          td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
          _default: [0, "", ""]
        };
        wrapMap.optgroup = wrapMap.option;
        wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
        wrapMap.th = wrapMap.td;
        function manipulationTarget(elem, content) {
          return jQuery6.nodeName(elem, "table") && jQuery6.nodeName(content.nodeType !== 11 ? content : content.firstChild, "tr") ? elem.getElementsByTagName("tbody")[0] || elem.appendChild(elem.ownerDocument.createElement("tbody")) : elem;
        }
        function disableScript(elem) {
          elem.type = (elem.getAttribute("type") !== null) + "/" + elem.type;
          return elem;
        }
        function restoreScript(elem) {
          var match = rscriptTypeMasked.exec(elem.type);
          if (match) {
            elem.type = match[1];
          } else {
            elem.removeAttribute("type");
          }
          return elem;
        }
        function setGlobalEval(elems, refElements) {
          var i = 0, l = elems.length;
          for (; i < l; i++) {
            data_priv.set(
              elems[i],
              "globalEval",
              !refElements || data_priv.get(refElements[i], "globalEval")
            );
          }
        }
        function cloneCopyEvent(src, dest) {
          var i, l, type, pdataOld, pdataCur, udataOld, udataCur, events;
          if (dest.nodeType !== 1) {
            return;
          }
          if (data_priv.hasData(src)) {
            pdataOld = data_priv.access(src);
            pdataCur = data_priv.set(dest, pdataOld);
            events = pdataOld.events;
            if (events) {
              delete pdataCur.handle;
              pdataCur.events = {};
              for (type in events) {
                for (i = 0, l = events[type].length; i < l; i++) {
                  jQuery6.event.add(dest, type, events[type][i]);
                }
              }
            }
          }
          if (data_user.hasData(src)) {
            udataOld = data_user.access(src);
            udataCur = jQuery6.extend({}, udataOld);
            data_user.set(dest, udataCur);
          }
        }
        function getAll(context, tag) {
          var ret = context.getElementsByTagName ? context.getElementsByTagName(tag || "*") : context.querySelectorAll ? context.querySelectorAll(tag || "*") : [];
          return tag === void 0 || tag && jQuery6.nodeName(context, tag) ? jQuery6.merge([context], ret) : ret;
        }
        function fixInput(src, dest) {
          var nodeName = dest.nodeName.toLowerCase();
          if (nodeName === "input" && rcheckableType.test(src.type)) {
            dest.checked = src.checked;
          } else if (nodeName === "input" || nodeName === "textarea") {
            dest.defaultValue = src.defaultValue;
          }
        }
        jQuery6.extend({
          clone: function(elem, dataAndEvents, deepDataAndEvents) {
            var i, l, srcElements, destElements, clone = elem.cloneNode(true), inPage = jQuery6.contains(elem.ownerDocument, elem);
            if (!support.noCloneChecked && (elem.nodeType === 1 || elem.nodeType === 11) && !jQuery6.isXMLDoc(elem)) {
              destElements = getAll(clone);
              srcElements = getAll(elem);
              for (i = 0, l = srcElements.length; i < l; i++) {
                fixInput(srcElements[i], destElements[i]);
              }
            }
            if (dataAndEvents) {
              if (deepDataAndEvents) {
                srcElements = srcElements || getAll(elem);
                destElements = destElements || getAll(clone);
                for (i = 0, l = srcElements.length; i < l; i++) {
                  cloneCopyEvent(srcElements[i], destElements[i]);
                }
              } else {
                cloneCopyEvent(elem, clone);
              }
            }
            destElements = getAll(clone, "script");
            if (destElements.length > 0) {
              setGlobalEval(destElements, !inPage && getAll(elem, "script"));
            }
            return clone;
          },
          buildFragment: function(elems, context, scripts, selection) {
            var elem, tmp, tag, wrap, contains, j, fragment = context.createDocumentFragment(), nodes = [], i = 0, l = elems.length;
            for (; i < l; i++) {
              elem = elems[i];
              if (elem || elem === 0) {
                if (jQuery6.type(elem) === "object") {
                  jQuery6.merge(nodes, elem.nodeType ? [elem] : elem);
                } else if (!rhtml.test(elem)) {
                  nodes.push(context.createTextNode(elem));
                } else {
                  tmp = tmp || fragment.appendChild(context.createElement("div"));
                  tag = (rtagName.exec(elem) || ["", ""])[1].toLowerCase();
                  wrap = wrapMap[tag] || wrapMap._default;
                  tmp.innerHTML = wrap[1] + elem.replace(rxhtmlTag, "<$1></$2>") + wrap[2];
                  j = wrap[0];
                  while (j--) {
                    tmp = tmp.lastChild;
                  }
                  jQuery6.merge(nodes, tmp.childNodes);
                  tmp = fragment.firstChild;
                  tmp.textContent = "";
                }
              }
            }
            fragment.textContent = "";
            i = 0;
            while (elem = nodes[i++]) {
              if (selection && jQuery6.inArray(elem, selection) !== -1) {
                continue;
              }
              contains = jQuery6.contains(elem.ownerDocument, elem);
              tmp = getAll(fragment.appendChild(elem), "script");
              if (contains) {
                setGlobalEval(tmp);
              }
              if (scripts) {
                j = 0;
                while (elem = tmp[j++]) {
                  if (rscriptType.test(elem.type || "")) {
                    scripts.push(elem);
                  }
                }
              }
            }
            return fragment;
          },
          cleanData: function(elems) {
            var data, elem, type, key, special = jQuery6.event.special, i = 0;
            for (; (elem = elems[i]) !== void 0; i++) {
              if (jQuery6.acceptData(elem)) {
                key = elem[data_priv.expando];
                if (key && (data = data_priv.cache[key])) {
                  if (data.events) {
                    for (type in data.events) {
                      if (special[type]) {
                        jQuery6.event.remove(elem, type);
                      } else {
                        jQuery6.removeEvent(elem, type, data.handle);
                      }
                    }
                  }
                  if (data_priv.cache[key]) {
                    delete data_priv.cache[key];
                  }
                }
              }
              delete data_user.cache[elem[data_user.expando]];
            }
          }
        });
        jQuery6.fn.extend({
          text: function(value) {
            return access(this, function(value2) {
              return value2 === void 0 ? jQuery6.text(this) : this.empty().each(function() {
                if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                  this.textContent = value2;
                }
              });
            }, null, value, arguments.length);
          },
          append: function() {
            return this.domManip(arguments, function(elem) {
              if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                var target = manipulationTarget(this, elem);
                target.appendChild(elem);
              }
            });
          },
          prepend: function() {
            return this.domManip(arguments, function(elem) {
              if (this.nodeType === 1 || this.nodeType === 11 || this.nodeType === 9) {
                var target = manipulationTarget(this, elem);
                target.insertBefore(elem, target.firstChild);
              }
            });
          },
          before: function() {
            return this.domManip(arguments, function(elem) {
              if (this.parentNode) {
                this.parentNode.insertBefore(elem, this);
              }
            });
          },
          after: function() {
            return this.domManip(arguments, function(elem) {
              if (this.parentNode) {
                this.parentNode.insertBefore(elem, this.nextSibling);
              }
            });
          },
          remove: function(selector, keepData) {
            var elem, elems = selector ? jQuery6.filter(selector, this) : this, i = 0;
            for (; (elem = elems[i]) != null; i++) {
              if (!keepData && elem.nodeType === 1) {
                jQuery6.cleanData(getAll(elem));
              }
              if (elem.parentNode) {
                if (keepData && jQuery6.contains(elem.ownerDocument, elem)) {
                  setGlobalEval(getAll(elem, "script"));
                }
                elem.parentNode.removeChild(elem);
              }
            }
            return this;
          },
          empty: function() {
            var elem, i = 0;
            for (; (elem = this[i]) != null; i++) {
              if (elem.nodeType === 1) {
                jQuery6.cleanData(getAll(elem, false));
                elem.textContent = "";
              }
            }
            return this;
          },
          clone: function(dataAndEvents, deepDataAndEvents) {
            dataAndEvents = dataAndEvents == null ? false : dataAndEvents;
            deepDataAndEvents = deepDataAndEvents == null ? dataAndEvents : deepDataAndEvents;
            return this.map(function() {
              return jQuery6.clone(this, dataAndEvents, deepDataAndEvents);
            });
          },
          html: function(value) {
            return access(this, function(value2) {
              var elem = this[0] || {}, i = 0, l = this.length;
              if (value2 === void 0 && elem.nodeType === 1) {
                return elem.innerHTML;
              }
              if (typeof value2 === "string" && !rnoInnerhtml.test(value2) && !wrapMap[(rtagName.exec(value2) || ["", ""])[1].toLowerCase()]) {
                value2 = value2.replace(rxhtmlTag, "<$1></$2>");
                try {
                  for (; i < l; i++) {
                    elem = this[i] || {};
                    if (elem.nodeType === 1) {
                      jQuery6.cleanData(getAll(elem, false));
                      elem.innerHTML = value2;
                    }
                  }
                  elem = 0;
                } catch (e) {
                }
              }
              if (elem) {
                this.empty().append(value2);
              }
            }, null, value, arguments.length);
          },
          replaceWith: function() {
            var arg = arguments[0];
            this.domManip(arguments, function(elem) {
              arg = this.parentNode;
              jQuery6.cleanData(getAll(this));
              if (arg) {
                arg.replaceChild(elem, this);
              }
            });
            return arg && (arg.length || arg.nodeType) ? this : this.remove();
          },
          detach: function(selector) {
            return this.remove(selector, true);
          },
          domManip: function(args, callback) {
            args = concat.apply([], args);
            var fragment, first, scripts, hasScripts, node, doc, i = 0, l = this.length, set = this, iNoClone = l - 1, value = args[0], isFunction = jQuery6.isFunction(value);
            if (isFunction || l > 1 && typeof value === "string" && !support.checkClone && rchecked.test(value)) {
              return this.each(function(index) {
                var self2 = set.eq(index);
                if (isFunction) {
                  args[0] = value.call(this, index, self2.html());
                }
                self2.domManip(args, callback);
              });
            }
            if (l) {
              fragment = jQuery6.buildFragment(args, this[0].ownerDocument, false, this);
              first = fragment.firstChild;
              if (fragment.childNodes.length === 1) {
                fragment = first;
              }
              if (first) {
                scripts = jQuery6.map(getAll(fragment, "script"), disableScript);
                hasScripts = scripts.length;
                for (; i < l; i++) {
                  node = fragment;
                  if (i !== iNoClone) {
                    node = jQuery6.clone(node, true, true);
                    if (hasScripts) {
                      jQuery6.merge(scripts, getAll(node, "script"));
                    }
                  }
                  callback.call(this[i], node, i);
                }
                if (hasScripts) {
                  doc = scripts[scripts.length - 1].ownerDocument;
                  jQuery6.map(scripts, restoreScript);
                  for (i = 0; i < hasScripts; i++) {
                    node = scripts[i];
                    if (rscriptType.test(node.type || "") && !data_priv.access(node, "globalEval") && jQuery6.contains(doc, node)) {
                      if (node.src) {
                        if (jQuery6._evalUrl) {
                          jQuery6._evalUrl(node.src);
                        }
                      } else {
                        jQuery6.globalEval(node.textContent.replace(rcleanScript, ""));
                      }
                    }
                  }
                }
              }
            }
            return this;
          }
        });
        jQuery6.each({
          appendTo: "append",
          prependTo: "prepend",
          insertBefore: "before",
          insertAfter: "after",
          replaceAll: "replaceWith"
        }, function(name, original) {
          jQuery6.fn[name] = function(selector) {
            var elems, ret = [], insert = jQuery6(selector), last = insert.length - 1, i = 0;
            for (; i <= last; i++) {
              elems = i === last ? this : this.clone(true);
              jQuery6(insert[i])[original](elems);
              push.apply(ret, elems.get());
            }
            return this.pushStack(ret);
          };
        });
        var iframe, elemdisplay = {};
        function actualDisplay(name, doc) {
          var style, elem = jQuery6(doc.createElement(name)).appendTo(doc.body), display = window2.getDefaultComputedStyle && (style = window2.getDefaultComputedStyle(elem[0])) ? style.display : jQuery6.css(elem[0], "display");
          elem.detach();
          return display;
        }
        function defaultDisplay(nodeName) {
          var doc = document2, display = elemdisplay[nodeName];
          if (!display) {
            display = actualDisplay(nodeName, doc);
            if (display === "none" || !display) {
              iframe = (iframe || jQuery6("<iframe frameborder='0' width='0' height='0'/>")).appendTo(doc.documentElement);
              doc = iframe[0].contentDocument;
              doc.write();
              doc.close();
              display = actualDisplay(nodeName, doc);
              iframe.detach();
            }
            elemdisplay[nodeName] = display;
          }
          return display;
        }
        var rmargin = /^margin/;
        var rnumnonpx = new RegExp("^(" + pnum + ")(?!px)[a-z%]+$", "i");
        var getStyles = function(elem) {
          if (elem.ownerDocument.defaultView.opener) {
            return elem.ownerDocument.defaultView.getComputedStyle(elem, null);
          }
          return window2.getComputedStyle(elem, null);
        };
        function curCSS(elem, name, computed) {
          var width, minWidth, maxWidth, ret, style = elem.style;
          computed = computed || getStyles(elem);
          if (computed) {
            ret = computed.getPropertyValue(name) || computed[name];
          }
          if (computed) {
            if (ret === "" && !jQuery6.contains(elem.ownerDocument, elem)) {
              ret = jQuery6.style(elem, name);
            }
            if (rnumnonpx.test(ret) && rmargin.test(name)) {
              width = style.width;
              minWidth = style.minWidth;
              maxWidth = style.maxWidth;
              style.minWidth = style.maxWidth = style.width = ret;
              ret = computed.width;
              style.width = width;
              style.minWidth = minWidth;
              style.maxWidth = maxWidth;
            }
          }
          return ret !== void 0 ? ret + "" : ret;
        }
        function addGetHookIf(conditionFn, hookFn) {
          return {
            get: function() {
              if (conditionFn()) {
                delete this.get;
                return;
              }
              return (this.get = hookFn).apply(this, arguments);
            }
          };
        }
        (function() {
          var pixelPositionVal, boxSizingReliableVal, docElem2 = document2.documentElement, container = document2.createElement("div"), div = document2.createElement("div");
          if (!div.style) {
            return;
          }
          div.style.backgroundClip = "content-box";
          div.cloneNode(true).style.backgroundClip = "";
          support.clearCloneStyle = div.style.backgroundClip === "content-box";
          container.style.cssText = "border:0;width:0;height:0;top:0;left:-9999px;margin-top:1px;position:absolute";
          container.appendChild(div);
          function computePixelPositionAndBoxSizingReliable() {
            div.style.cssText = "-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;display:block;margin-top:1%;top:1%;border:1px;padding:1px;width:4px;position:absolute";
            div.innerHTML = "";
            docElem2.appendChild(container);
            var divStyle = window2.getComputedStyle(div, null);
            pixelPositionVal = divStyle.top !== "1%";
            boxSizingReliableVal = divStyle.width === "4px";
            docElem2.removeChild(container);
          }
          if (window2.getComputedStyle) {
            jQuery6.extend(support, {
              pixelPosition: function() {
                computePixelPositionAndBoxSizingReliable();
                return pixelPositionVal;
              },
              boxSizingReliable: function() {
                if (boxSizingReliableVal == null) {
                  computePixelPositionAndBoxSizingReliable();
                }
                return boxSizingReliableVal;
              },
              reliableMarginRight: function() {
                var ret, marginDiv = div.appendChild(document2.createElement("div"));
                marginDiv.style.cssText = div.style.cssText = "-webkit-box-sizing:content-box;-moz-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0";
                marginDiv.style.marginRight = marginDiv.style.width = "0";
                div.style.width = "1px";
                docElem2.appendChild(container);
                ret = !parseFloat(window2.getComputedStyle(marginDiv, null).marginRight);
                docElem2.removeChild(container);
                div.removeChild(marginDiv);
                return ret;
              }
            });
          }
        })();
        jQuery6.swap = function(elem, options, callback, args) {
          var ret, name, old = {};
          for (name in options) {
            old[name] = elem.style[name];
            elem.style[name] = options[name];
          }
          ret = callback.apply(elem, args || []);
          for (name in options) {
            elem.style[name] = old[name];
          }
          return ret;
        };
        var rdisplayswap = /^(none|table(?!-c[ea]).+)/, rnumsplit = new RegExp("^(" + pnum + ")(.*)$", "i"), rrelNum = new RegExp("^([+-])=(" + pnum + ")", "i"), cssShow = { position: "absolute", visibility: "hidden", display: "block" }, cssNormalTransform = {
          letterSpacing: "0",
          fontWeight: "400"
        }, cssPrefixes = ["Webkit", "O", "Moz", "ms"];
        function vendorPropName(style, name) {
          if (name in style) {
            return name;
          }
          var capName = name[0].toUpperCase() + name.slice(1), origName = name, i = cssPrefixes.length;
          while (i--) {
            name = cssPrefixes[i] + capName;
            if (name in style) {
              return name;
            }
          }
          return origName;
        }
        function setPositiveNumber(elem, value, subtract) {
          var matches = rnumsplit.exec(value);
          return matches ? Math.max(0, matches[1] - (subtract || 0)) + (matches[2] || "px") : value;
        }
        function augmentWidthOrHeight(elem, name, extra, isBorderBox, styles) {
          var i = extra === (isBorderBox ? "border" : "content") ? 4 : name === "width" ? 1 : 0, val = 0;
          for (; i < 4; i += 2) {
            if (extra === "margin") {
              val += jQuery6.css(elem, extra + cssExpand[i], true, styles);
            }
            if (isBorderBox) {
              if (extra === "content") {
                val -= jQuery6.css(elem, "padding" + cssExpand[i], true, styles);
              }
              if (extra !== "margin") {
                val -= jQuery6.css(elem, "border" + cssExpand[i] + "Width", true, styles);
              }
            } else {
              val += jQuery6.css(elem, "padding" + cssExpand[i], true, styles);
              if (extra !== "padding") {
                val += jQuery6.css(elem, "border" + cssExpand[i] + "Width", true, styles);
              }
            }
          }
          return val;
        }
        function getWidthOrHeight(elem, name, extra) {
          var valueIsBorderBox = true, val = name === "width" ? elem.offsetWidth : elem.offsetHeight, styles = getStyles(elem), isBorderBox = jQuery6.css(elem, "boxSizing", false, styles) === "border-box";
          if (val <= 0 || val == null) {
            val = curCSS(elem, name, styles);
            if (val < 0 || val == null) {
              val = elem.style[name];
            }
            if (rnumnonpx.test(val)) {
              return val;
            }
            valueIsBorderBox = isBorderBox && (support.boxSizingReliable() || val === elem.style[name]);
            val = parseFloat(val) || 0;
          }
          return val + augmentWidthOrHeight(
            elem,
            name,
            extra || (isBorderBox ? "border" : "content"),
            valueIsBorderBox,
            styles
          ) + "px";
        }
        function showHide(elements, show) {
          var display, elem, hidden, values = [], index = 0, length = elements.length;
          for (; index < length; index++) {
            elem = elements[index];
            if (!elem.style) {
              continue;
            }
            values[index] = data_priv.get(elem, "olddisplay");
            display = elem.style.display;
            if (show) {
              if (!values[index] && display === "none") {
                elem.style.display = "";
              }
              if (elem.style.display === "" && isHidden(elem)) {
                values[index] = data_priv.access(elem, "olddisplay", defaultDisplay(elem.nodeName));
              }
            } else {
              hidden = isHidden(elem);
              if (display !== "none" || !hidden) {
                data_priv.set(elem, "olddisplay", hidden ? display : jQuery6.css(elem, "display"));
              }
            }
          }
          for (index = 0; index < length; index++) {
            elem = elements[index];
            if (!elem.style) {
              continue;
            }
            if (!show || elem.style.display === "none" || elem.style.display === "") {
              elem.style.display = show ? values[index] || "" : "none";
            }
          }
          return elements;
        }
        jQuery6.extend({
          cssHooks: {
            opacity: {
              get: function(elem, computed) {
                if (computed) {
                  var ret = curCSS(elem, "opacity");
                  return ret === "" ? "1" : ret;
                }
              }
            }
          },
          cssNumber: {
            "columnCount": true,
            "fillOpacity": true,
            "flexGrow": true,
            "flexShrink": true,
            "fontWeight": true,
            "lineHeight": true,
            "opacity": true,
            "order": true,
            "orphans": true,
            "widows": true,
            "zIndex": true,
            "zoom": true
          },
          cssProps: {
            "float": "cssFloat"
          },
          style: function(elem, name, value, extra) {
            if (!elem || elem.nodeType === 3 || elem.nodeType === 8 || !elem.style) {
              return;
            }
            var ret, type, hooks, origName = jQuery6.camelCase(name), style = elem.style;
            name = jQuery6.cssProps[origName] || (jQuery6.cssProps[origName] = vendorPropName(style, origName));
            hooks = jQuery6.cssHooks[name] || jQuery6.cssHooks[origName];
            if (value !== void 0) {
              type = typeof value;
              if (type === "string" && (ret = rrelNum.exec(value))) {
                value = (ret[1] + 1) * ret[2] + parseFloat(jQuery6.css(elem, name));
                type = "number";
              }
              if (value == null || value !== value) {
                return;
              }
              if (type === "number" && !jQuery6.cssNumber[origName]) {
                value += "px";
              }
              if (!support.clearCloneStyle && value === "" && name.indexOf("background") === 0) {
                style[name] = "inherit";
              }
              if (!hooks || !("set" in hooks) || (value = hooks.set(elem, value, extra)) !== void 0) {
                style[name] = value;
              }
            } else {
              if (hooks && "get" in hooks && (ret = hooks.get(elem, false, extra)) !== void 0) {
                return ret;
              }
              return style[name];
            }
          },
          css: function(elem, name, extra, styles) {
            var val, num, hooks, origName = jQuery6.camelCase(name);
            name = jQuery6.cssProps[origName] || (jQuery6.cssProps[origName] = vendorPropName(elem.style, origName));
            hooks = jQuery6.cssHooks[name] || jQuery6.cssHooks[origName];
            if (hooks && "get" in hooks) {
              val = hooks.get(elem, true, extra);
            }
            if (val === void 0) {
              val = curCSS(elem, name, styles);
            }
            if (val === "normal" && name in cssNormalTransform) {
              val = cssNormalTransform[name];
            }
            if (extra === "" || extra) {
              num = parseFloat(val);
              return extra === true || jQuery6.isNumeric(num) ? num || 0 : val;
            }
            return val;
          }
        });
        jQuery6.each(["height", "width"], function(i, name) {
          jQuery6.cssHooks[name] = {
            get: function(elem, computed, extra) {
              if (computed) {
                return rdisplayswap.test(jQuery6.css(elem, "display")) && elem.offsetWidth === 0 ? jQuery6.swap(elem, cssShow, function() {
                  return getWidthOrHeight(elem, name, extra);
                }) : getWidthOrHeight(elem, name, extra);
              }
            },
            set: function(elem, value, extra) {
              var styles = extra && getStyles(elem);
              return setPositiveNumber(
                elem,
                value,
                extra ? augmentWidthOrHeight(
                  elem,
                  name,
                  extra,
                  jQuery6.css(elem, "boxSizing", false, styles) === "border-box",
                  styles
                ) : 0
              );
            }
          };
        });
        jQuery6.cssHooks.marginRight = addGetHookIf(
          support.reliableMarginRight,
          function(elem, computed) {
            if (computed) {
              return jQuery6.swap(
                elem,
                { "display": "inline-block" },
                curCSS,
                [elem, "marginRight"]
              );
            }
          }
        );
        jQuery6.each({
          margin: "",
          padding: "",
          border: "Width"
        }, function(prefix, suffix) {
          jQuery6.cssHooks[prefix + suffix] = {
            expand: function(value) {
              var i = 0, expanded = {}, parts = typeof value === "string" ? value.split(" ") : [value];
              for (; i < 4; i++) {
                expanded[prefix + cssExpand[i] + suffix] = parts[i] || parts[i - 2] || parts[0];
              }
              return expanded;
            }
          };
          if (!rmargin.test(prefix)) {
            jQuery6.cssHooks[prefix + suffix].set = setPositiveNumber;
          }
        });
        jQuery6.fn.extend({
          css: function(name, value) {
            return access(this, function(elem, name2, value2) {
              var styles, len, map = {}, i = 0;
              if (jQuery6.isArray(name2)) {
                styles = getStyles(elem);
                len = name2.length;
                for (; i < len; i++) {
                  map[name2[i]] = jQuery6.css(elem, name2[i], false, styles);
                }
                return map;
              }
              return value2 !== void 0 ? jQuery6.style(elem, name2, value2) : jQuery6.css(elem, name2);
            }, name, value, arguments.length > 1);
          },
          show: function() {
            return showHide(this, true);
          },
          hide: function() {
            return showHide(this);
          },
          toggle: function(state) {
            if (typeof state === "boolean") {
              return state ? this.show() : this.hide();
            }
            return this.each(function() {
              if (isHidden(this)) {
                jQuery6(this).show();
              } else {
                jQuery6(this).hide();
              }
            });
          }
        });
        function Tween(elem, options, prop, end, easing) {
          return new Tween.prototype.init(elem, options, prop, end, easing);
        }
        jQuery6.Tween = Tween;
        Tween.prototype = {
          constructor: Tween,
          init: function(elem, options, prop, end, easing, unit) {
            this.elem = elem;
            this.prop = prop;
            this.easing = easing || "swing";
            this.options = options;
            this.start = this.now = this.cur();
            this.end = end;
            this.unit = unit || (jQuery6.cssNumber[prop] ? "" : "px");
          },
          cur: function() {
            var hooks = Tween.propHooks[this.prop];
            return hooks && hooks.get ? hooks.get(this) : Tween.propHooks._default.get(this);
          },
          run: function(percent) {
            var eased, hooks = Tween.propHooks[this.prop];
            if (this.options.duration) {
              this.pos = eased = jQuery6.easing[this.easing](
                percent,
                this.options.duration * percent,
                0,
                1,
                this.options.duration
              );
            } else {
              this.pos = eased = percent;
            }
            this.now = (this.end - this.start) * eased + this.start;
            if (this.options.step) {
              this.options.step.call(this.elem, this.now, this);
            }
            if (hooks && hooks.set) {
              hooks.set(this);
            } else {
              Tween.propHooks._default.set(this);
            }
            return this;
          }
        };
        Tween.prototype.init.prototype = Tween.prototype;
        Tween.propHooks = {
          _default: {
            get: function(tween) {
              var result;
              if (tween.elem[tween.prop] != null && (!tween.elem.style || tween.elem.style[tween.prop] == null)) {
                return tween.elem[tween.prop];
              }
              result = jQuery6.css(tween.elem, tween.prop, "");
              return !result || result === "auto" ? 0 : result;
            },
            set: function(tween) {
              if (jQuery6.fx.step[tween.prop]) {
                jQuery6.fx.step[tween.prop](tween);
              } else if (tween.elem.style && (tween.elem.style[jQuery6.cssProps[tween.prop]] != null || jQuery6.cssHooks[tween.prop])) {
                jQuery6.style(tween.elem, tween.prop, tween.now + tween.unit);
              } else {
                tween.elem[tween.prop] = tween.now;
              }
            }
          }
        };
        Tween.propHooks.scrollTop = Tween.propHooks.scrollLeft = {
          set: function(tween) {
            if (tween.elem.nodeType && tween.elem.parentNode) {
              tween.elem[tween.prop] = tween.now;
            }
          }
        };
        jQuery6.easing = {
          linear: function(p) {
            return p;
          },
          swing: function(p) {
            return 0.5 - Math.cos(p * Math.PI) / 2;
          }
        };
        jQuery6.fx = Tween.prototype.init;
        jQuery6.fx.step = {};
        var fxNow, timerId, rfxtypes = /^(?:toggle|show|hide)$/, rfxnum = new RegExp("^(?:([+-])=|)(" + pnum + ")([a-z%]*)$", "i"), rrun = /queueHooks$/, animationPrefilters = [defaultPrefilter], tweeners = {
          "*": [function(prop, value) {
            var tween = this.createTween(prop, value), target = tween.cur(), parts = rfxnum.exec(value), unit = parts && parts[3] || (jQuery6.cssNumber[prop] ? "" : "px"), start = (jQuery6.cssNumber[prop] || unit !== "px" && +target) && rfxnum.exec(jQuery6.css(tween.elem, prop)), scale2 = 1, maxIterations = 20;
            if (start && start[3] !== unit) {
              unit = unit || start[3];
              parts = parts || [];
              start = +target || 1;
              do {
                scale2 = scale2 || ".5";
                start = start / scale2;
                jQuery6.style(tween.elem, prop, start + unit);
              } while (scale2 !== (scale2 = tween.cur() / target) && scale2 !== 1 && --maxIterations);
            }
            if (parts) {
              start = tween.start = +start || +target || 0;
              tween.unit = unit;
              tween.end = parts[1] ? start + (parts[1] + 1) * parts[2] : +parts[2];
            }
            return tween;
          }]
        };
        function createFxNow() {
          setTimeout(function() {
            fxNow = void 0;
          });
          return fxNow = jQuery6.now();
        }
        function genFx(type, includeWidth) {
          var which, i = 0, attrs = { height: type };
          includeWidth = includeWidth ? 1 : 0;
          for (; i < 4; i += 2 - includeWidth) {
            which = cssExpand[i];
            attrs["margin" + which] = attrs["padding" + which] = type;
          }
          if (includeWidth) {
            attrs.opacity = attrs.width = type;
          }
          return attrs;
        }
        function createTween(value, prop, animation) {
          var tween, collection = (tweeners[prop] || []).concat(tweeners["*"]), index = 0, length = collection.length;
          for (; index < length; index++) {
            if (tween = collection[index].call(animation, prop, value)) {
              return tween;
            }
          }
        }
        function defaultPrefilter(elem, props, opts) {
          var prop, value, toggle, tween, hooks, oldfire, display, checkDisplay, anim = this, orig = {}, style = elem.style, hidden = elem.nodeType && isHidden(elem), dataShow = data_priv.get(elem, "fxshow");
          if (!opts.queue) {
            hooks = jQuery6._queueHooks(elem, "fx");
            if (hooks.unqueued == null) {
              hooks.unqueued = 0;
              oldfire = hooks.empty.fire;
              hooks.empty.fire = function() {
                if (!hooks.unqueued) {
                  oldfire();
                }
              };
            }
            hooks.unqueued++;
            anim.always(function() {
              anim.always(function() {
                hooks.unqueued--;
                if (!jQuery6.queue(elem, "fx").length) {
                  hooks.empty.fire();
                }
              });
            });
          }
          if (elem.nodeType === 1 && ("height" in props || "width" in props)) {
            opts.overflow = [style.overflow, style.overflowX, style.overflowY];
            display = jQuery6.css(elem, "display");
            checkDisplay = display === "none" ? data_priv.get(elem, "olddisplay") || defaultDisplay(elem.nodeName) : display;
            if (checkDisplay === "inline" && jQuery6.css(elem, "float") === "none") {
              style.display = "inline-block";
            }
          }
          if (opts.overflow) {
            style.overflow = "hidden";
            anim.always(function() {
              style.overflow = opts.overflow[0];
              style.overflowX = opts.overflow[1];
              style.overflowY = opts.overflow[2];
            });
          }
          for (prop in props) {
            value = props[prop];
            if (rfxtypes.exec(value)) {
              delete props[prop];
              toggle = toggle || value === "toggle";
              if (value === (hidden ? "hide" : "show")) {
                if (value === "show" && dataShow && dataShow[prop] !== void 0) {
                  hidden = true;
                } else {
                  continue;
                }
              }
              orig[prop] = dataShow && dataShow[prop] || jQuery6.style(elem, prop);
            } else {
              display = void 0;
            }
          }
          if (!jQuery6.isEmptyObject(orig)) {
            if (dataShow) {
              if ("hidden" in dataShow) {
                hidden = dataShow.hidden;
              }
            } else {
              dataShow = data_priv.access(elem, "fxshow", {});
            }
            if (toggle) {
              dataShow.hidden = !hidden;
            }
            if (hidden) {
              jQuery6(elem).show();
            } else {
              anim.done(function() {
                jQuery6(elem).hide();
              });
            }
            anim.done(function() {
              var prop2;
              data_priv.remove(elem, "fxshow");
              for (prop2 in orig) {
                jQuery6.style(elem, prop2, orig[prop2]);
              }
            });
            for (prop in orig) {
              tween = createTween(hidden ? dataShow[prop] : 0, prop, anim);
              if (!(prop in dataShow)) {
                dataShow[prop] = tween.start;
                if (hidden) {
                  tween.end = tween.start;
                  tween.start = prop === "width" || prop === "height" ? 1 : 0;
                }
              }
            }
          } else if ((display === "none" ? defaultDisplay(elem.nodeName) : display) === "inline") {
            style.display = display;
          }
        }
        function propFilter(props, specialEasing) {
          var index, name, easing, value, hooks;
          for (index in props) {
            name = jQuery6.camelCase(index);
            easing = specialEasing[name];
            value = props[index];
            if (jQuery6.isArray(value)) {
              easing = value[1];
              value = props[index] = value[0];
            }
            if (index !== name) {
              props[name] = value;
              delete props[index];
            }
            hooks = jQuery6.cssHooks[name];
            if (hooks && "expand" in hooks) {
              value = hooks.expand(value);
              delete props[name];
              for (index in value) {
                if (!(index in props)) {
                  props[index] = value[index];
                  specialEasing[index] = easing;
                }
              }
            } else {
              specialEasing[name] = easing;
            }
          }
        }
        function Animation(elem, properties, options) {
          var result, stopped, index = 0, length = animationPrefilters.length, deferred = jQuery6.Deferred().always(function() {
            delete tick.elem;
          }), tick = function() {
            if (stopped) {
              return false;
            }
            var currentTime = fxNow || createFxNow(), remaining = Math.max(0, animation.startTime + animation.duration - currentTime), temp = remaining / animation.duration || 0, percent = 1 - temp, index2 = 0, length2 = animation.tweens.length;
            for (; index2 < length2; index2++) {
              animation.tweens[index2].run(percent);
            }
            deferred.notifyWith(elem, [animation, percent, remaining]);
            if (percent < 1 && length2) {
              return remaining;
            } else {
              deferred.resolveWith(elem, [animation]);
              return false;
            }
          }, animation = deferred.promise({
            elem,
            props: jQuery6.extend({}, properties),
            opts: jQuery6.extend(true, { specialEasing: {} }, options),
            originalProperties: properties,
            originalOptions: options,
            startTime: fxNow || createFxNow(),
            duration: options.duration,
            tweens: [],
            createTween: function(prop, end) {
              var tween = jQuery6.Tween(
                elem,
                animation.opts,
                prop,
                end,
                animation.opts.specialEasing[prop] || animation.opts.easing
              );
              animation.tweens.push(tween);
              return tween;
            },
            stop: function(gotoEnd) {
              var index2 = 0, length2 = gotoEnd ? animation.tweens.length : 0;
              if (stopped) {
                return this;
              }
              stopped = true;
              for (; index2 < length2; index2++) {
                animation.tweens[index2].run(1);
              }
              if (gotoEnd) {
                deferred.resolveWith(elem, [animation, gotoEnd]);
              } else {
                deferred.rejectWith(elem, [animation, gotoEnd]);
              }
              return this;
            }
          }), props = animation.props;
          propFilter(props, animation.opts.specialEasing);
          for (; index < length; index++) {
            result = animationPrefilters[index].call(animation, elem, props, animation.opts);
            if (result) {
              return result;
            }
          }
          jQuery6.map(props, createTween, animation);
          if (jQuery6.isFunction(animation.opts.start)) {
            animation.opts.start.call(elem, animation);
          }
          jQuery6.fx.timer(
            jQuery6.extend(tick, {
              elem,
              anim: animation,
              queue: animation.opts.queue
            })
          );
          return animation.progress(animation.opts.progress).done(animation.opts.done, animation.opts.complete).fail(animation.opts.fail).always(animation.opts.always);
        }
        jQuery6.Animation = jQuery6.extend(Animation, {
          tweener: function(props, callback) {
            if (jQuery6.isFunction(props)) {
              callback = props;
              props = ["*"];
            } else {
              props = props.split(" ");
            }
            var prop, index = 0, length = props.length;
            for (; index < length; index++) {
              prop = props[index];
              tweeners[prop] = tweeners[prop] || [];
              tweeners[prop].unshift(callback);
            }
          },
          prefilter: function(callback, prepend) {
            if (prepend) {
              animationPrefilters.unshift(callback);
            } else {
              animationPrefilters.push(callback);
            }
          }
        });
        jQuery6.speed = function(speed, easing, fn) {
          var opt = speed && typeof speed === "object" ? jQuery6.extend({}, speed) : {
            complete: fn || !fn && easing || jQuery6.isFunction(speed) && speed,
            duration: speed,
            easing: fn && easing || easing && !jQuery6.isFunction(easing) && easing
          };
          opt.duration = jQuery6.fx.off ? 0 : typeof opt.duration === "number" ? opt.duration : opt.duration in jQuery6.fx.speeds ? jQuery6.fx.speeds[opt.duration] : jQuery6.fx.speeds._default;
          if (opt.queue == null || opt.queue === true) {
            opt.queue = "fx";
          }
          opt.old = opt.complete;
          opt.complete = function() {
            if (jQuery6.isFunction(opt.old)) {
              opt.old.call(this);
            }
            if (opt.queue) {
              jQuery6.dequeue(this, opt.queue);
            }
          };
          return opt;
        };
        jQuery6.fn.extend({
          fadeTo: function(speed, to, easing, callback) {
            return this.filter(isHidden).css("opacity", 0).show().end().animate({ opacity: to }, speed, easing, callback);
          },
          animate: function(prop, speed, easing, callback) {
            var empty = jQuery6.isEmptyObject(prop), optall = jQuery6.speed(speed, easing, callback), doAnimation = function() {
              var anim = Animation(this, jQuery6.extend({}, prop), optall);
              if (empty || data_priv.get(this, "finish")) {
                anim.stop(true);
              }
            };
            doAnimation.finish = doAnimation;
            return empty || optall.queue === false ? this.each(doAnimation) : this.queue(optall.queue, doAnimation);
          },
          stop: function(type, clearQueue, gotoEnd) {
            var stopQueue = function(hooks) {
              var stop = hooks.stop;
              delete hooks.stop;
              stop(gotoEnd);
            };
            if (typeof type !== "string") {
              gotoEnd = clearQueue;
              clearQueue = type;
              type = void 0;
            }
            if (clearQueue && type !== false) {
              this.queue(type || "fx", []);
            }
            return this.each(function() {
              var dequeue = true, index = type != null && type + "queueHooks", timers = jQuery6.timers, data = data_priv.get(this);
              if (index) {
                if (data[index] && data[index].stop) {
                  stopQueue(data[index]);
                }
              } else {
                for (index in data) {
                  if (data[index] && data[index].stop && rrun.test(index)) {
                    stopQueue(data[index]);
                  }
                }
              }
              for (index = timers.length; index--; ) {
                if (timers[index].elem === this && (type == null || timers[index].queue === type)) {
                  timers[index].anim.stop(gotoEnd);
                  dequeue = false;
                  timers.splice(index, 1);
                }
              }
              if (dequeue || !gotoEnd) {
                jQuery6.dequeue(this, type);
              }
            });
          },
          finish: function(type) {
            if (type !== false) {
              type = type || "fx";
            }
            return this.each(function() {
              var index, data = data_priv.get(this), queue = data[type + "queue"], hooks = data[type + "queueHooks"], timers = jQuery6.timers, length = queue ? queue.length : 0;
              data.finish = true;
              jQuery6.queue(this, type, []);
              if (hooks && hooks.stop) {
                hooks.stop.call(this, true);
              }
              for (index = timers.length; index--; ) {
                if (timers[index].elem === this && timers[index].queue === type) {
                  timers[index].anim.stop(true);
                  timers.splice(index, 1);
                }
              }
              for (index = 0; index < length; index++) {
                if (queue[index] && queue[index].finish) {
                  queue[index].finish.call(this);
                }
              }
              delete data.finish;
            });
          }
        });
        jQuery6.each(["toggle", "show", "hide"], function(i, name) {
          var cssFn = jQuery6.fn[name];
          jQuery6.fn[name] = function(speed, easing, callback) {
            return speed == null || typeof speed === "boolean" ? cssFn.apply(this, arguments) : this.animate(genFx(name, true), speed, easing, callback);
          };
        });
        jQuery6.each({
          slideDown: genFx("show"),
          slideUp: genFx("hide"),
          slideToggle: genFx("toggle"),
          fadeIn: { opacity: "show" },
          fadeOut: { opacity: "hide" },
          fadeToggle: { opacity: "toggle" }
        }, function(name, props) {
          jQuery6.fn[name] = function(speed, easing, callback) {
            return this.animate(props, speed, easing, callback);
          };
        });
        jQuery6.timers = [];
        jQuery6.fx.tick = function() {
          var timer, i = 0, timers = jQuery6.timers;
          fxNow = jQuery6.now();
          for (; i < timers.length; i++) {
            timer = timers[i];
            if (!timer() && timers[i] === timer) {
              timers.splice(i--, 1);
            }
          }
          if (!timers.length) {
            jQuery6.fx.stop();
          }
          fxNow = void 0;
        };
        jQuery6.fx.timer = function(timer) {
          jQuery6.timers.push(timer);
          if (timer()) {
            jQuery6.fx.start();
          } else {
            jQuery6.timers.pop();
          }
        };
        jQuery6.fx.interval = 13;
        jQuery6.fx.start = function() {
          if (!timerId) {
            timerId = setInterval(jQuery6.fx.tick, jQuery6.fx.interval);
          }
        };
        jQuery6.fx.stop = function() {
          clearInterval(timerId);
          timerId = null;
        };
        jQuery6.fx.speeds = {
          slow: 600,
          fast: 200,
          _default: 400
        };
        jQuery6.fn.delay = function(time, type) {
          time = jQuery6.fx ? jQuery6.fx.speeds[time] || time : time;
          type = type || "fx";
          return this.queue(type, function(next, hooks) {
            var timeout = setTimeout(next, time);
            hooks.stop = function() {
              clearTimeout(timeout);
            };
          });
        };
        (function() {
          var input = document2.createElement("input"), select = document2.createElement("select"), opt = select.appendChild(document2.createElement("option"));
          input.type = "checkbox";
          support.checkOn = input.value !== "";
          support.optSelected = opt.selected;
          select.disabled = true;
          support.optDisabled = !opt.disabled;
          input = document2.createElement("input");
          input.value = "t";
          input.type = "radio";
          support.radioValue = input.value === "t";
        })();
        var nodeHook, boolHook, attrHandle = jQuery6.expr.attrHandle;
        jQuery6.fn.extend({
          attr: function(name, value) {
            return access(this, jQuery6.attr, name, value, arguments.length > 1);
          },
          removeAttr: function(name) {
            return this.each(function() {
              jQuery6.removeAttr(this, name);
            });
          }
        });
        jQuery6.extend({
          attr: function(elem, name, value) {
            var hooks, ret, nType = elem.nodeType;
            if (!elem || nType === 3 || nType === 8 || nType === 2) {
              return;
            }
            if (typeof elem.getAttribute === strundefined) {
              return jQuery6.prop(elem, name, value);
            }
            if (nType !== 1 || !jQuery6.isXMLDoc(elem)) {
              name = name.toLowerCase();
              hooks = jQuery6.attrHooks[name] || (jQuery6.expr.match.bool.test(name) ? boolHook : nodeHook);
            }
            if (value !== void 0) {
              if (value === null) {
                jQuery6.removeAttr(elem, name);
              } else if (hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== void 0) {
                return ret;
              } else {
                elem.setAttribute(name, value + "");
                return value;
              }
            } else if (hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null) {
              return ret;
            } else {
              ret = jQuery6.find.attr(elem, name);
              return ret == null ? void 0 : ret;
            }
          },
          removeAttr: function(elem, value) {
            var name, propName, i = 0, attrNames = value && value.match(rnotwhite);
            if (attrNames && elem.nodeType === 1) {
              while (name = attrNames[i++]) {
                propName = jQuery6.propFix[name] || name;
                if (jQuery6.expr.match.bool.test(name)) {
                  elem[propName] = false;
                }
                elem.removeAttribute(name);
              }
            }
          },
          attrHooks: {
            type: {
              set: function(elem, value) {
                if (!support.radioValue && value === "radio" && jQuery6.nodeName(elem, "input")) {
                  var val = elem.value;
                  elem.setAttribute("type", value);
                  if (val) {
                    elem.value = val;
                  }
                  return value;
                }
              }
            }
          }
        });
        boolHook = {
          set: function(elem, value, name) {
            if (value === false) {
              jQuery6.removeAttr(elem, name);
            } else {
              elem.setAttribute(name, name);
            }
            return name;
          }
        };
        jQuery6.each(jQuery6.expr.match.bool.source.match(/\w+/g), function(i, name) {
          var getter = attrHandle[name] || jQuery6.find.attr;
          attrHandle[name] = function(elem, name2, isXML) {
            var ret, handle;
            if (!isXML) {
              handle = attrHandle[name2];
              attrHandle[name2] = ret;
              ret = getter(elem, name2, isXML) != null ? name2.toLowerCase() : null;
              attrHandle[name2] = handle;
            }
            return ret;
          };
        });
        var rfocusable = /^(?:input|select|textarea|button)$/i;
        jQuery6.fn.extend({
          prop: function(name, value) {
            return access(this, jQuery6.prop, name, value, arguments.length > 1);
          },
          removeProp: function(name) {
            return this.each(function() {
              delete this[jQuery6.propFix[name] || name];
            });
          }
        });
        jQuery6.extend({
          propFix: {
            "for": "htmlFor",
            "class": "className"
          },
          prop: function(elem, name, value) {
            var ret, hooks, notxml, nType = elem.nodeType;
            if (!elem || nType === 3 || nType === 8 || nType === 2) {
              return;
            }
            notxml = nType !== 1 || !jQuery6.isXMLDoc(elem);
            if (notxml) {
              name = jQuery6.propFix[name] || name;
              hooks = jQuery6.propHooks[name];
            }
            if (value !== void 0) {
              return hooks && "set" in hooks && (ret = hooks.set(elem, value, name)) !== void 0 ? ret : elem[name] = value;
            } else {
              return hooks && "get" in hooks && (ret = hooks.get(elem, name)) !== null ? ret : elem[name];
            }
          },
          propHooks: {
            tabIndex: {
              get: function(elem) {
                return elem.hasAttribute("tabindex") || rfocusable.test(elem.nodeName) || elem.href ? elem.tabIndex : -1;
              }
            }
          }
        });
        if (!support.optSelected) {
          jQuery6.propHooks.selected = {
            get: function(elem) {
              var parent = elem.parentNode;
              if (parent && parent.parentNode) {
                parent.parentNode.selectedIndex;
              }
              return null;
            }
          };
        }
        jQuery6.each([
          "tabIndex",
          "readOnly",
          "maxLength",
          "cellSpacing",
          "cellPadding",
          "rowSpan",
          "colSpan",
          "useMap",
          "frameBorder",
          "contentEditable"
        ], function() {
          jQuery6.propFix[this.toLowerCase()] = this;
        });
        var rclass = /[\t\r\n\f]/g;
        jQuery6.fn.extend({
          addClass: function(value) {
            var classes, elem, cur, clazz, j, finalValue, proceed = typeof value === "string" && value, i = 0, len = this.length;
            if (jQuery6.isFunction(value)) {
              return this.each(function(j2) {
                jQuery6(this).addClass(value.call(this, j2, this.className));
              });
            }
            if (proceed) {
              classes = (value || "").match(rnotwhite) || [];
              for (; i < len; i++) {
                elem = this[i];
                cur = elem.nodeType === 1 && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : " ");
                if (cur) {
                  j = 0;
                  while (clazz = classes[j++]) {
                    if (cur.indexOf(" " + clazz + " ") < 0) {
                      cur += clazz + " ";
                    }
                  }
                  finalValue = jQuery6.trim(cur);
                  if (elem.className !== finalValue) {
                    elem.className = finalValue;
                  }
                }
              }
            }
            return this;
          },
          removeClass: function(value) {
            var classes, elem, cur, clazz, j, finalValue, proceed = arguments.length === 0 || typeof value === "string" && value, i = 0, len = this.length;
            if (jQuery6.isFunction(value)) {
              return this.each(function(j2) {
                jQuery6(this).removeClass(value.call(this, j2, this.className));
              });
            }
            if (proceed) {
              classes = (value || "").match(rnotwhite) || [];
              for (; i < len; i++) {
                elem = this[i];
                cur = elem.nodeType === 1 && (elem.className ? (" " + elem.className + " ").replace(rclass, " ") : "");
                if (cur) {
                  j = 0;
                  while (clazz = classes[j++]) {
                    while (cur.indexOf(" " + clazz + " ") >= 0) {
                      cur = cur.replace(" " + clazz + " ", " ");
                    }
                  }
                  finalValue = value ? jQuery6.trim(cur) : "";
                  if (elem.className !== finalValue) {
                    elem.className = finalValue;
                  }
                }
              }
            }
            return this;
          },
          toggleClass: function(value, stateVal) {
            var type = typeof value;
            if (typeof stateVal === "boolean" && type === "string") {
              return stateVal ? this.addClass(value) : this.removeClass(value);
            }
            if (jQuery6.isFunction(value)) {
              return this.each(function(i) {
                jQuery6(this).toggleClass(value.call(this, i, this.className, stateVal), stateVal);
              });
            }
            return this.each(function() {
              if (type === "string") {
                var className, i = 0, self2 = jQuery6(this), classNames = value.match(rnotwhite) || [];
                while (className = classNames[i++]) {
                  if (self2.hasClass(className)) {
                    self2.removeClass(className);
                  } else {
                    self2.addClass(className);
                  }
                }
              } else if (type === strundefined || type === "boolean") {
                if (this.className) {
                  data_priv.set(this, "__className__", this.className);
                }
                this.className = this.className || value === false ? "" : data_priv.get(this, "__className__") || "";
              }
            });
          },
          hasClass: function(selector) {
            var className = " " + selector + " ", i = 0, l = this.length;
            for (; i < l; i++) {
              if (this[i].nodeType === 1 && (" " + this[i].className + " ").replace(rclass, " ").indexOf(className) >= 0) {
                return true;
              }
            }
            return false;
          }
        });
        var rreturn = /\r/g;
        jQuery6.fn.extend({
          val: function(value) {
            var hooks, ret, isFunction, elem = this[0];
            if (!arguments.length) {
              if (elem) {
                hooks = jQuery6.valHooks[elem.type] || jQuery6.valHooks[elem.nodeName.toLowerCase()];
                if (hooks && "get" in hooks && (ret = hooks.get(elem, "value")) !== void 0) {
                  return ret;
                }
                ret = elem.value;
                return typeof ret === "string" ? ret.replace(rreturn, "") : ret == null ? "" : ret;
              }
              return;
            }
            isFunction = jQuery6.isFunction(value);
            return this.each(function(i) {
              var val;
              if (this.nodeType !== 1) {
                return;
              }
              if (isFunction) {
                val = value.call(this, i, jQuery6(this).val());
              } else {
                val = value;
              }
              if (val == null) {
                val = "";
              } else if (typeof val === "number") {
                val += "";
              } else if (jQuery6.isArray(val)) {
                val = jQuery6.map(val, function(value2) {
                  return value2 == null ? "" : value2 + "";
                });
              }
              hooks = jQuery6.valHooks[this.type] || jQuery6.valHooks[this.nodeName.toLowerCase()];
              if (!hooks || !("set" in hooks) || hooks.set(this, val, "value") === void 0) {
                this.value = val;
              }
            });
          }
        });
        jQuery6.extend({
          valHooks: {
            option: {
              get: function(elem) {
                var val = jQuery6.find.attr(elem, "value");
                return val != null ? val : jQuery6.trim(jQuery6.text(elem));
              }
            },
            select: {
              get: function(elem) {
                var value, option, options = elem.options, index = elem.selectedIndex, one = elem.type === "select-one" || index < 0, values = one ? null : [], max = one ? index + 1 : options.length, i = index < 0 ? max : one ? index : 0;
                for (; i < max; i++) {
                  option = options[i];
                  if ((option.selected || i === index) && (support.optDisabled ? !option.disabled : option.getAttribute("disabled") === null) && (!option.parentNode.disabled || !jQuery6.nodeName(option.parentNode, "optgroup"))) {
                    value = jQuery6(option).val();
                    if (one) {
                      return value;
                    }
                    values.push(value);
                  }
                }
                return values;
              },
              set: function(elem, value) {
                var optionSet, option, options = elem.options, values = jQuery6.makeArray(value), i = options.length;
                while (i--) {
                  option = options[i];
                  if (option.selected = jQuery6.inArray(option.value, values) >= 0) {
                    optionSet = true;
                  }
                }
                if (!optionSet) {
                  elem.selectedIndex = -1;
                }
                return values;
              }
            }
          }
        });
        jQuery6.each(["radio", "checkbox"], function() {
          jQuery6.valHooks[this] = {
            set: function(elem, value) {
              if (jQuery6.isArray(value)) {
                return elem.checked = jQuery6.inArray(jQuery6(elem).val(), value) >= 0;
              }
            }
          };
          if (!support.checkOn) {
            jQuery6.valHooks[this].get = function(elem) {
              return elem.getAttribute("value") === null ? "on" : elem.value;
            };
          }
        });
        jQuery6.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(i, name) {
          jQuery6.fn[name] = function(data, fn) {
            return arguments.length > 0 ? this.on(name, null, data, fn) : this.trigger(name);
          };
        });
        jQuery6.fn.extend({
          hover: function(fnOver, fnOut) {
            return this.mouseenter(fnOver).mouseleave(fnOut || fnOver);
          },
          bind: function(types, data, fn) {
            return this.on(types, null, data, fn);
          },
          unbind: function(types, fn) {
            return this.off(types, null, fn);
          },
          delegate: function(selector, types, data, fn) {
            return this.on(types, selector, data, fn);
          },
          undelegate: function(selector, types, fn) {
            return arguments.length === 1 ? this.off(selector, "**") : this.off(types, selector || "**", fn);
          }
        });
        var nonce = jQuery6.now();
        var rquery = /\?/;
        jQuery6.parseJSON = function(data) {
          return JSON.parse(data + "");
        };
        jQuery6.parseXML = function(data) {
          var xml, tmp;
          if (!data || typeof data !== "string") {
            return null;
          }
          try {
            tmp = new DOMParser();
            xml = tmp.parseFromString(data, "text/xml");
          } catch (e) {
            xml = void 0;
          }
          if (!xml || xml.getElementsByTagName("parsererror").length) {
            jQuery6.error("Invalid XML: " + data);
          }
          return xml;
        };
        var rhash = /#.*$/, rts = /([?&])_=[^&]*/, rheaders = /^(.*?):[ \t]*([^\r\n]*)$/mg, rlocalProtocol = /^(?:about|app|app-storage|.+-extension|file|res|widget):$/, rnoContent = /^(?:GET|HEAD)$/, rprotocol = /^\/\//, rurl = /^([\w.+-]+:)(?:\/\/(?:[^\/?#]*@|)([^\/?#:]*)(?::(\d+)|)|)/, prefilters = {}, transports = {}, allTypes = "*/".concat("*"), ajaxLocation = window2.location.href, ajaxLocParts = rurl.exec(ajaxLocation.toLowerCase()) || [];
        function addToPrefiltersOrTransports(structure) {
          return function(dataTypeExpression, func) {
            if (typeof dataTypeExpression !== "string") {
              func = dataTypeExpression;
              dataTypeExpression = "*";
            }
            var dataType, i = 0, dataTypes = dataTypeExpression.toLowerCase().match(rnotwhite) || [];
            if (jQuery6.isFunction(func)) {
              while (dataType = dataTypes[i++]) {
                if (dataType[0] === "+") {
                  dataType = dataType.slice(1) || "*";
                  (structure[dataType] = structure[dataType] || []).unshift(func);
                } else {
                  (structure[dataType] = structure[dataType] || []).push(func);
                }
              }
            }
          };
        }
        function inspectPrefiltersOrTransports(structure, options, originalOptions, jqXHR) {
          var inspected = {}, seekingTransport = structure === transports;
          function inspect(dataType) {
            var selected;
            inspected[dataType] = true;
            jQuery6.each(structure[dataType] || [], function(_, prefilterOrFactory) {
              var dataTypeOrTransport = prefilterOrFactory(options, originalOptions, jqXHR);
              if (typeof dataTypeOrTransport === "string" && !seekingTransport && !inspected[dataTypeOrTransport]) {
                options.dataTypes.unshift(dataTypeOrTransport);
                inspect(dataTypeOrTransport);
                return false;
              } else if (seekingTransport) {
                return !(selected = dataTypeOrTransport);
              }
            });
            return selected;
          }
          return inspect(options.dataTypes[0]) || !inspected["*"] && inspect("*");
        }
        function ajaxExtend(target, src) {
          var key, deep, flatOptions = jQuery6.ajaxSettings.flatOptions || {};
          for (key in src) {
            if (src[key] !== void 0) {
              (flatOptions[key] ? target : deep || (deep = {}))[key] = src[key];
            }
          }
          if (deep) {
            jQuery6.extend(true, target, deep);
          }
          return target;
        }
        function ajaxHandleResponses(s, jqXHR, responses) {
          var ct, type, finalDataType, firstDataType, contents = s.contents, dataTypes = s.dataTypes;
          while (dataTypes[0] === "*") {
            dataTypes.shift();
            if (ct === void 0) {
              ct = s.mimeType || jqXHR.getResponseHeader("Content-Type");
            }
          }
          if (ct) {
            for (type in contents) {
              if (contents[type] && contents[type].test(ct)) {
                dataTypes.unshift(type);
                break;
              }
            }
          }
          if (dataTypes[0] in responses) {
            finalDataType = dataTypes[0];
          } else {
            for (type in responses) {
              if (!dataTypes[0] || s.converters[type + " " + dataTypes[0]]) {
                finalDataType = type;
                break;
              }
              if (!firstDataType) {
                firstDataType = type;
              }
            }
            finalDataType = finalDataType || firstDataType;
          }
          if (finalDataType) {
            if (finalDataType !== dataTypes[0]) {
              dataTypes.unshift(finalDataType);
            }
            return responses[finalDataType];
          }
        }
        function ajaxConvert(s, response, jqXHR, isSuccess) {
          var conv2, current, conv, tmp, prev, converters = {}, dataTypes = s.dataTypes.slice();
          if (dataTypes[1]) {
            for (conv in s.converters) {
              converters[conv.toLowerCase()] = s.converters[conv];
            }
          }
          current = dataTypes.shift();
          while (current) {
            if (s.responseFields[current]) {
              jqXHR[s.responseFields[current]] = response;
            }
            if (!prev && isSuccess && s.dataFilter) {
              response = s.dataFilter(response, s.dataType);
            }
            prev = current;
            current = dataTypes.shift();
            if (current) {
              if (current === "*") {
                current = prev;
              } else if (prev !== "*" && prev !== current) {
                conv = converters[prev + " " + current] || converters["* " + current];
                if (!conv) {
                  for (conv2 in converters) {
                    tmp = conv2.split(" ");
                    if (tmp[1] === current) {
                      conv = converters[prev + " " + tmp[0]] || converters["* " + tmp[0]];
                      if (conv) {
                        if (conv === true) {
                          conv = converters[conv2];
                        } else if (converters[conv2] !== true) {
                          current = tmp[0];
                          dataTypes.unshift(tmp[1]);
                        }
                        break;
                      }
                    }
                  }
                }
                if (conv !== true) {
                  if (conv && s["throws"]) {
                    response = conv(response);
                  } else {
                    try {
                      response = conv(response);
                    } catch (e) {
                      return { state: "parsererror", error: conv ? e : "No conversion from " + prev + " to " + current };
                    }
                  }
                }
              }
            }
          }
          return { state: "success", data: response };
        }
        jQuery6.extend({
          active: 0,
          lastModified: {},
          etag: {},
          ajaxSettings: {
            url: ajaxLocation,
            type: "GET",
            isLocal: rlocalProtocol.test(ajaxLocParts[1]),
            global: true,
            processData: true,
            async: true,
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            accepts: {
              "*": allTypes,
              text: "text/plain",
              html: "text/html",
              xml: "application/xml, text/xml",
              json: "application/json, text/javascript"
            },
            contents: {
              xml: /xml/,
              html: /html/,
              json: /json/
            },
            responseFields: {
              xml: "responseXML",
              text: "responseText",
              json: "responseJSON"
            },
            converters: {
              "* text": String,
              "text html": true,
              "text json": jQuery6.parseJSON,
              "text xml": jQuery6.parseXML
            },
            flatOptions: {
              url: true,
              context: true
            }
          },
          ajaxSetup: function(target, settings) {
            return settings ? ajaxExtend(ajaxExtend(target, jQuery6.ajaxSettings), settings) : ajaxExtend(jQuery6.ajaxSettings, target);
          },
          ajaxPrefilter: addToPrefiltersOrTransports(prefilters),
          ajaxTransport: addToPrefiltersOrTransports(transports),
          ajax: function(url, options) {
            if (typeof url === "object") {
              options = url;
              url = void 0;
            }
            options = options || {};
            var transport, cacheURL, responseHeadersString, responseHeaders, timeoutTimer, parts, fireGlobals, i, s = jQuery6.ajaxSetup({}, options), callbackContext = s.context || s, globalEventContext = s.context && (callbackContext.nodeType || callbackContext.jquery) ? jQuery6(callbackContext) : jQuery6.event, deferred = jQuery6.Deferred(), completeDeferred = jQuery6.Callbacks("once memory"), statusCode = s.statusCode || {}, requestHeaders = {}, requestHeadersNames = {}, state = 0, strAbort = "canceled", jqXHR = {
              readyState: 0,
              getResponseHeader: function(key) {
                var match;
                if (state === 2) {
                  if (!responseHeaders) {
                    responseHeaders = {};
                    while (match = rheaders.exec(responseHeadersString)) {
                      responseHeaders[match[1].toLowerCase()] = match[2];
                    }
                  }
                  match = responseHeaders[key.toLowerCase()];
                }
                return match == null ? null : match;
              },
              getAllResponseHeaders: function() {
                return state === 2 ? responseHeadersString : null;
              },
              setRequestHeader: function(name, value) {
                var lname = name.toLowerCase();
                if (!state) {
                  name = requestHeadersNames[lname] = requestHeadersNames[lname] || name;
                  requestHeaders[name] = value;
                }
                return this;
              },
              overrideMimeType: function(type) {
                if (!state) {
                  s.mimeType = type;
                }
                return this;
              },
              statusCode: function(map) {
                var code;
                if (map) {
                  if (state < 2) {
                    for (code in map) {
                      statusCode[code] = [statusCode[code], map[code]];
                    }
                  } else {
                    jqXHR.always(map[jqXHR.status]);
                  }
                }
                return this;
              },
              abort: function(statusText) {
                var finalText = statusText || strAbort;
                if (transport) {
                  transport.abort(finalText);
                }
                done(0, finalText);
                return this;
              }
            };
            deferred.promise(jqXHR).complete = completeDeferred.add;
            jqXHR.success = jqXHR.done;
            jqXHR.error = jqXHR.fail;
            s.url = ((url || s.url || ajaxLocation) + "").replace(rhash, "").replace(rprotocol, ajaxLocParts[1] + "//");
            s.type = options.method || options.type || s.method || s.type;
            s.dataTypes = jQuery6.trim(s.dataType || "*").toLowerCase().match(rnotwhite) || [""];
            if (s.crossDomain == null) {
              parts = rurl.exec(s.url.toLowerCase());
              s.crossDomain = !!(parts && (parts[1] !== ajaxLocParts[1] || parts[2] !== ajaxLocParts[2] || (parts[3] || (parts[1] === "http:" ? "80" : "443")) !== (ajaxLocParts[3] || (ajaxLocParts[1] === "http:" ? "80" : "443"))));
            }
            if (s.data && s.processData && typeof s.data !== "string") {
              s.data = jQuery6.param(s.data, s.traditional);
            }
            inspectPrefiltersOrTransports(prefilters, s, options, jqXHR);
            if (state === 2) {
              return jqXHR;
            }
            fireGlobals = jQuery6.event && s.global;
            if (fireGlobals && jQuery6.active++ === 0) {
              jQuery6.event.trigger("ajaxStart");
            }
            s.type = s.type.toUpperCase();
            s.hasContent = !rnoContent.test(s.type);
            cacheURL = s.url;
            if (!s.hasContent) {
              if (s.data) {
                cacheURL = s.url += (rquery.test(cacheURL) ? "&" : "?") + s.data;
                delete s.data;
              }
              if (s.cache === false) {
                s.url = rts.test(cacheURL) ? cacheURL.replace(rts, "$1_=" + nonce++) : cacheURL + (rquery.test(cacheURL) ? "&" : "?") + "_=" + nonce++;
              }
            }
            if (s.ifModified) {
              if (jQuery6.lastModified[cacheURL]) {
                jqXHR.setRequestHeader("If-Modified-Since", jQuery6.lastModified[cacheURL]);
              }
              if (jQuery6.etag[cacheURL]) {
                jqXHR.setRequestHeader("If-None-Match", jQuery6.etag[cacheURL]);
              }
            }
            if (s.data && s.hasContent && s.contentType !== false || options.contentType) {
              jqXHR.setRequestHeader("Content-Type", s.contentType);
            }
            jqXHR.setRequestHeader(
              "Accept",
              s.dataTypes[0] && s.accepts[s.dataTypes[0]] ? s.accepts[s.dataTypes[0]] + (s.dataTypes[0] !== "*" ? ", " + allTypes + "; q=0.01" : "") : s.accepts["*"]
            );
            for (i in s.headers) {
              jqXHR.setRequestHeader(i, s.headers[i]);
            }
            if (s.beforeSend && (s.beforeSend.call(callbackContext, jqXHR, s) === false || state === 2)) {
              return jqXHR.abort();
            }
            strAbort = "abort";
            for (i in { success: 1, error: 1, complete: 1 }) {
              jqXHR[i](s[i]);
            }
            transport = inspectPrefiltersOrTransports(transports, s, options, jqXHR);
            if (!transport) {
              done(-1, "No Transport");
            } else {
              jqXHR.readyState = 1;
              if (fireGlobals) {
                globalEventContext.trigger("ajaxSend", [jqXHR, s]);
              }
              if (s.async && s.timeout > 0) {
                timeoutTimer = setTimeout(function() {
                  jqXHR.abort("timeout");
                }, s.timeout);
              }
              try {
                state = 1;
                transport.send(requestHeaders, done);
              } catch (e) {
                if (state < 2) {
                  done(-1, e);
                } else {
                  throw e;
                }
              }
            }
            function done(status, nativeStatusText, responses, headers) {
              var isSuccess, success, error, response, modified, statusText = nativeStatusText;
              if (state === 2) {
                return;
              }
              state = 2;
              if (timeoutTimer) {
                clearTimeout(timeoutTimer);
              }
              transport = void 0;
              responseHeadersString = headers || "";
              jqXHR.readyState = status > 0 ? 4 : 0;
              isSuccess = status >= 200 && status < 300 || status === 304;
              if (responses) {
                response = ajaxHandleResponses(s, jqXHR, responses);
              }
              response = ajaxConvert(s, response, jqXHR, isSuccess);
              if (isSuccess) {
                if (s.ifModified) {
                  modified = jqXHR.getResponseHeader("Last-Modified");
                  if (modified) {
                    jQuery6.lastModified[cacheURL] = modified;
                  }
                  modified = jqXHR.getResponseHeader("etag");
                  if (modified) {
                    jQuery6.etag[cacheURL] = modified;
                  }
                }
                if (status === 204 || s.type === "HEAD") {
                  statusText = "nocontent";
                } else if (status === 304) {
                  statusText = "notmodified";
                } else {
                  statusText = response.state;
                  success = response.data;
                  error = response.error;
                  isSuccess = !error;
                }
              } else {
                error = statusText;
                if (status || !statusText) {
                  statusText = "error";
                  if (status < 0) {
                    status = 0;
                  }
                }
              }
              jqXHR.status = status;
              jqXHR.statusText = (nativeStatusText || statusText) + "";
              if (isSuccess) {
                deferred.resolveWith(callbackContext, [success, statusText, jqXHR]);
              } else {
                deferred.rejectWith(callbackContext, [jqXHR, statusText, error]);
              }
              jqXHR.statusCode(statusCode);
              statusCode = void 0;
              if (fireGlobals) {
                globalEventContext.trigger(
                  isSuccess ? "ajaxSuccess" : "ajaxError",
                  [jqXHR, s, isSuccess ? success : error]
                );
              }
              completeDeferred.fireWith(callbackContext, [jqXHR, statusText]);
              if (fireGlobals) {
                globalEventContext.trigger("ajaxComplete", [jqXHR, s]);
                if (!--jQuery6.active) {
                  jQuery6.event.trigger("ajaxStop");
                }
              }
            }
            return jqXHR;
          },
          getJSON: function(url, data, callback) {
            return jQuery6.get(url, data, callback, "json");
          },
          getScript: function(url, callback) {
            return jQuery6.get(url, void 0, callback, "script");
          }
        });
        jQuery6.each(["get", "post"], function(i, method) {
          jQuery6[method] = function(url, data, callback, type) {
            if (jQuery6.isFunction(data)) {
              type = type || callback;
              callback = data;
              data = void 0;
            }
            return jQuery6.ajax({
              url,
              type: method,
              dataType: type,
              data,
              success: callback
            });
          };
        });
        jQuery6._evalUrl = function(url) {
          return jQuery6.ajax({
            url,
            type: "GET",
            dataType: "script",
            async: false,
            global: false,
            "throws": true
          });
        };
        jQuery6.fn.extend({
          wrapAll: function(html) {
            var wrap;
            if (jQuery6.isFunction(html)) {
              return this.each(function(i) {
                jQuery6(this).wrapAll(html.call(this, i));
              });
            }
            if (this[0]) {
              wrap = jQuery6(html, this[0].ownerDocument).eq(0).clone(true);
              if (this[0].parentNode) {
                wrap.insertBefore(this[0]);
              }
              wrap.map(function() {
                var elem = this;
                while (elem.firstElementChild) {
                  elem = elem.firstElementChild;
                }
                return elem;
              }).append(this);
            }
            return this;
          },
          wrapInner: function(html) {
            if (jQuery6.isFunction(html)) {
              return this.each(function(i) {
                jQuery6(this).wrapInner(html.call(this, i));
              });
            }
            return this.each(function() {
              var self2 = jQuery6(this), contents = self2.contents();
              if (contents.length) {
                contents.wrapAll(html);
              } else {
                self2.append(html);
              }
            });
          },
          wrap: function(html) {
            var isFunction = jQuery6.isFunction(html);
            return this.each(function(i) {
              jQuery6(this).wrapAll(isFunction ? html.call(this, i) : html);
            });
          },
          unwrap: function() {
            return this.parent().each(function() {
              if (!jQuery6.nodeName(this, "body")) {
                jQuery6(this).replaceWith(this.childNodes);
              }
            }).end();
          }
        });
        jQuery6.expr.filters.hidden = function(elem) {
          return elem.offsetWidth <= 0 && elem.offsetHeight <= 0;
        };
        jQuery6.expr.filters.visible = function(elem) {
          return !jQuery6.expr.filters.hidden(elem);
        };
        var r20 = /%20/g, rbracket = /\[\]$/, rCRLF = /\r?\n/g, rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i, rsubmittable = /^(?:input|select|textarea|keygen)/i;
        function buildParams(prefix, obj, traditional, add) {
          var name;
          if (jQuery6.isArray(obj)) {
            jQuery6.each(obj, function(i, v) {
              if (traditional || rbracket.test(prefix)) {
                add(prefix, v);
              } else {
                buildParams(prefix + "[" + (typeof v === "object" ? i : "") + "]", v, traditional, add);
              }
            });
          } else if (!traditional && jQuery6.type(obj) === "object") {
            for (name in obj) {
              buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
            }
          } else {
            add(prefix, obj);
          }
        }
        jQuery6.param = function(a, traditional) {
          var prefix, s = [], add = function(key, value) {
            value = jQuery6.isFunction(value) ? value() : value == null ? "" : value;
            s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
          };
          if (traditional === void 0) {
            traditional = jQuery6.ajaxSettings && jQuery6.ajaxSettings.traditional;
          }
          if (jQuery6.isArray(a) || a.jquery && !jQuery6.isPlainObject(a)) {
            jQuery6.each(a, function() {
              add(this.name, this.value);
            });
          } else {
            for (prefix in a) {
              buildParams(prefix, a[prefix], traditional, add);
            }
          }
          return s.join("&").replace(r20, "+");
        };
        jQuery6.fn.extend({
          serialize: function() {
            return jQuery6.param(this.serializeArray());
          },
          serializeArray: function() {
            return this.map(function() {
              var elements = jQuery6.prop(this, "elements");
              return elements ? jQuery6.makeArray(elements) : this;
            }).filter(function() {
              var type = this.type;
              return this.name && !jQuery6(this).is(":disabled") && rsubmittable.test(this.nodeName) && !rsubmitterTypes.test(type) && (this.checked || !rcheckableType.test(type));
            }).map(function(i, elem) {
              var val = jQuery6(this).val();
              return val == null ? null : jQuery6.isArray(val) ? jQuery6.map(val, function(val2) {
                return { name: elem.name, value: val2.replace(rCRLF, "\r\n") };
              }) : { name: elem.name, value: val.replace(rCRLF, "\r\n") };
            }).get();
          }
        });
        jQuery6.ajaxSettings.xhr = function() {
          try {
            return new XMLHttpRequest();
          } catch (e) {
          }
        };
        var xhrId = 0, xhrCallbacks = {}, xhrSuccessStatus = {
          0: 200,
          1223: 204
        }, xhrSupported = jQuery6.ajaxSettings.xhr();
        if (window2.attachEvent) {
          window2.attachEvent("onunload", function() {
            for (var key in xhrCallbacks) {
              xhrCallbacks[key]();
            }
          });
        }
        support.cors = !!xhrSupported && "withCredentials" in xhrSupported;
        support.ajax = xhrSupported = !!xhrSupported;
        jQuery6.ajaxTransport(function(options) {
          var callback;
          if (support.cors || xhrSupported && !options.crossDomain) {
            return {
              send: function(headers, complete) {
                var i, xhr = options.xhr(), id = ++xhrId;
                xhr.open(options.type, options.url, options.async, options.username, options.password);
                if (options.xhrFields) {
                  for (i in options.xhrFields) {
                    xhr[i] = options.xhrFields[i];
                  }
                }
                if (options.mimeType && xhr.overrideMimeType) {
                  xhr.overrideMimeType(options.mimeType);
                }
                if (!options.crossDomain && !headers["X-Requested-With"]) {
                  headers["X-Requested-With"] = "XMLHttpRequest";
                }
                for (i in headers) {
                  xhr.setRequestHeader(i, headers[i]);
                }
                callback = function(type) {
                  return function() {
                    if (callback) {
                      delete xhrCallbacks[id];
                      callback = xhr.onload = xhr.onerror = null;
                      if (type === "abort") {
                        xhr.abort();
                      } else if (type === "error") {
                        complete(
                          xhr.status,
                          xhr.statusText
                        );
                      } else {
                        complete(
                          xhrSuccessStatus[xhr.status] || xhr.status,
                          xhr.statusText,
                          typeof xhr.responseText === "string" ? {
                            text: xhr.responseText
                          } : void 0,
                          xhr.getAllResponseHeaders()
                        );
                      }
                    }
                  };
                };
                xhr.onload = callback();
                xhr.onerror = callback("error");
                callback = xhrCallbacks[id] = callback("abort");
                try {
                  xhr.send(options.hasContent && options.data || null);
                } catch (e) {
                  if (callback) {
                    throw e;
                  }
                }
              },
              abort: function() {
                if (callback) {
                  callback();
                }
              }
            };
          }
        });
        jQuery6.ajaxSetup({
          accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
          },
          contents: {
            script: /(?:java|ecma)script/
          },
          converters: {
            "text script": function(text) {
              jQuery6.globalEval(text);
              return text;
            }
          }
        });
        jQuery6.ajaxPrefilter("script", function(s) {
          if (s.cache === void 0) {
            s.cache = false;
          }
          if (s.crossDomain) {
            s.type = "GET";
          }
        });
        jQuery6.ajaxTransport("script", function(s) {
          if (s.crossDomain) {
            var script, callback;
            return {
              send: function(_, complete) {
                script = jQuery6("<script>").prop({
                  async: true,
                  charset: s.scriptCharset,
                  src: s.url
                }).on(
                  "load error",
                  callback = function(evt) {
                    script.remove();
                    callback = null;
                    if (evt) {
                      complete(evt.type === "error" ? 404 : 200, evt.type);
                    }
                  }
                );
                document2.head.appendChild(script[0]);
              },
              abort: function() {
                if (callback) {
                  callback();
                }
              }
            };
          }
        });
        var oldCallbacks = [], rjsonp = /(=)\?(?=&|$)|\?\?/;
        jQuery6.ajaxSetup({
          jsonp: "callback",
          jsonpCallback: function() {
            var callback = oldCallbacks.pop() || jQuery6.expando + "_" + nonce++;
            this[callback] = true;
            return callback;
          }
        });
        jQuery6.ajaxPrefilter("json jsonp", function(s, originalSettings, jqXHR) {
          var callbackName, overwritten, responseContainer, jsonProp = s.jsonp !== false && (rjsonp.test(s.url) ? "url" : typeof s.data === "string" && !(s.contentType || "").indexOf("application/x-www-form-urlencoded") && rjsonp.test(s.data) && "data");
          if (jsonProp || s.dataTypes[0] === "jsonp") {
            callbackName = s.jsonpCallback = jQuery6.isFunction(s.jsonpCallback) ? s.jsonpCallback() : s.jsonpCallback;
            if (jsonProp) {
              s[jsonProp] = s[jsonProp].replace(rjsonp, "$1" + callbackName);
            } else if (s.jsonp !== false) {
              s.url += (rquery.test(s.url) ? "&" : "?") + s.jsonp + "=" + callbackName;
            }
            s.converters["script json"] = function() {
              if (!responseContainer) {
                jQuery6.error(callbackName + " was not called");
              }
              return responseContainer[0];
            };
            s.dataTypes[0] = "json";
            overwritten = window2[callbackName];
            window2[callbackName] = function() {
              responseContainer = arguments;
            };
            jqXHR.always(function() {
              window2[callbackName] = overwritten;
              if (s[callbackName]) {
                s.jsonpCallback = originalSettings.jsonpCallback;
                oldCallbacks.push(callbackName);
              }
              if (responseContainer && jQuery6.isFunction(overwritten)) {
                overwritten(responseContainer[0]);
              }
              responseContainer = overwritten = void 0;
            });
            return "script";
          }
        });
        jQuery6.parseHTML = function(data, context, keepScripts) {
          if (!data || typeof data !== "string") {
            return null;
          }
          if (typeof context === "boolean") {
            keepScripts = context;
            context = false;
          }
          context = context || document2;
          var parsed = rsingleTag.exec(data), scripts = !keepScripts && [];
          if (parsed) {
            return [context.createElement(parsed[1])];
          }
          parsed = jQuery6.buildFragment([data], context, scripts);
          if (scripts && scripts.length) {
            jQuery6(scripts).remove();
          }
          return jQuery6.merge([], parsed.childNodes);
        };
        var _load = jQuery6.fn.load;
        jQuery6.fn.load = function(url, params, callback) {
          if (typeof url !== "string" && _load) {
            return _load.apply(this, arguments);
          }
          var selector, type, response, self2 = this, off = url.indexOf(" ");
          if (off >= 0) {
            selector = jQuery6.trim(url.slice(off));
            url = url.slice(0, off);
          }
          if (jQuery6.isFunction(params)) {
            callback = params;
            params = void 0;
          } else if (params && typeof params === "object") {
            type = "POST";
          }
          if (self2.length > 0) {
            jQuery6.ajax({
              url,
              type,
              dataType: "html",
              data: params
            }).done(function(responseText) {
              response = arguments;
              self2.html(selector ? jQuery6("<div>").append(jQuery6.parseHTML(responseText)).find(selector) : responseText);
            }).complete(callback && function(jqXHR, status) {
              self2.each(callback, response || [jqXHR.responseText, status, jqXHR]);
            });
          }
          return this;
        };
        jQuery6.each(["ajaxStart", "ajaxStop", "ajaxComplete", "ajaxError", "ajaxSuccess", "ajaxSend"], function(i, type) {
          jQuery6.fn[type] = function(fn) {
            return this.on(type, fn);
          };
        });
        jQuery6.expr.filters.animated = function(elem) {
          return jQuery6.grep(jQuery6.timers, function(fn) {
            return elem === fn.elem;
          }).length;
        };
        var docElem = window2.document.documentElement;
        function getWindow(elem) {
          return jQuery6.isWindow(elem) ? elem : elem.nodeType === 9 && elem.defaultView;
        }
        jQuery6.offset = {
          setOffset: function(elem, options, i) {
            var curPosition, curLeft, curCSSTop, curTop, curOffset, curCSSLeft, calculatePosition, position = jQuery6.css(elem, "position"), curElem = jQuery6(elem), props = {};
            if (position === "static") {
              elem.style.position = "relative";
            }
            curOffset = curElem.offset();
            curCSSTop = jQuery6.css(elem, "top");
            curCSSLeft = jQuery6.css(elem, "left");
            calculatePosition = (position === "absolute" || position === "fixed") && (curCSSTop + curCSSLeft).indexOf("auto") > -1;
            if (calculatePosition) {
              curPosition = curElem.position();
              curTop = curPosition.top;
              curLeft = curPosition.left;
            } else {
              curTop = parseFloat(curCSSTop) || 0;
              curLeft = parseFloat(curCSSLeft) || 0;
            }
            if (jQuery6.isFunction(options)) {
              options = options.call(elem, i, curOffset);
            }
            if (options.top != null) {
              props.top = options.top - curOffset.top + curTop;
            }
            if (options.left != null) {
              props.left = options.left - curOffset.left + curLeft;
            }
            if ("using" in options) {
              options.using.call(elem, props);
            } else {
              curElem.css(props);
            }
          }
        };
        jQuery6.fn.extend({
          offset: function(options) {
            if (arguments.length) {
              return options === void 0 ? this : this.each(function(i) {
                jQuery6.offset.setOffset(this, options, i);
              });
            }
            var docElem2, win, elem = this[0], box = { top: 0, left: 0 }, doc = elem && elem.ownerDocument;
            if (!doc) {
              return;
            }
            docElem2 = doc.documentElement;
            if (!jQuery6.contains(docElem2, elem)) {
              return box;
            }
            if (typeof elem.getBoundingClientRect !== strundefined) {
              box = elem.getBoundingClientRect();
            }
            win = getWindow(doc);
            return {
              top: box.top + win.pageYOffset - docElem2.clientTop,
              left: box.left + win.pageXOffset - docElem2.clientLeft
            };
          },
          position: function() {
            if (!this[0]) {
              return;
            }
            var offsetParent, offset, elem = this[0], parentOffset = { top: 0, left: 0 };
            if (jQuery6.css(elem, "position") === "fixed") {
              offset = elem.getBoundingClientRect();
            } else {
              offsetParent = this.offsetParent();
              offset = this.offset();
              if (!jQuery6.nodeName(offsetParent[0], "html")) {
                parentOffset = offsetParent.offset();
              }
              parentOffset.top += jQuery6.css(offsetParent[0], "borderTopWidth", true);
              parentOffset.left += jQuery6.css(offsetParent[0], "borderLeftWidth", true);
            }
            return {
              top: offset.top - parentOffset.top - jQuery6.css(elem, "marginTop", true),
              left: offset.left - parentOffset.left - jQuery6.css(elem, "marginLeft", true)
            };
          },
          offsetParent: function() {
            return this.map(function() {
              var offsetParent = this.offsetParent || docElem;
              while (offsetParent && (!jQuery6.nodeName(offsetParent, "html") && jQuery6.css(offsetParent, "position") === "static")) {
                offsetParent = offsetParent.offsetParent;
              }
              return offsetParent || docElem;
            });
          }
        });
        jQuery6.each({ scrollLeft: "pageXOffset", scrollTop: "pageYOffset" }, function(method, prop) {
          var top = "pageYOffset" === prop;
          jQuery6.fn[method] = function(val) {
            return access(this, function(elem, method2, val2) {
              var win = getWindow(elem);
              if (val2 === void 0) {
                return win ? win[prop] : elem[method2];
              }
              if (win) {
                win.scrollTo(
                  !top ? val2 : window2.pageXOffset,
                  top ? val2 : window2.pageYOffset
                );
              } else {
                elem[method2] = val2;
              }
            }, method, val, arguments.length, null);
          };
        });
        jQuery6.each(["top", "left"], function(i, prop) {
          jQuery6.cssHooks[prop] = addGetHookIf(
            support.pixelPosition,
            function(elem, computed) {
              if (computed) {
                computed = curCSS(elem, prop);
                return rnumnonpx.test(computed) ? jQuery6(elem).position()[prop] + "px" : computed;
              }
            }
          );
        });
        jQuery6.each({ Height: "height", Width: "width" }, function(name, type) {
          jQuery6.each({ padding: "inner" + name, content: type, "": "outer" + name }, function(defaultExtra, funcName) {
            jQuery6.fn[funcName] = function(margin, value) {
              var chainable = arguments.length && (defaultExtra || typeof margin !== "boolean"), extra = defaultExtra || (margin === true || value === true ? "margin" : "border");
              return access(this, function(elem, type2, value2) {
                var doc;
                if (jQuery6.isWindow(elem)) {
                  return elem.document.documentElement["client" + name];
                }
                if (elem.nodeType === 9) {
                  doc = elem.documentElement;
                  return Math.max(
                    elem.body["scroll" + name],
                    doc["scroll" + name],
                    elem.body["offset" + name],
                    doc["offset" + name],
                    doc["client" + name]
                  );
                }
                return value2 === void 0 ? jQuery6.css(elem, type2, extra) : jQuery6.style(elem, type2, value2, extra);
              }, type, chainable ? margin : void 0, chainable, null);
            };
          });
        });
        jQuery6.fn.size = function() {
          return this.length;
        };
        jQuery6.fn.andSelf = jQuery6.fn.addBack;
        if (typeof define === "function" && define.amd) {
          define("jquery", [], function() {
            return jQuery6;
          });
        }
        var _jQuery = window2.jQuery, _$ = window2.$;
        jQuery6.noConflict = function(deep) {
          if (window2.$ === jQuery6) {
            window2.$ = _$;
          }
          if (deep && window2.jQuery === jQuery6) {
            window2.jQuery = _jQuery;
          }
          return jQuery6;
        };
        if (typeof noGlobal === strundefined) {
          window2.jQuery = window2.$ = jQuery6;
        }
        return jQuery6;
      });
    }
  });

  // js/Visiomatic.js
  var Visiomatic_exports = {};
  __export(Visiomatic_exports, {
    catalog: () => catalog_exports,
    control: () => control_exports,
    crs: () => crs_exports,
    layer: () => layer_exports,
    util: () => util_exports,
    vector: () => vector_exports
  });

  // js/catalog/index.js
  var catalog_exports = {};
  __export(catalog_exports, {
    Abell: () => Abell,
    AllWISE: () => AllWISE,
    Catalog: () => Catalog,
    FIRST: () => FIRST,
    GALEX_AIS: () => GALEX_AIS,
    GLEAM: () => GLEAM,
    Gaia_DR1: () => Gaia_DR1,
    Gaia_DR2: () => Gaia_DR2,
    NVSS: () => NVSS,
    PPMXL: () => PPMXL,
    PanSTARRS1: () => PanSTARRS1,
    SDSS: () => SDSS,
    TGSS: () => TGSS,
    TwoMASS: () => TwoMASS,
    URAT_1: () => URAT_1
  });

  // js/catalog/Catalog.js
  var import_leaflet = __toESM(require_leaflet_src());
  var import_leaflet2 = __toESM(require_leaflet_src());
  var Catalog = {
    nmax: 1e4,
    _csvToGeoJSON: function(str) {
      var badreg = new RegExp("#|--|objName|string|^$"), lines = str.split("\n"), geo = { type: "FeatureCollection", features: [] };
      for (var i in lines) {
        var line = lines[i];
        if (badreg.test(line) === false) {
          var feature = {
            type: "Feature",
            id: "",
            properties: {
              items: []
            },
            geometry: {
              type: "Point",
              coordinates: [0, 0]
            }
          }, geometry = feature.geometry, properties = feature.properties;
          var cell = line.split(/[,;\t]/);
          feature.id = cell[0];
          geometry.coordinates[0] = parseFloat(cell[1]);
          geometry.coordinates[1] = parseFloat(cell[2]);
          var items = cell.slice(3), item;
          for (var j in items) {
            properties.items.push(this.readProperty(items[j]));
          }
          geo.features.push(feature);
        }
      }
      return geo;
    },
    readProperty: function(item) {
      var fitem = parseFloat(item);
      return isNaN(fitem) ? "--" : fitem;
    },
    toGeoJSON: function(str) {
      return this._csvToGeoJSON(str);
    },
    popup: function(feature) {
      var str = "<div>";
      if (this.objurl) {
        str += 'ID: <a href="' + (0, import_leaflet2.template)(this.objurl, (0, import_leaflet.extend)({
          ra: feature.geometry.coordinates[0].toFixed(6),
          dec: feature.geometry.coordinates[1].toFixed(6)
        })) + '" target="_blank">' + feature.id + "</a></div>";
      } else {
        str += "ID: " + feature.id + "</div>";
      }
      str += '<TABLE style="margin:auto;"><TBODY style="vertical-align:top;text-align:left;">';
      for (var i in this.properties) {
        if (this.propertyMask === void 0 || this.propertyMask[i] === true) {
          str += "<TR><TD>" + this.properties[i] + ":</TD><TD>" + feature.properties.items[i].toString() + " ";
          if (this.units[i]) {
            str += this.units[i];
          }
          str += "</TD></TR>";
        }
      }
      str += "</TBODY></TABLE>";
      return str;
    },
    draw: function(feature, latlng) {
      var refmag = feature.properties.items[this.magindex ? this.magindex : 0];
      return (0, import_leaflet.circleMarker)(latlng, {
        radius: refmag ? this.maglim + 5 - refmag : 8
      });
    },
    filter: function(feature) {
      return true;
    },
    vizierURL: "https://vizier.unistra.fr/viz-bin",
    mastURL: "https://archive.stsci.edu"
  };

  // js/catalog/Abell.js
  var import_leaflet3 = __toESM(require_leaflet_src());
  var Abell = (0, import_leaflet3.extend)({}, Catalog, {
    service: "Vizier@CDS",
    name: "Abell clusters",
    className: "logo-catalog-vizier",
    attribution: "Rich Clusters of Galaxies (Abell et al. 1989) ",
    color: "orange",
    maglim: 30,
    regionType: "box",
    url: Catalog.vizierURL + "/asu-tsv?&-mime=csv&-source=VII/110A&-out=ACO,_RAJ2000,_DEJ2000,m10,Rich,Dclass&-out.meta=&-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=m10",
    properties: ["m<sub>10</sub>", "Richness", "D<sub>class</sub>"],
    units: ["", "", ""],
    objurl: Catalog.vizierURL + "/VizieR-5?-source=VII/110A&-c={ra},{dec},eq=J2000&-c.rs=0.2"
  });

  // js/catalog/AllWISE.js
  var import_leaflet4 = __toESM(require_leaflet_src());
  var AllWISE = (0, import_leaflet4.extend)({}, Catalog, {
    service: "Vizier@CDS",
    name: "AllWISE",
    className: "logo-catalog-vizier",
    attribution: "AllWISE Data Release (Cutri et al. 2013)",
    color: "red",
    maglim: 18,
    regionType: "box",
    url: Catalog.vizierURL + "/asu-tsv?&-mime=csv&-source=II/328/allwise&-out=AllWISE,_RAJ2000,_DEJ2000,W1mag,W2mag,W3mag,W4mag&-out.meta=&-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=W1mag",
    properties: [
      "W1<sub>mag</sub> (3.4\xB5m)",
      "W2<sub>mag</sub> (4.6\xB5m)",
      "W3<sub>mag</sub> (12\xB5m)",
      "W4<sub>mag</sub> (22\xB5m)"
    ],
    units: ["", "", "", ""],
    objurl: Catalog.vizierURL + "/VizieR-5?-source=II/328/allwise&-c={ra},{dec},eq=J2000&-c.rs=0.2"
  });

  // js/catalog/FIRST.js
  var import_leaflet7 = __toESM(require_leaflet_src());

  // js/vector/index.js
  var vector_exports = {};
  __export(vector_exports, {
    Ellipse: () => Ellipse,
    EllipseMarker: () => EllipseMarker,
    ellipse: () => ellipse,
    ellipseMarker: () => ellipseMarker
  });

  // js/vector/Ellipse.js
  var import_leaflet6 = __toESM(require_leaflet_src());

  // js/vector/EllipseMarker.js
  var import_leaflet5 = __toESM(require_leaflet_src());
  var EllipseMarker = import_leaflet5.Path.extend({
    CANVAS: true,
    SVG: false,
    options: {
      fill: true,
      majAxis: 10,
      minAxis: 10,
      posAngle: 0
    },
    initialize: function(latlng, options) {
      import_leaflet5.Util.setOptions(this, options);
      this._majAxis = this.options.majAxis;
      this._minAxis = this.options.majAxis;
      this._posAngle = this.options.posAngle;
      this._latlng = (0, import_leaflet5.latLng)(latlng);
      var deg = Math.PI / 180, cpa = Math.cos(this._posAngle * deg), spa = Math.sin(this._posAngle * deg), cpa2 = cpa * cpa, spa2 = spa * spa, a2 = this._majAxis * this._majAxis, b2 = this._minAxis * this._minAxis, mx2 = a2 * cpa2 + b2 * spa2, my2 = a2 * spa2 + b2 * cpa2, mxy = (a2 - b2) * cpa * spa, c = mx2 * my2 - mxy * mxy;
      this._limX = Math.sqrt(mx2);
      this._limY = Math.sqrt(my2);
      if (c <= 0) {
        mx2 += 1;
        my2 += 1;
        c = mx2 * my2 - mxy * mxy;
      }
      this._cXX = my2 / c;
      this._cYY = mx2 / c;
      this._cXY = -2 * mxy / c;
    },
    setLatLng: function(latlng) {
      this._latlng = (0, import_leaflet5.latLng)(latlng);
      this.redraw();
      return this.fire("move", { latlng: this._latlng });
    },
    getLatLng: function() {
      return this._latlng;
    },
    setParams: function(ellipseParams) {
      this.options.majAxis = this._majAxis = ellipseParams.majAxis;
      this.options.minAxis = this._minAxis = ellipseParams.minAxis;
      this.options.posAngle = this._posAngle = ellipseParams.posAngle;
      return this.redraw();
    },
    getParams: function() {
      var ellipseParams;
      ellipseParams.majAxis = this._majAxis;
      ellipseParams.minAxis = this._minAxis;
      ellipseParams.posAngle = this._posAngle;
      return ellipseParams;
    },
    setStyle: import_leaflet5.Path.prototype.setStyle,
    _project: function() {
      this._point = this._map.latLngToLayerPoint(this._latlng);
      this._updateBounds();
    },
    _updateBounds: function() {
      var w = this._clickTolerance(), p = [this._limX + w, this._limY + w];
      this._pxBounds = new import_leaflet5.Bounds(this._point.subtract(p), this._point.add(p));
    },
    _update: function() {
      if (this._map) {
        this._updatePath();
      }
    },
    _updatePath: function() {
      this._renderer._updateEllipse(this);
    },
    _empty: function() {
      return this._majAxis && !this._renderer._bounds.intersects(this._pxBounds);
    },
    _containsPoint: function(p) {
      var dp = p.subtract(this._point), ct = this._clickTolerance(), dx = Math.abs(dp.x) - ct, dy = Math.abs(dp.y) - ct;
      return this._cXX * (dx > 0 ? dx * dx : 0) + this._cYY * (dy > 0 ? dy * dy : 0) + this._cXY * (dp.x * dp.y) <= 1;
    }
  });
  var ellipseMarker = function(latlng, options) {
    return new EllipseMarker(latlng, options);
  };
  import_leaflet5.Canvas.include({
    _updateEllipse: function(layer) {
      if (layer._empty()) {
        return;
      }
      var p = layer._point, ctx = this._ctx, r = layer._minAxis, s = layer._majAxis / layer._minAxis;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(layer._posAngle * Math.PI / 180);
      ctx.scale(1, s);
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2, false);
      ctx.restore();
      this._fillStroke(ctx, layer);
    }
  });
  import_leaflet5.SVG.include({
    _updateEllipse: function(layer) {
      var deg = Math.PI / 180, p = layer._point, r = layer._minAxis, r2 = layer._majAxis, dx = r * Math.cos(layer._posAngle * deg), dy = r * Math.sin(layer._posAngle * deg), arc = "a" + r + "," + r2 + " " + layer._posAngle + " 1,0 ";
      var d = layer._empty() ? "M0 0" : "M" + (p.x - dx) + "," + (p.y - dy) + arc + dx * 2 + "," + dy * 2 + " " + arc + -dx * 2 + "," + -dy * 2 + " ";
      this._setPath(layer, d);
    }
  });

  // js/vector/Ellipse.js
  var Ellipse = EllipseMarker.extend({
    options: {
      fill: true
    },
    initialize: function(latlng, options) {
      import_leaflet6.Util.setOptions(this, options);
      var deg = Math.PI / 180, cpa = Math.cos(this.options.posAngle * deg), spa = Math.sin(this.options.posAngle * deg), cpa2 = cpa * cpa, spa2 = spa * spa, a2 = this.options.majAxis * this.options.majAxis, b2 = this.options.minAxis * this.options.minAxis;
      this._latlng = (0, import_leaflet6.latLng)(latlng);
      this._mLat2 = a2 * cpa2 + b2 * spa2;
      this._mLng2 = a2 * spa2 + b2 * cpa2;
      this._mLatLng = (a2 - b2) * cpa * spa;
    },
    getBounds: function() {
      var half = [this._limX, this._limY];
      return new import_leaflet6.LatLngBounds(
        this._map.layerPointToLatLng(this._point.subtract(half)),
        this._map.layerPointToLatLng(this._point.add(half))
      );
    },
    _project: function() {
      var map = this._map, crs = map.options.crs;
      this._point = map.latLngToLayerPoint(this._latlng);
      if (!this._majAxis1) {
        var lng = this._latlng.lng, lat = this._latlng.lat, deg = Math.PI / 180, clat = Math.cos(lat * deg), dl = lat < 90 ? 1e-3 : -1e-3, point7 = crs.project(this._latlng), dpointdlat = crs.project((0, import_leaflet6.latLng)(lat + dl, lng)).subtract(point7), dpointdlng = crs.project((0, import_leaflet6.latLng)(lat, lng + dl * 1 / (clat > dl ? clat : dl))).subtract(point7), c11 = dpointdlat.x / dl, c12 = dpointdlng.x / dl, c21 = dpointdlat.y / dl, c22 = dpointdlng.y / dl, mx2 = c11 * c11 * this._mLat2 + c12 * c12 * this._mLng2 + 2 * c11 * c12 * this._mLatLng, my2 = c21 * c21 * this._mLat2 + c22 * c22 * this._mLng2 + 2 * c21 * c22 * this._mLatLng, mxy = c11 * c21 * this._mLat2 + c12 * c22 * this._mLng2 + (c11 * c22 + c12 * c21) * this._mLatLng, a1 = 0.5 * (mx2 + my2), a2 = Math.sqrt(0.25 * (mx2 - my2) * (mx2 - my2) + mxy * mxy), a3 = mx2 * my2 - mxy * mxy;
        this._majAxis = this._majAxis1 = Math.sqrt(a1 + a2);
        this._minAxis = this._minAxis1 = a1 > a2 ? Math.sqrt(a1 - a2) : 0;
        this._posAngle = 0.5 * Math.atan2(2 * mxy, mx2 - my2) / deg;
        this._limX = this._limX1 = Math.sqrt(mx2);
        this._limY = this._limY1 = Math.sqrt(my2);
        if (a3 <= 0) {
          mx2 += 1;
          my2 += 1;
          a3 = mx2 * my2 - mxy * mxy;
        }
        this._cXX1 = my2 / a3;
        this._cYY1 = mx2 / a3;
        this._cXY1 = -2 * mxy / a3;
      }
      var scale2 = crs.scale(map._zoom), invscale2 = 1 / (scale2 * scale2);
      this._majAxis = this._majAxis1 * scale2;
      this._minAxis = this._minAxis1 * scale2;
      this._limX = this._limX1 * scale2;
      this._limY = this._limY1 * scale2;
      this._cXX = this._cXX1 * invscale2;
      this._cYY = this._cYY1 * invscale2;
      this._cXY = this._cXY1 * invscale2;
      this._updateBounds();
    }
  });
  var ellipse = function(latlng, options) {
    return new Ellipse(latlng, options);
  };

  // js/catalog/FIRST.js
  var FIRST = (0, import_leaflet7.extend)({}, Catalog, {
    service: "Vizier@CDS",
    name: "FIRST",
    className: "logo-catalog-vizier",
    attribution: "The FIRST Survey Catalog (Helfand et al. 2015)",
    color: "blue",
    maglim: 30,
    regionType: "box",
    url: Catalog.vizierURL + "/asu-tsv?&-mime=csv&-source=VIII/92/first14&-out=FIRST,_RAJ2000,_DEJ2000,Fpeak,fMaj,fMin,fPA&-out.meta=&-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=-Fpeak",
    properties: ["F<sub>peak</sub>(1.4GHz)", "Major axis FWHM", "Minor axis FWHM", "Position angle"],
    units: ["mJy", "&#8243;", "&#8243;", "&#176;"],
    objurl: Catalog.vizierURL + "/VizieR-5?-source=VIII/92/first14&-c={ra},{dec},eq=J2000&-c.rs=0.2",
    draw: function(feature, latlng) {
      return ellipse(latlng, {
        majAxis: feature.properties.items[1] / 7200,
        minAxis: feature.properties.items[2] / 7200,
        posAngle: feature.properties.items[3] === "--" ? 0 : feature.properties.items[3]
      });
    }
  });

  // js/catalog/Gaia.js
  var import_leaflet8 = __toESM(require_leaflet_src());
  var Gaia_DR1 = (0, import_leaflet8.extend)({}, Catalog, {
    service: "Vizier@CDS",
    name: "Gaia DR1",
    className: "logo-catalog-vizier",
    attribution: "First Gaia Data Release (2016)",
    color: "green",
    maglim: 21,
    regionType: "box",
    url: Catalog.vizierURL + "/asu-tsv?&-mime=csv&-source=I/337/gaia&-out=Source,RA_ICRS,DE_ICRS,<Gmag>,pmRA,pmDE&-out.meta=&-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=<Gmag>",
    properties: ["G", "&#956;<sub>&#593;</sub> cos &#948;", "&#956;<sub>&#948;</sub>"],
    units: ["", "mas/yr", "mas/yr"],
    objurl: Catalog.vizierURL + "/VizieR-5?-source=I/337/gaia&-c={ra},{dec},eq=J2000&-c.rs=0.01"
  });
  var Gaia_DR2 = (0, import_leaflet8.extend)({}, Catalog, {
    service: "Vizier@CDS",
    name: "Gaia DR2",
    className: "logo-catalog-vizier",
    attribution: "Second Gaia Data Release (2018)",
    color: "green",
    maglim: 21,
    regionType: "box",
    url: Catalog.vizierURL + "/asu-tsv?&-mime=csv&-source=I/345/gaia2&-out=Source,RA_ICRS,DE_ICRS,Gmag,BPmag,RPmag,pmRA,pmDE&-out.meta=&-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=Gmag",
    properties: [
      "G",
      "B<sub>P</sub>",
      "R<sub>P</sub>",
      "&#956;<sub>&#593;</sub> cos &#948;",
      "&#956;<sub>&#948;</sub>"
    ],
    units: ["", "", "", "mas/yr", "mas/yr"],
    objurl: Catalog.vizierURL + "/VizieR-5?-source=I/345/gaia2&-c={ra},{dec},eq=J2000&-c.rs=0.01"
  });

  // js/catalog/GALEX.js
  var import_leaflet9 = __toESM(require_leaflet_src());
  var GALEX_AIS = (0, import_leaflet9.extend)({}, Catalog, {
    service: "Vizier@CDS",
    name: "GALEX AIS",
    className: "logo-catalog-vizier",
    attribution: "GALEX catalogs of UV sources: All-sky Imaging Survey (Bianchi et al. 2011)",
    color: "magenta",
    maglim: 21,
    regionType: "box",
    url: Catalog.vizierURL + "/asu-tsv?&-mime=csv&-source=II/312/ais&-out=objid,_RAJ2000,_DEJ2000,FUV,NUV&-out.meta=&-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=FUV",
    properties: ["FUV<sub>AB</sub>", "NUV<sub>AB</sub>"],
    units: ["", ""],
    objurl: Catalog.vizierURL + "/VizieR-5?-source=II/312/ais&-c={ra},{dec},eq=J2000&-c.rs=0.2"
  });

  // js/catalog/GLEAM.js
  var import_leaflet10 = __toESM(require_leaflet_src());
  var GLEAM = (0, import_leaflet10.extend)({}, Catalog, {
    service: "Vizier@CDS",
    name: "GLEAM",
    className: "logo-catalog-vizier",
    attribution: "GaLactic and Extragalactic All-sky Murchison Wide Field Array (GLEAM) low-frequency extragalactic catalogue (Hurley-Walker et al. 2017)",
    color: "blue",
    maglim: 30,
    regionType: "box",
    url: Catalog.vizierURL + "/asu-tsv?&-mime=csv&-source=VIII/100/gleamegc&-out=GLEAM,RAJ2000,DEJ2000,Fintwide,awide,bwide,pawide&-out.meta=&-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=-Fintwide",
    properties: ["F<sub>int</sub>(170-231MHz)", "Major axis FWHM", "Minor axis FWHM", "Position angle"],
    units: ["Jy", "&#8243;", "&#8243;", "&#176;"],
    objurl: Catalog.vizierURL + "/VizieR-5?-source=-source=VIII/100/gleamegc&-c={ra},{dec},eq=J2000&-c.rs=0.2",
    draw: function(feature, latlng) {
      return ellipse(latlng, {
        majAxis: feature.properties.items[1] / 3600,
        minAxis: feature.properties.items[2] / 3600,
        posAngle: feature.properties.items[3] === "--" ? 0 : feature.properties.items[3]
      });
    }
  });

  // js/catalog/NVSS.js
  var import_leaflet11 = __toESM(require_leaflet_src());
  var NVSS = (0, import_leaflet11.extend)({}, Catalog, {
    service: "Vizier@CDS",
    name: "NVSS",
    className: "logo-catalog-vizier",
    attribution: "1.4GHz NRAO VLA Sky Survey (NVSS) (Condon et al. 1998)",
    color: "magenta",
    maglim: 30,
    regionType: "box",
    url: Catalog.vizierURL + "/asu-tsv?&-mime=csv&-source=VIII/65/NVSS&-out=NVSS,_RAJ2000,_DEJ2000,S1.4,MajAxis,MinAxis,PA&-out.meta=&-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=-S1.4",
    properties: ["S<sub>1.4GHz</sub>", "Major axis", "Minor axis", "Position angle"],
    units: ["mJy", "&#8243;", "&#8243;", "&#176;"],
    objurl: Catalog.vizierURL + "/VizieR-5?-source=VIII/65/NVSS&-c={ra},{dec},eq=J2000&-c.rs=0.2",
    draw: function(feature, latlng) {
      return ellipse(latlng, {
        majAxis: feature.properties.items[1] / 7200,
        minAxis: feature.properties.items[2] / 7200,
        posAngle: feature.properties.items[3] === "--" ? 0 : feature.properties.items[3]
      });
    }
  });

  // js/catalog/PanSTARRS.js
  var import_leaflet12 = __toESM(require_leaflet_src());
  var PanSTARRS1 = (0, import_leaflet12.extend)({}, Catalog, {
    service: "Vizier@CDS",
    name: "PanSTARRS 1",
    className: "logo-catalog-vizier",
    attribution: "Pan-STARRS release 1 (PS1) Survey (Chambers et al. 2016)",
    color: "yellow",
    maglim: 24,
    regionType: "box",
    url: Catalog.vizierURL + "/asu-tsv?&-mime=csv&-source=II/349&-out=objID,RAJ2000,DEJ2000,gKmag,rKmag,iKmag,zKmag,yKmag&-out.meta=&-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=rmag",
    properties: ["g", "r", "i", "z", "y"],
    units: ["", "", "", "", ""],
    objurl: Catalog.vizierURL + "/VizieR-5?-source=II/349/ps1&-c={ra},{dec},eq=J2000&-c.rs=0.01"
  });

  // js/catalog/PPMXL.js
  var import_leaflet13 = __toESM(require_leaflet_src());
  var PPMXL = (0, import_leaflet13.extend)({}, Catalog, {
    service: "Vizier@CDS",
    name: "PPMXL",
    className: "logo-catalog-vizier",
    attribution: "PPM-Extended, positions and proper motions (Roeser et al. 2008)",
    color: "green",
    maglim: 20,
    regionType: "box",
    url: Catalog.vizierURL + "/asu-tsv?&-mime=csv&-source=I/317&-out=PPMXL,RAJ2000,DEJ2000,Jmag,Hmag,Kmag,b1mag,b2mag,r1mag,r2mag,imag,pmRA,pmDE&-out.meta=&-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=Jmag",
    properties: [
      "J",
      "H",
      "K",
      "b<sub>1</sub>",
      "b<sub>2</sub>",
      "r<sub>1</sub>",
      "r<sub>2</sub>",
      "i",
      "&#956;<sub>&#593;</sub> cos &#948;",
      "&#956;<sub>&#948;</sub>"
    ],
    units: ["", "", "", "", "", "", "", "", "mas/yr", "mas/yr"],
    objurl: Catalog.vizierURL + "/VizieR-5?-source=I/317&-c={ra},{dec},eq=J2000&-c.rs=0.01"
  });

  // js/catalog/SDSS.js
  var import_leaflet14 = __toESM(require_leaflet_src());
  var SDSS = (0, import_leaflet14.extend)({}, Catalog, {
    service: "Vizier@CDS",
    name: "SDSS release 12",
    className: "logo-catalog-vizier",
    attribution: "SDSS Photometric Catalog, Release 12 (Alam et al. 2015)",
    color: "yellow",
    maglim: 25,
    regionType: "box",
    url: Catalog.vizierURL + "/asu-tsv?&-mime=csv&-source=V/147&-out=SDSS12,RA_ICRS,DE_ICRS,umag,gmag,rmag,imag,zmag&-out.meta=&-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=rmag",
    properties: ["u", "g", "r", "i", "z"],
    units: ["", "", "", "", ""],
    objurl: Catalog.vizierURL + "/VizieR-5?-source=V/147/sdss12&-c={ra},{dec},eq=J2000&-c.rs=0.01"
  });

  // js/catalog/TGSS.js
  var import_leaflet15 = __toESM(require_leaflet_src());
  var TGSS = (0, import_leaflet15.extend)({}, Catalog, {
    service: "Vizier@CDS",
    name: "TGSS",
    className: "logo-catalog-vizier",
    attribution: "The GMRT 150 MHz all-sky radio survey. TGSS ADR1 (Intema et al. 2017)",
    color: "blue",
    maglim: 30,
    regionType: "box",
    url: Catalog.vizierURL + "/asu-tsv?&-mime=csv&-source=J/A%2bA/598/A78/table3&-out=TGSSADR,RAJ2000,DEJ2000,Stotal,Maj,Min,PA&-out.meta=&-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=-Stotal",
    properties: ["F<sub>peak</sub>(150MHz)", "Major axis FWHM", "Minor axis FWHM", "Position angle"],
    units: ["mJy", "&#8243;", "&#8243;", "&#176;"],
    objurl: Catalog.vizierURL + "/VizieR-3?-source=-source=J/A%2bA/598/A78/table3&-c={ra},{dec},eq=J2000&-c.rs=0.2",
    draw: function(feature, latlng) {
      return ellipse(latlng, {
        majAxis: feature.properties.items[1] / 7200,
        minAxis: feature.properties.items[2] / 7200,
        posAngle: feature.properties.items[3] === "--" ? 0 : feature.properties.items[3]
      });
    }
  });

  // js/catalog/TwoMASS.js
  var import_leaflet16 = __toESM(require_leaflet_src());
  var TwoMASS = (0, import_leaflet16.extend)({}, Catalog, {
    service: "Vizier@CDS",
    name: "2MASS",
    className: "logo-catalog-vizier",
    attribution: "2MASS All-Sky Catalog of Point Sources (Cutri et al. 2003)",
    color: "red",
    maglim: 17,
    regionType: "box",
    url: Catalog.vizierURL + "/asu-tsv?&-mime=csv&-source=II/246&-out=2MASS,RAJ2000,DEJ2000,Jmag,Hmag,Kmag&-out.meta=&-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=Jmag",
    properties: ["J", "H", "K"],
    units: ["", "", ""],
    objurl: Catalog.vizierURL + "/VizieR-5?-source=II/246&-c={ra},{dec},eq=J2000&-c.rs=0.01"
  });

  // js/catalog/URAT.js
  var import_leaflet17 = __toESM(require_leaflet_src());
  var URAT_1 = (0, import_leaflet17.extend)({}, Catalog, {
    service: "Vizier@CDS",
    name: "URAT1",
    className: "logo-catalog-vizier",
    attribution: "The first U.S. Naval Observatory Astrometric Robotic Telescope Catalog (Zacharias et al. 2015)",
    color: "yellow",
    maglim: 17,
    regionType: "box",
    url: Catalog.vizierURL + "/asu-tsv?&-mime=csv&-source=I/329&-out=URAT1,RAJ2000,DEJ2000,f.mag,pmRA,pmDE&-out.meta=&-c.eq={sys}&-c={lng},{lat}&-c.bd={dlng},{dlat}&-out.max={nmax}&-sort=f.mag",
    properties: ["f<sub>mag</sub>", "&#956;<sub>&#593;</sub> cos &#948;", "&#956;<sub>&#948;</sub>"],
    units: ["", "mas/yr", "mas/yr"],
    objurl: Catalog.vizierURL + "/VizieR-5?-source=I/329&-c={ra},{dec},eq=J2000&-c.rs=0.01"
  });

  // js/control/index.js
  var control_exports = {};
  __export(control_exports, {
    CatalogUI: () => CatalogUI,
    ChannelUI: () => ChannelUI,
    Coords: () => Coords,
    DocUI: () => DocUI,
    ExtraMap: () => ExtraMap,
    FullScreen: () => FullScreen,
    ImageUI: () => ImageUI,
    OverlayUI: () => OverlayUI,
    ProfileUI: () => ProfileUI,
    RegionUI: () => RegionUI,
    Reticle: () => Reticle,
    Scale: () => Scale,
    Sidebar: () => Sidebar,
    SnapshotUI: () => SnapshotUI,
    catalogUI: () => catalogUI,
    channelUI: () => channelUI,
    coords: () => coords,
    docUI: () => docUI,
    extraMap: () => extraMap,
    imageUI: () => imageUI,
    overlayUI: () => overlayUI,
    profileUI: () => profileUI,
    regionUI: () => regionUI,
    reticle: () => reticle,
    scale: () => scale,
    sidebar: () => sidebar,
    snapshotUI: () => snapshotUI
  });

  // js/control/CatalogUI.js
  var import_leaflet23 = __toESM(require_leaflet_src());

  // js/util/index.js
  var util_exports = {};
  __export(util_exports, {
    RGB: () => RGB,
    VUtil: () => VUtil,
    rgb: () => rgb2
  });

  // js/util/RGB.js
  var import_leaflet18 = __toESM(require_leaflet_src());
  var RGB = function(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  };
  RGB.prototype = {
    clone: function() {
      return new RGB(this.r, this.g, this.b);
    },
    toStr: function() {
      var r = Math.round(this.r * 255), g = Math.round(this.g * 255), b = Math.round(this.b * 255);
      if (r < 0) {
        r = 0;
      } else if (r > 255) {
        r = 255;
      }
      if (g < 0) {
        g = 0;
      } else if (g > 255) {
        g = 255;
      }
      if (b < 0) {
        b = 0;
      } else if (b > 255) {
        b = 255;
      }
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    isOn: function() {
      return this.r > 0 || this.g > 0 || this.b > 0 ? true : false;
    }
  };
  var rgb2 = function(r, g, b) {
    if (r instanceof RGB) {
      return r;
    }
    if (typeof r === "string") {
      var bigint = parseInt("0x" + r.slice(1), 16);
      return new RGB(
        (bigint >> 16 & 255) / 255,
        (bigint >> 8 & 255) / 255,
        (bigint & 255) / 255
      );
    }
    if (import_leaflet18.Util.isArray(r)) {
      return new RGB(r[0], r[1], r[2]);
    }
    if (r === void 0 || r === null) {
      return r;
    }
    return new RGB(r, g, b);
  };

  // js/util/VUtil.js
  var import_leaflet19 = __toESM(require_leaflet_src());
  var VUtil = {
    REG_PDEC: "(\\d+\\.\\d*)",
    REG_FLOAT: "([-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?)",
    requestURL: function(url, purpose, action, context, timeout) {
      var httpRequest;
      if (window.XMLHttpRequest) {
        httpRequest = new XMLHttpRequest();
      } else if (window.ActiveXObject) {
        try {
          httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
          try {
            httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
          } catch (e2) {
          }
        }
      }
      if (!httpRequest) {
        alert("Giving up: Cannot create an XMLHTTP instance for " + purpose);
        return false;
      }
      if (timeout) {
        httpRequest.timeout = timeout * 1e3;
        httpRequest.ontimeout = function() {
          alert("Time out while " + purpose);
        };
      }
      httpRequest.open("GET", url);
      if (context && context.options.credentials) {
        httpRequest.withCredentials = true;
      }
      if (context && context.options.authenticate === "csrftoken") {
        httpRequest.setRequestHeader("X-CSRFToken", this.getCookie("csrftoken"));
      }
      if (action) {
        httpRequest.onreadystatechange = function() {
          action(context, httpRequest);
        };
      }
      httpRequest.send();
    },
    parseURL: function(url) {
      var dict = {};
      url.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function($0, $1, $2, $3) {
          dict[$1] = $3;
        }
      );
      return dict;
    },
    updateURL: function(url, keyword, value) {
      var re = new RegExp("([?&])" + keyword + "=.*?(&|$)", "i"), separator = url.indexOf("?") !== -1 ? "&" : "?";
      return url.match(re) ? url.replace(re, "$1" + keyword + "=" + value + "$2") : url + separator + keyword + "=" + value;
    },
    checkDomain: function(url) {
      if (url.indexOf("//") === 0) {
        url = location.protocol + url;
      }
      return url.toLowerCase().replace(/([a-z])?:\/\//, "$1").split("/")[0];
    },
    isExternal: function(url) {
      return (url.indexOf(":") > -1 || url.indexOf("//") > -1) && this.checkDomain(location.href) !== this.checkDomain(url);
    },
    copyToClipboard: function(text) {
      if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";
        document.body.appendChild(textarea);
        textarea.select();
        try {
          return document.execCommand("copy");
        } catch (ex) {
          console.warn("Copy to clipboard failed.", ex);
          return false;
        } finally {
          document.body.removeChild(textarea);
        }
      }
    },
    flashElement: function(elem) {
      import_leaflet19.DomUtil.addClass(elem, "leaflet-control-flash");
      setTimeout(function() {
        import_leaflet19.DomUtil.removeClass(elem, "leaflet-control-flash");
      }, 400);
    },
    readFITSKey: function(keyword, str) {
      var key = keyword.trim().toUpperCase().substr(0, 8), nspace = 8 - key.length, keyreg = new RegExp(key + (nspace > 0 ? "\\ {" + nspace.toString() + "}" : "") + "=\\ *(?:'((?:\\ *[^'\\ ]+)*)\\ *'|([-+]?[0-9]*\\.?[0-9]+(?:[eE][-+]?[0-9]+)?))"), match = keyreg.exec(str);
      if (!match) {
        return null;
      } else if (match[1]) {
        return match[1];
      } else {
        return match[2];
      }
    },
    distance: function(latlng1, latlng2) {
      var d2r = Math.PI / 180, lat1 = latlng1.lat * d2r, lat2 = latlng2.lat * d2r, dLat = lat2 - lat1, dLon = (latlng2.lng - latlng1.lng) * d2r, sin1 = Math.sin(dLat / 2), sin2 = Math.sin(dLon / 2);
      var a = sin1 * sin1 + sin2 * sin2 * Math.cos(lat1) * Math.cos(lat2);
      return Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 360 / Math.PI;
    },
    latLngToHMSDMS: function(latlng) {
      var lng = (latlng.lng + 360) / 360;
      lng = (lng - Math.floor(lng)) * 24;
      var h = Math.floor(lng), mf = (lng - h) * 60, m = Math.floor(mf), sf = (mf - m) * 60;
      if (sf >= 60) {
        m++;
        sf = 0;
      }
      if (m === 60) {
        h++;
        m = 0;
      }
      var str = (h < 10 ? "0" : "") + h.toString() + ":" + (m < 10 ? "0" : "") + m.toString() + ":" + (sf < 10 ? "0" : "") + sf.toFixed(3), lat = Math.abs(latlng.lat), sgn = latlng.lat < 0 ? "-" : "+", d = Math.floor(lat);
      mf = (lat - d) * 60;
      m = Math.floor(mf);
      sf = (mf - m) * 60;
      if (sf >= 60) {
        m++;
        sf = 0;
      }
      if (m === 60) {
        h++;
        m = 0;
      }
      return str + " " + sgn + (d < 10 ? "0" : "") + d.toString() + ":" + (m < 10 ? "0" : "") + m.toString() + ":" + (sf < 10 ? "0" : "") + sf.toFixed(2);
    },
    hmsDMSToLatLng: function(str) {
      var result;
      result = /^\s*(\d+)[h:](\d+)[m':](\d+\.?\d*)[s"]?\s*,?\s*([-+]?)(\d+)[d°:](\d+)[m':](\d+\.?\d*)[s"]?/g.exec(str);
      if (result && result.length >= 8) {
        var sgn = Number(result[4] + "1");
        return (0, import_leaflet19.latLng)(
          sgn * (Number(result[5]) + Number(result[6]) / 60 + Number(result[7]) / 3600),
          Number(result[1]) * 15 + Number(result[2]) / 4 + Number(result[3]) / 240
        );
      } else {
        return void 0;
      }
    },
    getCookie: function(cname) {
      var name = cname + "=";
      var ca = document.cookie.split(";");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) === " ") {
          c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    }
  };

  // js/control/UI.js
  var import_jquery = __toESM(require_jquery());
  var import_leaflet22 = __toESM(require_leaflet_src());

  // js/control/widget/FlipSwitch.js
  var import_leaflet20 = __toESM(require_leaflet_src());
  var FlipSwitch = import_leaflet20.Evented.extend({
    options: {
      checked: false,
      title: "Click to switch",
      className: "leaflet-flipswitch",
      id: "leaflet-flipswitch"
    },
    initialize: function(parent, options) {
      options = import_leaflet20.Util.setOptions(this, options);
      var _this = this, className = options.className, button = import_leaflet20.DomUtil.create("div", className, parent), input = this._input = L.DomUtil.create("input", className, button), label = import_leaflet20.DomUtil.create("label", className, button);
      input.type = "checkbox";
      input.name = options.className;
      input.checked = options.checked;
      label.htmlFor = input.id = options.id;
      if (options.title) {
        label.title = options.title;
      }
      import_leaflet20.DomUtil.create("span", className + "-inner", label);
      import_leaflet20.DomUtil.create("span", className + "-button", label);
      import_leaflet20.DomEvent.disableClickPropagation(button).disableScrollPropagation(button);
      import_leaflet20.DomEvent.on(input, "change", function() {
        this.fire("change");
      }, this);
      return button;
    },
    value: function(val) {
      if (val === void 0) {
        return this._input.checked;
      } else {
        this._input.checked = val ? true : false;
        return this;
      }
    }
  });

  // js/control/widget/Spinbox.js
  var import_leaflet21 = __toESM(require_leaflet_src());
  var Spinbox = import_leaflet21.Evented.extend({
    options: {
      dmin: void 0,
      dmax: void 0,
      step: void 0,
      initValue: void 0,
      repButton: true,
      clickEvent: "click",
      instantUpdate: false,
      title: "Enter value",
      className: "leaflet-spinbox"
    },
    initialize: function(parent, options) {
      options = import_leaflet21.Util.setOptions(this, options);
      var _this = this, drag = this._drag = {
        startEvent: "touchstart mousedown",
        stopEvent: "touchend mouseup mouseout touchcancel",
        move: false,
        start: false,
        end: false,
        pos: false,
        target: false,
        delta: false,
        tmp: false,
        cnt: 0,
        step: options.step,
        prec: this._prec(options.step)
      }, wrap = this._wrap = import_leaflet21.DomUtil.create("div", options.className, parent), input = this._input = import_leaflet21.DomUtil.create("input", options.className + "-input", wrap), down = this._down = import_leaflet21.DomUtil.create("div", options.className + "-down", wrap), up = this._up = import_leaflet21.DomUtil.create("div", options.className + "-up", wrap);
      input.type = "number";
      input.step = 0.1;
      import_leaflet21.DomEvent.disableClickPropagation(wrap).disableScrollPropagation(wrap);
      if (input.disabled === true) {
        options.disabled = true;
      }
      if (options.dmin === void 0) {
        options.dmin = -Number.MAX_VALUE;
      }
      if (options.dmax === void 0) {
        options.dmax = Number.MAX_VALUE;
      }
      if (options.step === void 0) {
        options.step = 1;
      }
      if (options.initValue === void 0) {
        options.initValue = (options.dmin + options.dmax) / 2;
      }
      this.value(options.initValue);
      input.title = options.title;
      down.title = "Decrease number by " + options.step;
      up.title = "Increase number by " + options.step;
      import_leaflet21.DomEvent.on(this._input, "change", function() {
        this.fire("change");
      }, this);
      if (options.repButton === false) {
        import_leaflet21.DomEvent.on(down, options.clickEvent, function(e) {
          e.preventDefault();
          this._offset(e.currentTarget, -1);
        }, this);
        import_leaflet21.DomEvent.on(up, options.clickEvent, function(e) {
          e.preventDefault();
          this._offset(e.currentTarget, 1);
        }, this);
      } else {
        import_leaflet21.DomEvent.on(down, drag.startEvent, function(e) {
          input.blur();
          drag.move = true;
          drag.cnt = 0;
          drag.step = options.step;
          drag.prec = this._prec(drag.step);
          drag.delta = -1;
          this._offset(e.currentTarget, -1);
          if (!this.runButton) {
            drag.target = e.currentTarget;
            this.runButton = setTimeout(function() {
              _this._sboxRun();
            }, 500);
          }
        }, this);
        import_leaflet21.DomEvent.on(up, drag.startEvent, function(e) {
          input.blur();
          drag.move = true;
          drag.cnt = 0;
          drag.step = options.step;
          drag.prec = this._prec(drag.step);
          drag.delta = 1;
          this._offset(e.currentTarget, 1);
          if (!this.runButton) {
            drag.target = e.currentTarget;
            this.runButton = setTimeout(function() {
              _this._sboxRun();
            }, 500);
          }
        }, this);
        import_leaflet21.DomEvent.on(down, drag.stopEvent, function(e) {
          if (drag.move) {
            e.preventDefault();
            clearTimeout(this.runButton);
            this.runButton = false;
            drag.move = false;
            if (options.instantUpdate === false) {
              this.fire("change");
            }
          }
        }, this);
        import_leaflet21.DomEvent.on(up, drag.stopEvent, function(e) {
          if (drag.move) {
            e.preventDefault();
            clearTimeout(this.runButton);
            this.runButton = false;
            drag.move = false;
            if (options.instantUpdate === false) {
              this.fire("change");
            }
          }
        }, this);
      }
      if (options.disabled) {
        this.disable();
      }
      return wrap;
    },
    value: function(val) {
      if (val === void 0) {
        return parseFloat(this._input.value);
      } else {
        this._input.value = val;
        return this;
      }
    },
    step: function(val) {
      if (val === void 0) {
        return this.options.step;
      } else {
        this.options.step = val;
        return this;
      }
    },
    disable: function() {
      var cname = "disabled";
      this._input.disabled = true;
      this._input.blur();
      import_leaflet21.DomUtil.addClass(this._wrap, cname);
      import_leaflet21.DomUtil.addClass(this._down, cname);
      import_leaflet21.DomUtil.addClass(this._up, cname);
      this.options.disabled = true;
    },
    enable: function() {
      var cname = "disabled";
      this._input.disabled = false;
      import_leaflet21.DomUtil.removeClass(this._wrap, cname);
      import_leaflet21.DomUtil.removeClass(this._down, cname);
      import_leaflet21.DomUtil.removeClass(this._up, cname);
      this.options.disabled = false;
    },
    _sboxRun: function() {
      var _this = this, timer = 150, options = this.options, drag = this._drag;
      if (drag.cnt === 20) {
        timer = 50;
        drag.step = 10 * options.step;
        drag.prec = this._prec(drag.step);
      } else if (drag.cnt === 40) {
        timer = 10;
        drag.step = 100 * options.step;
        drag.prec = this._prec(drag.step);
      } else if (drag.cnt === 60) {
        drag.step = 1e3 * options.step;
        drag.prec = this._prec(drag.step);
      } else if (drag.cnt === 80) {
        drag.step = 1e4 * options.step;
        drag.prec = this._prec(drag.step);
      }
      drag.didRun = true;
      this._offset(this, drag.delta);
      drag.cnt++;
      this.runButton = setTimeout(function() {
        _this._sboxRun();
      }, timer);
    },
    _prec: function(step) {
      var dprec = -0.4342944 * Math.log(step);
      return dprec > 0 ? Math.ceil(dprec) : 0;
    },
    _offset: function(obj, direction) {
      var tmp, options = this.options, input = this._input, drag = this._drag;
      if (!this.disabled) {
        if (direction < 1) {
          tmp = (parseFloat(input.value) - drag.step).toFixed(drag.prec);
          if (tmp >= options.dmin) {
            input.value = tmp;
            if (options.instantUpdate === true) {
              this.fire("change");
            }
          }
        } else {
          tmp = (parseFloat(input.value) + drag.step).toFixed(drag.prec);
          if (tmp <= options.dmax) {
            input.value = tmp;
            if (options.instantUpdate === true) {
              this.fire("change");
            }
          }
        }
      }
    }
  });

  // js/control/UI.js
  window.$ = window.jQuery = import_jquery.default;
  var UI = import_leaflet22.Control.extend({
    options: {
      title: "a control related to VisiOmatic",
      collapsed: true,
      position: "topleft"
    },
    initialize: function(baseLayers, options) {
      import_leaflet22.Util.setOptions(this, options);
      this._className = "leaflet-control-iip";
      this._id = "leaflet-iipimage";
      this._layers = baseLayers;
    },
    addTo: function(dest) {
      if (dest._sidebar) {
        this._sidebar = dest;
        this._map = dest._map;
        this._dialog = import_leaflet22.DomUtil.create("div", this._className + "-dialog");
        dest.addTab(
          this._id,
          this._className,
          this.options.title,
          this._dialog,
          this._sideClass
        );
        this._map.on("layeradd", this._checkIIP, this);
        return dest;
      } else {
        return import_leaflet22.Control.prototype.addTo.call(this, dest);
      }
    },
    onAdd: function(map) {
      var className = this._className, id = this._id, container = this._container = import_leaflet22.DomUtil.create("div", className + " leaflet-bar");
      container.setAttribute("aria-haspopup", true);
      import_leaflet22.DomEvent.disableClickPropagation(container).disableScrollPropagation(container);
      this._dialog = import_leaflet22.DomUtil.create("div", className + "-dialog", container);
      if (this.options.collapsed) {
        if (!import_leaflet22.Browser.android) {
          import_leaflet22.DomEvent.on(container, "mouseover", this._expand, this).on(container, "mouseout", this._collapse, this);
        }
        var toggle = this._toggle = import_leaflet22.DomUtil.create("a", className + "-toggle leaflet-bar", container);
        toggle.href = "#";
        toggle.id = id + "-toggle";
        toggle.title = this.options.title;
        if (import_leaflet22.Browser.touch) {
          import_leaflet22.DomEvent.on(toggle, "click", import_leaflet22.DomEvent.stop, this).on(toggle, "click", this._expand, this);
        } else {
          import_leaflet22.DomEvent.on(toggle, "focus", this._expand, this);
        }
        this._map.on("click", this._collapse, this);
      } else {
        this._expand();
      }
      this._map.on("layeradd", this._checkIIP, this);
      return this._container;
    },
    _checkIIP: function(e) {
      var layer = e.layer;
      if (!layer || !layer.iipdefault) {
        return;
      }
      this._layer = layer;
      if (this._reloadFlag) {
        layer.once("load", this._resetDialog, this);
      } else {
        this._initDialog();
        this._reloadFlag = true;
      }
    },
    _initDialog: function() {
    },
    _resetDialog: function() {
      this._dialog.innerHTML = "";
      this._initDialog();
    },
    _addDialogBox: function(id) {
      var box = import_leaflet22.DomUtil.create("div", this._className + "-box", this._dialog);
      if (id) {
        box.id = id;
      }
      return box;
    },
    _addDialogLine: function(label, dialogBox) {
      var line = import_leaflet22.DomUtil.create("div", this._className + "-line", dialogBox), text = import_leaflet22.DomUtil.create("div", this._className + "-label", line);
      text.innerHTML = label;
      return line;
    },
    _addDialogElement: function(line) {
      return import_leaflet22.DomUtil.create("div", this._className + "-element", line);
    },
    _expand: function() {
      import_leaflet22.DomUtil.addClass(this._container, this._className + "-expanded");
    },
    _collapse: function() {
      this._container.className = this._container.className.replace(" " + this._className + "-expanded", "");
    },
    getActiveBaseLayer: function() {
      return this._activeBaseLayer;
    },
    _findActiveBaseLayer: function() {
      var layers = this._layers;
      this._prelayer = void 0;
      for (var layername in layers) {
        var layer = layers[layername];
        if (!layer.overlay) {
          if (!layer._map) {
            this._prelayer = layer;
          } else if (this._map.hasLayer(layer) && layer.iipdefault) {
            return layer;
          }
        }
      }
      return void 0;
    },
    _createButton: function(className, parent, subClassName, fn, title) {
      var button = import_leaflet22.DomUtil.create("a", className, parent);
      button.target = "_blank";
      if (subClassName) {
        button.id = className + "-" + subClassName;
      }
      if (fn) {
        import_leaflet22.DomEvent.on(button, "click touch", fn, this);
      }
      if (title) {
        button.title = title;
      }
      return button;
    },
    _createRadioButton: function(className, parent, value, checked, fn, title) {
      var button = import_leaflet22.DomUtil.create("input", className, parent);
      button.type = "radio";
      button.name = className;
      button.value = value;
      button.checked = checked;
      if (fn) {
        import_leaflet22.DomEvent.on(button, "click touch", function() {
          fn(value);
        }, this);
      }
      var label = import_leaflet22.DomUtil.create("label", className, parent);
      label.htmlFor = button.id = className + "-" + value;
      if (title) {
        label.title = title;
      }
      return button;
    },
    _createSelectMenu: function(className, parent, items, disabled, selected, fn, title) {
      var div = import_leaflet22.DomUtil.create("div", className, parent), select = import_leaflet22.DomUtil.create("select", className, div), choose = document.createElement("option"), opt = select.opt = [], index;
      choose.text = "choose";
      choose.disabled = true;
      if (!selected || selected < 0) {
        choose.selected = true;
      }
      select.add(choose, null);
      for (var i in items) {
        index = parseInt(i, 10);
        opt[index] = document.createElement("option");
        opt[index].text = items[index];
        opt[index].value = index;
        if (disabled && disabled[index]) {
          opt[index].disabled = true;
        } else if (index === selected) {
          opt[index].selected = true;
        }
        select.add(opt[index], null);
      }
      if (this._container && !import_leaflet22.Browser.android && this.options.collapsed) {
        import_leaflet22.DomEvent.on(select, "mousedown", function() {
          import_leaflet22.DomEvent.off(this._container, "mouseout", this._collapse, this);
          this.collapsedOff = true;
        }, this);
        import_leaflet22.DomEvent.on(this._container, "mouseover", function() {
          if (this.collapsedOff) {
            import_leaflet22.DomEvent.on(this._container, "mouseout", this._collapse, this);
            this.collapsedOff = false;
          }
        }, this);
      }
      if (fn) {
        import_leaflet22.DomEvent.on(select, "change keyup", fn, this);
      }
      if (title) {
        div.title = title;
      }
      return select;
    },
    _createColorPicker: function(className, parent, subClassName, defaultColor, fn, storageKey, title) {
      var _this = this, colpick = import_leaflet22.DomUtil.create("input", className, parent);
      colpick.type = "color";
      colpick.value = defaultColor;
      colpick.id = className + "-" + subClassName;
      $(document).ready(function() {
        $(colpick).spectrum({
          showInput: true,
          appendTo: "#" + _this._id,
          showPaletteOnly: true,
          togglePaletteOnly: true,
          localStorageKey: storageKey,
          change: function(color) {
            colpick.value = color.toHexString();
          }
        }).on("show.spectrum", function() {
          if (_this._container) {
            import_leaflet22.DomEvent.off(_this._container, "mouseout", _this._collapse);
          }
        });
        if (fn) {
          $(colpick).on("change", fn);
        }
        if (title) {
          $("#" + colpick.id + "+.sp-replacer").prop("title", title);
        }
      });
      return colpick;
    },
    _addSwitchInput: function(layer, box, label, attr, title, id, checked) {
      var line = this._addDialogLine(label, box), elem = this._addDialogElement(line), flip = elem.flip = new FlipSwitch(elem, {
        checked,
        id,
        title
      });
      flip.on("change", function() {
        this._onInputChange(layer, attr, flip.value());
      }, this);
      return elem;
    },
    _addNumericalInput: function(layer, box, label, attr, title, id, initValue, step, min, max, func) {
      var line = this._addDialogLine(label, box), elem = this._addDialogElement(line), spinbox = elem.spinbox = new Spinbox(elem, {
        step,
        dmin: min,
        dmax: max,
        initValue,
        title
      });
      spinbox.on("change", function() {
        VUtil.flashElement(spinbox._input);
        this._onInputChange(layer, attr, spinbox.value(), func);
      }, this);
      return elem;
    },
    _updateInput: function(elem, value) {
      if (elem.spinbox) {
        elem.spinbox.value(value);
      } else if (elem.flip) {
        elem.flip.value(value);
      }
    },
    _spinboxStep: function(min, max) {
      var step = parseFloat((Math.abs(max === min ? max : max - min) * 0.01).toPrecision(1));
      return step === 0 ? 1 : step;
    },
    _onInputChange: function(layer, pname, value, func) {
      var pnamearr = pname.split(/\[|\]/);
      if (pnamearr[1]) {
        layer[pnamearr[0]][parseInt(pnamearr[1], 10)] = value;
      } else {
        layer[pnamearr[0]] = value;
      }
      if (func) {
        func(layer);
      }
      layer.redraw();
    },
    _updateLayerList: function() {
      if (!this._dialog) {
        return this;
      }
      if (this._layerList) {
        import_leaflet22.DomUtil.empty(this._layerList);
      } else {
        this._layerList = import_leaflet22.DomUtil.create(
          "div",
          "leaflet-control-iip-layerlist",
          this._dialog
        );
      }
      for (var i in this._layers) {
        this._addLayerItem(this._layers[i]);
      }
      return this;
    },
    _addLayerItem: function(obj) {
      var _this = this, layerItem = import_leaflet22.DomUtil.create("div", "leaflet-control-iip-layer"), inputdiv = import_leaflet22.DomUtil.create("div", "leaflet-control-iip-layerswitch", layerItem);
      if (obj.layer.notReady) {
        import_leaflet22.DomUtil.create("div", "leaflet-control-iip-activity", inputdiv);
      } else {
        var input, checked = this._map.hasLayer(obj.layer);
        input = document.createElement("input");
        input.type = "checkbox";
        input.className = "leaflet-control-iip-selector";
        input.defaultChecked = checked;
        input.layerId = stamp(obj.layer);
        import_leaflet22.DomEvent.on(input, "click", function() {
          var i, input2, obj2, inputs = this._layerList.getElementsByTagName("input"), inputsLen = inputs.length;
          this._handlingClick = true;
          for (i = 0; i < inputsLen; i++) {
            input2 = inputs[i];
            if (!("layerId" in input2)) {
              continue;
            }
            obj2 = this._layers[input2.layerId];
            if (input2.checked && !this._map.hasLayer(obj2.layer)) {
              obj2.layer.addTo(this._map);
            } else if (!input2.checked && this._map.hasLayer(obj2.layer)) {
              this._map.removeLayer(obj2.layer);
            }
          }
          this._handlingClick = false;
        }, this);
        inputdiv.appendChild(input);
      }
      var name = import_leaflet22.DomUtil.create("div", "leaflet-control-iip-layername", layerItem);
      name.innerHTML = " " + obj.name;
      name.style.textShadow = "0px 0px 5px " + obj.layer.nameColor;
      this._createButton(
        "leaflet-control-iip-trash",
        layerItem,
        void 0,
        function() {
          _this.removeLayer(obj.layer);
          if (!obj.notReady) {
            _this._map.removeLayer(obj.layer);
          }
        },
        "Delete layer"
      );
      this._layerList.appendChild(layerItem);
      return layerItem;
    },
    addLayer: function(layer, name, index) {
      layer.on("add remove", this._onLayerChange, this);
      var id = stamp(layer);
      this._layers[id] = {
        layer,
        name,
        index
      };
      return this._updateLayerList();
    },
    removeLayer: function(layer) {
      layer.off("add remove", this._onLayerChange, this);
      layer.fire("trash", { index: this._layers[stamp(layer)].index });
      layer.off("trash");
      delete this._layers[stamp(layer)];
      return this._updateLayerList();
    },
    _onLayerChange: function(e) {
      if (!this._handlingClick) {
        this._updateLayerList();
      }
      var obj = this._layers[stamp(e.target)], type = e.type === "add" ? "overlayadd" : "overlayremove";
      this._map.fire(type, obj);
    }
  });

  // js/control/CatalogUI.js
  var CatalogUI = UI.extend({
    defaultCatalogs: [
      Gaia_DR2,
      TwoMASS,
      SDSS,
      PPMXL,
      Abell
    ],
    options: {
      title: "Catalog overlays",
      collapsed: true,
      position: "topleft",
      nativeCelsys: true,
      color: "#FFFF00",
      timeOut: 30,
      authenticate: false
    },
    initialize: function(catalogs, options) {
      import_leaflet23.Util.setOptions(this, options);
      this._className = "leaflet-control-iip";
      this._id = "leaflet-iipcatalog";
      this._layers = {};
      this._handlingClick = false;
      this._sideClass = "catalog";
      this._catalogs = catalogs ? catalogs : this.defaultCatalogs;
    },
    _initDialog: function() {
      var className = this._className, catalogs = this._catalogs, box = this._addDialogBox(), line = this._addDialogLine("", box), elem = this._addDialogElement(line), colpick = this._createColorPicker(
        className + "-color",
        elem,
        "catalog",
        this.options.color,
        false,
        "iipCatalog",
        "Click to set catalog color"
      );
      var catselect = this._createSelectMenu(
        this._className + "-select",
        elem,
        catalogs.map(function(catalog) {
          return catalog.name;
        }),
        void 0,
        -1,
        function() {
          var className2 = catalogs[catselect.selectedIndex - 1].className;
          if (className2 === void 0) {
            className2 = "";
          }
          import_leaflet23.DomUtil.setClass(catselect, this._className + "-select " + className2);
          return;
        },
        "Select Catalog"
      );
      import_leaflet23.DomEvent.on(catselect, "change keyup", function() {
        var catalog = catalogs[catselect.selectedIndex - 1];
        catselect.title = catalog.attribution + " from " + catalog.service;
      }, this);
      elem = this._addDialogElement(line);
      this._createButton(className + "-button", elem, "catalog", function() {
        var index = catselect.selectedIndex - 1;
        if (index >= 0) {
          var catalog = catalogs[index];
          catalog.color = colpick.value;
          catselect.selectedIndex = 0;
          catselect.title = "Select Catalog";
          import_leaflet23.DomUtil.setClass(catselect, this._className + "-select ");
          this._getCatalog(catalog, this.options.timeOut);
        }
      }, "Query catalog");
    },
    _resetDialog: function() {
    },
    _getCatalog: function(catalog, timeout) {
      var _this = this, map = this._map, wcs2 = map.options.crs, sysflag = wcs2.forceNativeCelsys && !this.options.nativeCelsys, center = sysflag ? wcs2.celsysToEq(map.getCenter()) : map.getCenter(), b = map.getPixelBounds(), z = map.getZoom(), templayer = new import_leaflet23.LayerGroup(null);
      templayer.notReady = true;
      this.addLayer(templayer, catalog.name);
      if (catalog.authenticate) {
        this.options.authenticate = catalog.authenticate;
      } else {
        this.options.authenticate = false;
      }
      var lngfac = Math.abs(Math.cos(center.lat * Math.PI / 180)), c = sysflag ? [
        wcs2.celsysToEq(map.unproject(b.min, z)),
        wcs2.celsysToEq(map.unproject((0, import_leaflet23.point)(b.min.x, b.max.y), z)),
        wcs2.celsysToEq(map.unproject(b.max, z)),
        wcs2.celsysToEq(map.unproject((0, import_leaflet23.point)(b.max.x, b.min.y), z))
      ] : [
        map.unproject(b.min, z),
        map.unproject((0, import_leaflet23.point)(b.min.x, b.max.y), z),
        map.unproject(b.max, z),
        map.unproject((0, import_leaflet23.point)(b.max.x, b.min.y), z)
      ], sys;
      if (wcs2.forceNativeCelsys && this.options.nativeCelsys) {
        switch (wcs2.celsyscode) {
          case "ecliptic":
            sys = "E2000.0";
            break;
          case "galactic":
            sys = "G";
            break;
          case "supergalactic":
            sys = "S";
            break;
          default:
            sys = "J2000.0";
            break;
        }
      } else {
        sys = "J2000.0";
      }
      if (catalog.regionType === "box") {
        var dlng = (Math.max(
          wcs2._deltaLng(c[0], center),
          wcs2._deltaLng(c[1], center),
          wcs2._deltaLng(c[2], center),
          wcs2._deltaLng(c[3], center)
        ) - Math.min(
          wcs2._deltaLng(c[0], center),
          wcs2._deltaLng(c[1], center),
          wcs2._deltaLng(c[2], center),
          wcs2._deltaLng(c[3], center)
        )) * lngfac, dlat = Math.max(c[0].lat, c[1].lat, c[2].lat, c[3].lat) - Math.min(c[0].lat, c[1].lat, c[2].lat, c[3].lat);
        if (dlat < 1e-4) {
          dlat = 1e-4;
        }
        if (dlng < 1e-4) {
          dlng = 1e-4;
        }
        VUtil.requestURL(
          import_leaflet23.Util.template(catalog.url, import_leaflet23.Util.extend({
            sys,
            lng: center.lng.toFixed(6),
            lat: center.lat.toFixed(6),
            dlng: dlng.toFixed(4),
            dlat: dlat.toFixed(4),
            nmax: catalog.nmax + 1,
            maglim: catalog.maglim
          })),
          "getting " + catalog.service + " data",
          function(context, httpRequest) {
            _this._loadCatalog(catalog, templayer, context, httpRequest);
          },
          this,
          timeout
        );
      } else {
        var dr = Math.max(
          wcs2.distance(c[0], center),
          wcs2.distance(c[0], center),
          wcs2.distance(c[0], center),
          wcs2.distance(c[0], center)
        );
        VUtil.requestURL(
          import_leaflet23.Util.template(catalog.url, import_leaflet23.Util.extend({
            sys,
            lng: center.lng.toFixed(6),
            lat: center.lat.toFixed(6),
            dr: dr.toFixed(4),
            drm: (dr * 60).toFixed(4),
            nmax: catalog.nmax + 1
          })),
          "querying " + catalog.service + " data",
          function(context, httpRequest) {
            _this._loadCatalog(catalog, templayer, context, httpRequest);
          },
          this,
          this.options.timeOut
        );
      }
    },
    _loadCatalog: function(catalog, templayer, _this, httpRequest) {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          var wcs2 = _this._map.options.crs, response = httpRequest.responseText, geo = catalog.toGeoJSON(response), geocatalog = (0, import_leaflet23.geoJson)(geo, {
            onEachFeature: function(feature, layer) {
              if (feature.properties && feature.properties.items) {
                layer.bindPopup(catalog.popup(feature));
              }
            },
            coordsToLatLng: function(coords2) {
              if (wcs2.forceNativeCelsys) {
                var latLng10 = wcs2.eqToCelsys(L.latLng(coords2[1], coords2[0]));
                return new L.LatLng(latLng10.lat, latLng10.lng, coords2[2]);
              } else {
                return new L.LatLng(coords2[1], coords2[0], coords2[2]);
              }
            },
            filter: function(feature) {
              return catalog.filter(feature);
            },
            pointToLayer: function(feature, latlng) {
              return catalog.draw(feature, latlng);
            },
            style: function(feature) {
              return { color: catalog.color, weight: 2 };
            }
          }), excessflag;
          geocatalog.nameColor = catalog.color;
          geocatalog.addTo(_this._map);
          this.removeLayer(templayer);
          if (geo.features.length > catalog.nmax) {
            geo.features.pop();
            excessflag = true;
          }
          this.addLayer(geocatalog, catalog.name + " (" + geo.features.length.toString() + (excessflag ? "+ entries)" : " entries)"));
          if (excessflag) {
            alert("Selected area is too large: " + catalog.name + " sample has been truncated to the brightest " + catalog.nmax + " sources.");
          }
        } else {
          if (httpRequest.status !== 0) {
            alert("Error " + httpRequest.status + " while querying " + catalog.service + ".");
          }
          this.removeLayer(templayer);
        }
      }
    }
  });
  var catalogUI = function(catalogs, options) {
    return new CatalogUI(catalogs, options);
  };

  // js/control/ChannelUI.js
  var import_jquery2 = __toESM(require_jquery());
  var import_leaflet24 = __toESM(require_leaflet_src());
  window.$ = window.jQuery = import_jquery2.default;
  var ChannelUI = UI.extend({
    options: {
      title: "Channel mixing",
      collapsed: true,
      cMap: "grey",
      mixingMode: null,
      position: "topleft"
    },
    initialize: function(mode, options) {
      import_leaflet24.Util.setOptions(this, options);
      this._className = "leaflet-control-iip";
      this._id = "leaflet-iipchannel";
      this._sideClass = "channel";
      this._settings = [];
      this._initsettings = [];
    },
    saveSettings: function(layer, settings, mode) {
      if (!settings[mode]) {
        settings[mode] = {};
      }
      var setting = settings[mode], nchan = layer.iipNChannel;
      setting.channel = layer.iipChannel;
      setting.cMap = layer.iipCMap;
      setting.rgb = [];
      for (var c = 0; c < nchan; c++) {
        setting.rgb[c] = layer.iipRGB[c].clone();
      }
    },
    loadSettings: function(layer, settings, mode, keepchanflag) {
      var setting = settings[mode], nchan = layer.iipNChannel;
      if (!setting) {
        return;
      }
      if (!keepchanflag) {
        layer.iipChannel = setting.channel;
      }
      layer.iipCMap = setting.cMap;
      for (var c = 0; c < nchan; c++) {
        layer.iipRGB[c] = setting.rgb[c].clone();
      }
    },
    _initDialog: function() {
      var _this = this, layer = this._layer, className = this._className, dialog = this._dialog;
      this.saveSettings(layer, this._initsettings, "mono");
      this.saveSettings(layer, this._initsettings, "color");
      this.saveSettings(layer, this._settings, "mono");
      this.saveSettings(layer, this._settings, "color");
      this._mode = this.options.mixingMode ? this.options.mixingMode : layer.iipMode;
      var box = this._addDialogBox(), modeline = this._addDialogLine("Mode:", box), modelem = this._addDialogElement(modeline), modeinput = import_leaflet24.DomUtil.create("div", className + "-radios", modelem), elem, modebutton;
      modebutton = this._createRadioButton(
        className + "-radio",
        modeinput,
        "mono",
        this._mode === "mono",
        function() {
          _this.saveSettings(layer, _this._settings, _this._mode);
          for (elem = box.lastChild; elem !== modeline; elem = box.lastChild) {
            box.removeChild(elem);
          }
          for (elem = dialog.lastChild; elem !== box; elem = dialog.lastChild) {
            dialog.removeChild(elem);
          }
          _this._channelList = void 0;
          _this.loadSettings(layer, _this._settings, "mono");
          _this._initMonoDialog(layer, box);
          _this._mode = "mono";
        },
        "Select mono-channel palettized mode"
      );
      modebutton = this._createRadioButton(
        className + "-radio",
        modeinput,
        "color",
        this._mode !== "mono",
        function() {
          _this.saveSettings(layer, _this._settings, _this._mode);
          for (elem = box.lastChild; elem !== modeline; elem = box.lastChild) {
            box.removeChild(elem);
          }
          for (elem = dialog.lastChild; elem !== box; elem = dialog.lastChild) {
            dialog.removeChild(elem);
          }
          _this.loadSettings(layer, _this._settings, "color");
          _this._channelList = void 0;
          _this._initColorDialog(layer, box);
          _this._mode = "color";
        },
        "Select color mixing mode"
      );
      if (_this._mode === "mono") {
        _this._initMonoDialog(layer, box);
      } else {
        _this._initColorDialog(layer, box);
      }
    },
    _initMonoDialog: function(layer, box) {
      var _this = this, channels = layer.iipChannelLabels, className = this._className, line = this._addDialogLine("Channel:", box), elem = this._addDialogElement(line);
      layer.updateMono();
      this._chanSelect = this._createSelectMenu(
        this._className + "-select",
        elem,
        layer.iipChannelLabels,
        void 0,
        layer.iipChannel,
        function() {
          layer.iipChannel = parseInt(this._chanSelect.selectedIndex - 1, 10);
          this._updateChannel(layer, layer.iipChannel);
          layer.redraw();
        },
        "Select image channel"
      );
      line = this._addDialogLine("LUT:", box);
      elem = this._addDialogElement(line);
      var cmapinput = import_leaflet24.DomUtil.create("div", className + "-cmaps", elem), cbutton = [], cmaps = ["grey", "jet", "cold", "hot"], _changeMap = function(value) {
        _this._onInputChange(layer, "iipCMap", value);
      }, i;
      for (i in cmaps) {
        cbutton[i] = this._createRadioButton(
          "leaflet-cmap",
          cmapinput,
          cmaps[i],
          cmaps[i] === this.options.cMap,
          _changeMap,
          '"' + cmaps[i].charAt(0).toUpperCase() + cmaps[i].substr(1) + '" color-map'
        );
      }
      this._addMinMax(layer, layer.iipChannel, box);
      layer.redraw();
    },
    _initColorDialog: function(layer, box) {
      var _this = this, className = this._className, line = this._addDialogLine("Channel:", box), elem = this._addDialogElement(line), colpick = this._chanColPick = this._createColorPicker(
        className + "-color",
        elem,
        "channel",
        layer.iipRGB[layer.iipChannel].toStr(),
        function() {
          var chan = layer.iipChannel, hex = $(colpick).val();
          _this._updateMix(layer, chan, rgb(hex));
          _this.collapsedOff = true;
        },
        "iipChannel",
        "Click to set channel color"
      );
      this._onInputChange(layer, "iipCMap", "grey");
      layer.updateMix();
      this._chanSelect = this._createSelectMenu(
        this._className + "-select",
        elem,
        layer.iipChannelLabels,
        void 0,
        layer.iipChannel,
        function() {
          layer.iipChannel = this._chanSelect.selectedIndex - 1;
          this._updateChannel(layer, layer.iipChannel, colpick);
        },
        "Select image channel"
      );
      this._addMinMax(layer, layer.iipChannel, box);
      line = this._addDialogLine("Colors:", box);
      elem = this._addDialogElement(line);
      this._createButton(className + "-button", elem, "colormix-reset", function() {
        _this.loadSettings(layer, _this._initsettings, "color", true);
        layer.updateMix();
        this._updateColPick(layer);
        this._updateChannelList(layer);
        layer.redraw();
      }, "Reset color mix");
      this._createButton(className + "-button", elem, "colormix-auto", function() {
        var nchan = layer.iipNChannel, cc = 0, nchanon = 0, rgb3 = layer.iipRGB, defcol = layer.iipdefault.channelColors;
        for (var c = 0; c < nchan; c++) {
          if (rgb3[c].isOn()) {
            nchanon++;
          }
        }
        if (nchanon >= defcol.length) {
          nchanon = defcol.length - 1;
        }
        for (c = 0; c < nchan; c++) {
          if (rgb3[c].isOn() && cc < nchanon) {
            rgb3[c] = rgb3(defcol[nchanon][cc++]);
          }
        }
        layer.updateMix();
        this._updateColPick(layer);
        this._updateChannelList(layer);
        layer.redraw();
      }, "Re-color active channels");
      _this._updateChannelList(layer);
      layer.redraw();
    },
    _addMinMax: function(layer, chan, box) {
      var step = this._spinboxStep(layer.iipMinValue[chan], layer.iipMaxValue[chan]);
      this._minElem = this._addNumericalInput(
        layer,
        box,
        "Min:",
        "iipMinValue[" + chan + "]",
        "Lower clipping limit in " + layer.iipChannelUnits[chan] + ".",
        "leaflet-channel-minvalue",
        layer.iipMinValue[chan],
        step
      );
      this._maxElem = this._addNumericalInput(
        layer,
        box,
        "Max:",
        "iipMaxValue[" + chan + "]",
        "Upper clipping limit in " + layer.iipChannelUnits[chan] + ".",
        "leaflet-channel-maxvalue",
        layer.iipMaxValue[chan],
        step
      );
    },
    _updateChannel: function(layer, chan, colorElem) {
      var _this = this, step = this._spinboxStep(layer.iipMinValue[chan], layer.iipMaxValue[chan]);
      _this._chanSelect.selectedIndex = chan + 1;
      if (colorElem) {
        $(colorElem).spectrum("set", layer.iipRGB[chan].toStr());
        $(colorElem).val(layer.iipRGB[chan].toStr()).off("change").on("change", function() {
          _this._updateMix(layer, chan, rgb($(colorElem).val()));
        });
      }
      this._minElem.spinbox.value(layer.iipMinValue[chan]).step(step).off("change").on("change", function() {
        _this._onInputChange(
          layer,
          "iipMinValue[" + chan + "]",
          _this._minElem.spinbox.value()
        );
      }, this);
      this._maxElem.spinbox.value(layer.iipMaxValue[chan]).step(step).off("change").on("change", function() {
        _this._onInputChange(
          layer,
          "iipMaxValue[" + chan + "]",
          _this._maxElem.spinbox.value()
        );
      }, this);
    },
    _updateMix: function(layer, chan, rgb3) {
      layer.rgbToMix(chan, rgb3);
      this._updateChannelList(layer);
      layer.redraw();
    },
    _updateChannelList: function(layer) {
      var chanLabels = layer.iipChannelLabels, chanList = this._channelList, chanElems = this._channelElems, trashElems = this._trashElems, chanElem, trashElem, rgb3, color, label, c, chan;
      if (chanList) {
        import_leaflet24.DomUtil.empty(this._channelList);
      } else {
        chanList = this._channelList = import_leaflet24.DomUtil.create(
          "div",
          this._className + "-chanlist",
          this._dialog
        );
      }
      chanElems = this._channelElems = [];
      trashElems = this._trashElems = [];
      for (c in chanLabels) {
        chan = parseInt(c, 10);
        rgb3 = layer.iipRGB[chan];
        if (rgb3.isOn()) {
          chanElem = import_leaflet24.DomUtil.create("div", this._className + "-channel", chanList);
          color = import_leaflet24.DomUtil.create("div", this._className + "-chancolor", chanElem);
          color.style.backgroundColor = rgb3.toStr();
          this._activateChanElem(color, layer, chan);
          label = import_leaflet24.DomUtil.create("div", this._className + "-chanlabel", chanElem);
          label.innerHTML = chanLabels[c];
          this._activateChanElem(label, layer, chan);
          trashElem = this._createButton(
            "leaflet-control-iip-trash",
            chanElem,
            void 0,
            void 0,
            "Delete channel"
          );
          this._activateTrashElem(trashElem, layer, chan);
          chanElems.push(chanElem);
          trashElems.push(trashElem);
        }
      }
    },
    _updateColPick: function(layer) {
      $(this._chanColPick).spectrum("set", layer.iipRGB[layer.iipChannel].toStr());
      $(this._chanColPick).val(layer.iipRGB[layer.iipChannel].toStr());
    },
    _activateTrashElem: function(trashElem, layer, chan) {
      import_leaflet24.DomEvent.on(trashElem, "click touch", function() {
        this._updateMix(layer, chan, rgb(0, 0, 0));
        if (layer === this._layer && chan === layer.iipChannel) {
          this._updateColPick(layer);
        }
      }, this);
    },
    _activateChanElem: function(chanElem, layer, chan) {
      import_leaflet24.DomEvent.on(chanElem, "click touch", function() {
        layer.iipChannel = chan;
        this._updateChannel(layer, chan, this._chanColPick);
      }, this);
    }
  });
  var channelUI = function(options) {
    return new ChannelUI(options);
  };

  // js/control/Coords.js
  var import_leaflet25 = __toESM(require_leaflet_src());
  var Coords = import_leaflet25.Control.extend({
    options: {
      position: "bottomleft",
      title: "Center coordinates. Click to change",
      coordinates: [{
        label: "RA, Dec",
        units: "HMS",
        nativeCelsys: false
      }],
      centerQueryKey: "center",
      fovQueryKey: "fov",
      sesameURL: "https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame"
    },
    onAdd: function(map) {
      var _this = this, className = "leaflet-control-coords", dialog = this._wcsdialog = import_leaflet25.DomUtil.create("div", className + "-dialog"), coordSelect = import_leaflet25.DomUtil.create("select", className + "-select", dialog), choose = document.createElement("option"), coords2 = this.options.coordinates, opt = [], coordIndex;
      import_leaflet25.DomEvent.disableClickPropagation(coordSelect);
      this._currentCoord = 0;
      coordSelect.id = "leaflet-coord-select";
      coordSelect.title = "Switch coordinate system";
      for (var c in coords2) {
        opt[c] = document.createElement("option");
        opt[c].text = coords2[c].label;
        coordIndex = parseInt(c, 10);
        opt[c].value = coordIndex;
        if (coordIndex === 0) {
          opt[c].selected = true;
        }
        coordSelect.add(opt[c], null);
      }
      import_leaflet25.DomEvent.on(coordSelect, "change", function(e) {
        _this._currentCoord = coordSelect.value;
        _this._onDrag();
      });
      var input = this._wcsinput = import_leaflet25.DomUtil.create("input", className + "-input", dialog);
      import_leaflet25.DomEvent.disableClickPropagation(input);
      input.type = "text";
      input.title = this.options.title;
      if ("webkitSpeechRecognition" in window) {
        input.setAttribute("x-webkit-speech", "x-webkit-speech");
      }
      map.on("move zoomend", this._onDrag, this);
      import_leaflet25.DomEvent.on(input, "focus", function() {
        this.setSelectionRange(0, this.value.length);
      }, input);
      import_leaflet25.DomEvent.on(input, "change", function() {
        this.panTo(this._wcsinput.value);
      }, this);
      var clipboardbutton = import_leaflet25.DomUtil.create("div", className + "-clipboard", dialog);
      clipboardbutton.title = "Copy to clipboard";
      import_leaflet25.DomEvent.on(clipboardbutton, "click", function() {
        var stateObj = {}, url = location.href, wcs2 = this._map.options.crs, latlng = map.getCenter();
        VUtil.flashElement(this._wcsinput);
        url = VUtil.updateURL(
          url,
          this.options.centerQueryKey,
          VUtil.latLngToHMSDMS(latlng)
        );
        url = VUtil.updateURL(
          url,
          this.options.fovQueryKey,
          wcs2.zoomToFov(map, map.getZoom(), latlng).toPrecision(4)
        );
        history.pushState(stateObj, "", url);
        VUtil.copyToClipboard(url);
      }, this);
      return this._wcsdialog;
    },
    onRemove: function(map) {
      map.off("drag", this._onDrag);
    },
    _onDrag: function(e) {
      var latlng = this._map.getCenter(), wcs2 = this._map.options.crs, coord = this.options.coordinates[this._currentCoord];
      if (wcs2.pixelFlag) {
        this._wcsinput.value = latlng.lng.toFixed(0) + " , " + latlng.lat.toFixed(0);
      } else {
        if (!coord.nativeCelsys && wcs2.forceNativeCelsys) {
          latlng = wcs2.celsysToEq(latlng);
        } else if (coord.nativeCelsys && wcs2.forceNativeCelsys === false) {
          latlng = wcs2.eqToCelsys(latlng);
        }
        switch (coord.units) {
          case "HMS":
            this._wcsinput.value = VUtil.latLngToHMSDMS(latlng);
            break;
          case "deg":
            this._wcsinput.value = latlng.lng.toFixed(5) + " , " + latlng.lat.toFixed(5);
            break;
          default:
            this._wcsinput.value = latlng.lng.toFixed(1) + " , " + latlng.lat.toFixed(1);
            break;
        }
      }
    },
    panTo: function(str) {
      var wcs2 = this._map.options.crs, coord = this.options.coordinates[this._currentCoord], latlng = wcs2.parseCoords(str);
      if (latlng) {
        if (wcs2.pixelFlag) {
          this._map.panTo(latlng);
        } else {
          if (!coord.nativeCelsys && wcs2.forceNativeCelsys) {
            latlng = wcs2.eqToCelsys(latlng);
          } else if (coord.nativeCelsys && wcs2.forceNativeCelsys === false) {
            latlng = wcs2.celsysToEq(latlng);
          }
          this._map.panTo(latlng);
        }
      } else {
        VUtil.requestURL(
          this.options.sesameURL + "/-oI/A?" + str,
          "getting coordinates for " + str,
          this._getCoordinates,
          this,
          10
        );
      }
    },
    _getCoordinates: function(_this, httpRequest) {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          var str = httpRequest.responseText, latlng = _this._map.options.crs.parseCoords(str);
          if (latlng) {
            _this._map.panTo(latlng);
            _this._onDrag();
          } else {
            alert(str + ": Unknown location");
          }
        } else {
          alert("There was a problem with the request to the Sesame service at CDS");
        }
      }
    }
  });
  import_leaflet25.Map.mergeOptions({
    positionControl: false
  });
  import_leaflet25.Map.addInitHook(function() {
    if (this.options.positionControl) {
      this.positionControl = new import_leaflet25.Control.MousePosition();
      this.addControl(this.positionControl);
    }
  });
  var coords = function(options) {
    return new Coords(options);
  };

  // js/control/DocUI.js
  var import_leaflet26 = __toESM(require_leaflet_src());
  var DocUI = UI.extend({
    options: {
      title: "Documentation",
      collapsed: true,
      position: "topleft",
      pdflink: void 0
    },
    initialize: function(url, options) {
      import_leaflet26.Util.setOptions(this, options);
      this._className = "leaflet-control-iip";
      this._id = "leaflet-iipdoc";
      this._sideClass = "doc";
      this._url = url;
    },
    _initDialog: function() {
      var _this = this, className = this._className, layer = this._layer, frameBox = import_leaflet26.DomUtil.create(
        "div",
        this._className + "-framebox",
        this._dialog
      ), iframe = this._iframe = import_leaflet26.DomUtil.create(
        "iframe",
        this._className + "-doc",
        frameBox
      );
      iframe.src = this._url;
      iframe.frameborder = 0;
      this._navHistory = [];
      this._navPos = 0;
      this._ignore = false;
      import_leaflet26.DomEvent.on(iframe, "load hashchange", this._onloadNav, this);
      var box = this._addDialogBox("leaflet-iipdoc-dialog"), line = this._addDialogLine("Navigate:", box), elem = this._addDialogElement(line);
      this._homeButton = this._createButton(
        className + "-button",
        elem,
        "home",
        this._homeNav,
        "Navigate home"
      );
      this._backButton = this._createButton(
        className + "-button",
        elem,
        "back",
        this._backNav,
        "Navigate backward"
      );
      this._forwardButton = this._createButton(
        className + "-button",
        elem,
        "forward",
        this._forwardNav,
        "Navigate forward"
      );
      if (this.options.pdflink) {
        var pdfButton = this._createButton(
          className + "-button",
          elem,
          "pdf",
          void 0,
          "Download PDF version"
        );
        pdfButton.href = this.options.pdflink;
      }
    },
    _updateNav: function(newPos) {
      if (newPos !== this._navPos) {
        this._navPos = newPos;
        this._navIgnore = true;
        this._iframe.src = this._navHistory[this._navPos - 1];
        this._disableNav();
      }
    },
    _disableNav: function() {
      this._backButton.disabled = this._navPos === 1;
      this._forwardButton.disabled = this._navPos >= this._navHistory.length;
    },
    _backNav: function() {
      if (!this._backButton.disabled) {
        this._updateNav(Math.max(1, this._navPos - 1));
      }
    },
    _forwardNav: function() {
      if (!this._forwardButton.disabled) {
        this._updateNav(Math.min(this._navHistory.length, this._navPos + 1));
      }
    },
    _homeNav: function() {
      if (!this._backButton.disabled) {
        this._updateNav(1);
      }
    },
    _onloadNav: function() {
      if (true) {
        var as = this._iframe.contentDocument.getElementsByTagName("a");
        for (var i = 0; i < as.length; i++) {
          if (VUtil.isExternal(as[i].href)) {
            as[i].setAttribute("target", "_blank");
          }
        }
        this._iframeLoad1 = true;
      }
      if (!this._navIgnore) {
        var href = this._iframe.contentWindow.location.href;
        if (href !== this._navHistory[this._navPos - 1]) {
          this._navHistory.splice(this._navPos, this._navHistory.length - this._navPos);
          this._navHistory.push(href);
          this._navPos = this._navHistory.length;
          this._disableNav();
        }
      } else {
        this._navIgnore = false;
      }
    }
  });
  var docUI = function(url, options) {
    return new DocUI(url, options);
  };

  // js/control/ExtraMap.js
  var import_leaflet27 = __toESM(require_leaflet_src());
  var ExtraMap = import_leaflet27.Control.extend({
    options: {
      position: "bottomright",
      title: "Navigation mini-map. Grab to navigate",
      toggleDisplay: true,
      zoomLevelFixed: false,
      zoomLevelOffset: -5,
      zoomAnimation: false,
      autoToggleDisplay: false,
      width: 150,
      height: 150,
      collapsedWidth: 24,
      collapsedHeight: 24,
      aimingRectOptions: {
        color: "#FFFFFF",
        weight: 1,
        clickable: false
      },
      shadowRectOptions: {
        color: "#FDC82F",
        weight: 1,
        clickable: false,
        opacity: 0,
        fillOpacity: 0
      },
      strings: { hideText: "Hide map", showText: "Show map" }
    },
    initialize: function(layer, options) {
      import_leaflet27.Util.setOptions(this, options);
      this.options.aimingRectOptions.clickable = false;
      this.options.shadowRectOptions.clickable = false;
      this._layer = layer;
    },
    onAdd: function(map) {
      this._mainMap = map;
      this._container = import_leaflet27.DomUtil.create("div", "leaflet-control-extramap");
      this._container.style.width = this.options.width + "px";
      this._container.style.height = this.options.height + "px";
      this._container.title = this.options.title;
      import_leaflet27.DomEvent.disableClickPropagation(this._container);
      import_leaflet27.DomEvent.on(this._container, "mousewheel", import_leaflet27.DomEvent.stopPropagation);
      this._extraMap = new import_leaflet27.Map(this._container, {
        attributionControl: false,
        zoomControl: false,
        zoomAnimation: this.options.zoomAnimation,
        autoToggleDisplay: this.options.autoToggleDisplay,
        touchZoom: !this._isZoomLevelFixed(),
        scrollWheelZoom: !this._isZoomLevelFixed(),
        doubleClickZoom: !this._isZoomLevelFixed(),
        boxZoom: !this._isZoomLevelFixed()
      });
      this._layer.addTo(this._extraMap);
      this._userToggledDisplay = false;
      this._minimized = false;
      if (this.options.toggleDisplay) {
        this._addToggleButton();
      }
      this._layer.once("metaload", function() {
        this._mainMap.whenReady(import_leaflet27.Util.bind(function() {
          this._extraMap.whenReady(import_leaflet27.Util.bind(function() {
            this._aimingRect = (0, import_leaflet27.rectangle)(
              this._mainMap.getBounds(),
              this.options.aimingRectOptions
            ).addTo(this._extraMap);
            this._shadowRect = (0, import_leaflet27.rectangle)(
              this._mainMap.getBounds(),
              this.options.shadowRectOptions
            ).addTo(this._extraMap);
            this._mainMap.on("moveend", this._onMainMapMoved, this);
            this._mainMap.on("move", this._onMainMapMoving, this);
            this._extraMap.on("movestart", this._onExtraMapMoveStarted, this);
            this._extraMap.on("move", this._onExtraMapMoving, this);
            this._extraMap.on("moveend", this._onExtraMapMoved, this);
            this._extraMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
            this._setDisplay(this._decideMinimized());
          }, this));
        }, this));
      }, this);
      return this._container;
    },
    addTo: function(map) {
      import_leaflet27.Control.prototype.addTo.call(this, map);
      return this;
    },
    onRemove: function(map) {
      this._mainMap.off("moveend", this._onMainMapMoved, this);
      this._mainMap.off("move", this._onMainMapMoving, this);
      this._extraMap.off("moveend", this._onExtraMapMoved, this);
      this._extraMap.removeLayer(this._layer);
    },
    changeLayer: function(layer) {
      this._extraMap.removeLayer(this._layer);
      this._layer = layer;
      this._extraMap.addLayer(this._layer);
    },
    _addToggleButton: function() {
      this._toggleDisplayButton = this.options.toggleDisplay ? this._createButton(
        "",
        this.options.strings.hideText,
        "leaflet-control-extramap-toggle-display leaflet-control-extramap-toggle-display-" + this.options.position,
        this._container,
        this._toggleDisplayButtonClicked,
        this
      ) : void 0;
      this._toggleDisplayButton.style.width = this.options.collapsedWidth + "px";
      this._toggleDisplayButton.style.height = this.options.collapsedHeight + "px";
    },
    _createButton: function(html, title, className, container, fn, context) {
      var link = import_leaflet27.DomUtil.create("a", className, container);
      link.innerHTML = html;
      link.href = "#";
      link.title = title;
      var stop = import_leaflet27.DomEvent.stopPropagation;
      import_leaflet27.DomEvent.on(link, "click", stop).on(link, "mousedown", stop).on(link, "dblclick", stop).on(link, "click", import_leaflet27.DomEvent.preventDefault).on(link, "click", fn, context);
      return link;
    },
    _toggleDisplayButtonClicked: function() {
      this._userToggledDisplay = true;
      if (!this._minimized) {
        this._minimize();
        this._toggleDisplayButton.title = this.options.strings.showText;
      } else {
        this._restore();
        this._toggleDisplayButton.title = this.options.strings.hideText;
      }
    },
    _setDisplay: function(minimize) {
      if (minimize !== this._minimized) {
        if (!this._minimized) {
          this._minimize();
        } else {
          this._restore();
        }
      }
    },
    _minimize: function() {
      if (this.options.toggleDisplay) {
        this._container.style.width = this.options.collapsedWidth + "px";
        this._container.style.height = this.options.collapsedHeight + "px";
        this._toggleDisplayButton.className += " minimized-" + this.options.position;
      } else {
        this._container.style.display = "none";
      }
      this._minimized = true;
    },
    _restore: function() {
      if (this.options.toggleDisplay) {
        this._container.style.width = this.options.width + "px";
        this._container.style.height = this.options.height + "px";
        this._toggleDisplayButton.className = this._toggleDisplayButton.className.replace("minimized-" + this.options.position, "");
      } else {
        this._container.style.display = "block";
      }
      this._minimized = false;
    },
    _onMainMapMoved: function(e) {
      if (!this._extraMapMoving) {
        this._mainMapMoving = true;
        this._extraMap.setView(this._mainMap.getCenter(), this._decideZoom(true));
        this._setDisplay(this._decideMinimized());
      } else {
        this._extraMapMoving = false;
      }
      this._aimingRect.setBounds(this._mainMap.getBounds());
    },
    _onMainMapMoving: function(e) {
      this._aimingRect.setBounds(this._mainMap.getBounds());
    },
    _onExtraMapMoveStarted: function(e) {
      var lastAimingRect = this._aimingRect.getBounds();
      var sw = this._extraMap.latLngToContainerPoint(lastAimingRect.getSouthWest());
      var ne = this._extraMap.latLngToContainerPoint(lastAimingRect.getNorthEast());
      this._lastAimingRectPosition = { sw, ne };
    },
    _onExtraMapMoving: function(e) {
      if (!this._mainMapMoving && this._lastAimingRectPosition) {
        this._shadowRect.setBounds(new import_leaflet27.LatLngBounds(
          this._extraMap.containerPointToLatLng(this._lastAimingRectPosition.sw),
          this._extraMap.containerPointToLatLng(this._lastAimingRectPosition.ne)
        ));
        this._shadowRect.setStyle({ opacity: 1, fillOpacity: 0.3 });
      }
    },
    _onExtraMapMoved: function(e) {
      if (!this._mainMapMoving) {
        this._extraMapMoving = true;
        this._mainMap.setView(this._extraMap.getCenter(), this._decideZoom(false));
        this._shadowRect.setStyle({ opacity: 0, fillOpacity: 0 });
      } else {
        this._mainMapMoving = false;
      }
    },
    _isZoomLevelFixed: function() {
      var zoomLevelFixed = this.options.zoomLevelFixed;
      return this._isDefined(zoomLevelFixed) && this._isInteger(zoomLevelFixed);
    },
    _decideZoom: function(fromMaintoExtra) {
      if (!this._isZoomLevelFixed()) {
        if (fromMaintoExtra) {
          return this._mainMap.getZoom() + this.options.zoomLevelOffset;
        } else {
          var currentDiff = this._extraMap.getZoom() - this._mainMap.getZoom();
          var proposedZoom = this._extraMap.getZoom() - this.options.zoomLevelOffset;
          var toRet;
          if (currentDiff > this.options.zoomLevelOffset && this._mainMap.getZoom() < this._extraMap.getMinZoom() - this.options.zoomLevelOffset) {
            if (this._extraMap.getZoom() > this._lastExtraMapZoom) {
              toRet = this._mainMap.getZoom() + 1;
              this._extraMap.setZoom(this._extraMap.getZoom() - 1);
            } else {
              toRet = this._mainMap.getZoom();
            }
          } else {
            toRet = proposedZoom;
          }
          this._lastExtraMapZoom = this._extraMap.getZoom();
          return toRet;
        }
      } else {
        if (fromMaintoExtra) {
          return this.options.zoomLevelFixed;
        } else {
          return this._mainMap.getZoom();
        }
      }
    },
    _decideMinimized: function() {
      if (this._userToggledDisplay) {
        return this._minimized;
      }
      if (this.options.autoToggleDisplay) {
        if (this._mainMap.getBounds().contains(this._extraMap.getBounds())) {
          return true;
        }
        return false;
      }
      return this._minimized;
    },
    _isInteger: function(value) {
      return typeof value === "number";
    },
    _isDefined: function(value) {
      return typeof value !== "undefined";
    }
  });
  import_leaflet27.Map.mergeOptions({
    extraMapControl: false
  });
  import_leaflet27.Map.addInitHook(function() {
    if (this.options.extraMapControl) {
      this.extraMapControl = new import_leaflet27.Control.ExtraMap().addTo(this);
    }
  });
  var extraMap = function(layer, options) {
    return new ExtraMap(layer, options);
  };

  // js/control/FullScreen.js
  var import_leaflet28 = __toESM(require_leaflet_src());
  var FullScreen = import_leaflet28.Control.extend({
    options: {
      position: "topleft",
      title: "Toggle full screen mode",
      forceSeparateButton: false
    },
    onAdd: function(map) {
      var className = "leaflet-control-zoom-fullscreen", container;
      if (map.zoomControl && !this.options.forceSeparateButton) {
        container = map.zoomControl._container;
      } else {
        container = import_leaflet28.DomUtil.create("div", "leaflet-bar");
      }
      this._createButton(this.options.title, className, container, this.toogleFullScreen, map);
      return container;
    },
    _createButton: function(title, className, container, fn, context) {
      var link = import_leaflet28.DomUtil.create("a", className, container);
      link.href = "#";
      link.title = title;
      import_leaflet28.DomEvent.addListener(link, "click", import_leaflet28.DomEvent.stopPropagation).addListener(link, "click", import_leaflet28.DomEvent.preventDefault).addListener(link, "click", fn, context);
      import_leaflet28.DomEvent.addListener(container, fullScreenApi.fullScreenEventName, import_leaflet28.DomEvent.stopPropagation).addListener(container, fullScreenApi.fullScreenEventName, import_leaflet28.DomEvent.preventDefault).addListener(container, fullScreenApi.fullScreenEventName, this._handleEscKey, context);
      import_leaflet28.DomEvent.addListener(document, fullScreenApi.fullScreenEventName, import_leaflet28.DomEvent.stopPropagation).addListener(document, fullScreenApi.fullScreenEventName, import_leaflet28.DomEvent.preventDefault).addListener(document, fullScreenApi.fullScreenEventName, this._handleEscKey, context);
      return link;
    },
    toogleFullScreen: function() {
      this._exitFired = false;
      var container = this._container;
      if (this._isFullscreen) {
        if (fullScreenApi.supportsFullScreen) {
          fullScreenApi.cancelFullScreen(container);
        } else {
          import_leaflet28.DomUtil.removeClass(container, "leaflet-pseudo-fullscreen");
        }
        this.invalidateSize();
        this.fire("exitFullscreen");
        this._exitFired = true;
        this._isFullscreen = false;
      } else {
        if (fullScreenApi.supportsFullScreen) {
          fullScreenApi.requestFullScreen(container);
        } else {
          import_leaflet28.DomUtil.addClass(container, "leaflet-pseudo-fullscreen");
        }
        this.invalidateSize();
        this.fire("enterFullscreen");
        this._isFullscreen = true;
      }
    },
    _handleEscKey: function() {
      if (!fullScreenApi.isFullScreen(this) && !this._exitFired) {
        this.fire("exitFullscreen");
        this._exitFired = true;
        this._isFullscreen = false;
      }
    }
  });
  fullScreen = function(options) {
    return new FullScreen(options);
  };
  import_leaflet28.Map.addInitHook(function() {
    if (this.options.fullScreenControl) {
      this.fullScreenControl = control.fullscreen(this.options.fullScreenControlOptions);
      this.addControl(this.fullScreenControl);
    }
  });
  var fullScreenApi = {
    supportsFullScreen: false,
    isFullScreen: function() {
      return false;
    },
    requestFullScreen: function() {
    },
    cancelFullScreen: function() {
    },
    fullScreenEventName: "",
    prefix: ""
  };
  var browserPrefixes = "webkit moz o ms khtml".split(" ");
  if (typeof document.exitFullscreen !== "undefined") {
    fullScreenApi.supportsFullScreen = true;
  } else {
    for (i = 0, il = browserPrefixes.length; i < il; i++) {
      fullScreenApi.prefix = browserPrefixes[i];
      if (typeof document[fullScreenApi.prefix + "CancelFullScreen"] !== "undefined") {
        fullScreenApi.supportsFullScreen = true;
        break;
      }
    }
  }
  var i;
  var il;
  if (fullScreenApi.supportsFullScreen) {
    fullScreenApi.fullScreenEventName = fullScreenApi.prefix + "fullscreenchange";
    fullScreenApi.isFullScreen = function() {
      switch (this.prefix) {
        case "":
          return document.fullScreen;
        case "webkit":
          return document.webkitIsFullScreen;
        default:
          return document[this.prefix + "FullScreen"];
      }
    };
    fullScreenApi.requestFullScreen = function(el) {
      return this.prefix === "" ? el.requestFullscreen() : el[this.prefix + "RequestFullScreen"]();
    };
    fullScreenApi.cancelFullScreen = function(el) {
      return this.prefix === "" ? document.exitFullscreen() : document[this.prefix + "CancelFullScreen"]();
    };
  }
  if (typeof jQuery !== "undefined") {
    jQuery.fn.requestFullScreen = function() {
      return this.each(function() {
        var el = jQuery(this);
        if (fullScreenApi.supportsFullScreen) {
          fullScreenApi.requestFullScreen(el);
        }
      });
    };
  }
  window.fullScreenApi = fullScreenApi;

  // js/control/ImageUI.js
  var import_leaflet29 = __toESM(require_leaflet_src());
  var ImageUI = UI.extend({
    options: {
      title: "Image preferences",
      collapsed: true,
      position: "topleft"
    },
    initialize: function(options) {
      import_leaflet29.Util.setOptions(this, options);
      this._className = "leaflet-control-iip";
      this._id = "leaflet-iipimage";
      this._sideClass = "image";
      this._initsettings = {};
    },
    saveSettings: function(layer, settings) {
      if (!settings) {
        return;
      }
      settings.invertCMap = layer.iipInvertCMap;
      settings.contrast = layer.iipContrast;
      settings.colorSat = layer.iipColorSat;
      settings.gamma = layer.iipGamma;
      settings.quality = layer.iipQuality;
    },
    loadSettings: function(layer, settings) {
      if (!settings) {
        return;
      }
      layer.iipInvertCMap = settings.invertCMap;
      this._updateInput(this._input.invertCMap, settings.invertCMap);
      layer.iipContrast = settings.contrast;
      this._updateInput(this._input.contrast, settings.contrast);
      layer.iipColorSat = settings.colorSat;
      this._updateInput(this._input.colorSat, settings.colorSat);
      layer.iipGamma = settings.gamma;
      this._updateInput(this._input.gamma, settings.gamma);
      layer.iipQuality = settings.quality;
      this._updateInput(this._input.quality, settings.quality);
    },
    _initDialog: function() {
      var _this = this, className = this._className, layer = this._layer, map = this._map;
      this._input = {};
      this.saveSettings(layer, this._initsettings);
      this._input.invertCMap = this._addSwitchInput(
        layer,
        this._dialog,
        "Invert:",
        "iipInvertCMap",
        "Invert color map(s)",
        "leaflet-invertCMap",
        layer.iipInvertCMap
      );
      this._input.contrast = this._addNumericalInput(
        layer,
        this._dialog,
        "Contrast:",
        "iipContrast",
        "Adjust Contrast. 1.0: normal.",
        "leaflet-contrastValue",
        layer.iipContrast,
        0.05,
        0,
        10
      );
      this._input.colorSat = this._addNumericalInput(
        layer,
        this._dialog,
        "Color Sat.:",
        "iipColorSat",
        "Adjust Color Saturation. 0: B&W, 1.0: normal.",
        "leaflet-colorsatvalue",
        layer.iipColorSat,
        0.05,
        0,
        5,
        this._updateMix
      );
      this._input.gamma = this._addNumericalInput(
        layer,
        this._dialog,
        "Gamma:",
        "iipGamma",
        "Adjust Gamma correction. The standard value is 2.2.",
        "leaflet-gammavalue",
        layer.iipGamma,
        0.05,
        0.5,
        5
      );
      this._input.quality = this._addNumericalInput(
        layer,
        this._dialog,
        "JPEG quality:",
        "iipQuality",
        "Adjust JPEG compression quality. 1: lowest, 100: highest",
        "leaflet-qualvalue",
        layer.iipQuality,
        1,
        1,
        100
      );
      var line = this._addDialogLine("Reset:", this._dialog), elem = this._addDialogElement(line);
      this._createButton(className + "-button", elem, "image-reset", function() {
        _this.loadSettings(layer, _this._initsettings);
        layer.updateMix();
        layer.redraw();
      }, "Reset image settings");
    },
    _updateMix: function(layer) {
      var nchannel = layer.iipNChannel;
      for (var c = 0; c < nchannel; c++) {
        layer.rgbToMix(c);
      }
      return;
    }
  });
  var imageUI = function(options) {
    return new ImageUI(options);
  };

  // js/control/OverlayUI.js
  var import_jquery3 = __toESM(require_jquery());
  var import_leaflet30 = __toESM(require_leaflet_src());
  window.$ = window.jQuery = import_jquery3.default;
  var OverlayUI = UI.extend({
    options: {
      title: "overlay menu",
      collapsed: true,
      position: "topleft"
    },
    initialize: function(baseLayers, options) {
      import_leaflet30.Util.setOptions(this, options);
      this._className = "leaflet-control-iip";
      this._id = "leaflet-iipoverlay";
      this._layers = baseLayers;
    },
    _initDialog: function() {
      var className = this._className, catalogs = [Gaia_DR2, TwoMASS, SDSS, PPMXL, Abell], elem;
      elem = this._addDialogLine('<a id="logo-cds" href="http://cds.u-strasbg.fr">&nbsp;</a> catalog:');
      var catcolpick = import_leaflet30.DomUtil.create("input", className + "-catalogs", elem);
      catcolpick.id = "leaflet-catalog-colorpicker";
      catcolpick.type = "text";
      catcolpick.value = "yellow";
      $(document).ready(function() {
        $("#" + catcolpick.id).spectrum({
          showInput: true,
          clickoutFiresChange: true,
          move: function(color) {
            catcolpick.value = color.toHexString();
          }
        });
      });
      var catselect = import_leaflet30.DomUtil.create("select", className + "-catalogs", elem);
      var opt = document.createElement("option");
      opt.text = "Choose catalog:";
      opt.disabled = true;
      opt.selected = true;
      catselect.add(opt, null);
      for (var c in catalogs) {
        opt = document.createElement("option");
        opt.text = catalogs[c].name;
        catselect.add(opt, null);
      }
      if (!import_leaflet30.Browser.android && this.options.collapsed) {
        import_leaflet30.DomEvent.on(catselect, "mousedown", function() {
          import_leaflet30.DomEvent.off(this._container, "mouseout", this._collapse, this);
          this.collapsedOff = true;
        }, this);
        import_leaflet30.DomEvent.on(this._container, "mouseover", function() {
          if (this.collapsedOff) {
            import_leaflet30.DomEvent.on(this._container, "mouseout", this._collapse, this);
            this.collapsedOff = false;
          }
        }, this);
      }
      var catbutton = import_leaflet30.DomUtil.create("input", className + "-catalogs", elem);
      catbutton.type = "button";
      catbutton.value = "Go";
      import_leaflet30.DomEvent.on(catbutton, "click", function() {
        var index = catselect.selectedIndex - 1;
        if (index >= 0) {
          var catalog = catalogs[index];
          catalog.color = catcolpick.value;
          catselect.selectedIndex = 0;
          this._getCatalog(catalog);
        }
      }, this);
      elem = this._addDialogLine("Profile:");
      var profcolpick = import_leaflet30.DomUtil.create("input", className + "-profile", elem);
      profcolpick.id = "leaflet-profile-colorpicker";
      profcolpick.type = "text";
      profcolpick.value = "magenta";
      $(document).ready(function() {
        $("#" + profcolpick.id).spectrum({
          showInput: true,
          clickoutFiresChange: true,
          move: function(color) {
            profcolpick.value = color.toHexString();
          }
        });
      });
      var profbutton1 = import_leaflet30.DomUtil.create("input", className + "-profile-start", elem);
      profbutton1.type = "button";
      profbutton1.value = "Start";
      import_leaflet30.DomEvent.on(profbutton1, "click", function() {
        if (this._profileLine) {
          this._profileLine.spliceLatLngs(0, 1, this._map.getCenter());
          this._profileLine.redraw();
        } else {
          var map = this._map, point7 = map.getCenter(), line = this._profileLine = (0, import_leaflet30.polyline)([point7, point7], {
            color: profcolpick.value,
            weight: 7,
            opacity: 0.5
          });
          line.nameColor = profcolpick.value;
          line.addTo(map);
          map.on("drag", this._updateLine, this);
        }
      }, this);
      var profbutton2 = import_leaflet30.DomUtil.create("input", className + "-profile-end", elem);
      profbutton2.type = "button";
      profbutton2.value = "End";
      import_leaflet30.DomEvent.on(profbutton2, "click", this._profileEnd, this);
    },
    _resetDialog: function() {
    },
    _getCatalog: function(catalog) {
      var _this = this, map = this._map, center = map.getCenter(), b = map.getPixelBounds(), z = map.getZoom(), lngfac = Math.abs(Math.cos(center.lat)) * Math.PI / 180, c = [
        map.unproject(b.min, z),
        map.unproject((0, import_leaflet30.point)(b.min.x, b.max.y), z),
        map.unproject(b.max, z),
        map.unproject((0, import_leaflet30.point)(b.max.x, b.min.y), z)
      ], dlng = Math.max(c[0].lng, c[1].lng, c[2].lng, c[3].lng) - Math.min(c[0].lng, c[1].lng, c[2].lng, c[3].lng), dlat = Math.max(c[0].lat, c[1].lat, c[2].lat, c[3].lat) - Math.min(c[0].lat, c[1].lat, c[2].lat, c[3].lat);
      if (dlat < 1e-4) {
        dlat = 1e-4;
      }
      if (lngfac > 0 && dlng * lngfac < 1e-4) {
        dlng = 1e-4 / lngfac;
      }
      var templayer = new import_leaflet30.LayerGroup(null), layercontrol = map._layerControl;
      templayer.notReady = true;
      if (layercontrol) {
        layercontrol.addOverlay(templayer, catalog.name);
        if (layercontrol.options.collapsed) {
          layercontrol._expand();
        }
      }
      VUtil.requestURI(
        import_leaflet30.Util.template(catalog.uri, import_leaflet30.Util.extend({
          ra: center.lng.toFixed(6),
          dec: center.lat.toFixed(6),
          dra: dlng.toFixed(4),
          ddec: dlat.toFixed(4),
          nmax: catalog.nmax
        })),
        "getting " + catalog.service + " data",
        function(context, httpRequest) {
          _this._loadCatalog(catalog, templayer, context, httpRequest);
        },
        this,
        true
      );
    },
    _loadCatalog: function(catalog, templayer, _this, httpRequest) {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          var response = httpRequest.responseText, geo = catalog.toGeoJSON(response), geocatalog = (0, import_leaflet30.geoJson)(geo, {
            onEachFeature: function(feature, layer) {
              if (feature.properties && feature.properties.mags) {
                layer.bindPopup(catalog._popup(feature));
              }
            },
            pointToLayer: function(feature, latlng) {
              return (0, import_leaflet30.circleMarker)(latlng, {
                radius: feature.properties.mags[0] ? 8 + catalog.maglim - feature.properties.mags[0] : 8
              });
            },
            style: function(feature) {
              return { color: catalog.color, weight: 2 };
            }
          });
          geocatalog.nameColor = catalog.color;
          geocatalog.addTo(_this._map);
          var layercontrol = _this._map._layerControl;
          if (layercontrol) {
            layercontrol.removeLayer(templayer);
            layercontrol.addOverlay(geocatalog, catalog.name + " (" + geo.features.length.toString() + " entries)");
            if (layercontrol.options.collapsed) {
              layercontrol._collapse();
            }
          }
        } else {
          alert("There was a problem with the request to " + catalog.service + ".");
        }
      }
    },
    _updateLine: function(e) {
      var map = this._map, latLng10 = map.getCenter(), maxzoom = map.options.crs.options.nzoom - 1, line = this._profileLine, path = line.getLatLngs(), point1 = map.project(path[0], maxzoom), point22 = map.project(map.getCenter(), maxzoom);
      if (Math.abs(point1.x - point22.x) > Math.abs(point1.y - point22.y)) {
        point22.y = point1.y;
      } else {
        point22.x = point1.x;
      }
      this._profileLine.spliceLatLngs(1, 1, map.unproject(point22, maxzoom));
      this._profileLine.redraw();
    },
    _profileEnd: function(e) {
      var map = this._map, point7 = map.getCenter(), line = this._profileLine;
      map.off("drag", this._updateLine, this);
      this._profileLine = void 0;
      var popdiv = document.createElement("div"), activity = document.createElement("div");
      popdiv.id = "leaflet-profile-plot";
      activity.className = "leaflet-control-activity";
      popdiv.appendChild(activity);
      line.bindPopup(
        popdiv,
        { minWidth: 16, maxWidth: 1024, closeOnClick: false }
      ).openPopup();
      var zoom = map.options.crs.options.nzoom - 1, path = line.getLatLngs(), point1 = map.project(path[0], zoom), point22 = map.project(path[1], zoom), x, y;
      if (point22.x < point1.x) {
        x = point22.x;
        point22.x = point1.x;
        point1.x = x;
      }
      if (point22.y < point1.y) {
        y = point22.y;
        point22.y = point1.y;
        point1.y = y;
      }
      VUtil.requestURI(
        this._layer._url.replace(/\&.*$/g, "") + "&PFL=" + zoom.toString() + ":" + point1.x.toFixed(0) + "," + point1.y.toFixed(0) + "-" + point22.x.toFixed(0) + "," + point22.y.toFixed(0),
        "getting IIP layer profile",
        this._plotProfile,
        line
      );
    },
    _getMeasurementString: function() {
      var currentLatLng = this._currentLatLng, previousLatLng = this._markers[this._markers.length - 1].getLatLng(), distance, distanceStr, unit;
      distance = this._measurementRunningTotal + VUtil.distance(currentLatLng, previousLatLng);
      if (distance >= 1) {
        unit = "&#176;";
      } else {
        distance *= 60;
        if (distance >= 1) {
          unit = "&#39;";
        } else {
          distance *= 60;
          unit = "&#34;";
        }
      }
      distanceStr = distance.toFixed(2) + unit;
      return distanceStr;
    },
    _plotProfile: function(layer, httpRequest) {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          var json = JSON.parse(httpRequest.responseText), yprof = json.profile, layercontrol = layer._map._layerControl, popdiv = document.getElementById("leaflet-profile-plot");
          if (layercontrol) {
            layercontrol.addOverlay(layer, "Image profile");
          }
          $(document).ready(function() {
            $.jqplot("leaflet-profile-plot", [yprof], {
              title: "Image profile",
              axes: {
                xaxis: {
                  label: "position along line",
                  labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                  pad: 1
                },
                yaxis: {
                  label: "pixel values",
                  labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                  pad: 1
                }
              },
              cursor: {
                show: true,
                zoom: true
              },
              seriesDefaults: {
                lineWidth: 2,
                showMarker: false
              }
            });
          });
          popdiv.removeChild(popdiv.childNodes[0]);
          layer._popup.update();
        }
      }
    }
  });
  var overlayUI = function(options) {
    return new OverlayUI(options);
  };

  // js/control/ProfileUI.js
  var import_jquery4 = __toESM(require_jquery());
  var import_leaflet31 = __toESM(require_leaflet_src());
  window.$ = window.jQuery = import_jquery4.default;
  var ProfileUI = UI.extend({
    options: {
      title: "Profile overlays",
      collapsed: true,
      position: "topleft",
      profile: true,
      profileColor: "#FF00FF",
      spectrum: true,
      spectrumColor: "#A000FF"
    },
    initialize: function(options) {
      import_leaflet31.Util.setOptions(this, options);
      this._className = "leaflet-control-iip";
      this._id = "leaflet-iipprofile";
      this._layers = {};
      this._sideClass = "profile";
      this._handlingClick = false;
    },
    _initDialog: function() {
      var _this = this, options = this.options, className = this._className, box = this._addDialogBox(), line, elem;
      if (options.profile) {
        line = this._addDialogLine("Profile:", box);
        elem = this._addDialogElement(line);
        var linecolpick = this._createColorPicker(
          className + "-color",
          elem,
          "profile",
          options.profileColor,
          false,
          "iipProfile",
          "Click to set line color"
        );
        this._createButton(className + "-button", elem, "start", function() {
          if (this._currProfileLine) {
            this._updateLine();
          } else {
            var map = _this._map, point7 = map.getCenter(), line2 = this._currProfileLine = (0, import_leaflet31.polyline)([point7, point7], {
              color: linecolpick.value,
              weight: 7,
              opacity: 0.5
            });
            line2.nameColor = linecolpick.value;
            line2.addTo(map);
            map.on("drag", this._updateLine, this);
          }
        }, "Start drawing a profile line");
        this._createButton(
          className + "-button",
          elem,
          "end",
          this._profileEnd,
          "End line and plot"
        );
      }
      if (options.spectrum) {
        line = this._addDialogLine("Spectrum:", box);
        elem = this._addDialogElement(line);
        var speccolpick = this._createColorPicker(
          className + "-color",
          elem,
          "spectrum",
          options.spectrumColor,
          false,
          "iipSpectra",
          "Click to set marker color"
        );
        this._createButton(className + "-button", elem, "spectrum", function() {
          var map = _this._map, latLng10 = map.getCenter(), zoom = map.options.crs.options.nzoom - 1, point7 = map.project(latLng10, zoom).floor().add([0.5, 0.5]), rLatLng = map.unproject(point7, zoom), marker2 = this._spectrumMarker = (0, import_leaflet31.circleMarker)(rLatLng, {
            color: speccolpick.value,
            radius: 6,
            title: "Spectrum"
          }).addTo(map), popdiv = import_leaflet31.DomUtil.create("div", this._className + "-popup"), activity = import_leaflet31.DomUtil.create("div", this._className + "-activity", popdiv);
          popdiv.id = "leaflet-spectrum-plot";
          marker2.bindPopup(
            popdiv,
            { minWidth: 16, maxWidth: 1024, closeOnClick: false }
          ).openPopup();
          VUtil.requestURL(
            this._layer._url.replace(/\&.*$/g, "") + "&PFL=" + zoom.toString() + ":" + (point7.x - 0.5).toFixed(0) + "," + (point7.y - 0.5).toFixed(0) + "-" + (point7.x - 0.5).toFixed(0) + "," + (point7.y - 0.5).toFixed(0),
            "getting IIP layer spectrum",
            this._plotSpectrum,
            this
          );
        }, "Plot a spectrum at the current map position");
      }
    },
    _updateLine: function(e) {
      var map = this._map, latLng10 = map.getCenter(), maxzoom = map.options.crs.options.nzoom - 1, path = this._currProfileLine.getLatLngs(), point1 = map.project(path[0], maxzoom), point22 = map.project(map.getCenter(), maxzoom);
      if (Math.abs(point1.x - point22.x) > Math.abs(point1.y - point22.y)) {
        point22.y = point1.y;
      } else {
        point22.x = point1.x;
      }
      path[1] = map.unproject(point22, maxzoom);
      this._currProfileLine.redraw();
    },
    _profileEnd: function() {
      var map = this._map, point7 = map.getCenter(), line = this._profileLine = this._currProfileLine;
      map.off("drag", this._updateLine, this);
      this._currProfileLine = void 0;
      var popdiv = import_leaflet31.DomUtil.create("div", this._className + "-popup"), activity = import_leaflet31.DomUtil.create("div", this._className + "-activity", popdiv);
      popdiv.id = "leaflet-profile-plot";
      line.bindPopup(
        popdiv,
        { minWidth: 16, maxWidth: 1024, closeOnClick: false }
      ).openPopup();
      var zoom = map.options.crs.options.nzoom - 1, path = line.getLatLngs(), point1 = map.project(path[0], zoom), point22 = map.project(path[1], zoom), x, y;
      if (point22.x < point1.x) {
        x = point22.x;
        point22.x = point1.x;
        point1.x = x;
      }
      if (point22.y < point1.y) {
        y = point22.y;
        point22.y = point1.y;
        point1.y = y;
      }
      VUtil.requestURL(
        this._layer._url.replace(/\&.*$/g, "") + "&PFL=" + zoom.toString() + ":" + (point1.x - 0.5).toFixed(0) + "," + (point1.y - 0.5).toFixed(0) + "-" + (point22.x - 0.5).toFixed(0) + "," + (point22.y - 0.5).toFixed(0),
        "getting IIP layer profile",
        this._plotProfile,
        this
      );
    },
    _getMeasurementString: function() {
      var currentLatLng = this._currentLatLng, previousLatLng = this._markers[this._markers.length - 1].getLatLng(), distance, distanceStr, unit;
      distance = this._measurementRunningTotal + VUtil.distance(currentLatLng, previousLatLng);
      if (distance >= 1) {
        unit = "&#176;";
      } else {
        distance *= 60;
        if (distance >= 1) {
          unit = "&#39;";
        } else {
          distance *= 60;
          unit = "&#34;";
        }
      }
      distanceStr = distance.toFixed(2) + unit;
      return distanceStr;
    },
    _plotProfile: function(self2, httpRequest) {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          var json = JSON.parse(httpRequest.responseText), rawprof = json.profile, layer = self2._layer, line = self2._profileLine, popdiv = document.getElementById("leaflet-profile-plot"), prof = [], series = [], title, ylabel;
          self2.addLayer(line, "Image profile");
          if (layer.iipMode === "mono") {
            prof.push(self2._extractProfile(layer, rawprof, layer.iipChannel));
            series.push({
              color: "black"
            });
            title = "Image profile for " + layer.iipChannelLabels[layer.iipChannel];
            ylabel = "Pixel value in " + layer.iipChannelUnits[layer.iipChannel];
          } else {
            var rgb3 = layer.iipRGB;
            for (var chan = 0; chan < layer.iipNChannel; chan++) {
              if (rgb3[chan].isOn()) {
                prof.push(self2._extractProfile(layer, rawprof, chan));
                series.push({
                  color: rgb3[chan].toStr(),
                  label: layer.iipChannelLabels[chan]
                });
              }
            }
            title = "Image profiles";
            ylabel = "Pixel value";
          }
          $(document).ready(function() {
            $.jqplot.config.enablePlugins = true;
            $.jqplot("leaflet-profile-plot", prof, {
              title,
              grid: {
                backgroundColor: "#ddd",
                gridLineColor: "#eee"
              },
              axes: {
                xaxis: {
                  label: "position along line",
                  labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                  pad: 1
                },
                yaxis: {
                  label: ylabel,
                  labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
                  pad: 1
                }
              },
              legend: {
                show: layer.iipMode !== "mono",
                location: "ne"
              },
              highlighter: {
                show: true,
                sizeAdjust: 2,
                tooltipLocation: "n",
                tooltipAxes: "y",
                tooltipFormatString: "%.6g " + layer.iipChannelUnits[layer.iipChannel],
                useAxesFormatters: false,
                bringSeriesToFront: true
              },
              cursor: {
                show: true,
                zoom: true
              },
              series,
              seriesDefaults: {
                lineWidth: 2,
                showMarker: false
              }
            });
          });
          popdiv.removeChild(popdiv.childNodes[0]);
          line._popup.update();
        }
      }
    },
    _extractProfile: function(layer, rawprof, chan) {
      var prof = [], nchan = layer.iipNChannel, npix = rawprof.length / nchan;
      for (var i = 0; i < npix; i++) {
        prof.push(rawprof[i * nchan + chan]);
      }
      return prof;
    },
    _plotSpectrum: function(self2, httpRequest) {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          var json = JSON.parse(httpRequest.responseText), rawprof = json.profile, layer = self2._layer, marker2 = self2._spectrumMarker, popdiv = document.getElementById("leaflet-spectrum-plot"), spec = [], series = [], title, ylabel;
          self2.addLayer(marker2, "Image spectrum");
          for (var chan = 0; chan < layer.iipNChannel; chan++) {
            spec.push([
              layer.iipChannelLabels[chan],
              self2._extractAverage(layer, rawprof, chan)
            ]);
          }
          title = "Image Spectrum";
          ylabel = "Average pixel value";
          $(document).ready(function() {
            $.jqplot.config.enablePlugins = true;
            $.jqplot("leaflet-spectrum-plot", [spec], {
              title,
              grid: {
                backgroundColor: "#F0F0F0",
                gridLineColor: "#F8F8F8"
              },
              axes: {
                xaxis: {
                  renderer: $.jqplot.CategoryAxisRenderer,
                  tickRenderer: $.jqplot.CanvasAxisTickRenderer,
                  tickOptions: {
                    angle: -30,
                    fontSize: "6pt"
                  }
                },
                yaxis: {
                  label: ylabel,
                  labelRenderer: $.jqplot.CanvasAxisLabelRenderer
                }
              },
              highlighter: {
                show: true,
                sizeAdjust: 2,
                tooltipLocation: "n",
                tooltipAxes: "y",
                tooltipFormatString: "%.6g " + layer.iipChannelUnits[layer.iipChannel],
                useAxesFormatters: false
              },
              cursor: {
                show: true,
                zoom: true
              },
              seriesDefaults: {
                lineWidth: 2,
                showMarker: false
              }
            });
          });
          popdiv.removeChild(popdiv.childNodes[0]);
          marker2._popup.update();
        }
      }
    },
    _extractAverage: function(layer, rawprof, chan) {
      var nchan = layer.iipNChannel, npix = rawprof.length / nchan, val = 0;
      if (npix === 0) {
        return 0;
      }
      for (var i = 0; i < npix; i++) {
        val += rawprof[i * nchan + chan];
      }
      return val / npix;
    }
  });
  var profileUI = function(options) {
    return new ProfileUI(options);
  };

  // js/control/RegionUI.js
  var import_leaflet32 = __toESM(require_leaflet_src());
  var RegionUI = UI.extend({
    options: {
      title: "Region overlays",
      collapsed: true,
      position: "topleft",
      nativeCelsys: true,
      color: "#00FFFF",
      timeOut: 30
    },
    initialize: function(regions, options) {
      import_leaflet32.Util.setOptions(this, options);
      this._className = "leaflet-control-iip";
      this._id = "leaflet-iipregion";
      this._layers = {};
      this._handlingClick = false;
      this._sideClass = "region";
      this._regions = regions && regions[0] ? regions : [];
    },
    _initDialog: function() {
      var className = this._className, regions = this._regions, box = this._addDialogBox(), line = this._addDialogLine("Regions:", box), elem = this._addDialogElement(line), colpick = this._createColorPicker(
        className + "-color",
        elem,
        "region",
        this.options.color,
        false,
        "iipRegion",
        "Click to set region color"
      );
      var select = this._regionSelect = this._createSelectMenu(
        this._className + "-select",
        elem,
        regions.map(function(o) {
          return o.name;
        }),
        regions.map(function(o) {
          return o.load ? true : false;
        }),
        -1,
        void 0,
        "Select region"
      );
      elem = this._addDialogElement(line);
      this._createButton(
        className + "-button",
        elem,
        "region",
        function() {
          var index2 = select.selectedIndex - 1;
          if (index2 >= 0) {
            var region2 = this._regions[index2];
            region2.color = colpick.value;
            select.selectedIndex = 0;
            select.opt[index2].disabled = true;
            this._getRegion(region2, this.options.timeOut);
          }
        },
        "Display region"
      );
      var region;
      for (var index = 0; index < regions.length; index++) {
        region = regions[index];
        region.index = index;
        if (region.load === true) {
          if (!region.color) {
            region.color = this.options.color;
          }
          this._getRegion(regions[index], this.options.timeOut);
        }
      }
    },
    _resetDialog: function() {
    },
    _getRegion: function(region, timeout) {
      var _this = this, map = this._map, wcs2 = map.options.crs, sysflag = wcs2.forceNativeCelsys && !this.options.nativeCelsys, templayer = new import_leaflet32.LayerGroup(null);
      templayer.notReady = true;
      this.addLayer(templayer, region.name);
      VUtil.requestURL(
        region.url,
        "loading " + region.name + " data",
        function(context, httpRequest) {
          _this._loadRegion(region, templayer, context, httpRequest);
        },
        this,
        this.options.timeOut
      );
    },
    _loadRegion: function(region, templayer, _this, httpRequest) {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          var wcs2 = _this._map.options.crs, response = httpRequest.responseText, geoRegion = (0, import_leaflet32.geoJson)(JSON.parse(response), {
            onEachFeature: function(feature, layer) {
              if (feature.properties && feature.properties.description) {
                layer.bindPopup(feature.properties.description);
              } else if (region.description) {
                layer.bindPopup(region.description);
              }
            },
            coordsToLatLng: function(coords2) {
              if (wcs2.forceNativeCelsys) {
                var latLng10 = wcs2.eqToCelsys(latLng10(coords2[1], coords2[0]));
                return new import_leaflet32.LatLng(latLng10.lat, latLng10.lng, coords2[2]);
              } else {
                return new import_leaflet32.LatLng(coords2[1], coords2[0], coords2[2]);
              }
            },
            style: function(feature) {
              return { color: region.color, weight: 2 };
            },
            pointToLayer: function(feature, latlng) {
              return region.drawPoint ? region.drawPoint(feature, latlng) : (0, import_leaflet32.marker)(latlng);
            }
          });
          geoRegion.nameColor = region.color;
          geoRegion.addTo(_this._map);
          _this.removeLayer(templayer);
          _this.addLayer(geoRegion, region.name, region.index);
          import_leaflet32.DomEvent.on(geoRegion, "trash", function(e) {
            if (e.index || e.index === 0) {
              _this._regionSelect.opt[e.index].disabled = false;
            }
          }, _this);
        } else {
          if (httpRequest.status !== 0) {
            alert("Error " + httpRequest.status + " while downloading " + region.url + ".");
          }
          _this.removeLayer(templayer);
          _this._regionSelect.opt[region.index].disabled = false;
        }
      }
    }
  });
  var regionUI = function(regions, options) {
    return new RegionUI(regions, options);
  };

  // js/control/Reticle.js
  var import_leaflet33 = __toESM(require_leaflet_src());
  var Reticle = import_leaflet33.Control.extend({
    options: {
      position: "bottomleft"
    },
    onAdd: function(map) {
      var reticle2 = this._reticle = import_leaflet33.DomUtil.create("div", "leaflet-reticle", this._map._controlContainer), style = reticle2.style;
      style.position = "absolute";
      style.left = "50%";
      style.bottom = "50%";
      style.textAlign = "center";
      style.verticalAlign = "middle";
      style.pointerEvents = "none";
      reticle2.innerHTML = "";
      var container = this._container = import_leaflet33.DomUtil.create("div", "leaflet-dummy");
      return container;
    },
    onRemove: function(map) {
      this._reticle.parentNode.removeChild(this._reticle);
    }
  });
  var reticle = function(options) {
    return new Reticle(options);
  };

  // js/control/Scale.js
  var import_leaflet34 = __toESM(require_leaflet_src());
  var Scale = import_leaflet34.Control.Scale.extend({
    options: {
      position: "bottomleft",
      title: "Scale",
      maxWidth: 128,
      metric: false,
      imperial: false,
      degrees: true,
      pixels: true,
      custom: false,
      customScale: 1,
      customUnits: "",
      planetRadius: 6378137,
      updateWhenIdle: false
    },
    _addScales: function(options, className, container) {
      if (options.metric) {
        this._mScale = import_leaflet34.DomUtil.create("div", className, container);
        this._mScale.title = options.metricTitle ? options.metricTitle : options.title;
      }
      if (options.imperial) {
        this._iScale = import_leaflet34.DomUtil.create("div", className, container);
        this._iScale.title = options.imperialTitle ? options.imperialTitle : options.title;
      }
      if (options.degrees) {
        this._dScale = import_leaflet34.DomUtil.create("div", className, container);
        this._dScale.title = options.degreesTitle ? options.degreesTitle : options.title;
      }
      if (options.pixels) {
        this._pScale = import_leaflet34.DomUtil.create("div", className, container);
        this._pScale.title = options.pixelsTitle ? options.pixelsTitle : options.title;
      }
      if (options.custom) {
        this._cScale = import_leaflet34.DomUtil.create("div", className, container);
        this._cScale.title = options.customTitle ? options.customTitle : options.title;
      }
      this.angular = options.metric || options.imperial || options.degrees;
    },
    _update: function() {
      var options = this.options, map = this._map, crs = map.options.crs;
      if (options.pixels && crs.options && crs.options.nzoom) {
        var pixelScale = Math.pow(2, crs.options.nzoom - 1 - map.getZoom());
        this._updatePixels(pixelScale * options.maxWidth);
      }
      if (options.custom && crs.options && crs.options.nzoom) {
        var customScale = Math.pow(
          2,
          crs.options.nzoom - 1 - map.getZoom()
        ) * options.customScale;
        this._updateCustom(customScale * options.maxWidth, options.customUnits);
      }
      if (this.angular) {
        var center = map.getCenter(), cosLat = Math.cos(center.lat * Math.PI / 180), dist = Math.sqrt(this._jacobian(center)) * cosLat, maxDegrees = dist * options.maxWidth;
        if (options.metric) {
          this._updateMetric(maxDegrees * Math.PI / 180 * options.planetRadius);
        }
        if (options.imperial) {
          this._updateImperial(maxDegrees * Math.PI / 180 * options.planetRadius);
        }
        if (options.degrees) {
          this._updateDegrees(maxDegrees);
        }
      }
    },
    _jacobian: function(latlng) {
      var map = this._map, p0 = map.project(latlng), latlngdx = map.unproject(p0.add([10, 0])), latlngdy = map.unproject(p0.add([0, 10]));
      return 0.01 * Math.abs((latlngdx.lng - latlng.lng) * (latlngdy.lat - latlng.lat) - (latlngdy.lng - latlng.lng) * (latlngdx.lat - latlng.lat));
    },
    _updateCustom: function(maxCust, units) {
      var scale2 = this._cScale;
      if (maxCust > 1e9) {
        var maxGCust = maxCust * 1e-9, gCust = this._getRoundNum(maxGCust);
        this._updateScale(scale2, gCust + " G" + units, gCust / maxGCust);
      } else if (maxCust > 1e6) {
        var maxMCust = maxCust * 1e-6, mCust = this._getRoundNum(maxMCust);
        this._updateScale(scale2, mCust + " M" + units, mCust / maxMCust);
      } else if (maxCust > 1e3) {
        var maxKCust = maxCust * 1e-3, kCust = this._getRoundNum(maxKCust);
        this._updateScale(scale2, kCust + " k" + units, kCust / maxKCust);
      } else {
        var cust = this._getRoundNum(maxCust);
        this._updateScale(scale2, cust + " " + units, cust / maxCust);
      }
    },
    _updatePixels: function(maxPix) {
      var scale2 = this._pScale;
      if (maxPix > 1e6) {
        var maxMPix = maxPix * 1e-6, mPix = this._getRoundNum(maxMPix);
        this._updateScale(scale2, mPix + " Mpx", mPix / maxMPix);
      } else if (maxPix > 1e3) {
        var maxKPix = maxPix * 1e-3, kPix = this._getRoundNum(maxKPix);
        this._updateScale(scale2, kPix + " kpx", kPix / maxKPix);
      } else {
        var pix = this._getRoundNum(maxPix);
        this._updateScale(scale2, pix + " px", pix / maxPix);
      }
    },
    _updateDegrees: function(maxDegrees) {
      var maxSeconds = maxDegrees * 3600, scale2 = this._dScale;
      if (maxSeconds < 1) {
        var maxMas = maxSeconds * 1e3, mas = this._getRoundNum(maxMas);
        this._updateScale(scale2, mas + " mas", mas / maxMas);
      } else if (maxSeconds < 60) {
        var seconds = this._getRoundNum(maxSeconds);
        this._updateScale(scale2, seconds + " &#34;", seconds / maxSeconds);
      } else if (maxSeconds < 3600) {
        var maxMinutes = maxDegrees * 60, minutes = this._getRoundNum(maxMinutes);
        this._updateScale(scale2, minutes + " &#39;", minutes / maxMinutes);
      } else {
        var degrees = this._getRoundNum(maxDegrees);
        this._updateScale(scale2, degrees + " &#176;", degrees / maxDegrees);
      }
    }
  });
  var scale = function(options) {
    return new Scale(options);
  };

  // js/control/Sidebar.js
  var import_leaflet35 = __toESM(require_leaflet_src());
  var Sidebar = import_leaflet35.Control.extend({
    includes: L.Mixin.Events,
    options: {
      position: "left",
      title: "Toggle advanced menu",
      collapsed: true,
      forceSeparateButton: false
    },
    initialize: function(options) {
      var i, child;
      import_leaflet35.Util.setOptions(this, options);
      this._sidebar = import_leaflet35.DomUtil.create("div", "leaflet-container sidebar");
      if (this.options.collapsed) {
        import_leaflet35.DomUtil.addClass(this._sidebar, "collapsed");
      } else {
        import_leaflet35.DomUtil.addClass(this._sidebar, "closed");
      }
      import_leaflet35.DomUtil.addClass(this._sidebar, "sidebar-" + this.options.position);
      if (import_leaflet35.Browser.touch) {
        import_leaflet35.DomUtil.addClass(this._sidebar, "leaflet-touch");
      }
      this._tabs = import_leaflet35.DomUtil.create("div", "sidebar-tabs", this._sidebar);
      this._tabitems = [];
      this._container = import_leaflet35.DomUtil.create("div", "sidebar-content", this._sidebar);
      this._panes = [];
      this._closeButtons = [];
    },
    addTo: function(map) {
      var className = "leaflet-control-zoom-sidebar", parent = map._controlContainer, buttonContainer;
      import_leaflet35.DomUtil.addClass(map._container, "sidebar-map");
      parent.insertBefore(this._sidebar, parent.firstChild);
      import_leaflet35.DomEvent.disableClickPropagation(this._sidebar).disableScrollPropagation(this._sidebar);
      this._map = map;
      if (map.zoomControl && !this.options.forceSeparateButton) {
        buttonContainer = map.zoomControl._container;
      } else {
        buttonContainer = import_leaflet35.DomUtil.create("div", "leaflet-bar");
      }
      this._toggleButton = this._createButton(
        this.options.title,
        className + (this.options.collapsed ? " collapsed" : ""),
        buttonContainer
      );
      return this;
    },
    addTabList: function() {
      this._tablist = import_leaflet35.DomUtil.create("ul", "", this._tabs);
      this._tablist.setAttribute("role", "tablist");
      return this._tablist;
    },
    addTab: function(id, tabClass, title, content, sideClass) {
      var tablist = this._tablist ? this._tablist : this.addTabList(), item = import_leaflet35.DomUtil.create("li", "", tablist), button = import_leaflet35.DomUtil.create("a", tabClass, item);
      item.setAttribute("role", "tab");
      item._sidebar = this;
      button.href = "#" + id;
      button.id = id + "-toggle";
      button.title = title;
      import_leaflet35.DomEvent.on(button, "click", L.DomEvent.preventDefault);
      import_leaflet35.DomEvent.on(button, "click", this._onClick, item);
      item.sideClass = sideClass;
      this._tabitems.push(item);
      var pane = import_leaflet35.DomUtil.create("div", "sidebar-pane", this._container), header = import_leaflet35.DomUtil.create("h1", "sidebar-header", pane);
      header.innerHTML = title;
      var closeButton = import_leaflet35.DomUtil.create("div", "sidebar-close", header);
      this._closeButtons.push(closeButton);
      import_leaflet35.DomEvent.on(closeButton, "click", this._onCloseClick, this);
      pane.id = id;
      pane.sideClass = sideClass;
      pane.appendChild(content);
      this._panes.push(pane);
      return pane;
    },
    removeFrom: function(map) {
      var i, child;
      this._map = null;
      for (i = this._tabitems.length - 1; i >= 0; i--) {
        child = this._tabitems[i];
        import_leaflet35.DomEvent.off(child.querySelector("a"), "click", this._onClick);
      }
      for (i = this._closeButtons.length - 1; i >= 0; i--) {
        child = this._closeButtons[i];
        import_leaflet35.DomEvent.off(child, "click", this._onCloseClick, this);
      }
      return this;
    },
    open: function(id) {
      var i, child;
      for (i = this._panes.length - 1; i >= 0; i--) {
        child = this._panes[i];
        if (child.id === id) {
          import_leaflet35.DomUtil.addClass(child, "active");
          if (child.sideClass) {
            import_leaflet35.DomUtil.addClass(this._sidebar, child.sideClass);
          }
        } else if (import_leaflet35.DomUtil.hasClass(child, "active")) {
          import_leaflet35.DomUtil.removeClass(child, "active");
          if (child.sideClass) {
            import_leaflet35.DomUtil.removeClass(this._sidebar, child.sideClass);
          }
        }
      }
      for (i = this._tabitems.length - 1; i >= 0; i--) {
        child = this._tabitems[i];
        if (child.querySelector("a").hash === "#" + id) {
          import_leaflet35.DomUtil.addClass(child, "active");
        } else if (import_leaflet35.DomUtil.hasClass(child, "active")) {
          import_leaflet35.DomUtil.removeClass(child, "active");
        }
      }
      this.fire("content", { id });
      if (import_leaflet35.DomUtil.hasClass(this._sidebar, "closed")) {
        this.fire("opening");
        import_leaflet35.DomUtil.removeClass(this._sidebar, "closed");
      }
      return this;
    },
    close: function() {
      for (var i = this._tabitems.length - 1; i >= 0; i--) {
        var child = this._tabitems[i];
        if (import_leaflet35.DomUtil.hasClass(child, "active")) {
          import_leaflet35.DomUtil.removeClass(child, "active");
          if (child.sideClass) {
            import_leaflet35.DomUtil.removeClass(this._sidebar, child.sideClass);
          }
        }
      }
      if (!import_leaflet35.DomUtil.hasClass(this._sidebar, "closed")) {
        this.fire("closing");
        import_leaflet35.DomUtil.addClass(this._sidebar, "closed");
      }
      return this;
    },
    toggle: function() {
      this.close();
      if (import_leaflet35.DomUtil.hasClass(this._sidebar, "collapsed")) {
        import_leaflet35.DomUtil.addClass(this._sidebar, "closed");
        this.fire("expanding");
        import_leaflet35.DomUtil.removeClass(this._sidebar, "collapsed");
        import_leaflet35.DomUtil.removeClass(this._toggleButton, "collapsed");
      } else {
        import_leaflet35.DomUtil.removeClass(this._sidebar, "closed");
        this.fire("collapsing");
        import_leaflet35.DomUtil.addClass(this._sidebar, "collapsed");
        import_leaflet35.DomUtil.addClass(this._toggleButton, "collapsed");
      }
    },
    _onClick: function() {
      if (import_leaflet35.DomUtil.hasClass(this, "active")) {
        this._sidebar.close();
      } else if (!import_leaflet35.DomUtil.hasClass(this, "disabled")) {
        this._sidebar.open(this.querySelector("a").hash.slice(1));
      }
    },
    _onCloseClick: function() {
      this.close();
    },
    _createButton: function(title, className, container) {
      var link = import_leaflet35.DomUtil.create("a", className, container);
      link.href = "#";
      link.title = title;
      import_leaflet35.DomEvent.addListener(link, "click", import_leaflet35.DomEvent.stopPropagation).addListener(link, "click", import_leaflet35.DomEvent.preventDefault).addListener(link, "click", this.toggle, this);
      return link;
    }
  });
  var sidebar = function(map, options) {
    return new Sidebar(map, options);
  };

  // js/control/SnapshotUI.js
  var import_leaflet36 = __toESM(require_leaflet_src());
  var SnapshotUI = UI.extend({
    options: {
      title: "Field snapshot",
      collapsed: true,
      position: "topleft"
    },
    initialize: function(options) {
      import_leaflet36.Util.setOptions(this, options);
      this._className = "leaflet-control-iip";
      this._id = "leaflet-iipsnapshot";
      this._sideClass = "snapshot";
    },
    _initDialog: function() {
      var _this = this, className = this._className, layer = this._layer, map = this._map;
      var line = this._addDialogLine("Snap:", this._dialog), elem = this._addDialogElement(line), items = ["Screen pixels", "Native pixels"];
      this._snapType = 0;
      this._snapSelect = this._createSelectMenu(
        this._className + "-select",
        elem,
        items,
        void 0,
        this._snapType,
        function() {
          this._snapType = parseInt(this._snapSelect.selectedIndex - 1, 10);
        },
        "Select snapshot resolution"
      );
      var hiddenlink = document.createElement("a"), button = this._createButton(
        className + "-button",
        elem,
        "snapshot",
        function(event) {
          var latlng = map.getCenter(), bounds3 = map.getPixelBounds(), z = map.getZoom(), zfac;
          if (z > layer.iipMaxZoom) {
            zfac = Math.pow(2, z - layer.iipMaxZoom);
            z = layer.iipMaxZoom;
          } else {
            zfac = 1;
          }
          var sizex = layer.iipImageSize[z].x * zfac, sizey = layer.iipImageSize[z].y * zfac, dx = bounds3.max.x - bounds3.min.x, dy = bounds3.max.y - bounds3.min.y;
          hiddenlink.href = layer.getTileUrl(
            { x: 1, y: 1 }
          ).replace(
            /JTL\=\d+\,\d+/g,
            "RGN=" + bounds3.min.x / sizex + "," + bounds3.min.y / sizey + "," + dx / sizex + "," + dy / sizey + "&WID=" + (this._snapType === 0 ? Math.floor(dx / zfac) : Math.floor(dx / zfac / layer.wcs.scale(z))) + "&CVT=jpeg"
          );
          hiddenlink.download = layer._title + "_" + VUtil.latLngToHMSDMS(latlng).replace(/[\s\:\.]/g, "") + ".jpg";
          hiddenlink.click();
        },
        "Take a snapshot of the displayed image"
      );
      document.body.appendChild(hiddenlink);
      line = this._addDialogLine("Print:", this._dialog);
      elem = this._addDialogElement(line);
      button = this._createButton(
        className + "-button",
        elem,
        "print",
        function(event) {
          var control2 = document.querySelector("#map > .leaflet-control-container");
          control2.style.display = "none";
          window.print();
          control2.style.display = "unset";
        },
        "Print current map"
      );
    }
  });
  var snapshotUI = function(options) {
    return new SnapshotUI(options);
  };

  // js/crs/index.js
  var crs_exports = {};
  __export(crs_exports, {
    CAR: () => CAR,
    CEA: () => CEA,
    COE: () => COE,
    Pixel: () => Pixel,
    TAN: () => TAN,
    WCS: () => WCS,
    ZEA: () => ZEA,
    wcs: () => wcs
  });

  // js/crs/WCS.js
  var import_leaflet42 = __toESM(require_leaflet_src());

  // js/crs/Conical.js
  var import_leaflet38 = __toESM(require_leaflet_src());

  // js/crs/Projection.js
  var import_leaflet37 = __toESM(require_leaflet_src());
  var Projection = import_leaflet37.Class.extend({
    bounds: (0, import_leaflet37.bounds)([-0.5, -0.5], [0.5, 0.5]),
    project: function(latlng) {
      var phiTheta = this._raDecToPhiTheta(this.celsysflag ? this.eqToCelsys(latlng) : latlng);
      phiTheta.lat = this._thetaToR(phiTheta.lat);
      return this._redToPix(this._phiRToRed(phiTheta));
    },
    unproject: function(point7) {
      var phiTheta = this._redToPhiR(this._pixToRed(point7));
      phiTheta.lat = this._rToTheta(phiTheta.lat);
      var latlng = this._phiThetaToRADec(phiTheta);
      if (latlng.lng < -180) {
        latlng.lng += 360;
      }
      return this.celsysflag ? this.celsysToEq(latlng) : latlng;
    },
    _natpole: function() {
      var deg = Math.PI / 180, projparam = this.projparam, natpole = new import_leaflet37.LatLng(90, 180);
      if (projparam.natrval.lat === 90) {
        if (projparam.natpole.lng === 999) {
          natpole.lng = 180;
        }
        natpole.lat = projparam.crval.lat;
      } else if (projparam.natpole.lng === 999) {
        natpole.lng = projparam.crval.lat < projparam.natrval.lat ? 180 : 0;
      }
      return natpole;
    },
    _cpole: function() {
      var deg = Math.PI / 180, projparam = this.projparam, dphip = projparam.natpole.lng - projparam.natrval.lng, cdphip = Math.cos(dphip * deg), sdphip = Math.sin(dphip * deg), ct0 = Math.cos(projparam.natrval.lat * deg), st0 = Math.sin(projparam.natrval.lat * deg), cd0 = Math.cos(projparam.crval.lat * deg), sd0 = Math.sin(projparam.crval.lat * deg), deltap = Math.atan2(st0, ct0 * cdphip) / deg, ddeltap = Math.acos(sd0 / Math.sqrt(1 - ct0 * ct0 * sdphip * sdphip)) / deg, deltap1 = deltap + ddeltap, deltap2 = deltap - ddeltap;
      if (deltap1 < -180) {
        deltap1 += 360;
      } else if (deltap1 > 180) {
        deltap1 -= 360;
      }
      if (deltap2 < -180) {
        deltap2 += 360;
      } else if (deltap2 > 180) {
        deltap2 -= 360;
      }
      if (deltap1 > 90) {
        deltap = deltap2;
      } else if (deltap2 < -90) {
        deltap = deltap1;
      } else {
        deltap = Math.abs(deltap1 - projparam.natpole.lat) < Math.abs(deltap2 - projparam.natpole.lat) ? deltap1 : deltap2;
      }
      var alphap = Math.abs(projparam.crval.lat) === 90 ? projparam.crval.lng : deltap === 90 ? projparam.crval.lng + projparam.natpole.lng - projparam.natrval.lng - 180 : deltap === -90 ? projparam.crval.lng - projparam.natpole.lng + projparam.natrval.lng : projparam.crval.lng - Math.atan2(
        sdphip * ct0 / cd0,
        (st0 - Math.sin(deltap * deg) * sd0) / (Math.cos(deltap * deg) * cd0)
      ) / deg;
      return new import_leaflet37.LatLng(deltap, alphap);
    },
    _phiThetaToRADec: function(phiTheta) {
      var projparam = this.projparam, deg = Math.PI / 180, rad = 180 / Math.PI, t = phiTheta.lat * deg, ct = Math.cos(t), st = Math.sin(t), dp = projparam.cpole.lat * deg, cdp = Math.cos(dp), sdp = Math.sin(dp), dphi = (phiTheta.lng - projparam.natpole.lng) * deg, cdphi = Math.cos(dphi), asinarg = st * sdp + ct * cdp * cdphi;
      if (asinarg > 1) {
        asinarg = 1;
      } else if (asinarg < -1) {
        asinarg = -1;
      }
      return new import_leaflet37.LatLng(
        Math.asin(asinarg) * rad,
        projparam.cpole.lng + Math.atan2(
          -ct * Math.sin(dphi),
          st * cdp - ct * sdp * cdphi
        ) * rad
      );
    },
    _raDecToPhiTheta: function(raDec) {
      var projparam = this.projparam, deg = Math.PI / 180, rad = 180 / Math.PI, da = (raDec.lng - projparam.cpole.lng) * deg, cda = Math.cos(da), sda = Math.sin(da), d = raDec.lat * deg, cd = Math.cos(d), sd = Math.sin(d), dp = projparam.cpole.lat * deg, cdp = Math.cos(dp), sdp = Math.sin(dp), asinarg = sd * sdp + cd * cdp * cda, phitheta = new import_leaflet37.LatLng(
        Math.asin(asinarg > 1 ? 1 : asinarg < -1 ? -1 : asinarg) * rad,
        projparam.natpole.lng + Math.atan2(
          -cd * sda,
          sd * cdp - cd * sdp * cda
        ) * rad
      );
      if (phitheta.lng > 180) {
        phitheta.lng -= 360;
      } else if (phitheta.lng < -180) {
        phitheta.lng += 360;
      }
      return phitheta;
    },
    _pixToRed: function(pix) {
      var projparam = this.projparam, cd = projparam.cd, red = pix.subtract(projparam.crpix);
      return new import_leaflet37.Point(
        red.x * cd[0][0] + red.y * cd[0][1],
        red.x * cd[1][0] + red.y * cd[1][1]
      );
    },
    _redToPix: function(red) {
      var projparam = this.projparam, cdinv = projparam.cdinv;
      return new import_leaflet37.Point(
        red.x * cdinv[0][0] + red.y * cdinv[0][1],
        red.x * cdinv[1][0] + red.y * cdinv[1][1]
      ).add(projparam.crpix);
    },
    _invertCD: function(cd) {
      var detinv = 1 / (cd[0][0] * cd[1][1] - cd[0][1] * cd[1][0]);
      return [
        [cd[1][1] * detinv, -cd[0][1] * detinv],
        [-cd[1][0] * detinv, cd[0][0] * detinv]
      ];
    }
  });

  // js/crs/Conical.js
  Conical = Projection.extend({
    _redToPhiR: function(red) {
      var deg = Math.PI / 180, projparam = this.projparam, dy = projparam.y0 - red.y, rTheta = projparam.sthetaA * Math.sqrt(red.x * red.x + dy * dy);
      return (0, import_leaflet38.latLng)(rTheta, Math.atan2(red.x / rTheta, dy / rTheta) / projparam.c / deg);
    },
    _phiRToRed: function(phiR) {
      var deg = Math.PI / 180, p = this.projparam.c * phiR.lng * deg;
      return (0, import_leaflet38.point)(phiR.lat * Math.sin(p), -phiR.lat * Math.cos(p) + this.projparam.y0);
    }
  });
  var COE = Conical.extend({
    _paramInit: function(projparam) {
      var deg = Math.PI / 180;
      this.projparam = projparam;
      projparam.cdinv = this._invertCD(projparam.cd);
      projparam.thetaA = projparam.pv[1][1];
      projparam.eta = projparam.pv[1][2];
      projparam.sthetaA = projparam.thetaA >= 0 ? 1 : -1;
      var theta1 = projparam.thetaA - projparam.eta, theta2 = projparam.thetaA + projparam.eta, s1 = Math.sin(theta1 * deg), s2 = Math.sin(theta2 * deg);
      projparam.gamma = s1 + s2;
      projparam.s1s2p1 = s1 * s2 + 1;
      projparam.c = projparam.gamma / 2;
      projparam.y0 = 2 / projparam.gamma * Math.sqrt(projparam.s1s2p1 - projparam.gamma * Math.sin(projparam.thetaA * deg)) / deg;
      projparam.natrval = (0, import_leaflet38.latLng)(projparam.thetaA, 0);
      projparam.natpole = this._natpole();
      projparam.cpole = this._cpole();
    },
    _rToTheta: function(r) {
      var deg = Math.PI / 180, gamma = this.projparam.gamma, sinarg = this.projparam.s1s2p1 / gamma - gamma * r * r * deg * deg / 4;
      if (sinarg < -1) {
        sinarg = -1;
      } else if (sinarg > 1) {
        sinarg = 1;
      }
      return Math.asin(sinarg) / deg;
    },
    _thetaToR: function(theta) {
      var deg = Math.PI / 180, gamma = this.projparam.gamma;
      return 2 / gamma * Math.sqrt(this.projparam.s1s2p1 - gamma * Math.sin(theta * deg)) / deg;
    }
  });

  // js/crs/Cylindrical.js
  var import_leaflet39 = __toESM(require_leaflet_src());
  Cylindrical = Projection.extend({
    _paramInit: function(projparam) {
      var deg = Math.PI / 180;
      this.projparam = projparam;
      projparam.cdinv = this._invertCD(projparam.cd);
      projparam.lambda = projparam.pv[1][1];
      if (projparam.lambda === 0) {
        projparam.lambda = 1;
      }
      projparam.natrval = (0, import_leaflet39.latLng)(0, 0);
      projparam.natpole = this._natpole();
      projparam.cpole = this._cpole();
    },
    _rToTheta: function(r) {
      return r;
    },
    _thetaToR: function(theta) {
      return theta;
    }
  });
  var CAR = Cylindrical.extend({
    _redToPhiR: function(red) {
      return (0, import_leaflet39.latLng)(red.y, red.x);
    },
    _phiRToRed: function(phiR) {
      return (0, import_leaflet39.point)(phiR.lng, phiR.lat);
    }
  });
  var CEA = Cylindrical.extend({
    _redToPhiR: function(red) {
      var deg = Math.PI / 180, slat = red.y * this.projparam.lambda * deg;
      return (0, import_leaflet39.latLng)(slat > -1 ? slat < 1 ? Math.asin(slat) / deg : 90 : -90, red.x);
    },
    _phiRToRed: function(phiR) {
      var deg = Math.PI / 180;
      return (0, import_leaflet39.point)(
        phiR.lng,
        Math.sin(phiR.lat * deg) / (this.projparam.lambda * deg)
      );
    }
  });

  // js/crs/Zenithal.js
  var import_leaflet40 = __toESM(require_leaflet_src());
  Zenithal = Projection.extend({
    _paramInit: function(projparam) {
      this.projparam = projparam;
      projparam.cdinv = this._invertCD(projparam.cd);
      projparam.natrval = (0, import_leaflet40.latLng)(90, 0);
      projparam.natpole = this._natpole();
      projparam.cpole = this._cpole();
    },
    _redToPhiR: function(red) {
      return (0, import_leaflet40.latLng)(
        Math.sqrt(red.x * red.x + red.y * red.y),
        Math.atan2(red.x, -red.y) * 180 / Math.PI
      );
    },
    _phiRToRed: function(phiR) {
      var deg = Math.PI / 180, p = phiR.lng * deg;
      return new import_leaflet40.Point(phiR.lat * Math.sin(p), -phiR.lat * Math.cos(p));
    }
  });
  var TAN = Zenithal.extend({
    code: "TAN",
    _rToTheta: function(r) {
      return Math.atan2(180, Math.PI * r) * 180 / Math.PI;
    },
    _thetaToR: function(theta) {
      return Math.tan((90 - theta) * Math.PI / 180) * 180 / Math.PI;
    }
  });
  var ZEA = Zenithal.extend({
    code: "ZEA",
    _rToTheta: function(r) {
      var rr = r * Math.PI / 360;
      if (Math.abs(rr) < 1) {
        return 90 - 2 * Math.asin(rr) * 180 / Math.PI;
      } else {
        return 90;
      }
    },
    _thetaToR: function(theta) {
      return Math.sin((90 - theta) * Math.PI / 360) * 360 / Math.PI;
    }
  });

  // js/crs/Pixel.js
  var import_leaflet41 = __toESM(require_leaflet_src());
  var Pixel = Projection.extend({
    code: "PIX",
    _paramInit: function(projparam) {
      this.projparam = projparam;
      projparam.cdinv = this._invertCD(projparam.cd);
      projparam.cpole = projparam.crval;
      this.bounds = (0, import_leaflet41.bounds)([0.5, this.projparam.naxis.y - 0.5], [this.projparam.naxis.x - 0.5, 0.5]);
    },
    project: function(latlng) {
      return (0, import_leaflet41.point)(latlng.lng, latlng.lat);
    },
    unproject: function(point7) {
      return (0, import_leaflet41.latLng)(point7.y, point7.x);
    }
  });

  // js/crs/WCS.js
  WCSObj = (0, import_leaflet42.extend)({}, import_leaflet42.CRS, {
    code: "WCS",
    options: {
      nzoom: 9,
      tileSize: [256, 256],
      nativeCelsys: false
    },
    defaultparam: {
      ctype: { x: "PIXEL", y: "PIXEL" },
      naxis: [256, 256],
      crpix: [129, 129],
      crval: [0, 0],
      cd: [[1, 0], [0, 1]],
      natrval: [90, 0],
      natpole: [90, 999],
      pv: [
        [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ],
        [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0
        ]
      ]
    },
    initialize: function(hdr, options) {
      options = import_leaflet42.Util.setOptions(this, options);
      var defaultparam = this.defaultparam;
      this.tileSize = (0, import_leaflet42.point)(options.tileSize);
      this.nzoom = options.nzoom;
      this.ctype = { x: defaultparam.ctype.x, y: defaultparam.ctype.y };
      this.naxis = (0, import_leaflet42.point)(defaultparam.naxis, true);
      this.projparam = new this._paramInit(defaultparam);
      if (hdr) {
        this._readWCS(hdr);
      }
      this._paramInit(options, this.projparam);
      switch (this.ctype.x.substr(5, 3)) {
        case "ZEA":
          this.projection = new ZEA();
          this.pixelFlag = false;
          this.infinite = true;
          break;
        case "TAN":
          this.projection = new TAN();
          this.pixelFlag = false;
          this.infinite = true;
          break;
        case "CAR":
          this.projection = new CAR();
          this.pixelFlag = false;
          this.infinite = true;
          break;
        case "CEA":
          this.projection = new CEA();
          this.pixelFlag = false;
          this.infinite = true;
          break;
        case "COE":
          this.projection = new COE();
          this.pixelFlag = false;
          this.infinite = true;
          break;
        default:
          this.projection = new Pixel();
          this.pixelFlag = true;
          this.infinite = false;
          if (!this.options.crval) {
            this.projparam.crval = (0, import_leaflet42.latLng)(
              (this.naxis.y + 1) / 2,
              (this.naxis.x + 1) / 2
            );
          }
          this.wrapLng = [0.5, this.naxis.x - 0.5];
          this.wrapLat = [this.naxis.y - 0.5, 0.5];
          break;
      }
      if (!this.pixelFlag) {
        switch (this.ctype.x.substr(0, 1)) {
          case "G":
            this.celsyscode = "galactic";
            break;
          case "E":
            this.celsyscode = "ecliptic";
            break;
          case "S":
            this.celsyscode = "supergalactic";
            break;
          default:
            this.celsyscode = "equatorial";
            break;
        }
        if (this.celsyscode !== "equatorial") {
          this.projparam.celsysmat = this._celsysmatInit(this.celsyscode);
          this.projection.celsysToEq = this.celsysToEq;
          this.projection.eqToCelsys = this.eqToCelsys;
          this.forceNativeCelsys = this.options.nativeCelsys === true;
          this.projection.celsysflag = !this.forceNativeCelsys;
        }
      }
      this.transformation = new import_leaflet42.Transformation(1, -0.5, -1, this.naxis.y + 0.5);
      this.projection._paramInit(this.projparam);
      this.code += ":" + this.projection.code;
    },
    celsysToEq: function(latlng) {
      var cmat = this.projparam.celsysmat, deg = Math.PI / 180, invdeg = 180 / Math.PI, a2 = latlng.lng * deg - cmat[1], d2 = latlng.lat * deg, sd2 = Math.sin(d2), cd2cp = Math.cos(d2) * cmat[2], sd = sd2 * cmat[3] - cd2cp * Math.cos(a2);
      return (0, import_leaflet42.latLng)(
        Math.asin(sd) * invdeg,
        ((Math.atan2(cd2cp * Math.sin(a2), sd2 - sd * cmat[3]) + cmat[0]) * invdeg + 360) % 360
      );
    },
    eqToCelsys: function(latlng) {
      var cmat = this.projparam.celsysmat, deg = Math.PI / 180, invdeg = 180 / Math.PI, a = latlng.lng * deg - cmat[0], sd = Math.sin(latlng.lat * deg), cdcp = Math.cos(latlng.lat * deg) * cmat[2], sd2 = sd * cmat[3] + cdcp * Math.cos(a);
      return (0, import_leaflet42.latLng)(
        Math.asin(sd2) * invdeg,
        ((Math.atan2(cdcp * Math.sin(a), sd2 * cmat[3] - sd) + cmat[1]) * invdeg + 360) % 360
      );
    },
    scale: function(zoom) {
      return Math.pow(2, zoom - this.nzoom + 1);
    },
    zoom: function(scale2) {
      return Math.log(scale2) / Math.LN2 + this.nzoom - 1;
    },
    rawPixelScale: function(latlng) {
      var p0 = this.projection.project(latlng), latlngdx = this.projection.unproject(p0.add([10, 0])), latlngdy = this.projection.unproject(p0.add([0, 10])), dlngdx = latlngdx.lng - latlng.lng, dlngdy = latlngdy.lng - latlng.lng;
      if (dlngdx > 180) {
        dlngdx -= 360;
      } else if (dlngdx < -180) {
        dlngdx += 360;
      }
      if (dlngdy > 180) {
        dlngdy -= 360;
      } else if (dlngdy < -180) {
        dlngdy += 360;
      }
      return 0.1 * Math.sqrt(Math.abs(dlngdx * (latlngdy.lat - latlng.lat) - dlngdy * (latlngdx.lat - latlng.lat)) * Math.cos(latlng.lat * Math.PI / 180));
    },
    pixelScale: function(zoom, latlng) {
      return this.rawPixelScale(latlng) / this.scale(zoom);
    },
    fovToZoom: function(map, fov, latlng) {
      var scale2 = this.rawPixelScale(latlng), size = map.getSize();
      if (fov < scale2) {
        fov = scale2;
      }
      scale2 *= Math.sqrt(size.x * size.x + size.y * size.y);
      return fov > 0 ? this.zoom(scale2 / fov) : this.nzoom - 1;
    },
    zoomToFov: function(map, zoom, latlng) {
      var size = map.getSize(), scale2 = this.rawPixelScale(latlng) * Math.sqrt(size.x * size.x + size.y * size.y), zscale = this.scale(zoom);
      return zscale > 0 ? scale2 / zscale : scale2;
    },
    distance: function(latlng1, latlng2) {
      var rad = Math.PI / 180, lat1 = latlng1.lat * rad, lat2 = latlng2.lat * rad, a = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos((latlng2.lng - latlng1.lng) * rad);
      return 180 / Math.PI * Math.acos(Math.min(a, 1));
    },
    parseCoords: function(str) {
      var result, latlng;
      latlng = VUtil.hmsDMSToLatLng(str);
      if (typeof latlng === "undefined") {
        result = /(?:%J\s|^)([-+]?\d+\.?\d*)\s*[,\s]+\s*([-+]?\d+\.?\d*)/g.exec(str);
        if (result && result.length >= 3) {
          latlng = (0, import_leaflet42.latLng)(Number(result[2]), Number(result[1]));
        }
      }
      if (latlng) {
        if (this.forceNativeCelsys) {
          latlng = this.eqToCelsys(latlng);
        }
        return latlng;
      } else {
        return void 0;
      }
    },
    _paramInit: function(newparam, param) {
      if (!param) {
        param = this;
      }
      if (newparam.naxis) {
        param.naxis = (0, import_leaflet42.point)(newparam.naxis);
      }
      if (newparam.crval) {
        param.crval = param.cpole = (0, import_leaflet42.latLng)(newparam.crval);
      }
      if (newparam.crpix) {
        param.crpix = (0, import_leaflet42.point)(newparam.crpix);
      }
      if (newparam.cd) {
        param.cd = [
          [newparam.cd[0][0], newparam.cd[0][1]],
          [newparam.cd[1][0], newparam.cd[1][1]]
        ];
      }
      if (newparam.natrval) {
        param.natrval = (0, import_leaflet42.latLng)(newparam.natrval);
      }
      if (newparam.natpole) {
        param.natpole = (0, import_leaflet42.latLng)(newparam.natpole);
      }
      if (newparam.pv) {
        param.pv = [];
        param.pv[0] = newparam.pv[0].slice();
        param.pv[1] = newparam.pv[1].slice();
      }
    },
    _celsysmatInit: function(celcode) {
      var deg = Math.PI / 180, corig, cpole, cmat = [];
      switch (celcode) {
        case "galactic":
          corig = (0, import_leaflet42.latLng)(-28.93617242, 266.40499625);
          cpole = (0, import_leaflet42.latLng)(27.1282512, 192.85948123);
          break;
        case "ecliptic":
          corig = (0, import_leaflet42.latLng)(0, 0);
          cpole = (0, import_leaflet42.latLng)(66.99111111, 273.85261111);
          break;
        case "supergalactic":
          corig = (0, import_leaflet42.latLng)(59.52315, 42.29235);
          cpole = (0, import_leaflet42.latLng)(15.7048, 283.7514);
          break;
        default:
          corig = (0, import_leaflet42.latLng)(0, 0);
          cpole = (0, import_leaflet42.latLng)(0, 0);
          break;
      }
      cmat[0] = cpole.lng * deg;
      cmat[1] = Math.asin(Math.cos(corig.lat * deg) * Math.sin((cpole.lng - corig.lng) * deg));
      cmat[2] = Math.cos(cpole.lat * deg);
      cmat[3] = Math.sin(cpole.lat * deg);
      return cmat;
    },
    _readWCS: function(hdr) {
      var key = VUtil.readFITSKey, projparam = this.projparam, v;
      if (v = key("CTYPE1", hdr)) {
        this.ctype.x = v;
      }
      if (v = key("CTYPE2", hdr)) {
        this.ctype.y = v;
      }
      if (v = key("NAXIS1", hdr)) {
        projparam.naxis.x = this.naxis.x = parseInt(v, 10);
      }
      if (v = key("NAXIS2", hdr)) {
        projparam.naxis.y = this.naxis.y = parseInt(v, 10);
      }
      if (v = key("CRPIX1", hdr)) {
        projparam.crpix.x = parseFloat(v, 10);
      }
      if (v = key("CRPIX2", hdr)) {
        projparam.crpix.y = parseFloat(v, 10);
      }
      if (v = key("CRVAL1", hdr)) {
        projparam.crval.lng = parseFloat(v, 10);
      }
      if (v = key("CRVAL2", hdr)) {
        projparam.crval.lat = parseFloat(v, 10);
      }
      if (v = key("LONPOLE", hdr)) {
        projparam.natpole.lng = parseFloat(v, 10);
      }
      if (v = key("LATPOLE", hdr)) {
        projparam.natpol.lat = parseFloat(v, 10);
      }
      if (v = key("CD1_1", hdr)) {
        projparam.cd[0][0] = parseFloat(v, 10);
      }
      if (v = key("CD1_2", hdr)) {
        projparam.cd[0][1] = parseFloat(v, 10);
      }
      if (v = key("CD2_1", hdr)) {
        projparam.cd[1][0] = parseFloat(v, 10);
      }
      if (v = key("CD2_2", hdr)) {
        projparam.cd[1][1] = parseFloat(v, 10);
      }
      for (var d = 0; d < 2; d++) {
        for (var j = 0; j < 20; j++) {
          if (v = key("PV" + (d + 1) + "_" + j, hdr)) {
            projparam.pv[d][j] = parseFloat(v, 10);
          }
        }
      }
    },
    _deltaLng: function(latLng10, latLng0) {
      var dlng = latLng10.lng - latLng0.lng;
      return dlng > 180 ? dlng - 360 : dlng < -180 ? dlng + 360 : dlng;
    }
  });
  var WCS = import_leaflet42.Class.extend(WCSObj);
  var wcs = function(options) {
    return new WCS(options);
  };

  // js/layer/index.js
  var layer_exports = {};
  __export(layer_exports, {
    VTileLayer: () => VTileLayer,
    vTileLayer: () => vTileLayer
  });

  // js/layer/VTileLayer.js
  var import_leaflet43 = __toESM(require_leaflet_src());
  var VTileLayer = import_leaflet43.TileLayer.extend({
    options: {
      title: "",
      crs: null,
      nativeCelsys: false,
      center: false,
      fov: false,
      minZoom: 0,
      maxZoom: null,
      maxNativeZoom: 18,
      noWrap: true,
      contrast: 1,
      colorSat: 1,
      gamma: 1,
      cMap: "grey",
      invertCMap: false,
      quality: 90,
      mixingMode: "color",
      channelColors: [],
      channelLabels: [],
      channelLabelMatch: ".*",
      channelUnits: [],
      minMaxValues: [],
      defaultChannel: 0,
      credentials: false,
      sesameURL: "https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame"
    },
    iipdefault: {
      contrast: 1,
      gamma: 1,
      cMap: "grey",
      invertCMap: false,
      minValue: [],
      maxValue: [],
      channelColors: [
        [""],
        ["#FFFFFF"],
        ["#00BAFF", "#FFBA00"],
        ["#0000FF", "#00FF00", "#FF0000"],
        ["#0000E0", "#00BA88", "#88BA00", "#E00000"],
        ["#0000CA", "#007BA8", "#00CA00", "#A87B00", "#CA0000"],
        ["#0000BA", "#00719B", "#009B71", "#719B00", "#9B7100", "#BA0000"]
      ],
      quality: 90
    },
    initialize: function(url, options) {
      this.type = "tilelayer";
      this._url = url.replace(/\&.*$/g, "");
      options = import_leaflet43.Util.setOptions(this, options);
      if (options.detectRetina && L.Browser.retina && options.maxZoom > 0) {
        options.tileSize = Math.floor(options.tileSize / 2);
        options.zoomOffset++;
        options.minZoom = Math.max(0, options.minZoom);
        options.maxZoom--;
      }
      if (typeof options.subdomains === "string") {
        options.subdomains = options.subdomains.split("");
      }
      this.iipTileSize = { x: 256, y: 256 };
      this.iipImageSize = [];
      this.iipImageSize[0] = this.iipTileSize;
      this.iipGridSize = [];
      this.iipGridSize[0] = { x: 1, y: 1 };
      this.iipBPP = 8;
      this.iipMode = options.mixingMode;
      this.iipChannel = 0;
      this.iipNChannel = 1;
      this.iipMinZoom = options.minZoom;
      this.iipMaxZoom = options.maxZoom;
      this.iipContrast = options.contrast;
      this.iipColorSat = options.colorSat;
      this.iipGamma = options.gamma;
      this.iipCMap = options.cMap;
      this.iipInvertCMap = options.invertCMap;
      this.iipMinValue = [];
      this.iipMinValue[0] = 0;
      this.iipMaxValue = [];
      this.iipMaxValue[0] = 255;
      this.iipMix = [[]];
      this.iipRGB = [];
      this.iipChannelLabels = [];
      this.iipChannelFlags = [];
      this.iipChannelUnits = [];
      this.iipQuality = options.quality;
      this._title = options.title.length > 0 ? options.title : this._url.match(/^.*\/(.*)\..*$/)[1];
      this.getIIPMetaData(this._url);
      if (!import_leaflet43.Browser.android) {
        this.on("tileunload", this._onTileRemove);
      }
      return this;
    },
    getIIPMetaData: function(url) {
      VUtil.requestURL(
        url + "&obj=IIP,1.0&obj=max-size&obj=tile-size&obj=resolution-number&obj=bits-per-channel&obj=min-max-sample-values&obj=subject",
        "getting IIP metadata",
        this._parseIIPMetadata,
        this
      );
    },
    _parseIIPMetadata: function(layer, httpRequest) {
      if (httpRequest.readyState === 4) {
        if (httpRequest.status === 200) {
          var response = httpRequest.responseText, matches = layer._readIIPKey(response, "IIP", VUtil.REG_PDEC);
          if (!matches) {
            alert("Error: Unexpected response from IIP server " + layer._url.replace(/\?.*$/g, ""));
          }
          var options = layer.options, iipdefault = layer.iipdefault;
          matches = layer._readIIPKey(response, "Max-size", "(\\d+)\\s+(\\d+)");
          var maxsize = {
            x: parseInt(matches[1], 10),
            y: parseInt(matches[2], 10)
          };
          matches = layer._readIIPKey(response, "Tile-size", "(\\d+)\\s+(\\d+)");
          layer.iipTileSize = {
            x: parseInt(matches[1], 10),
            y: parseInt(matches[2], 10)
          };
          options.tileSize = layer.iipTileSize.x;
          matches = layer._readIIPKey(response, "Resolution-number", "(\\d+)");
          layer.iipMaxZoom = parseInt(matches[1], 10) - 1;
          if (layer.iipMinZoom > options.minZoom) {
            options.minZoom = layer.iipMinZoom;
          }
          if (!options.maxZoom) {
            options.maxZoom = layer.iipMaxZoom + 6;
          }
          options.maxNativeZoom = layer.iipMaxZoom;
          for (var z = 0; z <= layer.iipMaxZoom; z++) {
            layer.iipImageSize[z] = {
              x: Math.floor(maxsize.x / Math.pow(2, layer.iipMaxZoom - z)),
              y: Math.floor(maxsize.y / Math.pow(2, layer.iipMaxZoom - z))
            };
            layer.iipGridSize[z] = {
              x: Math.ceil(layer.iipImageSize[z].x / layer.iipTileSize.x),
              y: Math.ceil(layer.iipImageSize[z].y / layer.iipTileSize.y)
            };
          }
          for (z = layer.iipMaxZoom; z <= options.maxZoom; z++) {
            layer.iipGridSize[z] = layer.iipGridSize[layer.iipMaxZoom];
          }
          matches = layer._readIIPKey(response, "Bits-per-channel", "(\\d+)");
          layer.iipBPP = parseInt(matches[1], 10);
          if (layer.iipGamma === layer.iipdefault.gamma) {
            layer.iipGamma = layer.iipBPP >= 32 ? 2.2 : 1;
          }
          matches = layer._readIIPKey(
            response,
            "Min-Max-sample-values",
            "\\s*(.*)"
          );
          var str = matches[1].split(/\s+/), nchannel = layer.iipNChannel = str.length / 2, mmc = 0;
          for (var c = 0; c < nchannel; c++) {
            iipdefault.minValue[c] = parseFloat(str[mmc++]);
            iipdefault.maxValue[c] = parseFloat(str[mmc++]);
          }
          var minmax = options.minMaxValues;
          if (minmax.length) {
            for (c = 0; c < nchannel; c++) {
              if (minmax[c] !== void 0 && minmax[c].length) {
                layer.iipMinValue[c] = minmax[c][0];
                layer.iipMaxValue[c] = minmax[c][1];
              } else {
                layer.iipMinValue[c] = iipdefault.minValue[c];
                layer.iipMaxValue[c] = iipdefault.maxValue[c];
              }
            }
          } else {
            for (c = 0; c < nchannel; c++) {
              layer.iipMinValue[c] = iipdefault.minValue[c];
              layer.iipMaxValue[c] = iipdefault.maxValue[c];
            }
          }
          layer.iipChannel = options.defaultChannel;
          var inlabels = options.channelLabels, ninlabel = inlabels.length, labels = layer.iipChannelLabels, inunits = options.channelUnits, ninunits = inunits.length, units = layer.iipChannelUnits, key = VUtil.readFITSKey, numstr, value;
          for (c = 0; c < nchannel; c++) {
            if (c < ninlabel) {
              labels[c] = inlabels[c];
            } else {
              numstr = (c + 1).toString();
              value = key(
                "CHAN" + (c < 9 ? "000" : c < 99 ? "00" : c < 999 ? "0" : "") + numstr,
                response
              );
              labels[c] = value ? value : "Channel #" + numstr;
            }
          }
          for (c = 0; c < ninunits; c++) {
            units[c] = inunits[c];
          }
          for (c = ninunits; c < nchannel; c++) {
            units[c] = "ADUs";
          }
          var cc = 0, mix = layer.iipMix, omix = options.channelColors, rgb3 = layer.iipRGB, re = new RegExp(options.channelLabelMatch), nchanon = 0, channelflags = layer.iipChannelFlags;
          nchanon = 0;
          for (c = 0; c < nchannel; c++) {
            channelflags[c] = re.test(labels[c]);
            if (channelflags[c]) {
              nchanon++;
            }
          }
          if (nchanon >= iipdefault.channelColors.length) {
            nchanon = iipdefault.channelColors.length - 1;
          }
          for (c = 0; c < nchannel; c++) {
            mix[c] = [];
            var col = 3;
            if (omix.length && omix[c] && omix[c].length === 3) {
              rgb3[c] = rgb2(omix[c][0], omix[c][1], omix[c][2]);
            } else {
              rgb3[c] = rgb2(0, 0, 0);
            }
            if (omix.length === 0 && channelflags[c] && cc < nchanon) {
              rgb3[c] = rgb2(iipdefault.channelColors[nchanon][cc++]);
            }
            layer.rgbToMix(c);
          }
          if (options.bounds) {
            options.bounds = (0, import_leaflet43.latLngBounds)(options.bounds);
          }
          layer.wcs = options.crs ? options.crs : wcs(response, {
            nativeCelsys: layer.options.nativeCelsys,
            nzoom: layer.iipMaxZoom + 1,
            tileSize: layer.iipTileSize
          });
          layer.iipMetaReady = true;
          layer.fire("metaload");
        } else {
          alert("There was a problem with the IIP metadata request.");
        }
      }
    },
    rgbToMix: function(chan, rgb3) {
      if (rgb3) {
        this.iipRGB[chan] = rgb3.clone();
      } else {
        rgb3 = this.iipRGB[chan];
      }
      var cr = this._gammaCorr(rgb3.r), cg = this._gammaCorr(rgb3.g), cb = this._gammaCorr(rgb3.b), lum = (cr + cg + cb) / 3, alpha = this.iipColorSat / 3;
      this.iipMix[chan][0] = lum + alpha * (2 * cr - cg - cb);
      this.iipMix[chan][1] = lum + alpha * (2 * cg - cr - cb);
      this.iipMix[chan][2] = lum + alpha * (2 * cb - cr - cg);
      return;
    },
    updateMono: function() {
      this.iipMode = "mono";
    },
    updateMix: function() {
      var nchannel = this.iipNChannel;
      this.iipMode = "color";
      for (var c = 0; c < nchannel; c++) {
        this.rgbToMix(c, this.iipRGB[c]);
      }
    },
    _gammaCorr: function(val) {
      return val > 0 ? Math.pow(val, this.iipGamma) : 0;
    },
    _readIIPKey: function(str, keyword, regexp) {
      var reg = new RegExp(keyword + ":" + regexp);
      return reg.exec(str);
    },
    addTo: function(map) {
      if (this.iipMetaReady) {
        this._addToMap(map);
      } else {
        this.once("metaload", function() {
          this._addToMap(map);
        }, this);
      }
      return this;
    },
    _addToMap: function(map) {
      var zoom, newcrs = this.wcs, curcrs = map.options.crs, prevcrs = map._prevcrs, maploadedflag = map._loaded, center;
      if (maploadedflag) {
        curcrs._prevLatLng = map.getCenter();
        curcrs._prevZoom = map.getZoom();
      }
      map._prevcrs = map.options.crs = newcrs;
      import_leaflet43.TileLayer.prototype.addTo.call(this, map);
      if (prevcrs && newcrs !== curcrs && maploadedflag && newcrs.pixelFlag === curcrs.pixelFlag) {
        center = curcrs._prevLatLng;
        zoom = curcrs._prevZoom;
        var prevpixscale = prevcrs.pixelScale(zoom, center), newpixscale = newcrs.pixelScale(zoom, center);
        if (prevpixscale > 1e-20 && newpixscale > 1e-20) {
          zoom += Math.round(Math.LOG2E * Math.log(newpixscale / prevpixscale));
        }
      } else if (newcrs._prevLatLng) {
        center = newcrs._prevLatLng;
        zoom = newcrs._prevZoom;
      } else if (this.options.center) {
        var latlng = typeof this.options.center === "string" ? newcrs.parseCoords(decodeURI(this.options.center)) : this.options.center;
        if (latlng) {
          if (this.options.fov) {
            zoom = newcrs.fovToZoom(map, this.options.fov, latlng);
          }
          map.setView(latlng, zoom, { reset: true, animate: false });
        } else {
          VUtil.requestURL(
            this.options.sesameURL + "/-oI/A?" + this.options.center,
            "getting coordinates for " + this.options.center,
            function(_this, httpRequest) {
              if (httpRequest.readyState === 4) {
                if (httpRequest.status === 200) {
                  var str = httpRequest.responseText, latlng2 = newcrs.parseCoords(str);
                  if (latlng2) {
                    if (_this.options.fov) {
                      zoom = newcrs.fovToZoom(map, _this.options.fov, latlng2);
                    }
                    map.setView(latlng2, zoom, { reset: true, animate: false });
                  } else {
                    map.setView(newcrs.projparam.crval, zoom, { reset: true, animate: false });
                    alert(str + ": Unknown location");
                  }
                } else {
                  map.setView(newcrs.projparam.crval, zoom, { reset: true, animate: false });
                  alert("There was a problem with the request to the Sesame service at CDS");
                }
              }
            },
            this,
            10
          );
        }
      } else {
        map.setView(newcrs.projparam.crval, zoom, { reset: true, animate: false });
      }
    },
    _isValidTile: function(coords2) {
      var crs = this._map.options.crs;
      if (!crs.infinite) {
        var bounds3 = this._globalTileRange;
        if (!crs.wrapLng && (coords2.x < bounds3.min.x || coords2.x > bounds3.max.x) || !crs.wrapLat && (coords2.y < bounds3.min.y || coords2.y > bounds3.max.y)) {
          return false;
        }
      }
      var z = this._getZoomForUrl(), wcoords = coords2.clone();
      this._wrapCoords(wcoords);
      if (wcoords.x < 0 || wcoords.x >= this.iipGridSize[z].x || wcoords.y < 0 || wcoords.y >= this.iipGridSize[z].y) {
        return false;
      }
      if (!this.options.bounds) {
        return true;
      }
      var tileBounds = this._tileCoordsToBounds(coords2);
      return (0, import_leaflet43.latLngBounds)(this.options.bounds).intersects(tileBounds);
    },
    createTile: function(coords2, done) {
      var tile = import_leaflet43.TileLayer.prototype.createTile.call(this, coords2, done);
      tile.coords = coords2;
      return tile;
    },
    getTileUrl: function(coords2) {
      var str = this._url, z = this._getZoomForUrl();
      if (this.iipCMap !== this.iipdefault.cMap) {
        str += "&CMP=" + this.iipCMap;
      }
      if (this.iipInvertCMap !== this.iipdefault.invertCMap) {
        str += "&INV";
      }
      if (this.iipContrast !== this.iipdefault.contrast) {
        str += "&CNT=" + this.iipContrast.toString();
      }
      if (this.iipGamma !== this.iipdefault.gamma) {
        str += "&GAM=" + (1 / this.iipGamma).toFixed(4);
      }
      for (var c = 0; c < this.iipNChannel; c++) {
        if (this.iipMinValue[c] !== this.iipdefault.minValue[c] || this.iipMaxValue[c] !== this.iipdefault.maxValue[c]) {
          str += "&MINMAX=" + (c + 1).toString() + ":" + this.iipMinValue[c].toString() + "," + this.iipMaxValue[c].toString();
        }
      }
      var nchannel = this.iipNChannel, mix = this.iipMix, m, n;
      str += "&CTW=";
      if (this.iipMode === "color") {
        for (n = 0; n < 3; n++) {
          if (n) {
            str += ";";
          }
          str += mix[0][n].toString();
          for (m = 1; m < nchannel; m++) {
            if (mix[m][n] !== void 0) {
              str += "," + mix[m][n].toString();
            }
          }
        }
      } else {
        var cc = this.iipChannel;
        if (cc >= nchannel) {
          cc = 0;
        }
        if (cc < nchannel) {
          nchannel = cc + 1;
        }
        for (n = 0; n < 3; n++) {
          if (n) {
            str += ";";
          }
          str += cc === 0 ? "1" : "0";
          for (m = 1; m < nchannel; m++) {
            str += "," + (cc === m ? "1" : "0");
          }
        }
      }
      if (this.iipQuality !== this.iipdefault.quality) {
        str += "&QLT=" + this.iipQuality.toString();
      }
      return str + "&JTL=" + z.toString() + "," + (coords2.x + this.iipGridSize[z].x * coords2.y).toString();
    },
    _initTile: function(tile) {
      import_leaflet43.DomUtil.addClass(tile, "leaflet-tile");
      if (this.options.maxNativeZoom && this._tileZoom >= this.options.maxNativeZoom) {
        tile.style.imageRendering = "pixelated";
      }
      tile.onselectstart = import_leaflet43.Util.falseFn;
      tile.onmousemove = import_leaflet43.Util.falseFn;
      if (import_leaflet43.Browser.ielt9 && this.options.opacity < 1) {
        import_leaflet43.DomUtil.setOpacity(tile, this.options.opacity);
      }
      if (import_leaflet43.Browser.android && !import_leaflet43.Browser.android23) {
        tile.style.WebkitBackfaceVisibility = "hidden";
      }
    }
  });
  var vTileLayer = function(url, options) {
    return new VTileLayer(url, options);
  };

  // js/VisiomaticGlobal.js
  function getGlobalObject() {
    if (typeof globalThis !== "undefined") {
      return globalThis;
      if (typeof self !== "undefined") {
        return self;
      }
      if (typeof window !== "undefined") {
        return window;
      }
    }
    if (typeof global !== "undefined") {
      return global;
    }
    throw new Error("Unable to locate global object.");
  }
  var globalObject = getGlobalObject();
  globalObject.V = Visiomatic_exports;
})();
/* @preserve
 * Leaflet 1.9.3, a JS library for interactive maps. https://leafletjs.com
 * (c) 2010-2022 Vladimir Agafonkin, (c) 2010-2011 CloudMade
 */
/*!
 * jQuery JavaScript Library v2.1.4
 * http://jquery.com/
 *
 * Includes Sizzle.js
 * http://sizzlejs.com/
 *
 * Copyright 2005, 2014 jQuery Foundation, Inc. and other contributors
 * Released under the MIT license
 * http://jquery.org/license
 *
 * Date: 2015-04-28T16:01Z
 */
