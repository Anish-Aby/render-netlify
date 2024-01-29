const { convert } = require("html-to-text");

function getSummary(blogContent) {
  let summaryArray = [],
    counter = 0;
  for (block of blogContent) {
    if (block.type === "paragraph") {
      summaryArray.push(block.data.text);
      counter++;
    }
    if (counter >= 2) break;
  }

  const converterFormatters = {
    whitespaceCharacters: "",
    selectors: [{ selector: "a", options: { ignoreHref: true } }],
  };

  const summary = convert(summaryArray.join(" "), converterFormatters);

  return summary;
}

module.exports = getSummary;
