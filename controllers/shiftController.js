const db = require("../models/database");

const Campers = db.shiftCampers;

const exists = async (id) => {
  const camper = await Campers.findByPk(id);
  return !!camper;
};

const addCamper = async (shift, name) => {
  try {
    await Campers.create({
      shift: shift,
      name: name,
    });
    return true;
  } catch {
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
  } catch {
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
  } catch {
    return false;
  }
};

exports.add = async (req, res) => {
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
