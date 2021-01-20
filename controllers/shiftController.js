const db = require("../models/database");

const Campers = db.shiftCampers;
const RawCampers = db.campers;

const exists = async (id) => {
  const camper = await Campers.findByPk(id);
  return !!camper;
};

const addCamper = async (shift, name) => {
  try {
    await Campers.findOrCreate({
      where: {
        shift: shift,
        name: name,
      },
      defaults: {
        shift: shift,
        name: name,
      },
    });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const editNotes = async (id, note) => {
  if (!(await exists(id))) return false;
  try {
    await Campers.update(
      {
        notes: note,
      },
      {
        where: {
          id: id,
        },
      }
    );
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const editTent = async (id, tent) => {
  if (!(await exists(id))) return false;
  try {
    await Campers.update(
      {
        tent: tent,
      },
      {
        where: {
          id: id,
        },
      }
    );
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

exports.addAll = async (req, res) => {
  const campers = await RawCampers.findAll({
    where: {
      isRegistered: 1,
    },
  });

  campers.forEach((camper) => addCamper(camper["shift"], camper["name"]));
  res.status(200).end();
};

exports.addCamper = async (req, res) => {
  if (await addCamper(req.body.shift, req.body.name)) res.status(201).end();
  else res.status(400).end();
};

exports.updateNote = async (req, res) => {
  if (await editNotes(req.body.id, req.body.notes)) res.status(201).end();
  else res.status(400).end();
};

exports.updateTent = async (req, res) => {
  if (await editTent(req.body.id, req.body.tent)) res.status(201).end();
  else res.status(400).end();
};

exports.getTents = async (req) => {
  const shift = `${req.user.shift}v`;

  const campers = await Campers.findAll({
    where: {
      shift: shift,
    },
  });

  let returnData = { noTent: [] };

  // There are 10 tents.
  for (let i = 1; i <= 10; ++i) returnData[i] = [];

  campers.forEach((camper) => {
    if (camper["tent"])
      returnData[camper["tent"]].push({
        name: camper["name"],
        id: camper["id"],
      });
    else returnData.noTent.push({ name: camper["name"], id: camper["id"] });
  });

  return returnData;
};
