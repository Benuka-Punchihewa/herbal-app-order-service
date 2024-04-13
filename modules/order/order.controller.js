const { StatusCodes } = require("http-status-codes");
const OrderUtil = require("./order.util");
const Order = require("./order.model");
const OrderService = require("./order.service");
const NotFoundError = require("../error/error.classes/NotFoundError");
const constants = require("../../constants");
const BadRequestError = require("../error/error.classes/BadRequestError");
const ForbiddenError = require("../error/error.classes/ForbiddenError");

const processCart = async (req, res) => {
  const { sellerId, deliveryService, cartItems } = req.body;
  const result = await OrderUtil.processCart(
    sellerId,
    deliveryService,
    cartItems
  );
  return res.status(StatusCodes.OK).json(result);
};

const createOrder = async (req, res) => {
  const auth = req.auth;
  const { sellerId, deliveryService, cartItems, shipping } = req.body;

  const processCartResult = await OrderUtil.processCart(
    sellerId,
    deliveryService,
    cartItems
  );

  const order = new Order({
    user: {
      _id: auth.user._id,
      name: auth.user.name,
      auth: auth.user.auth,
    },
    seller: {
      _id: processCartResult.seller._id,
      name: processCartResult.seller.name,
    },
    items: processCartResult.items,
    serviceCharge: processCartResult.serviceCharge,
    shippingCharge: processCartResult.shippingCost,
    subTotal: processCartResult.subTotal,
    total: processCartResult.total,
    shipping,
  });

  const dbOrder = await OrderService.save(order);

  return res.status(StatusCodes.CREATED).json(dbOrder);
};

const getById = async (req, res) => {
  const auth = req.auth;
  const { orderId } = req.params;

  const dbOrder = await OrderService.findById(orderId);
  if (!dbOrder) throw new NotFoundError("Order not found!");

  // validate authority
  if (
    auth.tokenPayload.accessRole !== constants.ACCESS.ROLES.SERVICE &&
    dbOrder.user._id.toString() !== auth.user._id.toString()
  )
    throw new ForbiddenError("You're unauthorized to access this resource!");

  return res.status(StatusCodes.OK).json(dbOrder);
};

const updateOrderStatus = async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const dbOrder = await OrderService.findById(orderId);
  if (!dbOrder) throw new NotFoundError("Order not found!");

  dbOrder.status = status;
  const dbUpdatedOrder = await OrderService.save(dbOrder);

  return res.status(StatusCodes.OK).json(dbUpdatedOrder);
};

const confirmOrder = async (req, res) => {
  const { orderId } = req.params;

  const dbOrder = await OrderService.findById(orderId);
  if (!dbOrder) throw new NotFoundError("Order not found!");

  // validate order
  if (dbOrder.status === constants.STATUSES.PENDING)
    throw new BadRequestError("Order has not been paid yet!");
  if (
    dbOrder.status === constants.STATUSES.CONFIRMED ||
    dbOrder.status === constants.STATUSES.DISPATCHED ||
    dbOrder.status === constants.STATUSES.DELIVERED
  )
    throw new BadRequestError("Order has already been confirmed!");

  dbOrder.status = constants.STATUSES.CONFIRMED;
  const dbUpdatedOrder = await OrderService.save(dbOrder);

  return res.status(StatusCodes.OK).json(dbUpdatedOrder);
};

const getPaginatedOrders = async (req, res) => {
  const pageable = req.pageable;
  const dbOrders = await OrderService.findPaginatedOrders(pageable);
  return res.status(StatusCodes.OK).json(dbOrders);
};

const getPaginatedSelfOrders = async (req, res) => {
  const pageable = req.pageable;
  const auth = req.auth;
  const dbOrders = await OrderService.findPaginatedOrdersByUserId(
    auth.user._id,
    pageable
  );
  return res.status(StatusCodes.OK).json(dbOrders);
};

module.exports = {
  processCart,
  createOrder,
  getById,
  updateOrderStatus,
  confirmOrder,
  getPaginatedOrders,
  getPaginatedSelfOrders,
};
