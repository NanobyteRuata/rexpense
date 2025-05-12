#!/bin/bash
echo 'Waiting for Kafka to be ready...'
cub kafka-ready -b kafka:29092 1 30
echo 'Creating Kafka topics...'

kafka-topics --create --if-not-exists --topic user_service_events --bootstrap-server kafka:29092 --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --topic transaction_service_events --bootstrap-server kafka:29092 --partitions 1 --replication-factor 1

echo 'Kafka topics created successfully'