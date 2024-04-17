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

const date = Date.now().toString();

const requests = [
  {
    insertText: {
      endOfSegmentLocation: { segmentId: "" },
      text: `In Google Docs, multiple lines of text usually belong within a paragraph. It's generally preferable to manipulate paragraphs as a whole using the API (e.g., inserting a new paragraph with your text) if you want more styling control over the spacing.\t\t ${date} \n\n`,
    },
  },
  {
    insertText: {
      endOfSegmentLocation: { segmentId: "" },
      text: `Date: ${date}\nWe calculate the endIndex. This is a simplified approach; you'll likely need adjustments if your document has complex structures (headers, footers, multiple text elements).\n\n`,
    },
  },
  {
    insertText: {
      endOfSegmentLocation: { segmentId: "" },
      text: "text3\n\n",
    },
  },
];

const doc = await service.documents.batchUpdate({
  documentId: "1xxY7qQXXXHCTtoVSyjnRK9_BHGHnOCY4JXfSQuoNwiQ",
  resource: { requests: requests },
});

console.log(doc);
