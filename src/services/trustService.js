import { supabase } from '../lib/supabaseClient'

export async function getTrustPassportData() {
  // Get the business
  const { data: business, error: businessError } = await supabase
    .from('businesses')
    .select('*')
    .limit(1)
    .single()

  if (businessError) throw businessError

  // Get latest trust score
  const { data: trustScore, error: trustError } = await supabase
    .from('trust_scores')
    .select('*')
    .eq('business_id', business.id)
    .order('calculated_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (trustError) throw trustError

  // Get verification records
  const { data: verifications, error: verificationError } = await supabase
    .from('verification_records')
    .select('*')
    .eq('business_id', business.id)
    .order('created_at', { ascending: false })

  if (verificationError) throw verificationError

  // Get documents
  const { data: documents, error: documentsError } = await supabase
    .from('documents')
    .select('*')
    .eq('business_id', business.id)
    .order('uploaded_at', { ascending: false })

  if (documentsError) throw documentsError

  return {
    business,
    trustScore,
    verifications: verifications || [],
    documents: documents || [],
  }
}