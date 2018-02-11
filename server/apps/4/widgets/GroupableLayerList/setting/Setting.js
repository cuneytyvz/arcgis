///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2017 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
        'dojo/_base/declare',
        'dojo/_base/html',
        'dojo/on',
        'dojo/_base/lang',
        'dojo/_base/array',
        "dojo/request",
        'dojo/dom-construct',
        'jimu/BaseWidgetSetting',
        'jimu/LayerInfos/LayerInfos',
        'dijit/_WidgetsInTemplateMixin',
        './LayerSelector',
        './GroupableLayerSelector',
        './GroupAdder',
        'dijit/form/CheckBox',
        'jimu/dijit/CheckBox'
    ],
    function (declare, html, on, lang, array, request, domConstruct, BaseWidgetSetting, LayerInfos, _WidgetsInTemplateMixin, LayerSelector, GroupableLayerSelector, GroupAdder) {
        return declare([BaseWidgetSetting, _WidgetsInTemplateMixin], {

            baseClass: 'jimu-widget-layerList-setting',
            numberOfLevels: 1,
            groupLayers: true,
            groupInfo: {numberOfLevels: 1, appId: null, groups: []},

            startup: function () {
                this.inherited(arguments);
                this.setConfig(this.config);
                this.getAppId();

                this.fetchGroupData();
            },

            getAppId: function() {
                var uri = window.location.search;
                var query = uri.substring(uri.indexOf("?") + 1, uri.length);
                var queryObject = dojo.queryToObject(query);

                this.groupInfo.appId = parseInt(queryObject.id);
            },

            configureGroupingLayersOption: function () {
                this.own(on(this.groupLayers, 'change', lang.hitch(this, function () {
                    if (this.get('groupLayers').getValue())
                        this.set('groupLayersBoolean', true);
                    else
                        this.set('groupLayersBoolean', false);
                })));
                this.watch('groupLayersBoolean', this._showHideGroupingLayers);

                if (this.get('groupLayers').getValue()) {
                    this.set('groupLayersBoolean', true);
                } else {
                    this.set('groupLayersBoolean', false);
                }

                this._showHideGroupingLayers(this.groupInfo);
            },

            fetchGroupData: function () {
                var context = this;
                request.get("/webappbuilder/rest/layerGroups/" + this.groupInfo.appId + "/find", {
                    handleAs: "json"
                }).then(function (data) {
                    context.groupInfo = data;
                    context.mergeGroupInfo();
                    context.createGroupAdder();
                    context.createGroupableLayerSelector(context.groupInfo);
                }, function (err) {
                    console.log('Error : ' + err);
                }, function (evt) {
                    // handle a progress event
                });
            },

            mergeGroupInfo: function () {
                var layerInfosObj = LayerInfos.getInstanceSync();

                array.forEach(layerInfosObj._operLayers, lang.hitch(this, function (l) {
                    var exists = false;
                    array.forEach(this.groupInfo.groups, lang.hitch(this, function (group) {
                        array.forEach(group.layers, lang.hitch(this, function (layer) {
                            if (layer.id == l.id) {
                                exists = true;
                            }
                        }));
                    }));

                    if (!exists) {
                        // We now that the Other group is the first one.
                        this.groupInfo.groups[0].layers.push({id: l.id, title: l.title});
                    }
                }));
            },

            createLayerSelector: function () {
                var layerInfosObj = LayerInfos.getInstanceSync();
                this.layerSelector = new LayerSelector({
                    operLayerInfos: layerInfosObj,
                    config: this.config,
                    nls: this.nls
                }).placeAt(this.layerSelectorDiv);
            },

            createGroupableLayerSelector: function (groupInfo) {
                var layerInfosObj = LayerInfos.getInstanceSync();
                this.layerSelector = new GroupableLayerSelector({
                    operLayerInfos: layerInfosObj,
                    config: this.config,
                    nls: this.nls,
                    groupInfo: groupInfo
                }).placeAt(this.layerSelectorDiv);
            },

            destroyLayerSelector: function () {
                this.layerSelector.destroy();
            },

            createGroupAdder: function () {
                var layerInfosObj = LayerInfos.getInstanceSync();
                this.groupAdder = new GroupAdder({
                    operLayerInfos: layerInfosObj,
                    groupInfo: this.groupInfo,
                    appId: 2,
                    config: this.config,
                    nls: this.nls,
                    setting: this
                }).placeAt(this.groupAdderDiv);
            },

            _showHideGroupingLayers: function (groupInfo) {
                if (this.get('groupLayersBoolean')) {
                    html.setStyle(this.groupAdderPart, 'display', 'inline-block');
                    if (this.layerSelector)
                        this.destroyLayerSelector();
                    this.createGroupableLayerSelector(groupInfo);

                }
                else {
                    html.setStyle(this.groupAdderPart, 'display', 'none');
                    if (this.layerSelector)
                        this.destroyLayerSelector();
                    this.createLayerSelector();
                }
            },

            setConfig: function (config) {
                this.showLegend.setValue(config.showLegend);
                if (config.contextMenu) {
                    this.zoomto.setValue(config.contextMenu.ZoomTo);
                    this.transparency.setValue(config.contextMenu.Transparency);
                    this.controlPopup.setValue(config.contextMenu.EnableOrDisablePopup);
                    this.moveupDown.setValue(config.contextMenu.MoveupOrMovedown);
                    this.table.setValue(config.contextMenu.OpenAttributeTable);
                    this.url.setValue(config.contextMenu.DescriptionOrShowItemDetailsOrDownload);
//                    this.groupLayers.setValue(config.contextMenu.EnableOrDisableGroupingLayers);
                }
            },

            getConfig: function () {
                this.config.showLegend = this.showLegend.getValue();
                if (!this.config.contextMenu) {
                    this.config.contextMenu = {};
                }
                this.config.contextMenu.ZoomTo = this.zoomto.getValue();
                this.config.contextMenu.Transparency = this.transparency.getValue();
                this.config.contextMenu.EnableOrDisablePopup = this.controlPopup.getValue();
                this.config.contextMenu.MoveupOrMovedown = this.moveupDown.getValue();
                this.config.contextMenu.OpenAttributeTable = this.table.getValue();
                this.config.contextMenu.DescriptionOrShowItemDetailsOrDownload = this.url.getValue();
//                this.config.contextMenu.EnableOrDisableGroupingLayers = this.groupLayers.getValue();
                this.config.layerOptions = this.layerSelector.getLayerOptions();
                return this.config;
            }

        });
    });
