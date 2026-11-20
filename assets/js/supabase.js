/**
 * CLIENT-SIDE SUPABASE CONNECTOR
 * Enables direct live database integration for dispatches & courses
 */

(function () {
  'use strict';

  const SUPABASE_URL = 'https://pbgwnzutcypnkjdcmkes.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_arTjuNun5_jMdRo8XeBi_g_iESk4g6u';

  let client = null;

  function init() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      try {
        client = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.appSupabase = client;
        console.log('⚡ Supabase client connected to:', SUPABASE_URL);
      } catch (err) {
        console.warn('Supabase init warning:', err);
      }
    }
  }

  // Helper to sync dispatches
  window.syncDispatchToSupabase = async function (dispatch) {
    if (!client) init();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('dispatches')
        .insert([dispatch])
        .select();
      if (error) {
        console.warn('Supabase dispatches table notice (check RLS or schema):', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('Supabase insert note:', e);
      return null;
    }
  };

  // Helper to sync courses
  window.syncCourseToSupabase = async function (courseModule) {
    if (!client) init();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('courses')
        .insert([courseModule])
        .select();
      if (error) {
        console.warn('Supabase courses table notice (check RLS or schema):', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('Supabase insert note:', e);
      return null;
    }
  };

  // Auto-init on script load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
