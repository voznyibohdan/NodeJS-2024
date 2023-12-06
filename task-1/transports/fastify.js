const fastify = require('fastify')();

fastify.register(require('@fastify/cors'), (_instance) => {
    return (req, callback) => {
        const corsOptions = { origin: true };
        if (/^localhost$/m.test(req.headers.origin)) {
            corsOptions.origin = false
        }
        callback(null, corsOptions)
    }
});

module.exports = (routing, port, console) => {
    const services = Object.keys(routing);

    for (const service of services) {
        const methods = Object.keys(routing[service]);

        for (const method of methods) {
            fastify.post(`/api/${service}/${method}`, async (request, reply) => {
                const handler = routing[service][method];
                const response = await handler(...request.body.args);
                reply.send(response);
            });
        }
    }

    fastify.listen({ port }, (err) => {
        if (err) {
            console.error(err)
            process.exit(1)
        }
    });
}
