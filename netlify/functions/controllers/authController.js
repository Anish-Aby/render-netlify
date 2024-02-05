const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const catchAsync = require("../../../utils/catchAsync");
const User = require("./../models/usersModel");
const AppError = require("../../../utils/appError");
const connectToDB = require("../../../src/db");
const sendEmail = require("../../../utils/email");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  await connectToDB();
  const newUser = await User.create({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
    displayName: "",
    image: "",
    bio: "",
    followers: [],
    following: [],
    followingTags: [],
    achievements: [],
    blogs: [],
    bookmarks: [],
    blockedUsers: [],
  });

  const token = signToken(newUser._id);

  res.status(201).json({
    status: "success",
    token,
    userInfo: {
      userId: newUser._id,
      username: newUser.username,
      userImage: newUser.image,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  //   1.) Check if email and password exists.
  if (!email || !password) {
    return next(new AppError("Please provide an email and password", 400));
  }

  //   1.B) Connect to db
  await connectToDB();

  //   2.) Check if user exists and password matches
  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  //   3.) If everything is okay, send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
    userInfo: {
      userId: user._id,
      username: user.username,
      userImage: user.image,
    },
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  // 1.) Get token and check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in, Log in to get access.", 401)
    );
  }
  // 2.) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Connect to db
  await connectToDB();

  // 3.) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.")
    );
  }

  // 4.) Check if user changed password after token was issued.
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password. Please log in again")
    );
  }

  //   5.) Grant access to protected route
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError("Please enter your email", 404));
  }

  // Connect to db
  await connectToDB();

  // 1.) Get user based on email
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    // return next(new AppError("There is no user with that email address", 404));
    return res.status(200).json({
      status: "success",
      message: "Token sent to email",
    });
  }

  // 2.) Generate token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3.) Send email
  const resetURL = `${req.protocol}://renderio.netlify.app/resetPassword/${resetToken}`;

  try {
    await sendEmail({
      email: req.body.email,
      subject: "Render.io Password Reset",
      resetURL,
    });
  } catch (err) {
    console.log(err);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError("There was an error sending the email. Try again later", 500)
    );
  }

  res.status(200).json({
    status: "success",
    message: "Token sent to email",
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Connect to db
  await connectToDB();

  // 1. Get user
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2. If token not expired, and there is a user, set the new password
  if (!user) {
    return next(
      new AppError(
        "Token has expired. Please try resetting your password again.",
        400
      )
    );
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  // 3. Update changedPasswordAt
  // 4. Log the user in and send JWT
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    message: "Password changed successfully",
    // Not sending token
    token,
  });
});
