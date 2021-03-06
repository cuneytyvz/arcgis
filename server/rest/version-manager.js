function upgradeAppConfig(e, s, r) {
    var n = {messages: [], success: !0}, i = "HTML3D" === r ? stemapp3dVersion : stemapp2dVersion, a = "HTML3D" === r ? path.join(basePath, "../client/stemapp3d") : path.join(basePath, "../client/stemapp"), t = "HTML3D" === r ? appVersionManager3D : appVersionManager;
    try {
        return compareVersion(e.wabVersion, i.wabVersion, t) < 0 && (e = t.upgrade(e, e.wabVersion, i.wabVersion), e.wabVersion = i.wabVersion), n.appConfig = e, e.theme.version = i.themes[e.theme.name], sharedUtils.visitElement(e, function (r, t) {
            if (!r.widgets && r.uri) {
                var o = sharedUtils.getWidgetNameFromUri(r.uri);
                t.isThemeWidget && (o = e.theme.name + "." + o);
                var g = r.version;
                r.version = i.widgets[o];
                var p = sharedUtils.getAmdFolderFromUri(r.uri);
                if (!fs.existsSync(path.join(a, p, "VersionManager.js")))return void n.messages.push("Widget does not have VersionManager, do not upgrade config." + o);
                var d = requirejs(p + "VersionManager"), m = new d;
                if (compareVersion(g, i.widgets[o], m) < 0) {
                    if (!r.config)return;
                    var h;
                    h = "string" == typeof r.config && fs.existsSync(path.join(s, r.config)) ? fse.readJsonSync(path.join(s, r.config)) : r.config;
                    try {
                        r.config = m.upgrade(h, g, i.widgets[o]), logger.info("upgrade widget config.", o), n.messages.push("Upgrade widget config." + o)
                    } catch (c) {
                        r.version = g, r.config = h, logger.error("Upgrade widget config failed.", o, c), n.messages.push("Upgrade widget config failed." + o), n.success = !1
                    }
                } else compareVersion(g, i.widgets[o], m) > 0 && (console.log("widget", o, "version", r.version, "is newer"), n.messages.push("Widget version is newer, error." + o + ",version:" + r.version), n.success = !1)
            }
        }), n.appConfig = e, n
    } catch (o) {
        return n.success = !1, n.messages.push(o.messages), console.log(o.stack), n
    }
}

function getAppVersionInfo(e, s) {
    var r = "HTML3D" === s ? stemapp3dVersion : stemapp2dVersion, n = "HTML3D" === s ? path.join(basePath, "../client/stemapp3d") : path.join(basePath, "../client/stemapp"), i = "HTML3D" === s ? appVersionManager3D : appVersionManager, a = {appVersion: e.wabVersion, latestVersion: r.wabVersion, wabVersionStatus: null, newWidgets: [], newVersionWidgets: [], oldVersionWidgets: [], themeStatus: null, success: !0, message: null};
    try {
        if (a.wabVersionStatus = i.getVersionIndex(e.wabVersion) < i.getVersionIndex(r.wabVersion) ? "old" : i.getVersionIndex(e.wabVersion) > i.getVersionIndex(r.wabVersion) ? "new" : "same", r.themes[e.theme.name]) {
            var t = compareVersion(e.theme.version, r.themes[e.theme.name]);
            0 > t ? a.themeStatus = "oldVersion" : t > 0 && (a.themeStatus = "newVersion")
        } else a.themeStatus = "newTheme";
        return sharedUtils.visitElement(e, function (e, s) {
            if (!e.widgets && e.uri && !s.isThemeWidget) {
                var i = sharedUtils.getWidgetNameFromUri(e.uri);
                if (!r.widgets[i]) {
                    if ("Geocoder" === i || "Viz" === i || "Environment" === i)return;
                    return void a.newWidgets.push({name: i, version: e.version})
                }
                var t, o = e.version, g = r.widgets[i], p = sharedUtils.getAmdFolderFromUri(e.uri);
                if (!fs.existsSync(path.join(n, p, "VersionManager.js")))return t = compareVersion(o, g), void(0 > t ? a.oldVersionWidgets.push({name: i, version: o}) : t > 0 && a.newVersionWidgets.push({name: i, version: o}));
                var d = requirejs(p + "VersionManager"), m = new d;
                t = compareVersion(o, g, m), 0 > t ? a.oldVersionWidgets.push({name: i, version: o}) : t > 0 && a.newVersionWidgets.push({name: i, version: o})
            }
        }), a
    } catch (o) {
        return a.success = !1, a.message = o.message, console.log(o.stack), a
    }
}

