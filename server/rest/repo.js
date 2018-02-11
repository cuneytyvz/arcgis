function processRepos(e, t) {
    return logger.info("Read repository items:", e[t].location), saveRepo(e[t]).then(function () {
        refreshRepoItems(e[t]).then(function () {
            return args.watch && watchRepository(e[t]), t === e.length - 1 ? (console.log(".............Repository items refreshed.............."), Promise.resolve()) : (t++, processRepos(e, t))
        })
    })
}

function findStemapps() {
    var e = fse.readJsonSync(path.join(basePath, "client/builder/plugins/plugins.json"), "utf-8"), t = e.startup.extensionPoints.stemapps.extensions, n = [];
    return t.forEach(function (e) {
        var t = {appType: e.parameters.appType}, r = path.join(basePath, "client/builder/plugins", e.pluginName.split(".").join("/")), i = "/webappbuilder/builder/plugins/" + e.pluginName.split(".").join("/") + "/";
        e.parameters.appPath ? (t.appPath = path.join(r, e.parameters.appPath), t.appUrl = i + e.parameters.appPath) : (t.appPath = r, t.appUrl = i), n.push(t)
    }), n
}

function Repository(e) {
    this.name = e.name, this.type = e.type, this.url = e.url, this.location = e.location, this.category = e.category;
    var t = this;
    this.getRepositoryItems = function (e) {
        "local_folder" === this.type && getItemsFromLocalFolder(this, function (t) {
            e(t)
        })
    }, this.setChangeListener = function () {
        watchDir(this.location, {created: function (e) {
            getManifestFile(e).then(function (e) {
                var n = getRepoItemFromFile(t, e);
                null !== n && getItemByUid(n.uid).then(function (e) {
                    null === e && insertItemToDB(n)
                })
            }, function (e) {
                console.error(e)
            })
        }, removed: function (e) {
            deleteItemFromDBByLocation(e)
        }, changed: function (e) {
            if (e.endWith("manifest.json")) {
                logger.info(t.category, "changed:", e);
                var n = getRepoItemFromFile(t, e);
                if (null === n)return;
                getItemByUid(n.uid).then(function (e) {
                    null === e ? t.getRepositoryItems(function (e) {
                        removeNotExistItemFromDB(t, e).then(function () {
                            insertItemToDB(n)
                        })
                    }) : updateItemInDB(n)
                })
            }
        }})
    }
}

function watchDir(e, t) {
    var n = watch.watch(e, {ignoreInitial: !0, awaitWriteFinish: !0, depth: 1, ignored: function (t, n) {
        return n ? n && n.isDirectory() && !0 === _isTopLevelDir(e, t) ? !1 : n && n.isFile() && t.endWith("manifest.json") ? !1 : !0 : !1
    }});
    n.on("addDir", function (e) {
        t.created && t.created(e)
    }).on("unlinkDir", function (e) {
        t.removed && t.removed(e)
    }).on("change", function (e) {
        t.changed && t.changed(e)
    }).on("error", function (e) {
        console.error("Watch repository error:", e)
    }).on("ready", function () {
    })
}

function getManifestFile(e) {
    return new Promise(function (t, n) {
        function r(i) {
            fs.existsSync(path.join(e, "manifest.json")) ? t(path.join(e, "manifest.json")) : i > 0 ? (i--, setTimeout(function () {
                r(i)
            }, 1e3)) : n({message: "Not existed:" + path.join(e, "manifest.json")})
        }

        r(10)
    })
}

function watchRepository(e) {
    e.setChangeListener(function () {
    })
}

function getItemsByName(e) {
    return dbutils.find("repoitems", {name: e})
}

function saveRepo(e) {
    return dbutils.find("repos", {name: e.name}).then(function (t) {
        return 0 === t.length ? dbutils.insert("repos", e) : dbutils.update("repos", {name: e.name}, e)
    })
}

