const bcrypt = require("bcrypt");
const userRepository = require("../repositories/userRepository");
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} = require("../lib/jwt");

class AuthService {
  async signup({ name, email, password, role, organizationId }) {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      const error = new Error("User with this email already exists");
      error.status = 409;
      throw error;
    }

    const org = await userRepository.findOrganizationById(organizationId);
    if (!org) {
      const error = new Error("Organization not found");
      error.status = 404;
      throw error;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await userRepository.createUser({
      name,
      email,
      passwordHash,
      role,
      organizationId,
    });

    const tokenPayload = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      organizationId: newUser.organizationId,
      name: newUser.name,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken({ id: newUser.id });

    return { user: newUser, accessToken, refreshToken };
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const error = new Error("Invalid email or password");
      error.status = 401;
      throw error;
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      name: user.name,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken({ id: user.id });

    const { passwordHash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, accessToken, refreshToken };
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      const error = new Error("Refresh token missing");
      error.status = 401;
      throw error;
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (_err) {
      const error = new Error("Invalid or expired refresh token");
      error.status = 401;
      throw error;
    }

    const user = await userRepository.findById(decoded.id);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      name: user.name,
    };

    const newAccessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken({ id: user.id });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, user };
  }

  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const error = new Error("User not found");
      error.status = 404;
      throw error;
    }

    return userRepository.updateUser(userId, updateData);
  }
}

module.exports = new AuthService();
