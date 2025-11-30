// models/refreshToken.model.js
export default (sequelize, DataTypes) => {
    const RefreshToken = sequelize.define(
      "RefreshToken",
      {
        id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
        tokenHash: { type: DataTypes.STRING, allowNull: false }, // sha256(token)
        userId: { type: DataTypes.UUID, allowNull: false },
        userType: { type: DataTypes.STRING, allowNull: false }, // "mine" or "shipping"
        ip: { type: DataTypes.STRING, allowNull: true },
        userAgent: { type: DataTypes.TEXT, allowNull: true },
        revoked: { type: DataTypes.BOOLEAN, defaultValue: false },
        replacedByTokenId: { type: DataTypes.UUID, allowNull: true }, // id of token that replaced this one
        createdAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
        expiresAt: { type: DataTypes.DATE, allowNull: false },
        lastUsedAt: { type: DataTypes.DATE, allowNull: true },
      },
      {
        tableName: "refresh_tokens",
        timestamps: false,
      }
    );
  
    return RefreshToken;
  };
  