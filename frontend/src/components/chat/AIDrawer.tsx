
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { api } from '../../api/client'
import { useInvestigation } from '../../store/investigationStore'

type Message = {
  role: 'user' | 'assistant'
  text: string
}

// Render Gemini's Markdown without installing extra packages.
function inlineMarkdown(value: string): ReactNode[] {
  const pattern = /(\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*\n]+)\*)/g
  const nodes: ReactNode[] = []
  let cursor = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > cursor) {
      nodes.push(value.slice(cursor, match.index))
    }

    const key = match.index

    if (match[2] || match[3]) {
      nodes.push(
        <strong key={key} className="font-semibold">
          {match[2] || match[3]}
        </strong>
      )
    } else if (match[4]) {
      nodes.push(
        <code
          key={key}
          className="rounded bg-black/5 px-1 py-0.5 text-[0.9em]"
        >
          {match[4]}
        </code>
      )
    } else {
      nodes.push(<em key={key}>{match[5]}</em>)
    }

    cursor = pattern.lastIndex
  }

  if (cursor < value.length) {
    nodes.push(value.slice(cursor))
  }

  return nodes
}

function MessageMarkdown({ text }: { text: string }) {
  const lines = text
    .replace(/\\\*/g, '*')
    .replace(/\r\n/g, '\n')
    .split('\n')

  const blocks: ReactNode[] = []
  let i = 0

  while (i < lines.length) {
    if (!lines[i].trim()) {
      i++
      continue
    }

    const bullet = /^\s*[-*+]\s+(.+)$/.exec(lines[i])
    const numbered = /^\s*\d+[.)]\s+(.+)$/.exec(lines[i])

    if (bullet || numbered) {
      const ordered = Boolean(numbered)
      const items: ReactNode[] = []

      while (i < lines.length) {
        const item = ordered
          ? /^\s*\d+[.)]\s+(.+)$/.exec(lines[i])
          : /^\s*[-*+]\s+(.+)$/.exec(lines[i])

        if (!item) break

        items.push(
          <li key={i} className="pl-0.5">
            {inlineMarkdown(item[1])}
          </li>
        )

        i++
      }

      blocks.push(
        ordered ? (
          <ol key={i} className="list-decimal space-y-1 pl-5">
            {items}
          </ol>
        ) : (
          <ul key={i} className="list-disc space-y-1 pl-5">
            {items}
          </ul>
        )
      )

      continue
    }

    const heading = /^(#{1,3})\s+(.+)$/.exec(lines[i])

    if (heading) {
      blocks.push(
        <p key={i} className="font-semibold">
          {inlineMarkdown(heading[2])}
        </p>
      )

      i++
      continue
    }

    const paragraph: string[] = []

    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^\s*[-*+]\s+/.test(lines[i]) &&
      !/^\s*\d+[.)]\s+/.test(lines[i]) &&
      !/^#{1,3}\s+/.test(lines[i])
    ) {
      paragraph.push(lines[i].trim())
      i++
    }

    blocks.push(
      <p key={i} className="leading-relaxed">
        {inlineMarkdown(paragraph.join(' '))}
      </p>
    )
  }

  return (
    <div className="space-y-3 break-words">
      {blocks}
    </div>
  )
}

