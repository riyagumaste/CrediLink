import { useState } from 'react'
import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'
import './AskCredi.css'

/*
 * ------------------------------------------------------
 * MARKDOWN RENDERER
 * ------------------------------------------------------
 *
 * Gemini naturally returns Markdown such as:
 *
 * ### Payment Behaviour
 *
 * Your score is **82** because:
 *
 * - Payments are mostly on time
 * - Verification is strong
 *
 * This component converts that Markdown into clean
 * React elements instead of displaying the raw symbols.
 */

function renderInlineMarkdown(text) {
  const parts = []
  let remaining = text
  let key = 0

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/)

    if (boldMatch) {
      const before = remaining.slice(
        0,
        boldMatch.index
      )

      if (before) {
        parts.push(
          <span key={key++}>
            {before}
          </span>
        )
      }

      parts.push(
        <strong key={key++}>
          {boldMatch[1]}
        </strong>
      )

      remaining = remaining.slice(
        boldMatch.index +
          boldMatch[0].length
      )

      continue
    }

    // Italic: *text*
    const italicMatch = remaining.match(
      /(^|[^*])\*([^*]+)\*(?!\*)/
    )

    if (italicMatch) {
      const fullMatch = italicMatch[0]
      const prefix = italicMatch[1]
      const italicText = italicMatch[2]

      const beforeIndex =
        italicMatch.index

      if (beforeIndex > 0) {
        parts.push(
          <span key={key++}>
            {remaining.slice(
              0,
              beforeIndex
            )}
          </span>
        )
      }

      if (prefix) {
        parts.push(
          <span key={key++}>
            {prefix}
          </span>
        )
      }

      parts.push(
        <em key={key++}>
          {italicText}
        </em>
      )

      remaining = remaining.slice(
        beforeIndex +
          fullMatch.length
      )

      continue
    }

    // No more Markdown
    parts.push(
      <span key={key++}>
        {remaining}
      </span>
    )

    break
  }

  return parts
}

