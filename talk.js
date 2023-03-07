const { io } = require('socket.io-client');
const { stdin: input, stdout: output, exit } = require('process');
const { createInterface } = require('readline/promises');

const cli = createInterface({ input, output });

cli.stdoutMuted = true;

(async () => {
    let constr = await cli.question('socket.io connection string (ws://localhost:3000) > ');
    if(constr == '' || constr == null) {
        constr = 'ws://127.0.0.1:3000';
    }

    const socket = io(constr, {});

    socket.on('connect', () => {
        console.log(`Socket ${socket.id} is connected...`);
        socket.emit('auth:login-start');
    });

    socket.on('auth:request', async () => {
        const username = await cli.question(`(${constr}) username : `);
        socket.emit('auth:response', username);
    })

    socket.on('auth:login-success', async (username) => {
        const prompt = `(${constr}) [${username}] > `;

        while(true) {
            const message = await cli.question(prompt);
            socket.emit('message', message);
        }
    })

})().catch((err) => {
    cli.close();
    console.error(err);
    exit(1);
})
