const { google } = require("googleapis");
const path = require("path");
const sheets = google.sheets("v4");
const drive = google.drive("v3");


const KEYFILEPATH = {
  type: "service_account",
  project_id: "mindful-oath-447611-g8",
  private_key_id: "5323f528f3e386daf22de16da0213fd4f121b67e",
  private_key:
    "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDh2o+Y6fhH63Qj\nRuUFR4T2uSIj1k54iK0c2tF0gN+0nq4/mM7Qq//fI75ZK2tS2kXaCvSXnzErpezt\n7LsMj445RoJbXB+51zoqWNPDsFgIQBSCR85nq6nFLaNJupkCNcTVoJy6GeAOwnks\nRKUrveqCxGV5Q0U1HHSYf7DK1XKfitUaaOPa6ztabH2ejWq7mGoYz+1SzWtcNEX7\nHumyWjcBbJmUXPbyl7EYc7ZjWsrb5YQPBwTSeWRIZf686eFcHJ060eYtRU9rirxY\nHpDB20ufInHDd4x/o2U42CB5+vYk150BHyLdRCeibFqnMDGABBjl71vGdfVEnQDM\nsnhR9nM1AgMBAAECggEAF7OFfUEUZou9eNRARXEPcYrVG9iqDHkfXZdTArxhfYVn\neNIS5hAevm50U8w8K4ovaWXb7CtvEAsOFZvRt0w7WyRcmrTMuYZuGrKOqosPefIr\nlM5vSS7ZFpGnAJ49318AJIEB4X/EpRfgenZLtQ7tlMKCeZrHIP829yfzSB3lNPu8\nyM16YOUu5aapb7YwKOp7aYWesL6klFc7Yw9eYCVmUE5kKfzBbdZLQBxJRiyV97PL\nlWERSY9FUSqVVxbdibH6SeuqSdJtG49eaBQpGX9wg3OXF2bQf42N1RhpylfgiBwC\nU5cbEAJB0uhe5E9ZpK9zL+niOSe79eML74VXGQ0/4QKBgQD48OZSwM7RZIt+fRsy\naa6JrGAbHSWj5SVgls3mSxfBb3QmFPzQOlEsHdqZwBF5dA4rHgSvhFX4t6yf9z1n\n1qBGYoWk1FAHu6XrWEHuujGCOa/dJAsld7oDydCDhsDRsIiP2VUqQv5zrbps+pt6\nZjJnz7MJkAsw09O+TpdfIHbfpQKBgQDoQhE8M5GxMUjKCXhUTsNR+L8/KnUgHKHh\narDPAv1bSIDuBWF5zDf2SesnwBVeRiUO3IyvLM2bh38dwY2OcDsbWRcvtFBGGwpk\n40DsVuP78u19Hej9sfsVli3Tmi8SwWCMaqTHobk68DPTLvHivkjiTO6Tf/1T8txv\npDFyQMPwUQKBgQDWDkbuh24PLVapWCgnrCnxpfApwGFaUbJXILVBvfZaVVzZVhih\ncFPWDIGozTf5aGq6dqBuz+sg58ce8fiyLiI5A4SJXCrIy3j7KjPfc+kYYkQvckvH\nVvDzSvjp79gjNpnmn2mU4nBrxcnU5ZUFpZTYIQeBRIPq42pibK/Kk17EJQKBgC8A\nx9omGZMBhViV6Asv0WlybMnMvt1bzgr/e365fSqPFsCUyDBM+vpV5UgrIGfuzCsg\nyTveVlHmbvxHom00G1IiioW1+RTm/giC0S3DO+pONG/AsNk+vrCUrvuG1YX3KqHg\nJy7bdNAPsn1Hn94iYj+iEBo7qbnmiWPyl6smnkCxAoGBAJq7hG/H/fsNE65KQJoT\n8rrEyjW6hz5fipJGDMT0O2SApHClLIDzueWl41Gun0p9sM+rw2KHR3K+UrEjwEVE\nRn7l6U6aXCh2QFS/gjXTAeYDbuJLghQUDGLheK6Y7UNO2M920S1rDT29z85MwGqw\np6ZT0/5bEUjeLisRWIhj9a+w\n-----END PRIVATE KEY-----\n",
  client_email: "sheet-api-628@mindful-oath-447611-g8.iam.gserviceaccount.com",
  client_id: "110562738811113501018",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/sheet-api-628%40mindful-oath-447611-g8.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

const SPREADSHEET_ID = "1G3YOWeTKl2zmBFZb98NbEn2WpJIaUW9Awd-BS8CTcjk";
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
];

