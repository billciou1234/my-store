'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // Order.belongsToMany(models.Product, {
      //   as: 'items',
      //   through: {
      //     model: models.OrderItem, unique: false
      //   },
      //   foreignKey: 'OrderId'
      // })
      Order.belongsTo(models.User)
      Order.hasMany(models.OrderItem)
      // Order.hasMany(models.Payment)
    }
  };
  Order.init({
    name: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    amount: DataTypes.INTEGER,
    sn: DataTypes.STRING,
    shipping_status: DataTypes.STRING,
    payment_status: DataTypes.STRING,
    UserId: DataTypes.INTEGER,
    paysn: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Order',
  });
  return Order;
};