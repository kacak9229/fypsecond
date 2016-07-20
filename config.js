module.exports = {
  database: 'mongodb://localhost/fyp3',
  secret: "This is a SECRET19923123",

  facebook: {
    clientID: process.env.FACEBOOK_ID || 'ID',
    clientSecret: process.env.FACEBOOK_SECRET || 'SECRET',
    profileFields: ['emails', 'displayName'],
    callbackURL: 'http://localhost:3000/auth/facebook/callback',
  }
}
