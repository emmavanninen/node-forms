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

app.post('/users/register', (req, res) => {
  req
    .checkBody('username', 'Between 3 and 15 chars')
    .isLength({ min: 3, max: 15 });
  req
    .checkBody('username', 'Only use A-Z')
    .notEmpty()
    .blacklist(/<>\//);
  req.checkBody('email', 'Enter valid email address').isEmail();
  req
    .checkBody('password2', 'Password is not matching')
    .notEmpty()
    .equals(req.body.password);

  let errors = req.validationErrors();
  if (errors) {
    res.render('register', { error_msg: true, errors: errors });
  } else {
    user.email = req.body.email;
    user.username = req.body.username;
    user.password = req.body.password;

    req.session.user = user;

    res.redirect('/show-me-my-page');
  }
});

app.get('/show-me-my-page', (req, res) => {
  // res.send('You got pooped')
  if (req.session.user) {
    res.render('index', { user: req.sessions.user });
  } else {
    res.render('index', { user: null });
  }
});


app.get('/send-email', (req, res) => {
    // res.send('You got pooped')
    if (req.session.user) {
        res.render('send-email', { user: req.sessions.user });
    } else {
        res.render('send-email', { user: null });
    }
});


app.get('/test', (req, res) => {
  res.render('index');
});

// * needs to be the last one or anything after won't get reached
app.get('*', (req, res) => {
  res.send('got req to *');
});

app.listen(8000, () => {
  console.log('Server is running on port 8000');
});
