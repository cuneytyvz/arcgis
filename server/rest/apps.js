function createApp(e) {
    return findApps({name: e.name, creator: e.creator, portalUrl: e.portalUrl}).then(function (t) {
        return t.length > 0 ? Promise.reject({message: "An app &nbsp;'" + e.name + "'&nbsp; exists already. Please choose another name."}) : findAppById(e.fromAppId).then(function (t) {
            return e.appConfig = fse.readJsonSync(path.join(getAppPath(e.fromAppId), "config.json")), e.appType = t.appType, e.stemappPath = t.stemappPath, e.stemappUrl = t.stemappUrl, e.appConfig.isTemplateApp = t.isPredefined && e.fromAppId === t.appType + "-default" ? !1 : !0, insertAndCopyApp(e, t).then(function (n) {
                e.appConfig = addExtraPropertyOfAppConfig(e.appConfig, JSON.parse(e.extraPropertyOfAppConfig), t);
                var i = n[0].id;
                if (t.isPredefined) {
                    var r = path.join(getAppPath(e.fromAppId), "configs");
                    fs.existsSync(r) && fs.readdirSync(r).forEach(function (e) {
                        utils.docopy(path.join(r, e), path.join(getAppPath(i), "configs", e))
                    })
                }
                var a;
                if (e.icon)try {
                    a = saveAppIcon(i, e.icon)
                } catch (o) {
                    return logger.error("Save icon failed." + o.message), Promise.reject({message: "Save icon failed."})
                }
                var p;
                if (e.thumbnail)try {
                    p = saveAppThumbnail(i, e.thumbnail)
                } catch (o) {
                    return logger.error("Save app thumbnail failed." + o.message), Promise.reject({message: "Save app thumbnail failed."})
                }
                return a || p ? dbutils.update("apps", {_id: i}, {$set: {icon: a ? a : null, thumbnail: p ? p : null}}).then(function () {
                    return saveAppConfig(i, e.appConfig, e.creator).then(function () {
                        return Promise.resolve(i)
                    })
                }) : saveAppConfig(i, e.appConfig, e.creator).then(function () {
                    return Promise.resolve(i)
                })
            })
        })
    })
}

function saveAppConfig(e, t, n) {
    var i = removeThemes(e, t), r = removeWidgets(e, t), a = copyThemeToApp(e, t.theme.name), o = copyWidgetsInConfigToApp(e, t), p = saveAppLogo(e, t), s = saveWidgetsIcon(e, t), d = saveWidgetsConfig(e, t), l = generateLoadingStyle(e, t);
    return Promise.all([i, r, a, o, p, s, d, l]).then(function () {
        return writeAppConfigFile(e, t)
    }).then(function () {
        return fs.existsSync(getZipFilePath(e)) && fs.unlinkSync(getZipFilePath(e)), dbutils.update("apps", {_id: e}, {$set: {lastUpdated: getCurrentTime(), modified: n, styleColor: getStyleColor(e, t), themeName: t.theme.name}})
    })
}

function getPredefinedApps() {
    var e = fse.readJsonSync(path.join(basePath, "client/builder/plugins/plugins.json"), "utf-8"), t = e.startup.extensionPoints.stemapps.extensions, n = [];
    return t.forEach(function (e) {
        var t = path.join(basePath, "client/builder/plugins", e.pluginName.replace(/\./g, "/"), e.parameters.appPath);
        predefinedAppsStrings[e.parameters.appType] = getPredefinedAppLocalizedStrings(t), n = n.concat(fs.readdirSync(path.join(t, "predefined-apps")).filter(function (e) {
            return"nls" !== e && !e.startWith(".") && fs.existsSync(path.join(t, "predefined-apps", e, "appinfo.json"))
        }).map(function (n) {
            var i = fse.readJsonSync(path.join(t, "predefined-apps", n, "appinfo.json"), "utf-8");
            return i.appType = e.parameters.appType, i._id = i.appType + "_" + n, i.id = i.appType + "_" + n, i.predefinedId = n, i.thumbnail = "images/thumbnail.jpg", i.stemappPath = path.join("client/builder/plugins", e.pluginName.replace(/\./g, "/"), e.parameters.appPath), i.stemappUrl = path.join("/webappbuilder/builder/plugins", e.pluginName.replace(/\./g, "/"), e.parameters.appPath).replace(/\\/g, "/"), i.isTemplate = "default" !== n, i.isPredefined = !0, i.portalUrl = "*", i.createdTime = Date.parse(i.createdTime), i.lastUpdated = Date.parse(i.lastUpdated), i.modified = i.creator, i
        }))
    }), n
}

function getPredefinedAppLocalizedStrings(e) {
    var t = requirejs(path.join(e, "predefined-apps/nls/strings.js")), n = {root: t.root};
    for (var i in t)if ("root" !== i && t[i])if (fs.existsSync(path.join(e, "predefined-apps/nls", i, "strings.js"))) {
        var r = requirejs(path.join(e, "predefined-apps/nls", i, "strings.js"));
        n[i] = r
    } else logger.error("Predefined app locale is enabled but the file is not exists.", i);
    return n
}

function getDefaultAppInfo(e) {
    return predefinedApps.filter(function (t) {
        return t.appType === e && t.id === e + "_default"
    })[0]
}

function saveAppThumbnail(e, t) {
    var n;
    return utils.isBase64Code(t) && (n = path.join(getAppPath(e), "images/thumbnail."), n = utils.saveBase64ToImgSync(n, t), n = n.substr(getAppPath(e).length), n = n.replace("\\", "/")), n
}

function saveAppIcon(e, t) {
    var n;
    return utils.isBase64Code(t) && (n = path.join(getAppPath(e), "images/icon."), n = utils.saveBase64ToImgSync(n, t), n = n.substr(getAppPath(e).length), n = n.replace("\\", "/")), n
}

