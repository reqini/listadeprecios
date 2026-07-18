import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";

// Contexto de autenticación de administrador, vía Supabase Auth + RLS.
// Deliberadamente separado de AuthContext.js (login de clientes, backend
// legacy) para no tocar el flujo de suscripciones/Mercado Pago mientras
// se resuelve la vulnerabilidad de /administrador.
const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadRole(userId) {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

      if (!mounted) return;
      if (error) {
        console.error("Error cargando el rol del perfil admin:", error.message);
        setRole(null);
      } else {
        setRole(data?.role ?? null);
      }
    }

    async function init() {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession();
      if (!mounted) return;

      setSession(currentSession);
      if (currentSession?.user) {
        await loadRole(currentSession.user.id);
      }
      if (mounted) setLoading(false);
    }

    init();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        if (newSession?.user) {
          setLoading(true);
          await loadRole(newSession.user.id);
        } else {
          setRole(null);
        }
        if (mounted) setLoading(false);
      }
    );

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  async function loginAdmin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  }

  async function logoutAdmin() {
    await supabase.auth.signOut();
  }

  return (
    <AdminAuthContext.Provider
      value={{ session, role, loading, loginAdmin, logoutAdmin }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => useContext(AdminAuthContext);
