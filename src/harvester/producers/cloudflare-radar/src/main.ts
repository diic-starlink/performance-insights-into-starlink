import dotenv from 'dotenv';
import { storePingData } from './store.controller';
dotenv.config();

const API_KEY = process.env.API_KEY;
const ASN = 14593;
const INTERVAL = "15m";
const API_URL = 'https://api.cloudflare.com/client/v4/radar/quality/iqi/timeseries_groups';
const START_TIMESTAMP = new Date("2024-03-01T00:00:00.000Z");
const STOP_TIMESTAMP = new Date("2024-03-31T00:00:00.000Z");

interface DataPoint {
	source_platform: string,
	timestamp: number,
	step: number,
	result: string,
	msm_id: number,
	prb_id: number,
	sent: number,
	rcvd: number
};

const main = async () => {
	if (!API_KEY) {
		console.error('API_KEY not found in environment variables. Cannot connect to Cloudflare Radar without API Key. Terminating ...');
		process.exit(1);
	}
	const header = {
		"Authorization": `Bearer ${API_KEY}`
	};

	const API_REQUEST = `${API_URL}?aggInterval=${INTERVAL}&asn=${ASN}&metric=latency&dateStart=${START_TIMESTAMP.toISOString()}&dateEnd=${STOP_TIMESTAMP.toISOString()}&format=JSON&name=starlink_results`;

	const response = await fetch(API_REQUEST, {
		method: 'GET',
		headers: header
	});

	const data = await response.json();
	if (!data.success) {
		console.error("Couldn't fetch data.")
		process.exit(1);
	}

	let results: DataPoint[] = [];
	const series = data.result.starlink_results;
	for (let i = 0; i < series.timestamps.length; ++i) {
		let point: DataPoint = {
			timestamp: series.timestamps[i],
			result: JSON.stringify({
				p25: series.p25[i],
				p50: series.p50[i],
				p75: series.p75[i]
			}),
			source_platform: "Cloudflare RADAR (timeseries groups)",
			step: 15 * 60,
			msm_id: 0,
			prb_id: 0,
			sent: 0,
			rcvd: 0
		};
		results.push(point);
	}

	storePingData(results);
};

main();
