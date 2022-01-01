import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

interface RegistrationAttributes {
  id: number;
  idCode: string;
  shiftNr: number;
  isRegistered: boolean;
  regOrder: number;
  isOld: boolean;
  birthday: Date;
  tsSize: string;
  addendum: string;
  road: string;
  city: string;
  county: string;
  country: string;
  billNr: number;
  contactName: string;
  contactNumber: string;
  contactEmail: string;
  backupTel: string;
  pricePaid: number;
  priceToPay: number;
}

interface RegistrationCreationAttributes
  extends Optional<RegistrationAttributes, "id"> {}

class Registration
  extends Model<RegistrationAttributes, RegistrationCreationAttributes>
  implements RegistrationAttributes
{
  public id!: number;
  public idCode: string;
  public shiftNr!: number;
  public isRegistered!: boolean;
  public regOrder!: number;
  isOld!: boolean;
  birthday: Date;
  tsSize: string;
  addendum: string;
  road: string;
  city: string;
  county: string;
  country: string;
  billNr: number;
  contactName!: string;
  contactNumber: string;
  contactEmail!: string;
  backupTel: string;
  pricePaid: number;
  priceToPay: number;
}

Registration.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    idCode: {
      type: DataTypes.STRING,
    },
    shiftNr: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    isRegistered: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    regOrder: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    isOld: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    birthday: {
      type: DataTypes.DATEONLY,
    },
    tsSize: {
      type: DataTypes.TEXT,
    },
    addendum: {
      type: DataTypes.TEXT,
    },
    road: {
      type: DataTypes.TEXT,
    },
    city: {
      type: DataTypes.TEXT,
    },
    county: {
      type: DataTypes.TEXT,
    },
    country: {
      type: DataTypes.TEXT,
      defaultValue: "Eesti",
    },
    billNr: {
      type: DataTypes.INTEGER.UNSIGNED,
    },
    contactName: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    contactNumber: {
      type: DataTypes.TEXT,
    },
    contactEmail: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    backupTel: {
      type: DataTypes.TEXT,
    },
    pricePaid: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
    },
    priceToPay: {
      type: DataTypes.INTEGER.UNSIGNED,
      defaultValue: 0,
    },
  },
  { tableName: "registrations", sequelize }
);

export default Registration;
