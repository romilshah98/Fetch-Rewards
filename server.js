// Imports
const express = require("express");
const bodyParser = require("body-parser");

// Using express
const app = express();
app.use(bodyParser.json());

// Port where server is hosted
const port = 4000;

// Defining our in memory transactions
const transactions = [];
let availablePoints = 0;

// Listen on our port
app.listen(port, () => {
  console.log(`API Server started on port ${port}`);
});

// Get points of all payers
app.get("/points", (req, res) => {
  let points = new Map();
  // Here we are traversing through all the transactions to calculate total points of each player
  // and store it in map.
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

// Add new transaction
app.post("/addTransaction", (req, res) => {
  const transactionData = req.body;

  if (!transactionData["payer"] || !transactionData["points"]) {
    res.status(200).send("Please provide Payer and Points");
  } else {
    const date = new Date(Date.now());
    const timeStamp = date.toISOString();
    availablePoints += transactionData.points;
    const transaction = { ...transactionData, timestamp: timeStamp };
    transactions.push(transaction);
    res.status(200).send("Transaction added successfully!");
  }
});

// Spend points
app.post("/spend", (req, res) => {
  const points = req.body.points;

  try {
    response = spendPoints(points);
    res.status(200).send(response);
  } catch (e) {
    res.status(200).send(e.message);
  }
});

// Spend Points helper function
const spendPoints = (pointsToSpend) => {
  let currPoints = pointsToSpend;

  // Throwing error if we try to spend more points then available
  if (currPoints > availablePoints) {
    throw new Error("You cannot spend more than " + availablePoints.toString() + " points.");
  }

  let spendies = [];
  const transactionLength = transactions.length;

  //  Traversing list of transaction until we spend all points.
  for (let index = 0; index < transactionLength; index++) {
    if (currPoints == 0) {
      break;
    }

    const transaction = transactions.shift();
    let payer = transaction["payer"];
    let points = transaction["points"];

    // If current transaction's point is less than points we want to spend then
    // we spend all points of the current transaction.
    if (points <= currPoints) {
      currPoints -= points;
      availablePoints -= points;
      spendies.push({ payer: payer, points: -points });
    } // else we only spend points that we need to.
    else {
      spendies.push({ payer: payer, points: -currPoints });
      availablePoints -= currPoints;
      const date = new Date(Date.now());
      const timeStamp = date.toISOString();
      // Since we don't spend all the points, we have to add new transaction with the remaining point
      transactions.push({
        payer: payer,
        points: points - currPoints,
        timeStamp: timeStamp,
      });
      currPoints = 0;
    }
  }
  return [...spendies];
};
