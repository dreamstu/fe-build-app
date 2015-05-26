'use strict';
var fs = require('fs');
var path = require('path');
module.exports = function(grunt,curr,options) {
  var template = path.join(__dirname,'template.js');
  var content = fs.readFileSync(template,'utf8');
  content = content.replace(/\{\{output\}\}/g, options.outf || 'E://node/tmp/dest')
  .replace(/\{\{id\}\}/g,options.id || 'modules')
  .replace(/\{\{uglify\}\}/g,options.uglify?'{}':false);
  var gruntfile = path.join(curr,'Gruntfile.js');
  fs.writeFileSync(gruntfile,content);
  return gruntfile;
  //{ tasks: [], npm: [], gruntfile: gruntfile, base:path.dirname(gruntfile) };
}