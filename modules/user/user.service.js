const CommonUtil = require("../common/common.util");

const getUserByUserId = async (userId) => {
  const AxiosInstance = CommonUtil.getAxiosInsance(
    process.env.USER_SERVICE_BASE_URL
  );
  const response = await AxiosInstance.get(`/users/${userId}`)
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

module.exports = { getUserByUserId };
