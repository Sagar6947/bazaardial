/* server/models/User.js */
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    /* ───────── basic credentials ───────── */
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-zA-Z0-9_]+$/,
    },

    /* unique but only when provided */
    mobile: {
      type: String,
      unique: true,
      sparse: true, // ignore docs without mobile
      trim: true,
      match: /^\d{10}$/,
      required() {
        return !this.email; // mobile required if email missing
      },
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
    },

    avatar: { type: String, trim: true },

    /* ───────── verification flags ───────── */
    isVerified: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },

    /* ───────── role / FK ───────── */
    role: {
      type: String,
      enum: ["user", "owner"],
      default: "user",
    },
    businessId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
    },

    /* ───────── OTP & security ───────── */
    otp: { type: String, match: /^\d{5}$/ },
    otpExpires: Date,
    otpAttempts: { type: Number, default: 0 },
    otpAttemptsExpire: Date,

    emailOtp: { type: String, match: /^\d{5}$/ },
    emailOtpExpires: Date,
    emailOtpAttempts: { type: Number, default: 0 },
    emailOtpAttemptsExpire: Date,

    loginAttempts: { type: Number, default: 0 },
    lockUntil: Date,

    /* ───────── meta ───────── */
    passwordChangedAt: { type: Date, default: Date.now },
    profileCompletedAt: Date,
    lastLoginAt: Date,
  },
  { timestamps: true, versionKey: false }
);

/* ───── indexes ───── */
userSchema.index(
  { mobile: 1 },
  { unique: true, sparse: true, name: "mobile_1" }
);
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ isVerified: 1 });
userSchema.index({ isEmailVerified: 1 });
userSchema.index({ role: 1 });

/* ───── virtuals ───── */
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual("profileComplete").get(function () {
  return !!(
    this.username &&
    (this.mobile || this.email) &&
    (this.isVerified || this.isEmailVerified)
  );
});

userSchema.virtual("avatarUrl").get(function () {
  return this.avatar ? `/uploads/avatars/${this.avatar}` : null;
});

/* ───── instance methods ───── */
userSchema.methods.comparePassword = function (raw) {
  return bcrypt.compare(raw, this.password);
};

userSchema.methods.updateLastLogin = function () {
  this.lastLoginAt = new Date();
  return this.save();
};

userSchema.methods.markProfileCompleted = function () {
  if (!this.profileCompletedAt && this.profileComplete) {
    this.profileCompletedAt = new Date();
    return this.save();
  }
  return this;
};

/* ───── hooks ───── */
userSchema.pre("save", async function (next) {
  try {
    if (this.isModified("password") && !this.password.startsWith("$2")) {
      this.password = await bcrypt.hash(this.password, 12);
      this.passwordChangedAt = new Date();
    }

    this.username = this.username.toLowerCase().trim();

    if (this.mobile) this.mobile = this.mobile.replace(/\D/g, "").slice(-10);

    if (this.email) {
      this.email = this.email.toLowerCase().trim();
      if (!this.email) this.email = undefined;
    }

    if (!this.profileCompletedAt && this.profileComplete)
      this.profileCompletedAt = new Date();

    next();
  } catch (err) {
    next(err);
  }
});

userSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const upd = this.getUpdate();

    if (upd.password && !upd.password.startsWith("$2")) {
      upd.password = await bcrypt.hash(upd.password, 12);
      upd.passwordChangedAt = new Date();
      this.setUpdate(upd);
    }

    if (upd.email !== undefined) {
      upd.email =
        !upd.email || upd.email.trim() === ""
          ? undefined
          : upd.email.toLowerCase().trim();
      this.setUpdate(upd);
    }

    next();
  } catch (err) {
    next(err);
  }
});

/* ───── toJSON cleanup ───── */
userSchema.set("toJSON", {
  virtuals: true,
  transform(_doc, ret) {
    delete ret.password;

    delete ret.otp;
    delete ret.otpExpires;
    delete ret.otpAttempts;
    delete ret.otpAttemptsExpire;

    delete ret.emailOtp;
    delete ret.emailOtpExpires;
    delete ret.emailOtpAttempts;
    delete ret.emailOtpAttemptsExpire;

    delete ret.loginAttempts;
    delete ret.lockUntil;

    ret.profileComplete = this.profileComplete;
    ret.avatarUrl = this.avatarUrl;
    return ret;
  },
});

/* ───── statics ───── */
userSchema.statics.findByIdentifier = function (identifier) {
  if (/^\d{10}$/.test(identifier)) return this.findOne({ mobile: identifier });
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier))
    return this.findOne({ email: identifier.toLowerCase() });
  return this.findOne({ username: identifier.toLowerCase() });
};

userSchema.statics.getUserStats = async function (userId) {
  const user = await this.findById(userId)
    .populate("businessId", "name status createdAt")
    .select(
      "-password -otp -otpExpires -otpAttempts -otpAttemptsExpire " +
        "-emailOtp -emailOtpExpires -emailOtpAttempts -emailOtpAttemptsExpire " +
        "-loginAttempts -lockUntil"
    );

  if (!user) return null;

  return {
    user: user.toJSON(),
    stats: {
      memberSince: user.createdAt,
      lastLogin: user.lastLoginAt,
      profileCompletedAt: user.profileCompletedAt,
      isProfileComplete: user.profileComplete,
      hasAvatar: !!user.avatar,
      hasEmail: !!user.email,
    },
  };
};

module.exports = mongoose.model("User", userSchema);
