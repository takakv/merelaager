import { DataTypes, Model } from "sequelize";
import { sequelize } from "./index";

interface ResetTokenAttributes {
  token: string;
  isExpired: boolean;
}

class ResetToken
  extends Model<ResetTokenAttributes>
  implements ResetTokenAttributes
{
  public token!: string;
  public isExpired!: boolean;
}

ResetToken.init(
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
  },
  { tableName: "reset_tokens", sequelize }
);

export default ResetToken;
