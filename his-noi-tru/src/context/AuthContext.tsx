import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, PatientProfile, DoctorProfile } from '../types/auth';
import { MockApi } from '../services/mockApi';
import { INITIAL_PATIENT, INITIAL_DOCTORS } from '../services/mockData';

interface AuthContextType {
  user: User | null;
  patientProfile: PatientProfile | null;
  doctorProfile: DoctorProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginEmail: (email: string, pass: string) => Promise<User>;
  loginWallet: (walletAddress: string, signature: string) => Promise<User>;
  logout: () => void;
  switchRoleDemo: (role: UserRole) => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'EMR_CHAIN_AUTH_USER';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [patientProfile, setPatientProfile] = useState<PatientProfile | null>(null);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize session from LocalStorage
  useEffect(() => {
    const init = async () => {
      try {
        const saved = localStorage.getItem(AUTH_USER_KEY);
        if (saved && saved !== 'LOGGED_OUT') {
          const parsed = JSON.parse(saved);
          setUser(parsed);
          await loadRoleSpecificData(parsed);
        } else {
          // If no previous session or explicitly logged out, remain on login page
          setUser(null);
          setPatientProfile(null);
          setDoctorProfile(null);
        }
      } catch (e) {
        console.error(e);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const loadRoleSpecificData = async (currentUser: User) => {
    if (currentUser.role === 'PATIENT') {
      const p = await MockApi.getPatientProfile();
      setPatientProfile(p);
      setDoctorProfile(null);
    } else if (currentUser.role === 'DOCTOR') {
      const docs = await MockApi.getDoctorApplications();
      const d = docs.find((x) => x.id === currentUser.id) || INITIAL_DOCTORS[0];
      setDoctorProfile(d);
      setPatientProfile(null);
    } else {
      setPatientProfile(null);
      setDoctorProfile(null);
    }
  };

  const loginEmail = async (email: string, pass: string): Promise<User> => {
    const res = await MockApi.loginWithEmail(email, pass);
    setUser(res.user);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
    await loadRoleSpecificData(res.user);
    return res.user;
  };

  const loginWallet = async (walletAddress: string, signature: string): Promise<User> => {
    const res = await MockApi.loginWithWallet(walletAddress, signature);
    setUser(res.user);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
    await loadRoleSpecificData(res.user);
    return res.user;
  };

  const logout = () => {
    setUser(null);
    setPatientProfile(null);
    setDoctorProfile(null);
    localStorage.setItem(AUTH_USER_KEY, 'LOGGED_OUT');
  };

  const switchRoleDemo = async (newRole: UserRole) => {
    let targetUser: User;
    if (newRole === 'PATIENT') {
      const p = await MockApi.getPatientProfile();
      targetUser = p;
      setPatientProfile(p);
      setDoctorProfile(null);
    } else if (newRole === 'DOCTOR') {
      const d = INITIAL_DOCTORS[0];
      targetUser = d;
      setDoctorProfile(d);
      setPatientProfile(null);
    } else if (newRole === 'ADMIN') {
      targetUser = {
        id: 'admin-01',
        email: 'admin@hospital.vn',
        fullName: 'Quản Trị Viên Bệnh Viện',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: '2025-01-01',
      };
      setPatientProfile(null);
      setDoctorProfile(null);
    } else {
      targetUser = {
        id: 'superadmin-01',
        email: 'superadmin@moh.gov.vn',
        fullName: 'Bộ Y Tế - Giám Sát Trưởng (SuperAdmin)',
        role: 'SUPER_ADMIN',
        status: 'ACTIVE',
        createdAt: '2025-01-01',
      };
      setPatientProfile(null);
      setDoctorProfile(null);
    }

    setUser(targetUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(targetUser));
  };

  const refreshUserData = async () => {
    if (user) {
      await loadRoleSpecificData(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        patientProfile,
        doctorProfile,
        role: user?.role || 'PATIENT',
        isAuthenticated: !!user,
        isLoading,
        loginEmail,
        loginWallet,
        logout,
        switchRoleDemo,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
