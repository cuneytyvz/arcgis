define([
    'dojo/_base/declare',
    'dojo/query',
    'dojo/_base/lang',
    'dojo/_base/html',
    'dojo/text!./ChartSort.html',
    'dojo/Evented',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'jimu/utils',
    'dijit/form/RadioButton'
  ],
  function(declare, query, lang, html, templateString, Evented,
    _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, jimuUtils) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, Evented], {
      baseClass: 'infographic-chart-sort',
      templateString: templateString,

      //computed
      //  mode:chart mode,
      //  fieldOption:null,
      //  sortArrowPosition:'top','mid','down'

      //config
      //  isLabelAxis:boolean
      //  isAsc:boolean
      //  field:''

      constructor: function() {
        this.inherited(arguments);

        this.PRE_MODLE = {
          computed: {},
          config: {}
        };

        this.modle = {
          computed: {},
          config: {}
        };
      },

      postCreate: function() {
        this.inherited(arguments);
      },

      updateComputeds: function(computed) {
        if (!computed || !computed.mode) {
          return;
        }
        this.PRE_MODLE = lang.clone(this.modle);
        computed = lang.clone(computed);
        this.modle.computed = null;
        this.modle.computed = computed;
        this._initModleDefaultValue(this.modle);
        this.render(this.modle);
      },

      _initConfigWhenModeChange: function(modle) {
        var preComputed = this.PRE_MODLE.computed;
        var computed = modle.computed;

        if (!this._isEqual(computed.mode, preComputed.mode)) {
          modle.config = {};
        }
      },

      _initModleDefaultValue: function(modle) {
        this._initConfigWhenModeChange(modle);
        var config = modle.config;
        var computed = modle.computed;
        var mode = computed.mode;

        if (!mode) {
          return modle;
        }
        //computed
        if (typeof computed.fieldOption === 'undefined') {
          computed.fieldOption = [];
        }

        if (typeof computed.sortArrowPosition === 'undefined') {
          if (mode === 'feature') {
            computed.sortArrowPosition = 'down';
          } else {
            computed.sortArrowPosition = 'top';
          }
        }
        //config
        if (typeof config.isAsc === 'undefined') {
          config.isAsc = true;
        }
        if (mode === 'feature') {
          if (typeof config.field === 'undefined') {
            if (computed.fieldOption && computed.fieldOption[0]) {
              config.field = computed.fieldOption[0].value;
            }
          }
        } else if (mode === 'count' || mode === 'field') {
          if (typeof config.isLabelAxis === 'undefined') {
            config.isLabelAxis = true;
          }
        } else if (mode === 'category') {

          if (typeof config.isLabelAxis === 'undefined') {
            config.isLabelAxis = true;
          }

          if (typeof config.field === 'undefined') {
            if (computed.fieldOption && computed.fieldOption[0]) {
              config.field = computed.fieldOption[0].value;
            }
          }
        }
      },

      render: function(modle) {
        this._updateComputed(modle);
        this._render(modle);
      },

      setConfig: function(config) {
        this.modle.config = lang.clone(config);
        this.render(this.modle);
      },

      getConfig: function() {
        var computed = this.modle.computed;
        var mode = computed.mode;
        if (!mode) {
          return false;
        }
        var config = lang.clone(this.modle.config);
        if (mode === 'feature') {
          delete config.isLabelAxis;
        } else if (config.isLabelAxis) {
          delete config.field;
        }
        return config;
      },

      _onChange: function() {
        if (this.ignoreChangeEvents) {
          return;
        }
        var config = this.getConfig();
        if (config) {
          this.emit('change', config);
        }
      },

      _render: function(modle) {
        if (!modle) {
          return;
        }
        this.ignoreChangeEvents = true;
        this._renderByComputed(modle);
        this._renderByConfig(modle);
        this.ignoreChangeEvents = false;
      },

      _updateComputed: function(modle) {
        var config = modle.config;
        var computed = modle.computed;
        var mode = computed.mode;

        if (config.isLabelAxis) {
          computed.sortArrowPosition = 'top';
        } else if (mode !== 'feature') {
          computed.sortArrowPosition = 'mid';
        } else if (mode === 'feature') {
          computed.sortArrowPosition = 'down';
        }
      },

      _renderByComputed: function(modle) {
        var preComputed = this.PRE_MODLE.computed;
        var computed = modle.computed;
        var mode = computed.mode;
        if (this._isEqual(preComputed, computed)) {
          return;
        }

        //fieldOption
        if (!this._isEqual(computed.fieldOption, preComputed.fieldOption)) {
          if (computed.fieldOption && computed.fieldOption.length > 0) {
            this._updateOptions(this.sortField, computed.fieldOption);
          }
        }

        //sortArrowPosition
        if (!this._isEqual(computed.sortArrowPosition, preComputed.sortArrowPosition) ||
          !this._isEqual(computed.mode, preComputed.mode)) {
          this._moveSortArrow(computed.sortArrowPosition);
          // sort field display
          this._updateSortFieldDisplay(computed.sortArrowPosition, mode);
        }
      },

      _renderByConfig: function(modle) {
        var preConfig = this.PRE_MODLE.config;
        var config = modle.config;

        if (this._isEqual(config, preConfig)) {
          return;
        }

        //isLabelAxis
        if (!this._isEqual(config.isLabelAxis, preConfig.isLabelAxis)) {
          this.xAxisRadio.setChecked(config.isLabelAxis);
          this.yAxisRadio.setChecked(!config.isLabelAxis);
        }

        //isAsc
        if (!this._isEqual(config.isAsc, preConfig.isAsc)) {
          if (config.isAsc) {
            this._selectAscBtn();
          } else {
            this._selectDescBtn();
          }
        }
        //field
        if (!this._isEqual(config.field, preConfig.field)) {
          if (config.field) {
            this._updateOptions(this.sortField, null, config.field);
          }
        }
      },

      _moveSortArrow: function(position) {
        if (position === 'top') {
          html.place(this.sortBtn, this.xAxisSortDiv);
        } else if (position === 'mid') {
          html.place(this.sortBtn, this.yAxisSortDiv);
        } else if (position === 'down') {
          html.place(this.sortBtn, this.zAxisSortDiv);
        }
      },

      _updateSortFieldDisplay: function(position, mode) {
        if (position === 'top') {
          this._showRadioPanel();
          html.addClass(this.sortFielTr, 'hide');
          html.addClass(this.zSortContainer, 'hide');
        } else if (position === 'mid') {

          this._showRadioPanel();
          if (mode === 'category') {
            this._showSortFieldTr();
            html.addClass(this.zSortContainer, 'hide');
          } else {
            html.addClass(this.sortFielTr, 'hide');
          }
        } else if (position === 'down') {
          this._hideRadioPanel();
          this._showSortFieldTr();
          html.removeClass(this.zSortContainer, 'hide');
        }
      },

      _showSortFieldTr: function() {
        html.removeClass(this.sortFielTr, 'hide');
        if (this.modle.config && typeof this.modle.config.field === 'undefined') {
          this.modle.config.field = this.sortField.get('value');
        }
      },

      _hideRadioPanel: function() {
        html.addClass(this.radioDiv, 'hide');
      },

      _showRadioPanel: function() {
        html.removeClass(this.radioDiv, 'hide');
      },

      _selectAscBtn: function() {
        var ascNode = query('.asc', this.sortBtn)[0];
        var descNode = query('.desc', this.sortBtn)[0];
        html.removeClass(descNode, 'selected');
        html.addClass(ascNode, 'selected');
      },

      _selectDescBtn: function() {
        var ascNode = query('.asc', this.sortBtn)[0];
        var descNode = query('.desc', this.sortBtn)[0];
        html.addClass(descNode, 'selected');
        html.removeClass(ascNode, 'selected');
      },

      _updateOptions: function(select, options, value) {
        if (options) {
          select.removeOption(select.getOptions());
          select.addOption(options);
        } else {
          options = [];
        }
        if (!value && options.length > 0) {
          value = options[0].value;
        }
        if (value) {
          select.set('value', value);
        }
      },

      _isEqual: function(v1, v2) {
        if (typeof v1 !== typeof v2) {
          return false;
        }
        if (typeof v1 !== 'object') {
          return v1 === v2;
        } else {
          return jimuUtils.isEqual(v1, v2);
        }
      },

      /* changed*/
      _onXaxisRadioChanged: function(isCheck) {
        if (this.ignoreChangeEvents) {
          return;
        }
        this.PRE_MODLE = lang.clone(this.modle);
        this.modle.config.isLabelAxis = isCheck;
        this.render(this.modle);
        this._onChange();
      },

      _onAxisSortDivClick: function(e) {
        e.stopPropagation();
        var target = e.target;
        var isAsc = true;
        if (html.hasClass(target, 'asc')) {
          this._selectAscBtn();
          isAsc = true;
        } else if (html.hasClass(target, 'desc')) {
          this._selectDescBtn();
          isAsc = false;
        }
        if (this.ignoreChangeEvents) {
          return;
        }
        this.PRE_MODLE = lang.clone(this.modle);
        this.modle.config.isAsc = isAsc;
        this._onChange();
      },

      _onSortFieldsChanged: function(field) {
        if (this.ignoreChangeEvents) {
          return;
        }
        this.PRE_MODLE = lang.clone(this.modle);
        this.modle.config.field = field;
        this._onChange();
      }
    });
  });