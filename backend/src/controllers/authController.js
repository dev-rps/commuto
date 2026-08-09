const authService = require("../services/authService");

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

class AuthController {
  async signup(req, res, next) {
    try {
      const result = await authService.signup(req.body);
      res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);
      res.status(201).json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);
      res.json({
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (err) {
      next(err);
    }
  }

  async refresh(req, res, next) {
    try {
      const tokenFromCookie = req.cookies?.refreshToken;
      const tokenFromBody = req.body?.refreshToken;
      const refreshToken = tokenFromCookie || tokenFromBody;

      const result = await authService.refresh(refreshToken);
      res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);
      res.json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getProfile(req.user.id);
      res.json({ user });
    } catch (err) {
      next(err);
    }
  }

  async updateMe(req, res, next) {
    try {
      const updatedUser = await authService.updateProfile(req.user.id, req.body);
      res.json({ user: updatedUser });
    } catch (err) {
      next(err);
    }
  }

  async completeProfile(req, res, next) {
    try {
      const { phone } = req.body;
      const updatedUser = await authService.updateProfile(req.user.id, { phone });
      res.json({ user: updatedUser });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
