var quick = module.exports = {};
quick.log = require('./log');
quick.config = require('./config').register(quick);
quick.util = require('./util').register(quick);
quick.verbose = quick.log.verbose;