function getItemByUid(e) {
    return dbutils.find("repoitems", {uid: e}).then(function (e) {
        return Promise.resolve(0 === e.length ? null : e[0])
    })
}

function getItemByUrl(e) {
    return dbutils.find("repoitems", {url: e}).then(function (e) {
        return Promise.resolve(0 === e.length ? null : e[0])
    })
}

function getItemsByCategory(e) {
    return dbutils.find("repoitems", {category: e})
}

function getItemsByRepo(e) {
    return dbutils.find("repoitems", {repoName: e.name})
}

function getItemsByPlatform(e) {
    return dbutils.find("repoitems", {platform: e})
}

function getItemInArray(e, t) {
    for (var n = 0; n < e.length; n++)if (e[n].uid === t.uid)return e[n];
    return null
}

function insertItemToDB(e) {
    return dbutils.insert("repoitems", e).then(function (t) {
        return logger.info("insert", e.uid), Promise.resolve(t)
    })
}

function updateItemInDB(e) {
    return dbutils.update("repoitems", {uid: e.uid}, e).then(function (e) {
        return Promise.resolve(e)
    })
}

function deleteItemFromDB(e) {
    return dbutils.remove("repoitems", {uid: e.uid}).then(function (t) {
        return 1 === t && logger.info("delete", e.uid), Promise.resolve(t)
    })
}

function deleteItemFromDBByLocation(e) {
    return dbutils.remove("repoitems", {location: e}).then(function (t) {
        return 1 === t && logger.info("delete", e), Promise.resolve(t)
    })
}

function refreshRepoItems(e) {
    var t = [];
    return e.getRepositoryItems(function (n) {
        n.forEach(function (e) {
            var n = getItemByUrl(e.url).then(function (t) {
                return null === t ? getItemByUid(e.uid).then(function (t) {
                    return null === t ? insertItemToDB(e) : (logger.error("Duplicated item name." + e.location), Promise.reject("Duplicated item name." + e.name))
                }) : updateItemInDB(e)
            });
            t.push(n)
        }), t.push(removeNotExistItemFromDB(e, n))
    }), Promise.all(t)
}

function removeNotExistItemFromDB(e, t) {
    return getItemsByRepo(e).then(function (e) {
        for (var n = [], r = 0; r < e.length; r++) {
            var i = getItemInArray(t, e[r]);
            if (!i) {
                var o = deleteItemFromDB(e[r]);
                n.push(o)
            }
        }
        return Promise.all(n)
    })
}

function getItemsFromLocalFolder(e, t) {
    var n, r = [];
    fs.existsSync(path.join(e.location, ".repoignore")) && (n = fs.readFileSync(path.join(e.location, ".repoignore"), {encoding: "utf-8"}), n && (r = n.split("\r\n")));
    var i = [], o = fs.readdirSync(e.location);
    o.forEach(function (t) {
        var n = path.join(e.location, t), o = n.substr(e.location.length + 1);
        if (r.length > 0 && isFolderIgnore(o, r))return!0;
        var s = path.join(n, "manifest.json");
        if (fs.existsSync(s))try {
            var a = getRepoItemFromFile(e, s);
            a && i.push(a)
        } catch (u) {
            logger.error("Manifest is bad.", s)
        }
    }), t(i)
}

function getRepoItemFromFile(e, t) {
    var n = fse.readJsonSync(t), r = t.split(path.sep);
    return r.pop(), n.location = r.join(path.sep), n.repoName = e.name, n.properties && n.properties.isThemeWidget ? null : processManifest(e, n) ? (addI18NLabel(n), n) : null
}

function processManifest(e, t) {
    if (t.url = e.url + t.name + "/", t.icon = t.url + "images/icon.png", t.category = e.category, t.uid = t.platform + "." + t.name, "widget" === e.category && addWidgetManifestProperties(t), "theme" === e.category) {
        if (!t.layouts)return logger.error("no layout is found in the theme", t.uid), !1;
        addThemeManifestProperies(t)
    }
    return!0
}

