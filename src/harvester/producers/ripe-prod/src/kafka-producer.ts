import { Admin, Kafka, KafkaConfig, Producer } from "kafkajs";

class KafkaProducer {
	private kafka: Kafka;
	private producer: Producer;
	private topic: string;
	private admin: Admin;

	constructor(topic: string) {
		const kafka_config: KafkaConfig = {
			clientId: "ripe-atlas-producer",
			brokers: ["kafka:9092"], // Dependent on the Docker network
		};

		this.kafka = new Kafka(kafka_config);
		this.topic = topic;
		this.admin = this.kafka.admin();
	}

	public async connect() {
		this.producer = this.kafka.producer();
		await this.producer.connect();

	}

	public async disconnect() {
		await this.producer.disconnect();
	}

	public async produce(messages: string[]) {
		for (const message of messages) {
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
}

export default KafkaProducer;
