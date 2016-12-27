/**
 * Copyright @ 2016 Esri.
 * All rights reserved under the copyright laws of the United States and applicable international laws, treaties, and conventions.
 */
define(["dojo/_base/declare","dojo/_base/lang","dojo/_base/array","dojo/Deferred","esri/kernel","esri/request","esri/PopupTemplate","esri/core/JSONSupporter","esri/core/lang","esri/tasks/support/Query","esri/layers/Layer","esri/layers/graphics/sources/FeatureLayerSource","../views/3d/support/fx3dUtils"],function(e,i,t,s,n,r,a,l,o,d,u,h,p){function c(e,t){return r(e,{query:i.mixin({f:"json"},null),responseType:"json",callbackParamName:"callback"}).then(function(s){if(s._ssl&&(delete s._ssl,e=e.replace(/^http:/i,"https:")),"Feature Layer"===s.data.type){var n={};n.availableVizTypes=p.availableVizTypes(s.data.geometryType,s.data.timeInfo),i.mixin(n,v(s.data.fields)),t(null,n)}else t("FxLayer can only accecpt a feature service.")})}function v(e){var i=[],s=[],n=["esriFieldTypeSmallInteger","esriFieldTypeInteger","esriFieldTypeSingle","esriFieldTypeDouble"],r=["lat","latitude","y","ycenter","latitude83","latdecdeg","POINT-Y","lon","lng","long","longitude","x","xcenter","longitude83","longdecdeg","POINT-X","alt","altitude","z","POINT-Z","zcenter","altitude83","altdecdeg"];return t.forEach(e,function(e){i.push(e.name);var t=e.name.toLowerCase();n.indexOf(e.type)>-1&&-1===r.indexOf(t)&&s.push(e.name)}),{displayFields:i,vizFields:s}}var y=u.createSubclass([l],{declaredClass:"esri.layers.FxLayer",viewModulePaths:{"3d":"fx3d/views/3d/layers/FxLayerView3D"},properties:{renderingInfo:{value:null,set:function(e){var t=this._get("renderingInfo");i.isObject(e)&&!p.isEqual(e,t)&&this._set("renderingInfo",e)}},vizType:{value:null,set:function(e){var t=this._get("vizType");i.isString(e)&&!p.isEqual(e,t)&&this._set("vizType",e)}},displayField:{value:null,json:{ignore:!0},set:function(e){var t=this._get("displayField");i.isString(e)&&!p.isEqual(e,t)&&this._set("displayField",e)}},vizFields:{value:null,set:function(e){e=i.isString(e)?[e]:e;var t=this._get("vizFields");i.isArray(e)&&!p.isEqual(e,t)&&this._set("vizFields",e)}},spinTag:{value:!1,set:function(e){var i=this._get("spinTag");"boolean"==typeof e&&e!==i&&this._set("spinTag",e)}},pauseTag:{value:!1,set:function(e){var i=this._get("pauseTag");"boolean"==typeof e&&e!==i&&this._set("pauseTag",e)}}},constructor:function(){},normalizeCtorArgs:function(e,t){return i.isString(e)&&p.isUrl(e)?i.mixin({},{url:e},t):(console.warn("Data source must be a FeatureService url."),null)},getDefaults:function(){return i.mixin(this.inherited(arguments),{visible:!0,outFields:["*"],type:"3DFx Layer",disablePopup:!0})},destroy:function(){this.pauseAnimation(),this.pauseSpinning(),this.emit("destroy-fxlayer")},load:function(){var e=this._createGraphicsSource();e.then(i.hitch(this,this._initLayerProperties)),this.addResolvingPromise(e)},_createGraphicsSource:function(){var e=new s;if(this.url){var t=new h({layer:this});t.then(i.hitch(this,function(){this.emit("graphics-source-create",{graphicsSource:t}),e.resolve(t)}),function(i){e.reject(i)})}else console.warn("No url data source is specified."),e.resolve();return e.promise},_initLayerProperties:function(e){if(this.source||(this.source=e),e.url&&(this.url=e.url),delete e.layerDefinition.visible,delete e.layerDefinition.outFields,delete e.layerDefinition.type,delete e.layerDefinition.id,delete e.layerDefinition.disablePopup,delete e.layerDefinition.displayField,delete e.layerDefinition.vizFields,delete e.layerDefinition.renderingInfo,delete e.layerDefinition.vizType,this.read(e.layerDefinition),!i.isArray(this.fields))return void console.warn("Fileds from source is invalid.");var s=v(this.fields),n=s.vizFields,r=s.displayFields,l=null,o=null;if(i.isString(this.displayField)&&0!==this.displayField.length?(o=null,l=t.some(r,function(e){return e.toLowerCase()===this.displayField.toLowerCase()?(o=e,!0):void 0}.bind(this)),l?this.set("displayField",o):this.set("displayField",r[0])):this.set("displayField",r[0]),i.isArray(this.vizFields)&&0!==this.vizFields.length){var d=[];t.forEach(n,function(e){d.push(e.toLowerCase())}),l=[],t.forEach(this.vizFields,function(e){var i=d.indexOf(e.toLowerCase());i>-1&&l.push(n[i])}.bind(this)),l.length>0?this.set("vizFields",l):this.set("vizFields",n[0])}else this.set("vizFields",n[0]);return this.availableVizTypes=p.availableVizTypes(this.geometryType,this.timeInfo),i.isString(this.vizType)&&0!==this.vizType.length?(o=null,l=t.some(this.availableVizTypes,function(e){return e.name.toLowerCase()===this.vizType.toLowerCase()?(o=e.name,!0):void 0}.bind(this)),l?this.vizType=o:this.vizType=this.availableVizTypes[0]?this.availableVizTypes[0].name:null):this.vizType=this.availableVizTypes[0]?this.availableVizTypes[0].name:null,this.popupTemplate||(this.popupTemplate=new a({title:this.name,fieldInfos:this.fields?t.map(this.fields,function(e){return{fieldName:e.name,label:e.name,visible:!0}}):[],content:"{*}"})),this.vizType&&0!=this.vizType.length&&this.displayField&&0!=this.displayField.length&&i.isArray(this.vizFields)&&0!=this.vizFields.length?void this.set("visible",!0):(this.set("visible",!1),this.set("loaded",!1),this.emit("fxlayer-error",{msg:"Properties of vizType, displayField, vizFields, renderingInfo, or popupTemplate is missing."}),void console.warn("Properties of vizType, displayField, vizFields, renderingInfo, or popupTemplate is missing."))},createQueryParameters:function(){var e=new d;return e.returnGeometry=!0,e.returnZ=this.hasZ&&this.returnZ||null,e.returnM=this.hasM&&this.returnM||null,e.outFields=this.outFields,e.where=this.definitionExpression||"1=1",e.multipatchOption="multipatch"===this.geometryType?"xyFootprint":null,e},showLabel:function(e){e&&this.emit("show-feature-label",{feature:e})},hideLabel:function(){this.emit("hide-feature-label")},startAnimation:function(){return this.visible?void(this.pauseTag=!1):void console.warn("The FxLayer is invisible now.")},pauseAnimation:function(){this.pauseTag=!0},startSpinning:function(){return this.visible?void(this.spinTag=!0):void console.warn("The FxLayer is invisible now.")},pauseSpinning:function(){this.spinTag=!1},switchVizField:function(e,s){function n(e){e>-1&&e<r.vizFields.length?r.emit("fx3d-active-viz-field",{currentVizPage:e,newRenderingInfo:s}):console.warn("invalid viz page in switchVizField(vizField).")}if(!this.visible)return void console.warn("The FxLayer is invisible now.");var r=this;if(i.isString(e)){var a=[];t.forEach(this.vizFields,function(e){a.push(e.toLowerCase())});var l=a.indexOf(e.toLowerCase());n(l)}else"number"==typeof e?n(e):console.warn("switchVizField(vizField) needs a integer id or string name as parameter.")}});return i.mixin(y,{getFieldsAndVizTypes:function(e){var t=new s;return i.isString(e)?p.isUrl(e)&&c(e,function(e,i){e?t.reject(e):t.resolve(i)}):t.reject("FxLayer can only accecpt a feature service url now."),t}}),i.mixin(y,p.EffectType),y});