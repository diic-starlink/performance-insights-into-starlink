import KafkaProducer from "./kafka-producer";
import { Measurement, Probe, ProbeStatus, string_to_probestatus, stringify_msms } from "./util";

const URL = "https://atlas.ripe.net/api/v2/";
const ASN = 14593;

const ripe_up = async () => {
	const response = await fetch(URL);
	if (response.status !== 200) {
		return false;
	}
	return true;
};

/**
 * Get all probes on RIPE ATLAS that have a Starlink ASNv4.
 * For each probe, a Probe Object is created.
 *
 * @returns
 * 		Returns a list of probes.
 */
const get_starlink_probes = async () => {
	const url = URL + "probes/?asn_v4=" + ASN;
	let response = await (await fetch(url)).json();

	const probes: Probe[] = [];
	while (probes.length < response.count) {
		for (const probe of response.results) {
			probes.push({
				country: probe.country_code,
				geometry: probe.geometry.coordinates,
				id: probe.id,
				status: string_to_probestatus(probe.status.name),
				ipv4: probe.address_v4,
				last_page: 1,
				last_msm_id: 0,
			});
		}

		if (response.next) {
			response = await (await fetch(response.next)).json();
		} else {
			break;
		}
	}

	return probes;
};

/**
 * Check if a probe is connected.
 *
 * @param probe 
 * 		The probe to check. Only the probe ID is used.
 * @returns
 * 		Returns True, if the probe is connected and False is otherwise.
 */
const is_probe_up = async (probe: Probe) => {
	const response = await fetch(URL + "probes/" + probe.id);
	const status = string_to_probestatus((await response.json()).status.name);
	return status === ProbeStatus.CONNECTED;
}

const get_next_measurement_page = async (probe: Probe) => {
	const url = URL + "probes/" + probe.id + "/measurements?page=" + probe.last_page;
	const response = await (await fetch(url)).json();

	let measurements: Measurement[] = [];
	for (const measurement of response.results) {
		if (measurement.id < probe.last_msm_id) continue;

		const msm_url = measurement.measurement;
		const msm_response = await (await fetch(msm_url + "/results")).json();

		measurements.push({
			measurement_id: msm_response.msm_id,
			probe_id: msm_response.prb_id,
			timestamp: msm_response.timestamp,
			from: msm_response.src_addr,
			to: msm_response.dst_addr,
			protocol: msm_response.proto,
			type: msm_response.type,
			group_id: msm_response.group_id,
			stored_timestamp: msm_response.stored_timestamp,
			qbuf: msm_response.qbuf,
			result: msm_response.result,
		});
	}

	return measurements;
}

const main = async () => {
	if (!(await ripe_up())) {
		console.error("RIPE ATLAS is down.");
		process.exit(1);
	}


	const probes = await get_starlink_probes();

	// Wait for Kafka to be ready and finished its dumb leadership election.
	await new Promise(resolve => setTimeout(resolve, 20000));
	const kafka_producer = new KafkaProducer("measurements");
	await kafka_producer.connect();

	while (true) {
		for (let i = 0; i < probes.length; i++) {
			const probe = probes[i];
			if (await is_probe_up(probe)) {
				console.log("Probe " + probe.id + " is up. Looking at page " + probe.last_page + ".");
				const measurements = stringify_msms(await get_next_measurement_page(probe));

				await kafka_producer.produce(measurements);

				probes[i].last_page++;
			} else {
				console.log("Probe " + probe.id + " is down.");
			}
		}

		// Ethical crawling.
		await new Promise(resolve => setTimeout(resolve, 10000));
	}
	kafka_producer.disconnect();
};

main();
