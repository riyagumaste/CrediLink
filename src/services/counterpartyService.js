import { supabase } from '../lib/supabaseClient'

export async function getCounterpartyData() {
  // Get the business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('*')
    .limit(1)
    .single()

  if (businessError) throw businessError

  // Get counterparties
  const { data: counterparties, error: counterpartiesError } =
    await supabase
      .from('counterparties')
      .select('*')
      .eq('business_id', business.id)
      .order('created_at', { ascending: false })

  if (counterpartiesError) throw counterpartiesError

  // Get transactions
  const { data: transactions, error: transactionsError } =
    await supabase
      .from('transactions')
      .select('*')
      .eq('business_id', business.id)

  if (transactionsError) throw transactionsError

  return {
    business,
    counterparties: counterparties || [],
    transactions: transactions || [],
  }
}