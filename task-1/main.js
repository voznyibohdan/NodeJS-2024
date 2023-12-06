'use strict';

const fsp = require('node:fs').promises;
const path = require('node:path');

const config = require('./config');
const db = require('./db.js')(config.db);
const load = require('./load.js')(config.sandbox);

const staticServer = require('./static.js');
const transport = require(`./transports/${config.api.transport}.js`)

const logger = require('./logger.js');
const hash = require('./hash.js');

const sandbox = {
    console: Object.freeze(logger),
    db: Object.freeze(db),
    common: { hash },
};
const apiPath = path.join(process.cwd(), './api');
const routing = {};

(async () => {
    const files = await fsp.readdir(apiPath);
    for (const fileName of files) {
        if (!fileName.endsWith('.js')) continue;
        const filePath = path.join(apiPath, fileName);
        const serviceName = path.basename(fileName, '.js');
        routing[serviceName] = await load(filePath, sandbox);
    }

    staticServer('./static', config.static.port, logger);
    transport(routing, config.api.port, logger);
})();
