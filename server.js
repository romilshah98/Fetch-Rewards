const { json } = require("express");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const port = 4000;

const transactions = [];

app.listen(port, () => {
  console.log(`API Server started on port ${port}`);
});

app.get("/points", (req, res) => {
  let points = new Map();
  transactions.forEach((transaction) => {
    if (points.has(transaction["payer"])) {
      const currPoints = points.get(transaction["payer"]);
      points.set(transaction["payer"], currPoints + transaction["points"]);
    } else {
      points.set(transaction["payer"], transaction["points"]);
    }
  });
  res.status(200).json(Object.fromEntries(points));
});

app.post("/addTransaction", (req, res) => {
  const transactionData = req.body;
  const date = new Date(Date.now());
  const timeStamp = date.toISOString();
  const transaction = { ...transactionData, timestamp: timeStamp };
  transactions.push(transaction);
  res.status(200).send("Transaction added successfully!");
});

app.post("/spend", (req, res) => {
  const points = req.body.points;
  try {
    response = spendPoints(points);
    res.status(200).send(response);
  } catch (e) {
    res.status(200).send("Something went wrong!");
  }
});

const spendPoints = (pointsToSpend) => {
  let currPoints = pointsToSpend;
  let spendies = [];
  const l = transactions.length;
  for (let index = 0; index < l; index++) {
    console.log(currPoints);
    if (currPoints == 0) {
      break;
    }
    const transaction = transactions.shift();
    let payer = transaction["payer"];
    let points = transaction["points"];
    if (points <= currPoints) {
      currPoints -= points;
      spendies.push({ payer: payer, points: -points });
    } else {
      spendies.push({ payer: payer, points: -currPoints });
      const date = new Date(Date.now());
      const timeStamp = date.toISOString();
      transactions.push({
        payer: payer,
        points: points - currPoints,
        timeStamp: timeStamp,
      });
      console.log(transactions);
      currPoints = 0;
    }
  }
  console.log(spendies);
  return [...spendies];
};
