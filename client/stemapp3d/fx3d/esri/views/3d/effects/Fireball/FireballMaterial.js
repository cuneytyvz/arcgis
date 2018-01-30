/**
 * Copyright @ 2017 Esri.
 * All rights reserved under the copyright laws of the United States and applicable international laws, treaties, and conventions.
 */
define(["dojo/text!./FireballMaterial.xml","esri/core/declare","esri/views/3d/webgl-engine/lib/GLSLShader","../../webgl-engine-extensions/GLSLProgramExt","../../support/fx3dUtils"],function(e,t,i,r,s){var n=t(null,{declaredClass:"esri.views.3d.effects.Fireball.FireballMaterial",constructor:function(e){this._gl=e.gl,this._shaderSnippets=e.shaderSnippets,this._program=null,this._pushState=e.pushState,this._restoreState=e.restoreState,this._srcAlpha=770,this._dstAlpha=1,this._viewingMode=e.viewingMode,"local"==e.viewingMode&&(this._srcAlpha=770,this._dstAlpha=771)},destroy:function(){this._program&&(this._program.dispose(),delete this._program,this._program=null)},_addDefines:function(e,t,i){var r="";if(null!=i)if(Array.isArray(i))for(var s=0,n=i.length;s<n;s++){var a=i[s];r+="#define "+a+"\n"}else for(var a in i)r+="#define "+a+"\n";return this._shaderSnippets[e]+"\n"+r+t},loadShaders:function(t){if(this._shaderSnippets){null!=this._shaderSnippets.fireballVS&&null!=this._shaderSnippets.fireballFS||this._shaderSnippets._parse(e);var s=[];"global"==this._viewingMode?s.push("GLOBAL"):s.push("LOCAL");var n=this._addDefines("defines",this._shaderSnippets.fireballVS,s),a=new i(35633,n,this._gl);n=this._addDefines("defines2",this._shaderSnippets.fireballFS,s);var l=new i(35632,n,this._gl);this._program=new r([a,l],this._gl)}return this._initResources()},getProgram:function(){return this._program},_initResources:function(){return!0},bind:function(e,t){this._program.use(),this._program.uniformMatrix4fv("ps",e.proj),this._program.uniformMatrix4fv("ms",e.view),this._program.uniform3fv("sp",e.camPos),this._program.uniform3fv("ml",e.lightingData.direction),this._program.uniform4fv("lo",e.lightingData.ambient),this._program.uniform4fv("im",e.lightingData.diffuse),this._program.uniform4fv("os",e.lightingData.specular),this._oldTex=this._gl.getParameter(32873);var i=t._activeTextureUnit;i>t.parameters.maxVertexTextureImageUnits-1-4&&(console.warn("Many textures are binded now, 3DFx lib may be work abnormally."),i=0),e.pl.bind(i+1),this._program.uniform1i("pl",i+1),this._program.uniform2fv("ls",e.ls),this._program.uniform2fv("el",[e.el,e.ss]),e.es.bind(i+2),this._program.uniform1i("es",i+2),this._program.uniform2fv("lm",e.lm),this._gl.activeTexture(33984+i+3),this._gl.bindTexture(3553,e.pm),this._program.uniform1i("pm",i+3),this._gl.activeTexture(33984+i+4),this._gl.bindTexture(3553,e.sm),this._program.uniform1i("sm",i+4),this._program.uniform1f("il",e.il),this._program.uniform1f("ie",e.ie),this._program.uniform1f("ll",e.ll),this._program.uniform1f("mp",e.time),this._program.uniform1i("is",e.reachedRepeatLimit),0!=t._depthWriteEnabled&&(this._pushState(["setDepthWriteEnabled",t._depthWriteEnabled]),t.setDepthWriteEnabled(!1)),1!=t._depthTestEnabled&&(this._pushState(["setDepthTestEnabled",t._depthTestEnabled]),t.setDepthTestEnabled(!0)),1!=t._blendEnabled&&(this._pushState(["setBlendingEnabled",t._blendEnabled]),t.setBlendingEnabled(!0))},bindBoolean:function(e,t){this._program.uniform1i(e,t)},blend:function(e,t){e?e&&(this._pushState(["setBlendFunctionSeparate",[t._blendFunctionState.srcRGB,t._blendFunctionState.dstRGB,t._blendFunctionState.srcAlpha,t._blendFunctionState.dstAlpha]]),t.setBlendFunction(770,771)):(this._pushState(["setBlendFunctionSeparate",[t._blendFunctionState.srcRGB,t._blendFunctionState.dstRGB,t._blendFunctionState.srcAlpha,t._blendFunctionState.dstAlpha]]),t.setBlendFunction(this._srcAlpha,this._dstAlpha))},release:function(e){this._gl.activeTexture(33984+e._activeTextureUnit+1),this._gl.bindTexture(3553,this._oldTex),this._restoreState(e),this._gl.useProgram(null)}});return n});