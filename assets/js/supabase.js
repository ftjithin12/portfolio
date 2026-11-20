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

  // Push customer dispatch to Supabase table 'dispatches'
  window.syncDispatchToSupabase = async function (dispatch) {
    if (!client) init();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('dispatches')
        .insert([{
          id: dispatch.id,
          type: dispatch.type,
          name: dispatch.name,
          email: dispatch.email,
          budget: dispatch.budget,
          message: dispatch.message,
          status: dispatch.status || 'Unread',
          timestamp: dispatch.timestamp || new Date().toISOString()
        }])
        .select();

      if (error) {
        console.info('Supabase dispatches table note:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('Supabase insert note:', e);
      return null;
    }
  };

  // Push course module to Supabase table 'courses'
  window.syncCourseToSupabase = async function (courseModule) {
    if (!client) init();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('courses')
        .insert([{
          id: courseModule.id,
          title: courseModule.title,
          lessons: courseModule.lessons || [],
          status: courseModule.status || 'Published',
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.info('Supabase courses table note:', error.message);
        return null;
      }
      return data;
    } catch (e) {
      console.warn('Supabase insert note:', e);
      return null;
    }
  };

  // Fetch dispatches from Supabase
  window.fetchDispatchesFromSupabase = async function () {
    if (!client) init();
    if (!client) return null;
    try {
      const { data, error } = await client
        .from('dispatches')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error || !data) return null;
      return data;
    } catch (e) {
      return null;
    }
  };

  // Status check for UI badges
  window.checkSupabaseConnection = async function () {
    if (!client) init();
    if (!client) return { connected: false, message: 'Client library not loaded' };
    try {
      const { data, error } = await client.from('dispatches').select('id').limit(1);
      if (error && error.code === '42P01') {
        return { connected: true, tablesReady: false, message: 'Connected to Supabase. Table public.dispatches pending creation.' };
      }
      if (error) {
        return { connected: true, tablesReady: false, message: error.message };
      }
      return { connected: true, tablesReady: true, message: 'Supabase Database Online & Operational' };
    } catch (e) {
      return { connected: false, message: e.message };
    }
  };

  // Auto-init on script load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
