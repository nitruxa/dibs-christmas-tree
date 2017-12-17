import net from 'net';

const client = new net.Socket();
let isConnected = false;

function connectClient() {
    client.connect(23, '192.168.10.234', () => {
        isConnected = true;
        console.log('Connected');
    });
}

client.on('data', () => {
    // console.log('Received: ' + data);
    // client.destroy(); // kill client after server's response
});

client.on('close', () => {
    isConnected = false;
    console.log('Connection closed, trying to reconnect.');
    connectClient();
});


connectClient();

export default function sendToTelnet(values) {
    let data = new Array(8);
    if (Array.isArray(values)) {
        data = values;
    } else {
        data.fill(values);
    }

    data.map(value => {
        return value * 255 / 100;
    });

    if (isConnected) {
        // console.log(`PWM: ${data.join(',')}`);
        client.write(`PWM: ${data.join(',')}\n`);
    }
};
