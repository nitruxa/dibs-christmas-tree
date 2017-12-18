import net from 'net';

let isConnected = false;
const TELNET_PORT = 23;
const TELNET_IP = '192.168.10.234';

const client = new net.Socket();

function connectClient() {
    try {
        console.log(`Connecting to telnet ip ${TELNET_IP}`);
        client.connect(TELNET_PORT, TELNET_IP, () => {
            isConnected = true;
            client.write(`\n`);
            console.log('Connected to TELNET');
        });
    } catch (error) {
        console.log(error);
    }
}

client.on('error', error => {
    console.log(`${error}`);
});

client.on('timeout', () => {
    console.log('TELNET Timeouted');
    connectClient();
});

client.on('data', (data) => {
    console.log('Received: ' + data);
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

    data = data.map(value => {
        return Number.parseInt(value * 255 / 100);
    });


    if (isConnected) {
        // console.log(`PWM: ${data.join(',')}`);
        client.write(`PWM: ${data.join(',')}\r\n`);
    }
};
