define([
    'dojo/_base/declare',
    'jimu/BaseWidget',
    "dojo/on",
    "esri/layers/ArcGISDynamicMapServiceLayer",
    "esri/layers/ArcGISTiledMapServiceLayer"
    ],
    function (declare, BaseWidget,on,Dynamic,Tiled) {
    return declare([BaseWidget], {
        baseClass: "",
        postCreate: function ()
        {
            _self = this;
            on(this.btnAddMS, "click", function () {
                var layerURL = _self.MSURL.value;
                if (layerURL != "") {
                    var layer=null;
                    if (_self.checkIsTile.checked) {
                        layer = new Dynamic(layerURL);
                    }
                    else {
                        layer = new Tiled(layerURL);
                    }
                    if (layer) { _self.map.addLayer(layer); }
                }
                else {
                    //Show Message to user later will use exit message widget 
                    alert(_self.nls.layerEmptyMessage);
                }
            });
        }
    });
});