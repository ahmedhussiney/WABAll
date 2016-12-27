define([
    'dojo/_base/declare',
    'jimu/BaseWidget',
    "dojo/on",
    ],
    function (declare, BaseWidget,on,Dynamic,Tiled) {
    return declare([BaseWidget], {
        baseClass: "",
        postCreate: function () {
            _self = this;
        }
    });
});