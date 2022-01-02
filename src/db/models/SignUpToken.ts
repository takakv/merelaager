import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";

interface SignUpTokenAttributes {
  token: string;
  isExpired: boolean;
  shiftNr: number;
  role: string;
  usedDate: Date;
}

interface SignUpTokenCreationAttributes
  extends Optional<SignUpTokenAttributes, "isExpired" | "role" | "usedDate"> {}

class SignUpToken
  extends Model<SignUpTokenAttributes, SignUpTokenCreationAttributes>
  implements SignUpTokenAttributes
{
  public token!: string;
  public isExpired!: boolean;
  public shiftNr!: number;
  public role!: string;
  public usedDate: Date;
}

SignUpToken.init(
  {
    token: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    isExpired: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    shiftNr: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("boss", "master", "op", "std", "camper"),
      allowNull: false,
      defaultValue: "std",
    },
    usedDate: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "signup_tokens",
    sequelize,
  }
);

export default SignUpToken;
