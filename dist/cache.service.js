var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Request, Response, ResponseOptions } from '@angular/http';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/merge';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/share';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { Storage } from '@ionic/storage';
import * as CryptoJS from 'crypto-js';
export var MESSAGES = {
    0: 'Cache initialization error: ',
    1: 'Cache is not enabled.',
    2: 'Cache entry already expired: ',
    3: 'No such key: ',
    4: 'No entries were deleted, because browser is offline.'
};
var CacheService = /** @class */ (function () {
    function CacheService(_storage) {
        var _this = this;
        this._storage = _storage;
        this.ttl = 60 * 60; // one hour
        this.cacheEnabled = true;
        this.invalidateOffline = false;
        this.networkStatus = true;
        try {
            this.watchNetworkInit();
            _storage.ready()
                .then(function () {
                _this.cacheEnabled = true;
            });
        }
        catch (e) {
            this.cacheEnabled = false;
            console.error(MESSAGES[0], e);
        }
    }
    CacheService.prototype.ready = function () {
        return this._storage.ready().then(function () { return Promise.resolve(); });
    };
    /**
     * @description Disable or enable cache
     */
    CacheService.prototype.enableCache = function (enable) {
        if (enable === void 0) { enable = true; }
        this.cacheEnabled = enable;
    };
    /**
     * @description Delete DB table and create new one
     * @return {Promise<any>}
     */
    CacheService.prototype.resetDatabase = function () {
        var _this = this;
        return this.ready()
            .then(function () { return _this._storage.clear(); });
    };
    /**
     * @description Set default TTL
     * @param {number} ttl - TTL in seconds
     */
    CacheService.prototype.setDefaultTTL = function (ttl) {
        return this.ttl = ttl;
    };
    /**
       * @description Set AES encryption key
       * @author Prasad Sambodhi (nisostech.com)
       * @param {string} key encryption key
       */
    CacheService.prototype.setEncryptionKey = function (key) {
        this.encryptionKey = key;
    };
    /**
     * @description Set if expired cache should be invalidated if device is offline
     * @param {boolean} offlineInvalidate
     */
    CacheService.prototype.setOfflineInvalidate = function (offlineInvalidate) {
        this.invalidateOffline = !offlineInvalidate;
    };
    /**
     * @description Start watching if devices is online or offline
     */
    CacheService.prototype.watchNetworkInit = function () {
        var _this = this;
        this.networkStatus = navigator.onLine;
        var connect = Observable.fromEvent(window, 'online').map(function () { return true; }), disconnect = Observable.fromEvent(window, 'offline').map(function () { return false; });
        this.networkStatusChanges = Observable.merge(connect, disconnect).share();
        this.networkStatusChanges.subscribe(function (status) {
            _this.networkStatus = status;
        });
    };
    /**
     * @description Stream of network status changes
     * * @return {Observable<boolean>} network status stream
     */
    CacheService.prototype.getNetworkStatusChanges = function () {
        return this.networkStatusChanges;
    };
    /**
     * @description Check if devices is online
     * @return {boolean} network status
     */
    CacheService.prototype.isOnline = function () {
        return this.networkStatus;
    };
    /**
     * @description Save item to cache
     * @param {string} key - Unique key
     * @param {any} data - Data to store
     * @param {string} [groupKey] - group key
     * @param {number} [ttl] - TTL in seconds
     * @return {Promise<any>} - saved data
     */
    CacheService.prototype.saveItem = function (key, data, groupKey, ttl) {
        if (groupKey === void 0) { groupKey = 'none'; }
        if (ttl === void 0) { ttl = this.ttl; }
        if (!this.cacheEnabled) {
            return Promise.reject(MESSAGES[1]);
        }
        var expires = new Date().getTime() + (ttl * 1000), type = CacheService.isRequest(data) ? 'request' : typeof data, 
        // value = JSON.stringify(data);
        value = this.encryptionKey ? CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptionKey).toString() : JSON.stringify(data);
        return this._storage.set(key, {
            value: value,
            expires: expires,
            type: type,
            groupKey: groupKey
        });
    };
    /**
     * @description Delete item from cache
     * @param {string} key - Unique key
     * @return {Promise<any>} - query execution promise
     */
    CacheService.prototype.removeItem = function (key) {
        if (!this.cacheEnabled) {
            return Promise.reject(MESSAGES[1]);
        }
        return this._storage.remove(key);
    };
    /**
     * @description Get item from cache without expire check etc.
     * @param {string} key - Unique key
     * @return {Promise<any>} - data from cache
     */
    CacheService.prototype.getRawItem = function (key) {
        if (!this.cacheEnabled) {
            return Promise.reject(MESSAGES[1]);
        }
        return this._storage.get(key)
            .then(function (data) {
            if (!data)
                return Promise.reject('');
            return data;
        })
            .catch(function () { return Promise.reject(MESSAGES[3] + key); });
    };
    /**
     * @description Get item from cache with expire check and correct type assign
     * @param {string} key - Unique key
     * @return {Promise<any>} - data from cache
     */
    CacheService.prototype.getItem = function (key) {
        var _this = this;
        if (!this.cacheEnabled) {
            return Promise.reject(MESSAGES[1]);
        }
        return this.getRawItem(key).then(function (data) {
            if (data.expires < new Date().getTime()) {
                if (_this.invalidateOffline) {
                    return Promise.reject(MESSAGES[2] + key);
                }
                else if (_this.isOnline()) {
                    return Promise.reject(MESSAGES[2] + key);
                }
            }
            return CacheService.decodeRawData(data, _this.encryptionKey);
        });
    };
    CacheService.prototype.getOrSetItem = function (key, factory, groupKey, ttl) {
        if (groupKey === void 0) { groupKey = 'none'; }
        if (ttl === void 0) { ttl = this.ttl; }
        return __awaiter(this, void 0, void 0, function () {
            var val, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 5]);
                        return [4 /*yield*/, this.getItem(key)];
                    case 1:
                        val = _a.sent();
                        return [3 /*break*/, 5];
                    case 2:
                        error_1 = _a.sent();
                        return [4 /*yield*/, factory()];
                    case 3:
                        val = _a.sent();
                        return [4 /*yield*/, this.saveItem(key, val)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/, val];
                }
            });
        });
    };
    /**
     * @description Decode raw data from DB
     * @param {any} data - Data
     * @return {any} - decoded data
     */
    CacheService.decodeRawData = function (data, encryptionKey) {
        // let dataJson = JSON.parse(data.value);
        var dataJson = JSON.parse(encryptionKey ? CryptoJS.AES.decrypt(data.value, encryptionKey).toString(CryptoJS.enc.Utf8) : data.value);
        if (CacheService.isRequest(dataJson)) {
            var requestOptions = new ResponseOptions({
                body: dataJson._body,
                status: dataJson.status,
                headers: dataJson.headers,
                statusText: dataJson.statusText,
                type: dataJson.type,
                url: dataJson.url
            });
            return new Response(requestOptions);
        }
        else {
            return dataJson;
        }
    };
    /**
     * @description Load item from cache if it's in cache or load from origin observable
     * @param {string} key - Unique key
     * @param {any} observable - Observable with data
     * @param {string} [groupKey] - group key
     * @param {number} [ttl] - TTL in seconds
     * @return {Observable<any>} - data from cache or origin observable
     */
    CacheService.prototype.loadFromObservable = function (key, observable, groupKey, ttl) {
        var _this = this;
        if (!this.cacheEnabled)
            return observable;
        observable = observable.share();
        return Observable.fromPromise(this.getItem(key))
            .catch(function (e) {
            observable.subscribe(function (res) { return _this.saveItem(key, res, groupKey, ttl); }, function (error) { return Observable.throw(error); });
            return observable;
        });
    };
    /**
     * @description Load item from cache if it's in cache or load from origin observable
     * @param {string} key - Unique key
     * @param {any} observable - Observable with data
     * @param {string} [groupKey] - group key
     * @param {number} [ttl] - TTL in seconds
     * @param {string} [delayType='expired']
     * @return {Observable<any>} - data from cache or origin observable
     */
    CacheService.prototype.loadFromDelayedObservable = function (key, observable, groupKey, ttl, delayType) {
        var _this = this;
        if (ttl === void 0) { ttl = this.ttl; }
        if (delayType === void 0) { delayType = 'expired'; }
        if (!this.cacheEnabled)
            return observable;
        var observableSubject = new Subject();
        observable = observable.share();
        var subscribeOrigin = function () {
            observable.subscribe(function (res) {
                _this.saveItem(key, res, groupKey, ttl);
                observableSubject.next(res);
                observableSubject.complete();
            }, function (err) {
                observableSubject.error(err);
            }, function () {
                observableSubject.complete();
            });
        };
        this.getItem(key)
            .then(function (data) {
            observableSubject.next(data);
            if (delayType === 'all') {
                subscribeOrigin();
            }
        })
            .catch(function (e) {
            _this.getRawItem(key)
                .then(function (res) {
                observableSubject.next(CacheService.decodeRawData(res, _this.encryptionKey));
                subscribeOrigin();
            })
                .catch(function () { return subscribeOrigin(); });
        });
        return observableSubject.asObservable();
    };
    /**
     * Perform complete cache clear
     * @return {Promise<any>}
     */
    CacheService.prototype.clearAll = function () {
        if (!this.cacheEnabled) {
            return Promise.reject(MESSAGES[2]);
        }
        return this.resetDatabase();
    };
    /**
     * @description Remove all expired items from cache
     * @param {boolean} ignoreOnlineStatus -
     * @return {Promise<any>} - query promise
     */
    CacheService.prototype.clearExpired = function (ignoreOnlineStatus) {
        var _this = this;
        if (ignoreOnlineStatus === void 0) { ignoreOnlineStatus = false; }
        if (!this.cacheEnabled) {
            return Promise.reject(MESSAGES[2]);
        }
        if (!this.isOnline() && !ignoreOnlineStatus) {
            return Promise.reject(MESSAGES[4]);
        }
        var datetime = new Date().getTime();
        var promises = [];
        this._storage.forEach(function (val, key) {
            if (val && val.expires < datetime)
                promises.push(_this.removeItem(key));
        });
        return Promise.all(promises);
    };
    /**
     * @description Remove all item with specified group
     * @param {string} groupKey - group key
     * @return {Promise<any>} - query promise
     */
    CacheService.prototype.clearGroup = function (groupKey) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var promises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.cacheEnabled) {
                            return [2 /*return*/, Promise.reject(MESSAGES[2])];
                        }
                        promises = [];
                        return [4 /*yield*/, this._storage.forEach(function (val, key) {
                                if (val && val.groupKey === groupKey)
                                    promises.push(_this.removeItem(key));
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, Promise.all(promises)];
                }
            });
        });
    };
    /**
     * @description Check if it's an request
     * @param {any} data - Variable to test
     * @return {boolean} - data from cache
     */
    CacheService.isRequest = function (data) {
        return (data && (data instanceof Request ||
            (typeof data === 'object' && data.hasOwnProperty('_body') && data.hasOwnProperty('status') &&
                data.hasOwnProperty('statusText') &&
                data.hasOwnProperty('type') &&
                data.hasOwnProperty('headers') &&
                data.hasOwnProperty('url'))));
    };
    CacheService.decorators = [
        { type: Injectable },
    ];
    /** @nocollapse */
    CacheService.ctorParameters = function () { return [
        { type: Storage, },
    ]; };
    return CacheService;
}());
export { CacheService };
//# sourceMappingURL=cache.service.js.map