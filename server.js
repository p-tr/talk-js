const { Server } = require('socket.io');
const { now } = Date;

const { env: { port = 3000 } } = process;

let usernames = {};
let rooms = [];

const io = new Server();

io.on('connection', (socket) => {
    const { id } = socket;

    let author = 'anon#' + id;
    usernames[id] = author;

    socket.on('auth:login-start', () => {
        console.log('auth:login-start ' + id);
        socket.emit('auth:request');
    })

    socket.on('auth:response', (username) => {
        usernames[id] = author = username;
        console.log('auth:login-success ' + username);
        socket.emit('auth:login-success', username);
    });

    socket.on('auth:room', () => {
        console.log('auth:room ' + socket.id);
        socket.isRoom = true;
        rooms.push(socket);
    })

    socket.on('disconnect', () => {
        console.log(`socket ${id} is disconnected...`);
        if(socket.isRoom) {
            const idx = rooms.indexOf(socket);
            if(idx != -1) {
                delete rooms[idx];
            }
        } else {
            delete usernames[id];
        }
    });

    socket.on('message', (message) => {
        const timestamp = now();
        const obj = { message, author, timestamp };
        console.log('message ', obj);
        rooms.forEach((socket) => { socket.emit('message', obj) });
    })
});

io.listen(port);
