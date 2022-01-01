import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "./index";
import User from "./User";

interface ResetTokenAttributes {
  token: string;
  userId: number;
  isExpired: boolean;
}

interface ResetTokenCreationAttributes
  extends Optional<ResetTokenAttributes, "isExpired"> {}

class ResetToken
  extends Model<ResetTokenAttributes, ResetTokenCreationAttributes>
  implements ResetTokenAttributes
{
  public token!: string;
  public userId!: number;
  public isExpired!: boolean;
}

ResetToken.init(
  {
    token: {
      type: DataTypes.STRING,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
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

User.hasOne(ResetToken, { foreignKey: "userId" });
ResetToken.belongsTo(User, { foreignKey: "userId" });
