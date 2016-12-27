/**
 * Copyright @ 2016 Esri.
 * All rights reserved under the copyright laws of the United States and applicable international laws, treaties, and conventions.
 */
define(["dojo/_base/declare","dojo/text!./BounceMaterial.xml","esri/views/3d/webgl-engine/lib/GLSLShader","../../webgl-engine-extensions/GLSLProgramExt","../../support/fx3dUtils"],function(i,t,r,s,e){var n=i(null,{declaredClass:"esri.views.3d.effects.Bounce.BounceMaterial",constructor:function(i){this._gl=i.gl,this._vbLayout=i.vbLayout,this._shaderSnippets=i.shaderSnippets,this._program=null,this._srcAlpha=770,this._dstAlpha=771,i.local&&(this._srcAlpha=770,this._dstAlpha=771)},destroy:function(){this._program&&(this._program.dispose(),delete this._program,this._program=null)},loadShaders:function(i){if(this._shaderSnippets){var e="bounceVS",n="bounceFS";i&&(e="timeInfoBounceVS",n="timeInfoBounceFS"),(null==this._shaderSnippets[e]||null==this._shaderSnippets[n])&&this._shaderSnippets._parse(t);var a=new r(35633,this._shaderSnippets[e],this._gl),o=new r(35632,this._shaderSnippets[n],this._gl);this._program=new s([a,o],this._gl)}return this._initResources()},getProgram:function(){return this._program},_initResources:function(){return!0},bind:function(i){this._program.use(),this._program.uniform1f("vme",i.viewingMode),this._program.uniformMatrix4fv("pmt",i.proj),this._program.uniformMatrix4fv("vmt",i.view),this._program.uniform3fv("cp",i.camPos),this._program.uniform3fv("ldn",i.lightingData.direction),this._program.uniform4fv("lat",i.lightingData.ambient),this._program.uniform4fv("lde",i.lightingData.diffuse),this._program.uniform4fv("lsr",i.lightingData.specular),i.vv.bind(0),this._program.uniform1i("vv",0),this._program.uniform2fv("vvs",i.vvs),this._program.uniform2fv("wmmv",[i.minValue,i.maxValue]),this._gl.activeTexture(33985),this._gl.bindTexture(3553,i.cbt),this._program.uniform1i("cbt",1),this._gl.activeTexture(33986),this._gl.bindTexture(3553,i.cmt),this._program.uniform1i("cmt",2),this._program.uniform3fv("sz",i.sz),this._program.uniform1f("ai",i.ai),this._program.uniform1f("tcy",i.tcy),this._program.uniform1f("fe",i.time),this._vbLayout.enableVertexAttribArrays(this._gl,this._program,!1),this._gl.depthMask(!1),this._gl.enable(2884),this._gl.enable(2929),this._gl.enable(3042)},bindBoolean:function(i,t){this._program.uniform1i(i,t)},bindFloat:function(i,t){this._program.uniform1f(i,t)},blend:function(i){i?(this._gl.enable(3042),this._gl.blendFunc(this._srcAlpha,this._dstAlpha)):this._gl.disable(3042)},release:function(){this._gl.activeTexture(33984),this._gl.blendFunc(770,771),this._gl.depthMask(!0),this._gl.disable(3042),this._gl.disable(2884),this._vbLayout.disableVertexAttribArrays(this._gl,this._program,!1),this._gl.useProgram(null)}});return n});