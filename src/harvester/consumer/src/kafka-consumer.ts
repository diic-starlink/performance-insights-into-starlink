import { Consumer, EachMessageHandler, Kafka, KafkaConfig } from "kafkajs";

class KafkaConsumer {
	private kafka: Kafka;
	private consumer: Consumer;
	private topic: string;
	private RECONNECT_RETRIES = 5;

	constructor(topic: string) {
		const kafka_config: KafkaConfig = {
			clientId: 'measurement-consumer',
			brokers: ['kafka:9092'], // Dependent on the Docker network
		};

		this.kafka = new Kafka(kafka_config);
		this.topic = topic;
	}

	public async connect(callback: EachMessageHandler, retries = 0) {
		try {
			this.consumer = this.kafka.consumer({ groupId: 'measurement-group' });

			await this.consumer.connect();
			await this.consumer.subscribe({ topic: this.topic, fromBeginning: true });

			await this.consumer.run({ eachMessage: callback });
		} catch (error) {
			(retries < this.RECONNECT_RETRIES) ? console.log('Failed to connect to Kafka. Retrying ...') : console.error(error);

			// Up to 5 retries. When failing to connect to Kafka, wait 10 seconds before retrying.
			if (retries < this.RECONNECT_RETRIES) {
				await new Promise(resolve => setTimeout(resolve, 10000));
				await this.connect(callback, retries + 1);
			}
		}
	}

	public async disconnect() {
		await this.consumer.disconnect();
	}
}

export default KafkaConsumer;