// สร้าง Google Sheets client
async function getGoogleSheetsClient() {
  try {
    console.log("Using key file:", KEYFILEPATH);

    const auth = new google.auth.GoogleAuth({
      credentials: KEYFILEPATH,
      scopes: SCOPES,
    });

    const client = await auth.getClient();
    return google.sheets({ version: "v4", auth: client });
  } catch (error) {
    console.error("Google Sheets Client Error:", error);
    throw new Error(
      "Failed to initialize Google Sheets client: " + error.message
    );
  }
}

module.exports.getUsers = async (req, res) => {
  try {
    console.log("Initializing Google Sheets client...");
    const sheets = await getGoogleSheetsClient();

    console.log("Fetching from spreadsheet:", SPREADSHEET_ID);
    console.log("Using range:", "user_mock_data");
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "user_mock_data",
    });

    const rows = response.data.values || [];
    console.log("Fetched rows:", rows.length);

    const users = rows.slice(1).map((row) => ({
      id: row[0] || "",
      firstName: row[1] || "",
      lastName: row[2] || "",
      profileImage: row[3] || "",
      gender: row[4] || "",
    }));

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get users",
      error: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

module.exports.createUserData = async (req, res, next) => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: KEYFILEPATH,
      scopes: SCOPES,
    });

    const client = await auth.getClient();
    google.options({ auth: client });

    const { selectedUsers } = req.body;
    if (!selectedUsers || selectedUsers.length === 0) {
      return res.status(400).json({ message: "No users selected" });
    }

    const sortedUsers = [...selectedUsers].sort((a, b) => {
      const idA = parseInt(a[0]);
      const idB = parseInt(b[0]);
      return idA - idB;
    });
    console.log("Selected Users:", selectedUsers);

    const formattedUsers = sortedUsers.map((user) => {
      return [
        user.id, // ID
        user.firstName, // Firstname
        user.lastName, // Lastname
        user.email, // Email
        user.gender, // Gender
        user.city, // City
        user.country, // Country
        user.countryCode, // Country Code
        user.state, // State
        user.streetAddress, // Street Address
        user.jobTitle, // Job title
        user.company, // Company
        user.photo, // Photo
      ];
    });

    console.log("Formatted Users:", formattedUsers);

    const sheetResponse = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `User Export ${new Date().toLocaleDateString()}`,
        },
      },
    });

    const newSpreadsheetId = sheetResponse.data.spreadsheetId;

    const updateResponse = await sheets.spreadsheets.values.update({
      spreadsheetId: newSpreadsheetId,
      range: "Sheet1!A1",
      valueInputOption: "RAW",
      requestBody: {
        values: [
          [
            "ID",
            "Firstname",
            "Lastname",
            "Email",
            "Gender",
            "City",
            "Country",
            "Country Code",
            "State",
            "Street Address",
            "Job title",
            "Company",
            "Photo",
          ],
          ...formattedUsers,
        ],
      },
    });
    console.log("Update Response:", updateResponse.data);

    await drive.permissions.create({
      fileId: newSpreadsheetId,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}`;
    res.json({
      success: true,
      sheetUrl,
      message: "Sheet created successfully",
    });
  } catch (error) {
    console.error("Error in createUserData:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create sheet",
      error: error.message,
    });
  }
};
