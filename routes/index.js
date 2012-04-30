var ldap = require('../ldap');
var mongo = require('../mongodb');

exports.index = function(req, res) {
    if (req.session.user) {
        res.redirect('/main');
    }
    else {
        res.render('index', {
            title: 'Daumin Web Messenger',
            message: 'Welcome to Daumin Web Messenger'
        });
    }
};

exports.login = function(req, res) {
    ldap.auth(req.param('id'), req.param('password'), function(err, user, members) {
        if (err) {
            res.render('index', {
                title: 'main page',
                message: err
            })
        }
        else {
            req.session.user = user;
            req.session.members = members;
            res.redirect('/main');
        }
    });
};

exports.main = function(req, res) {
    res.render('main', {
        title: 'main page',
        user: req.session.user,
        members: req.session.members
    })
};

exports.online = function(req, res) {
    res.render('online', {
        title: 'online page',
        members: members
    });
};

exports.chat = function(req, res) {
    mongo.selectChatlog(req.session.user.uid, req.params['uids'], function(err, doc) {
        res.render('chat', {
            title: 'chat with ' + req.params['uids'],
            from: req.session.user.uid,
            to: req.params['uids'],
            history: doc
        });
    });
};

exports.search = function(req, res) {
    mongo.queryChatlog(req.session.user.uid, req.params['keyword'], function(err, doc) {
        res.render('search', {
            title: 'search result with ' + req.params['keyword'],
            results: doc
        });
    });
};

exports.logout = function(req, res) {
    req.session.destroy();
    res.redirect('/');
};