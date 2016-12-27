/**
 * Copyright @ 2016 Esri.
 * All rights reserved under the copyright laws of the United States and applicable international laws, treaties, and conventions.
 */
define(["dojo/_base/lang","dojo/_base/declare","dojo/_base/array","esri/core/lang","esri/views/3d/webgl-engine/lib/VertexBufferLayout","esri/views/3d/webgl-engine/lib/Util","../../webgl-engine-extensions/GLXBO","../../support/fx3dUtils","../../support/fx3dUnits","../Effect","./PulseMaterial"],function(e,i,t,r,s,n,a,h,o,d,_){var g=n.assert,l=n.VertexAttrConstants,u=40.11,f={Circle:"circle",Square:"square",Triangle:"triangle",Hexagon:"hexagon",Wave:"wave"},m={circle:48,square:4,triangle:3,hexagon:6},y=i([d],{declaredClass:"esri.views.3d.effects.Pulse.PulseEffect",effectName:"Pulse",constructor:function(i){e.hitch(this,i),this.orderId=2,this._sizeInMeters=[]},_initRenderingInfo:function(){this.renderingInfo.radius=1e4,this.renderingInfo.solidColor=[255,255,20],this.renderingInfo.haloColors=[h.rgbNames.cadetblue,h.rgbNames.yellowgreen,h.rgbNames.lightpink,h.rgbNames.orangered,h.rgbNames.green,h.rgbNames.indianred],this._colorBarDirty=!0,this.renderingInfo.shapeType=f.Circle,this._drawRing=!0,this._renderingInfoDirty=!0,this._vacDirty=!0,this._shapeDirty=!0,this.inherited(arguments)},_doRenderingInfoChange:function(e){this.inherited(arguments);var i;for(i in e)e.hasOwnProperty(i)&&this.renderingInfo.hasOwnProperty(i)&&(r.endsWith(i.toLowerCase(),"info")?h.isInforAttrChanged(this.renderingInfo[i],e[i])&&(this._renderingInfoDirty=!0):r.endsWith(i.toLowerCase(),"color")?e[i]instanceof Array&&3==e[i].length&&(this.renderingInfo[i]=[e[i][0]/255,e[i][1]/255,e[i][2]/255]):r.endsWith(i.toLowerCase(),"colors")?e[i]instanceof Array&&(this.renderingInfo[i]=e[i],this._colorBarDirty=!0,this._renderingInfoDirty=!0):"shapetype"===i.toLowerCase()?(this._shapeDirty=!0,this._isAddingGeometry=!1,this._renderingInfoDirty=!0,this.renderingInfo[i]=e[i].toLowerCase(),this._colourMapDirty=!0):"radius"===i.toLowerCase()||"transparency"===i.toLowerCase()?(this._clampScope(e,i),"radius"==i&&this._radiusUnit?this.renderingInfo[i]=o.toMeters(this._radiusUnit,e[i],this._view.viewingMode):this.renderingInfo[i]=e[i]):typeof e[i]==typeof this.renderingInfo[i]&&(this.renderingInfo[i]=e[i]))},_updateDefaultLabelHeight:function(){this._layer._labelDefaultHeight=null},setContext:function(i){this.inherited(arguments),this._effectConfig&&e.isArray(this._effectConfig.renderingInfo)&&(this._radiusUnit=null,t.forEach(this._effectConfig.renderingInfo,function(e){"radius"===e.name.toLowerCase()&&(this._radiusUnit=e.unit,this.renderingInfo.radius=o.toMeters(this._radiusUnit,this.renderingInfo.radius,this._view.viewingMode))}.bind(this)))},destroy:function(){this._resetXBOs()},_resetXBOs:function(){this._dispose("_vbo"),this._dispose("_ibo")},_initVertexLayout:function(){this._vertexAttrConstants=[l.POSITION,l.AUXPOS1],this._vertexBufferLayout=new s(this._vertexAttrConstants,[3,3],[5126,5126]),this._material&&(this._material._vbLayout=this._vertexBufferLayout)},_initRenderContext:function(){this.inherited(arguments),this._vacDirty&&(this._initVertexLayout(),this._resetXBOs(),this._vacDirty=!1),this._vbo||(this._vbo=new a(this._gl,!0,this._vertexBufferLayout)),this._ibo||(this._ibo=new a(this._gl,!1));var e=!1;switch(this.renderingInfo.shapeType){case f.Circle:case f.Triangle:case f.Square:case f.Hexagon:this._geometryVertexNum=4,this._geometryIndexNum=6,this._drawRing=!0,e=this._buildRingGeometries();break;case f.Wave:this._geometryVertexNum=3,this._geometryIndexNum=6,this._drawRing=!1,e=this._buildWaveGeometries();break;default:this._drawRing=!1}return e},_getAltitude:function(e){return"number"==typeof e?u>e&&(e=u):e=u,e},_buildRingGeometries:function(){var e=this._isAddingGeometry?this._addedGraphics:this._allGraphics(),i=this._isAddingGeometry?this._toAddGraphicsIndex:0;if(e.length>0){var t,r,s,n,a=m[this.renderingInfo.shapeType],h=Math.max(3,a),o=0,d=0,_=h*this._geometryVertexNum,g=this._vertexBufferLayout.getStride(),l=new Float32Array(e.length*g*_),u=new Uint32Array(e.length*h*this._geometryIndexNum),f=0,y=0;for(r=0;r<e.length;r++)if(t=e[r],null!=t.geometry){for(s=0;_>s;s++)o=(r*_+s)*g,f=s%this._geometryVertexNum,l[0+o]=t.geometry.longitude,l[1+o]=t.geometry.latitude,l[2+o]=this._getAltitude(t.geometry.altitude),l[3+o]=r+i,l[4+o]=f,y=Math.floor(s/4),(2===f||3===f)&&(y+=1),l[5+o]=y/h;for(n=(r+i)*_,s=0;h>s;s++)d=(r*h+s)*this._geometryIndexNum,u[0+d]=0+n+s*this._geometryVertexNum,u[1+d]=2+n+s*this._geometryVertexNum,u[2+d]=1+n+s*this._geometryVertexNum,u[3+d]=0+n+s*this._geometryVertexNum,u[4+d]=3+n+s*this._geometryVertexNum,u[5+d]=2+n+s*this._geometryVertexNum}return this._vbo.addData(this._isAddingGeometry,l),this._ibo.addData(this._isAddingGeometry,u),this._resetAddGeometries(),!0}return!1},_buildWaveGeometries:function(){var e=this._isAddingGeometry?this._addedGraphics:this._allGraphics(),i=this._isAddingGeometry?this._toAddGraphicsIndex:0;if(e.length>0){this._waveSegments=32;var t,r,s,n,a,h,o,d=this._waveSegments,_=d-1,l=[],u=[];for(a=0;d>a;a++)for(n=0;d>n;n++)l.push([n,a]),d-1>a&&d-1>n&&(h=a*d+n,o=(a+1)*d+n,u.push([h,o,h+1,h+1,o,o+1]));var f=l.length,m=this._vertexBufferLayout.getStride(),y=new Float32Array(e.length*m*f),c=_*_*this._geometryIndexNum;g(u.length*u[0].length===c);var v,x=new Uint32Array(e.length*c),b=0,I=0;for(t=0;t<e.length;t++){for(v=e[t],r=0;f>r;r++)b=(t*f+r)*m,y[0+b]=v.geometry.longitude,y[1+b]=v.geometry.latitude,y[2+b]=this._getAltitude(v.geometry.altitude),y[3+b]=t+i,y[4+b]=l[r][0],y[5+b]=l[r][1];for(s=t*f+i,r=0;r<u.length;r++)I=(t*u.length+r)*this._geometryIndexNum,x[0+I]=u[r][0]+s,x[1+I]=u[r][1]+s,x[2+I]=u[r][2]+s,x[3+I]=u[r][3]+s,x[4+I]=u[r][4]+s,x[5+I]=u[r][5]+s}return this._vbo.addData(this._isAddingGeometry,y),this._ibo.addData(this._isAddingGeometry,x),this._resetAddGeometries(),!0}return!1},_initColorBar:function(){if(!this._colorBarDirty)return!0;this._colorBarTexture||(this._colorBarTexture=this._gl.createTexture()),this._gl.bindTexture(3553,this._colorBarTexture),this._gl.pixelStorei(37440,!0),this._gl.texParameteri(3553,10240,9728),this._gl.texParameteri(3553,10241,9728),this._gl.texParameteri(3553,10242,33071),this._gl.texParameteri(3553,10243,33071);var e=h.createColorBarTexture(32,1,this.renderingInfo.haloColors);return this._gl.texImage2D(3553,0,6408,6408,5121,e),this._gl.generateMipmap(3553),this._gl.bindTexture(3553,null),0===this._gl.getError()?!0:!1},_loadShaders:function(){return this.inherited(arguments),this._material||(this._material=new _({gl:this._gl,vbLayout:this._vertexBufferLayout,shaderSnippets:this._shaderSnippets})),this._material.loadShaders()},render:function(i){this.inherited(arguments),this._layer.visible&&this.ready&&this._bindPramsReady()&&(this._material.bind(e.mixin({},{drg:this._drawRing,wss:this._waveSegments,svfe:this._vizFieldVerTextures[this._vizFieldDefault],evfe:this._vizFieldVerTextures[this._vizFields[this._currentVizPage]],vfvs:this._vizFieldVerTextureSize,ail:this.renderingInfo.animationInterval,irs:[this._scopes.radius[0],this.renderingInfo.radius],tcy:this.renderingInfo.transparency,cbte:this._colorBarTexture,minValue:this._vizFieldMinMaxs[this._vizFieldDefault].min>this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].min?this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].min:this._vizFieldMinMaxs[this._vizFieldDefault].min,maxValue:this._vizFieldMinMaxs[this._vizFieldDefault].max>this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].max?this._vizFieldMinMaxs[this._vizFieldDefault].max:this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].max,scr:this.renderingInfo.solidColor},i)),this._vbo.bind(this._material.getProgram()),this._ibo.bind(),this._gl.drawElements(4,this._ibo.getNum(),5125,0),this._material.release(),this._vbo.unbind(),this._ibo.unbind())}});return y});