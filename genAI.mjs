import { GoogleGenerativeAI } from "@google/generative-ai";
import { DateTime } from "luxon";

import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-pro" });

async function generateCalendarEventFromMessage(message) {
  const now = DateTime.now().setZone("Asia/Kolkata");
  const currentDateTimeISO = now.toISO();
  const dayOfWeek = now.toLocaleString(DateTime.DATE_HUGE);

  console.log(currentDateTimeISO, dayOfWeek);

  const prompt = `
  Today's date and time: ${currentDateTimeISO} 
  Today's day of the week: ${dayOfWeek}

  User Message: ${message}

  Instructions: Extract the following information from the user message and generate a JSON object in the specified format:
  
  * summary: A concise title for the event.
  * description: A brief description of the meeting's purpose (optional).
  * start: The date and time the meeting starts.
  * end: The date and time the meeting ends (assume a default duration of 1 hour if not explicitly mentioned).
  * Both the end and start time must be in ISO format with 'Z' timezone (e.g., 2024-04-15T15:00:00Z)
  * Do not format the result as JSON, just output string, strictly avoid trailing comma."
  
  JSON Format:
  {
    "summary":"",
    "description":"",
    "start":{
       "dateTime":""
    },
    "end":{
       "dateTime":""
    }
 }`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  // console.log(text);
  const jsonObject = JSON.parse(text);
  console.log(jsonObject);

  return jsonObject;
}

export default generateCalendarEventFromMessage;
