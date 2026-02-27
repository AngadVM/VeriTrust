const express = require("express");
const cors = require("cors"); // change
const routes = require("./routes/routes");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // change
app.use(express.json());

app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