function MarkdownMessage({ text }) {
  if (!text) {
    return null
  }

  const normalizedText = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')

  const lines =
    normalizedText.split('\n')

  const elements = []

  let paragraphLines = []
  let bulletItems = []
  let numberedItems = []

  function flushParagraph() {
    if (paragraphLines.length === 0) {
      return
    }

    const paragraphText =
      paragraphLines.join(' ').trim()

    if (paragraphText) {
      elements.push(
        <p
          key={`paragraph-${elements.length}`}
        >
          {renderInlineMarkdown(
            paragraphText
          )}
        </p>
      )
    }

    paragraphLines = []
  }

  function flushBullets() {
    if (bulletItems.length === 0) {
      return
    }

    elements.push(
      <ul
        key={`bullets-${elements.length}`}
      >
        {bulletItems.map(
          (item, index) => (
            <li key={index}>
              {renderInlineMarkdown(
                item
              )}
            </li>
          )
        )}
      </ul>
    )

    bulletItems = []
  }

  function flushNumbered() {
    if (numberedItems.length === 0) {
      return
    }

    elements.push(
      <ol
        key={`numbered-${elements.length}`}
      >
        {numberedItems.map(
          (item, index) => (
            <li key={index}>
              {renderInlineMarkdown(
                item
              )}
            </li>
          )
        )}
      </ol>
    )

    numberedItems = []
  }

  function flushAll() {
    flushParagraph()
    flushBullets()
    flushNumbered()
  }

  lines.forEach((line) => {
    const trimmed = line.trim()

    // Empty line = new paragraph/section
    if (!trimmed) {
      flushAll()
      return
    }

    // --------------------------------------------------
    // H1: # Heading
    // --------------------------------------------------

    const h1Match =
      trimmed.match(/^#\s+(.+)$/)

    if (h1Match) {
      flushAll()

      elements.push(
        <h2
          key={`h1-${elements.length}`}
        >
          {renderInlineMarkdown(
            h1Match[1]
          )}
        </h2>
      )

      return
    }

    // --------------------------------------------------
    // H2: ## Heading
    // --------------------------------------------------

    const h2Match =
      trimmed.match(/^##\s+(.+)$/)

    if (h2Match) {
      flushAll()

      elements.push(
        <h3
          key={`h2-${elements.length}`}
        >
          {renderInlineMarkdown(
            h2Match[1]
          )}
        </h3>
      )

      return
    }

    // --------------------------------------------------
    // H3: ### Heading
    // --------------------------------------------------

    const h3Match =
      trimmed.match(/^###\s+(.+)$/)

    if (h3Match) {
      flushAll()

      elements.push(
        <h4
          key={`h3-${elements.length}`}
        >
          {renderInlineMarkdown(
            h3Match[1]
          )}
        </h4>
      )

      return
    }

    // --------------------------------------------------
    // Bullet list
    // Supports:
    // - item
    // * item
    // --------------------------------------------------

    const bulletMatch =
      trimmed.match(/^[-*]\s+(.+)$/)

    if (bulletMatch) {
      flushParagraph()
      flushNumbered()

      bulletItems.push(
        bulletMatch[1]
      )

      return
    }

    // --------------------------------------------------
    // Numbered list
    // Supports:
    // 1. item
    // 2. item
    // --------------------------------------------------

    const numberedMatch =
      trimmed.match(/^\d+\.\s+(.+)$/)

    if (numberedMatch) {
      flushParagraph()
      flushBullets()

      numberedItems.push(
        numberedMatch[1]
      )

      return
    }

    // --------------------------------------------------
    // Normal paragraph line
    // --------------------------------------------------

    flushBullets()
    flushNumbered()

    paragraphLines.push(trimmed)
  })

  flushAll()

  return (
    <div className="ask-credi-markdown">
      {elements}
    </div>
  )
}

function AskCredi() {
  const [question, setQuestion] =
    useState('')

  const [messages, setMessages] =
    useState([
      {
        id: 1,
        role: 'assistant',
        text:
          'Hello! I’m Ask Credi. Ask me about your business trust, payments, transactions, risk, or counterparties.'
      }
    ])

  const [loading, setLoading] =
    useState(false)

  // ==================================================
  // ASK CREDI
  // ==================================================

  async function askCredi(questionText) {
    if (
      !questionText ||
      !questionText.trim()
    ) {
      throw new Error(
        'Please enter a question.'
      )
    }

    const {
      data,
      error
    } = await supabase.functions.invoke(
      'ask-credi',
      {
        body: {
          question:
            questionText.trim()
        }
      }
    )

    if (error) {
      console.error(
        'Ask Credi Edge Function error:',
        error
      )

      if (
        error instanceof FunctionsHttpError
      ) {
        try {
          const errorBody =
            await error.context.json()

          console.error(
            'Ask Credi Edge Function response:',
            errorBody
          )

          throw new Error(
            errorBody?.error ||
              errorBody?.message ||
              `Ask Credi returned an error (${error.context.status}).`
          )
        } catch (parseError) {
          if (
            parseError instanceof Error &&
            parseError.message &&
            !parseError.message.includes(
              'Unexpected end of JSON input'
            )
          ) {
            throw parseError
          }

          throw new Error(
            'Ask Credi could not process the request.'
          )
        }
      }

      throw new Error(
        error.message ||
          'Unable to connect to Ask Credi.'
      )
    }

    if (!data) {
      throw new Error(
        'Ask Credi returned no response.'
      )
    }

    if (data.error) {
      throw new Error(data.error)
    }

    if (!data.answer) {
      throw new Error(
        'Ask Credi returned an empty response.'
      )
    }

    return data.answer
  }

  // ==================================================
  // SUBMIT QUESTION
  // ==================================================

  async function handleSubmit(event) {
    event.preventDefault()

    const trimmedQuestion =
      question.trim()

    if (
      !trimmedQuestion ||
      loading
    ) {
      return
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: trimmedQuestion
    }

    setMessages(
      (previous) => [
        ...previous,
        userMessage
      ]
    )

    setQuestion('')
    setLoading(true)

    try {
      const answer =
        await askCredi(
          trimmedQuestion
        )

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: answer
      }

      setMessages(
        (previous) => [
          ...previous,
          assistantMessage
        ]
      )
    } catch (error) {
      console.error(
        'Ask Credi error:',
        error
      )

      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text:
          error?.message ||
          'Sorry, I could not process your question right now.'
      }

      setMessages(
        (previous) => [
          ...previous,
          errorMessage
        ]
      )
    } finally {
      setLoading(false)
    }
  }

  // ==================================================
  // ENTER KEY
  // ==================================================

  function handleKeyDown(event) {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault()

      const form =
        event.currentTarget.form

      if (form) {
        form.requestSubmit()
      }
    }
  }

  // ==================================================
  // SUGGESTION
  // ==================================================

  function useSuggestion(text) {
    if (loading) {
      return
    }

    setQuestion(text)
  }

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="ask-credi-page">

      {/* HEADER */}
      <div className="ask-credi-header">
        <div>
          <p className="ask-credi-eyebrow">
            CREDI / AI ASSISTANT
          </p>

          <h1>Ask Credi</h1>

          <p className="ask-credi-subtitle">
            Ask questions about your
            business trust, payments,
            transactions and financial risk.
          </p>
        </div>
      </div>

      {/* CHAT CARD */}
      <div className="ask-credi-card">

        {/* MESSAGES */}
        <div className="ask-credi-messages">

          {messages.map(
            (message) => (
              <div
                key={message.id}
                className={
                  message.role === 'user'
                    ? 'ask-credi-message user-message'
                    : 'ask-credi-message assistant-message'
                }
              >

                <div className="ask-credi-message-label">
                  {message.role === 'user'
                    ? 'You'
                    : 'Credi'}
                </div>

                <div className="ask-credi-message-text">

                  {message.role ===
                  'assistant' ? (
                    <MarkdownMessage
                      text={
                        message.text
                      }
                    />
                  ) : (
                    message.text
                  )}

                </div>

              </div>
            )
          )}

          {/* LOADING */}
          {loading && (
            <div className="ask-credi-message assistant-message">

              <div className="ask-credi-message-label">
                Credi
              </div>

              <div className="ask-credi-message-text">
                Thinking...
              </div>

            </div>
          )}

        </div>

        {/* INPUT */}
        <form
          className="ask-credi-form"
          onSubmit={handleSubmit}
        >

          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(
                event.target.value
              )
            }
            onKeyDown={handleKeyDown}
            placeholder="Ask about your business..."
            rows="2"
            disabled={loading}
            aria-label="Ask Credi a question"
          />

          <button
            type="submit"
            disabled={
              loading ||
              !question.trim()
            }
            aria-label="Send question"
          >
            {loading
              ? 'Thinking...'
              : 'Ask Credi'}
          </button>

        </form>

        {/* SUGGESTIONS */}
        <div className="ask-credi-suggestions">

          <span>
            Try asking:
          </span>

          <button
            type="button"
            onClick={() =>
              useSuggestion(
                'Why is my trust score what it is?'
              )
            }
            disabled={loading}
          >
            Why is my trust score what it is?
          </button>

          <button
            type="button"
            onClick={() =>
              useSuggestion(
                'Which transactions may affect my risk?'
              )
            }
            disabled={loading}
          >
            Which transactions may affect my risk?
          </button>

          <button
            type="button"
            onClick={() =>
              useSuggestion(
                'Which counterparties have the highest exposure?'
              )
            }
            disabled={loading}
          >
            Which counterparties have the highest exposure?
          </button>

        </div>

      </div>

    </div>
  )
}

export default AskCredi