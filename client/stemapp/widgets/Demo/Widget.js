define(['dojo/_base/declare',"dojo/on",'jimu/BaseWidget','dijit/_WidgetsInTemplateMixin'],
function(declare,on,BaseWidget,_WidgetsInTemplateMixin) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget,_WidgetsInTemplateMixin], {
    // DemoWidget code goes here 
	  baseClass: 'jimu-widget-demo',
	  postCreate: function () 
	  {
		  _self=this;
		on(this.txtWelcome, "keyup", function(){
           _self.content.innerHTML="Hi "+ _self.txtWelcome.displayedValue;;
        });
		
		on(this.zoomToHomeButto,"click",function(){
			
			var egyExtent = new esri.geometry.Extent({
			"xmin":1790502.6953578307,"ymin":2373129.5673113153,"xmax":5131718.075758567,"ymax":3823598.616050434,
			"spatialReference":{"wkid":102100}
			});
			_self.map.setExtent(egyExtent);
		})
	  }
  });
});