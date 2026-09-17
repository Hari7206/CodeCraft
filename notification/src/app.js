import express from "express";
import morgan from "morgan";
import {sendEmail} from "./email.js";
import channel from "./mq.js";



const app = express();

app.get("/", (req, res) => {    
   res.send("Hello  from notification service!");
});

app.get("/_status/healthz", (req, res) => {
    res.status(200).send("OK");
});

app.get("/_status/readyz", (req, res) => {
    res.status(200).send("OK");
});

channel.consume("auth_notification_queue", async (msg) => {
  if(msg !== null) {
    const messageContent =  msg.content.toString();
    console.log("Received message from queue:", messageContent);


    try {
      const { userId  , timestamp , email } = JSON.parse(messageContent);
      const subject = "New Login  Notification";
      const html = `<p>Hello,</p><p>We noticed a new login to your account at ${timestamp}. If this was you, you can safely ignore this message. If you did not log in, please secure your account immediately.</p>`;
      await sendEmail(email, subject, text , html);
      channel.ack(msg);
    } catch (error) {
      console.error("Error processing message from queue:", error);
      channel.nack(msg, false, false);
    }
  } else {
      console.log("Consumer cancelled by server");
  }
});

export default app;