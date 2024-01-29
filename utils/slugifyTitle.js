const slugify = require("slugify");

function slugifyTitle(title) {
  let id = slugify(title, {
    remove: /[*+~.()'"!:@]/g,
    strict: true,
    lower: true,
    trim: true,
  });

  return id;
}

module.exports = slugifyTitle;
