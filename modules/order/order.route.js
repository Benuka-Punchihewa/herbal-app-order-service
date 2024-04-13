const express = require("express");
const OrderController = require("./order.controller");
const AuthMiddleware = require("../auth/auth.middleware");
const constants = require("../../constants");
const CommonMiddleware = require("../common/common.middleware");

const router = express.Router();

// process cart
router.post(
  "/cart",
  AuthMiddleware.authorize([constants.ACCESS.ROLES.CUSTOMER]),
  OrderController.processCart
);

// create order
router.post(
  "/",
  AuthMiddleware.authorize([constants.ACCESS.ROLES.CUSTOMER]),
  OrderController.createOrder
);

// get order by id
router.get(
  "/:orderId",
  AuthMiddleware.authorize([
    constants.ACCESS.ROLES.SERVICE,
    constants.ACCESS.ROLES.CUSTOMER,
    constants.ACCESS.ROLES.SELLER,
    constants.ACCESS.ROLES.ADMIN,
  ]),
  OrderController.getById
);

// update order status
router.patch(
  "/:orderId/status",
  AuthMiddleware.authorize([constants.ACCESS.ROLES.SERVICE]),
  OrderController.updateOrderStatus
);

// confirm order
router.patch(
  "/:orderId/confirm",
  CommonMiddleware.paginate,
  AuthMiddleware.authorize([constants.ACCESS.ROLES.ADMIN]),
  OrderController.confirmOrder
);

// get orders paginated
router.get(
  "/",
  CommonMiddleware.paginate,
  AuthMiddleware.authorize([constants.ACCESS.ROLES.ADMIN]),
  OrderController.getPaginatedOrders
);

// get self orders paginated
router.get(
  "/self/all",
  CommonMiddleware.paginate,
  AuthMiddleware.authorize([constants.ACCESS.ROLES.CUSTOMER]),
  OrderController.getPaginatedSelfOrders
);

module.exports = router;
