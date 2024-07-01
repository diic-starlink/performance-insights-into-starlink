import dotenv from 'dotenv';
import { storePingData } from './store.controller';
dotenv.config();

const API_KEY = process.env.API_KEY;
const ASN = 14593;
const INTERVAL = "15m";
const API_URL = 'https://api.cloudflare.com/client/v4/radar/quality/iqi/timeseries_groups';

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

	for (let year of [2022, 2023, 2024]) {
		for (let month = 1; month <= 11; ++month) {
			if (year === 2024 && month === 7) break;

			let smonth = month < 10 ? `0${month}` : `${month}`;
			let smonth_next = (month + 1) < 10 ? `0${month + 1}` : `${month + 1}`;

			const START_TIMESTAMP = new Date(`${year}-${smonth}-01T00:00:00.000Z`);
			let STOP_TIMESTAMP = new Date(`${year}-${smonth_next}-01T00:00:00.000Z`);
			if (smonth === '12') {
				STOP_TIMESTAMP = new Date(`${year + 1}-01-01T00:00:00.000Z`);
			}

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

			// Wait for 10 seconds to ensure that the database API is ready.
			await (new Promise((resolve) => { setTimeout(resolve, 10000) }));

			const results: DataPoint[] = [];
			const series = data.result.starlink_results;
			for (let i = 0; i < series.timestamps.length; ++i) {
				const point: DataPoint = {
					timestamp: Date.parse(series.timestamps[i]),
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
		}
	}
};

main();
