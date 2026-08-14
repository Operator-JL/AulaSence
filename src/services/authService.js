import { supabase } from '../lib/supabaseClient'

async function login({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.session
}

async function logout() {
  await supabase.auth.signOut()
}

export const authService = Object.freeze({ login, logout })
