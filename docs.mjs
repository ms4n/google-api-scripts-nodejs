import { google } from "googleapis";
import drive from "./drive.mjs";

import dotenv from "dotenv";
dotenv.config();

const accessToken = process.env.ACCESS_TOKEN;
const auth = new google.auth.OAuth2();
auth.setCredentials({ access_token: accessToken });

// const service = google.drive({ version: "v3", auth });
const service = google.docs({ version: "v1", auth });

async function createDocFile(parentFolderId = undefined) {
  const fileMetadata = {
    name: "Whatsapp NoteSync",
    mimeType: "application/vnd.google-apps.document",
  };

  if (parentFolderId !== undefined) {
    fileMetadata.parents = [parentFolderId];
  }

  if (parentFolderId === undefined) {
    let parentFolder = await drive.findFolder("WhatNot");
    fileMetadata.parents = [parentFolder];
    if (!parentFolder) {
      parentFolder = await drive.createFolder("WhatNot");
      fileMetadata.parents = [parentFolder];
    }
  }

  try {
    const doc = await service.files.create({
      resource: fileMetadata,
      fields: "id",
    });
    console.log("Doc Id:", doc.data.id);
    return doc.data.id;
  } catch (err) {
    console.error(err.errors);
    throw err;
  }
}

// console.log(await createDocFile());

const date = new Date(); // Get the current date and time
const formattedDate = date.toLocaleDateString("en-us", {
  weekday: "short",
  year: "numeric",
  month: "short",
  day: "numeric",
});

// To add hours and minutes:
const hours = ("0" + date.getHours()).slice(-2);
const minutes = ("0" + date.getMinutes()).slice(-2);
const seconds = ("0" + date.getSeconds()).slice(-2);
const formattedTime = `${hours}:${minutes}:${seconds}`;

const requests = [
  {
    insertText: {
      endOfSegmentLocation: { segmentId: "" }, // Appends to the body segment
      text: `Date: ${formattedTime} ${formattedDate} \nFor a long time, I've used libraries like Date-fns whenever I need to format dates in JavaScript. But it gets really weird whenever I do this in small projects that require simple date formats which JavaScript offers by default.\n\n`,
    },
  },
];

const doc = await service.documents.batchUpdate({
  documentId: "1xxY7qQXXXHCTtoVSyjnRK9_BHGHnOCY4JXfSQuoNwiQ",
  resource: { requests: requests },
});

console.log(doc.status);
