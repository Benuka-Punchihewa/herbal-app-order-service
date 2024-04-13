const { default: mongoose } = require("mongoose");
const Order = require("./order.model");

const save = async (order) => {
  return order.save();
};

const findById = async (id) => {
  return Order.findById(id);
};

const findPaginatedOrders = async (pageableObj) => {
  const pipeline = [];

  const queryObj = {};

  pipeline.push({
    $match: queryObj,
  });

  pipeline.push({
    $sort: {
      _id: pageableObj.orderBy === "asc" ? 1 : -1,
    },
  });

  pipeline.push({
    $facet: {
      metadata: [{ $count: "totalElements" }],
      data: [
        { $skip: (pageableObj.page - 1) * pageableObj.limit },
        { $limit: pageableObj.limit },
      ],
    },
  });

  const result = await Order.aggregate(pipeline);

  const content = result[0].data;
  const totalElements = result[0]?.metadata[0]?.totalElements || 0;

  return {
    content,
    totalElements,
    totalPages: Math.ceil(totalElements / pageableObj.limit),
  };
};

const findPaginatedOrdersByUserId = async (userId, pageableObj) => {
  const pipeline = [];

  const queryObj = {
    "user._id": new mongoose.Types.ObjectId(userId.toString()),
  };

  pipeline.push({
    $match: queryObj,
  });

  pipeline.push({
    $sort: {
      _id: pageableObj.orderBy === "asc" ? 1 : -1,
    },
  });

  pipeline.push({
    $facet: {
      metadata: [{ $count: "totalElements" }],
      data: [
        { $skip: (pageableObj.page - 1) * pageableObj.limit },
        { $limit: pageableObj.limit },
      ],
    },
  });

  const result = await Order.aggregate(pipeline);

  const content = result[0].data;
  const totalElements = result[0]?.metadata[0]?.totalElements || 0;

  return {
    content,
    totalElements,
    totalPages: Math.ceil(totalElements / pageableObj.limit),
  };
};

module.exports = {
  save,
  findById,
  findPaginatedOrders,
  findPaginatedOrdersByUserId,
};