function getStemappVersionInfo(e) {
    if ("HTML3D" === e && stemapp3dVersion)return stemapp3dVersion;
    if ("HTML" === e && stemapp3dVersion)return stemapp2dVersion;
    var s = {}, r = "HTML3D" === e ? path.join(basePath, "../client/stemapp3d") : path.join(basePath, "../client/stemapp"), n = fse.readJsonSync(path.join(r, "config.json"));
    return s.wabVersion = n.wabVersion, s.widgets = {}, fs.readdirSync(path.join(r, "widgets")).forEach(function (e) {
        var n = path.join(r, "widgets", e, "manifest.json");
        if (fs.existsSync(n))try {
            var i = fse.readJsonSync(n);
            s.widgets[e] = i.version
        } catch (a) {
            logger.error("wrong manifest.json, widget name:" + e), s.widgets[e] = "NaN"
        }
    }), s.themes = {}, fs.readdirSync(path.join(r, "themes")).forEach(function (e) {
        var n = path.join(r, "themes", e, "manifest.json");
        if (fs.existsSync(n))try {
            var i = fse.readJsonSync(n);
            s.themes[e] = i.version
        } catch (a) {
            logger.error("wrong manifest.json, theme name:" + e), s.themes[e] = "NaN"
        }
        fs.existsSync(path.join(r, "themes", e, "widgets")) && fs.readdirSync(path.join(r, "themes", e, "widgets")).forEach(function (n) {
            var i = path.join(r, "themes", e, "widgets", n, "manifest.json");
            if (fs.existsSync(i))try {
                var a = fse.readJsonSync(i);
                s.widgets[e + "." + n] = a.version
            } catch (t) {
                logger.error("wrong manifest.json, widget name:" + e + "." + n), s.widgets[e + "." + n] = "NaN"
            }
        })
    }), stemappVersion = s, s
}

function compareVersion(e, s, r) {
    return e === s ? 0 : r ? r.getVersionIndex(e) - r.getVersionIndex(s) : compareVersionByFormat(e, s)
}

function compareVersionByFormat(e, s) {
    if (!e)return-1;
    var r = e.split("."), n = s.split("."), i = 0;
    if (r.length !== n.length) {
        var a = Math.abs(r.length - n.length), t = [];
        for (i = 0; a > i; i++)t.push("0");
        r.length < n.length ? r = r.concat(t) : n = n.concat(t)
    }
    for (i = 0; i < r.length; i++) {
        if (isNaN(parseInt(r[i], 10)) || isNaN(parseInt(n[i], 10)))throw Error("Version is not number.");
        if (r[i] !== n[i])return r[i] - n[i]
    }
    return 0
}

var path = require("path"), fs = require("fs"), fse = require("fs-extra"), requirejs = require("requirejs"), sharedUtils = requirejs("jimu/shared/utils"), log4js = require("log4js"), logger = log4js.getLogger("version-manager"), basePath = path.join(__dirname, "..");
exports.getStemappVersionInfo = getStemappVersionInfo,

    exports.getAppVersionInfo = getAppVersionInfo,

    exports.upgradeAppConfig = upgradeAppConfig;

var AppVersionManager = requirejs("jimu/shared/AppVersionManager"),
    appVersionManager = new AppVersionManager,
    AppVersionManager3D = requirejs("jimu3d/shared/AppVersionManager"),
    appVersionManager3D = new AppVersionManager3D,
    stemapp2dVersion = getStemappVersionInfo("HTML"),
    stemapp3dVersion = getStemappVersionInfo("HTML3D");