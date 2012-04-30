"use strict";
var config = require('./config');
var ldapjs = require('ldapjs');

var ldapUserClient = ldapjs.createClient({
    url: config.ldap.url
});
var ldapAdminClient = ldapjs.createClient({
    url: config.ldap.url
});

function auth(uid, password, callback) {
    ldapAdminClient.bind(config.ldap.adminDn, config.ldap.adminPassword, function(err, result) {
        if (err) {
            console.error('admin bind error: ' + err);
            return callback(err);
        }
        var opts = {
            filter: 'uid=' + uid,
            scope: 'sub'
        };
        var user = [];

        ldapAdminClient.search('o=daumcorp', opts, [], function(err, res) {
            res.on('searchEntry', function(entry) {
                user.push(entry.object);
            });
            res.on('error', function(err) {
                console.error('search error: ' + err);
                return callback(err);
            });
            res.on('end', function(result) {
                ldapAdminClient.unbind();
                if (result.status !== 0) {
                    var err = 'non-zero status from LDAP search: ' + result.status;
                    console.error(err);
                    return callback(err);
                }
                switch (user.length) {
                case 0:
                    return callback('user not found');
                case 1:
                    ldapUserClient.bind(user[0].dn, password, function(err) {
                        if (err) {
                            console.error('ldap authenticate: bind error:' + err);
                            return callback(err);
                        }
                        ldapUserClient.unbind();
                        return getDeptMembers(user[0], callback);
                    });
                default:
                    var err = 'unexpected number of matches ' + user.length + ' for username ' + username;
                    console.error(err);
                    return callback(err);
                }
            });
        });
    });
};

exports.auth = auth;

function getDeptMembers(user, callback) {
    ldapAdminClient.bind(config.ldap.adminDn, config.ldap.adminPassword, function(err, res) {
        if (err) {
            console.error('admin bind error: ' + err);
            return callback(err);
        }

        var opts = {
            filter: 'deptcode=' + user.deptcode,
            scope: 'sub'
        };
        var members = [];

        ldapAdminClient.search('o=daumcorp', opts, [], function(err, res) {
            res.on('searchEntry', function(entry) {
                members.push(entry.object);
            });
            res.on('error', function(err) {
                console.error('search error: ' + err);
                return callback(err);
            });
            res.on('end', function(result) {
                ldapAdminClient.unbind();
                callback(null, user, members);
            });
        });
    });
}

exports.getDeptMembers = getDeptMembers;