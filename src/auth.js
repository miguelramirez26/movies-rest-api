const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;

const githubConfigured = Boolean(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET);

if (githubConfigured) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3000/auth/github/callback'
  }, (accessToken, refreshToken, profile, done) => {
    done(null, {
      id: profile.id,
      username: profile.username,
      displayName: profile.displayName,
      profileUrl: profile.profileUrl
    });
  }));
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

function ensureGitHubConfigured(request, response, next) {
  if (!githubConfigured) {
    return response.status(503).json({
      error: 'GitHub authentication is not configured. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.'
    });
  }

  next();
}

function ensureAuthenticated(request, response, next) {
  if (request.isAuthenticated()) return next();

  response.status(401).json({ error: 'Authentication required.' });
}

module.exports = { ensureAuthenticated, ensureGitHubConfigured, passport };