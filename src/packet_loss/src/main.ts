import ping, { pingOptions, pingResponse } from "pingman";
import fs from "fs";

const TARGET = "google.com";
const ECHOS = 30;
const INTERVAL = 1;
const PARALLEL_PINGS = 10;

/**
 * Parse the output of the ping command.
 * For each line, we need to extract whether the packet was lost or not.
 */
const parse_output = (output: string) => {
	const lines = output.split("\n");

	let csv = "";
	// Skip the first line and the last 4 lines, as they only summarize the results.
	// However, summary is not the target of this function.
	for (let i = 1; i < lines.length - 5; i++) {
		const line = lines[i];
		if (line.includes(" time=")) {
			csv += `${i},false,TIMESTAMPPLACEHOLDER\n`;
		} else {
			csv += `${i},true,TIMESTAMPPLACEHOLDER\n`;
		}
	}

	return csv;
};

interface PingResponse {
	data: pingResponse;
	start_timestamp: number;
};

const perform_ping = async (): Promise<PingResponse> => {
	const ping_options = {
		IPV4: true,
		logToFile: false,
		bufferSize: 32,
		numberOfEchos: ECHOS,
		interval: INTERVAL,
	};

	const timestamp = Date.now();
	const response = await ping(TARGET, ping_options);

	return {
		data: response,
		start_timestamp: timestamp,
	};
};

let final_csv = "Number,PacketLost,Timestamp\n";
const main = async () => {
	for (let i = 0; i < PARALLEL_PINGS; i++) {
		perform_ping().then((res: PingResponse) => {
			let csv = parse_output(res.data.output);
			for (let j = res.start_timestamp; j <= res.start_timestamp + (ECHOS * INTERVAL); j += INTERVAL) {
				csv = csv.replace("TIMESTAMPPLACEHOLDER", j.toString());
			}
			final_csv += csv;
		});
	}
};

process.on("exit", () => {
	fs.writeFileSync("packet_loss.csv", final_csv);
});

main();
