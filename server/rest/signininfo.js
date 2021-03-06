function _getSignInInfos() {
    var r = [];
    try {
        return fs.existsSync(filePath) && (r = fse.readJsonSync(filePath), r || (r = [])), r
    } catch (e) {
        return logger.error(e), []
    }
}

function _setSignInInfos(r) {
    fse.writeJsonSync(filePath, r)
}

function _getInfoByPortalUrl(r, e) {
    for (var t = 0; t < r.length; t++)if (portalUrlUtils.isSamePortalUrl(r[t].portalUrl, e))return r[t];
    return null
}

function _setInfoByPortalUrl(r, e, t) {
    for (var n = 0; n < r.length; n++)portalUrlUtils.isSamePortalUrl(r[n].portalUrl, e) && (r[n].portalUrl = e, t.appId && (r[n].appId = t.appId), t.itemId && (r[n].itemId = t.itemId), "boolean" == typeof t.isWebTier && (r[n].isWebTier = t.isWebTier), "boolean" == typeof t.supportsOAuth && (r[n].supportsOAuth = t.supportsOAuth))
}

var path = require("path"), fs = require("fs"), path = require("path"), fse = require("fs-extra"), logger = require("log4js").getLogger("signininfo"), requirejs = require("requirejs"), portalUrlUtils = requirejs("jimu/shared/basePortalUrlUtils"), filePath = path.join(__dirname, "../signininfo.json");

exports.getSignInInfos = function (r, e) {
    var t = _getSignInInfos();
    e.send({success: !0, infos: t})
},

    exports.getSignInInfoByPortalUrlApi = function (r) {
        var e = _getSignInInfos(), t = _getInfoByPortalUrl(e, r);
        return t
    },

    exports.getSignInInfoByPortalUrl = function (r, e) {
        var t = {success: !0}, n = r.param("portalUrl"), s = _getSignInInfos(), o = _getInfoByPortalUrl(s, n);
        t.info = o, e.send(t)
    },

    exports.setSigninInfo = function (r, e) {
        var t = _getSignInInfos(), n = r.param("portalUrl"), s = r.param("appId"), o = !1, i = !1, a = "undefined" != typeof r.param("isWebTier"), l = "undefined" != typeof r.param("supportsOAuth");
        a && (o = JSON.parse(r.param("isWebTier"))), l && (i = JSON.parse(r.param("supportsOAuth")));
        var p = _getInfoByPortalUrl(t, n);
        if (null === p)t.push({portalUrl: n, appId: s, supportsOAuth: i, isWebTier: o}); else {
            var f = {appId: s};
            a && (f.isWebTier = o), l && (f.supportsOAuth = i), _setInfoByPortalUrl(t, n, f)
        }
        try {
            _setSignInInfos(t), e.send({success: !0})
        } catch (u) {
            logger.error(u), e.send({success: !1})
        }
    };