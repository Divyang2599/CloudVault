const express = require('express');
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const cors = require('cors');
const fileUpload = require('express-fileupload');

const auth_routes = require('./auth/routes');
const blob_storage_routes = require('./blob_storage/routes');
const connection = require('./db/database');

//-------------- GENERAL SETUP ----------------
require('dotenv').config();

var app = express();

app.use(cors({ credentials: true, origin: process.env.SERVER_IP }));

app.use(express.json());
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));

//  -------------- SESSION SETUP ----------------

const sessionStore = new MongoStore({
    mongooseConnection: connection,
    collection: 'sessions',
    autoRemove: 'interval',
    autoRemoveInterval: 10
});
app.set("trust proxy", true);
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
        secure: true,
        sameSite: "none",
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// -------------- PASSPORT AUTHENTICATION ----------------

require('./auth/passport');

app.use(passport.initialize());
app.use(passport.session());


// -------------- ADD ROUTES ----------------

app.use(auth_routes);
app.use(blob_storage_routes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
console.log("Listening on port 5000");