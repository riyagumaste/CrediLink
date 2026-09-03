import { supabase } from '../lib/supabase'

export async function getBusinessData() {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .limit(1)
    .single()

  if (error) throw error

  return data
}

export async function getTrustScore(businessId) {
  const { data, error } = await supabase
    .from('trust_scores')
    .select('*')
    .eq('business_id', businessId)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .single()

  if (error) throw error

  return data
}

export async function getTransactions(businessId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('business_id', businessId)

  if (error) throw error

  return data
}