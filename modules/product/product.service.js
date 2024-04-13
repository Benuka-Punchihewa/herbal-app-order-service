const CommonUtil = require("../common/common.util");

const getById = async (productId) => {
  const AxiosInstance = CommonUtil.getAxiosInsance(
    process.env.PRODUCT_SERVICE_BASE_URL
  );
  const response = await AxiosInstance.get(`/products/${productId}`)
    .then((res) => {
      return CommonUtil.buildAxiosResponse(true, res.data);
    })
    .catch((err) => {
      console.log(err);
      return CommonUtil.buildAxiosResponse(
        false,
        err.response.data,
        err.response.status
      );
    });

  return response;
};

module.exports = { getById };
