/*
 | Copyright 2017 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
//====================================================================================================================//
define([
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/on',
  './settingComponents',
  './SettingObject'
], function (
  declare,
  lang,
  on,
  settingComponents,
  SettingObject
) {
  return declare(SettingObject, {
    _inputControl: null,

    //================================================================================================================//

    /**
     * Constructor for class.
     * @param {object} config App configuration object; see subclass for required parameter(s)
     * @memberOf SettingDropdown#
     * @constructor
     */
    constructor: function (name, divClasses, dropdownClasses, options) {
      /*jshint unused:false*/
      var subcomponent = settingComponents.dropdownCtl(divClasses, dropdownClasses, options);
      this._mainDiv = subcomponent.div;
      this._inputControl = subcomponent.ctl;
      this.own(on(this._inputControl, 'change', lang.hitch(this, this._onChange)));
    },

    setValue: function (value) {
      if (this._inputControl) {
        this._inputControl.set('value', value);
      }
    },

    getValue: function () {
      if (this._inputControl) {
        return this._inputControl.get('value');
      }
      return null;
    },

    setConfig: function () {
      if (this._inputControl && this._config) {
        this.setValue(this._config);
      }
    },

    getConfig: function () {
      if (this._inputControl) {
        this._config = this.getValue();
      }
    },

    _onChange: function (evt) {
      this._config = evt;
    }

    //================================================================================================================//
  });
});
