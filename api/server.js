const express = require('express');
const cookieparser = require('cookie-parser');
const session = require('express-session');
const morgan = require('morgan');
const { Tweet, conn } = require('./src/db');
const { redirectLogin } = require('./src/middlewares/redirectLogin');
const { redirectHome } = require('./src/middlewares/redirectHome');
const { postlogin, getlogin } = require('./src/controllers/login');
const { postregister, getregister } = require('./src/controllers/register');
const { posthome, gethome } = require('./src/controllers/home');
const { getindex } = require('./src/controllers/getindex');
const { gettweets } = require('./src/controllers/gettweets');
const cors = require("cors");
require('dotenv').config();

const app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(express.json({ limit: '50mb' }));
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});

// middleware's 
// -----------------------------------------------

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cookieparser());
app.use(express.static('views'));

app.use(session(
  {
    name: 'sid',
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: {}
  }
));

app.use((req, res, next) => {
  console.log(req.session);
  next();
});

app.use(cors());

//  GET's
// ------------------------------------------------------------------------------

app.get('/', getindex);

app.get('/user', redirectLogin , gettweets);

app.get('/home', redirectLogin, gethome);

app.get('/login', redirectHome, getlogin);

app.get('/register', redirectHome, getregister);


app.get('/logout', redirectLogin, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/home');
    }
    res.clearCookie('sid');
    res.redirect('/');
  })
});

// POST's
// ------------------------------------------------------------------------------



app.post('/login', redirectHome, postlogin);

app.post('/register', redirectHome, postregister);

app.post('/home', posthome)


// detele all tweets
//-----------------------------------------------------------------

app.get('/clear', (req, res) => {
  Tweet.destroy({ where: {} })
    .then(() => { return res.redirect('/home') })
    .catch(error => {
      console.error(error)
      res.status(500).send('Upss 😥')
    })
})



//------------------------------------------------------------------

conn.sync({force: false}).then(() => {
  app.listen(3001, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Listening on port ' + 3001);
    }
  });
});