function addI18NLabel(e) {
    if (e.i18nLabels = {}, fs.existsSync(path.join(e.location, "nls/strings.js"))) {
        var t = ("widget" === e.category ? "_widgetLabel" : "_themeLabel", requirejs(path.join(e.location, "nls/strings.js"))), n = {};
        for (var r in t)if ("root" !== r && t[r])try {
            var i = requirejs(path.join(e.location, "nls", r, "strings.js"));
            n[r] = i
        } catch (o) {
            logger.error("Read locale string error:", path.join(e.location, "nls", r, "strings.js"))
        }
        sharedUtils.addI18NLabelToManifest(e, t, n)
    }
}

function addWidgetManifestProperties(e) {
    "undefined" != typeof e["2D"] && (e.support2D = e["2D"]), "undefined" != typeof e["3D"] && (e.support3D = e["3D"]), "undefined" == typeof e["2D"] && "undefined" == typeof e["3D"] && (e.support2D = !0), delete e["2D"], delete e["3D"], "undefined" == typeof e.properties && (e.properties = {}), sharedUtils.processWidgetProperties(e)
}

function addThemeManifestProperies(e) {
    e.panels || (e.panels = []), e.styles || (e.styles = []), e.widgets || (e.widgets = []), e.panels.forEach(function (e) {
        e.uri = "panels/" + e.name + "/Panel.js"
    }), e.styles.forEach(function (e) {
        e.uri = "styles/" + e.name + "/style.css"
    }), e.layouts.forEach(function (t) {
        t.uri = "layouts/" + t.name + "/config.json", t.icon = "layouts/" + t.name + "/icon.png", t.RTLIcon = fs.existsSync(path.join(e.location, "layouts", t.name, "icon_rtl.png")) ? "layouts/" + t.name + "/icon_rtl.png" : "layouts/" + t.name + "/icon.png"
    }), e.widgets.forEach(function (t) {
        var n = fse.readJsonSync(path.join(e.location, "widgets", t.name, "manifest.json"));
        return n.properties && n.properties.isThemeWidget ? void 0 : void logger.error('widget in theme should have "isThemeWidget:true" setting in widget manifest.json.', "theme:", e.name, ",widget:", t.name)
    })
}

function isFolderIgnore(e, t) {
    for (var n = 0; n < t.length; n++)if (e === t[n])return!0;
    return!1
}

function _isTopLevelDir(e, t) {
    var n = path.normalize(e).split(path.sep).length - 1, r = path.normalize(t).split(path.sep).length - 1;
    return 1 >= r - n ? !0 : !1
}

var path = require("path"), fs = require("fs"), fse = require("fs-extra"), logger = require("log4js").getLogger("repo"), dbutils = require("../dbutils"), watch = require("chokidar"), requirejs = require("requirejs"), Promise = require("bluebird"), sharedUtils = requirejs("jimu/shared/utils"), basePath = path.join(__dirname, "../..");

exports.initWorkingRepositories = function () {
    var e = findStemapps(), t = [];
    e.forEach(function (e) {
        var n, r = path.join(e.appPath, "widgets"), i = path.join(e.appPath, "themes");
        fs.existsSync(r) && (n = new Repository({name: e.appType + " widgets", type: "local_folder", url: e.appUrl + "/widgets/", location: r, category: "widget"}), t.push(n)), fs.existsSync(i) && (n = new Repository({name: e.appType + " themes", type: "local_folder", url: e.appUrl + "/themes/", location: i, category: "theme"}), t.push(n))
    }), processRepos(t, 0)
},
    exports.getItemsByCategory = getItemsByCategory,
    exports.getItemsByName = getItemsByName,
    exports.getItemByUid = getItemByUid,
    exports.getItemsByPlatform = getItemsByPlatform,
    exports.addI18NLabel = addI18NLabel;