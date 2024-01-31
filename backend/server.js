const express = require('express');
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(cors());
app.options("*", cors());

const img = [
    "https://ucarecdn.com/05f649bf-b70b-4cf8-90f7-2588ce404a08/",
    "/assets/2.jpg",
    "/assets/3.jpg",
    "/assets/4.jpg",
    "/assets/5.jpg",
]

const width = 30, height = 30;


app.get('/getMultipleImages', (req, res) => {
  console.log('Get Multiple Images');
  try {
    console.log("Success");
    res.json(img);
  } catch (err) {
    console.log("Error in Get Multiple Images:" + err);
    res.json("Failed");
  }
});

app.get('/getImageSize', (req, res) => {
  console.log('Get Image Size');
  try {
    console.log("Success");
    res.json({width: width, height: height});
  } catch (err) {
    console.log("Error in Get Image Size:" + err);
    res.json("Failed");
  }
});

const port = Number(process.env.PORT || 5000);
// starting the server
app.listen(port, () =>
    console.log(`Server running on port ${port}!`)
);

module.exports = app;