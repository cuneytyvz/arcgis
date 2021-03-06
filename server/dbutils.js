var Promise = require("bluebird"), _db;

exports.find = function (n, t, e, r) {
    return _db = r || db, e || (e = {}), _db.collectionAsync(n).then(function (n) {
        return n.findAsync(t, e).then(function (n) {
            return Promise.promisify(n.toArray, {context: n})().then(function (n) {
                return n.forEach(function (n) {
                    n.id = n.id || n._id.id
                }), Promise.resolve(n)
            })
        })
    })
},

    exports.insert = function (n, t, e) {
        return _db = e || db, _db.collectionAsync(n).then(function (n) {
            return n.insertAsync(t, {w: 1}).then(function (n) {
                return n.forEach(function (n) {
                    n.id = n.id || n._id.id
                }), Promise.resolve(n)
            })
        })
    },

    exports.update = function (n, t, e, r) {
        return _db = r || db, _db.collectionAsync(n).then(function (n) {
            return n.updateAsync(t, e, {w: 1}).then(function (n) {
                return n[0]
            })
        })
    },

    exports.remove = function (n, t, e) {
        return _db = e || db, _db.collectionAsync(n).then(function (n) {
            return n.removeAsync(t, {w: 1})
        })
    };