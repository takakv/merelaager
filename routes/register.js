const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const { slots } = require("../models/bills");

const fs = require("fs");
let meta = JSON.parse(fs.readFileSync("./data/metadata.json", "utf-8"));
meta = meta.broneeri;

const url_prefix = "registreerimine/";

router.get("/", (req, res, next) => {
  res.render("registreerimine", {
    title: meta.title,
    description: meta.description,
    url_path: url_prefix,
    body_class: "registration",
    script_path: "/media/scripts/registration.js",
  });
});

const urlEncParser = bodyParser.urlencoded({ extended: false });

const campers = require("../controllers/camperController");

router.post("/register/", urlEncParser, campers.create);

router.get("/edu/", (req, res) => {
  res.render("success", {
    title: meta.title,
    description: meta.description,
    url_path: url_prefix,
    layout: "metadata",
    body_class: "success",
  });
});

router.get("/reserv/", (req, res) => {
  res.render("reserv", {
    title: meta.title,
    description: meta.description,
    url_path: url_prefix,
    layout: "metadata",
    body_class: "success",
  });
});

let spots = {
  1: {
    boys: 20,
    girls: 20,
  },
  2: {
    boys: 20,
    girls: 20,
  },
  3: {
    boys: 20,
    girls: 20,
  },
  4: {
    boys: 20,
    girls: 20,
  },
};

// Gather slot data
// for (const [key, value] of Object.entries(spots)) {
//   slots.findByPk(key).then((count) => {
//     value.boys = count.boySlots;
//     value.girls = count.girlSlots;
//   });
// }

let clients = [];

const sendEventsToAll = () => {
  clients.forEach((c) => c.res.write(`data: ${JSON.stringify(spots)}\n\n`));
};

router.post("/events/", [urlEncParser, bodyParser.json()], (req, res) => {
  spots = req.body;
  sendEventsToAll();
  res.status(200).end();
});

router.post(
  "/spotupdate/",
  [urlEncParser, bodyParser.json()],
  async (req, res) => {
    const dbLoc = {
      where: {
        shift: 3,
      },
    };
    if (req.body.update === "minus")
      await slots.update(
        {
          boySlots: --spots[3].boys,
          girlSlots: --spots[3].girls,
        },
        dbLoc
      );
    else if (req.body.update === "plus")
      await slots.update(
        {
          boySlots: ++spots[3].boys,
          girlSlots: ++spots[3].girls,
        },
        dbLoc
      );
    else if (req.body.update === "girlUp") {
      spots[3].boys = spots[3].boys - 4;
      spots[3].girls = spots[3].girls + 4;
      await slots.update(
        {
          boySlots: spots[3].boys,
          girlSlots: spots[3].girls,
        },
        dbLoc
      );
    } else if (req.body.update === "boyUp") {
      spots[3].boys = spots[3].boys + 4;
      spots[3].girls = spots[3].girls - 4;
      await slots.update(
        {
          boySlots: spots[3].boys,
          girlSlots: spots[3].girls,
        },
        dbLoc
      );
    }
    sendEventsToAll();
    res.status(200).end();
  }
);

router.get("/events/", async (req, res) => {
  console.log("Got events");
  // Headers
  const headers = {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  };
  res.writeHead(200, headers);

  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res,
  };
  clients.push(newClient);

  req.on("close", () => {
    console.log(`${clientId} Connection closed`);
    clients = clients.filter((c) => c.id !== clientId);
  });

  res.write("retry: 10000\n\n");
  res.write(`data: ${JSON.stringify(spots)}\n\n`);
});

module.exports = router;
