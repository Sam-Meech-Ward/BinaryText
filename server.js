const express = require("express");
const axios = require("axios");
const morgan = require("morgan");

const app = express();
app.set("view engine", "ejs");
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);


const textFromBinary = b =>
  b
  .split(" ")
  .map((a) => parseInt(a, 2))
  .reduce((a, c) => [[...a[0], c]], [[]])
  .map((a) => new Uint8Array(a))
  .map((a) => new TextDecoder().decode(a))
  .reduce((_, c) => c);

const binaryFromText = e =>
  Array.from(new TextEncoder().encode(e))
  .map((a) => a.toString(2))
  .join(" ")
  

const formatBinary = b => {
  let formatted = b.replace(/\+/g, " ");
  if (formatted[8] !== " ") {
    const copy = formatted;
    formatted = "";
    for (let i = 0; i < copy.length; i++) {
      formatted += copy[i];
      if (i !== 0 && (i+1) % 8 == 0) {
        formatted += " ";
      }
    }
  }
  return formatted.trim()
}

app.get("/", async (req, res) => {
  const search = req.query.search ? req.query.search.trim() : "";

  // Binary
  if (search.startsWith("1") || search.startsWith("0")) {
    const binary = search;
    const formattedB = formatBinary(binary);
    const text = textFromBinary(formattedB);
    console.log({ binary, formattedB, text });
    res.render("index.ejs", {
      data: { search: formattedB, binary: formattedB, text },
    });
    return;
  }
  
  // Text
  if (search) {
    const text = search
    const binary = binaryFromText(text);
    res.render("index.ejs", {
      data: { search: search, binary: binary, text },
    });
    return;
  }

  res.render("index.ejs", { data: { } });
})

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`listening on port ${port}`));
