var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
	title: String,
	description: String,
	Author: String
});

module.exports = mongoose.model('Post', postSchema);