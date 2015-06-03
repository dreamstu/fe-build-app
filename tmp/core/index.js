/*
 * core
 * https://github.com/johnkim/core
 *
 * Copyright (c) 2015 dreamstu
 * Licensed under the MIT license.
 */

var core = {};
var $ = require('jquery');
var a = require('./src/a');
var listtpl = require('./src/list.tpl');
require.async('./src/list-a.tpl',function(tpl){
	console.log(tpl);
});
module.exports = core;
