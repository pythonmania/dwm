var config = require('./config');
var mongodb = require('mongodb');
var server = new mongodb.Server(config.mongodb.host, config.mongodb.port {
  auto_reconnect : true
}, {});

var mongo = new mongodb.Db('dwm', server, {})
exports.insertChatlog = function(from, to, message) {
  mongo.open(function(error, client) {
    if(error)
      throw error;
    var collection = new mongodb.Collection(client, 'chatlog');
    collection.insert({
      from : from,
      to : to,
      timestamp : new Date().getTime(),
      message : message
    }, {
      safe : true
    }, function(err, objects) {
      if(err)
        console.warn(err.message);
      if(err && err.message.indexOf('E11000 ') !== -1) {
      }
      client.close();
      mongo.close();
    });
  })
};

exports.selectChatlog = function(from, to, callback) {
  mongo.open(function(error, client) {
    if(error)
      throw error;
    var collection = new mongodb.Collection(client, 'chatlog');
    var cursor = collection.find({from:from, to:to});
    cursor.sort({timestamp:-1}).limit(10);
    cursor.toArray(function(err, doc) {
      console.log("mongo result : " + doc);
      callback(null, doc);
      client.close();
      mongo.close(); 
    });
  })
}

exports.queryChatlog = function(uid, keyword, callback) {
  mongo.open(function(error, client) {
    if(error)
      throw error;
    var collection = new mongodb.Collection(client, 'chatlog');
    //var cursor = collection.find( { $and : [ { $or : [ { from:uid, to:uid } ] }, { message:keyword } ] } );
    //var cursor = collection.find( { $or : [ { from:'ls15', to:'ls15'} ] } );
    //var cursor = collection.find( { $or : [ { from:'ls15', to:'ls15' } ] } );
    keyword = ".*" + keyword + ".*";
    var cursor = collection.find( { message: {$regex: keyword } } );
    // var cursor = collection.find( { from:'ls15' } );
    //cursor.sort({timestamp:-1}).limit(10);
    cursor.toArray(function(err, doc) {
      console.log("mongo result : " + doc);
      callback(null, doc);
      client.close();
      mongo.close(); 
    });
  })
}
