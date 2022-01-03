const express = require('express');
const app = express();
const PORT = 8080;
const path = require('path');
const morgan = require('morgan');

/*
in express everything is handled with middleware
you either end the request response cycle or
you can pass the control to the next middleware
*/

//Built in middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Third party middleware
app.use(morgan('dev'));

//My middleware
app.use((req, res, next) => {
  console.log(
    'This block of code will run with every request made to the server'
  );
  //We can modify and add new properties to the request object
  const now = new Date();
  req.requestTime = now.toLocaleTimeString();
  console.log(`The request time is: ${req.requestTime}`);
  console.log('This is my middleware without specific path');
  next(); //This line passes control to the next middleware
});
app.use('/middleware', (req, res, next) => {
  console.log(
    'This block of code will run when request made to http://localhost:8080/middleware'
  );
  console.log('My middleware with specific path');
  next();
});

//Route protection example with silly middleware
const verifyPassword = (req, res, next) => {
  const { password } = req.query;
  if (password === 'mysecret') {
    return next();
  }
  res.send('Your password is not correct.');
};
app.get('/secret', verifyPassword, (req, res) => {
  res.send('Your password correct. Welcome to the secret page.');
});

//Routes
app.get('/', (req, res) => {
  res.send('Home Page');
});
app.get('/dogs', (req, res) => {
  res.send('WOOF WOOF');
});
app.get('/middleware', (req, res) => {
  res.send('Your path specific middleware log something to the console');
});
//fallback for 404
app.use((req, res) => {
  res.status(404).send("This page doesn't exist");
});
//Start express app
app.listen(PORT, () => {
  console.log('Static files served at', path.join(__dirname, 'public'));
  console.log(`Express app is listening on http://localhost:${PORT}`);
});
