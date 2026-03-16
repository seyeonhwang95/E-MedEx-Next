import net from 'node:net';

const START = String.fromCharCode(0x0b);
const END = String.fromCharCode(0x1c);
const CR = String.fromCharCode(0x0d);

const port = Number(process.env.HL7_PORT ?? 2575);

function buildAck(messageControlId = 'UNKNOWN') {
  const now = new Date().toISOString().replace(/[-:]/g, '').slice(0, 14);
  return [
    'MSH|^~\\&|EMEDEX|TENANT|LAB|TENANT|' + now + '||ACK^O01|' + messageControlId + '|P|2.5.1',
    'MSA|AA|' + messageControlId,
  ].join('\r');
}

const server = net.createServer((socket) => {
  socket.on('data', (buffer) => {
    const payload = buffer.toString('utf8').replaceAll(START, '').replaceAll(END, '').trim();
    const messageControlId = payload.split('\r').find((segment) => segment.startsWith('MSH|'))?.split('|')[9];
    const ack = `${START}${buildAck(messageControlId)}${END}${CR}`;

    socket.write(ack);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log(`HL7 gateway listening on ${port}`);
});