### Using Localstack
basic message: `aws --endpoint-url=http://localhost:4568 sqs send-message --queue-url http://localhost:4568/000000000000/store-team_queue --message-body 'message body string'`

products.product.create: `aws --endpoint-url=http://localhost:4568 sqs send-message --queue-url http://localhost:4568/000000000000/store-team_queue --message-body file://scripts/localstack/sample-chad-joke-tell.json`

purging the queue: `aws --endpoint-url=http://localhost:4568 sqs purge-queue --queue-url http://localhost:4568/000000000000/store-team_queue`
