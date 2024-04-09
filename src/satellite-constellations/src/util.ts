const NORAD_URL = "https://n2yo.com/";

// The numbers are from Norad itself.
// They are needed for the domain. 
// Following style: <NORADURL>/satellites/?c=<number>
enum Constellations {
	NAVSTAR = 20, // GPS
	IRIDIUM = 15,
	BEIDOU = 35,
	STARLINK = 52,
	GALILEO = 22,
	ONEWEB = 53,
	ORBCOMM = 16,
	INTELSAT = 11
};

interface Satellite {
	name: string;
	norad_id: number;
	launch_date: Date;
}

interface ConstellationData {
	constellation: Constellations;
	satellites: Satellite[];
/*
	total_satellites(): number;
	name(): string;
	to_csv(): string;
*/}

export {
	NORAD_URL,
	Constellations,
	Satellite,
	ConstellationData
}
