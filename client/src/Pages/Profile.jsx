// src/components/Profile.jsx
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiEdit3,
  FiSave,
  FiX,
  FiLogOut,
  FiCamera,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

/* ───────── small reusable input helpers ───────── */
function TextField({
  icon,
  children,
  className = "",
  disabled = false,
  ...props
}) {
  return (
    <div
      className={`flex items-center border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-orange-400 ${
        disabled ? "bg-gray-50" : ""
      } ${className}`}
    >
      <span className="text-gray-400 mr-2">{icon}</span>
      <input
        className={`w-full outline-none placeholder-gray-400 ${
          disabled ? "bg-gray-50 text-gray-600" : ""
        }`}
        disabled={disabled}
        {...props}
      />
      {children}
    </div>
  );
}

function PasswordField({
  icon,
  value,
  onChange,
  show,
  toggle,
  placeholder,
  disabled = false,
}) {
  return (
    <TextField
      icon={icon}
      type={show ? "text" : "password"}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete="current-password"
    >
      <button
        type="button"
        onClick={toggle}
        className="text-gray-400 ml-2"
        aria-label="Toggle password visibility"
        disabled={disabled}
      >
        {show ? <FiEyeOff /> : <FiEye />}
      </button>
    </TextField>
  );
}

/* ───────── main profile component ───────── */
export default function Profile() {
  const navigate = useNavigate();
  const { logout, token, ready } = useContext(AuthContext);
  const { t } = useTranslation();

  /* redirect guests */
  if (!ready) return null;
  if (!token) {
    navigate("/signin", { replace: true });
    return null;
  }

  /* profile state */
  const [profile, setProfile] = useState({
    username: "",
    mobile: "",
    email: "",
    avatar: null,
  });

  /* edit/password form state */
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  /* ui state */
  const [ui, setUi] = useState({
    mode: "view",
    loading: false,
    error: "",
    success: "",
  });
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  /* fetch profile on mount */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setUi((u) => ({ ...u, loading: true }));
        const { data } = await axios.get("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(data);
        setEditForm((form) => ({
          ...form,
          username: data.username,
          email: data.email || "",
        }));
        setUi((u) => ({ ...u, loading: false }));
      } catch (err) {
        setUi((u) => ({
          ...u,
          loading: false,
          error: t("profile.load_error"),
        }));
      }
    };
    fetchProfile();
  }, [token, t]);

  /* helper to update form fields */
  const upd = (field) => (e) => {
    setEditForm((f) => ({ ...f, [field]: e.target.value }));
    if (ui.error) setUi((u) => ({ ...u, error: "" }));
  };

  /* validations */
  const validateProfile = () => {
    const { username, email } = editForm;
    if (!username.trim()) return t("profile.username_required");
    if (username.trim().length < 3) return t("profile.username_length");
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return t("profile.invalid_email");
    return null;
  };

  const validatePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = editForm;
    if (!currentPassword) return t("profile.current_password_required");
    if (!newPassword) return t("profile.new_password_required");
    if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(newPassword))
      return t("profile.new_password_pattern");
    if (newPassword !== confirmPassword) return t("profile.password_mismatch");
    return null;
  };

  /* submit profile update */
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const msg = validateProfile();
    if (msg) return setUi((u) => ({ ...u, error: msg }));

    try {
      setUi((u) => ({ ...u, loading: true }));
      const { data } = await axios.put(
        "/api/user/profile",
        { username: editForm.username.trim(), email: editForm.email.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(data);
      setEditForm((f) => ({
        ...f,
        username: data.username,
        email: data.email || "",
      }));
      setUi({
        mode: "view",
        loading: false,
        error: "",
        success: t("profile.update_success"),
      });
    } catch {
      setUi((u) => ({
        ...u,
        loading: false,
        error: t("profile.update_error"),
      }));
    }
  };

  /* submit password change */
  const handleChangePassword = async (e) => {
    e.preventDefault();
    const msg = validatePassword();
    if (msg) return setUi((u) => ({ ...u, error: msg }));

    try {
      setUi((u) => ({ ...u, loading: true }));
      await axios.put(
        "/api/user/change-password",
        {
          currentPassword: editForm.currentPassword,
          newPassword: editForm.newPassword,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditForm((f) => ({
        ...f,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      setUi({
        mode: "view",
        loading: false,
        error: "",
        success: t("profile.password_change_success"),
      });
    } catch {
      setUi((u) => ({
        ...u,
        loading: false,
        error: t("profile.password_change_error"),
      }));
    }
  };

  /* avatar upload */
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      setUi((u) => ({ ...u, loading: true }));
      const { data } = await axios.post("/api/user/avatar", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setProfile((p) => ({ ...p, avatar: data.avatar }));
      setUi((u) => ({
        ...u,
        loading: false,
        success: t("profile.avatar_success"),
      }));
    } catch {
      setUi((u) => ({
        ...u,
        loading: false,
        error: t("profile.avatar_error"),
      }));
    }
  };

  /* logout */
  const handleLogout = () => {
    logout();
    navigate("/signin", { replace: true });
  };

  /* cancel edit/password modes */
  const cancelEdit = () => {
    setEditForm((f) => ({
      ...f,
      username: profile.username,
      email: profile.email || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
    setUi((u) => ({ ...u, mode: "view", error: "", success: "" }));
  };

  /* loader while fetching */
  if (ui.loading && !profile.username) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-orange-50">
        <div className="text-orange-500">{t("profile.loading")}</div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-orange-50 px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-orange-500">
              {t("profile.title")}
            </h1>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
            >
              <FiLogOut />
              {t("profile.logout")}
            </button>
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center overflow-hidden">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiUser className="w-8 h-8 text-orange-400" />
                )}
              </div>
              <label className="absolute -bottom-1 -right-1 bg-orange-500 text-white p-1 rounded-full cursor-pointer hover:bg-orange-600 transition-colors">
                <FiCamera className="w-3 h-3" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {profile.username}
              </h2>
              <p className="text-gray-600">{profile.mobile}</p>
            </div>
          </div>

          {/* Action buttons */}
          {ui.mode === "view" && (
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setUi((u) => ({ ...u, mode: "edit", error: "", success: "" }))
                }
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <FiEdit3 />
                {t("profile.edit")}
              </button>
              <button
                onClick={() =>
                  setUi((u) => ({
                    ...u,
                    mode: "password",
                    error: "",
                    success: "",
                  }))
                }
                className="flex items-center gap-2 border border-orange-500 text-orange-500 hover:bg-orange-50 px-4 py-2 rounded-lg transition-colors"
              >
                <FiLock />
                {t("profile.change_password")}
              </button>
            </div>
          )}
        </div>

        {/* messages */}
        {ui.error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4 text-sm">
            {ui.error}
          </div>
        )}
        {ui.success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded mb-4 text-sm">
            {ui.success}
          </div>
        )}

        {/* VIEW mode */}
        {ui.mode === "view" && (
          <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {t("profile.info")}
            </h3>
            <div className="space-y-4">
              <TextField
                icon={<FiUser />}
                value={profile.username}
                disabled
                placeholder={t("profile.username")}
              />
              <TextField
                icon={<FiPhone />}
                value={profile.mobile}
                disabled
                placeholder={t("profile.mobile")}
              />
              <TextField
                icon={<FiMail />}
                value={
                  profile.email ||
                  t("profile.no_email", { defaultValue: "No email added" })
                }
                disabled
                placeholder={t("profile.email")}
              />
            </div>
          </div>
        )}

        {/* EDIT mode */}
        {ui.mode === "edit" && (
          <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {t("profile.edit")}
              </h3>
              <button
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <TextField
                icon={<FiUser />}
                placeholder={t("profile.username")}
                value={editForm.username}
                onChange={upd("username")}
                required
              />
              <TextField
                icon={<FiPhone />}
                value={profile.mobile}
                disabled
                placeholder={t("profile.mobile_note")}
              />
              <TextField
                icon={<FiMail />}
                type="email"
                placeholder={t("profile.optional_email")}
                value={editForm.email}
                onChange={upd("email")}
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={ui.loading}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FiSave />
                  {ui.loading ? t("profile.saving") : t("profile.save_changes")}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
                >
                  {t("profile.cancel")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* PASSWORD mode */}
        {ui.mode === "password" && (
          <div className="bg-white rounded-xl shadow-lg border border-orange-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {t("profile.change_password")}
              </h3>
              <button
                onClick={cancelEdit}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <PasswordField
                icon={<FiLock />}
                value={editForm.currentPassword}
                onChange={upd("currentPassword")}
                show={show.current}
                toggle={() => setShow((s) => ({ ...s, current: !s.current }))}
                placeholder={t("profile.current_password")}
              />
              <PasswordField
                icon={<FiLock />}
                value={editForm.newPassword}
                onChange={upd("newPassword")}
                show={show.new}
                toggle={() => setShow((s) => ({ ...s, new: !s.new }))}
                placeholder={t("profile.new_password")}
              />
              <PasswordField
                icon={<FiLock />}
                value={editForm.confirmPassword}
                onChange={upd("confirmPassword")}
                show={show.confirm}
                toggle={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                placeholder={t("profile.confirm_password")}
              />
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={ui.loading}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FiSave />
                  {ui.loading ? t("profile.changing") : t("profile.change")}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="border border-gray-300 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
                >
                  {t("profile.cancel")}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
