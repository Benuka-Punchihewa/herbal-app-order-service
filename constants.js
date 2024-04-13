const constants = {
  PORT: 5001,
  API: {
    PREFIX: "/api/v1",
  },
  ACCESS: {
    ROLES: {
      ADMIN: "admin",
      SELLER: "seller",
      CUSTOMER: "customer",
      SERVICE: "service",
    },
  },
  USER: {
    ROLES: {
      ADMIN: "admin",
      SELLER: "seller",
      CUSTOMER: "customer",
    },
  },
  STATUSES: {
    PENDING: "pending",
    PAID: "paid",
    CONFIRMED: "confirmed",
    DISPATCHED: "dispatched",
    DELIVERED: "delivered",
  },
};

module.exports = constants;
