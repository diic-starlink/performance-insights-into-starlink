import KafkaProducer from "./kafka-producer";
import { IDs } from "./measurement-ids";

const TOPIC = "measurements";

const URL = "https://atlas.ripe.net/api/v2/";

const ripe_up = async () => {
	const response = await fetch(URL);
	if (response.status !== 200) {
		return false;
	}
	return true;
};

const main = async () => {
	if (!(await ripe_up())) {
		console.error("RIPE ATLAS is down.");
		process.exit(1);
	}

	const producer = new KafkaProducer(TOPIC);
	await producer.connect();

	for (const msm_id of IDs) {
		const response = await fetch(URL + "measurements/" + msm_id);
		const data = await response.json();
		const result_url = data.result;

		const results = await (await (fetch(result_url))).json();
		for (const result of results) {
			const message = JSON.stringify(result);
			await producer.send(message);
		}
	}

	process.on("exit", () => {
		producer.disconnect();
	});

	console.log("Single Measurements sent to Kafka. Terminating ...");
};

main();
