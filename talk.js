const { io } = require('socket.io-client');
const { stdin: input, stdout: output, exit } = require('process');
const { createInterface } = require('readline/promises');

const cli = createInterface({ input, output });

function handleCommand(cmd) {
    switch(cmd) {
        case '.exit' :
            cli.close();
            console.log('Bye !');
            exit(0);
            break;
        default:
            console.log('Unknown command :/');
            break;
    }
}

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

            const startswithdot = /^\./.test(message);
            if(startswithdot) {
                handleCommand(message);
            } else {
                socket.emit('message', message);
            }
        }
    })

})().catch((err) => {
    cli.close();
    console.error(err);
    exit(1);
})
