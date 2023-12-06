'use strict';

({
    async say(message) {
        console.log({ message });
        return { status: 'ok' };
    },
});
