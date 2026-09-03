import { supabase } from '../lib/supabaseClient'

export async function getCashFlowData() {
  // Get the business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('*')
    .limit(1)
    .single()

  if (businessError) throw businessError

  // Get transactions for that business
  const { data: transactions, error: transactionError } = await supabase
    .from('transactions')
    .select(`
      *,
      counterparties (
        name
      )
    `)
    .eq('business_id', business.id)

  if (transactionError) throw transactionError

  return {
    business,
    transactions: transactions || [],
  }
}