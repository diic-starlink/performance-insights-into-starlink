import {
	NORAD_URL,
	Constellations,
	Satellite,
	ConstellationData,
} from "./util";

const norad_up = async () => {
	const response = await fetch(NORAD_URL);
	if (response.status !== 200) {
		return false;
	}
	return true;
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
	const table_regex =
		/\<table\sclass="footable\stable"\sid="categoriestab">(.*)<\/table>/gms;
	const row_regex = /<tr[\sbgcolor="#F4]*>.*<\/tr>/gm;
	const cell_regex = />([^<>]+)</gm;

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
	const current_year = new Date().getFullYear();

	let years: number[] = [];
	for (let i = 0; i <= current_year - year_start; ++i) {
		years.push(0);
	}

	for (const satellite of satellites) {
		const ind = current_year - Math.max(year_start, satellite.launch_date.getFullYear());
		years[ind] = years[ind] + 1;
	}
	years = years.reverse();

	for (let i = 1; i < years.length; ++i) {
		years[i] += years[i - 1];
	}

	return years;
};

const main = async () => {
	const up = await norad_up();
	if (!up) {
		console.error("Norad Database cannot be reached.");
		process.exitCode = 1;
		return;
	}

	const cons = [
		Constellations.BEIDOU,
		Constellations.ONEWEB,
		Constellations.GALILEO,
		Constellations.IRIDIUM,
		Constellations.NAVSTAR,
		Constellations.ORBCOMM,
		Constellations.INTELSAT,
		Constellations.STARLINK
	];

	for (const con of cons) {
		const con_data = await get_constellation_data(con);
		const acc_years = accumulated_satellites_over_years(con_data, 2000);

		console.log(Constellations[con]);
		console.log(acc_years);
	}

};

main();

