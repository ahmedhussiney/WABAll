// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See http://js.arcgis.com/3.15/esri/copyright.txt and http://www.arcgis.com/apps/webappbuilder/copyright.txt for details.
//>>built
define(["dojo/_base/declare","dojo/_base/array","dojo/_base/lang","dojo/Evented","./AppProxyUtil"],function(a,c,b,f,e){a=a([f],{appProxyManager:null,title:"",sourceUrl:"",proxyUrl:"",proxyId:"",premium:!0,consumeCredits:!1,constructor:function(a){b.mixin(this,a);this.premium=e.isPremium(this.sourceUrl);this.consumeCredits=e.consumesCredits(this.sourceUrl)},createProxy:function(){this._startProcess();if(!this.premium&&!this.consumeCredits)this.emit("processError",this.nls.notValidPremiumUrl+" "+this.sourceUrl),
this._stopProcess();else if(this.appProxyManager){var a=!1;this.appProxyManager.proxies&&0<this.appProxyManager.proxies.length&&(a=c.some(this.appProxyManager.proxies,function(a){return a.sourceUrl===this.sourceUrl&&a.proxyId&&a.proxyUrl}));if(a)this._checkCreateProxiesCallback(this.appProxyManager.proxies);else try{this.appProxyManager.createProxies([{sourceUrl:this.sourceUrl}]).then(b.hitch(this,function(a){this._checkCreateProxiesCallback(a)}),b.hitch(this,function(){this._checkCreateProxiesCallback([])}))}catch(g){this._checkCreateProxiesCallback([])}}else this._checkCreateProxiesCallback([])},
_checkCreateProxiesCallback:function(a){c.some(a,b.hitch(this,function(a){if(a.sourceUrl===this.sourceUrl)return this.proxyUrl=a.proxyUrl,this.proxyId=a.proxyId,!0}))?this.emit("proxyCreated",{sourceUrl:this.sourceUrl,proxyUrl:this.proxyUrl,proxyId:this.proxyId,title:this.title,premium:this.premium,consumeCredits:this.consumeCredits,useProxy:!0}):(this.proxyUrl=this.proxyId="",this.useProxy=!1,this.emit("processError",this.nls.createProxyFailed+" "+this.sourceUrl));this._stopProcess()},deleteProxy:function(){this._startProcess();
if(this.appProxyManager&&this.proxyId)try{this.appProxyManager.deleteProxies([{proxyId:this.proxyId}]).then(b.hitch(this,function(a){var d=c.some(a,b.hitch(this,function(a){return a.sourceUrl===this.sourceUrl&&!1===a.proxied}));d||(d=c.every(a,b.hitch(this,function(a){return a.sourceUrl!==this.sourceUrl})));d?(this.proxyId=this.proxyUrl="",this.emit("proxyDeleted",this.sourceUrl)):this.emit("processError",this.nls.deleteProxyFailed+" "+this.sourceUrl);this._stopProcess()}),b.hitch(this,function(){this.emit("processError",
this.nls.deleteProxyFailed+" "+this.sourceUrl);this._stopProcess()}))}catch(a){this.emit("processError",this.nls.deleteProxyFailed+" "+this.sourceUrl),this._stopProcess()}else this.emit("processError",this.nls.deleteProxyFailed+" "+this.sourceUrl),this._stopProcess()},_startProcess:function(){this.emit("processStart")},_stopProcess:function(){this.emit("processEnd")}});a.PROXY_CREATED="proxyCreated";a.PROCESS_START="processStart";a.PROXY_DELETED="proxyDeleted";a.PROCESS_END="processEnd";a.PROCESS_ERROR=
"processError";return a});