/**
 * Supabase Cloud Database Connector for Telegram Bot
 * Brand: FT JITHIN DESIGNZ (@FTJithinSupportBot)
 * Integrates directly with existing tables: projects, services, dispatches, faqs
 */

const { createClient } = require('@supabase/supabase-js');
const { config } = require('./environment');

const keyToUse = config.supabaseServiceKey || config.supabaseAnonKey;
let supabase = null;

try {
  if (config.supabaseUrl && keyToUse) {
    supabase = createClient(config.supabaseUrl, keyToUse);
  }
} catch (err) {
  console.warn('Notice initializing Supabase in Telegram Bot:', err.message);
}

/**
 * Fetch published portfolio projects
 */
async function fetchPublishedProjects() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch (err) {
    return [];
  }
}

/**
 * Fetch active creative services & pricing
 */
async function fetchActiveServices() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data) return [];
    return data;
  } catch (err) {
    return [];
  }
}

/**
 * Fetch active FAQs
 */
async function fetchActiveFaqs() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data) return [];
    return data;
  } catch (err) {
    return [];
  }
}

/**
 * Save new client enquiry from Telegram into dispatches CRM
 */
async function saveTelegramDispatch(dispatchData) {
  if (!supabase) return null;
  try {
    const row = {
      id: dispatchData.id || `disp-tg-${Date.now()}`,
      type: dispatchData.type || 'Telegram Project Enquiry',
      name: dispatchData.name || 'Telegram User',
      email: dispatchData.email || 'Provided via Telegram',
      budget: dispatchData.budget || 'Custom Scope',
      message: dispatchData.message || '',
      status: 'Unread',
      timestamp: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('dispatches')
      .insert([row])
      .select();

    if (error) {
      console.warn('Supabase dispatch insert error:', error.message);
      return null;
    }
    return data ? data[0] : row;
  } catch (err) {
    console.warn('Supabase dispatch exception:', err.message);
    return null;
  }
}

/**
 * Fetch recent dispatches for Admin review
 */
async function fetchRecentDispatches(limit = 5) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('dispatches')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data;
  } catch (err) {
    return [];
  }
}

/**
 * Subscribe to realtime dispatches for instant alerts
 */
function subscribeToDispatches(onInsert) {
  if (!supabase) return null;
  try {
    const channel = supabase
      .channel('tg-dispatches-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dispatches' }, (payload) => {
        if (payload && payload.new && typeof onInsert === 'function') {
          onInsert(payload.new);
        }
      })
      .subscribe();
    return channel;
  } catch (err) {
    console.warn('Realtime subscription notice:', err.message);
    return null;
  }
}

module.exports = {
  supabase,
  fetchPublishedProjects,
  fetchActiveServices,
  fetchActiveFaqs,
  saveTelegramDispatch,
  fetchRecentDispatches,
  subscribeToDispatches
};
