const express = require('express');
const app = express();
const PORT = 8080;
const path = require('path');
const morgan = require('morgan');
const res = require('express/lib/response');
const AppError = require('./AppError');

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
  throw new AppError('Password is required', 401);
  res.send('Your password is not correct.');
  // throw new Error('Password is required');
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
app.get('/error', (req, res) => {
  chick.fly(); // Chick is not defined therefore this will throw an error, error handler middleware will be executed
});
app.get('/admin', (req, res) => {
  //Throw 403 forbidden error
  throw new AppError('You are not an admin', 403);
});
//fallback for 404
app.use((req, res) => {
  res.status(404).send("This page doesn't exist");
});

//Error handling middlewares
// app.use((err, req, res, next) => {
//   console.log('This error middleware will run if there is an error');
//   console.log(err);
//   next(err); //if there is an argument in next express will treat it as an error middleware
//   //last line passes the control to the express default error handler middleware
// });

app.use((err, req, res, next) => {
  const { statusCode = 500, message = 'Something went wrong' } = err;
  res.status(statusCode).send(message);
});
//Start express app
app.listen(PORT, () => {
  console.log('Static files served at', path.join(__dirname, 'public'));
  console.log(`Express app is listening on http://localhost:${PORT}`);
});
