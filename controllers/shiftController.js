const db = require("../models/database");

const Campers = db.shiftCampers;
const RawCampers = db.campers;

const exists = async (camperId) => {
  const camper = await Campers.findByPk(camperId.toString());
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

const editTent = async (tent, camperId) => {
  if (!(await exists(camperId))) return false;
  try {
    await Campers.update({ tent }, { where: { id: camperId } });
  } catch (err) {
    console.log(err);
    return false;
  }
  return true;
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

// === Internal API for the router. ===

exports.addCamper = async (req, res) => {
  if (await addCamper(req.body.shift, req.body.name)) res.status(201).end();
  else res.status(400).end();
};

exports.updateNote = async (req, res) => {
  if (await editNotes(req.body.id, req.body.notes)) res.status(201).end();
  else res.status(400).end();
};

exports.updateTent = async (tentNr, childId) => {
  return !!(await editTent(tentNr, childId));
};

// Fetch information about tent rosters.
// Return tent rosters mapped by tent keys and an array of kids without tents.
// Tent rosters are arrays of kids. All kids have a name and an id.
exports.getTents = async (shiftNr) => {
  if (shiftNr < 1 || shiftNr > 10) return null;

  const shift = `${shiftNr}v`;
  return await Campers.findAll({ where: { shift } });

  // let returnData = { tentList: {}, noTentList: [] };
  // for (let i = 1; i <= 10; ++i) returnData.tentList[i] = [];
  //
  // campers.forEach((camper) => {
  //   if (camper["tent"])
  //     returnData.tentList[camper["tent"]].push({
  //       name: camper["name"],
  //       id: camper["id"],
  //     });
  //   else returnData.noTentList.push({ name: camper["name"], id: camper["id"] });
  // });
  //
  // return returnData;
};

// This should only be run when the sync between tables is broken,
// as it is a heavy and slow function.
exports.forceUpdate = async () => {
  const rawCampers = await RawCampers.findAll({
    where: { isRegistered: true },
  });
  // Add all missing campers.
  rawCampers.forEach((camper) => {
    Campers.findOrCreate({
      where: { id: camper.id },
      defaults: {
        id: camper.id,
        shift: camper.shift,
        name: camper.name,
      },
    });
  });
  // Remove all excess campers.
  const campers = await Campers.findAll();
  campers.forEach((camper) => {
    Campers.findByPk(camper.id).then((camper) => {
      if (!camper) return;
      if (!camper.isRegistered) Campers.destroy({ where: { id: camper.id } });
    });
  });
};
