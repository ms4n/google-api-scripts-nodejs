import { google } from "googleapis";
import fs from "fs";
import mime from "mime-types";

import dotenv from "dotenv";
dotenv.config();

const accessToken = process.env.ACCESS_TOKEN;
const auth = new google.auth.OAuth2();
auth.setCredentials({ access_token: accessToken });

const service = google.drive({ version: "v3", auth });

async function findFolder(folderName, parentFolderId = undefined) {
  folderName = folderName.replace(/'/g, "\\'");

  const parentCondition =
    parentFolderId !== undefined ? `and '${parentFolderId}' in parents` : "";

  const queryString = `mimeType = 'application/vnd.google-apps.folder' and name = '${folderName}' ${parentCondition}`;

  try {
    const res = await service.files.list({
      q: queryString,
      spaces: "drive",
      fields: "nextPageToken, files(id, name)",
    });

    const files = res.data.files;

    const folderId = files.length > 0 ? files[0].id : null;
    console.log(
      folderId !== null ? `Folder Found! ${folderId}` : "No folders found!"
    );
    return folderId;
  } catch (err) {
    console.error(err);
  }
}

async function createFolder(folderName, parentFolderId = undefined) {
  const fileMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
  };

  if (parentFolderId !== undefined) {
    fileMetadata.parents = [parentFolderId];
  }

  try {
    const file = await service.files.create({
      resource: fileMetadata,
      fields: "id",
    });
    console.log("Folder Id:", file.data.id);
    return file.data.id;
  } catch (err) {
    console.error(err.errors);
    throw err;
  }
}

async function uploadFile(
  filePath,
  fileName,
  parentFolderName,
  subFolderName = undefined
) {
  const fileMimeType = mime.lookup(filePath);

  if (subFolderName === undefined) {
    subFolderName = `${fileMimeType.split("/")[0]} files`;
  }

  try {
    let parentFolder = await findFolder(parentFolderName);
    if (!parentFolder) {
      parentFolder = await createFolder(parentFolderName);
    }

    let subFolder = await findFolder(subFolderName, parentFolder);
    if (!subFolder) {
      subFolder = await createFolder(subFolderName, parentFolder);
    }

    //upload
    const fileMetadata = {
      name: fileName,
      parents: [subFolder],
    };

    const media = {
      mimeType: fileMimeType,
      body: fs.createReadStream(filePath),
    };

    const file = await service.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id",
    });
    console.log("File Id:", file.data.id);
    return file.data.id;
  } catch (err) {
    console.error("Upload Error: ", err);
  }
}

await uploadFile("files/bike.jpg", "bike.jpg", "WhatNot");
