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
    'dojo/_base/array',
    'dojo/_base/lang',
    'dojo/_base/html',

    'dojo/Deferred',

    'dojo/dom-class',
    'dojo/dom-style',
    'dojo/on',
    'dojo/query',
    'dojo/store/Memory',

    'dijit/form/Select',
    'dijit/form/ValidationTextBox',
    'dijit/_WidgetsInTemplateMixin',

    'esri/request',

    'jimu/BaseWidgetSetting',
    'jimu/dijit/Message',
    'jimu/dijit/LoadingShelter',
    'jimu/dijit/SimpleTable'
  ],
  function(
    declare, array, lang, html,
    Deferred,
    domClass, domStyle, on, query, Memory,
    Select, ValidationTextBox, _WidgetsInTemplateMixin, esriRequest,
    BaseWidgetSetting, Message, LoadingShelter
  ) {

    function _filterFields(fields) {
      var displayFields = [],
          vizFields = [],
          validTypes = ["esriFieldTypeSmallInteger",
                        "esriFieldTypeInteger",
                        "esriFieldTypeSingle",
                        "esriFieldTypeDouble"
                       ],
          invalidNames = ["lat", "latitude", "y", "ycenter", "latitude83", "latdecdeg", "POINT-Y",
                          "lon", "lng", "long", "longitude", "x", "xcenter",
                          "longitude83", "longdecdeg", "POINT-X",
                          "alt", "altitude", "z", "POINT-Z", "zcenter", "altitude83", "altdecdeg"
                         ];

      array.forEach(fields, function(f) {
        displayFields.push(f.name);
        var n = f.name.toLowerCase();
        if (validTypes.indexOf(f.type) > -1 && invalidNames.indexOf(n) === -1) {
          vizFields.push(f.name);
        }
      });

      return {
        displayFields: displayFields,
        vizFields: vizFields
      };
    }

    function _fetchService(url, callback) {
      return esriRequest({
        url: url,
        content: lang.mixin({ f: "json" }, {}),
        handleAs: "json",
        callbackParamName: "callback"
      }).then(function(response) {
        // Update URL scheme if the response was obtained via HTTPS
        // See esri/request for context regarding "response._ssl"
        if (response._ssl) {
          delete response._ssl;
          url = url.replace(/^http:/i, "https:");
        }
        if (response.type === "Feature Layer") {
          var result = {};
          lang.mixin(result, _filterFields(response.fields));
          callback(null, result);
        } else {
          callback("Viz widget can only accecpt a feature service.");
        }
      }, function(error){
        console.log(error);
        callback("Viz widget can only accecpt a valid feature service.");
      });
    }

    // Return a Deferred object
    function getFields(featureLayer) {
      var dfd = new Deferred();
      if (lang.isString(featureLayer)) {
        _fetchService(featureLayer, function(err, response) {
          if (err) {
            dfd.reject(err);
          } else {
            dfd.resolve(response);
          }
        });
      } else {
        dfd.reject("Viz widget can only accecpt a feature service url now.");
      }
      return dfd;
    }

    return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {

      //these two properties is defined in the BaseWidget
      baseClass: 'jimu-widget-viz-setting',

      postCreate: function() {
        this.inherited(arguments);

        this.layers = [];
        this.fldOptions = [];
        this._selectedLyrId = null;
        this.loadingCover = new LoadingShelter({hidden: true});
        this.loadingCover.placeAt(this.domNode);
        this.loadingCover.startup();
      },

      startup: function() {
        this.inherited(arguments);
        this._processLayers();
        this._postProcessLayers();
        on(this.vizType, "change", lang.hitch(this, this._changeVizType));
      },

      setBasicConfig: function(config) {
        this.config = config;

        // Viz settings
        if (this.config.vizType) {
          this.vizType.set('value', lang.trim(this.config.vizType));
        }
        this._changeVizType();

        if (this.config.showPercent) {
          this.showPercent.set('value', true);
        }

        if (this.config.cycleColors) {
          this.cycleColors.set('value', true);
        }

        if (this.config.maxHeight) {
          this.maxHeight.set('value', this.config.maxHeight);
        }

        if (this.config.maxWidth) {
          this.maxWidth.set('value', this.config.maxWidth);
        }

        if (this.config.interval) {
          this.interval.set('value', this.config.interval);
        }
      },

      _refreshList: function() {
        if (this.config.displayField) {
          this.displayField.set('value', lang.trim(this.config.displayField));
        }

        array.forEach(this.config.vizFields, lang.hitch(this, function(fld) {
          this._populateTableRow(fld);
        }));
      },

      getConfig: function() {

        // Viz settings
        this.config.vizType = lang.trim(this.vizType.value);

        this.config.showPercent = this.showPercent.checked;

        this.config.cycleColors = this.cycleColors.checked;

        this.config.maxHeight = this.maxHeight.value;

        this.config.maxWidth = this.maxWidth.value;

        this.config.interval = this.interval.value;

        // Layer settings
        if (this.layers.length > 0) {

          var valid = this._validateVizType();
          if (!valid) {
            return false;
          }

          var lyr = this._getLayerById(this.vizLayer.value);

          var url = lyr.url;
          if (typeof lyr.layerId === "number") {
            url += "/"  + lyr.layerId;
          }
          this.config.vizLayer = {
            id: lyr.id,
            url: url
          };

          this.config.displayField = lang.trim(this.displayField.value);

          var flds = [];
          var trs = this.table.getRows();
          array.forEach(trs, function(tr) {
            var fld = lang.trim(tr.selectField.value);
            var alias = tr.selectField.attr('displayedValue');
            var lbl = lang.trim(tr.labelText.value);
            flds.push({
              field: fld,
              alias: alias,
              label: lbl
            });
          });
          this.config.vizFields = flds;

        }

        if (!this.config.vizLayer || !this.config.vizFields || this.config.vizFields.length === 0) {
          return false;
        }

        return this.config;
      },

      _processLayers: function() {
        var map = this.sceneView.map;
        var i, j;
        var mapLayers = map.layers.toArray(),
            subLayers;
        for (i = mapLayers.length - 1; i >= 0; i--) {
          if (mapLayers[i].declaredClass === "esri.layers.FeatureLayer" &&
            mapLayers[i].listMode === "show") {
            this.layers.push(map.findLayerById(mapLayers[i].id));
          } else if (mapLayers[i].declaredClass === "esri.layers.GroupLayer") {
            subLayers = mapLayers[i].layers.toArray();
            for (j = 0; j < subLayers.length; j++) {
              if (subLayers[j].declaredClass === "esri.layers.FeatureLayer" &&
                subLayers[j].listMode === "show") {
                this.layers.push(map.findLayerById(subLayers[j].id));
              }
            }
          }
        }
      },

      _postProcessLayers: function() {
        if (this.layers.length === 0) {
          domStyle.set(this.layerSection, "display", "none");
          new Message({
            message: this.nls.no_layers
          });
          this.loadingCover.hide();
          this.setBasicConfig(this.config);
          this._refreshList();
          return;
        }

        array.forEach(this.layers, lang.hitch(this, function(lyr) {
          var obj = {
            label: lyr.title,
            value: lyr.id
          };
          this.vizLayer.addOption(obj);
        }));

        this.own(on(this.vizLayer, 'change', lang.hitch(this, this._setVizLayer)));
        this.own(on(this.btnAdd, 'click', lang.hitch(this, this._addRow)));

        this.setBasicConfig(this.config);
        // It will trigger onchange event of this.vizLayer if this.config.vizLayer is valid
        if (this.config.vizLayer) {
          this.vizLayer.set('value', lang.trim(this.config.vizLayer.id));
        } else {
          this._setVizLayer();
        }
      },

      _getLayerById: function(id) {
        var lyrs = array.filter(this.layers, function(lyr) {
          return lyr.id === id;
        });
        if (lyrs.length > 0) {
          return lyrs[0];
        }
        return null;
      },

      _setVizLayer: function() {
        var lyr = this._getLayerById(this.vizLayer.value);
        // Do nothing when the new lyr is selected before
        if (lyr.id === this._selectedLyrId) {
          return;
        }
        this._selectedLyrId = lyr.id;
        this.loadingCover.show();
        this.table.clear();
        this._setFields(lyr);
      },

      _setFields: function(lyr) {
        var flds = [];
        this.fldOptions = [];
        var url = lyr.url;
        if (typeof lyr.layerId === 'number') {
          url += "/" + lyr.layerId;
        }
        getFields(url).then(function(response) {
          // success
          if (lang.isObject(response)) {
            array.forEach(response.displayFields, lang.hitch(this, function(name) {
              flds.push(this._getFieldOption(lyr, name));
            }.bind(this)));
            array.forEach(response.vizFields, lang.hitch(this, function(name) {
              this.fldOptions.push(this._getFieldOption(lyr, name));
            }.bind(this)));
            var store = new Memory({
              idProperty: "label",
              data: flds
            });
            this.displayField.set("labelAttr", "label");
            this.displayField.setStore(store);
            // Refresh the list
            if (this.config.vizLayer && this.config.vizLayer.id === lyr.id) {
              this._refreshList();
            }
            // Hide loading shelter
            this.loadingCover.hide();
          }
        }.bind(this), function(err) {
          console.warn(err);
          this.loadingCover.hide();
        }.bind(this));
      },

      _getFieldOption: function(lyr, name) {
        var option = {
          label: name,
          value: name
        };
        if (lyr.popupTemplate && lyr.popupTemplate.fieldInfos instanceof Array) {
          array.some(lyr.popupTemplate.fieldInfos, function(f) {
            if (f.fieldName === name) {
              option.label = f.label;
              return true;
            }
          });
        }
        return option;
      },

      _populateTableRow: function(info) {
        var tr = this._addRow();
        if (tr) {
          tr.selectField.set('value', info.field);
          tr.labelText.set('value', info.label);
        }
      },

      _addRow: function() {
        var result = this.table.addRow({});
        if (result.success && result.tr) {
          var tr = result.tr;
          this._addField(tr);
          this._addLabel(tr);
          return tr;
        }
      },

      _addField: function(tr) {
        var options = lang.clone(this.fldOptions);
        var td = query('.simple-table-cell', tr)[0];
        if (td) {
          html.setStyle(td, "verticalAlign", "middle");
          var node = new Select({
            style: {
              width: "100%",
              height: "30px"
            },
            options: options
          });
          node.placeAt(td);
          node.startup();
          tr.selectField = node;
        }
      },

      _addLabel: function(tr) {
        var td = query('.simple-table-cell', tr)[1];
        html.setStyle(td, "verticalAlign", "middle");
        var node = new ValidationTextBox({
          style: {
            width: "100%",
            height: "30px"
          }
        });
        node.placeAt(td);
        node.startup();
        tr.labelText = node;
      },

      _validateVizType: function() {
        var valid = false;
        if (this.vizLayer.value) {
          var lyr = this._getLayerById(this.vizLayer.value);
          var geomType = lyr.geometryType;
          var vizType = this.vizType.value;
          switch (vizType) {
            case ("Fireball"):
            case ("JetTrail"):
              if (geomType === "polyline" ) {
                valid = true;
              }
              break;
            default:
              if (geomType === "point" ) {
                valid = true;
              }
              break;
          }
        }
        if (!valid) {
          console.log(this.vizType);
          new Message({
            message: this.vizType.attr('displayedValue') + ": " + this.nls.viz_not_supported
          });
        }
        return valid;
      },

      _changeVizType: function() {
        var vizType = this.vizType.value;
        console.log("changing Viz Type", vizType);
        switch (vizType) {
          case ("Fireball"):
          case ("JetTrail"):
          case ("Bounce"):
            domClass.add(this.maxWidthLabel, "label-disabled");
            domClass.add(this.maxHeightLabel, "label-disabled");
            this.maxWidth.set("disabled", true);
            this.maxHeight.set("disabled", true);
            this.maxWidth.set("readOnly", true);
            this.maxHeight.set("readOnly", true);
            break;
          default:
            domClass.remove(this.maxWidthLabel, "label-disabled");
            domClass.remove(this.maxHeightLabel, "label-disabled");
            this.maxWidth.set("disabled", false);
            this.maxHeight.set("disabled", false);
            this.maxWidth.set("readOnly", false);
            this.maxHeight.set("readOnly", false);
            break;
        }
      }

    });
  });
