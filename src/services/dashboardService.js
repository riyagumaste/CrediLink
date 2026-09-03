import { supabase } from '../lib/supabaseClient'


export async function getBusinessData() {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')

  console.log('ALL BUSINESSES:', data)
  console.log('BUSINESS ERROR:', error)

  if (error) {
    throw error
  }

  return data?.[0] || null
}


export async function getTrustScore(businessId) {
  const { data, error } = await supabase
    .from('trust_scores')
    .select('*')
    .eq('business_id', businessId)
    .order('calculated_at', {
      ascending: false
    })
    .limit(1)
    .maybeSingle()

  console.log('TRUST SCORE:', data)
  console.log('TRUST ERROR:', error)

  if (error) {
    throw error
  }

  return data
}


export async function getTransactions(businessId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('business_id', businessId)

  console.log('TRANSACTIONS:', data)
  console.log('TRANSACTION ERROR:', error)

  if (error) {
    throw error
  }

  return data || []
}


/*
 * Load relationship information for the lender report.
 *
 * This is kept separate from the existing dashboard functions
 * so the current dashboard continues working exactly as before.
 */
export async function getBusinessRelationships(businessId) {
  const { data, error } = await supabase
    .from('relationships')
    .select('*')
    .eq('business_id', businessId)

  console.log('BUSINESS RELATIONSHIPS:', data)
  console.log('RELATIONSHIP ERROR:', error)

  if (error) {
    throw error
  }

  return data || []
}


/*
 * Load supporting evidence connected to the business.
 *
 * The current database design uses entity_id for evidence,
 * so the business id is used here.
 */
export async function getBusinessEvidence(businessId) {
  const { data, error } = await supabase
    .from('evidence')
    .select('*')
    .eq('entity_id', businessId)

  console.log('BUSINESS EVIDENCE:', data)
  console.log('EVIDENCE ERROR:', error)

  if (error) {
    throw error
  }

  return data || []
}


/*
 * Load everything required by the internal lender view.
 */
export async function getLenderViewData() {
  const business = await getBusinessData()

  if (!business) {
    return null
  }

  const [
    trustScore,
    transactions,
    relationships,
    evidence
  ] = await Promise.all([
    getTrustScore(business.id),
    getTransactions(business.id),
    getBusinessRelationships(business.id),
    getBusinessEvidence(business.id)
  ])

  return {
    business,
    trustScore,
    transactions,
    relationships,
    evidence
  }
}


/*
 * Load a lender report using the financing request token.
 *
 * This is used by /lender/:token.
 *
 * The financing_requests table contains the business_id and
 * token according to the project database design.
 */
export async function getLenderViewByToken(token) {
  if (!token) {
    return null
  }

  const { data: financingRequest, error } = await supabase
    .from('financing_requests')
    .select('business_id, token, requested_amount, purpose, credit_days, status')
    .eq('token', token)
    .maybeSingle()

  console.log(
    'FINANCING REQUEST:',
    financingRequest
  )

  console.log(
    'FINANCING REQUEST ERROR:',
    error
  )

  if (error) {
    throw error
  }

  if (!financingRequest) {
    return null
  }

  const businessId = financingRequest.business_id

  const [
    { data: business, error: businessError },
    trustScore,
    transactions,
    relationships,
    evidence
  ] = await Promise.all([
    supabase
      .from('businesses')
      .select('*')
      .eq('id', businessId)
      .maybeSingle()
      .then((result) => result),

    getTrustScore(businessId),
    getTransactions(businessId),
    getBusinessRelationships(businessId),
    getBusinessEvidence(businessId)
  ])

  if (businessError) {
    throw businessError
  }

  if (!business) {
    return null
  }

  return {
    business,
    trustScore,
    transactions,
    relationships,
    evidence,
    financingRequest
  }
}