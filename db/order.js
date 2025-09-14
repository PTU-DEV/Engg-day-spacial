import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  orderCount: { type: Number, required: true, default: 1 },
  total: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
});

// Create or update order
orderSchema.statics.createOrder = async function (
  uid,
  customerName,
  customerPhone,
  items,
  total
) {
  const existing = await this.findOne({ uid }).exec();

  if (existing) {
    // Merge items by name instead of pushing blindly
    items.forEach(newItem => {
      const existingItem = existing.items.find(i => i.name === newItem.name);
      if (existingItem) {
        existingItem.quantity += newItem.quantity;
      } else {
        existing.items.push(newItem);
      }
    });

    existing.total += total;
    existing.orderCount += 1;
    return existing.save();
  }

  const order = new this({ uid, customerName, customerPhone, items, total });
  return order.save();
};

// Get all orders
orderSchema.statics.getAllOrders = function () {
  return this.find()
    .sort({ total: -1, orderCount: -1 })
    .exec()
    .then(orders =>
      orders.map(order => ({
        uid: order.uid,
        customerName: order.customerName,
        total: order.total,
        orderCount: order.orderCount,
      }))
    );
};

// Get top orders (leaderboard style)
orderSchema.statics.topPerformers = function (limit = 5) {
  return this.find()
    .sort({ total: -1, orderCount: -1 })
    .limit(limit)
    .exec()
    .then(orders =>
      orders.map(order => ({
        customerName: order.customerName,
        total: order.total,
        orderCount: order.orderCount,
      }))
    );
};

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
