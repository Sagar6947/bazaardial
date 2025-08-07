const jwt = require("jsonwebtoken");

function signTokens(user) {
  const basePayload = {
    uid: user._id,
    role: user.role,
    businessId: user.businessId ?? null,
  };

  const accessToken = jwt.sign(basePayload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });

  const refreshToken = jwt.sign(
    { ...basePayload, type: "refresh" }, // explicitly mark as refresh
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    }
  );

  return { accessToken, refreshToken };
}

module.exports = { signTokens };
