const express = require("express");
const PORT = 3000;
const app = express();
const routes = require("./routes/routes");

app.use(express.json());

app.use("/", routes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
