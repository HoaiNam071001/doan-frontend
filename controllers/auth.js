
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { validationResult } = require('express-validator');

const User = require('../models/User');

exports.getAuthUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};
exports.checkLogin=async (req,res) =>{
  const { username, password } = req.body;
  try{
   
    //check exist
    let user = await User.findOne({ username });
    if (!user) {
      return res.json({ userError: 'User do not exist! Please try again.', passError:'' });
    }
    //check right pwd
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ userError:'',passError: 'Not correct password! Please try again' });
    }
    //return no fault
     return res.json({userError:'',passError: ''});
  }
  catch{
    console.error(err.message);
    res.status(500).send('Server Error');
  }
}


exports.loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const { username, password } = req.body;

  try {
    let user = await User.findOne({ username });

    if (!user) {
      // return res.status(400).send({ errors: [{ msg: 'Invalid Credentials' }] });
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 36000 }, (err, token) => {
      if (err) throw err;
      res.json({ token });
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
