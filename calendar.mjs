import { google } from "googleapis";
import generateCalendarEventFromMessage from "./genAI.mjs";

import dotenv from "dotenv";
dotenv.config();

const accessToken = process.env.ACCESS_TOKEN;
const auth = new google.auth.OAuth2();
auth.setCredentials({ access_token: accessToken });

const calendar = google.calendar({ version: "v3", auth });

const event = await generateCalendarEventFromMessage(
  "Team brainstorming session about product roadmap on Friday at 9 am - let's get creative!"
);

async function createCalendarEvent() {
  try {
    await calendar.events.insert({
      auth: auth,
      calendarId: "primary",
      resource: event,
    });

    console.log("Calender Event created succesfully!");
  } catch (err) {
    console.error(err.errors);
  }
}

await createCalendarEvent();
