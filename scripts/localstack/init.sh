#!/bin/sh
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test

ENDPOINT=http://localhost:4566

#create an sqs queue for store team service
aws --region us-west-1 --endpoint-url=${ENDPOINT} sqs create-queue --queue-name store-team_queue

#create an event bus
aws --region us-west-1 --endpoint-url=${ENDPOINT} events create-event-bus --name sibi-bus

#create a rule for our two events to send them from the event bus to the queue
aws --region us-west-1 --endpoint-url=${ENDPOINT} events put-rule --name send-to-store-team --event-bus-name sibi-bus --state ENABLED --event-pattern '{"detail-type": [ "chad.joke.tell", "brent.chuckle.emit" ]}'
aws --region us-west-1 --endpoint-url=${ENDPOINT} events put-targets --rule send-to-store-team --targets '[{ "Id": "target-id-1", "Arn": "arn:aws:sqs:us-west-1:000000000000:store-team_queue" }]'

