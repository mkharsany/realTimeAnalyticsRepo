const { EventHubProducerClient } = require("@azure/event-hubs");
var moment = require('moment');
 
const connectionString = "amqps://key_95c1dd08-8dd3-4508-ae42-ac4b78290e74:11bfPCNsH%2BYXpBtECeYuZmaUZJNq6t4KP%2BAEhLF7czY%3D@esehamd9ce527518fgd1xa.servicebus.windows.net:5671/?verify=verify_none";
const entityName = "es_639742a5-cf0f-495a-a29c-e44fd04133b5";
 
//Generate event data
function getRowData(id) {
    const time = moment().toISOString();
    const deviceID = id + 100;
    const humidity = Math.round(Math.random()*(65-35) + 35);
    const temperature = Math.round(Math.random()*(37-20) + 20);
 
    return {"entryTime":time, "messageId":id, "temperature":temperature, "humidity":humidity, "deviceID":deviceID};
  }
 
function sleep(ms) {  
    return new Promise(resolve => setTimeout(resolve, ms));  
  }
 
async function main() {
    // Create a producer client to send messages to the eventstream.
    const producer = new EventHubProducerClient(connectionString, entityName);
 
    // There are 10 devices. They're sending events nearly every second. So, there are 10 events in one batch.
    // The event counts per batch. For this case, it's the sensor device count.
    const batchSize = 10;
    // The event batch count. If you want to send events indefinitely, you can increase this number to any desired value.
    const batchCount = 50;
 
    // Generating and sending events...
    for (let j = 0; j < batchCount; ++j) {
        const eventDataBatch = await producer.createBatch();
        for (let k = 0; k < batchSize; ++k) {
            eventDataBatch.tryAdd({ body: getRowData(k) });
        }  
        // Send the batch to the eventstream.
        await producer.sendBatch(eventDataBatch);
        console.log(moment().format('YYYY/MM/DD HH:mm:ss'), `[Send events to Fabric Eventstream]: batch#${j} (${batchSize} events) has been sent to eventstream`);
        // sleep for 1 second.
        await sleep(1000);
    }
    // Close the producer client.
    await producer.close();
    console.log(moment().format('YYYY/MM/DD HH:mm:ss'), `[Send events to Fabric Eventstream]: All ${batchCount} batches have been sent to eventstream`);
}
 
main().catch((err) => {
    console.log("Error occurred: ", err);
});