module.exports = {
  database: 'mongodb://root:abc123@ds031581.mlab.com:31581/fyp',
  // database: 'mongodb://localhost/fyp3',
  secret: "This is a SECRET19923123",

  facebook: {
    clientID: process.env.FACEBOOK_ID || '1751483768407951',
    clientSecret: process.env.FACEBOOK_SECRET || 'b79f7082c78e2ddfc1675a4edaa28e97',
    profileFields: ['emails', 'displayName'],
    // callbackURL: 'http://localhost:3000/auth/facebook/callback',
    callbackURL: 'https://fypealearning.herokuapp.com/auth/facebook/callback'
  }
}
