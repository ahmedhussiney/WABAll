/**
 * Copyright @ 2016 Esri.
 * All rights reserved under the copyright laws of the United States and applicable international laws, treaties, and conventions.
 */
define(["dojo/_base/lang","dojo/_base/declare","dojo/_base/array","esri/core/lang","esri/views/3d/webgl-engine/lib/VertexBufferLayout","esri/views/3d/webgl-engine/lib/Util","esri/views/3d/webgl-engine/lib/gl-matrix","../../webgl-engine-extensions/GLXBO","../../webgl-engine-extensions/GLVerTexture","../../support/fx3dUtils","../../support/fx3dUnits","../../support/interpolationUtils","../Effect","./BounceMaterial"],function(e,i,t,s,r,n,a,h,o,l,d,_,u,g){var c,m,f,v=a.vec3d,p=a.vec2,x=40.11,b=v.create(),w=v.create(),I=v.create(),y=v.create(),F=v.create(),M=v.create(),z=v.create(),P=v.create(),T=v.create(),V=v.createFrom(0,0,1),B=0,D=-1,A=0,C=n.VertexAttrConstants,L=i([u],{declaredClass:"esri.views.3d.effects.Bounce.BounceEffect",effectName:"Bounce",constructor:function(i){e.hitch(this,i),this.orderId=2,this._pointsNum=15,this._cachedFlyPaths={},this._cachedPulses={},this._timeAwareFids=[],this._needsAllLoaded=!0,this._layer.timeInfo instanceof Object?(this._hasTimeInfo=!0,this._needsRenderPath=!1):this._hasTimeInfo=!1,this._hasTimeInfo=!1},_initRenderingInfo:function(){this.renderingInfo.radius=30,this.renderingInfo.dashHeight=1e5,this.renderingInfo.haloColors=[l.rgbNames.cadetblue,l.rgbNames.yellowgreen,l.rgbNames.lightpink,l.rgbNames.orangered,l.rgbNames.green,l.rgbNames.indianred],this._colorBarDirty=!0,this._renderingInfoDirty=!0,this._vacDirty=!0,this._shapeDirty=!0,this.inherited(arguments)},_doRenderingInfoChange:function(e){this.inherited(arguments);for(var i in e)e.hasOwnProperty(i)&&this.renderingInfo.hasOwnProperty(i)&&(s.endsWith(i.toLowerCase(),"info")?l.isInforAttrChanged(this.renderingInfo[i],e[i])&&(this._renderingInfoDirty=!0):s.endsWith(i.toLowerCase(),"color")?e[i]instanceof Array&&3==e[i].length&&(this.renderingInfo[i]=[e[i][0]/255,e[i][1]/255,e[i][2]/255]):s.endsWith(i.toLowerCase(),"colors")?e[i]instanceof Array&&(this.renderingInfo[i]=e[i],this._colorBarDirty=!0,this._renderingInfoDirty=!0):"radius"===i.toLowerCase()||"dashHeight"===i.toLowerCase()||"tcy"===i.toLowerCase()?(this._clampScope(e,i),"radius"==i&&this._radiusUnit?this.renderingInfo[i]=d.toMeters(this._radiusUnit,e[i],this._view.viewingMode):"dashHeight"==i&&this._dashHeightUnit?(this.renderingInfo[i]=d.toMeters(this._dashHeightUnit,e[i],this._view.viewingMode),this._updateDefaultLabelHeight()):this.renderingInfo[i]=e[i]):typeof e[i]==typeof this.renderingInfo[i]&&(this.renderingInfo[i]=e[i]))},_updateDefaultLabelHeight:function(){var e=this._pointsNum*this.renderingInfo.dashHeight;this._layer._labelDefaultHeight={flag:0,min:e,max:e}},setContext:function(i){this.inherited(arguments),this._effectConfig&&e.isArray(this._effectConfig.renderingInfo)&&(this._radiusUnit=null,this._dashHeightUnit=null,t.forEach(this._effectConfig.renderingInfo,function(e){"radius"===e.name.toLowerCase()?(this._radiusUnit=e.unit,this.renderingInfo.radius=d.toMeters(this._radiusUnit,this.renderingInfo.radius,this._view.viewingMode)):"dashHeight"===e.name.toLowerCase()&&(this._dashHeightUnit=e.unit,this.renderingInfo.dashHeight=d.toMeters(this._dashHeightUnit,this.renderingInfo.dashHeight,this._view.viewingMode),this._updateDefaultLabelHeight())}.bind(this)),this._aroundVerticesTexture=new o(this._gl),this._aroundVerticesTextureSize=p.create())},destroy:function(){this._resetXBOs(),this._dispose("_aroundVerticesTexture")},_resetXBOs:function(){this._dispose("_vbo"),this._dispose("_ibo"),this._dispose("_pulseVBO"),B=0,D=-1,c=0,A=0,this._needsRenderPath=!1},_initVertexLayout:function(){this._vertexAttrConstants=[C.POSITION,C.AUXPOS1],this._vertexBufferLayout=new r(this._vertexAttrConstants,[3,2],[5126,5126]),this._material&&(this._material._vbLayout=this._vertexBufferLayout)},_initRenderContext:function(){return this.inherited(arguments),this._vacDirty&&(this._initVertexLayout(),this._resetXBOs(),this._vacDirty=!1),this._vbo||(this._vbo=new h(this._gl,!0,this._vertexBufferLayout)),this._ibo||(this._ibo=new h(this._gl,!1)),this._pulseVBO||(this._pulseVBO=new h(this._gl,!0,this._vertexBufferLayout)),this._hasTimeInfo?this._buildTimeAwareAroundPathGeometries():this._buildVerticalGeometries()},_buildTimeAwareAroundPathGeometries:function(){var e,i,t=this._allGraphics();if(t.sort(function(t,s){return e=t.attributes[this._layer.timeInfo.startTimeField],i=s.attributes[this._layer.timeInfo.startTimeField],e===i?0:i>e?1:e>i?-1:0}.bind(this)),this._cachedFlyPaths={},this._timeAwareFids=[],t.length>1){for(var s,r,n,a,h,o,d,u,g,c,m,f=[],p=0,B=t.length-1;B>p;p++)if(null!=t[p].geometry){for(s=t[p].geometry,s.altitude||(s.altitude=x),r=t[p+1].geometry,r.altitude||(r.altitude=x),v.set3(s.longitude,s.latitude,s.altitude,b),"global"===this._view.viewingMode?l.wgs84ToSphericalEngineCoords(b,0,b,0):"local"===this._view.viewingMode&&l.wgs84ToWebMerc(b,0,b,0),v.set3(r.longitude,r.latitude,r.altitude,w),"global"===this._view.viewingMode?l.wgs84ToSphericalEngineCoords(w,0,w,0):"local"===this._view.viewingMode&&l.wgs84ToWebMerc(w,0,w,0),0==p&&this._initPulseGeometries(p,t[p]),v.subtract(b,w,I),h=v.length(I),"global"===this._view.viewingMode?n=5e5>=h?18:1e6>=h?40:Math.floor(1e-5*h):"local"===this._view.viewingMode&&(n=1e6>=h?10:2e6>=h?18:Math.floor(6e-6*h)),m=.6*h,v.lerp(b,w,.5,y),"global"===this._view.viewingMode?(c=v.length(y),v.normalize(y,y),v.scale(y,c+m,y)):"local"===this._view.viewingMode&&(v.scale(V,m,T),v.add(y,T,y)),v.normalize(I,I),v.scale(I,m,F),v.add(y,F,M),v.scale(I,-m,z),v.add(y,z,P),this._cachedFlyPaths[t[p].attributes.FID]={vertices:null,indices:null},f=_.getPoints(n,b,b,M,y),f.pop(),f=f.concat(_.getPoints(n,y,P,w,w)),a=f.length,o=[],d=[],u=0,g=a;g>u;u++)o.push(f[u][0],f[u][1],f[u][2],u,a),g-1>u&&0===(1&u)&&(d.push(u,u+1),u+1===a-2&&d.push(u+1,u+2));this._cachedFlyPaths[t[p].attributes.FID].vertices=new Float32Array(o),this._cachedFlyPaths[t[p].attributes.FID].indices=new Uint32Array(d),this._timeAwareFids.push(t[p].attributes.FID),this._initPulseGeometries(p+1,t[p+1])}return this._resetAddGeometries(),!0}return 1==t.length?(this._initPulseGeometries(0,t[0]),this._resetAddGeometries(),!0):!1},_initPulseGeometries:function(e,i){if(i.geometry){var t,s,r=i.geometry,n=this._vertexBufferLayout.getStride(),a=new Float32Array(this._pointsNum*n);for(t=0;t<this._pointsNum;t++)s=n*t,a[s+0]=r.longitude,a[s+1]=r.latitude,a[s+2]=null==r.altitude?x:x+r.altitude,a[s+3]=t==this._pointsNum-1?-this._pointsNum-1:t+1,a[s+4]=e;this._cachedPulses[i.attributes.FID]={vertices:a}}},_buildVerticalGeometries:function(){var e=this._allGraphics();if(e.length>0){var i,t=this._vertexBufferLayout.getStride(),s=new Float32Array(e.length*t*this._pointsNum),r=0,n=0,a=0;for(n=0;n<e.length;n++)if(i=e[n].geometry)for(a=0;a<this._pointsNum;a++)r=(n*this._pointsNum+a)*t,s[r+0]=i.longitude,s[r+1]=i.latitude,s[r+2]=null==i.altitude?x:x+i.altitude,s[r+3]=a==this._pointsNum-1?-this._pointsNum-1:a+1,s[r+4]=n;return this._pulseVBO.addData(!1,s),this._resetAddGeometries(),!0}return!1},_initAroundVerticesTexture:function(){if(2*this._pathIdNum!==this._tmpPoints.length)return!1;var e=this._gl.getParameter(3379),i=2,t=this._pathIdNum*i,s=l.nextHighestPowerOfTwo(t);s>e&&(s=e,console.warn("Too many graphics, and some data will be discarded."));var r=Math.ceil(t/s);r=l.nextHighestPowerOfTwo(r),r>e&&(r=e,console.warn("Too many graphics, and some data will be discarded."));for(var n,a=new Float32Array(s*r*4),h=0;h<this._pathIdNum;h++)n=h*i*4,a[0+n]=h,a[1+n]=this._tmpPoints[h*i][0],a[2+n]=this._tmpPoints[h*i][1],a[3+n]=this._tmpPoints[h*i][2],a[4+n]=h,a[5+n]=this._tmpPoints[h*i+1][0],a[6+n]=this._tmpPoints[h*i+1][1],a[7+n]=this._tmpPoints[h*i+1][2];return this._aroundVerticesTexture.setData(s,r,a),p.set2(s,r,this._aroundVerticesTextureSize),!0},_loadShaders:function(){return this.inherited(arguments),this._material||(this._material=new g({gl:this._gl,vbLayout:this._vertexBufferLayout,shaderSnippets:this._shaderSnippets,local:"local"==this._view.viewingMode})),this._material.loadShaders(this._hasTimeInfo)},_initColourMap:function(){this._colourMapTexture||(this._colourMapTexture=this._gl.createTexture());var e=new Image;e.src=l.spriteImg;var i=this;return e.onload=function(){i._gl.bindTexture(3553,i._colourMapTexture),i._gl.pixelStorei(37440,!0),i._gl.texParameteri(3553,10240,9728),i._gl.texParameteri(3553,10241,9728),i._gl.texParameteri(3553,10242,33071),i._gl.texParameteri(3553,10243,33071),i._gl.texImage2D(3553,0,6408,6408,5121,e),i._gl.generateMipmap(3553),i._gl.bindTexture(3553,null)},0===this._gl.getError()?!0:!1},_initColorBar:function(){if(!this._colorBarDirty)return!0;this._colorBarTexture||(this._colorBarTexture=this._gl.createTexture()),this._gl.bindTexture(3553,this._colorBarTexture),this._gl.pixelStorei(37440,!0),this._gl.texParameteri(3553,10240,9728),this._gl.texParameteri(3553,10241,9728),this._gl.texParameteri(3553,10242,33071),this._gl.texParameteri(3553,10243,33071);var e=l.createColorBarTexture(32,1,this.renderingInfo.haloColors);return this._gl.texImage2D(3553,0,6408,6408,5121,e),this._gl.generateMipmap(3553),this._gl.bindTexture(3553,null),0===this._gl.getError()?!0:!1},render:function(e){this.inherited(arguments),this._layer.visible&&this.ready&&this._bindPramsReady()&&(this._hasTimeInfo?this._renderWithTimeInfo(e):this._renderWithoutTimeInfo(e))},_renderWithTimeInfo:function(i){this._material.bind(e.mixin({},{vv:this._vizFieldVerTextures[this._vizFields[this._currentVizPage]],vvs:this._vizFieldVerTextureSize,cmt:this._colourMapTexture,ai:this.renderingInfo.animationInterval,tcy:this.renderingInfo.transparency,minValue:this._vizFieldMinMaxs[this._vizFieldDefault].min>this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].min?this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].min:this._vizFieldMinMaxs[this._vizFieldDefault].min,maxValue:this._vizFieldMinMaxs[this._vizFieldDefault].max>this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].max?this._vizFieldMinMaxs[this._vizFieldDefault].max:this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].max,cbt:this._colorBarTexture,sz:[this._scopes.radius[0],this.renderingInfo.radius,this.renderingInfo.dashHeight]},i)),B=Math.floor(this.time/this.renderingInfo.ai),this._repeatCount=Math.floor(B/this._timeAwareFids.length),B%=this._timeAwareFids.length,this._repeatCount>this.renderingInfo.repeat&&(B=this._timeAwareFids.length-1),B!=D&&(0==(1&B)?(f=this._cachedPulses[this._timeAwareFids[c++]],this._pulseVBO.addData(!0,f.vertices),A=c-1):c>0&&(m=this._cachedFlyPaths[this._timeAwareFids[c-1]],this._vbo.addData(!1,m.vertices),this._ibo.addData(!1,m.indices),A=-1),D=B),this._material.bindBoolean("dfp",!1),this._material.bindFloat("cix",A),this._material.blend(!0),this._pulseVBO.bind(this._material.getProgram()),this._gl.drawArrays(0,0,this._pulseVBO.getNum()),this._pulseVBO.unbind(),1==(1&B)&&(this._material.bindBoolean("dfp",!0),this._material.blend(!1),this._vbo.bind(this._material.getProgram()),this._ibo.bind(),this._gl.drawElements(1,this._ibo.getNum(),5125,0),this._ibo.unbind(),this._vbo.unbind()),this._material.release()},_renderWithoutTimeInfo:function(i){this._material.bind(e.mixin({},{vv:this._vizFieldVerTextures[this._vizFields[this._currentVizPage]],vvs:this._vizFieldVerTextureSize,cmt:this._colourMapTexture,ai:this.renderingInfo.animationInterval,tcy:this.renderingInfo.transparency,minValue:this._vizFieldMinMaxs[this._vizFieldDefault].min>this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].min?this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].min:this._vizFieldMinMaxs[this._vizFieldDefault].min,maxValue:this._vizFieldMinMaxs[this._vizFieldDefault].max>this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].max?this._vizFieldMinMaxs[this._vizFieldDefault].max:this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].max,cbt:this._colorBarTexture,sz:[this._scopes.radius[0],this.renderingInfo.radius,this.renderingInfo.dashHeight]},i)),this._material.blend(!0),this._pulseVBO.bind(this._material.getProgram()),this._gl.drawArrays(0,0,this._pulseVBO.getNum()),this._pulseVBO.unbind(),this._material.release()}});return L});