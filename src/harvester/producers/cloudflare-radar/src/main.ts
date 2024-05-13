import dotenv from 'dotenv';
import KafkaProducer from './kafka-producer';
dotenv.config();

const TOPIC = 'measurements';
const API_KEY = process.env.API_KEY;
const ASN = 14593;
const INTERVAL = "1d";
const SLEEPTIME = 1000 * 60 * 60 * 24; // 24 hours in ms
const API_URL = 'https://api.cloudflare.com/client/v4/radar/quality/iqi/summary';

const API_REQUEST = `${API_URL}?interval=${INTERVAL}&asn=${ASN}&metric=latency&dateRange=${INTERVAL}&format=JSON`;

const producer = new KafkaProducer(TOPIC);
process.on('exit', () => {
	producer.disconnect();
});

const main = async () => {
	if (!API_KEY) {
		console.error('API_KEY not found in environment variables. Cannot connect to Cloudflare Radar without API Key. Terminating ...');
		process.exit(1);
	}

	await producer.connect();

	const header = {
		"Authorization": `Bearer ${API_KEY}`
	};
	const response = await fetch(API_REQUEST, {
		method: 'GET',
		headers: header
	});
	const data = await response.json();
	data.source_platform = "Cloudflare Radar";
	const message = JSON.stringify(data);

	// Produce the results from Cloudflare and disconnect.
	await producer.send(message);
	await producer.disconnect();

	await new Promise(resolve => setTimeout(resolve, SLEEPTIME));
	main();
};

main();
