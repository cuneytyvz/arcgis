// All material copyright ESRI, All Rights Reserved, unless otherwise specified.
// See http://js.arcgis.com/3.15/esri/copyright.txt and http://www.arcgis.com/apps/webappbuilder/copyright.txt for details.
//>>built
require({cache:{"url:builder/plugins/app-config-configpart/TabContainer2.html":'\x3cdiv\x3e\r\n  \x3cdiv data-dojo-attach-point\x3d"controlNode"\x3e\r\n    \x3ctable class\x3d"control-table"\x3e\r\n      \x3ctbody\x3e\r\n        \x3ctr data-dojo-attach-point\x3d"tabTr"\x3e\r\n        \x3c/tr\x3e\r\n      \x3c/tbody\x3e\r\n    \x3c/table\x3e\r\n  \x3c/div\x3e\r\n  \x3cdiv class\x3d"jimu-viewstack2" data-dojo-attach-point\x3d"containerNode"\x3e\x3c/div\x3e\r\n\x3c/div\x3e'}});
define("dojo/_base/declare dojo/_base/lang dojo/_base/array dojo/_base/html dojo/on dojo/Evented dojo/query dijit/_WidgetBase dijit/_TemplatedMixin dojo/text!./TabContainer2.html jimu/dijit/ViewStack".split(" "),function(h,g,e,d,k,l,f,m,n,p,q){return h([m,n,l],{templateString:p,_controlNodes:null,selected:"",tabs:null,"class":"jimu-tab2",postCreate:function(){this.inherited(arguments);this._controlNodes=[];this.viewStack=new q(null,this.containerNode);e.forEach(this.tabs,function(a){this._createTab(a)},
this)},startup:function(){this.selected?this.selectTab(this.selected):0<this.tabs.length&&this.selectTab(this.tabs[0].title)},_createTab:function(a){var b=d.toDom('\x3ctd\x3e\x3cdiv class\x3d"tab-item-div"\x3e\x3cdiv class\x3d"tab-item-icon"\x3e\x3c/div\x3e\x3cdiv class\x3d"tab-item-title"\x3e\x3c/div\x3e\x3c/div\x3e\x3c/td\x3e');d.place(b,this.tabTr);var c=f(".tab-item-div",b)[0],e=f(".tab-item-icon",b)[0];f(".tab-item-title",b)[0].innerHTML=a.title||"";d.setAttr(c,"title",a.title||"");d.setStyle(e,
"backgroundImage","url("+a.icon+")");this.viewStack.viewType=a.content.domNode?"dijit":"dom";c.tabConfig=a;c.iconNode=e;a.content.label=a.title;this.viewStack.addView(a.content);this.own(k(c,"click",g.hitch(this,this.onSelect,a.title)));this._controlNodes.push(c)},onSelect:function(a){this.selectTab(a)},selectTab:function(a){e.forEach(this._controlNodes,g.hitch(this,function(b){var c="";b.tabConfig.title===a?(d.addClass(b,"selected-tab-item-div"),c=b.tabConfig.selectedIcon):(d.removeClass(b,"selected-tab-item-div"),
c=b.tabConfig.icon);d.setStyle(b.iconNode,"backgroundImage","url("+c+")")}));this.viewStack.switchView(a);this.emit("tabChanged",a)}})});