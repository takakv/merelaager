const db = require("../models/database");

const Campers = db.shiftCampers;
const RawCampers = db.campers;
const ShiftData = db.shiftData;
const Children = db.children;

const exists = async (camperId) => {
  const camper = await Children.findByPk(camperId);
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

const editTent = async (tentNr, childId, shiftNr) => {
  if (!(await exists(childId))) return false;
  try {
    await ShiftData.update({ tentNr }, { where: { childId, shiftNr } });
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

exports.updateTent = async (tentNr, childId, shiftNr) => {
  return await editTent(tentNr, childId, shiftNr);
};

// Fetch information about tent rosters.
// Return an array of tent rosters and an array of kids without tents.
// Tent rosters are arrays of kids. All kids have a name and an id.
exports.getTents = async (shiftNr) => {
  if (shiftNr < 1 || shiftNr > 10) return null;

  let children;

  try {
    children = await Children.findAll({
      include: [{ model: ShiftData, where: { shiftNr } }],
    });
    if (!children) return null;
  } catch (e) {
    console.error(e);
    return null;
  }

  const resObj = { tents: [], tentless: [] };
  for (let i = 0; i < 10; ++i) resObj.tents[i] = [];

  children.forEach((child) => {
    const shiftChild = child.shift_data.find(
      (child) => child.shiftNr === shiftNr
    );
    const tentNr = shiftChild.tentNr;
    if (tentNr)
      resObj.tents[tentNr - 1].push({ id: child.id, name: child.name });
    else resObj.tentless.push({ id: child.id, name: child.name });
  });

  return resObj;
};
