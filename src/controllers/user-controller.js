const { google } = require("googleapis");
const path = require("path");
const sheets = google.sheets("v4"); // กำหนด sheets จาก googleapis
const drive = google.drive("v3"); // กำหนด drive จาก googleapis

// กำหนดค่าคงที่
const KEYFILEPATH = path.join(
  __dirname,
  "../../config/mindful-oath-447611-g8-82436aed9c7f.json"
);
const SPREADSHEET_ID = "1G3YOWeTKl2zmBFZb98NbEn2WpJIaUW9Awd-BS8CTcjk";
const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets", // สิทธิ์ในการเข้าถึง Google Sheets
  "https://www.googleapis.com/auth/drive", // สิทธิ์ในการเข้าถึง Google Drive
];

// สร้าง Google Sheets client
async function getGoogleSheetsClient() {
  try {
    console.log("Using key file:", KEYFILEPATH);

    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
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
      keyFile: KEYFILEPATH,
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
    console.log('Selected Users:', selectedUsers);

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
        user.photo // Photo
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
