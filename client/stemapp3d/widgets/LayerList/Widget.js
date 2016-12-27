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

define([
    'dojo/_base/declare',
    'jimu/BaseWidget',
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/on',
    './LayerItem'
  ], function(declare, BaseWidget, array, lang, on, LayerItem) {

    var clazz = declare([BaseWidget], {

      name: 'LayerList',
      baseClass: 'jimu-widget-layerlist',
      _layerItems: null,

      postCreate: function(){
        this.inherited(arguments);
        this._layerItems = [];
        this.own(on(this.sceneView.map, 'layer-add', lang.hitch(this, this._build)));
        this.own(on(this.sceneView.map, 'layer-remove', lang.hitch(this, this._build)));
        this.own(on(this.sceneView.map, 'layer-reorder', lang.hitch(this, this._build)));
        this._build();
      },

      _build: function(){
        this._destroyAllLayerItems();
        var maxLayerIndex = this.sceneView.map.layers.get("length") - 1;
        //hide layer0 because of basemap
        for(var i = maxLayerIndex; i >= 0; i--){
          var layer = this.sceneView.map.layers.getItemAt(i);
          if(layer.declaredClass !== "esri.layers.GraphicsLayer"){
            this._addLayerItem(layer);
          }
        }
      },

      _destroyAllLayerItems: function(){
        array.forEach(this._layerItems, lang.hitch(this, function(layerItem){
          layerItem.destroy();
        }));
        this._layerItems = [];
      },

      _addLayerItem: function(layer){
        var layerItem = new LayerItem({
          sceneView: this.sceneView,
          layer: layer
        });
        layerItem.placeAt(this.layersDiv);
        this._layerItems.push(layerItem);
      },

      destroy: function(){
        this._destroyAllLayerItems();
        this.inherited(arguments);
      }
    });

    return clazz;
  });