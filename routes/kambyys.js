const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const session = require("express-session");

const fs = require("fs");
let meta = JSON.parse(fs.readFileSync("./data/metadata.json", "utf-8"));
meta = meta.info;

const url_prefix = "kambyys/";
const urlEncParser = bodyParser.urlencoded({ extended: false });

router.use(session({ secret: "Hushhush" }));

const db = require("../models/database");

const Users = db.users;

// Passport.js

const passport = require("passport");
const LocalStrategy = require("passport-local");

passport.use(
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
    },
    (username, password, done) => {
      Users.findByPk(username)
        .then((user) => {
          if (!user || !user.password !== password) {
            return done(null, false);
          }
          return done(null, user);
        })
        .catch(done);
    }
  )
);

router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  Users.findByPk(id).then((user) => done(null, user));
});

const loggedIn = (req, res, next) => {
  if (req.session.loggedIn) next();
  else res.redirect("../");
};

router.get("/", (req, res, next) => {
  console.log("Here again!");
  if (!req.session.loggedIn) {
    res.render("login", {
      layout: "cleanmeta",
      title: "Kambüüs",
      description: "",
      url_path: url_prefix,
      body_class: "",
    });
  } else {
    res.render("adminpage", {
      layout: "admin",
      title: "Kambüüs",
      description: "",
      url_path: url_prefix,
      body_class: "",
    });
  }
});

router.post("/login/", urlEncParser, (req, res) => {
  if (req.body.password === process.env.BOSSPASS) req.session.loggedIn = true;
  res.redirect("../");
});

// router.post(
//   "/login/",
//   passport.authenticate("local", { successRedirect: "/", failureRedirect: "" })
// );

router.get("/arvegeneraator/", loggedIn, (req, res, next) => {
  res.render("bill_generator", {
    layout: "admin",
    title: "Arvegeneraator",
    description: "Genereerib arveid.",
    url_path: url_prefix + "arvegeneraator/",
    body_class: "",
    script_path: "/media/scripts/billGen.js",
  });
});

const bill = require("../controllers/billController");

router.post(
  "/arvegeneraator/generate/",
  [urlEncParser, bodyParser.json()],
  bill.create
);

router.post(
  "/arvegeneraator/fetch/",
  [urlEncParser, bodyParser.json()],
  bill.fetch
);

const list = require("../controllers/listController");

router.post(
  "/nimekiri/update/",
  [urlEncParser, bodyParser.json()],
  async (req, res) => {
    const status = await list.update(req, res);
    if (!status) res.status(403).send();
    res.status(200).end();
  }
);

const prices = require("../controllers/priceController");

router.post(
  "/nimekiri/priceupdate/",
  [urlEncParser, bodyParser.json()],
  prices.updateAll
);

router.get(/nimekiri/, loggedIn, async (req, res) => {
  const data = await list.generate(req, res);
  res.render("camperList", {
    layout: "admin",
    title: "Nimekiri",
    description: "Laagrisolijate nimekiri",
    url_path: url_prefix + "nimekiri/",
    body_class: " " + "camper-list",
    boss: true,
    script_path: "/media/scripts/camperList.js",
    data: data,
  });
});

module.exports = router;
