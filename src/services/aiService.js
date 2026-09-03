import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

export async function askCredi(question) {
  if (!question || !question.trim()) {
    throw new Error('Please enter a question.')
  }

  try {
    const { data, error } = await supabase.functions.invoke('ask-credi', {
      body: {
        question: question.trim()
      }
    })

    if (error) {
      console.error('Ask Credi Edge Function error:', error)

      // Get actual response from edge fnction
      if (error instanceof FunctionsHttpError) {
        try {
          const errorBody = await error.context.json()

          console.error('Ask Credi error response:', errorBody)

          throw new Error(
            errorBody?.error ||
            errorBody?.message ||
            `Ask Credi failed with status ${error.context.status}.`
          )
        } catch (parseError) {
          if (parseError instanceof Error) {
            throw parseError
          }

          throw new Error('Ask Credi could not process the request.')
        }
      }

      throw new Error(
        error.message || 'Unable to connect to Ask Credi.'
      )
    }

    if (!data?.answer) {
      throw new Error('Ask Credi returned an empty response.')
    }

    return data.answer
  } catch (error) {
    console.error('Ask Credi request failed:', error)

    throw new Error(
      error?.message ||
      'Something went wrong while contacting Ask Credi.'
    )
  }
}