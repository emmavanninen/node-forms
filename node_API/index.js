// const http = require('http')

// let server = http.createServer((req, res) => {
//     res.write('Poop')
//     res.end()
// }).listen(8000)

// console.log('poop');

const express = require('express');
const path = require('path');
const logger = require('morgan');
const session = require('express-session');
const cookieParse = require('cookie-parser');
const expressValidator = require('express-validator');
const authChecker = require('./utils/authChecker')
const isLoggedIn = require('./utils/isLoggedIn')

let app = express();

//connected views folder
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// connect static folder
app.use(express.static(path.join(__dirname, 'public')));
// enable req.body, using html form
app.use(express.urlencoded({ extended: false }));

app.use(logger('dev')); //dev = developer

// let our app work with json
app.use(express.json());
app.use(cookieParse('super-secret'));

let user = {};
let message = {};

app.use(
  session({
    secret: 'super-secret',
    saveUninitialized: false,
    resave: false,
    cookie: {
      secure: false, //true makes it crypted, change for the final version
      maxAge: 365 * 24 * 60 * 60 * 1000 //days, hours, mins, secs, mil.secs = year
    }
  })
);

app.use(
  expressValidator({
    errorFormatter: (param, message, value) => {
      let namespace = param.split('.');
      let root = namespace.shift();
      let formParam = root;

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }

      return {
        param: formParam,
        message: message,
        value: value
      };
    }
  })
);

app.get('/', (req, res, next) => {
  if (Object.keys(req.query).length !== 0) {
    next();

    return;
  }

  res.send('Get pooping');
});

app.get('/', (req, res) => {
  console.log(req.query);

  res.send(req.query);
});

app.post('/', (req, res) => {
  console.log(req.body);

  res.send(req.body);
});

app.get('/users/register', (req, res) => {
  res.render('register', { error_msg: false });
});

app.post('/users/register', authChecker, (req, res) => {
    let errors = req.validationErrors();

  if (errors) {
    res.render('register', { error_msg: true, errors: errors });
  } else {
      user.email = req.body.email
      user.username = req.body.username
      user.password = req.body.password
      
      req.session.user = user

    res.redirect('/show-me-my-page');
  }
});

app.get('/show-me-my-page', (req, res) => {

  if (req.session.user) {
    res.render('index', { user: req.session.user });
  } else {
    res.render('index', { user: null });
  }
});


app.get('/send-email', (req, res) => {
    res.render('send-email', { user: null, error_msg: true, errors: false } );
});

app.post('/send-email', (req, res) => {
    req
        .checkBody('fullname', 'Enter your full name')
        .notEmpty()
        .blacklist(/\d<>\//);
    req.checkBody('sender-email', 'Enter valid email address').isEmail();
    req
        .checkBody('subject', 'Please, add subject')
        .notEmpty()
    req
        .checkBody('msg', 'Please, add message')
        .notEmpty()

    let errors = req.validationErrors();
    if (errors) {
        console.log(errors);
        res.render('send-email', { error_msg: true, errors: errors });

    } else {
        message.email = req.body.email;
        message.subject = req.body.subject;
        message.msg = req.body.msg;

        const Secret = require('../../../lectures/secret')
        const secret = new Secret()
        const pass = secret.getPass()


        const nodemailer = require('nodemailer')

        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'emma.vanninen@codeimmersives.com',
                pass: pass,
            }
        })


        let mailOptions = {
            from: message.email,
            to: 'emma.vanninen@codeimmersives.com',
            subject: message.subject,
            text: message.msg
        }

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) console.log(err);
            else console.log(`Email sent: ${info.response}`);

        })

        res.redirect('/msg-sent');
    }
});

app.get('/msg-sent', (req, res) => {
    res.render('msg-sent');
});

app.get('/login', isLoggedIn, (req, res) => {
    res.render('login', { success_msg: false, error_msg: false})

});

app.post('/login', (req, res) => {
    session.user.email = req.body.email
    console.log('poop');
    
});

app.get('/test', (req, res) => {
  res.render('index');
});

// * needs to be the last one or anything after won't get reached
app.get('*', (req, res) => {
  res.send('got req to *');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
