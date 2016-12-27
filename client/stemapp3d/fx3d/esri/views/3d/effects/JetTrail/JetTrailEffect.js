/**
 * Copyright @ 2016 Esri.
 * All rights reserved under the copyright laws of the United States and applicable international laws, treaties, and conventions.
 */
define(["dojo/_base/lang","dojo/_base/declare","dojo/_base/array","esri/core/lang","esri/views/3d/webgl-engine/lib/VertexBufferLayout","esri/views/3d/webgl-engine/lib/Util","esri/views/3d/webgl-engine/lib/gl-matrix","../../webgl-engine-extensions/GLXBO","../../webgl-engine-extensions/GLVerTexture","../../support/fx3dUtils","../../support/fx3dUnits","../Effect","./JetTrailMaterial"],function(e,i,t,s,r,n,a,h,l,o,d,_,u){var g=a.vec3d,f=a.vec2,c=1.11,v=g.create(),m=g.create(),p=g.create(),x=0,w=n.VertexAttrConstants,I={ALONG:0,AROUND:1},M={HEAD:1,TAIL:4},b=i([_],{declaredClass:"esri.views.3d.effects.JetTrail.JetTrailEffect",effectName:"JetTrail",constructor:function(i){e.hitch(this,i),this.orderId=2,this._needsAllLoaded=!0},_initRenderingInfo:function(){this.renderingInfo.radius=20,this.renderingInfo.pulseRadius=1e5,this.renderingInfo.colors=[o.rgbNames.cadetblue,o.rgbNames.yellowgreen,o.rgbNames.lightpink,o.rgbNames.orangered,o.rgbNames.green,o.rgbNames.indianred],this._colorBarDirty=!0,this._renderingInfoDirty=!0,this._curveType=I.AROUND,this._vacDirty=!0,this._shapeDirty=!0,this._needsRenderPulse=!1,this.inherited(arguments)},_doRenderingInfoChange:function(e){this.inherited(arguments);var i;for(i in e)e.hasOwnProperty(i)&&this.renderingInfo.hasOwnProperty(i)&&(s.endsWith(i.toLowerCase(),"info")?o.isInforAttrChanged(this.renderingInfo[i],e[i])&&(this._renderingInfoDirty=!0):s.endsWith(i.toLowerCase(),"colors")?e[i]instanceof Array&&(this.renderingInfo[i]=e[i],this._colorBarDirty=!0,this._renderingInfoDirty=!0):"radius"===i.toLowerCase()||"pulseRadius"===i.toLowerCase()||"transparency"===i.toLowerCase()?(this._clampScope(e,i),"radius"==i&&this._radiusUnit?this.renderingInfo[i]=d.toMeters(this._radiusUnit,e[i],this._view.viewingMode):"pulseRadius"==i&&this._pulseRadiusUnit?this.renderingInfo[i]=d.toMeters(this._pulseRadiusUnit,e[i],this._view.viewingMode):this.renderingInfo[i]=e[i]):typeof e[i]==typeof this.renderingInfo[i]&&(this.renderingInfo[i]=e[i]))},setContext:function(i){this.inherited(arguments),this._effectConfig&&e.isArray(this._effectConfig.renderingInfo)&&(this._radiusUnit=null,this._pulseRadiusUnit=null,t.forEach(this._effectConfig.renderingInfo,function(e){"radius"===e.name.toLowerCase()?(this._radiusUnit=e.unit,this.renderingInfo.radius=d.toMeters(this._radiusUnit,this.renderingInfo.radius,this._view.viewingMode)):"pulseRadius"===e.name.toLowerCase()&&(this._pulseRadiusUnit=e.unit,this.renderingInfo.pulseRadius=d.toMeters(this._pulseRadiusUnit,this.renderingInfo.pulseRadius,this._view.viewingMode))}.bind(this)),this._aroundVerticesTexture=new l(this._gl),this._aroundVerticesTextureSize=f.create())},destroy:function(){this._resetXBOs(),this._dispose("_aroundVerticesTexture")},_resetXBOs:function(){this._dispose("_headVBO"),this._dispose("_tailVBO"),this._dispose("_tailIBO"),this._dispose("_pulseVBO"),this._dispose("_pulseIBO"),this._needsRenderPulse=!1},_initVertexLayout:function(){this._vertexAttrConstants=[w.AUXPOS1,w.AUXPOS2],this._vertexBufferLayout=new r(this._vertexAttrConstants,[2,3],[5126,5126]),this._material&&(this._material._vbLayout=this._vertexBufferLayout)},_initRenderContext:function(){return this.inherited(arguments),this._vacDirty&&(this._initVertexLayout(),this._resetXBOs(),this._vacDirty=!1),this._headVBO||(this._headVBO=new h(this._gl,!0,this._vertexBufferLayout)),this._tailVBO||(this._tailVBO=new h(this._gl,!0,this._vertexBufferLayout)),this._tailIBO||(this._tailIBO=new h(this._gl,!1)),this._pulseVBO||(this._pulseVBO=new h(this._gl,!0,this._vertexBufferLayout)),this._pulseIBO||(this._pulseIBO=new h(this._gl,!1)),this._curveType===I.AROUND?this._buildAroundPathGeometries():this._curveType===I.ALONG?this._buildAlongPathGeometries():!1},_buildAroundPathGeometries:function(){if(!this._needsAllLoaded)return console.warn("All features should be loaded first."),!1;var e=this._allGraphics();if(e.length>0){var i,s,r,n,a,h,l,d=[],_=[],u=[],f=0,x=[];return this._pathIdNum=0,t.forEach(e,function(e,t){if(null!=e.geometry)for(a=e.geometry.paths,h=0;h<a.length;h++)if(!(a[h].length<2)){for(i=a[h][0],null==i[2]&&(i[2]=c),s=a[h][a[h].length-1],null==s[2]&&(s[2]=c),g.set3(i[0],i[1],i[2],v),"global"===this._view.viewingMode?o.wgs84ToSphericalEngineCoords(v,0,v,0):"local"===this._view.viewingMode&&o.wgs84ToWebMerc(v,0,v,0),g.set3(s[0],s[1],s[2],m),"global"===this._view.viewingMode?o.wgs84ToSphericalEngineCoords(m,0,m,0):"local"===this._view.viewingMode&&o.wgs84ToWebMerc(m,0,m,0),g.subtract(v,m,p),n=g.length(p),"global"===this._view.viewingMode?r=1e3>=n?32:1e4>=n?24:5e5>=n?18:1e6>=n?40:Math.floor(1e-5*n):"local"===this._view.viewingMode&&(r=1e3>=n?48:1e4>=n?42:1e5>=n?32:1e6>=n?24:2e6>=n?36:Math.floor(6e-6*n)),r=2*r-1,r=Math.max(5,Math.floor(.24*r)),d.push(this._pathIdNum,t,M.HEAD,r-1,r-1),x.push([i[0],i[1],i[2]]),x.push([s[0],s[1],s[2]]),l=0;r>l;l++)_.push(this._pathIdNum,t,M.TAIL,l,r-1),r-1>l&&u.push(f+l,f+l+1);this._pathIdNum++,f+=r}}.bind(this)),this._headVBO.addData(!1,new Float32Array(d)),this._tailVBO.addData(!1,new Float32Array(_)),this._tailIBO.addData(!1,new Uint32Array(u)),this._resetAddGeometries(),this._initAroundVerticesTexture(x)&&this._initPulseGeometries(x)}return!1},_buildAlongPathGeometries:function(){return!1},_initAroundVerticesTexture:function(e){if(2*this._pathIdNum!==e.length)return console.warn("The quantity of paths and points is invalid."),!1;var i=this._gl.getParameter(3379),t=2,s=this._pathIdNum*t,r=o.nextHighestPowerOfTwo(s);r>i&&(r=i,console.warn("Too many graphics, and some data will be discarded."));var n=Math.ceil(s/r);n=o.nextHighestPowerOfTwo(n),n>i&&(n=i,console.warn("Too many graphics, and some data will be discarded."));var a,h,l=new Float32Array(r*n*4);for(a=0;a<this._pathIdNum;a++)h=a*t*4,l[0+h]=a,l[1+h]=e[a*t][0],l[2+h]=e[a*t][1],l[3+h]=e[a*t][2],l[4+h]=a,l[5+h]=e[a*t+1][0],l[6+h]=e[a*t+1][1],l[7+h]=e[a*t+1][2];return this._aroundVerticesTexture.setData(r,n,l),f.set2(r,n,this._aroundVerticesTextureSize),!0},_initPulseGeometries:function(e){if(2*this._pathIdNum!==e.length)return console.warn("The quantity of paths and points is invalid."),!1;if(e.length>0){var i,t,s,r,n,a,h,l=2,o=40,d=this._vertexBufferLayout.getStride(),_=new Float32Array((o+1)*d*this._pathIdNum),u=new Uint32Array(3*o*this._pathIdNum),g=2*Math.PI;for(i=0;i<this._pathIdNum;i++){for(r=i*(o+1)*d,n=e[i*l+1],_[r+2]=n[0],_[r+3]=n[1],_[r+4]=n[2],_[r+0]=-1,_[r+1]=i,r+=d,t=0;o>t;t++)s=r+d*t,_[s+2]=n[0],_[s+3]=n[1],_[s+4]=n[2],_[s+0]=g*(t/o),_[s+1]=i;for(h=i*(o+1),a=3*h,t=0;o-1>t;t++)s=a+3*t,u[s+0]=0+h,u[s+1]=t+1+h,u[s+2]=t+2+h;s=a+3*(o-1),u[s+0]=0+h,u[s+1]=o+h,u[s+2]=1+h}return this._pulseVBO.addData(!1,_),this._pulseIBO.addData(!1,u),!0}return!1},_initColourMap:function(){this._colourMapTexture||(this._colourMapTexture=this._gl.createTexture());var e=new Image;e.src=o.spriteImg;var i=this;return e.onload=function(){i._gl.bindTexture(3553,i._colourMapTexture),i._gl.pixelStorei(37440,!0),i._gl.texParameteri(3553,10240,9728),i._gl.texParameteri(3553,10241,9728),i._gl.texParameteri(3553,10242,33071),i._gl.texParameteri(3553,10243,33071),i._gl.texImage2D(3553,0,6408,6408,5121,e),i._gl.generateMipmap(3553),i._gl.bindTexture(3553,null)},0===this._gl.getError()?!0:!1},_loadShaders:function(){return this.inherited(arguments),this._material||(this._material=new u({gl:this._gl,vbLayout:this._vertexBufferLayout,shaderSnippets:this._shaderSnippets,local:"local"==this._view.viewingMode})),this._material.loadShaders()},_initColorBar:function(){if(!this._colorBarDirty)return!0;this._colorBarTexture||(this._colorBarTexture=this._gl.createTexture()),this._gl.bindTexture(3553,this._colorBarTexture),this._gl.pixelStorei(37440,!0),this._gl.texParameteri(3553,10240,9728),this._gl.texParameteri(3553,10241,9728),this._gl.texParameteri(3553,10242,33071),this._gl.texParameteri(3553,10243,33071);var e=o.createColorBarTexture(32,1,this.renderingInfo.colors);return this._gl.texImage2D(3553,0,6408,6408,5121,e),this._gl.generateMipmap(3553),this._gl.bindTexture(3553,null),0===this._gl.getError()?!0:!1},render:function(i){this.inherited(arguments),this._layer.visible&&this.ready&&this._bindPramsReady()&&(this._material.bind(e.mixin({},{avte:this._aroundVerticesTexture,avtes:this._aroundVerticesTextureSize,cmte:this._colourMapTexture,vfvt:this._vizFieldVerTextures[this._vizFields[this._currentVizPage]],vfvts:this._vizFieldVerTextureSize,ail:this.renderingInfo.animationInterval,brs:this.renderingInfo.radius,tcy:this.renderingInfo.transparency,minValue:this._vizFieldMinMaxs[this._vizFieldDefault].min>this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].min?this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].min:this._vizFieldMinMaxs[this._vizFieldDefault].min,maxValue:this._vizFieldMinMaxs[this._vizFieldDefault].max>this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].max?this._vizFieldMinMaxs[this._vizFieldDefault].max:this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].max,cbte:this._colorBarTexture},i)),this._material.blend(1),this._tailVBO.bind(this._material._program),this._tailIBO.bind(),this._gl.drawElements(1,this._tailIBO.getNum(),5125,0),this._tailIBO.unbind(),this._tailVBO.unbind(),this._material.blend(0),this._headVBO.bind(this._material._program),this._gl.drawArrays(0,0,this._headVBO.getNum()),this._headVBO.unbind(),this._needsRenderPulse||(x=this.time/this.renderingInfo.animationInterval,x-Math.floor(x)>.8&&(this._needsRenderPulse=!0)),this._needsRenderPulse&&(this._material.bindPulse(e.mixin({},{vfvt:this._vizFieldVerTextures[this._vizFields[this._currentVizPage]],vfvts:this._vizFieldVerTextureSize,ail:this.renderingInfo.animationInterval,prs:[this._scopes.pulseRadius[0],this.renderingInfo.pulseRadius],tcy:this.renderingInfo.transparency,minValue:this._vizFieldMinMaxs[this._vizFieldDefault].min>this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].min?this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].min:this._vizFieldMinMaxs[this._vizFieldDefault].min,maxValue:this._vizFieldMinMaxs[this._vizFieldDefault].max>this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].max?this._vizFieldMinMaxs[this._vizFieldDefault].max:this._vizFieldMinMaxs[this._vizFields[this._currentVizPage]].max,cbte:this._colorBarTexture},i)),this._pulseVBO.bind(this._material._pulseProgram),this._pulseIBO.bind(),this._gl.drawElements(4,this._pulseIBO.getNum(),5125,0),this._pulseIBO.unbind(),this._pulseVBO.unbind(),x=this.time/this.renderingInfo.animationInterval,x-Math.floor(x)>.79&&(this._needsRenderPulse=!1)),this._material.release())}});return b});