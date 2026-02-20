import { createContext, useContext, useState, useEffect } from "react";
import { apiRequest, clearAuthToken, setAuthToken } from "@/lib/apiClient";

// Keep context identity stable across Fast Refresh/HMR
const AUTH_CONTEXT_KEY = "__DEVLINKER_AUTH_CONTEXT__";

const existingContext = globalThis[AUTH_CONTEXT_KEY];

const AuthContext = existingContext ?? createContext(null);

if (!existingContext) {
  globalThis[AUTH_CONTEXT_KEY] = AuthContext;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapBackendUserToProfile = (backendUser) => {
    if (!backendUser) return null;

    // Keep shape similar to what the UI expects
    return {
      id: backendUser._id,
      name: backendUser.fullName,
      avatar_url: backendUser.photoUrl,
      is_premium: Boolean(backendUser.isPremium),
      bio: backendUser.bio ?? backendUser.about,
      skills: backendUser.skills,
      role: backendUser.role,
      availability: backendUser.availability,
      experience: backendUser.experience,
      location: backendUser.location,
      github: backendUser.github,
      linkedin: backendUser.linkedin,
      portfolio: backendUser.portfolio,
      email: backendUser.emailId,
    };
  };

  const isProfileComplete = (backendUser) => {
    if (typeof backendUser?.isProfileComplete === "boolean") {
      return backendUser.isProfileComplete;
    }
    const skillsCount = Array.isArray(backendUser?.skills)
      ? backendUser.skills.length
      : 0;
    return Boolean(backendUser?.role) && Boolean(backendUser?.availability) && skillsCount >= 3;
  };

  const fetchProfile = async () => {
    try {
      const backendUser = await apiRequest("/profile/profile/view", {
        method: "GET",
      });

      setUser(backendUser);
      setSession(null);
      setProfile(isProfileComplete(backendUser) ? mapBackendUserToProfile(backendUser) : null);
      return { data: backendUser, error: null };
    } catch (error) {
      // Not logged in or server error; treat as logged out
      setUser(null);
      setSession(null);
      setProfile(null);
      return { data: null, error };
    }
  };

  useEffect(() => {
    fetchProfile().finally(() => setLoading(false));
  }, []);

  const signIn = async (email, password) => {
    try {
      const backendUser = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ emailId: email, password }),
      });

      const token = backendUser?.token;
      if (token) {
        setAuthToken(token);
      }

      setUser(backendUser);
      setSession(null);
      setProfile(isProfileComplete(backendUser) ? mapBackendUserToProfile(backendUser) : null);

      return { data: backendUser, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signUp = async (email, password, fullName, confirmPassword) => {
    const trimmedName = String(fullName || "").trim();
    const parts = trimmedName.split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      return {
        data: null,
        error: new Error("Please enter your first and last name"),
      };
    }

    const firstName = parts[0];
    const lastName = parts.slice(1).join(" ");

    try {
      const result = await apiRequest("/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          firstName,
          lastName,
          fullName: trimmedName,
          emailId: email,
          password,
          confirmPassword,
        }),
      });

      const backendUser = result?.data ?? null;

      const token = backendUser?.token;
      if (token) {
        setAuthToken(token);
      }

      setUser(backendUser);
      setSession(null);
      setProfile(isProfileComplete(backendUser) ? mapBackendUserToProfile(backendUser) : null);

      return { data: backendUser, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    let error = null;
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } catch (err) {
      error = err;
    } finally {
      clearAuthToken();
      setUser(null);
      setSession(null);
      setProfile(null);
    }
    return { error };
  };

  const createProfile = async (profileData) => {
    if (!user) {
      return { data: null, error: new Error("No user logged in") };
    }

    const updates = {
      bio: profileData.bio,
      skills: profileData.skills,
      photoUrl: profileData.avatar_url,
      role: profileData.role,
      experience: profileData.experience,
      location: profileData.location,
      availability: profileData.availability,
      github: profileData.github,
      linkedin: profileData.linkedin,
      portfolio: profileData.portfolio,
    };

    try {
      const result = await apiRequest("/auth/onboarding", {
        method: "POST",
        body: JSON.stringify(updates),
      });

      const updatedUser = result?.data ?? user;
      setUser(updatedUser);
      setProfile(isProfileComplete(updatedUser) ? mapBackendUserToProfile(updatedUser) : null);
      return { data: updatedUser, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const updateProfile = async (updates) => {
    if (!user) {
      return { data: null, error: new Error("No user logged in") };
    }

    const mappedUpdates = {
      about: updates.bio,
      skills: updates.skills,
      photoUrl: updates.avatar_url,
      role: updates.role,
      experience: updates.experience,
      location: updates.location,
      availability: updates.availability,
      github: updates.github,
      linkedin: updates.linkedin,
      portfolio: updates.portfolio,
    };

    try {
      const result = await apiRequest("/profile/profile/edit", {
        method: "PATCH",
        body: JSON.stringify(mappedUpdates),
      });

      const updatedUser = result?.data ?? user;
      setUser(updatedUser);
      setProfile(isProfileComplete(updatedUser) ? mapBackendUserToProfile(updatedUser) : null);

      return { data: updatedUser, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const uploadProfilePhoto = async (file) => {
    if (!user) {
      return { data: null, error: new Error("No user logged in") };
    }
    if (!file) {
      return { data: null, error: new Error("No file selected") };
    }

    const form = new FormData();
    form.append("photo", file);

    try {
      const result = await apiRequest("/profile/profile/photo", {
        method: "POST",
        body: form,
        isFormData: true,
      });

      const updatedUser = result?.data ?? user;
      setUser(updatedUser);
      setProfile(isProfileComplete(updatedUser) ? mapBackendUserToProfile(updatedUser) : null);

      return { data: updatedUser, error: null };
    } catch (error) {
      return { data: null, error };
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    createProfile,
    updateProfile,
    uploadProfilePhoto,
    fetchProfile: () => fetchProfile(),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
