const { google } = require("googleapis");
const path = require("path");
const fs = require("fs");

const KEYFILEPATH = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

const SPREADSHEET_ID = "1G3YOWeTKl2zmBFZb98NbEn2WpJIaUW9Awd-BS8CTcjk";

const sheets = google.sheets({ version: "v4" });
const drive = google.drive({ version: 'v3' });

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file'
];

module.exports.getUserData = async (req, res, next) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: client });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "user_mock_data!A:M",
    });

    const rows = response.data.values;

    if (rows?.length) {
      res.json(rows);
    } else {
      res.status(404).send("No data found");
    }
  } catch (error) {
    console.error("Error fetching data from Google Sheets:", error);
    res.status(500).send("Error fetching data");
  }
};

module.exports.createUserData = async (req, res, next) => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: SCOPES
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

    const sheetResponse = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `User Export ${new Date().toLocaleDateString()}`,
        },
      },
    });

    const newSpreadsheetId = sheetResponse.data.spreadsheetId;

    await sheets.spreadsheets.values.update({
      spreadsheetId: newSpreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [
          ['ID', 'Firstname', 'Lastname', 'Email', 'Gender', 'City', 'Country', 'Country Code', 'State', 'Street Address', 'Job title', 'Company', 'Photo'],
          ...sortedUsers
        ],
      },
    });

    await drive.permissions.create({
      fileId: newSpreadsheetId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}`;
    res.json({ 
      success: true,
      sheetUrl,
      message: 'Sheet created successfully' 
    });

  } catch (error) {
    console.error('Error in createUserData:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create sheet',
      error: error.message
    });
  }
};
