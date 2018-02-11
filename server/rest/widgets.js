var repoRest = require("./repo"), dbutils = require("../dbutils");

exports.getWidgetByUid = function (e) {
    return repoRest.getItemByUid(e)
},

    exports.searchWidgets = function (e, t) {
        var s = JSON.parse(e.query.q);
        s.category = "widget", dbutils.find("repoitems", s, {sort: "name"}).then(function (e) {
            t.send({success: !0, widgets: e})
        }, function () {
            t.send({success: !1, message: "Unknow error"})
        })

    },

    exports.getAllWidgets = function (e, t) {
        repoRest.getItemsByCategory("widget").then(function (e) {
            t.send({success: !0, themes: e})
        }, function () {
            t.send({success: !1, message: "Unknow error"})
        })

    },

    exports.getWidgetsByName = function (e) {
        return repoRest.getItemsByName(e)
    };