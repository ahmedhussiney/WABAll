// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See http://js.arcgis.com/3.15/esri/copyright.txt and http://www.arcgis.com/apps/webappbuilder/copyright.txt for details.
//>>built
require({cache:{"url:builder/plugins/widget-config/WidgetChoosePage.html":'\x3cdiv class\x3d"widget-choose-page"\x3e\r\n  \r\n  \x3cdiv class\x3d"section search" data-dojo-attach-point\x3d"searchSectionNode"\x3e\r\n    \x3cdiv data-dojo-attach-point\x3d"searchInputNode"\x3e\x3c/div\x3e\r\n    \x3cdiv class\x3d"list widget-list" data-dojo-attach-point\x3d"widgetListNode"\x3e\x3c/div\x3e\r\n  \x3c/div\x3e\r\n\x3c/div\x3e'}});
define("dojo/_base/declare dojo/_base/lang dojo/_base/html dojo/_base/array dojo/topic dojo/on dojo/Deferred dojo/promise/all dojo/query dojo/NodeList-dom dijit/_WidgetBase dijit/_TemplatedMixin dojo/text!./WidgetChoosePage.html jimu/dijit/Search jimu/WidgetManager jimu/dijit/LoadingShelter jimu/dijit/Message jimu/utils builder/serviceUtils".split(" "),function(p,e,d,f,q,k,r,s,l,z,t,u,v,w,x,y,m,g,n){return p([t,u],{templateString:v,postMixInProperties:function(){this.widgetManager=x.getInstance()},
startup:function(){this.inherited(arguments);this.searchDijit=new w({placeholder:this.nls.widgetSearchHint,onSearch:e.hitch(this,this.searchWidget),searchWhenInput:!0},this.searchInputNode);this._getWidgets();this.own(k(window,"resize",e.hitch(this,this.resize)));setTimeout(e.hitch(this,function(){this.resize()}),100);this.loading=new y({hidden:!0});this.loading.placeAt(this.domNode);this.loading.startup()},searchWidget:function(a){var b;b=""===a?this.allWidgets:f.filter(this.allWidgets,function(b){if(-1<
b.label.toUpperCase().indexOf(a.toUpperCase()))return!0});this._createWidgetNodes(b)},resize:function(){var a=d.getContentBox(this.domNode).h,b=a-60;d.setStyle(this.searchSectionNode,{height:a+"px"});d.setStyle(this.widgetListNode,{height:b+"px"})},setAppConfig:function(a){this.appConfig=a},_getWidgets:function(){var a={};this.appConfig.map["2D"]&&(a.support2D=!0);this.appConfig.map["3D"]&&(a.support3D=!0);this.appConfig.map["2D"]&&this.appConfig.map["3D"]&&(a.support2D=!0,a.support3D=!0);a.platform=
window.stemappInfo.appType;this.options.includeOffPanel||(a["properties.inPanel"]=!0);n.searchWidgets(a).then(e.hitch(this,function(a){a.success?(this.allWidgets=this._filterSingletonWidgets(a.widgets),this._createWidgetNodes(this.allWidgets)):console.log(a.message)}))},_filterSingletonWidgets:function(a){return f.filter(a,function(a){return!1===a.properties.supportMultiInstance&&this._checkWidgetIsInAppConfig(this.appConfig,a.name)?!1:!0},this)},_checkWidgetIsInAppConfig:function(a,b){var c=[];0===
g.getControllerWidgets(a).length?a.visitElement(e.hitch(this,function(a){a.isOnScreen&&a.name===b&&c.push(a)})):c=a.getConfigElementsByName(b);return 0<c.length},_createWidgetNodes:function(a){d.empty(this.widgetListNode);f.forEach(a,function(a){g.manifest.processManifestLabel(a,dojoConfig.locale);this._createWidgetNode(a)},this)},_createWidgetNode:function(a){var b,c;b=d.create("div",{"class":"widget-node","data-widget-name":a.name},this.widgetListNode);c=d.create("div",{"class":"box"},b);d.create("div",
{"class":"box-selected"},b);d.create("img",{"class":"icon",src:a.icon},c);d.create("div",{"class":"label",innerHTML:g.stripHTML(a.label),title:a.label},b);b.setting={name:a.name,label:a.label,version:a.version};g.manifest.addManifestProperies(a);g.widgetJson.addManifest2WidgetJson(b.setting,a);b.setting.icon="widgets/"+a.name+"/images/icon.png";b.setting.uri="widgets/"+a.name+"/Widget";g.widgetJson.processWidgetJson(b.setting);b.box=c;this.own(k(b,"click",e.hitch(this,this._onWidgetClick,b)));return b},
_onWidgetClick:function(a){"addBtn"===this.fromNode.type?d.hasClass(a,"jimu-state-selected")?d.removeClass(a,"jimu-state-selected"):d.addClass(a,"jimu-state-selected"):(l(".jimu-state-selected",this.domNode).removeClass("jimu-state-selected"),d.addClass(a,"jimu-state-selected"))},onOk:function(){var a=l(".jimu-state-selected",this.domNode);if(0===a.length)new m({message:this.nls.emptyMessage});else{this.loading.show();var b=f.map(a,function(a){return e.clone(a.setting)}),c=[];f.forEach(b,function(a){c.push(this._copyWidget(a))},
this);s(c).then(e.hitch(this,function(a){var c;for(c=0;c<a.length;c++)if(!a[c].success){new m({message:a[c].message});this.loading.hide();return}this.loading.hide();q.publish("widgetChoosePageOk",b,this.fromNode);this.popup.close()}))}},_copyWidget:function(a){var b=0,c,d=[],f=g.getControllerWidgets(this.appConfig);this.appConfig.visitElement(e.hitch(this,function(c){if(0!==f.length||c.isOnScreen)c.name===a.name&&b++,d.push(c.label)}));if(0===b)a.label=a.label,c=n.copyWidgetToApp(window.appInfo.id,
a.name);else if(0<b){c=new r;for(var h=a.label+"_"+(b+1);-1<d.indexOf(h);)b++,h=a.label+"_"+(b+1);a.label=h;c.resolve({success:!0})}return c}})});