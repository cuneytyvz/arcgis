define({
  "layersPage": {
    "title": "Выберите шаблон для создания объектов",
    "generalSettings": "Общие параметры",
    "layerSettings": "Настройки слоя",
    "editDescription": "Введите текст, отображаемый на панели редактирования",
    "editDescriptionTip": "Этот текст будет отображаться над инструментом выбора шаблона, оставьте пустым, если текст не требуется.",
    "promptOnSave": "Запрос на сохранение изменений при закрытии формы или переключении к следующей записи.",
    "promptOnSaveTip": "Отображать запрос, когда пользователь закрывает окно или переходит к следующей редактируемой записи, если у текущего объекта имеются несохраненные изменения.",
    "promptOnDelete": "При удалении записи требуется подтверждение.",
    "promptOnDeleteTip": "Отображать запрос, когда пользователь выбирает удаление для подтверждения действия.",
    "removeOnSave": "Удалить объект из выборки при сохранении.",
    "removeOnSaveTip": "Опция для удаления объекта из выборки при сохранении записи. Если это единственная выбранная запись, панель переключается назад, на страницу шаблона.",
    "useFilterEditor": "Использовать фильтр шаблонов объектов",
    "useFilterEditorTip": "Опция для использования инструмента фильтрации шаблонов, позволяющего просматривать шаблоны слоев или находить их по имени.",
    "displayShapeSelector": "Показать опции рисования",
    "displayShapeSelectorTip": "Опция, показывающая список допустимых опций рисования для выбранного шаблона.",
    "displayPresetTop": "Показать вверху список предустановленных значений",
    "displayPresetTopTip": "Опция, показывающая список предустановленных значений над выбором шаблона.",
    "listenToGroupFilter": "Применить значения фильтра из виджета Фильтр группы к Предустановленным полям",
    "listenToGroupFilterTip": "Когда в виджете Групповой фильтр применяется фильтр, можно применить значение к соответствующему полю в списке Предустановленные значения.",
    "keepTemplateActive": "Поддерживать активность выбранного шаблона",
    "keepTemplateActiveTip": "При отображении инструмента выбора шаблона, если шаблон уже был выделен, происходит его повторное выделение.",
    "geometryEditDefault": "Включить редактирование геометрии по умолчанию",
    "autoSaveEdits": "Сохраняет изменения автоматически",
    "layerSettingsTable": {
      "allowDelete": "Разрешить удаление",
      "allowDeleteTip": "Опция, разрешающая пользователю удалять объект; отключена, если слой не поддерживает удаление",
      "edit": "Доступно для редактирования",
      "editTip": "Опции для включения слоя в виджет",
      "label": "Слой",
      "labelTip": "Имя слоя, как определено на карте",
      "update": "Отключить Редактирование геометрии",
      "updateTip": "Опция для отключения возможности перемещения геометрии после ее размещения или перемещения геометрии на существующий объект",
      "allowUpdateOnly": "Только обновление",
      "allowUpdateOnlyTip": "Опция, разрешающая только изменение имеющихся объектов, включена по умолчанию и отключена, если слой не поддерживает создание новых объектов",
      "fields": "Поля",
      "fieldsTip": "Изменение редактируемых полей и задание Умных атрибутов",
      "description": "Описание",
      "descriptionTip": "Опция ввода текста, который отображается вверху страницы атрибутов."
    },
    "editFieldError": "Изменения полей и использование Умных атрибутов не доступно для слоев, не являющихся редактируемыми",
    "noConfigedLayersError": "Для Умного редактора требуется один или несколько редактируемых слоев"
  },
  "editDescriptionPage": {
    "title": "Задать текст обзора атрибутов для <b>${layername}</b> "
  },
  "fieldsPage": {
    "title": "Настроить поля для <b>${layername}</b>",
    "description": "Используйте столбец Preset, чтобы разрешить пользователям вводить значение до создания нового объекта. Используйте кнопку Редактирование действий, чтобы включить на слое Умные атрибуты. Умные атрибуты могут скрывать или отключать поле, основываясь на значениях в других полях, а также требовать наличия поля.",
    "fieldsNotes": "* является обязательным полем. Если вы снимите отметку Отображать у этого поля, а шаблон редактирования не содержит значения для него, вы не сможете сохранить новую запись.",
    "fieldsSettingsTable": {
      "display": "Отображение",
      "displayTip": "Определяет, является ли поле не отображаемым",
      "edit": "Доступно для редактирования",
      "editTip": "Отметьте, если поле присутствует в атрибутивной форме",
      "fieldName": "Имя",
      "fieldNameTip": "Имя поля, определенное базой данных",
      "fieldAlias": "Псевдоним",
      "fieldAliasTip": "Имя поля, определенное картой",
      "canPresetValue": "Предустановленное",
      "canPresetValueTip": "Опция отображения поля в списке заранее заданных полей, позволяющая пользователю задать значение до редактирования",
      "actions": "Действия",
      "actionsTip": "Изменить порядок полей или настроить Умные атрибуты"
    },
    "smartAttSupport": "Умные атрибуты не поддерживаются для обязательных полей базы данных"
  },
  "actionPage": {
    "title": "Настроить действия Умных атрибутов для <b>${fieldname}</b>",
    "description": "Действия всегда отключены, пока вы не зададите критерии, включающие их. Действия выполняются в заданном порядке и только одно действие может быть запущено для поля. Используйте кнопку Редактировать критерии, чтобы задать их.",
    "actionsSettingsTable": {
      "rule": "Действие",
      "ruleTip": "Действия, выполняемые при совпадении критериев",
      "expression": "Выражение",
      "expressionTip": "Итоговое выражение в формате SQL, полученное по заданным критериям",
      "actions": "Критерии",
      "actionsTip": "Изменение порядка следования правила и задание условий запуска критерия"
    },
    "actions": {
      "hide": "Скрыть",
      "required": "Необходимо",
      "disabled": "Отключено"
    }
  },
  "filterPage": {
    "submitHidden": "Отправить атрибутивные данные в это поле, даже если оно скрыто?",
    "title": "Настройка выражения для правила ${action}",
    "filterBuilder": "Задать действие с полем, когда запись соответствует ${any_or_all} из следующих выражений",
    "noFilterTip": "Используя указанные ниже инструменты, задайте выражение для выполняющегося действия."
  }
});