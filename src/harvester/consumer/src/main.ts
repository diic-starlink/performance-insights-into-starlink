import { EachMessageHandler, EachMessagePayload } from 'kafkajs';
import KafkaConsumer from './kafka-consumer';

const DB_API = 'http://duckdb:3000';

const TOPIC = 'measurements';

const consumerCallback: EachMessageHandler = (payload: EachMessagePayload): Promise<void> => {
	let data = JSON.parse(payload.message.value.toString());
	console.log('Received Data.');

	// Adjust to desired REST API.
	data.destination = data.dst_addr;
	data.source = data.src_addr;
	delete data.dst_addr;
	delete data.src_addr;

	data.sent_packets = data.sent;
	data.received_packets = data.rcvd;
	delete data.sent;
	delete data.rcvd;

	const promise = fetch(`${DB_API}/store/ping`, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: { 'Content-Type': 'application/json' },
	});

	Promise
		.resolve(promise)
		.then(response => response.text())
		.then((text) => {
			if (text === 'Failed') {
				console.error('Failed to store the data into the database due to DuckDB internal error.');
			}
		})
		.catch((error) => {
			console.error(error);
		});

	return Promise.resolve();
};

const duckdb_up = async (): Promise<boolean> => {
	const response = await fetch(DB_API, { method: 'POST' });
	const status = await response.text();

	return status === '1';
};

const main = async () => {
	if (!(await duckdb_up())) {
		console.error('DuckDB is down.');
		process.exit(1);
	}

	const consumer = new KafkaConsumer(TOPIC);
	await consumer.connect(consumerCallback);

	process.on('exit', () => {
		consumer.disconnect();
	});
}

main();