function getAppListByFolder(e, t) {
    if (!checkBuilderPath(e))return Promise.reject({message: "Invalid Path."});
    var n = dbEngine.getDB(path.join(e, "server")), i = {};
    return t && (i._id = t), dbutils.find("apps", i, {sort: [
        ["_id", "asc"]
    ]}, n).then(function (e) {
        return Promise.resolve(e)
    }, function (e) {
        return Promise.reject(e)
    })
}

function importApp(e) {
    var t;
    t = e.appConfig ? e.appConfig : fse.readJsonSync(path.join(e.appPath, "config.json"), "utf-8");
    var n = getDefaultAppInfo(e.appType);
    e.stemappPath = n.stemappPath, e.stemappUrl = n.stemappUrl, delete t._buildInfo;
    var i = portalUrlUtils.removeProtocol(portalUrlUtils.getStandardPortalUrl(t.portalUrl));
    t.wabVersion || logger.warn("App has no version, the upgrading may fail. Name:[" + e.name + "]");
    var r = versionManager.getAppVersionInfo(t, e.appType);
    if (!r.success)return Promise.reject({message: "Fail to import. Name:[" + e.name + "]," + r.message});
    if ("new" === r.wabVersionStatus)return Promise.reject({message: "Fail to import. App version is newer. Name:[" + e.name + "]"});
    if ("newVersion" === r.themeStatus)return Promise.reject({message: "Fail to import. The theme used by the app is in a newer version. Name:[" + e.name + "]"});
    if (r.newVersionWidgets.length > 0)return Promise.reject({message: "Fail to import. Some widgets used in the app are newer version. App name:[" + e.name + "], widget: " + r.newVersionWidgets.map(function (e) {
        return e.name + "," + e.version
    }).join("\n")});
    var a = versionManager.upgradeAppConfig(t, e.appPath, e.appType);
    return a.success ? ("newTheme" === r.themeStatus && (logger.info("Find new theme:" + t.theme.name), utils.docopy(path.join(e.appPath, "themes", t.theme.name), path.join(basePath, e.stemappPath, "themes", t.theme.name)), upgradeCustomTheme(path.join(basePath, e.stemappPath, "themes", t.theme.name), t.theme.name)), r.newWidgets.forEach(function (t) {
        logger.info("Find new widget:" + t.name), utils.docopy(path.join(e.appPath, "widgets", t.name), path.join(basePath, e.stemappPath, "widgets", t.name)), upgradeCustomWidget(path.join(basePath, e.stemappPath, "widgets", t.name), t.name)
    }), getUniqueAppName(e.name, e.creator, i).then(function (n) {
        return e.name = n, e.lastUpdated = getCurrentTime(), e.modified = getCurrentTime(), e.portalUrl = i, e.appConfig = t, insertAndCopyApp(e).then(function (n) {
            return 1 !== n.length ? Promise.reject({message: "App importing fails. Name:[" + e.name + "]."}) : (e.appPath && fs.existsSync(path.join(e.appPath, "configs")) && utils.docopy(path.join(e.appPath, "configs"), path.join(getAppPath(n[0].id), "configs")), e.appPath && t.logo && utils.docopy(path.join(e.appPath, t.logo), path.join(getAppPath(n[0].id), t.logo), !0), e.appPath && e.icon && utils.docopy(path.join(e.appPath, e.icon), path.join(getAppPath(n[0].id), e.icon), !0), e.appPath && e.thumbnail && utils.docopy(path.join(e.appPath, e.thumbnail), path.join(getAppPath(n[0].id), e.thumbnail), !0), logger.info("App is imported. Name:[" + e.name + "]. New app [name is:" + n[0].name + ", id is:" + n[0].id + "]"), n)
        })
    })) : (writeUpgradeLog(a.messages), Promise.reject({message: "Upgrade is failed. Name:[" + e.name + "]"}))
}

function upgradeCustomTheme(e) {
    var t = fse.readJsonSync(path.join(e, "manifest.json"), "utf-8");
    t.platform || (t.platform = "HTML"), fse.writeJsonSync(path.join(e, "manifest.json"), t, "utf-8")
}

function upgradeCustomWidget(e, t) {
    var n = fse.readJsonSync(path.join(e, "manifest.json"), "utf-8");
    n.properties && "undefined" != typeof n.properties.keepConfigAfterMapSwithched && (logger.info("Widget manifest property rename: keepConfigAfterMapSwithched -> keepConfigAfterMapSwitched.", t), n.properties.keepConfigAfterMapSwitched = n.properties.keepConfigAfterMapSwithched), fse.writeJsonSync(path.join(e, "manifest.json"), n, "utf-8")
}

function insertAndCopyApp(e, t) {
    return insertToDB(e).then(function (n) {
        var i = n[0].id;
        return fs.existsSync(getAppPath(i)) ? Promise.reject({message: "The app folder already exists, this may be an internal error, please use a new app name and try again."}) : !t || t.isPredefined ? copyFromStemApp(e, i).then(function () {
            return Promise.resolve(n)
        }, function (e) {
            return logger.error("Copy app error:", "toApp:", n[0].id, e), deleteFromDB(n[0].id)
        }) : (utils.docopy(getAppPath(e.fromAppId), getAppPath(i)), Promise.resolve(n))
    })
}

function addExtraPropertyOfAppConfig(e, t, n) {
    e.title = t.title, e.isWebTier = t.isWebTier, e.portalUrl = t.portalUrl, n.isTemplate || (e.map.itemId = t.map.itemId, t.map.mapOptions.extent && (e.map.mapOptions || (e.map.mapOptions = {}), e.map.mapOptions.extent = t.map.mapOptions.extent)), e.geometryService = t.geometryService, e.httpProxy = t.httpProxy;
    var i = t.authorizedCrossOriginDomains || [];
    if (e.authorizedCrossOriginDomains = "[object Array]" === Object.prototype.toString.call(e.authorizedCrossOriginDomains) ? e.authorizedCrossOriginDomains.concat(i) : i, e.theme.sharedTheme = t.theme.sharedTheme, e.theme.sharedTheme.useHeader) {
        var r = e.theme.styles.pop();
        e.theme.styles.unshift(r)
    }
    return e
}

