import Redis from "ioredis";
import {deletePod} from "../kubernetes/pod.js";
import {deleteService} from "../kubernetes/service.js";

const redis = new Redis(process.env.REDIS_URL);

const subcriber = new Redis(process.env.REDIS_URL);



export async function createSandboxKey(sandboxId) {
    await redis.set(`sandbox:${sandboxId}`, JSON.stringify({ 
        status: "active"
    
     }) , 'EX', 120)
    }
subcriber.config('SET', 'notify-keyspace-events', 'Ex')

subcriber.subscribe('__keyevent@0__:expired')

subcriber.on("message" , async ( channel, message) => {
   console.log(`key ${message} has expired`);

   const sandboxId = message.split(':')[1];
  });



  export  default {  subcriber }