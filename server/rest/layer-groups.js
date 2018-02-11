var repoRest = require("./repo"), dbutils = require("../dbutils"), log4js = require("log4js"), logger = log4js.getLogger("app");

exports.foo = function () {
},

    exports.removeGroup = function (e, t) {
        var appId = e.params.appId;
        var groupId = e.params.groupId;

        dbutils.remove("groups", groupId).then(function (t) {
            return logger.info("remove", groupId), Promise.resolve(t)
        })
    },

    exports.removeGroups = function (e, t) {
        var appId = e.params.appId;

        logger.info('appId : ' + appId);

        dbutils.remove("groups", {appId: parseInt(appId)}).then(function (y) {
            t.send({success: 1});
        });
    },

    exports.saveGroup = function (e, t) {
        var appId = e.params.appId;
        var body = e.body;
        var group = JSON.parse(body.data);

        logger.info(body);
        logger.info(group);

        dbutils.remove("groups", {appId: parseInt(appId)}).then(function (y) {
            dbutils.insert("groups", group).then(function (r) {
                logger.info("insert", JSON.stringify(r));
                t.send({success: 1, id: r._id});
            })
        });

    },

    exports.findGroups = function (e, t) {
        var appId = e.params.appId;
        logger.info('Find groups app id : ' + appId);

        return dbutils.find("groups", {appId: parseInt(appId)}).then(function (r) {
            logger.info('Response length : ' + r.length);

            t.send(r.length === 0 ? {appId: appId, groups: [
                {id: 0, title: "Other", layers: []}
            ]} : r[0]);
        })
    };