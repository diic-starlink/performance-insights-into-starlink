import fs from "fs";
import {
	NORAD_URL,
	Constellations,
	Satellite,
	ConstellationData,
} from "./util";

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

const CURRENT_YEAR = new Date().getFullYear();
const table_regex =
	/\<table\sclass="footable\stable"\sid="categoriestab">(.*)<\/table>/gms;
const row_regex = /<tr[\sbgcolor="#F4]*>.*<\/tr>/gm;
const cell_regex = />([^<>]+)</gm;


const norad_up = async () => {
	const response = await fetch(NORAD_URL);
	if (response.status !== 200) {
		return false;
	}
	return true;
};

const url_of_satellite = (norad_id: number) => {
	return NORAD_URL + "satellite/?s=" + norad_id;
};

const fetch_satellite = async (norad_id: number) => {
	return (await fetch(url_of_satellite(norad_id))).text();
}

const is_404 = (html: string) => {
	// Norad returns not really 404 on invalid satellite id.
	// It returns an empty satellite page, dating the launch date to January 1, 1970.
	// Aside from that, there were no satellites launched on January 1, 1970.
	return html.includes("January 1, 1970");
}

// Matches dates in the format: January 1, 1970
const DATE_REGEX = /[A-Z][a-z]+\s[0-9][0-9]?,\s[0-9][0-9][0-9][0-9]/;
const get_launch_date = (html: string) => {
	const line = /.*Launch\sdate.*/.exec(html);
	const date = DATE_REGEX.exec(line[0]);
	return date[0];
}

const get_decay_date = (html: string): boolean | string => {
	const line = /.*Decay\sdate.*/.exec(html);
	if (!line) return false;

	const date = DATE_REGEX.exec(line[0]);
	if (date) return date[0];
	return false;
}

const get_name = (html: string) => {
	const line = /<H1>([^<]*)<\/H1>/.exec(html);
	console.log(line);
}

const crawl_satellites = async () => {
	let satellites: Satellite[] = [];
	let id = 1;

	let html = await fetch_satellite(id);
	while (!is_404(html)) {
		// Build Satellite Object from HTML
		const launch_date = get_launch_date(html);
		const decay_date = get_decay_date(html);
		const name = get_name(html);

		++id;
		html = await fetch_satellite(id);
	}
};

const get_constellation_data = async (
	constellation: Constellations
): Promise<ConstellationData | undefined> => {
	const URL = NORAD_URL + "satellites/?c=" + constellation;
	let constellation_data: ConstellationData = {
		constellation: constellation,
		satellites: [],
	};

	let data: ConstellationData;

	let response = await fetch(URL);
	if (response.status !== 200) {
		console.error(`Could not reach ${URL}.`);
		process.exit(1);
	}

	const html: string = await response.text();
	const table = html.match(table_regex)![0] as string;
	if (!table) {
		console.error(
			`I was not able to parse the information provided for ${Constellations[constellation]}`
		);
		process.exit(1);
	}

	for (const row_matches of table.matchAll(row_regex)) {
		let ctr = 0;
		let name = "";
		let norad_id = 0;
		let launch_date = "";

		for (const cell of row_matches[0].matchAll(cell_regex)) {
			switch (ctr) {
				case 0:
					name = cell[1];
					++ctr;
					break;
				case 1:
					norad_id = parseInt(cell[1]);
					++ctr;
					break;
				case 2: // Int'l Code. Not needed
					++ctr;
					break;
				case 3:
					launch_date = cell[1];
					++ctr;
					break;
				default:
					ctr = (ctr + 1) % 7; // Disregard infos like Int'l Code, Period and PRN
			}
		}

		const satellite: Satellite = {
			name: name,
			norad_id: norad_id,
			launch_date: new Date(Date.parse(launch_date)),
			decay_date: false
		};
		constellation_data.satellites.push(satellite);
	}

	constellation_data.satellites.pop();
	return constellation_data;
};

const accumulated_satellites_over_years = (
	constellation: ConstellationData,
	year_start: number
): number[] => {
	const satellites = constellation.satellites;

	let years: number[] = [];
	for (let i = 0; i <= CURRENT_YEAR - year_start; ++i) {
		years.push(0);
	}

	for (const satellite of satellites) {
		const ind = CURRENT_YEAR - Math.max(year_start, satellite.launch_date.getFullYear());
		years[ind] = years[ind] + 1;
	}
	years = years.reverse();

	for (let i = 1; i < years.length; ++i) {
		years[i] += years[i - 1];
	}

	return years;
};

const main = async () => {
	await crawl_satellites();
};

main();

