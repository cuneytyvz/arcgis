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

var traversal = function (callback) {
    if (callback(this)) {
        return true;
    }
    var subLayerInfos = this.getSubLayers != null ? this.getSubLayers() : [];
    for (var i = 0; i < subLayerInfos.length; i++) {
        if (subLayerInfos[i].traversal(callback)) {
            return true;
        }
    }
};

define([
    'dijit/_WidgetBase',
    'dojo/_base/declare',
    'dojo/dom',
    'dojo/_base/html',
    'dojo/query',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-construct',
    'dojo/on',
    'dojo/query',
    'jimu/dijit/CheckBox',
    'dijit/_TemplatedMixin',
    'dojo/text!./LayerSelector.html',
    'dojo/dom-class',
    'dojo/dom-style'
], function (_WidgetBase, declare, dom, html, query, lang, array, domConstruct, on, query, CheckBox, _TemplatedMixin, template, domClass, domStyle) {

    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: template,
        baseClass: 'layer-selector',
        _currentSelectedLayerRowNode: null,
        _displayStateStorage: null,
        checkboxes: [],
        numberOfLevels: 1,
        groupInfo: {numberOfLevels: 1, appId: this.appId, groups: []},

        setParent: function (parent, childs) {
            array.forEach(childs, function (child) {
                child.parentLayerInfo = parent;

                if (child.subgroups != null && child.subgroups.length > 0) {
                    this.setParent(child, child.subgroups);
                } else if (child.layers != null && child.layers.length > 0) {
                    this.setParent(child, child.layers);
                } else {
                    return;
                }
            }, this);

        },

        postMixInProperties: function () {
            this.inherited(arguments);
            this._displayStateStorage = {};
        },

        postCreateOld: function () {
            array.forEach(this.operLayerInfos.getLayerInfoArray(), function (layerInfo) {
                this.drawListNode(layerInfo, 0, this.layerListTable);
            }, this);

            array.forEach(this.operLayerInfos.getTableInfoArray(), function (layerInfo) {
                this.drawListNode(layerInfo, 0, this.tableListTable);
            }, this);
        },

        postCreate: function () {
            this.checkboxes = [];

            // Arranging test Data
            array.forEach(this.groupInfo.groups, function (layerInfo) {
                this.setParent(layerInfo, layerInfo.subgroups)
            }, this);

            array.forEach(this.groupInfo.groups, function (layerInfo) {
                this.drawSubgroups(layerInfo, 0, this.layerListTable);
            }, this);

//            array.forEach(this.testData, function (layerInfo) {
//                this.drawSubgroups(layerInfo, 0, this.tableListTable);
//            }, this);
        },

        drawSubgroups: function (layerInfo, level, toTableNode) {
            // First draw group name
            this.addLayerNode(layerInfo, level, toTableNode);
            if (layerInfo.subgroups == null || layerInfo.subgroups.length < 0) {
                array.forEach(layerInfo.layers, function (layerInfo) {
                    this.drawListNode(layerInfo, level + 1, this.layerListTable);
                }, this);

                return;
            }

            array.forEach(layerInfo.subgroups, lang.hitch(this, function (level, subLayerInfo) {
                this.drawSubgroups(subLayerInfo, level + 1, this.layerListTable);
            }, level));
        },

        drawListNode: function (layerInfo, level, toTableNode) {
            var nodeAndSubNode;
            if (layerInfo.newSubLayers == undefined || layerInfo.newSubLayers.length === 0) {
                //addLayerNode
                nodeAndSubNode = this.addLayerNode(layerInfo, level, toTableNode);

                // don't add legend node, hide show legend image.
                domClass.add(query(".showLegend-div",
                        nodeAndSubNode.currentNode)[0],
                    'hidden');
                return;
            }
            //addLayerNode
            nodeAndSubNode = this.addLayerNode(layerInfo, level, toTableNode);
            array.forEach(layerInfo.newSubLayers, lang.hitch(this, function (level, subLayerInfo) {
                this.drawListNode(subLayerInfo, level + 1, nodeAndSubNode.subNode);
            }, level));
        },

        k: 0,
        addLayerNode: function (layerInfo, level, toTableNode) {
            var layerTrNode = domConstruct.create('tr', {
                    'class': 'jimu-widget-row layer-row ' +
                        ( /*visible*/ false ? 'jimu-widget-row-selected' : ''),
                    'layerTrNodeId': layerInfo.id
                }, toTableNode),
                layerTdNode, ckSelectDiv, ckSelect, imageTableDiv,
                popupMenuNode, i, imageShowLegendDiv, popupMenu, divLabel;

            layerTdNode = domConstruct.create('td', {
                'class': 'col col1'
            }, layerTrNode);

            for (i = 0; i < level; i++) {
                domConstruct.create('div', {
                    'class': 'begin-blank-div jimu-float-leading',
                    'innerHTML': ''
                }, layerTdNode);
            }

            console.log('layer added' + this.k++);

            imageShowLegendDiv = domConstruct.create('div', {
                'class': 'showLegend-div jimu-float-leading'
            }, layerTdNode);


            ckSelectDiv = domConstruct.create('div', {
                'class': 'div-select jimu-float-leading'
            }, layerTdNode);

            /*
             imageTableDiv = domConstruct.create('div', {
             'class': 'noLegend-div jimu-float-leading'
             }, layerTdNode);
             if (layerInfo.isTable) {
             domClass.add(imageTableDiv, 'table');
             }
             if (layerInfo.isTable) {
             //domStyle.set(imageShowLegendDiv, 'display', 'none');
             //domStyle.set(ckSelectDiv, 'display', 'none');
             domStyle.set(imageTableDiv, 'display', 'block');
             }
             */


            // if config has not been configured, default value is 'true'.
            // if config has been configured, but new layer of webmap is ont in config file,
            //   default value is 'true'.
            var checkedValue = true;
            if (this.config.layerOptions && this.config.layerOptions[layerInfo.id] !== undefined) {
                checkedValue = this.config.layerOptions[layerInfo.id].display;
            }
            ckSelect = new CheckBox({
                checked: checkedValue,
                'class': "visible-checkbox-" + layerInfo.id
            });

            domConstruct.place(ckSelect.domNode, ckSelectDiv);

            // set tdNode width
            domStyle.set(layerTdNode, 'width', level * 12 + 35 + 'px');

            var layerTitleTdNode = domConstruct.create('td', {
                'class': 'col col2'
            }, layerTrNode);

            imageTableDiv = domConstruct.create('div', {
                'class': 'noLegend-div jimu-float-leading'
            }, layerTitleTdNode/*layerTdNode*/);
            if (layerInfo.isTable) {
                domClass.add(imageTableDiv, 'table');
            }
            if (layerInfo.isTable) {
                //domStyle.set(imageShowLegendDiv, 'display', 'none');
                //domStyle.set(ckSelectDiv, 'display', 'none');
                domStyle.set(imageTableDiv, 'display', 'block');
            }

            /*
             var grayedTitleClass = '';
             try {
             if (!layerInfo.isInScale()) {
             grayedTitleClass = 'grayed-title';
             }
             } catch (err) {
             console.warn(err.message);
             }
             */
            var layerTitleDivIdClass = 'layer-title-div-' + layerInfo.id;
            divLabel = domConstruct.create('div', {
                'innerHTML': layerInfo.title,
                'class': layerTitleDivIdClass + ' div-content jimu-float-leading '
            }, layerTitleTdNode);

            //domStyle.set(divLabel, 'width', 263 - level*13 + 'px');

            layerTdNode = domConstruct.create('td', {
                'class': 'col col3'
            }, layerTrNode);

            // add popupMenu
            popupMenuNode = domConstruct.create('div', {
                'class': 'layers-list-popupMenu-div'
            }, layerTdNode);

            //add a tr node to toTableNode.
            var trNode = domConstruct.create('tr', {
                'class': '',
                'layerContentTrNodeId': layerInfo.id
            }, toTableNode);

            var tdNode = domConstruct.create('td', {
                'class': '',
                'colspan': '3'
            }, trNode);

            var tableNode = domConstruct.create('table', {
                'class': 'layer-sub-node'
            }, tdNode);

            this.initDisplayStateStorage(layerInfo, ckSelect, divLabel);

            this.own(on(imageShowLegendDiv,
                'click',
                lang.hitch(this,
                    this._onRowTrClick,
                    layerInfo,
                    imageShowLegendDiv,
                    layerTrNode,
                    tableNode)));

            this.own(on(layerTrNode,
                'mouseover',
                lang.hitch(this, this._onLayerNodeMouseover, layerTrNode, popupMenu)));
            this.own(on(layerTrNode,
                'mouseout',
                lang.hitch(this, this._onLayerNodeMouseout, layerTrNode, popupMenu)));
            this.own(on(ckSelect.domNode, 'click', lang.hitch(this,
                this._onCkSelectNodeClick,
                layerInfo,
                ckSelect)));

            this.checkboxes.push(ckSelect);

            return {
                currentNode: layerTrNode,
                subNode: tableNode
            };
        },


        // return current state:
        //   true:  fold,
        //   false: unfold
        _fold: function (layerInfo, imageShowLegendDiv, subNode) {
            /*jshint unused: false*/
            var state;
            if (domStyle.get(subNode, 'display') === 'none') {
                //unfold
                domStyle.set(subNode, 'display', 'table');
                domClass.add(imageShowLegendDiv, 'unfold');
                state = false; //unfold
            } else {
                //fold
                domStyle.set(subNode, 'display', 'none');
                var src;
                domClass.remove(imageShowLegendDiv, 'unfold');
                state = true; // fold
            }
            return state;
        },

        _onCkSelectNodeClick: function (layerInfo, ckSelect, evt) {
            /*jshint unused: false*/
            layerInfo.traversal(lang.hitch(this, function (subLayerInfo) {
//                this._grayedLayerLabel(subLayerInfo);
            }));

            if (layerInfo.subgroups != null && layerInfo.subgroups.length > 0) {
                array.forEach(layerInfo.subgroups, lang.hitch(this, function (subgroup) {
//                    this._grayedLayerLabel(subgroup);
                }));
            }

            //
            if (layerInfo.layers != null && layerInfo.layers.length > 0) {
                array.forEach(layerInfo.layers, lang.hitch(this, function (layer) {
//                    this._grayedLayerLabel(layer);
                }));
            }

            iterateSublayers(layerInfo, this.checkboxes);

            function iterateSublayers(layerInfo, checkboxes) {
                for (var i = 0; i < checkboxes.length; i++) {
                    var checkbox = checkboxes[i];

                    if (layerInfo.subgroups != null && layerInfo.subgroups.length > 0) {
                        array.forEach(layerInfo.subgroups, lang.hitch(function (subgroup) {
                            if (subgroup.id == dojo.attr(checkbox.domNode.parentNode.parentNode.parentNode, 'layertrnodeid')) {
                                if (ckSelect.checked)
                                    checkbox.check();
                                else
                                    checkbox.uncheck();

                                iterateSublayers(subgroup, checkboxes);
                            }
                        }));
                    } else if (layerInfo.layers != null && layerInfo.layers.length > 0) {
                        array.forEach(layerInfo.layers, lang.hitch(function (layer) {
                            if (layer.id == dojo.attr(checkbox.domNode.parentNode.parentNode.parentNode, 'layertrnodeid')) {
                                if (ckSelect.checked)
                                    checkbox.check();
                                else
                                    checkbox.uncheck();

                                iterateSublayers(layer, checkboxes);
                            }
                        }));
                    } else {
                        return;
                    }
                }
            }

            evt.stopPropagation();
        },

        _onLayerNodeMouseover: function (layerTrNode, popupMenu) {
            domClass.add(layerTrNode, "layer-row-mouseover");
            if (popupMenu) {
                //domClass.add(popupMenuNode, "layers-list-popupMenu-div-selected");
                domClass.add(popupMenu.btnNode, "jimu-icon-btn-selected");
            }
        },

        _onLayerNodeMouseout: function (layerTrNode, popupMenu) {
            domClass.remove(layerTrNode, "layer-row-mouseover");
            if (popupMenu) {
                //domClass.remove(popupMenuNode, "layers-list-popupMenu-div-selected");
                domClass.remove(popupMenu.btnNode, "jimu-icon-btn-selected");
            }
        },

        _onRowTrClick: function (layerInfo, imageShowLegendDiv, layerTrNode, subNode) {
            this._changeSelectedLayerRow(layerTrNode);
            this._fold(layerInfo, imageShowLegendDiv, subNode);
        },

        _changeSelectedLayerRow: function (layerTrNode) {
            if (this._currentSelectedLayerRowNode && this._currentSelectedLayerRowNode === layerTrNode) {
                return;
            }
            if (this._currentSelectedLayerRowNode) {
                domClass.remove(this._currentSelectedLayerRowNode, 'jimu-widget-row-selected');
            }
            domClass.add(layerTrNode, 'jimu-widget-row-selected');
            this._currentSelectedLayerRowNode = layerTrNode;
        },

        initDisplayStateStorage: function (layerInfo, displayCK, labelDiv) {
            this._displayStateStorage[layerInfo.id] = {
                displayCK: displayCK,
                labelDiv: labelDiv
            };
            this._grayedLayerLabel(layerInfo);
        },

        _grayedLayerLabel: function (layerInfo) {
            var display = true;
            var currentLayerInfo = layerInfo;
            var labelDiv = this._displayStateStorage[layerInfo.id].labelDiv;
            if (labelDiv) {
                while (currentLayerInfo) {
                    display = display && this._displayStateStorage[currentLayerInfo.id].displayCK.checked;
                    if (!display) {
                        break;
                    }
                    currentLayerInfo = currentLayerInfo.parentLayerInfo;
                }
                if (!display) {
                    domClass.add(labelDiv, 'grayed-title');
                } else {
                    domClass.remove(labelDiv, 'grayed-title');
                }
            }
        },

        getLayerOptions: function () {
            var layerOptions = {};
            for (var child in this._displayStateStorage) {
                if (this._displayStateStorage.hasOwnProperty(child) &&
                    (typeof this._displayStateStorage[child] !== 'function')) {
                    layerOptions[child] = {display: this._displayStateStorage[child].displayCK.checked};
                }
            }
            return layerOptions;
        }

    });
});