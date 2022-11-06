import { StatusCodes } from "http-status-codes";
import { Permission } from "../db/models/Permission";
import { ACGroup } from "../db/models/ACGroup";

export type acRequest = {
  name: string;
};

export const createPermission = async (data: acRequest) => {
  const { name } = data;

  try {
    const [, created] = await Permission.findOrCreate({
      where: { name },
    });
    if (created) return StatusCodes.CREATED;
    return StatusCodes.NOT_MODIFIED;
  } catch (e) {
    console.error(e);
    return StatusCodes.INTERNAL_SERVER_ERROR;
  }
};

export const createACGroup = async (data: acRequest) => {
  const { name } = data;

  try {
    const [, created] = await ACGroup.findOrCreate({
      where: { name },
    });
    if (created) return StatusCodes.CREATED;
    return StatusCodes.NOT_MODIFIED;
  } catch (e) {
    console.error(e);
    return StatusCodes.INTERNAL_SERVER_ERROR;
  }
};
