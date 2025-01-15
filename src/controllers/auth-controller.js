const { google } = require("googleapis");
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config();

const SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file'
];

const KEYFILEPATH = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../../config/mindful-oath-447611-g8-761bc131b115.json');
const USER_SPREADSHEET_ID = process.env.USER_SPREADSHEET_ID;

console.log('KEYFILEPATH:', KEYFILEPATH);
console.log('File exists:', require('fs').existsSync(KEYFILEPATH));

const getGoogleSheetsClient = async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: KEYFILEPATH,
      scopes: SCOPES
    });
    const client = await auth.getClient();
    return google.sheets({ version: 'v4', auth: client });
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    throw new Error('Failed to initialize Google Sheets client');
  }
};

module.exports.loginGoogle = async (req, res, next) => {
  try {
    const { email, given_name, family_name, picture } = req.body;

    const sheets = await getGoogleSheetsClient();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: USER_SPREADSHEET_ID,
      range: 'A:E',
    });

    const rows = response.data.values || [];
    let user = rows.find(row => row[0] === email);
    
    if (!user) {
      const userId = Date.now().toString();
      const newUser = [email, given_name, family_name, picture, userId];
      
      await sheets.spreadsheets.values.append({
        spreadsheetId: USER_SPREADSHEET_ID,
        range: 'A:E',
        valueInputOption: 'RAW',
        requestBody: {
          values: [newUser]
        }
      });
      
      user = newUser;
    }

    const token = jwt.sign(
      { 
        userId: user[4],
        email: user[0]
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user[4],
        email: user[0],
        firstName: user[1],
        lastName: user[2],
        profileImage: user[3]
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    next(error);
  }
};

module.exports.getUsers = async (req, res) => {
  try {
    const sheets = await getGoogleSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: USER_SPREADSHEET_ID,
      range: 'A:E',
    });

    const rows = response.data.values || [];

    const users = rows.slice(1).map(row => ({
      id: row[4],
      email: row[0],
      firstName: row[1],
      lastName: row[2],
      profileImage: row[3]
    }));

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      message: 'Error fetching users',
      error: error.message 
    });
  }
};

module.exports.checkAuth = async (req, res) => {
  try {
    const sheets = await getGoogleSheetsClient();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: USER_SPREADSHEET_ID,
      range: 'A:E',
    });

    const rows = response.data.values || [];
    const user = rows.find(row => row[4] === req.user.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: user[4],
      email: user[0],
      firstName: user[1],
      lastName: user[2],
      profileImage: user[3]
    });
  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};