function copyFromStemApp(e, t) {
    var n = getAppPath(t), i = path.join(basePath, e.stemappPath), r = [];
    fse.mkdirsSync(path.join(n, "themes")), fse.mkdirsSync(path.join(n, "widgets"));
    try {
        var a = getCopyFiles(i);
        a.forEach(function (e) {
            ["widgets", "themes", "config.json"].indexOf(e) > -1 || utils.docopy(path.join(i, e), path.join(n, e), !0)
        }), fse.writeJsonSync(path.join(n, "config.json"), e.appConfig, "utf-8"), r.push(copyThemeToApp(t, e.appConfig.theme.name))
    } catch (o) {
        return Promise.reject(o)
    }
    return sharedUtils.visitElement(e.appConfig, function (e, n) {
        e.widgets || !e.uri || n.isThemeWidget || r.push(copyWidgetToApp(t, getWidgetNameFromUri(e.uri)))
    }), Promise.all(r)
}

function getCopyFiles(e) {
    var t, n = [];
    if (!fs.existsSync(path.join(e, "copy-list.txt")))return console.error("Can not find copy-list.txt."), n;
    var i = fs.readFileSync(path.join(e, "copy-list.txt"), "utf-8");
    return t = i.indexOf("\r\n") > -1 ? "\r\n" : "\n", n = i.split(t)
}

function deleteAppFiles(e, t) {
    var n = 3;
    void 0 === t && (t = 0);
    try {
        fse.removeSync(getAppPath(e)), fse.removeSync(getZipFilePath(e))
    } catch (i) {
        if (t >= n)throw Error("Remove app files failed. id:" + e);
        logger.error("Remove app files failed. id:", e, "try again"), setTimeout(function () {
            t++, deleteAppFiles(e, t)
        }, 500)
    }
}

function findApps(e, t) {
    return e || (e = {}), t || (t = [
        ["lastUpdated", "desc"]
    ]), dbutils.find("apps", e, {sort: t})
}

function findAppById(e) {
    return findApps({_id: e}).then(function (e) {
        return 0 === e.length ? null : e[0]
    })
}

function insertToDB(e) {
    var t = {}, n = portalUrlUtils.getStandardPortalUrl(e.portalUrl), i = ++maxAppId;
    return t = {_id: i, id: i, name: e.name, description: e.description, lastUpdated: e.lastUpdated, createdTime: getCurrentTime(), appType: e.appType, stemappPath: e.stemappPath, stemappUrl: e.stemappUrl, creator: e.creator, modified: e.modified, portalUrl: portalUrlUtils.removeProtocol(n), isTemplateApp: e.appConfig.isTemplateApp, isTemplate: e.isTemplate, isPredefined: e.isPredefined, styleColor: e.styleColor, themeName: e.themeName, icon: e.icon, thumbnail: e.thumbnail}, dbutils.insert("apps", t)
}

function deleteFromDB(e) {
    return dbutils.remove("apps", {_id: e})
}

function getCurrentTime() {
    var e = new Date;
    return e.valueOf()
}

function copyWidgetsInConfigToApp(e, t) {
    var n = [];
    return sharedUtils.visitElement(t, function (t, i) {
        if (!t.widgets && t.uri && !i.isThemeWidget && !/^http(s)?:\/\//.test(t.uri) && !/^\/\//.test(t.uri)) {
            var r = t.uri.split("/");
            r.pop();
            var a = r.pop();
            n.push(copyWidgetToApp(e, a))
        }
    }), Promise.all(n)
}

function copyWidgetToApp(e, t) {
    var n = getAppPath(e), i = path.join(n, "widgets", t);
    return fs.existsSync(i) ? Promise.resolve() : findAppById(e).then(function (e) {
        try {
            return utils.docopy(path.join(basePath, e.stemappPath, "widgets", t), i), Promise.resolve()
        } catch (n) {
            return Promise.reject(n)
        }
    })
}

function copyThemeToApp(e, t) {
    var n = getAppPath(e), i = path.join(n, "themes/", t);
    return fs.existsSync(i) ? Promise.resolve() : findAppById(e).then(function (e) {
        try {
            return utils.docopy(path.join(basePath, e.stemappPath, "themes", t), i), Promise.resolve()
        } catch (n) {
            return Promise.reject(n)
        }
    })
}

function removeThemes(e, t) {
    var n = getAppPath(e);
    try {
        var i = fs.readdirSync(n + "themes/");
        i.forEach(function (i) {
            i !== t.theme.name && fs.existsSync(n + "themes/" + i) && (fse.removeSync(n + "themes/" + i), logger.info("remove theme", i, "from app", e))
        })
    } catch (r) {
        return Promise.reject(r)
    }
    return Promise.resolve()
}

function removeWidgets(e, t) {
    var n = getAppPath(e);
    try {
        var i = fs.readdirSync(n + "widgets");
        i.forEach(function (i) {
            var r = !1;
            sharedUtils.visitElement(t, function (e) {
                return!e.widgets && e.uri && e.uri.indexOf(i) > -1 ? (r = !0, !0) : void 0
            }), r ? (removeWidgetIcons(n, i, t), removeWidgetConfigs(n, i, t)) : (fse.removeSync(n + "widgets/" + i), removeWidgetFolderFromConfigsFolder(n + getConfigsDir(i)), logger.info("remove widget", i, "from app", e))
        })
    } catch (r) {
        return Promise.reject(r)
    }
    return Promise.resolve()
}

function removeWidgetIcons(e, t, n) {
    var i = getConfigsDir(t), r = path.join(e, i);
    fs.existsSync(r) && fs.readdirSync(r).forEach(function (t) {
        if (t.startWith("icon_")) {
            var i = t.lastIndexOf("."), a = t.substring(5, i), o = !1;
            sharedUtils.visitElement(n, function (e) {
                return!e.widgets && e.uri && e.id === a ? (o = !0, !0) : void 0
            }), o || (fse.removeSync(path.join(r, t)), logger.info("remove widget icon", t, "from app configs folder", e))
        }
    })
}

