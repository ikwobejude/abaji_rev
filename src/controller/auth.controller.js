const Auth = require("../classes/auth.service");

const data = new Auth();

class AuthController {
  static async signInPage(req, res) {
    res.render("./login");
  }

  static async signIn(req, res) {
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
  }

  static async logout(req, res) {
    // const data = new Auth();
    const response = data.logOut();
    res.cookie("jwt", "", response);
    res.redirect("/");
  }

  static async resetPassword(req, res) {
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
  }

  static async mobileLogin(req, res){
    try {
      // Step 1: Authenticate user
      const response = await data.loginUser(req.body);

      // Step 2: Validate response
      if (!response || !response.token || !response.user) {
        throw new Error("Invalid response from Auth.login()");
      }

      const user = response.user.user;
      const responseData = {
        user: user.id,
        group: user.group_id,
        email: user.email,
        phone: user.user_phone,
        fullname: user.name,
        username: user.username,
        token: response.token,
        refreshToken: response.refreshToken,
        first_use: user.first_use,
        service_code: user.service_code,
        lga: user.lga,
      };

      // Step 5: Send success response
      return res.status(200).json({
        status: "success",
        message: "Login Successful",
        data: responseData,
      });

    } catch (error) {
      console.error("Error during login process:", error);

      // Step 6: Handle errors gracefully
      if (res.headersSent) {
        console.error("Response headers already sent, cannot modify response.");
        return; // Avoid further response modification
      }

      // Send error response
      res.status(500).json({
        status: "error",
        message: error.message || "Internal Server Error",
      });
    }
  }


  // Locations

  


}

module.exports = AuthController

