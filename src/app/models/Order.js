import { Sequelize, Model } from 'sequelize';

class Order extends Model {
  static init(sequelize) {
    super.init(
      {
        recipient_id: Sequelize.INTEGER,
        deliveryman_id: Sequelize.INTEGER,
        product: Sequelize.STRING,        
      },
      {
        sequelize
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Recipient, { foreignKey: 'recipient_id', as: 'recipient' });
    this.belongsTo(models.Deliveryman, { foreignKey: 'deliveryman_id', as: 'deliveryman' });
  }
}

export default Order;