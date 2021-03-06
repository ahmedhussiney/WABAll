///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define(['dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/html',
  'dojo/_base/array',
  'dojo/on',
  'dojo/promise/all',
  'dojo/Deferred',
  'dijit/_WidgetsInTemplateMixin',
  'esri/symbols/SimpleMarkerSymbol',
  'esri/symbols/SimpleLineSymbol',
  'esri/symbols/SimpleFillSymbol',
  'esri/symbols/jsonUtils',
  'esri/Color',
  'jimu/BaseWidget',
  'jimu/dijit/ViewStack',
  'jimu/dijit/FeatureSetChooserForMultipleLayers',
  'jimu/LayerInfos/LayerInfos',
  'jimu/SelectionManager',
  './layerUtil',
  './SelectableLayerItem',
  './FeatureItem',
  'jimu/dijit/LoadingShelter'
],
function(declare, lang, html, array, on, all, Deferred, _WidgetsInTemplateMixin, SimpleMarkerSymbol,
SimpleLineSymbol, SimpleFillSymbol, SymbolJsonUtils, Color, BaseWidget, ViewStack,
FeatureSetChooserForMultipleLayers, LayerInfos, SelectionManager, layerUtil,
SelectableLayerItem, FeatureItem) {
  return declare([BaseWidget, _WidgetsInTemplateMixin], {
    baseClass: 'jimu-widget-select',

    postMixInProperties: function() {
      this.inherited(arguments);
      lang.mixin(this.nls, window.jimuNls.common);
    },

    postCreate: function() {
      this.inherited(arguments);
      var selectionColor = new Color(this.config.selectionColor);
      this.defaultPointSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE,
          16, null, selectionColor);
      this.defaultLineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
          selectionColor, 2);
      this.defaultFillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID,
          this.defaultLineSymbol,
          new Color([selectionColor.r, selectionColor.g, selectionColor.b, 0.3]));
      /**
       * Helper object to keep which layer is selectable.
       */
      this.layerMapper = {};
      this.layerInfoArray = [];
      this.layerItems = [];

      // create select dijit
      this.selectDijit = new FeatureSetChooserForMultipleLayers({
        map: this.map,
        updateSelection: true,
        fullyWithin: this.config.selectionMode === 'wholly'
      });

      html.place(this.selectDijit.domNode, this.selectDijitNode);
      this.selectDijit.startup();

      this.own(on(this.selectDijit, 'user-clear', lang.hitch(this, this._clearAllSelections)));
      this.own(on(this.selectDijit, 'loading', lang.hitch(this, function() {
        this.shelter.show();
      })));
      this.own(on(this.selectDijit, 'unloading', lang.hitch(this, function() {
        this.shelter.hide();
      })));

      this.viewStack = new ViewStack({
        viewType: 'dom',
        views: [this.layerListNode, this.detailsNode]
      });
      html.place(this.viewStack.domNode, this.domNode);

      this.own(on(this.switchBackBtn, 'click', lang.hitch(this, this._switchToLayerList)));

      this._switchToLayerList();
      this.shelter.show();

      var layerInfosObject = LayerInfos.getInstanceSync();

      layerUtil.getLayerInfoArray(layerInfosObject).then(lang.hitch(this, function(layerInfoArray) {
        //First loaded, reset selectableLayerIds
        this._initLayers(layerInfoArray);
      }));

      this.own(on(layerInfosObject, 'layerInfosChanged', lang.hitch(this, function() {
        this.shelter.show();

        layerUtil.getLayerInfoArray(layerInfosObject)
          .then(lang.hitch(this, function(layerInfoArray) {
            this._initLayers(layerInfoArray);
          }));
      })));

      this.own(on(layerInfosObject, 'layerInfosIsShowInMapChanged',
        lang.hitch(this, this._layerVisibilityChanged)));

      this.own(on(this.map, 'zoom-end', lang.hitch(this, this._layerVisibilityChanged)));
    },

    onDeActive: function(){
      this.selectDijit.deactivate();
      this._restoreSelectionSymbol();
    },

    onActive: function(){
      this._setSelectionSymbol();
    },

    onDestroy: function() {
      this._clearAllSelections();
    },

    _initLayers: function(layerInfoArray) {
      this.layerInfoArray = layerInfoArray;
      this.layerItems = [];
      this.selectionSymbols = {};

      html.empty(this.layerItemsNode);

      array.forEach(layerInfoArray, lang.hitch(this, function(layerInfo) {
        var visible = layerInfo.isShowInMap() && layerInfo.isInScale();

        var item = new SelectableLayerItem({
          layerInfo: layerInfo,
          checked: visible,
          layerVisible: visible,
          folderUrl: this.folderUrl,
          allowExport: this.config ? this.config.allowExport : false,
          map: this.map,
          nls: this.nls
        });
        this.own(on(item, 'switchToDetails', lang.hitch(this, this._switchToDetails)));
        this.own(on(item, 'stateChange', lang.hitch(this, function() {
          this.shelter.show();
          this._getSelectableLayers().then(lang.hitch(this, function(layerObjects){
            this.selectDijit.setFeatureLayers(layerObjects);
            this.shelter.hide();
          }));
        })));
        html.place(item.domNode, this.layerItemsNode);
        item.startup();

        this.layerItems.push(item);
      }));

      this._getSelectableLayers().then(lang.hitch(this, function(layerObjects){
        this.selectDijit.setFeatureLayers(layerObjects);
        this.shelter.hide();
      }));

      this._getLayerObjects().then(lang.hitch(this, function(layerObjects) {
        array.forEach(layerObjects, function(layerObject) {
          if(!layerObject.getSelectionSymbol()){
            this._setDefaultSymbol(layerObject);
          }

          var symbol = layerObject.getSelectionSymbol();
          this.selectionSymbols[layerObject.id] = symbol.toJson();
        }, this);

        this._setSelectionSymbol();
      }));
    },

    _setSelectionSymbol: function(){
      this._getLayerObjects().then(lang.hitch(this, function(layerObjects) {
        array.forEach(layerObjects, function(layerObject) {
          this._setDefaultSymbol(layerObject);
        }, this);
      }));
    },

    _setDefaultSymbol: function(layerObject) {
      if(layerObject.geometryType === 'esriGeometryPoint' ||
          layerObject.geometryType === 'esriGeometryMultipoint') {
        layerObject.setSelectionSymbol(this.defaultPointSymbol);
      } else if(layerObject.geometryType === 'esriGeometryPolyline') {
        layerObject.setSelectionSymbol(this.defaultLineSymbol);
      } else if(layerObject.geometryType === 'esriGeometryPolygon') {
        layerObject.setSelectionSymbol(this.defaultFillSymbol);
      } else {
        console.warn('unknown geometryType: ' + layerObject.geometryType);
      }
    },

    _restoreSelectionSymbol: function() {
      this._getLayerObjects().then(lang.hitch(this, function(layerObjects) {
        array.forEach(layerObjects, function(layerObject) {
          var symbolJson = this.selectionSymbols[layerObject.id];
          if(symbolJson) {
            layerObject.setSelectionSymbol(SymbolJsonUtils.fromJson(symbolJson));
          }
        }, this);
      }));
    },

    _layerVisibilityChanged: function() {
      array.forEach(this.layerItems, function(layerItem) {
        layerItem.updateLayerVisibility();
      }, this);
    },

    _getSelectableLayers: function() {
      var retDef = new Deferred();

      var selectedLayerInfo = [];
      array.forEach(this.layerItems, function(layerItem) {
        if(layerItem.isLayerVisible() && layerItem.isChecked()) {
          selectedLayerInfo.push(layerItem.layerInfo);
        }
      }, this);

      this._getLayerObjects(selectedLayerInfo).then(function(layerObjects){
        retDef.resolve(layerObjects);
      });

      return retDef;
    },

    _clearAllSelections: function() {
      var selectionMgr = SelectionManager.getInstance();
      this._getLayerObjects().then(function(layerObjects){
        array.forEach(layerObjects, function(layerObject) {
          selectionMgr.clearSelection(layerObject);
        });
      });
    },

    _getLayerObjects: function(layerInfoArray) {
      var retDef = new Deferred();

      if(!layerInfoArray) {
        layerInfoArray = this.layerInfoArray;
      }

      var defs = array.map(layerInfoArray, function(layerInfo){
        return layerInfo.getLayerObject();
      });

      all(defs).then(function(layerObjects){
        retDef.resolve(layerObjects);
      });

      return retDef;
    },

    _switchToDetails: function(layerItem) {
      html.empty(this.featureContent);
      this.viewStack.switchView(1);
      this.selectedLayerName.innerHTML = layerItem.layerName;

      layerItem.layerInfo.getLayerObject().then(lang.hitch(this, function(layerObject) {
        var selectedFeatures = layerObject.getSelectedFeatures();
        if(selectedFeatures.length > 0) {
          array.forEach(selectedFeatures, lang.hitch(this, function(feature) {
            var item = new FeatureItem({
              graphic: feature,
              map: this.map,
              featureLayer: layerObject,
              displayField: layerObject.displayField,
              objectIdField: layerObject.objectIdField,
              allowExport: this.config ? this.config.allowExport : false,
              nls: this.nls
            });
            html.place(item.domNode, this.featureContent);
            item.startup();
          }));
        }
      }));
    },

    _switchToLayerList: function() {
      this.viewStack.switchView(0);
    }
  });
});
