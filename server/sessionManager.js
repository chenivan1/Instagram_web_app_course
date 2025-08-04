// Simple in-memory session storage (in production, use proper session management)
let loggedInUser = null;

const SessionManager = {
  setLoggedInUser(user) {
    loggedInUser = user;
  },
  
  getLoggedInUser() {
    return loggedInUser;
  },
  
  isUserLoggedIn() {
    return loggedInUser !== null;
  },
  
  logout() {
    loggedInUser = null;
  }
};

module.exports = SessionManager;