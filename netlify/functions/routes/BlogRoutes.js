const express = require("express");
const blogController = require("../controllers/blogController");
const authController = require("../controllers/authController");

const router = express.Router();

router
  .route("/")
  .get(blogController.getAllBlogs)
  .post(blogController.createBlog);

router
  .route("/:blogId")
  .get(blogController.getBlogById)
  .patch(blogController.updateBlog)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    blogController.deleteBlog
  );

module.exports = router;