function removeWidgetConfigs(e, t, n) {
    var i = getConfigsDir(t), r = path.join(e, i);
    fs.existsSync(r) && fs.readdirSync(r).forEach(function (t) {
        if (t.startWith("config_")) {
            var i = t.substring(7, t.length - 5), a = !1;
            sharedUtils.visitElement(n, function (e) {
                return!e.widgets && e.uri && e.id === i ? (a = !0, !0) : void 0
            }), a || (fse.removeSync(path.join(r, t)), logger.info("remove widget config", t, "from app configs folder", e))
        }
    })
}

function saveAppLogo(e, t) {
    var n = getAppPath(e);
    if (!t.logo || !t.logo.startWith("data:"))return Promise.resolve();
    try {
        var i = utils.saveBase64ToImgSync(path.join(n, "images/logo.png"), t.logo);
        return t.logo = i.substr(path.join(n).length).replace(/\\/g, "/"), Promise.resolve()
    } catch (r) {
        return Promise.reject(r)
    }
}

function saveWidgetsIcon(e, t) {
    var n = getAppPath(e);
    try {
        sharedUtils.visitElement(t, function (e) {
            if (e.uri && !/^http(s)?:\/\//.test(e.uri) && !/^\/\//.test(e.uri)) {
                var t, i = getWidgetNameFromUri(e.uri), r = getConfigsDir(i), a = null;
                if (e.icon && e.icon.startWith("data:")) {
                    a = e.icon, t = "icon_" + e.id + ".png";
                    var o = saveWidgetImageToConfigsFolder(path.join(n, r), t, a);
                    e.icon = o.substr(path.join(n).length)
                }
            }
        })
    } catch (i) {
        return Promise.reject(i)
    }
    return Promise.resolve()
}

function saveWidgetsConfig(e, t) {
    var n = getAppPath(e);
    try {
        sharedUtils.visitElement(t, function (e) {
            if (e.uri && !/^http(s)?:\/\//.test(e.uri) && !/^\/\//.test(e.uri)) {
                var t, i = getConfigsDir(e.name), r = path.join(n, i), a = null;
                e.config && "object" == typeof e.config && (t = "config_" + e.id + ".json", a = e.config, e.config = i + t, processWidgetConfig(n, i, a), saveWidgetConfigToConfigsFolder(r, t, a))
            }
        })
    } catch (i) {
        return Promise.reject(i)
    }
    return Promise.resolve()
}

function generateLoadingStyle(e, t) {
    var n, i = getAppPath(e), r = "";
    return t.loadingPage && (t.loadingPage.backgroundColor && (n = "#main-loading{\n	background-color:" + t.loadingPage.backgroundColor + ";\n	position:relative;\n}\n", r += n), r += generateBackgroundImageStyle(e, t), r += generateLoadingGifStyle(e, t)), fse.outputFileSync(path.join(i, "configs/loading/loading.css"), r), Promise.resolve()
}

function generateBackgroundImageStyle(e, t) {
    var n, i, r, a = getAppPath(e), o = t.loadingPage, p = "#main-loading #app-loading{\n	position: absolute;\n	background-repeat: no-repeat;\n	top: 50%;\n	left: 50%;\n	transform: translate(-50%, -50%);\n}\n";
    return o.backgroundImage && o.backgroundImage.uri && (r = /^data:image\/.*;base64,/.test(o.backgroundImage.uri), r ? (n = path.join(a, "configs/loading/images/background.png"), n = utils.saveBase64ToImgSync(n, o.backgroundImage.uri), n = n.replace(/\\/g, "/"), i = n.match(/images\/.+/), o.backgroundImage.uri = "configs/loading/" + i) : i = o.backgroundImage.uri.match(/images\/.+/), o.backgroundImage.visible && (p = "#main-loading #app-loading{\n	position: absolute;\n	background-image: url('" + i + "');\n	background-repeat: no-repeat;\n	width:" + o.backgroundImage.width + "px;\n	height:" + o.backgroundImage.height + "px;\n	top: 50%;\n	left: 50%;\n	transform: translate(-50%, -50%);\n}\n")), p
}

function generateLoadingGifStyle(e, t) {
    var n, i, r, a = getAppPath(e), o = "#main-loading #loading-gif{\n	position: absolute;\n	background-repeat: no-repeat;\n	top: 50%;\n	left: 50%;\n	transform: translate(-50%, -50%);\n}\n", p = t.loadingPage;
    return p.loadingGif && p.loadingGif.uri && (r = /^data:image\/.*;base64,/.test(p.loadingGif.uri), r ? (n = path.join(a, "configs/loading/images/loading.gif"), n = utils.saveBase64ToImgSync(n, p.loadingGif.uri), n = n.replace(/\\/g, "/"), i = n.match(/images\/.+/), p.loadingGif.uri = "configs/loading/" + i) : i = p.loadingGif.uri.match(/images\/.+/), p.loadingGif.visible && (o = "#main-loading #loading-gif{\n	position: absolute;\n	background-image: url('" + i + "');\n	background-repeat: no-repeat;\n	width:" + p.loadingGif.width + "px;\n	height:" + p.loadingGif.height + "px;\n	top: 50%;\n	left: 50%;\n	transform: translate(-50%, -50%);\n}\n")), o
}

function processWidgetConfig(e, t, n) {
    utils.visitObject(n, function (n, i) {
        /^data:image\/.*;base64,/.test(n[i]) && saveBase64ImageToConfigsFolderAndChangeAppConfig(e, t, n, i)
    })
}

