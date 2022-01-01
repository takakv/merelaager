import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

interface ChildAttributes {
  id: number;
  name: string;
  gender: string;
  yearsAtCamp: number;
  notes: string;
}

interface ChildCreationAttributes
  extends Optional<ChildAttributes, "id" | "yearsAtCamp" | "notes"> {}

class Child
  extends Model<ChildAttributes, ChildCreationAttributes>
  implements ChildAttributes
{
  public id!: number;
  public name!: string;
  public gender!: string;
  public yearsAtCamp: number;
  public notes: string;
}

Child.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gender: {
      type: DataTypes.ENUM("M", "F"),
      allowNull: false,
    },
    yearsAtCamp: {
      type: DataTypes.INTEGER.UNSIGNED,
    },
    notes: {
      type: DataTypes.TEXT,
    },
  },
  { tableName: "children", sequelize }
);

export default Child;
