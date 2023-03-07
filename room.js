const { io } = require('socket.io-client');
const { stdin: input, stdout: output, exit } = require('process');
const { createInterface } = require('readline/promises');

const cli = createInterface({ input, output });

(async () => {
    let constr = await cli.question('socket.io connection string (ws://localhost:3000) > ');
    if(constr == '' || constr == null) {
        constr = 'ws://127.0.0.1:3000';
    }

    cli.close();

    const socket = io(constr, {});

    socket.on('message', ({ message, author, timestamp }) => {
        const date = new Date(timestamp);

        console.log(`(${date.toISOString()}) ${author} > ${message}`);
    });

    socket.on('auth:logout', (username) => {
        console.log(`${username} leaves the chat...`)
    })

    socket.on('auth:login', (username) => {
        console.log(`${username} enters the chat...`)
    })

    socket.emit('auth:room');

})().catch((err) => {
    console.error(err);
    exit(1);
})
