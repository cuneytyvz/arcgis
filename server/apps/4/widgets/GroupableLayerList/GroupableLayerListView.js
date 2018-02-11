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
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-construct',
    'dojo/on',
    'dojo/query',
    'jimu/dijit/CheckBox',
    'jimu/dijit/DropMenu',
    './PopupMenu',
    'dijit/_TemplatedMixin',
    'dojo/text!./GroupableLayerListView.html',
    'dojo/dom-class',
    'dojo/dom-style',
    './NlsStrings'
], function (_WidgetBase, declare, lang, array, domConstruct, on, query, CheckBox, DropMenu, PopupMenu, _TemplatedMixin, template, domClass, domStyle, NlsStrings) {

    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: template,
        _currentSelectedLayerRowNode: null,
        operationsDropMenu: null,
        _layerNodeHandles: null,
        // _layerDomNodeStorage = {
        //   layerInfoObjectId: {// layerDomNode
        //     layerTrNode: domNode,
        //     layerContentTrNode: domeNode,
        //     layerNodeEventHandles: []
        //     layerNodeReferredDijits: []
        //   }
        // }
        _layerDomNodeStorage: null,
        checkboxes: [],

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
            this.nls = NlsStrings.value;
            this._layerDomNodeStorage = {};
        },

        postCreate: function () {
            this.refresh();
            this._initOperations();
            this.checkAllCheckboxes(); // unchecked checkboxes workaround
        },

        checkAllCheckboxes: function () {
            array.forEach(this.checkboxes, lang.hitch(this, function (checkbox) {
                checkbox.check();
            }));
        },

        refresh: function () {
            this._removeLayerNodes();

            // Arranging test Data
//            array.forEach(this.groupInfo.groups, function (layerInfo) {
//                this.setParent(layerInfo, layerInfo.subgroups)
//            }, this);

            array.forEach(this.groupInfo.groups, function (layerInfo) {
                this.drawSubgroups(layerInfo, 0, this.layerListTable);
            }, this);

//            array.forEach(this.operLayerInfos.getLayerInfoArray(), function (layerInfo) {
//                this.drawListNode(layerInfo, 0, this.layerListTable);
//            }, this);

//            array.forEach(this.operLayerInfos.getTableInfoArray(), function (layerInfo) {
//                this.drawListNode(layerInfo, 0, this.tableListTable);
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

        drawListNode: function (layerInfo, level, toTableNode, position) {
            var nodeAndSubNode, showLegendDiv;
            if (this.isLayerHiddenInWidget(layerInfo)) {
                return;
            }

            if (layerInfo.getObjectId)
                nodeAndSubNode = this._layerDomNodeStorage[layerInfo.getObjectId()];
            if (((layerInfo.isRootLayer && layerInfo.isRootLayer()) || layerInfo.isTable) && nodeAndSubNode) {
                domConstruct.place(nodeAndSubNode.layerTrNode, toTableNode, position);
                domConstruct.place(nodeAndSubNode.layerContentTrNode, toTableNode, position);
            } else if (layerInfo.newSubLayers && layerInfo.newSubLayers.length === 0) {
                //addLayerNode
                nodeAndSubNode = this.addLayerNode(layerInfo, level, toTableNode, position);
                //add legend node
                if (this.config.showLegend) {
                    this.addLegendNode(layerInfo, level, nodeAndSubNode.subNode);
                } else {
                    showLegendDiv = query(".showLegend-div", nodeAndSubNode.layerTrNode)[0];
                    if (showLegendDiv) {
                        domClass.add(showLegendDiv, 'hidden');
                    }
                }
            } else {
                //addLayerNode
                nodeAndSubNode = this.addLayerNode(layerInfo, level, toTableNode, position);
                array.forEach(layerInfo.newSubLayers, lang.hitch(this, function (level, subLayerInfo) {
                    this.drawListNode(subLayerInfo, level + 1, nodeAndSubNode.subNode);
                }, level));
            }
        },

        addLayerNode: function (layerInfo, level, toTableNode, position) {

            var layerTrNode, layerTdNode, ckSelectDiv, ckSelect, imageNoLegendDiv, handle,
                imageNoLegendNode, popupMenuNode, i, imageShowLegendDiv, divLabel;

            var rootLayerInfo = null
            if (layerInfo.getRootLayerInfo) {
                rootLayerInfo = layerInfo.getRootLayerInfo();
                // if(!this._layerNodeHandles[rootLayerInfo.id]) {
                //   this._layerNodeHandles[rootLayerInfo.id] = [];
                // }
            } else {
                rootLayerInfo = null;
            }

            // init _layerDomNodeStorage for rootLayerInfo.
            if ((layerInfo.isRootLayer && layerInfo.isRootLayer()) || layerInfo.isTable) {
                this._layerDomNodeStorage[layerInfo.getObjectId()] = {
                    layerTrNode: null,
                    layerContentTrNode: null,
                    layerNodeEventHandles: [],
                    layerNodeReferredDijits: []
                };
            }

            var layerTrNodeClass = "layer-tr-node-" + layerInfo.id;
            layerTrNode = domConstruct.create('tr', {
                'class': 'jimu-widget-row layer-row ' +
                    ( /*visible*/ false ? 'jimu-widget-row-selected ' : ' ') + layerTrNodeClass,
                'layerTrNodeId': layerInfo.id
            });
            domConstruct.place(layerTrNode, toTableNode, position);

            layerTdNode = domConstruct.create('td', {
                'class': 'col col1'
            }, layerTrNode);

            for (i = 0; i < level; i++) {
                domConstruct.create('div', {
                    'class': 'begin-blank-div jimu-float-leading',
                    'innerHTML': ''
                }, layerTdNode);
            }

            imageShowLegendDiv = domConstruct.create('div', {
                'class': 'showLegend-div jimu-float-leading',
                'imageShowLegendDivId': layerInfo.id
            }, layerTdNode);

            // if not a layer // TODO : should change with -> layerInfo.type == group || layerInfo.type == subgroup
            if (!layerInfo.isRootLayer) {
                dojo.addClass(imageShowLegendDiv, "unfold");
            }

            ckSelectDiv = domConstruct.create('div', {
                'class': 'div-select jimu-float-leading'
            }, layerTdNode);

            ckSelect = new CheckBox({
                checked: layerInfo.isVisible ? layerInfo.isVisible() : false, //layerInfo.visible
                'class': "visible-checkbox-" + layerInfo.id
            });

            domConstruct.place(ckSelect.domNode, ckSelectDiv);

            imageNoLegendDiv = domConstruct.create('div', {
                'class': 'noLegend-div jimu-float-leading'
            }, layerTdNode);

            var imageName;
            if (layerInfo.isTable) {
                imageName = 'images/table.png';
            } else {
                imageName = 'images/noLegend.png';
            }

            imageNoLegendNode = domConstruct.create('img', {
                'class': 'noLegend-image',
                'src': this.layerListWidget.folderUrl + imageName,
                'alt': 'l'
            }, imageNoLegendDiv);

            if (layerInfo.isTiled || layerInfo.isTable) {
                domStyle.set(imageShowLegendDiv, 'display', 'none');
                domStyle.set(ckSelectDiv, 'display', 'none');
                domStyle.set(imageNoLegendDiv, 'display', 'block');
            }

            // set tdNode width
            domStyle.set(layerTdNode, 'width', level * 12 + 40 + 'px');

            var layerTitleTdNode = domConstruct.create('td', {
                'class': 'col col2'
            }, layerTrNode);

            var grayedTitleClass = '';
            try {
                if (layerInfo.isInScale && !layerInfo.isInScale()) {
                    grayedTitleClass = 'grayed-title';
                }
            } catch (err) {
                console.warn(err.message);
            }
            var layerTitleDivIdClass = 'layer-title-div-' + layerInfo.id;
            divLabel = domConstruct.create('div', {
                'innerHTML': layerInfo.title,
                'class': layerTitleDivIdClass + ' div-content jimu-float-leading ' + grayedTitleClass
            }, layerTitleTdNode);

            //domStyle.set(divLabel, 'width', 263 - level*13 + 'px');

            layerTdNode = domConstruct.create('td', {
                'class': 'col col3'
            }, layerTrNode);

            var popupMenuDisplayStyle = this.hasContentMenu() ? "display: block" : "display: none";
            // add popupMenu
            popupMenuNode = domConstruct.create('div', {
                'class': 'layers-list-popupMenu-div',
                'style': popupMenuDisplayStyle
            }, layerTdNode);

            /*
             var handle = on(popupMenuNode,
             'click',
             lang.hitch(this, function() {
             var popupMenu = new PopupMenu({
             //items: layerInfo.popupMenuInfo.menuItems,
             _layerInfo: layerInfo,
             box: this.layerListWidget.domNode.parentNode,
             popupMenuNode: popupMenuNode,
             layerListWidget: this.layerListWidget,
             _config: this.config
             }).placeAt(popupMenuNode);
             this.own(on(popupMenu,
             'onMenuClick',
             lang.hitch(this, this._onPopupMenuItemClick, layerInfo, popupMenu)));

             handle.remove();
             }));
             */
            /*
             popupMenu = new PopupMenu({
             //items: layerInfo.popupMenuInfo.menuItems,
             _layerInfo: layerInfo,
             box: this.layerListWidget.domNode.parentNode,
             popupMenuNode: popupMenuNode,
             layerListWidget: this.layerListWidget,
             _config: this.config
             }).placeAt(popupMenuNode);
             this.own(on(popupMenu,
             'onMenuClick',
             lang.hitch(this, this._onPopupMenuItemClick, layerInfo, popupMenu)));
             */

            //add a tr node to toTableNode.
            var layerContentTrNode = domConstruct.create('tr', {
                'class': '',
                'layerContentTrNodeId': layerInfo.id
            });
            domConstruct.place(layerContentTrNode, toTableNode, position);

            var tdNode = domConstruct.create('td', {
                'class': '',
                'colspan': '3'
            }, layerContentTrNode);

            var tableNode = domConstruct.create('table', {
                'class': 'layer-sub-node',
                'subNodeId': layerInfo.id
            }, tdNode);

            //bind event
            handle = this.own(on(layerTitleTdNode,
                'click',
                lang.hitch(this,
                    this._onRowTrClick,
                    layerInfo,
                    imageShowLegendDiv,
                    layerTrNode,
                    tableNode)));
            //this._layerNodeHandles[rootLayerInfo.id].push(handle[0]);
            this._storeLayerNodeEventHandle(rootLayerInfo, handle[0]);

            handle = this.own(on(imageShowLegendDiv,
                'click',
                lang.hitch(this,
                    this._onRowTrClick,
                    layerInfo,
                    imageShowLegendDiv,
                    layerTrNode,
                    tableNode)));
            //this._layerNodeHandles[rootLayerInfo.id].push(handle[0]);
            this._storeLayerNodeEventHandle(rootLayerInfo, handle[0]);

            handle = this.own(on(ckSelect.domNode, 'click', lang.hitch(this,
                this._onCkSelectNodeClick,
                layerInfo,
                ckSelect)));
            //this._layerNodeHandles[rootLayerInfo.id].push(handle[0]);
            this._storeLayerNodeEventHandle(rootLayerInfo, handle[0]);

            handle = this.own(on(popupMenuNode, 'click', lang.hitch(this,
                this._onPopupMenuClick,
                layerInfo,
                popupMenuNode,
                layerTrNode)));
            //this._layerNodeHandles[rootLayerInfo.id].push(handle[0]);
            this._storeLayerNodeEventHandle(rootLayerInfo, handle[0]);

            if ((layerInfo.isRootLayer && layerInfo.isRootLayer()) || layerInfo.isTable) {
                this._layerDomNodeStorage[layerInfo.getObjectId()].layerTrNode = layerTrNode;
                this._layerDomNodeStorage[layerInfo.getObjectId()].layerContentTrNode = layerContentTrNode;
            }

            this.checkboxes.push(ckSelect);

            return {
                layerTrNode: layerTrNode,
                subNode: tableNode
            };
        },

        hasContentMenu: function () {
            var hasContentMenu = false;
            var item;
            if (this.config.contextMenu) {
                for (item in this.config.contextMenu) {
                    if (this.config.contextMenu.hasOwnProperty(item) &&
                        (typeof this.config.contextMenu[item] !== 'function')) {
                        hasContentMenu = hasContentMenu || this.config.contextMenu[item];
                    }
                }
            } else {
                hasContentMenu = true;
            }
            return hasContentMenu;
        },

        addLegendNode: function (layerInfo, level, toTableNode) {
            //var legendsDiv;
            var legendTrNode = domConstruct.create('tr', {
                    'class': 'legend-node-tr'
                }, toTableNode),
                legendTdNode;

            legendTdNode = domConstruct.create('td', {
                'class': 'legend-node-td'
            }, legendTrNode);

            try {
                if (!layerInfo.createLegendsNode)
                    return;
                var legendsNode = layerInfo.createLegendsNode();
                //layerInfo.legendsNode = legendsNode;
                //domStyle.set(legendsNode, 'marginLeft', (level+1)*12 + 'px');
                domStyle.set(legendsNode, 'font-size', (level + 1) * 12 + 'px');
                domConstruct.place(legendsNode, legendTdNode);
            } catch (err) {
                console.error(err);
            }
        },

        redrawLegends: function (layerInfo) {
            var legendsNode = query("div[legendsDivId='" + layerInfo.id + "']", this.layerListTable)[0];
            if (legendsNode) {
                if (legendsNode._legendDijit && legendsNode._legendDijit.destroy) {
                    legendsNode._legendDijit.destroy();
                }
                if (!layerInfo.drawLegends)
                    return;
                layerInfo.drawLegends(legendsNode, this.layerListWidget.appConfig.portalUrl);
            }
        },

        // destroyLayerTrNode: function(layerInfo) {
        //   var removedLayerNode = query("[class~='layer-tr-node-" + layerInfo.id + "']", this.domNode)[0];
        //   var removedLayerContentNode = query("[layercontenttrnodeid='" + layerInfo.id + "']", this.domNode)[0];
        //   if(removedLayerNode) {
        //     var rootLayerInfo = layerInfo.getRootLayerInfo();
        //     array.forEach(this._layerNodeHandles[rootLayerInfo.id], function(handle) {
        //       handle.remove();
        //     }, this);
        //     delete this._layerNodeHandles[rootLayerInfo.id];
        //     domConstruct.destroy(removedLayerNode);
        //     if(removedLayerContentNode) {
        //       domConstruct.destroy(removedLayerContentNode);
        //     }
        //   }
        // },

        /***************************************************
         * methods for refresh groupableLayerListView
         ***************************************************/
        _storeLayerNodeEventHandle: function (rootLayerInfo, handle) {
            if (!rootLayerInfo) return;
            var rootLayerStorage = this._layerDomNodeStorage[rootLayerInfo.getObjectId()];
            if (rootLayerStorage) {
                rootLayerStorage.layerNodeEventHandles.push(handle);
            }
        },

        _storeLayerNodeDijit: function (rootLayerInfo, dijit) {
            if (!rootLayerInfo) return;

            var rootLayerStorage = this._layerDomNodeStorage[rootLayerInfo.getObjectId()];
            if (rootLayerStorage) {
                rootLayerStorage.layerNodeReferredDijits.push(dijit);
            }
        },

        _clearLayerDomNodeStorage: function () {
            //jshint unused:false
            var layerInfoArray = this.operLayerInfos.getLayerInfoArray();
            var tableInfoArray = this.operLayerInfos.getTableInfoArray();
            var layerAndTableInfoArray = layerInfoArray.concat(tableInfoArray);
            var findElem;
            for (var elem in this._layerDomNodeStorage) {
                if (this._layerDomNodeStorage.hasOwnProperty(elem) &&
                    (typeof this._layerDomNodeStorage[elem] !== 'function')) {
                    /* jshint loopfunc: true */
                    findElem = array.some(layerAndTableInfoArray, function (layerInfo) {
                        if (layerInfo.getObjectId && layerInfo.getObjectId().toString() === elem) {
                            return true;
                        }
                    }, this);
                    if (!findElem) {
                        //release layer node.
                        array.forEach(this._layerDomNodeStorage[elem].layerNodeEventHandles, function (handle) {
                            handle.remove();
                        }, this);
                        array.forEach(this._layerDomNodeStorage[elem].layerNodeReferredDijits, function (dijit) {
                            dijit.destroy();
                        }, this);
                        domConstruct.destroy(this._layerDomNodeStorage[elem].layerTrNode);
                        domConstruct.destroy(this._layerDomNodeStorage[elem].layerContentTrNode);
                        delete this._layerDomNodeStorage[elem];
                    }
                }
            }
        },

        _removeLayerNodes: function () {
            var nodeAndSubNode, parentNode;
            this._clearLayerDomNodeStorage();
            for (var elem in this._layerDomNodeStorage) {
                if (this._layerDomNodeStorage.hasOwnProperty(elem) &&
                    (typeof this._layerDomNodeStorage[elem] !== 'function')) {
                    nodeAndSubNode = this._layerDomNodeStorage[elem];
                    if (nodeAndSubNode.parentNode && nodeAndSubNode.layerTrNode) {
                        parentNode = nodeAndSubNode.layerTrNode.parentNode;
                        if (parentNode) {
                            parentNode.removeChild(nodeAndSubNode.layerTrNode);
                        }
                        parentNode = nodeAndSubNode.layerContentTrNode.parentNode;
                        if (parentNode) {
                            parentNode.removeChild(nodeAndSubNode.layerContentTrNode);
                        }
                    }
                }
            }
            // this.inherited(arguments);
        },

        /***************************************************
         * methods for control groupableLayerListView
         ***************************************************/
        // return current state:
        //   true:  fold,
        //   false: unfold
        _foldSwitch: function (layerInfo, imageShowLegendDiv, subNode) {
            /*jshint unused: false*/
            var state;
            if (domStyle.get(subNode, 'display') === 'none') {
                state = this._foldOrUnfoldLayer(layerInfo, false, imageShowLegendDiv, subNode);
            } else {
                state = this._foldOrUnfoldLayer(layerInfo, true, imageShowLegendDiv, subNode);
            }
            return state;
        },

        _foldOrUnfoldLayer: function (layerInfo, isFold, imageShowLegendDivParam, subNodeParam) {
            var imageShowLegendDiv =
                imageShowLegendDiv ?
                    imageShowLegendDivParam :
                    query("div[imageShowLegendDivId='" + layerInfo.id + "']", this.layerListTable)[0];
            var subNode =
                subNode ?
                    subNodeParam :
                    query("table[subNodeId='" + layerInfo.id + "']", this.layerListTable)[0];

            var state = null;
            if (imageShowLegendDiv && subNode) {
                if (isFold) {
                    //fold
                    domStyle.set(subNode, 'display', 'none');
                    domClass.remove(imageShowLegendDiv, 'unfold');
                    state = true;
                } else {
                    //unfold
                    domStyle.set(subNode, 'display', 'table');
                    domClass.add(imageShowLegendDiv, 'unfold');
                    state = false;
                    if (layerInfo.isLeaf && layerInfo.isLeaf()) {
                        var legendsNode = query(".legends-div", subNode)[0];
                        var loadingImg = query(".legends-loading-img", legendsNode)[0];
                        if (legendsNode && loadingImg) {
                            if (layerInfo.drawLegends)layerInfo.drawLegends(legendsNode, this.layerListWidget.appConfig.portalUrl);
                        }
                    }
                }
            }
            return state;
        },

        _foldOrUnfoldLayers: function (layerInfos, isFold) {
            array.forEach(layerInfos, function (layerInfo) {
                this._foldOrUnfoldLayer(layerInfo, isFold);
            }, this);
        },

        _onCkSelectNodeClick: function (layerInfo, ckSelect, evt) {
            if (evt.ctrlKey || evt.metaKey) {
                if (layerInfo.isRootLayer && layerInfo.isRootLayer()) {
                    this.turnAllRootLayers(ckSelect.checked);
                } else {
                    this.turnAllSameLevelLayers(layerInfo, ckSelect.checked);
                }
            } else {
                this.layerListWidget._denyLayerInfosIsVisibleChangedResponseOneTime = true;
                if (layerInfo.setTopLayerVisible) layerInfo.setTopLayerVisible(ckSelect.checked);
            }

//            lang.hitch(this,iterateSublayers(layerInfo, this.checkboxes));

            lang.hitch(this, function iterateSublayers(layerInfo, checkboxes) {
                for (var i = 0; i < checkboxes.length; i++) {
                    var checkbox = checkboxes[i];

                    if (layerInfo.layers != null && layerInfo.layers.length > 0) {
                        array.forEach(layerInfo.layers, lang.hitch(this, function (layer) {
                            if (layer.id == dojo.attr(checkbox.domNode.parentNode.parentNode.parentNode, 'layertrnodeid')) {
                                if (ckSelect.checked) {
                                    checkbox.check();
                                }
                                else {
                                    checkbox.uncheck();
                                }

                                if (evt.ctrlKey || evt.metaKey) {
                                    if (layer.isRootLayer && layer.isRootLayer()) {
                                        this.turnAllRootLayers(ckSelect.checked);
                                    } else {
                                        this.turnAllSameLevelLayers(layer, ckSelect.checked);
                                    }
                                } else {
                                    this.layerListWidget._denyLayerInfosIsVisibleChangedResponseOneTime = true;
                                    if (layer.setTopLayerVisible) layer.setTopLayerVisible(ckSelect.checked);
                                }

                                lang.hitch(this, iterateSublayers(layer, checkboxes));
                            }
                        }));
                    } else {
                        return;
                    }
                }
            })(layerInfo, this.checkboxes);

            evt.stopPropagation();
        },

        _onPopupMenuClick: function (layerInfo, popupMenuNode, layerTrNode, evt) {
            if (!layerInfo.getRootLayerInfo) return;
            var rootLayerInfo = layerInfo.getRootLayerInfo();
            var popupMenu = popupMenuNode.popupMenu;
            if (!popupMenu) {
                popupMenu = new PopupMenu({
                    //items: layerInfo.popupMenuInfo.menuItems,
                    _layerInfo: layerInfo,
                    box: this.layerListWidget.domNode.parentNode,
                    popupMenuNode: popupMenuNode,
                    layerListWidget: this.layerListWidget,
                    _config: this.config
                }).placeAt(popupMenuNode);
                popupMenuNode.popupMenu = popupMenu;
                this._storeLayerNodeDijit(rootLayerInfo, popupMenu);
                var handle = this.own(on(popupMenu,
                    'onMenuClick',
                    lang.hitch(this, this._onPopupMenuItemClick, layerInfo, popupMenu)));
                //this._layerNodeHandles[rootLayerInfo.id].push(handle[0]);
                this._storeLayerNodeEventHandle(rootLayerInfo, handle[0]);
            }

            /*jshint unused: false*/
            this._changeSelectedLayerRow(layerTrNode);
            if (popupMenu && popupMenu.state === 'opened') {
                popupMenu.closeDropMenu();
            } else {
                this._hideCurrentPopupMenu();
                if (popupMenu) {
                    this.currentPopupMenu = popupMenu;
                    popupMenu.openDropMenu();
                }
            }

            //hidden operation mene if that is opened.
            if (this.operationsDropMenu && this.operationsDropMenu.state === 'opened') {
                this.operationsDropMenu.closeDropMenu();
            }
            evt.stopPropagation();
        },

        _hideCurrentPopupMenu: function () {
            if (this.currentPopupMenu && this.currentPopupMenu.state === 'opened') {
                this.currentPopupMenu.closeDropMenu();
            }
        },

        _onLayerListWidgetPaneClick: function () {
            if (this.operationsDropMenu) {
                this.operationsDropMenu.closeDropMenu();
            }
        },

        _onRowTrClick: function (layerInfo, imageShowLegendDiv, layerTrNode, subNode, evt) {
            if (!layerInfo.isRootLayer) {
                var fold = this._foldSwitch(layerInfo, imageShowLegendDiv, subNode);

                if (dojo.hasClass(imageShowLegendDiv, "unfold")) {
                    dojo.removeClass(imageShowLegendDiv, "unfold");
                    dojo.addClass(imageShowLegendDiv, "fold");
                } else if (dojo.hasClass(imageShowLegendDiv, "fold")) {
                    dojo.removeClass(imageShowLegendDiv, "fold");
                    dojo.addClass(imageShowLegendDiv, "unfold");
                } else {

                }

                array.forEach(layerInfo.layers, lang.hitch(this, function (layer) {
                    var el = dojo.query("tr[layertrnodeid=" + layer.id + "]");

                    if (el.style('display') == 'none') {
                        el.style('display', '');
                    } else {
                        el.style('display', 'none');
                    }
                }));
            } else {
                this._changeSelectedLayerRow(layerTrNode);
                var fold = this._foldSwitch(layerInfo, imageShowLegendDiv, subNode);
                if (evt.ctrlKey || evt.metaKey) {
                    if (layerInfo.isRootLayer && layerInfo.isRootLayer()) {
                        this.foldOrUnfoldAllRootLayers(fold);
                    } else {
                        this.foldOrUnfoldSameLevelLayers(layerInfo, fold);
                    }
                }
            }
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

        _onPopupMenuItemClick: function (layerInfo, popupMenu, item, data) {
            var evt = {
                    itemKey: item.key,
                    extraData: data,
                    layerListWidget: this.layerListWidget,
                    groupableLayerListView: this
                },
                result;

            // window.jimuNls.layerInfosMenu.itemTransparency NlsStrings.value.itemTransparency
            if (item.key === 'transparency') {
                if (domStyle.get(popupMenu.transparencyDiv, 'display') === 'none') {
                    var op = layerInfo.getOpacity ? layerInfo.getOpacity() : 1;
                    popupMenu.showTransNode(op);
                } else {
                    popupMenu.hideTransNode();
                }
            } else {
                result = popupMenu.popupMenuInfo.onPopupMenuClick(evt);
                if (result.closeMenu) {
                    popupMenu.closeDropMenu();
                }
            }
        },

        /***************************************************
         * methods for control moveUp/moveDown.
         ***************************************************/
        // befor exchange:  id1 -> id2
        // after exchanged: id2 -> id1
        _exchangeLayerTrNode: function (layerInfo1, layerInfo2) {
            var layer1TrNode = query("tr[layerTrNodeId='" + layerInfo1.id + "']", this.layerListTable)[0];
            //var layer1ContentTrNode = query("tr[layerContentTrNodeId='" + layerInfo1.id + "']",
            //                                this.layerListTable)[0];
            var layer2TrNode = query("tr[layerTrNodeId='" + layerInfo2.id + "']", this.layerListTable)[0];
            var layer2ContentTrNode = query("tr[layerContentTrNodeId='" + layerInfo2.id + "']",
                this.layerListTable)[0];
            if (layer1TrNode && layer2TrNode && layer2ContentTrNode) {
                // change layerTr
                this.layerListTable.removeChild(layer2TrNode);
                this.layerListTable.insertBefore(layer2TrNode, layer1TrNode);
                // change LayerContentTr
                this.layerListTable.removeChild(layer2ContentTrNode);
                this.layerListTable.insertBefore(layer2ContentTrNode, layer1TrNode);
            }
        },

        _getMovedSteps: function (layerInfo, upOrDown) {
            // summary:
            //   according to hidden layers to get moved steps.
            var steps = 1;
            var layerInfoIndex;
            var layerInfoArray = this.operLayerInfos.getLayerInfoArray();
            array.forEach(layerInfoArray, function (currentLayerInfo, index) {
                if (layerInfo.id === currentLayerInfo.id) {
                    layerInfoIndex = index;
                }
            }, this);
            if (upOrDown === "moveup") {
                while (!layerInfoArray[layerInfoIndex].isFirst) {
                    layerInfoIndex--;
                    if (this.isLayerHiddenInWidget(layerInfoArray[layerInfoIndex]) && !layerInfoArray[layerInfoIndex].isFirst) {
                        steps++;
                    } else {
                        break;
                    }
                }
            } else {
                while (!layerInfoArray[layerInfoIndex].isLast) {
                    layerInfoIndex++;
                    if (this.isLayerHiddenInWidget(layerInfoArray[layerInfoIndex]) && !layerInfoArray[layerInfoIndex].isLast) {
                        steps++;
                    } else {
                        break;
                    }
                }
            }
            return steps;
        },

        moveUpLayer: function (layerInfo) {
            // summary:
            //    move up layer in layer list.
            // description:
            //    call the moveUpLayer method of LayerInfos to change the layer order in map,
            //    and update the data in LayerInfos
            //    then, change layerNodeTr and layerContentTr domNode
            var steps = this._getMovedSteps(layerInfo, 'moveup');
            this.layerListWidget._denyLayerInfosReorderResponseOneTime = true;
            var beChangedLayerInfo = this.operLayerInfos.moveUpLayer(layerInfo, steps);
            if (beChangedLayerInfo) {
                this._exchangeLayerTrNode(beChangedLayerInfo, layerInfo);
            }
        },

        moveDownLayer: function (layerInfo) {
            // summary:
            //    move down layer in layer list.
            // description:
            //    call the moveDownLayer method of LayerInfos to change the layer order in map,
            //    and update the data in LayerInfos
            //    then, change layerNodeTr and layerContentTr domNode
            var steps = this._getMovedSteps(layerInfo, 'movedown');
            this.layerListWidget._denyLayerInfosReorderResponseOneTime = true;
            var beChangedLayerInfo = this.operLayerInfos.moveDownLayer(layerInfo, steps);
            if (beChangedLayerInfo) {
                this._exchangeLayerTrNode(layerInfo, beChangedLayerInfo);
            }
        },

        isLayerHiddenInWidget: function (layerInfo) {
            var isHidden = false;
            var currentLayerInfo = layerInfo;
            if (layerInfo &&
                this.config.layerOptions &&
                this.config.layerOptions[layerInfo.id] !== undefined) {
                while (currentLayerInfo) {
                    isHidden = isHidden || !this.config.layerOptions[currentLayerInfo.id].display;
                    if (isHidden) {
                        break;
                    }
                    currentLayerInfo = currentLayerInfo.parentLayerInfo;
                }
            } else {
                // if config has not been configured, default value is 'true'.
                // if config has been configured, but new layer of webmap is ont in config file,
                //   default value is 'true'.
                isHidden = false;
            }
            return isHidden;
        },

        isFirstDisplayedLayerInfo: function (layerInfo) {
            var isFirst;
            var steps;
            var layerInfoIndex;
            var layerInfoArray;
            if (layerInfo.isFirst || !layerInfo.isRootLayer()) {
                isFirst = true;
            } else {
                steps = this._getMovedSteps(layerInfo, "moveup");
                layerInfoArray = this.operLayerInfos.getLayerInfoArray();
                layerInfoIndex = this.operLayerInfos._getTopLayerInfoIndexById(layerInfo.id);
                if (this.isLayerHiddenInWidget(layerInfoArray[layerInfoIndex - steps])) {
                    isFirst = true;
                } else {
                    isFirst = false;
                }
            }
            return isFirst;
        },

        isLastDisplayedLayerInfo: function (layerInfo) {
            var isLast;
            var steps;
            var layerInfoIndex;
            var layerInfoArray;
            if (layerInfo.isLast || !layerInfo.isRootLayer()) {
                isLast = true;
            } else {
                steps = this._getMovedSteps(layerInfo, "movedown");
                layerInfoArray = this.operLayerInfos.getLayerInfoArray();
                layerInfoIndex = this.operLayerInfos._getTopLayerInfoIndexById(layerInfo.id);
                if (this.isLayerHiddenInWidget(layerInfoArray[layerInfoIndex + steps])) {
                    isLast = true;
                } else {
                    isLast = false;
                }
            }
            return isLast;
        },

        /***************************************************
         * methods for control operation.
         ***************************************************/
        _initOperations: function () {
            this.operationsDropMenu = new DropMenu({
                items: [
                    {
                        key: "turnAllLayersOn",
                        label: this.nls.turnAllLayersOn
                    },
                    {
                        key: "turnAllLayersOff",
                        label: this.nls.turnAllLayersOff
                    },
                    {
                        key: "separator"
                    },
                    {
                        key: "expandAllLayers",
                        label: this.nls.expandAllLayers
                    },
                    {
                        key: "collapseAlllayers",
                        label: this.nls.collapseAlllayers
                    }
                ],
                box: this.layerListWidget.domNode.parentNode
            }).placeAt(this.layerListOperations);

            var operationIconBtnNode = query('div.jimu-dropmenu > div:first-child',
                this.layerListOperations)[0];

            if (operationIconBtnNode) {
                domClass.remove(operationIconBtnNode, ['jimu-icon-btn', 'popup-menu-button']);
                domClass.add(operationIconBtnNode, ['feature-action', 'icon-operation']);
            }

            if (this.operationsDropMenu.btnNode) {
                this.own(on(this.operationsDropMenu.btnNode,
                    'click',
                    lang.hitch(this, this._onLayerListOperationsClick)));
            }

            this.own(on(this.operationsDropMenu,
                'onMenuClick',
                lang.hitch(this, this._onOperationsMenuItemClick)));
        },

        _onLayerListOperationsClick: function () {
            this._hideCurrentPopupMenu();
        },

        _onOperationsMenuItemClick: function (item) {
            switch (item.key) {
                case 'turnAllLayersOn':
                    this.turnAllRootLayers(true);
                    return;
                case 'turnAllLayersOff':
                    this.turnAllRootLayers(false);
                    return;
                case 'expandAllLayers':
                    this.foldOrUnfoldAllRootLayers(false);
                    return;
                case 'collapseAlllayers':
                    this.foldOrUnfoldAllRootLayers(true);
                    return;
                default:
                    return;
            }
        },

        turnAllRootLayers: function (isOnOrOff) {
            var layerInfoArray = this.operLayerInfos.getLayerInfoArray();
            array.forEach(layerInfoArray, function (layerInfo) {
                if (!this.isLayerHiddenInWidget(layerInfo)) {
                    layerInfo.setTopLayerVisible(isOnOrOff);
                }
            }, this);
        },

        turnAllSameLevelLayers: function (layerInfo, isOnOrOff) {
            var layerOptions = {};
            if (!layerInfo.getRootLayerInfo) return;

            var rootLayerInfo = layerInfo.getRootLayerInfo();
            rootLayerInfo.traversal(lang.hitch(this, function (subLayerInfo) {
                if (subLayerInfo.parentLayerInfo &&
                    subLayerInfo.parentLayerInfo.id === layerInfo.parentLayerInfo.id && !this.isLayerHiddenInWidget(subLayerInfo)) {
                    layerOptions[subLayerInfo.id] = {visible: isOnOrOff};
                } else {
                    layerOptions[subLayerInfo.id] = {visible: subLayerInfo.isVisible()};
                }
            }));
            rootLayerInfo.resetLayerObjectVisibility(layerOptions);
        },

        foldOrUnfoldAllRootLayers: function (isFold) {
            var layerInfoArray = array.filter(this.operLayerInfos.getLayerInfoArray(),
                function (layerInfo) {
                    return !this.isLayerHiddenInWidget(layerInfo);
                }, this);
            this._foldOrUnfoldLayers(layerInfoArray, isFold);
        },

        foldOrUnfoldSameLevelLayers: function (layerInfo, isFold) {
            var layerInfoArray;
            if (layerInfo.parentLayerInfo) {
                layerInfoArray = array.filter(layerInfo.parentLayerInfo.getSubLayers(),
                    function (layerInfo) {
                        return !this.isLayerHiddenInWidget(layerInfo);
                    }, this);
                this._foldOrUnfoldLayers(layerInfoArray, isFold);
            }
        }

    });
});
