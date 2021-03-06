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
    'dojo/query',
    'dojo/Evented',
    'dojo/_base/html',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!./RelatedRecordsResult.html',
    'esri/dijit/PopupRenderer',
    'esri/layers/GraphicsLayer',
    'esri/renderers/SimpleRenderer',
    'jimu/utils',
    'jimu/symbolUtils',
    'jimu/dijit/PopupMenu',
    'jimu/FeatureActionManager'
  ],
  function(query, Evented, html, lang, array, declare, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin,
    template, PopupRenderer, GraphicsLayer, SimpleRenderer, jimuUtils, symbolUtils, PopupMenu,
    FeatureActionManager) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {

      baseClass: 'related-records-result',
      templateString: template,
      popupMenu: null,
      featureActionManager: null,
      featureSet: null,
      layer: null,


      //options:
      map: null,
      layerDefinition: null,
      nls: null,

      postCreate: function(){
        this.inherited(arguments);
        this.popupMenu = PopupMenu.getInstance();
        this.featureActionManager = FeatureActionManager.getInstance();
        if(this.layerDefinition.type !== 'Table'){
          this.layer = new GraphicsLayer();
          var type = jimuUtils.getTypeByGeometryType(this.layerDefinition.geometryType);
          var symbol = null;
          if(type === 'point'){
            symbol = symbolUtils.getDefaultMarkerSymbol();
          }else if(type === 'polyline'){
            symbol = symbolUtils.getDefaultLineSymbol();
          }else if(type === 'polygon'){
            symbol = symbolUtils.getDefaultFillSymbol();
          }
          if(symbol){
            var renderer = new SimpleRenderer(symbol);
            this.layer.setRenderer(renderer);
          }
          this.map.addLayer(this.layer);
        }
      },

      destroy: function(){
        if(this.layer){
          this.map.removeLayer(this.layer);
        }
        this.layer = null;
        this.inherited(arguments);
      },

      setResult: function(/*layerName,*/ popupTemplate, featureSet){
        if(this.layer){
          this.layer.clear();
        }
        this.featureSet = featureSet;
        // this.titleDiv.innerHTML = layerName;
        if(featureSet.features.length > 0){
          //has result
          array.forEach(featureSet.features, lang.hitch(this, function(feature){
            this._createItem(popupTemplate, feature);
            if(this.layer){
              this.layer.add(feature);
            }
          }));
          html.removeClass(this.btnAction, 'not-visible');
          html.addClass(this.noResultTip, 'not-visible');
          html.removeClass(this.content, 'not-visible');
          jimuUtils.featureAction.zoomTo(this.map, featureSet.features);
        }else{
          //no result
          html.addClass(this.btnAction, 'not-visible');
          html.removeClass(this.noResultTip, 'not-visible');
          html.addClass(this.content, 'not-visible');
        }
      },

      showLayer: function(){
        if(this.layer){
          this.layer.show();
        }
      },

      hideLayer: function(){
        if(this.layer){
          this.layer.hide();
        }
      },

      _createItem: function(popupTemplate, feature){
        var title = popupTemplate.getTitle(feature) || "";

        var str = '<div class="item">' +
                    '<div class="item-title">' + title + '</div>' +
                    '<div class="item-content"></div>' +
                  '</div>';
        var itemDom = html.toDom(str);
        var itemContentDom = query('.item-content', itemDom)[0];

        var popupRenderer = new PopupRenderer({
          template: popupTemplate,
          graphic: feature,
          chartTheme: popupTemplate.chartTheme
        });
        html.place(popupRenderer.domNode, itemContentDom);
        popupRenderer.startup();
        html.place(itemDom, this.content);
      },

      _onContentClicked: function(event){
        var target = event.target || event.srcElement;
        var itemTitleDom = null;
        if(html.hasClass(target, 'item-title')){
          itemTitleDom = target;
        }else{
          itemTitleDom = jimuUtils.getAncestorDom(target, function(dom){
            return html.hasClass(dom, 'item-title');
          }, this.content);
        }

        if(!itemTitleDom){
          return;
        }

        var itemDom = itemTitleDom.parentNode;
        html.toggleClass(itemDom, 'selected');
        var isSelected = html.hasClass(itemDom, 'selected');
        query('.item', this.content).removeClass('selected');
        if(isSelected){
          html.addClass(itemDom, 'selected');
        }
      },

      _onBtnBackClicked: function(){
        this.emit('back');
      },

      _onBtnMenuClicked: function(evt){
        if(!this.featureSet){
          return;
        }
        var position = html.position(evt.target || evt.srcElement);
        this.featureActionManager.getSupportedActions(this.featureSet).then(lang.hitch(this, function(actions){
          array.forEach(actions, lang.hitch(this, function(action){
            action.data = this.featureSet;
          }));

          actions = array.filter(actions, lang.hitch(this, function(action){
            return action.name !== 'CreateLayer';
          }));

          this.popupMenu.setActions(actions);
          this.popupMenu.show(position);
        }));
      }

    });
  });