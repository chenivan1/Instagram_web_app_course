const SessionManager = require('../sessionManager');
const path = require('path');

const authMiddleware = {
  // Middleware to check if user is logged in
  requireAuth(req, res, next) {
    if (SessionManager.isUserLoggedIn()) {
      next(); // User is logged in, proceed to next middleware/route handler
    } else {
      // User is not logged in, redirect to login page
      res.redirect('/login');
    }
  },

  // Middleware to redirect logged-in users away from login/register pages
  redirectIfAuthenticated(req, res, next) {
    if (SessionManager.isUserLoggedIn()) {
      res.redirect('/home'); // User is already logged in, redirect to home
    } else {
      next(); // User is not logged in, proceed to login/register page
    }
  }
};

module.exports = authMiddleware;