const db = require("../models/database");

const Campers = db.shiftCampers;
const RawCampers = db.campers;
const ShiftData = db.shiftData;

const exists = async (entryId) => {
  const entry = await ShiftData.findByPk(entryId);
  return !!entry;
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
    await Campers.update({ notes: note }, { where: { id: id } });
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};

const editTent = async (entryId, tentNr) => {
  if (!(await exists(entryId))) return false;
  try {
    await ShiftData.update({ tentNr }, { where: { id: entryId } });
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

exports.addAll = async (req, res) => {
  const campers = await RawCampers.findAll({
    where: { isRegistered: true },
  });

  campers.forEach((camper) => addCamper(camper["shift"], camper["name"]));
  res.status(200).end();
};

// === Internal API for the router. ===

exports.addCamper = async (req, res) => {
  if (await addCamper(req.body.shift, req.body.name)) res.status(201).end();
  else res.status(400).end();
};

exports.updateNote = async (req, res) => {
  if (await editNotes(req.body.id, req.body.notes)) res.status(201).end();
  else res.status(400).end();
};

exports.updateTent = async (entryId, tentNr) => {
  return await editTent(entryId, tentNr);
};

// Fetch information about tent rosters.
// Return an array of tent rosters and an array of kids without tents.
// Tent rosters are arrays of kids. All kids have a name and an id.
exports.getTents = async (shiftNr) => {
  let tentData;

  try {
    tentData = await ShiftData.findAll({ where: { shiftNr: shiftNr } });
    if (!tentData) return null;
  } catch (e) {
    console.error(e);
    return null;
  }

  const resObj = { tents: [], noTent: [] };
  for (let i = 0; i < 10; ++i) resObj.tents[i] = [];

  const fetchPromises = [];

  const fetchChild = async (tentEntry) => {
    const child = await tentEntry.getChild();
    const tentNr = tentEntry.tentNr;

    if (tentNr)
      resObj.tents[tentNr - 1].push({ id: tentEntry.id, name: child.name });
    else resObj.noTent.push({ id: tentEntry.id, name: child.name });
  };

  tentData.forEach((tentEntry) => {
    fetchPromises.push(fetchChild(tentEntry));
  });

  await Promise.all(fetchPromises);

  return resObj;
};
