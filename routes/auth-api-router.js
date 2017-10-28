const express  = require('express');
const bcrypt   = require('bcrypt');
const passport = require('passport');

const UserModel = require('../models/user-model.js');

const router = express.Router();

//Post route for the signup
router.post('/process-signup', (req, res, next) => {
  if(!req.body.signupFullName ||
      !req.body.signupUsername ||
      !req.body.signupPassword) {
        res.status(400).json(
          {errorMessage: "We need a full name, username and password"}
        );
        return;
      }
      UserModel.findOne(
        {username: req.body.signupUsername},
        (err, userFromDb) => {
        if (err) {
          console.log('User find error');
          res.status(500).json({ errorMessage: 'Error finding username'});
          return;
        }
        if(userFromDb) {
          res.status(400).json({errorMessage:"Username was taken"});
          return;
        }
        const salt = bcrypt.genSalt(10);
        const hashPass = bcrypt.hashSync(req.body.signupPassword, salt);
        const theUser = new UserModel({
          fullName: req.body.signupUsername,
          username: req.body.signupUsername,

          encryptedPassword: hashPass
        });
        theUser.save((err) => {
          if (err) {
            console.log("User save error", err);
            res.status(500).json({ errorMessage: "Error saving user"});
            return;
          }

          req.login(theUser, (err) => {
            if (err) {
              console.log("User auto-login error", err);
              res.status(500).json({ errorMessage: 'Error loggin user'});
              return;
            }
            theUser.encryptedPassword = undefined;
            res.status(200).json(theUser);
          })
        })
      }
    )
});

// Post route for the loggin
router.post('/process-login', (req, res, next) => {
  const customAuthCallback =
  passport.authenticate('local', (err, theUser, extraInfo) => {
    if (err) {
      res.status(500).json({errorMessage:"Login Failed"});
      return;
    }
    if(!theUser) {
      res.status(401).json({errorMessage: extraInfo.message});
      return;
    }
    req.login(theUser, (err) => {
      if(err) {
        res.status(500).json({errorMessage: "Login failed. 🤠"});
        return;
      }
      //clear out the password to avoid problems in the future.
      theUser.encryptedPassword = undefined;
      res.status(200).json(theUser);
    })
  })
  customAuthCallback(req, res, next);
});

//delete route for the logout
router.delete('/logout', (req, res, next) => {
  //req.logout is defined by passport
  req.logout();
  res.status(200).json({successMessage: 'Logout success!'});
});

//get route to check if the user in session
router.get('/checklogin', (req, res, next) => {
  let amIloggedIn = false;
  if(req.user) {
    req.user.encryptedPassword = undefined;
    amIloggedIn = true;
  }
  res.status(200).json(
    {
      isLoggedIn: amIloggedIn,
      userInfo: req.user
    }
  );
});

module.exports = router;
