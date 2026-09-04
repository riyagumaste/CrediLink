import { supabase } from '../lib/supabaseClient'

export async function getTrustPassportData() {

  // Get the business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('*')
    .limit(1)
    .single()

  if (businessError) throw businessError

  // Get the latest trust score
  const { data: trustScore, error: trustError } = await supabase
    .from('trust_scores')
    .select('*')
    .eq('business_id', business.id)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (trustError) throw trustError

  // Get business documents
  // Documents are displayed as supporting business information
  // but are not used as a Trust Score component.
  const { data: documents, error: documentsError } = await supabase
    .from('documents')
    .select('*')
    .eq('business_id', business.id)
    .order('uploaded_at', { ascending: false })

  if (documentsError) throw documentsError

  return {
    business,
    trustScore,
    documents: documents || [],
  }
}