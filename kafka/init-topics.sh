#!/bin/bash
set -ex

# Wait for Kafka to be ready
echo "Waiting for Kafka to be ready..."
while ! nc -z kafka 29092; do
  sleep 2
done
echo "Kafka is up!"

kafka-topics --create --if-not-exists --topic user.created --bootstrap-server kafka:29092 --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --topic user.updated --bootstrap-server kafka:29092 --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --topic user.deleted --bootstrap-server kafka:29092 --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --topic user.fetch.request --bootstrap-server kafka:29092 --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --topic user.fetch.response --bootstrap-server kafka:29092 --partitions 1 --replication-factor 1

kafka-topics --create --if-not-exists --topic transaction.created --bootstrap-server kafka:29092 --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --topic transaction.updated --bootstrap-server kafka:29092 --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --topic transaction.deleted --bootstrap-server kafka:29092 --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --topic transaction.fetch.request --bootstrap-server kafka:29092 --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --topic transaction.fetch.response --bootstrap-server kafka:29092 --partitions 1 --replication-factor 1

kafka-topics --create --if-not-exists --topic budget.created --bootstrap-server kafka:29092 --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --topic budget.updated --bootstrap-server kafka:29092 --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --topic budget.deleted --bootstrap-server kafka:29092 --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --topic budget.fetch.request --bootstrap-server kafka:29092 --partitions 1 --replication-factor 1
kafka-topics --create --if-not-exists --topic budget.fetch.response --bootstrap-server kafka:29092 --partitions 1 --replication-factor 1

echo 'Kafka topics created successfully'
touch /tmp/kafka-topics-initialized