import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index";

interface RecordAttributes {
  id: number;
  shiftNr: number;
  year: number;
}

class Record extends Model<RecordAttributes> implements RecordAttributes {
  public id!: number;
  public shiftNr!: number;
  public year!: number;
}

Record.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    shiftNr: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      defaultValue: new Date().getFullYear(),
    },
  },
  { tableName: "records", sequelize }
);

export default Record;
