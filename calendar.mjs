import { google } from "googleapis";

import dotenv from "dotenv";
dotenv.config();

const accessToken = process.env.ACCESS_TOKEN;
const auth = new google.auth.OAuth2();
auth.setCredentials({ access_token: accessToken });

const calendar = google.calendar({ version: "v3", auth });

const event = {
  summary: "Discuss about UI with the UI Team leads",
  description: "A meeting to discuss UI matters with the UI Team leads.",
  start: {
    dateTime: "2024-04-14T14:00:00Z",
  },
  end: {
    dateTime: "2024-04-14T15:00:00Z",
  },
};

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
