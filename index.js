'use strict';


/* *************** Отлавливаем необработанные исключения *************** */
process.on('uncaughtException', (err) => {
    console.log('Неотловленное исключение: ');
    console.log(err);
});


/* *************** Express *************** */
let express        = require('express');
let app            = express();

/* *************** Express Middleware *************** */
let cookieParser    = require('cookie-parser');
let bodyParser      = require('body-parser');
let gaikan          = require('gaikan');
let methodOverride = require('method-override');
let session         = require('express-session');

app.use( cookieParser() )
app.use( bodyParser.urlencoded({ extended: false }) );
app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: 'supernova' 
}));



/* *************** Express Routes *************** */
app.engine('html', gaikan);
app.set('view engine', '.html');
app.set('views', './views');
app.use(express.static('public'));

app.get('/logout', (req, res) => {
    req.session.destroy();
    req.logout();
    res.redirect('/login');
});

function ensureAuthenticated(req, res, next) {
    if (req.session && req.session.passport 
      && req.session.passport.user !== undefined) {
        return next();
    } else {
        res.redirect('/login');
    }
};

app.get('/', ensureAuthenticated, (req, res) => {
    let username = 'userDefault';
    if (req.session && req.session.passport && req.session.passport.user) {
        username = req.session.passport.user;
    }
    res.render('index', {username: username});
});

app.get('/login', (req, res) => {
    if (req.session && req.session.passport && req.session.passport.user) {
        //let username = req.session.passport.user;
        //res.render('index', {username: username});
        res.redirect('/');
    } else {
        res.render('login');
    }
});

app.listen(8000, () => {
    console.log('Server listening on port 8000!');
});


/* *************** Passport *************** */
let passport = require('passport')
let LocalStrategy = require('passport-local').Strategy;

app.use( passport.initialize() );
app.use( passport.session() );

passport.serializeUser(function(user, done) {
    console.log('serializeUser: ', user);
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    console.log('deserializeUser: ', user);
    done(null, user);
});

passport.use(new LocalStrategy(
    {passReqToCallback : true},
    (req, username, password, done) => {
        return done(null, username);
    }
));

app.post('/login', passport.authenticate('local', { 
    successRedirect: '/' ,
    failureRedirect: '/login' 
}));
