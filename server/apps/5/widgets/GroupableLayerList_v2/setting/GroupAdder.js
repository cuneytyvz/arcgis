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
    'dijit/_WidgetBase',
    'dojo/_base/declare',
    "dojo/request",
    "esri/request",
    "dojo/request/xhr",
    "dojo/json",
    'dojo/_base/html',
    'dojo/_base/lang',
    'dojo/_base/array',
    'dojo/dom-construct',
    'dojo/on',
    'dojo/query',
    'dojo/Evented',
    'jimu/dijit/CheckBox',
    'dijit/form/Select',
    'dijit/form/TextBox',
    'dijit/form/NumberTextBox',
    'dijit/form/ValidationTextBox',
    'dijit/_TemplatedMixin',
    'dojo/text!./GroupAdder.html',
    'dojo/dom-class',
    'dojo/dom-style',
    "dojo/_base/fx"
], function (_WidgetBase, declare, request, esriRequest, xhr, json, html, lang, array, domConstruct, on, query, Evented, CheckBox, Select, TextBox, NumberTextBox, ValidationTextBox, _TemplatedMixin, template, domClass, domStyle, fx) {

    return declare([_WidgetBase, _TemplatedMixin], {
        templateString: template,
        baseClass: 'group-adder',
        setting: null,
        _currentSelectedLayerRowNode: null,
        _displayStateStorage: null,
        nls: null,
        maxGroupId: 0,
        uiOptions: {},
        initialGroupInfo: {numberOfLevels: 1, appId: this.appId, groups: [
            {id: 0, title: 'Other', layers: []}
        ]},
        groupInfo: {numberOfLevels: 1, appId: this.appId, groups: [
            {id: 0, title: 'Other', layers: []}
        ]},
        numberOfLevels: 1,
        submostGroup: null,
        addedLayers: [],
        nodes: [],

        postMixInProperties: function () {
            this.inherited(arguments);
            this._displayStateStorage = {};
        },

        postCreate: function () {
            this.copyGroupInfoToInitialGroupInfo();

            this._createGroupSelector();
        },

        copyGroupInfoToInitialGroupInfo: function () {
            array.forEach(this.groupInfo.groups, lang.hitch(this, function (group) {
                this.initialGroupInfo.groups.push(group);
            }));
        },

        refresh: function () {
            this.groupSelect.innerHTML = '';
            array.forEach(this.nodes, lang.hitch(this, function (node) {
                dojo.destroy(node);
                node = null;
            }));

            this.nodes = [];

            this._createGroupSelector();
            this.setting.destroyLayerSelector();
            this.setting.createGroupableLayerSelector(this.groupInfo);
        },

        getMaxGroupId: function () {
            var max = 0;
            array.forEach(this.groupInfo.groups, lang.hitch(function (group) {
                if (group.id > max)
                    max = group.id;
            }));

            return max;
        },

        _onGroupAddClick: function () {
            if (this.groupTextInput.value.length == 0) {
                return;
            }

            var exists = false;
            for (var jj = 0; jj < this.groupInfo.groups.length; jj++) {
                if (this.groupTextInput.value == this.groupInfo.groups[jj].title)
                    exists = true;
            }

            if (!exists) {
                this.groupInfo.groups.push({
                    id: this.getMaxGroupId() + 1,
                    title: this.groupTextInput.value,
                    layers: [],
                    subgroups: []
                });
            }

            this.uiOptions.lastSelectedGroup = this.groupInfo.groups[this.groupInfo.groups.length - 1];

            this.refresh();
        },

        _onGroupRemoveClick: function () {
            var groupIndex = -1, group;

            // Find group
            for (var i = 0; i < this.groupInfo.groups.length; i++) {
                if (this.groupInfo.groups[i].id == this.selectGroup.value) {
                    groupIndex = i;
                    group = this.groupInfo.groups[i];
                }
            }

            // Find layers below this group and remove them from addedLayers
            for (var i = 0; i < group.layers.length; i++) {

                var lIndex = -1;
                for (var j = 0; j < this.addedLayers.length; j++) {
                    if (this.addedLayers[j].id == group.layers[i].value) {
                        lIndex = j;
                    }
                }

                this.addedLayers.splice(lIndex, 1);
            }

            this.groupInfo.groups.splice(groupIndex, 1);
            this.refresh();
        },

        _onSubgroupAddClick: function () {

        },

        _onSubgroupRemoveClick: function () {

        },

        _onRemoveLayerFromGroupClicked: function () {
            var lIndex = -1;

            for (var i = 0; i < this.selectedGroup.layers.length; i++) {
                if (this.selectedGroup.layers[i].id == this.selectRemoveLayer.value) {
                    lIndex = i;
                }
            }

            this.selectedGroup.layers.splice(lIndex, 1);

            for (var i = 0; i < this.addedLayers.length; i++) {
                if (this.addedLayers[i].id == this.selectRemoveLayer.value) {
                    lIndex = i;
                }
            }

            this.addedLayers.splice(lIndex, 1);

            this.refresh();
        },

        _onAddLayerToGroupClicked: function () {
            // Add to desired group
            if (this.selectedGroup.layers == null) {
                this.selectedGroup.layers = [];
            }
            this.selectedGroup.layers.push({id: this.selectedLayer.id, title: this.selectedLayer.title});
            this.addedLayers.push({id: this.selectedLayer.id, title: this.selectedLayer.title});

            // Remove from the Other group
            var lIndex = i;
            for (var i = 0; i < this.groupInfo.groups[0].layers.length; i++) {
                var layer = this.groupInfo.groups[0].layers[i];
                if (layer.id == this.selectedLayer.id) {
                    lIndex = i;
                }
            }

            this.groupInfo.groups[0].layers.splice(lIndex, 1);

            this.refresh();
        },

        _onSaveClicked: function () {
            var context = this;

            var data = {};
            data.appId = parseInt(this.groupInfo.appId);
            data.groups = [];

            for (var i = 0; i < this.groupInfo.groups.length; i++) {
                var g = {id: this.groupInfo.groups[i].id, title: this.groupInfo.groups[i].title, layers: []};

                for (var j = 0; j < this.groupInfo.groups[i].layers.length; j++) {
                    var l = this.groupInfo.groups[i].layers[j];

                    var layer = {
                        id: l.id,
                        title: l.title
                    }

                    g.layers.push(layer);
                }

                data.groups.push(g);
            }

            request.post("/webappbuilder/rest/layerGroups/" + data.appId + "/save", {
                data: {data: dojo.toJson(data)},
                headers: {
                }
            }).then(function (r) {
                console.log("The server returned: " + r);
                context.refresh();
                context._promptSaved();
            });

        },

        _onCancelClicked: function () {
            this.groupInfo = this.initialGroupInfo;
            this.refresh();
        },

        _promptSaved: function () {
            domStyle.set(this.promptSaved, {'display': 'block'});
//            fx.fadeOut({node: this.promptSaved.id, duration: 500}).play();
        },

        _createGroupSelector: function () {
            var groupOptions = [];
            groupOptions.push({label: 'Select group', value: '-1'});

            array.forEach(this.groupInfo.groups, lang.hitch(this, function (group) {
                if (group.id != 0) // Skip 'Other' group
                    groupOptions.push({label: group.title, value: group.id, group: group});
            }));

            this.howManyLevelsNode = domConstruct.create("div", {style: 'margin-bottom:5px;'});

            this.howManyLevelsText = domConstruct.create("span",
                {title: 'Number of levels : ',
                    class: '',
                    style: "",
                    innerHTML: 'Number of levels : '}
            );

            this.howManyLevelsNode.appendChild(this.howManyLevelsText);

            this.howManyLevelsTextInput = new NumberTextBox({
                name: "howManyLevelTextBox",
                value: "",
                class: "styles-text",
                style: "margin-left:5px; width: 60px;",
                placeHolder: "",
                constraints: {pattern: "##", min: 1, max: 2},
                invalidMessage: 'The max. value is 2.',
                'data-dojo-attach-point': 'numberOfLevels',
                value: this.numberOfLevels == null ? '' : this.numberOfLevels
            }, "groupName");

            dojo.place(this.howManyLevelsTextInput.domNode, this.howManyLevelsText, 'after');

            this.howManyLevelsText = domConstruct.create("span",
                {title: '',
                    class: '',
                    style: "margin-left:5px; color:red;",
                    innerHTML: ''}
            );

            var context = this;
            this.howManyLevelsTextInput.domNode.onchange = function () {
                var v = parseInt(context.howManyLevelsTextInput.value);
                if (v > 0 && v < 3) {
                    context.numberOfLevels = v;
                    context.groupInfo.numberOfLevels = v;
                }
            };

//            dojo.place(this.howManyLevelsNode, this.groupSelect);

            this.groupTextInput = new TextBox({
                name: "groupTextBox",
                value: "",
                class: "styles-text",
                style: "margin-left:5px",
                placeHolder: "Type in group name...",
                'data-dojo-attach-point': 'groupName'
            }, "groupName");

//            dojo.place(this.groupTextInput.domNode, this.howManyLevelsNode, 'after');
            dojo.place(this.groupTextInput.domNode, this.groupSelect);

            var groupAddButton = domConstruct.create("span",
                {title: 'Add Group',
                    class: 'jimu-btn',
                    style: "margin-left:5px",
                    innerHTML: 'Add Group'}
            );

            dojo.connect(groupAddButton, 'onclick', this, this._onGroupAddClick);

            dojo.place(groupAddButton, this.groupTextInput.domNode, 'after');

            this.selectGroup = new Select({
                name: "selectGroup",
                options: groupOptions
            });

            this.groupRemoveNode = domConstruct.create("div", {style: 'margin-top: 5px'});
            this.groupRemoveNode.appendChild(this.selectGroup.domNode);

            // set to last selected group if exists
            if (this.uiOptions.lastSelectedGroup)
                this.selectGroup.attr('value', this.uiOptions.lastSelectedGroup.id);

            dojo.place(this.groupRemoveNode, groupAddButton, 'after');

            var context = this;
//            this.selectGroup.domNode.onchange = function () {
//                console.log('onchange');
//                if (context.numberOfLevels == 1) {
//                    context.submostGroup = context.selectGroup;
//                }
//            };

            var groupRemoveButton = domConstruct.create("span",
                {
                    title: 'Remove Group',
                    class: 'jimu-btn',
                    style: "margin-left:5px",
                    innerHTML: 'Remove Group'
                }
            );

            dojo.connect(groupRemoveButton, 'onclick', this, this._onGroupRemoveClick);

            dojo.place(groupRemoveButton, this.selectGroup.domNode, 'after');

            var saveButton = domConstruct.create("span",
                {title: 'Save',
                    class: 'jimu-btn',
                    style: "margin-left:5px",
                    'data-dojo-attach-event': 'click:_onSaveClicked',
                    innerHTML: 'Save'}
            );

            dojo.connect(saveButton, 'onclick', this, this._onSaveClicked);

            this.cancelButton = domConstruct.create("span",
                {title: 'Cancel',
                    class: 'jimu-btn',
                    style: "margin-left:5px",
                    'data-dojo-attach-event': 'click:_onCancelClicked',
                    innerHTML: 'Cancel'}
            );

            this.promptSaved = domConstruct.create("span",
                {
                    style: "margin-left:5px; display:none",
                    class: 'prompt-saved',
                    innerHTML: "Saved."
                });

            dojo.place(this.promptSaved, this.cancelButton, 'after');

            dojo.connect(this.cancelButton, 'onclick', this, this._onCancelClicked);

            var saveCancelNode = domConstruct.create("div", {style: 'margin-top: 5px'});
            saveCancelNode.appendChild(saveButton);
            saveCancelNode.appendChild(this.cancelButton);

            dojo.place(saveCancelNode, this.groupRemoveNode, 'after');

            // ON CHANGE
            this.selectGroup.on('change', lang.hitch(this, function (evt) {
                array.forEach(this.nodes, lang.hitch(this, function (selectSubgroup) {
                    dojo.destroy(selectSubgroup);
                    node = null;
                }));

                this.nodes = [];

                this.selectedGroup = null;

                for (var i = 0; i < this.groupInfo.groups.length; i++) {
                    var group = this.groupInfo.groups[i];

                    if (group.id == evt) {
                        this.selectedGroup = group;
                    }
                }

                this.uiOptions.lastSelectedGroup = this.selectedGroup;

                if (this.selectedGroup != null) {
                    this._createAddLayerRow();
                    this.nodes.push(this.layerAddNode);
                }

                if (this.selectedGroup != null && this.selectedGroup.layers != null && this.selectedGroup.layers.length > 0) {
                    this._createRemoveLayerRow();
                    this.nodes.push(this.layerRemoveNode);
                }

//                this._createSubgroupSelectBox(evt);
            }));
        },

        _createRemoveLayerRow: function () {
            var selectedSubgroup = null, selectSubgroup = this.selectSubgroup;
            array.forEach(this.subgroupOptions, lang.hitch(this, function (op) {
                if (selectSubgroup.getValue() == op.value) {
                    selectedSubgroup = op.group;
                }
            }));

            if (this.numberOfLevels > 1) {
                this.submostGroup = selectedSubgroup;
            }

            var subgroupLayerOptions = [];
            array.forEach(this.selectedGroup.layers, lang.hitch(this, function (layer) {
                var obj = {};
                array.forEach(this.operLayerInfos._operLayers, lang.hitch(this, function (l) {
                    if (l.title == layer.title) {
                        obj = l;
                    }
                }));

                subgroupLayerOptions.push({label: obj.title, value: obj.id, layer: obj});
            }));

            this.selectRemoveLayer = new Select({
                name: "selectSubgrouplayer",
                options: subgroupLayerOptions
            });

            this.layerRemoveNode = domConstruct.create("div", {style: 'margin-top: 5px'});
            this.layerRemoveNode.appendChild(this.selectRemoveLayer.domNode);

            var removeLayerFromGroupButton = domConstruct.create("span",
                {title: 'Remove Layer from Group',
                    class: 'jimu-btn',
                    style: "margin-left:5px",
                    'data-dojo-attach-event': 'click:_onRemoveLayerFromGroupClicked',
                    innerHTML: 'Remove Layer from Group'}
            );

            dojo.connect(removeLayerFromGroupButton, 'onclick', this, this._onRemoveLayerFromGroupClicked);

            dojo.place(removeLayerFromGroupButton, this.selectRemoveLayer.domNode, 'after');

            // Placement of the node
            var placeAfter = null;
            if (this.addLayerOptions == null || this.addLayerOptions.length == 0)
                placeAfter = this.groupRemoveNode;
            else
                placeAfter = this.layerAddNode;

            dojo.place(this.layerRemoveNode, placeAfter, 'after');
        },

        _createAddLayerRow: function () {
            this.addLayerOptions = [];

            var context = this;
            array.forEach(this.operLayerInfos._operLayers, lang.hitch(this, function (layerInfo) {
                var exists = false;
                array.forEach(context.addedLayers, lang.hitch(this, function (addedLayer) {
                    if (addedLayer.id == layerInfo.id)
                        exists = true;
                }));

                if (!exists)
                    this.addLayerOptions.push({label: layerInfo.title, value: layerInfo.title, layer: layerInfo});
            }));

            this.selectLayer = new Select({
                name: "selectLayer",
                options: this.addLayerOptions
            });

            if (this.addLayerOptions.length > 0)
                this.selectedLayer = this.addLayerOptions[0].layer;
            else
                return;

            var context = this;
            this.selectLayer.on('change', lang.hitch(function (evt) {
                array.forEach(context.operLayerInfos._operLayers, lang.hitch(function (layerInfo) {
                    if (layerInfo.title == context.selectLayer.value) {
                        context.selectedLayer = layerInfo;
                    }
                }));
            }));

            this.layerAddNode = domConstruct.create("div", {style: 'margin-top: 5px'});
            this.layerAddNode.appendChild(this.selectLayer.domNode);

            this.addLayerToGroupButton = domConstruct.create("span",
                {title: 'Add Layer to Group',
                    class: 'jimu-btn',
                    style: "margin-left:5px",
                    'data-dojo-attach-event': 'click:_onAddLayerToGroupClicked',
                    innerHTML: 'Add Layer to Group'}
            );

            dojo.connect(this.addLayerToGroupButton, 'onclick', this, this._onAddLayerToGroupClicked);

            dojo.place(this.addLayerToGroupButton, this.selectLayer.domNode, 'after');

            // Placement of the node
            dojo.place(this.layerAddNode, this.groupRemoveNode, 'after');
        }

    });
});