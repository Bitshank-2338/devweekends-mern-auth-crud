// The one place where errors become responses. Express recognises it as an
// error handler because it takes four arguments, so it must keep all four
// even though `next` is unused. Every failure leaves the API in the same
// shape: { message: "..." }.
function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Something went wrong';

  // A schema rule failed, for example a missing title or a status outside
  // the enum. Report the first message so the UI can show it directly.
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)[0].message;
  }

  // Mongoose could not cast a value, typically a malformed ObjectId in a URL.
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}`;
  }

  // A unique index rejected the write, which here means the email is taken.
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Email is already registered';
  }

  res.status(statusCode).json({
    message,
    // Stack traces are useful while developing but must never reach users.
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
}

module.exports = errorHandler;
