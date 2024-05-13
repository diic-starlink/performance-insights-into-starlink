# Cloudflare Radar Harvester

This is the harvester for Starlink Latency Data from Cloudflare Radar.

It gathers data from the Cloudflare Radar API and pushes it to Kafka.

## How to run

The Cloudflare Radar API requires an API key (see [here](https://developers.cloudflare.com/fundamentals/api/get-started/create-token/)). It is expected to be stored in the same folder as this README in a file called `.env`.

The file should look like this:

```txt
API_KEY=your_api_key_here
```
