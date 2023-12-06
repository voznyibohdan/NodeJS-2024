'use strict';

const http = require('node:http');

const HEADERS = {
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json; charset=UTF-8',
};

const receiveArgs = async (req) => {
    const buffers = [];
    for await (const chunk of req) buffers.push(chunk);
    const data = Buffer.concat(buffers).toString();
    return JSON.parse(data);
};

module.exports = (routing, port, console) => {
    http.createServer (async (request, response) => {
        response.writeHead (200, HEADERS) ;
        if (request.method !== 'POST') return response.end('"Not found"');
        const { url, socket} = request;
        const [place, name, method] = url.substring(1).split('/');
        if (place !== 'api') return response.end('"Not found"');
        const entity = routing[name];
        if (!entity) return response.end('"Not found"');
        const handler = entity [method];
        if (!handler) return response.end('"Not found"');
        const { args } = await receiveArgs (request);
        console.log(`${socket.remoteAddress} ${method} ${url}`);
        const result = await handler (args);
        response.end(JSON.stringify (result));
    }).listen (port);

    console.log(`API on port ${port}`);
};
