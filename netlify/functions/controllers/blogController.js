const connectToDB = require("../../../src/db");
const AppError = require("../../../utils/appError");
const catchAsync = require("../../../utils/catchAsync");
const getSummary = require("../../../utils/getSummary");
const slugifyTitle = require("../../../utils/slugifyTitle");
const Blog = require("../models/blogModel");

// Get all blogs
exports.getAllBlogs = catchAsync(async (req, res, next) => {
  await connectToDB();
  const blogs = await Blog.find();
  res.status(200).json({
    status: "success",
    results: blogs.length,
    data: {
      blogs,
    },
  });
});

// Get blog by ID
exports.getBlogById = async (req, res, next) => {
  await connectToDB();
  const blog = await Blog.findById(req.params.blogId);

  if (!blog) {
    return next(new AppError("No blog found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      blog,
    },
  });
};

// create blog
exports.createBlog = catchAsync(async (req, res, next) => {
  await connectToDB();
  const requestBody = req.body;
  let blogId = slugifyTitle(requestBody.title);
  let summary = getSummary(requestBody.body.content.blocks);

  const newBlog = new Blog({
    _id: blogId,
    authorId: requestBody.authorId,
    date: requestBody.date,
    title: requestBody.title,
    image: requestBody.image,
    body: requestBody.body,
    summary: summary,
    category: requestBody.category,
    isFeatured: requestBody.isFeatured,
  });

  await newBlog.save();

  res.status(200).json({
    status: "success",
    data: newBlog,
  });
});

// update blogs
exports.updateBlog = catchAsync(async (req, res, next) => {
  await connectToDB();
  const blogId = req.params.blogId;
  const body = req.body;
  const blog = await Blog.findByIdAndUpdate(blogId, body, {
    new: true,
    runValidators: true,
  });

  if (!blog) {
    return next(new AppError("No blog found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: blog,
  });
});

// delete blog
exports.deleteBlog = catchAsync(async (req, res, next) => {
  await connectToDB();
  const blogId = req.params.blogId;
  const blog = await Blog.findByIdAndDelete(blogId);

  if (!blog) {
    return next(new AppError("No blog found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: "Blog deleted successfully",
  });
});
