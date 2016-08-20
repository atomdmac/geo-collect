var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var storage = require('node-persist');
var ngeohash = require('ngeohash');
var uuid = require('node-uuid');

var activeGeohashes = {};

var ITEM_TYPES = {
    'sample-item': {
        min: 50,
        max: 100,
        func: createSampleItem
    }
};

// Initialize persistent storage.
var usersStorage = storage.create({dir: __dirname + '/persist/users'});
usersStorage.initSync();

// Serve all client resources from 'client' directory.
app.use(express.static('client'));

// Handle new connections.
io.on('connection', function(socket){
    
    socket.on('disconnect', function () {
        if (!!socket.sessionData) {
            for (var geohash in socket.sessionData.geohashes) {
                removeUserFromGeohash(geohash, socket);
            }
            console.log(socket.sessionData.user.name,'disconnected');
        }
    });
    
    // User login.
    socket.on('login', function(msg){
        if (!msg) return; // Fail quietly if no username is sent.
        
        var user = usersStorage.getItem(msg);
        if (!!user) {
            user.logins++;
            usersStorage.setItem(user.name, user);
        }
        else {
            user = {
                name: msg,
                logins: 1
            };
            usersStorage.setItem(msg,user);
        }
        console.log(user.name,'connected');
        socket.sessionData = {
            user: user,
            geohashes: {}
        };
        socket.emit('login confirmed', user);
    });
    
    // User joins geohash slice.
    socket.on('join geohash', function(msg){
        addUserToGeohash(msg, socket);
    });
    
    // User leaves geohash slice.
    socket.on('leave geohash', function(msg){
        removeUserFromGeohash(msg, socket);
        
        /*// Track whether any sockets are connected to the room.
        if (io.sockets.adapter.rooms[msg]) {
            // Room still exists.
            console.log(io.sockets.adapter.rooms[msg].length, 'users in', msg);
        }
        else {
            // Room is empty now.
            console.log('room', msg, 'has been closed');
        }
        */
    });
});

// Listen over HTTP.
http.listen(80, function(){
    console.log('listening on *:80');
});

function createGeohash(sGeohash) {
    var bbox = ngeohash.decode_bbox(sGeohash);
    var geohash = {
        hashstring: sGeohash,
        users: {},
        coords: {
            minlat: bbox[0],
            minlon: bbox[1],
            maxlat: bbox[2],
            maxlon: bbox[3]
        },
        items: {}
    };
    
    for (var type in ITEM_TYPES) {
        geohash.items[type] = [];
        var lcv = 0,
            eMin = ITEM_TYPES[type].min;
        for (lcv; lcv < eMin; lcv++) {
            geohash.items[type].push(ITEM_TYPES[type].func({
                longitude: getRandomCoord(geohash.coords.minlon, geohash.coords.maxlon),
                latitude: getRandomCoord(geohash.coords.minlat, geohash.coords.maxlat)
            }));
            console.log(geohash.items[type][lcv]);
        }
    }
    
    return geohash;
}

function addUserToGeohash(sGeohash, socket) {
    if (!activeGeohashes[sGeohash]) {
        activeGeohashes[sGeohash] = createGeohash(sGeohash);
    }
    var geohash = activeGeohashes[sGeohash];
        
    socket.join(sGeohash);
    socket.emit('geohash update', geohash.items);
    
    geohash.users[socket.sessionData.user.name] = socket;
    socket.sessionData.geohashes[sGeohash] = geohash;
    
    console.log(socket.sessionData.user.name, 'joined', sGeohash);
}

function removeUserFromGeohash(sGeohash, socket) {
    socket.leave(sGeohash);
    
    delete activeGeohashes[sGeohash].users[socket.sessionData.user.name];
    delete socket.sessionData.geohashes[sGeohash];
    
    console.log(socket.sessionData.user.name, 'left', sGeohash);
}

function getRandomCoord(min, max) {
    return (Math.floor(Math.random() * (max - min) * 100000) + (min * 100000)) / 100000;
}

function createSampleItem(coords) {
    return {
        uuid: uuid.v4(),
        coords: coords
    };
}