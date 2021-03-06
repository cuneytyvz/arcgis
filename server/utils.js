function createFile(e, r) {
    return e.async("nodebuffer").then(function (e) {
        return fs.writeFileSync(r, e)
    })
}

function ensureDirectoryExistence(e) {
    var r = path.dirname(e);
    return directoryExists(r) ? !0 : (ensureDirectoryExistence(r), void fs.mkdirSync(r))
}

function directoryExists(e) {
    try {
        return fs.statSync(e).isDirectory()
    } catch (r) {
        return!1
    }
}

function isBase64Code(e) {
    return/^data:image\/.*;base64,/.test(e)
}

function saveBase64ToImgSync(e, r) {
    if (!/^data:image\/.*;base64,/.test(r))throw Error("Bad base64 code format");
    var i = r.match(/^data:image\/(.*);base64,/)[1], t = r.replace(/^data:image\/.*;base64,/, ""), n = e.lastIndexOf(".");
    return e = 0 > n ? e + "." + i : e.substr(0, n + 1) + i, fs.writeFileSync(e, t, "base64"), e
}

function visitObject(e, r) {
    for (var i in e)e[i]instanceof Array ? visitArray(e[i], r) : "object" == typeof e[i] ? visitObject(e[i], r) : r(e, i)
}

function visitArray(e, r) {
    e.forEach(function (i, t) {
        i instanceof Array ? visitArray(i, r) : "object" == typeof i ? visitObject(i, r) : r(e, t)
    })
}

function visitFolderFiles(e, r) {
    var i = fs.readdirSync(e);
    i.forEach(function (i) {
        var t = path.normalize(e + "/" + i);
        fs.statSync(t).isDirectory() ? r(t, i, !0) || visitFolderFiles(t, r) : r(t, i, !1)
    })
}

function visitSubFolders(e, r) {
    var i = fs.readdirSync(e);
    i.forEach(function (i) {
        var t = path.normalize(e + "/" + i);
        fs.statSync(t).isDirectory() && (r(t, i, fs.readdirSync(t)) || visitSubFolders(t, r))
    })
}

function findMaxFileIndexInFolder(e, r) {
    var i = fs.readdirSync(e), t = -1;
    return i.forEach(function (e) {
        if (e.substring(0, e.lastIndexOf(".")) === r)t = 0; else if (e.startWith(r)) {
            var i = e.substring((r + "_").length, e.lastIndexOf("."));
            i = parseInt(i, 10), Number.isNaN(i) || (t = Math.max(t, i))
        }
    }), t
}

function getTokenFromRequest(e, r) {
    var i = r.query.token;
    return i || (i = getTokenFromCookie(e, r)), i
}

function getTokenFromCookie(e, r) {
    var i = r.cookies;
    if (!i)return null;
    for (var t in i)if ("wab_auth" === t)try {
        var n = JSON.parse(i[t]), s = portalUrlUtils.getServerByUrl(n.server) === portalUrlUtils.getServerByUrl(e);
        if (!s)return null;
        n.expires = parseInt(n.expires, 10);
        var o = new Date, a = o.getTime(), c = n.expires > a;
        if (!c)return null;
        var l = r.headers.host === n.referer;
        return l ? n.token : null
    } catch (u) {
        return logger.error(u), null
    }
    return null
}

function docopy(e, r, i) {
    i ? fs.existsSync(e) && (logger.debug("copy", e), fse.copySync(e, r)) : (logger.debug("copy", e), fse.copySync(e, r))
}

function digest(e) {
    return crypto.createHash("sha1").update(e).digest("hex")
}

function verifyUploadedAppZip(e) {
    var r = [];
    return r.push(checkFileExistInZip(e, "config.json")), r.push(checkFolderExistInZip(e, "jimu.js")), r.push(checkFolderExistInZip(e, "widgets")), r.push(checkFolderExistInZip(e, "themes")), Promise.all(r)
}

function checkFileExistInZip(e, r) {
    return JSZip.loadAsync(fs.readFileSync(e)).then(function (e) {
        for (var i in e.files) {
            var t = e.files[i];
            if (t.name === r)return Promise.resolve()
        }
        return Promise.reject(new Error("Invalid App"))
    })
}

function checkFolderExistInZip(e, r) {
    return JSZip.loadAsync(fs.readFileSync(e)).then(function (e) {
        var i = e.folder(new RegExp(r));
        return i && i.length && i.length > 0 ? Promise.resolve() : Promise.reject(new Error("Invalid App"))
    })
}

var path = require("path"), fs = require("fs"), fse = require("fs-extra"), JSZip = new require("jszip"), crypto = require("crypto"), log4js = require("log4js"), logger = log4js.getLogger("utils"), pako = require("pako"), requirejs = require("requirejs"), portalUrlUtils = requirejs("jimu/shared/basePortalUrlUtils");

exports.zipFolderSync = function (e, r) {
    var i = new JSZip;
    e = path.normalize(e), visitFolderFiles(e, function (r, t, n) {
        if (n)i.folder(r.substr(e.length, r.length)); else {
            var s;
            s = fs.readFileSync(r), i.file(r.substr(e.length, r.length), s)
        }
    });
    i.generateAsync({type: "nodebuffer", compression: "DEFLATE"}).then(function (e) {
        fs.writeFileSync(r, e, "binary")
    })
},

    exports.unZipToFolder = function (e, r) {
        return JSZip.loadAsync(fs.readFileSync(e)).then(function (e) {
            var i = [];
            for (var t in e.files) {
                var n = e.files[t], s = path.join(r, n.name);
                ensureDirectoryExistence(s), !0 === n.dir ? fs.mkdirSync(s) : i.push(createFile(n, s))
            }
            return Promise.all(i)
        })
    },

    exports.visitFolderFiles = visitFolderFiles,
    exports.visitSubFolders = visitSubFolders,
    exports.visitObject = visitObject,
    exports.saveBase64ToImgSync = saveBase64ToImgSync,
    exports.isBase64Code = isBase64Code,
    exports.findMaxFileIndexInFolder = findMaxFileIndexInFolder,
    exports.getTokenFromRequest = getTokenFromRequest,
    exports.docopy = docopy,
    exports.digest = digest,
    exports.verifyUploadedAppZip = verifyUploadedAppZip,
    exports.checkFileExistInZip = checkFileExistInZip,
    exports.checkFolderExistInZip = checkFolderExistInZip;