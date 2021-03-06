var repoRest = require("./repo"), dbutils = require("../dbutils");

exports.getThemeByUid = function (e) {
    return repoRest.getItemByUid(e)
},

    exports.searchThemes = function (e, s) {
        var t = JSON.parse(e.query.q);
        t.category = "theme", dbutils.find("repoitems", t, {sort: "name"}).then(function (e) {
            s.send({success: !0, themes: e})
        }, function () {
            s.send({success: !1, message: "Unknow error"})
        })
    },

    exports.getAllThemes = function (e, s) {
        repoRest.getItemsByCategory("theme").then(function (e) {
            s.send({success: !0, themes: e})
        }, function () {
            s.send({success: !1, message: "Unknow error"})
        })
    },

    exports.getThemesByName = function (e) {
        return repoRest.getItemsByName(e)
    };