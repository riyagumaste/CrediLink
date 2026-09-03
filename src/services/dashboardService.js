import { supabase } from '../lib/supabaseClient'

export async function getBusinessData() {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')

  console.log('ALL BUSINESSES:', data)
  console.log('BUSINESS ERROR:', error)

  if (error) throw error

  return data?.[0] || null
}


export async function getTrustScore(businessId) {
  const { data, error } = await supabase
    .from('trust_scores')
    .select('*')
    .eq('business_id', businessId)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  console.log('TRUST SCORE:', data)
  console.log('TRUST ERROR:', error)

  if (error) throw error

  return data
}


export async function getTransactions(businessId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('business_id', businessId)

  console.log('TRANSACTIONS:', data)
  console.log('TRANSACTION ERROR:', error)

  if (error) throw error

  return data || []
}