export default function AIDrawer({
  anomalyId,
}: {
  anomalyId: string
}) {
  const hosts = useInvestigation(s => s.hosts)
  const eventTime = useInvestigation(s => s.eventTime)
  const windowSize = useInvestigation(s => s.windowSize)
  const selectedConnectionId = useInvestigation(
    s => s.selectedConnectionId
  )

  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [messages, busy])

  async function submit(e: FormEvent) {
    e.preventDefault()

    const q = question.trim()
    if (!q || busy) return

    setQuestion('')
    setError('')

    setMessages(prev => [
      ...prev,
      { role: 'user', text: q },
    ])

    setBusy(true)

    try {
      const result = await api.askAI({
        anomalyId,
        question: q,
        hostIds: hosts,
        windowStart: eventTime - windowSize,
        windowEnd: eventTime + windowSize,
        selectedConnectionId,
      })

      const answer = result.answer +
        (result.truncated
          ? '\n\n*Note: Only the first 100 matching flows were analyzed.*'
          : '')

      setMessages(prev => [
        ...prev,
        { role: 'assistant', text: answer },
      ])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'AI request failed'
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <aside
      className="flex h-[75vh] min-h-[440px] flex-col overflow-hidden rounded-2xl border border-[#ded5c8] bg-[#fcfaf7] shadow-sm"
      aria-label="AI investigation assistant"
    >
      {/* Header */}
      <div className="border-b border-[#e4dbcf] bg-[#f0e9df] px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#5e7a4f] text-white"
            aria-hidden="true"
          >
            ✦
          </span>

          <h2 className="text-base font-bold text-[#342f29]">
            Ask AI
          </h2>
        </div>

        <p className="mt-1 text-xs leading-relaxed text-[#756c61]">
          Analyzes this anomaly, {hosts.length} selected{' '}
          {hosts.length === 1 ? 'host' : 'hosts'},
          the current time window, and up to 100 flows.
        </p>
      </div>

      {/* Chat messages */}
      <div
        className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-4"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {messages.length === 0 && (
          <div className="space-y-3 px-1 pt-2">
            <p className="text-sm font-medium text-[#51483e]">
              Ask a question about the selected traffic.
            </p>

            {[
              'Why was this anomaly flagged?',
              'Which hosts show unusual traffic?',
              'What do the TCP flags tell us?',
            ].map(q => (
              <button
                key={q}
                type="button"
                className="block w-full rounded-xl border border-[#ded5c8] bg-white px-3 py-2.5 text-left text-sm text-[#655444] transition-colors hover:bg-[#f0e9df]"
                onClick={() => setQuestion(q)}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === 'user'
                ? 'justify-end'
                : 'justify-start'
            }`}
          >
            {m.role === 'user' ? (
              <div className="max-w-[90%] whitespace-pre-wrap break-words rounded-2xl rounded-tr-md bg-[#5e7a4f] px-4 py-3 text-sm font-medium leading-relaxed text-white shadow-sm">
                {m.text}
              </div>
            ) : (
              <div className="max-w-[96%] rounded-2xl rounded-tl-md bg-[#efe8dd] px-4 py-3 text-sm text-[#453d34] shadow-sm">
                <MessageMarkdown text={m.text} />
              </div>
            )}
          </div>
        ))}

        {busy && (
          <div className="flex justify-start">
            <p
              className="rounded-2xl rounded-tl-md bg-[#efe8dd] px-4 py-3 text-sm text-[#6b6156]"
              role="status"
            >
              Analyzing selected traffic…
            </p>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Error message */}
      {error && (
        <p
          role="alert"
          className="mx-3 mb-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {/* Chat input */}
      <form
        onSubmit={submit}
        className="border-t border-[#e4dbcf] bg-[#faf7f2] p-3"
      >
        <label htmlFor="ai-question" className="sr-only">
          Ask AI a question
        </label>

        <textarea
          id="ai-question"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          maxLength={1500}
          rows={2}
          placeholder="Ask about these connections…"
          className="w-full resize-none rounded-xl border border-[#d6cbbb] bg-white px-3 py-2.5 text-sm text-[#3b3128] outline-none focus:border-[#5e7a4f] focus:ring-2 focus:ring-[#5e7a4f]/15"
        />

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[11px] text-[#83786d]">
            AI analysis may be uncertain.
          </span>

          <button
            disabled={busy || !question.trim()}
            className="rounded-xl bg-[#5e7a4f] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4e6841] disabled:cursor-not-allowed disabled:opacity-50"
            type="submit"
          >
            {busy ? 'Thinking…' : 'Send'}
          </button>
        </div>
      </form>
    </aside>
  )
}
