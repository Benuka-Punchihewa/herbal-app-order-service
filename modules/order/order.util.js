const BadRequestError = require("../error/error.classes/BadRequestError");
const NotFoundError = require("../error/error.classes/NotFoundError");
const ProductService = require("../product/product.service");
const UserService = require("../user/user.service");
const Constants = require("../../constants");

const processCart = async (sellerId, deliveryService, cartItems) => {
  const orderItems = [];
  let subTotal = 0;

  // validate seller
  const dbUser = await UserService.getUserByUserId(sellerId);
  if (!dbUser)
    throw new NotFoundError(`Seller with ID, ${sellerId} does not exist!`);
  if (dbUser.role !== Constants.USER.ROLES.SELLER)
    throw new BadRequestError(`User with ID, ${sellerId} is not a seller!`);

  // delivery service
  const shippingCost = 500; // TODO: push this to delivery service later

  for (const cartItem of cartItems) {
    // validations
    if (!cartItem.product?._id)
      throw new BadRequestError("Product ID is required!");
    if (!cartItem.quantity)
      throw new BadRequestError(
        `Quantity for the product with ID, ${cartItem.product._id} is required!`
      );

    const dbProduct = await ProductService.getById(cartItem.product._id);
    if (!dbProduct)
      throw new NotFoundError(
        `A product with ID, ${cartItem.product._id} does not exist!`
      );
    if (dbProduct.seller?.user?.toString() !== sellerId.toString())
      throw new BadRequestError(
        `Product with ID, ${cartItem.product._id} does not belong to the selected seller with seller ID, ${sellerId}!`
      );

    // calculate item total price
    const itemTotalPrice = dbProduct.price * cartItem.quantity;

    const orderItem = {
      product: {
        ...dbProduct,
      },
      quantity: cartItem.quantity,
      total: itemTotalPrice,
    };

    subTotal += itemTotalPrice;
    orderItems.push(orderItem);
  }

  // 10% service charge
  const serviceCharge = (subTotal + shippingCost) * 0.1;
  const total = subTotal + shippingCost + serviceCharge;

  return {
    seller: dbUser,
    items: orderItems,
    subTotal,
    shippingCost,
    serviceCharge,
    total,
  };
};

module.exports = {
  processCart,
};
