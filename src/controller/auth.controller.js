const Auth = require("../classes/auth.service");

const data = new Auth();

module.exports = {
  signInPage: async function (req, res) {
    res.render("./login");
  },
  signIn: async function (req, res) {
    try {
      const response = await data.loginUser(req.body);

      const dt = response.user.user;
      res.cookie(response.jwt, response.token, {
        httpOnly: true,
        masAge: response.data.masAge,
      });
      res.status(200).json({
        status: "success",
        message: "Login Successful",
        data: {
          user: dt.id,
          group: dt.group_id,
          email: dt.email,
          phone: dt.user_phone,
          fullname: dt.name,
          username: dt.username,
          token: response.token,
        },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: false,
        message: error.message,
      });
    }
  },

  logout: async function (req, res) {
    // const data = new Auth();
    const response = data.logOut();
    res.cookie("jwt", "", response);
    res.redirect("/");
  },
  resetPassword: async function (req, res) {
    try {
      const requestData = req.body;
      console.log({ data });
      const response = await data.resetPassword(requestData);
      res.status(201).json({
        status: true,
        message: "Password Change Successful",
        response,
      });
    } catch (error) {
      res
        .status(500)
        .json({ status: false, message: `error changing password ${error}` });
    }
  },
};
