const passport = require("passport")
const LocalStrategy = require("passport-local").Strategy
const User = require("../models/user.cjs")

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())