function saveBase64ImageToConfigsFolderAndChangeAppConfig(e, t, n, i) {
    var r = path.join(e, t);
    if (fs.existsSync(r) || fse.mkdirsSync(r), !/^data:image\/(png|jpeg|bmp|gif);base64,/.test(n[i]))throw Error("wrong image format.");
    var a = (utils.findMaxFileIndexInFolder(r, i), i + (new Date).getTime() + ".png"), o = utils.saveBase64ToImgSync(path.join(r, a), n[i]);
    n[i] = "${appPath}/" + path.join(t, o.substr(path.join(r).length)), n[i] = n[i].replace(/\\/g, "/")
}

function writeAppConfigFile(e, t) {
    var n = getAppPath(e);
    try {
        return fse.writeJsonSync(n + "config.json", t, "utf-8"), Promise.resolve()
    } catch (i) {
        return Promise.reject(i)
    }
}
function getAppPath(e) {
    var t = predefinedApps.filter(function (t) {
        return t.id === e ? !0 : void 0
    });
    return t.length > 0 ? path.join(basePath, t[0].stemappPath, "predefined-apps", t[0].id.substr(t[0].appType.length + 1)) : path.join(basePath, "server/apps/", e + "", "/")
}

function getAppUrl(e) {
    return e.isPredefined ? e.stemappUrl + "/predefined-apps/" + e.id.substr((e.appType + "_").length) + "/" : "/webappbuilder/apps/" + e.id + "/"
}

function getZipFilePath(e) {
    return"./apps/zips/" + e + ".zip"
}

function getAGOLZipFilePath(e) {
    return"./apps/zips/" + e + "AGOLTemplate.zip"
}

function getWidgetNameFromUri(e) {
    var t = e.split("/");
    return t.pop(), t.pop()
}

function getConfigsDir(e) {
    var t = "configs/" + e + "/";
    return t
}

function saveWidgetConfigToConfigsFolder(e, t, n) {
    fs.existsSync(e) || fse.mkdirsSync(e), fse.writeJsonSync(path.join(e, t), n, "utf-8")
}

function saveWidgetImageToConfigsFolder(e, t, n) {
    return fs.existsSync(e) || fse.mkdirsSync(e), utils.saveBase64ToImgSync(path.join(e, t), n)
}

function removeWidgetFolderFromConfigsFolder(e) {
    fs.existsSync(e) && fse.removeSync(e)
}

function zipApp(e, t) {
    var n = getAppPath(e);
    n = path.normalize(n);
    try {
        fs.existsSync("./apps/zips") || fs.mkdirSync("./apps/zips");
        var i = fse.readJsonSync(path.join(getAppPath(e), "config.json")), r = i.portalUrl;
        "/" !== r.substr(r.length - 1, r.length) && (r += "/");
        var a = new JSZip;
        utils.visitFolderFiles(n, function (e, t, i) {
            var r, o = e.substr(n.length, e.length);
            if (i)a.folder(o); else if ("env.js" === o)r = fs.readFileSync(e, {encoding: "utf-8"}), r = r.replace("//apiUrl = ", "apiUrl = "), a.file(o, r); else if ("config.json" === o) {
                var p = fse.readJsonSync(e);
                p.httpProxy = {useProxy: !0, alwaysUseProxy: !1, url: "", rules: []}, p.appId = "", a.file(o, JSON.stringify(p, null, 2))
            } else r = fs.readFileSync(e), a.file(o, r)
        });
        var o = "appinfo.json";
        findApps({_id: e}).then(function (n) {
            var i = n[0], r = {name: i.name, description: i.description, createdTime: i.createdTime, lastUpdated: i.lastUpdated, creator: i.creator, icon: i.icon, thumbnail: i.thumbnail};
            a.file(o, JSON.stringify(r, null, 2)), a.generateAsync({type: "nodebuffer", compression: "DEFLATE"}).then(function (n) {
                fs.writeFileSync(getZipFilePath(e), n, "binary"), t()
            })
        })
    } catch (p) {
        console.log(p), t(p)
    }
}

function zipAGOLApp(e, t, n) {
    try {
        var i = new JSZip;
        fs.existsSync("./apps/zips") || fs.mkdirSync("./apps/zips"), i.file(n + ".zip", fs.readFileSync(e)), i.file("AGOLTemplate.json", t), i.generateAsync({type: "nodebuffer", compression: "STORE"}).then(function (e) {
            fs.writeFileSync(path.normalize(getAGOLZipFilePath(n)), e, "binary")
        })
    } catch (r) {
        return console.log(r), !1
    }
    return!0
}

function findMaxNumFromSameNameApps(e) {
    var t, n, i, r, a = 0;
    for (t = 0; t < e.length; t++)r = e[t].name, n = r.search(/\_copy-/) + 6, i = Number(r.slice(n, r.length)), i > a && (a = i);
    return a++, a
}

