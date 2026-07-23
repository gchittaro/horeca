'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function ArticleContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 style={{ fontSize: 24, fontWeight: 500, color: '#26215C', letterSpacing: '-0.02em', margin: '40px 0 14px', lineHeight: 1.25, display: 'none' }}>
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 style={{ fontSize: 19, fontWeight: 500, color: '#26215C', letterSpacing: '-0.02em', margin: '36px 0 12px', lineHeight: 1.3, paddingTop: 8, borderTop: '0.5px solid #EEEDFE' }}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 style={{ fontSize: 14, fontWeight: 600, color: '#26215C', margin: '22px 0 7px' }}>
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p style={{ fontSize: 14, color: '#444441', lineHeight: 1.85, margin: '0 0 14px' }}>
            {children}
          </p>
        ),
        ul: ({ children }) => (
          <ul style={{ margin: '0 0 16px', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol style={{ margin: '0 0 16px', paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 5 }}>
            {children}
          </ol>
        ),
        li: ({ children }) => (
          <li style={{ fontSize: 14, color: '#444441', lineHeight: 1.7 }}>
            {children}
          </li>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target={href?.startsWith('http') ? '_blank' : undefined}
            rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            style={{ color: '#534AB7', textDecoration: 'underline', textDecorationColor: '#CECBF6', textUnderlineOffset: 3 }}
          >
            {children}
          </a>
        ),
        strong: ({ children }) => (
          <strong style={{ fontWeight: 600, color: '#26215C' }}>{children}</strong>
        ),
        em: ({ children }) => (
          <em style={{ fontStyle: 'italic', color: '#5F5E5A' }}>{children}</em>
        ),
        code: ({ children }) => (
          <code style={{ fontFamily: 'monospace', fontSize: 12, background: '#F0EFF9', color: '#534AB7', padding: '2px 6px', borderRadius: 4 }}>
            {children}
          </code>
        ),
        blockquote: ({ children }) => (
          <blockquote style={{ borderLeft: '3px solid #AFA9EC', margin: '16px 0', paddingLeft: 16, color: '#5F5E5A' }}>
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div style={{ overflowX: 'auto', margin: '16px 0', borderRadius: 10, border: '0.5px solid #CECBF6' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              {children}
            </table>
          </div>
        ),
        thead: ({ children }) => (
          <thead style={{ background: '#26215C' }}>{children}</thead>
        ),
        th: ({ children }) => (
          <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#AFA9EC', textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td style={{ padding: '9px 14px', fontSize: 13, color: '#444441', borderBottom: '0.5px solid #EEEDFE' }}>
            {children}
          </td>
        ),
        hr: () => (
          <hr style={{ border: 'none', borderTop: '0.5px solid #CECBF6', margin: '32px 0' }} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  )
}
