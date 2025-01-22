const { google } = require("googleapis");
const streamifier = require("streamifier");
const { Readable } = require("stream"); // Import stream module
const fs = require("fs");
const path = require("path");

const SCOPE = ["https://www.googleapis.com/auth/drive"];
const KEYFILEPATH = path.join(__dirname, "../../credential/apiKey.json");

class GoogleDrive {
  extractFileIdFromUrl(url) {
    const regex = /(?:uc\?id=|d\/)([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    if (match && match[1]) {
      return match[1];
    } else {
      throw new Error("Invalid Google Drive URL");
    }
  }

  async getMimeType(base64String) {
    const prefix = base64String.substring(0, 30); // Check the first few characters
    if (prefix.includes("iVBORw0KGgo")) return "image/png";
    if (prefix.includes("/9j/")) return "image/jpeg";
    if (prefix.includes("R0lGOD")) return "image/gif";
    return "application/octet-stream"; // Default if unknown
  }

  // Authenticate with Google Drive
  async authorize() {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: SCOPE,
    });

    return auth;
  }

  drive() {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: SCOPE,
    });
    return google.drive({ version: "v3", auth});
  }
  // Function to convert Buffer to Readable Stream
  bufferToStream(buffer) {
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null); // End of stream
    return stream;
  }

  // Convert Base64 to Buffer and Upload
  async uploadBase64Image(base64String) {
    const buffer = Buffer.from(base64String, "base64");
    // const mimeType = this.getMimeType(base64String);
    const mimeType = "image/png"; // Replace with appropriate MIME type;
    const fileName =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + ".png";

    const fileMetadata = {
      name: fileName,
      parents: ["1sG6oXvX3AYfQIrHd83769FY6nwKR0LDG"], // Folder ID where the image will be uploaded
    };

    const media = {
      mimeType: mimeType, // Adjust to your image type
      body: this.bufferToStream(buffer),
    };

    try {
      const response = await this.drive().files.create({
        resource: fileMetadata,
        media: media,
        fields: "id, webContentLink",
      });
      console.log("File ID:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw Error("Error uploading file:", error.message);
    }
  }

  async uploadToDrive(base64String) {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: SCOPE,
    });
    const drive = google.drive({ version: "v3", auth });
    const fileName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ".png";

    const fileMetaData = {
      name: fileName,
      parents: ["1sG6oXvX3AYfQIrHd83769FY6nwKR0LDG"], // Replace with your folder ID
    };

    const buffer = Buffer.from(base64String, "base64");
    const mimeType = "image/png"; // Replace with appropriate MIME type;

    const media = {
      mimeType: mimeType,
      body: this.bufferToStream(buffer),
    };

    const response = await drive.files.create({
      resource: fileMetaData,
      media: media,
      fields: "id, webContentLink",
    });

    return response.data;
  }

  async deleteFromGoogleDrive(fileId) {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: SCOPE,
    });
    try {
      await this.drive().files.delete({ fileId });
      return {
        status: true,
        message: "deleted",
      };
    } catch (error) {
      console.error("Failed to delete file from Google Drive:", error.message);
      throw error; // Propagate the error for proper handling in the service layer
    }
  }

  async streamAuthorize() {
    // Load the service account credentials from the JSON file
    const credentials = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../../credential/apiKey.json"))
    ); // Path to your service account credentials file

    // Set up the JWT auth client
    const auth = new google.auth.JWT(
      credentials.client_email, // Service account email
      null, // Key file (not needed for JWT auth)
      credentials.private_key, // Service account private key
      ["https://www.googleapis.com/auth/cloud-platform"], // Scopes for the API you are working with
      null // Subject if you're impersonating another account
    );

    // Use the auth client to authorize
    await auth.authorize();
    return auth;
  }

  // Example of how you might use the authorization in your API calls
  async someApiCall() {
    const auth = await streamAuthorize();
    const service = google.someApi({ version: "v1", auth });

    // Now you can make authorized API calls, for example:
    const response = await service.someResource.list(); // Replace with actual API call
    return response.data;
  }
}

module.exports = new GoogleDrive();