function getUniqueAppName(e, t, n) {
    var i, r, a;
    e = e.replace(/\//g, "-"), r = e.replace(/\_copy-[0-9]+/, "");
    var o = new RegExp("^" + r + "(_copy-[0-9])*");
    return findApps({name: o, creator: t, portalUrl: n}, [
        ["name", "desc"]
    ]).then(function (t) {
        return 0 === t.length ? a = e : (i = findMaxNumFromSameNameApps(t), a = r + "_copy-" + i), Promise.resolve(a)
    })
}

function checkBuilderPath(e) {
    return fs.existsSync(path.join(e, "server")) ? !0 : !1
}

function writeUpgradeLog(e) {
    logger.info(e)
}

function sendUploadResponse(e, t, n) {
    if (t.indexOf("application/json") > -1)e.set("Content-Type", "application/json;charset=utf-8"), e.send(n); else {
        e.set("Content-Type", "text/html;charset=utf-8");
        var i = "<html><body><textarea>" + JSON.stringify(n) + "</textarea></body></html>";
        e.send(i)
    }
}

function getStyleColor(e, t) {
    var n = "", i = getAppPath(e), r = path.join(i, "themes", t.theme.name, "manifest.json"), a = fse.readJsonSync(r);
    return a.styles.forEach(function (e) {
        t.theme.styles && e.name === t.theme.styles[0] && (n = e.styleColor)
    }), n
}

var fs = require("fs"), path = require("path"), fse = require("fs-extra"), utils = require("../utils"), dbutils = require("../dbutils"), dbEngine = require("../db-engine"), JSZip = new require("jszip"), requirejs = require("requirejs"), sharedUtils = requirejs("jimu/shared/utils"), portalUrlUtils = requirejs("jimu/shared/basePortalUrlUtils"), versionManager = require("./version-manager"), Promise = require("bluebird"), log4js = require("log4js"), logger = log4js.getLogger("app"), basePath = path.join(__dirname, "../.."), maxAppId = 1, predefinedApps = [], predefinedAppsStrings = {};

exports.initPredefinedApps = function () {
    predefinedApps = getPredefinedApps(), dbutils.find("apps", {}, {sort: [
        ["_id", -1]
    ]}).then(function (e) {
        for (var t = 0; t < e.length; t++)if ("string" != typeof e[t]._id) {
            maxAppId = e[t]._id;
            break
        }
        e.length > 0 || dbutils.insert("apps", predefinedApps).then(function (e) {
            logger.info("Find", e.length, "predfinded apps.")
        })
    })
},

    exports.getAppList = function (e, t) {
        var n = portalUrlUtils.getStandardPortalUrl(e.query.portalUrl);
        findApps({creator: e.query.username, portalUrl: portalUrlUtils.removeProtocol(n), isTemplate: !1, isPredefined: !1}).then(function (e) {
            e.forEach(function (e) {
                e.icon && (e.icon = getAppUrl(e) + e.icon), e.thumbnail = e.thumbnail ? getAppUrl(e) + e.thumbnail : "HTML" === e.appType ? "/webappbuilder/builder/images/appthumbnail_2d.jpg" : "/webappbuilder/builder/images/appthumbnail_3d.jpg"
            }), t.send(e)
        }, function () {
            logger.error("getAppList failed!"), t.send({success: !1})
        })
    },

    exports.getApp = function (e, t) {
        var n = e.params.appId;
        findApps({_id: n}).then(function (e) {
            var n = e[0];
            n && (n.thumbnail = n.thumbnail ? getAppUrl(n) + n.thumbnail : "HTML" === n.appType ? "/webappbuilder/builder/images/appthumbnail_2d.jpg" : "/webappbuilder/builder/images/appthumbnail_3d.jpg"), t.send(n)
        }, function () {
            t.send({success: !1})
        })
    },

    exports.getTemplateList = function (e, t) {
        var n = portalUrlUtils.getStandardPortalUrl(e.query.portalUrl), i = portalUrlUtils.removeProtocol(n), r = e.query.locale, a = {portalUrl: i, isTemplate: !0};
        e.query.username && (a.creator = e.query.username), Promise.all([findApps({portalUrl: "*"}), findApps(a)]).then(function (e) {
            var n = e[0];
            n.forEach(function (e) {
                var t = r && r.split("-")[0], n = predefinedAppsStrings[e.appType], i = n[r] || n[t] || n.root;
                e.name = i[e.predefinedId] && i[e.predefinedId].name || n.root[e.predefinedId] && n.root[e.predefinedId].name, e.description = i[e.predefinedId] && i[e.predefinedId].description || n.root[e.predefinedId] && n.root[e.predefinedId].description
            });
            var i = [].concat(n, e[1]);
            i.forEach(function (e) {
                e.thumbnail = e.thumbnail ? getAppUrl(e) + e.thumbnail : "/webappbuilder/builder/images/templatethumbnail.jpg"
            }), t.send(i)
        }, function () {
            logger.error("getAppList failed!"), t.send({success: !1})
        })
    },

    exports.saveAppConfig = function (e, t) {
        var n = e.params.appId;
        return n ? void saveAppConfig(n, JSON.parse(e.body.appConfig), e.body.modified).then(function () {
            t.send({success: !0})
        }, function (e) {
            t.send({success: !1, message: e.message})
        }) : void t.send({success: !1, message: "No appId"})
    },

    exports.saveAs = function (e, t) {
        var n = JSON.parse(e.body.appConfig), i = portalUrlUtils.removeProtocol(e.body.portalUrl), r = {fromAppId: e.body.fromAppId, name: e.body.name, description: e.body.description, lastUpdated: getCurrentTime(), creator: e.body.creator, modified: e.body.creator, portalUrl: i, appConfig: n};
        findApps({name: r.name, creator: r.creator, portalUrl: r.portalUrl}).then(function (n) {
            return n.length > 0 ? void t.send({success: !1, message: "An app &nbsp;'" + r.name + "'&nbsp; exists already. Please choose another name."}) : void findAppById(r.fromAppId).then(function (n) {
                r.stemappPath = n.stemappPath, r.stemappUrl = n.stemappUrl, r.appType = n.appType, r.isPredefined = !1, r.isTemplate = JSON.parse(e.body.saveAsTemplate) ? !0 : n.isTemplate, r.styleColor = n.styleColor || "", r.themeName = n.themeName || "", insertAndCopyApp(r, n).then(function (i) {
                    function a() {
                        saveAppConfig(p, r.appConfig, r.creator).then(function () {
                            t.send({success: !0, newAppId: p})
                        }, function (e) {
                            t.send({success: !1, message: e.message})
                        })
                    }

                    var o, p = i[0].id;
                    if (e.body.thumbnail)try {
                        o = saveAppThumbnail(p, e.body.thumbnail)
                    } catch (s) {
                        return logger.error("Save thumbnail failed." + s.message), void t.send({success: !1})
                    }
                    o || !JSON.parse(e.body.saveAsTemplate) && n.thumbnail && (o = n.thumbnail), o ? dbutils.update("apps", {_id: p}, {$set: {thumbnail: o}}).then(function () {
                        a()
                    }) : a()
                })
            })
        })
    },

    exports.copyWidgetToApp = function (e, t) {
        var n = e.params.appId, i = e.body.widgetName;
        copyWidgetToApp(n, i).then(function () {
            t.send({success: !0})
        }, function (e) {
            t.send({success: !1, message: e})
        })
    },

    exports.copyThemeToApp = function (e, t) {
        var n = e.params.appId, i = e.body.themeName, r = JSON.parse(e.body.layoutConfig), a = [];
        a.push(copyThemeToApp(n, i)), r.theme = {name: i}, sharedUtils.visitElement(r, function (e, t) {
            if (!e.widgets && e.uri && !t.isThemeWidget) {
                var i = e.uri.split("/");
                i.pop();
                var r = i.pop();
                a.push(copyWidgetToApp(n, r))
            }
        }), Promise.all(a).then(function () {
            t.send({success: !0})
        }, function (e) {
            logger.error("Copy theme error,", e), t.send({success: !1, message: "Copy theme error."})
        })
    },

    exports.download = function (e, t) {
        var n = e.params.appId, i = getZipFilePath(n);
        t.set({"Cache-Control": "no-store,no-cache"}), findApps({_id: n}).then(function (e) {
            var r = e[0].name;
            fs.existsSync(i) && fse.removeSync(i), zipApp(n, function (e) {
                e ? t.send({success: !1}) : t.download(i, r + ".zip")
            })
        }, function () {
            t.send({success: !1})
        })
    },

    exports.checkAppVersion = function (e, t) {
        var n = JSON.parse(e.body.appConfig), i = e.body.appType, r = versionManager.getAppVersionInfo(n, i);
        t.send(r.success ? {success: !0, versionInfo: r} : {success: !1, message: r.message})
    },

    exports.importPortalApp = function (e, t) {
        var n = JSON.parse(e.body.appConfig);
        delete n._buildInfo, n.httpProxy && n.httpProxy.url && (n.httpProxy.url = "/proxy.js");
        var i = JSON.parse(e.body.appInfo);
        i.appConfig = n, importApp(i).then(function (e) {
            t.send({success: !0, appId: e[0].id})
        }, function (e) {
            logger.error("fail to import app.", e), t.send({success: !1, message: "Fail to import app." + e.message})
        })
    },

    exports.importFolderApps = function (e, t) {
        return getAppListByFolder(e, t).then(function (t) {
            t = t.filter(function (e) {
                return!e.isPredefined
            }), logger.info("Find", t.length, "apps.");
            var n = [];
            return t.forEach(function (t) {
                logger.info("Import app id:" + t.id + ", name:[" + t.name + "]......"), t.appConfig = fse.readJsonSync(path.join(e, "server/apps", t.id + "", "config.json")), t.appType || (t.appType = "HTML"), t.appPath = path.join(e, "server/apps", t.id + ""), t.isTemplate = t.appConfig.templateConfig && !t.appConfig.isTemplateApp ? !0 : !1, t.isTemplateApp = t.appConfig.isTemplateApp, t.isPredefined = !1, n.push(importApp(t))
            }), Promise.all(n).then(function () {
                return logger.info("Upgrade is done."), Promise.resolve()
            }, function (e) {
                logger.error(e)
            })
        }, function (e) {
            logger.error(e)
        })
    },

    exports.uploadZipApp = function (e, t) {
        if (!e.files || !e.files[0] || "app" !== e.files[0].fieldname)return void t.send(400);
        var n = e.files[0], i = e.get("Accept"), r = n.originalname.replace(/\.zip/, ""), a = {}, o = n.path, p = o.replace(/\.zip/, "");
        utils.verifyUploadedAppZip(o).then(function () {
            return Promise.resolve()
        }).catch(function (e) {
            return logger.error(e), sendUploadResponse(t, i, {success: !1, message: "Invalid App."}), Promise.reject(e)
        }).then(function () {
            return utils.unZipToFolder(o, p)
        }).catch(function (e) {
            return logger.error(e), sendUploadResponse(t, i, {success: !1, message: "Invalid App"}), Promise.reject(e)
        }).then(function () {
            try {
                a = fse.readJsonSync(path.join(p, "/config.json"))
            } catch (n) {
                return logger.error(n), sendUploadResponse(t, i, {success: !1, message: "no config.json"}), Promise.reject(n)
            }
            var o = portalUrlUtils.getStandardPortalUrl(e.body.portalUrl), s = portalUrlUtils.getStandardPortalUrl(a.portalUrl);
            if (o = portalUrlUtils.removeProtocol(o), s = portalUrlUtils.removeProtocol(s), o !== s) {
                var d = "Failed to import the app.This app can only be imported by users of portal: " + s;
                return logger.error(d), sendUploadResponse(t, i, {success: !1, message: d}), Promise.reject(d)
            }
            if ("appList" === e.body.fromList && a.templateConfig && !a.isTemplateApp) {
                var l = "Failed to import app. This is an app template. Please switch to the Templates tab and try again.";
                return sendUploadResponse(t, i, {success: !1, message: l}), Promise.reject(l)
            }
            if ("templateList" === e.body.fromList && (!a.templateConfig || a.isTemplateApp)) {
                var l = "Failed to import template. This is an app. Please switch to the Apps tab and try again.";
                return sendUploadResponse(t, i, {success: !1, message: l}), Promise.reject(l)
            }
            var c = {};
            try {
                c = fs.existsSync(path.join(p, "/appinfo.json")) ? fse.readJsonSync(path.join(p, "/appinfo.json")) : {}
            } catch (n) {
                return logger.error(n), sendUploadResponse(t, i, {success: !1, message: "read appinfo.json error."}), Promise.reject(n)
            }
            var f = {name: r, description: c.description || "", lastUpdated: getCurrentTime(), appType: a.map["3D"] ? "HTML3D" : "HTML", creator: e.body.creator, modified: e.body.creator, appPath: p, isTemplate: a.templateConfig && !a.isTemplateApp ? !0 : !1, isTemplateApp: a.isTemplateApp, isPredefined: !1, icon: c.icon, thumbnail: c.thumbnail};
            importApp(f).then(function (e) {
                sendUploadResponse(t, i, {success: !0, app: e[0]})
            }, function (e) {
                return logger.error(e), sendUploadResponse(t, i, {success: !1, message: e.message}), Promise.reject(e)
            })
        })
    },

    exports.updateApp = function (e, t) {
        findApps({name: e.body.name, creator: e.body.creator, portalUrl: portalUrlUtils.removeProtocol(e.body.portalUrl)}).then(function (n) {
            if (1 === n.length && n[0].id.toString() !== e.body.id.toString())return t.send({success: !1, message: "An app &nbsp;'" + e.body.name + "'&nbsp; exists already. Please choose another name."}), void logger.error("App exists. Name: " + e.body.name);
            var i;
            if (e.body.thumbnail)try {
                i = saveAppThumbnail(e.body.id, e.body.thumbnail)
            } catch (r) {
                return logger.error("Save thumbnail failed." + r.message), void t.send({success: !1})
            }
            var a;
            if (e.body.icon)try {
                a = saveAppIcon(e.body.id, e.body.icon)
            } catch (r) {
                return logger.error("Save icon failed." + r.message), void t.send({success: !1})
            }
            var o = getCurrentTime(), p = {name: e.body.name, description: e.body.description, lastUpdated: o, modified: e.body.modified};
            i && (p.thumbnail = i), a && (p.icon = a), dbutils.update("apps", {_id: e.body.id}, {$set: p}).then(function () {
                fs.existsSync(getZipFilePath(e.body.id)) && fs.unlinkSync(getZipFilePath(e.body.id)), t.send({success: !0, lastUpdated: o, modified: e.body.modified, thumbnail: i ? "/webappbuilder/apps/" + e.body.id + "/" + i : void 0})
            }, function () {
                logger.error("updateApp error"), t.send({success: !1})
            })
        }, function () {
            logger.error("Find app error when update app."), t.send({success: !1, message: "Find app error when update app."})
        })
    },

    exports.updateAgolTemplateInApp = function (e, t) {
        dbutils.update("apps", {_id: e.body.id}, {$set: {agolTemplateInfo: JSON.parse(e.body.agolTemplateInfo)}}).then(function () {
            fs.existsSync(getAGOLZipFilePath(e.body.id)) && fs.unlinkSync(getAGOLZipFilePath(e.body.id)), t.send({success: !0})
        }, function () {
            logger.error("Error occurs when updating AGOL template info in App."), t.send({success: !1})
        })
    },

    exports.createApp = function (e, t) {
        var n = portalUrlUtils.removeProtocol(e.body.portalUrl), i = {fromAppId: e.body.fromAppId, name: e.body.name, description: e.body.description, lastUpdated: getCurrentTime(), creator: e.body.creator, modified: e.body.creator, icon: e.body.icon, thumbnail: e.body.thumbnail, portalUrl: n, extraPropertyOfAppConfig: e.body.extraPropertyOfAppConfig, isPredefined: !1, isTemplate: !1};
        createApp(i).then(function (e) {
            t.send({success: !0, newAppId: e, apps: {}})
        }, function (e) {
            logger.error("Create app error:", e), t.send({success: !1, message: "Create app error."})
        })
    },

    exports.removeApp = function (e, t) {
        deleteFromDB(e.body.id).then(function () {
            try {
                deleteAppFiles(e.body.id)
            } catch (n) {
                logger.error(n), t.send({success: !1, message: n})
            }
            logger.info("App removed, id:", e.body.id), t.send({success: !0})
        }, function () {
            logger.error("Remove app from DB failed.", e.body.id), t.send({success: !1, message: "Unknown error when delete app."})
        })
    },

    exports.duplicateApp = function (e, t) {
        var n = portalUrlUtils.removeProtocol(e.body.portalUrl);
        findAppById(e.body.fromAppId).then(function (i) {
            getUniqueAppName(i.name, e.body.modified, n).then(function (n) {
                var r = fse.readJsonSync(path.join(getAppPath(e.body.fromAppId), "config.json"), "utf-8"), a = {};
                a.appType = i.appType, a.stemappPath = i.stemappPath, a.stemappUrl = i.stemappUrl, a.description = i.description, a.isTemplate = i.isTemplate, a.isTemplateApp = i.isTemplateApp, a.thumbnail = i.thumbnail, a.icon = i.icon, a.name = n, a.creator = e.body.creator, a.modified = e.body.modified, a.portalUrl = e.body.portalUrl, a.appConfig = r, a.isPredefined = !1, a.fromAppId = i.id, a.lastUpdated = getCurrentTime(), a.styleColor = i.styleColor || "", a.themeName = i.themeName || "", insertAndCopyApp(a, i).then(function (i) {
                    logger.info("Duplicate app", e.body.name, "to", n), t.send({success: !0, newAppId: i[0].id, newName: n})
                }, function () {
                    logger.error("Duplicate app failed, app name:", e.body.name), t.send({success: !1})
                })
            }, function (e) {
                logger.error("Get app name error.", e), t.send({success: !1, message: "Failed to duplicate app."})
            })
        })
    },

    exports.downloadAGOLTemplate = function (e, t) {
        var n = e.params.appId, i = getZipFilePath(n), r = getAGOLZipFilePath(n);
        findApps({_id: n}).then(function (e) {
            var a = e[0], o = JSON.parse(a.agolTemplateJson);
            o.configurationSettings.forEach(function (e) {
                delete e.categoryName, e.fields.forEach(function (e) {
                    delete e.id
                })
            }), fs.existsSync(r) ? t.download(r) : fs.existsSync(i) ? (zipAGOLApp(i, JSON.stringify(o), n), t.download(r, a.name + "_AGOLTemplate.zip")) : zipApp(n, function (e) {
                e ? t.send({success: !1}) : zipAGOLApp(i, JSON.stringify(o), n) ? t.download(r, a.name + "_AGOLTemplate.zip") : t.send({success: !1})
            })
        })
    };