/**
 * Copyright @ 2016 Esri.
 * All rights reserved under the copyright laws of the United States and applicable international laws, treaties, and conventions.
 */
define(["./Number32ArrayList","esri/views/3d/webgl-engine/lib/Util"],function(t,e){var n=0,i=0,r=e.assert,u=function(e,u,f,a){var s=e.createBuffer(),d=0,b=a?35048:35044,o=new t(u),l=!1,c=u?34962:34963;this.setData=function(t,n){r(t instanceof o.getArrayType()),e.bindBuffer(c,s),e.bufferData(c,t,b),e.bindBuffer(c,null),d=u&&f?n/f.getStride():n},this.addData=function(t,e){r(e instanceof o.getArrayType()),t!==!0?o.whole(e):o.append(e),l=!0},this.updateSubData=function(t,n,i){e.bindBuffer(c,s),e.bufferSubData(c,4*n,t.subarray(n,i)),e.bindBuffer(c,null)},this.updateData=function(t,n){e.bindBuffer(c,s),e.bufferSubData(c,4*t,n),e.bindBuffer(c,null)},this.id=u?n++:i++,this.bind=function(t){l&&(l=!1,this.setData(o.getArray(),o.getSize())),e.bindBuffer(c,s),u&&f&&f.setVertexAttribPointers(e,t)},this.unbind=function(){e.bindBuffer(c,null)},this.getNum=function(){return d},this.getId=function(){return this.id},this.dispose=function(){e.deleteBuffer(s);var t=o.getArray();t=null}};return u});