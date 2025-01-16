const jwt = require('jsonwebtoken');
const axios = require('axios');

module.exports.loginGoogle = async (req, res) => {
  try {
    const { access_token } = req.body;
    
    if (!access_token) {
      return res.status(401).json({ message: 'No access token provided' });
    }

    try {
      // ดึงข้อมูล user จาก Google
      const userInfoResponse = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
          headers: { 
            'Authorization': `Bearer ${access_token}`
          }
        }
      );

      const { 
        email,
        given_name,
        family_name,
        picture
      } = userInfoResponse.data;

      // สร้าง JWT token
      const token = jwt.sign(
        { 
          email,
          name: `${given_name} ${family_name}`,
          picture
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        token,
        user: {
          email,
          firstName: given_name,
          lastName: family_name,
          profileImage: picture
        }
      });

    } catch (error) {
      console.error('Google API Error:', error.response?.data || error);
      return res.status(401).json({ 
        message: 'Failed to verify Google token',
        error: error.response?.data || error.message 
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed',
      error: error.message 
    });
  }
};

module.exports.checkAuth = async (req, res) => {
  try {
    res.json({
      email: req.user.email,
      name: req.user.name,
      picture: req.user.picture
    });
  } catch (error) {
    console.error('Check auth error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports.getUsers = async (req, res) => {
  try {
    // ตรวจสอบสิทธิ์การเข้าถึง
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // ดึงข้อมูล users จาก database หรือ source อื่นๆ
    const users = []; // ใส่ logic การดึงข้อมูล users ตามที่ต้องการ

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      message: 'Failed to get users',
      error: error.message 
    });
  }
};
