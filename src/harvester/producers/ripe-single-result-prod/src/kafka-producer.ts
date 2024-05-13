import { Kafka, KafkaConfig, Producer } from "kafkajs";

class KafkaProducer {
	private kafka: Kafka;
	private producer: Producer;
	private topic: string;

	constructor(topic: string) {
		const kafka_config: KafkaConfig = {
			clientId: "ripe-atlas-single-measurement-producer",
			brokers: ["kafka:9092"], // Dependent on the Docker network
		};

		this.kafka = new Kafka(kafka_config);
		this.topic = topic;
	}

	public async connect() {
		this.producer = this.kafka.producer();
		await this.producer.connect();
	}

	public async disconnect() {
		await this.producer.disconnect();
	}

	public async send(message: string) {
		await this.producer.send({
			topic: this.topic,
			messages: [
				{
					value: message,
					headers: { source: "ripe-atlas" }
				},
			],
		});
	}
}

export default KafkaProducer;
