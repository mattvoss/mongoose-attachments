// Copyright (c) 2011 Firebase.co - http://www.firebase.co
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var attachments = require('../attachments');
var util = require('util');
var mongoose = require('mongoose'),
    fs = require('fs'),
    Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

FileStorage = new Schema({
    fileId          : ObjectId,
    fileName        : String,
    file            : Buffer,
    date            : { type: Date, default: Date.now }
});

var fileStorage = mongoose.model('FileStorage', FileStorage);

function mongoFileStorage(options) {
  attachments.StorageProvider.call(this, options);
  this.client = mongoose.connect('mongodb://'+options.db.host+'/'+options.db.database);
}
util.inherits(mongoFileStorage, attachments.StorageProvider);

mongoFileStorage.prototype.createOrReplace = function(attachment, cb) {
    var self = this;
    var callback = function(err, document) {
        if(err) return cb(err);
        attachment.defaultUrl = "";
        cb(null, attachment);
    };
    var file = new Buffer(fs.readFileSync(attachment.path));
    var doc = {
        'fileName'      : attachment.filename,
        'file'          : file,
    };

    var instance = new fileStorage(doc);

    instance.save(callback);

};

// register the MongoDB File Storage Provider into the registry
attachments.registerStorageProvider('mongofile', mongoFileStorage);

// export it just in case the user needs it
module.exports = mongoFileStorage;
