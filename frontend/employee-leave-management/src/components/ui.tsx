import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { initials, useAuth } from '../context/AuthContext'
import { roleLabel } from '../lib/data'

const badgeStyle: Record<string, string> = {
  Pending: 'bg-pendBg text-pend',
  pending: 'bg-pendBg text-pend',
  'On leave': 'bg-pendBg text-pend',
  Approved: 'bg-okBg text-ok',
  approved: 'bg-okBg text-ok',
  'In office': 'bg-okBg text-ok',
  Rejected: 'bg-noBg text-no',
  rejected: 'bg-noBg text-no',
  Cancelled: 'bg-noBg text-no',
  cancelled: 'bg-noBg text-no',
}
export const Badge = ({ label }: { label: string }) => {
  const formatted = label ? label.charAt(0).toUpperCase() + label.slice(1) : ''
  const cls = badgeStyle[label] || badgeStyle[formatted] || 'bg-line text-ink'
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${cls}`}>
      {formatted}
    </span>
  )
}

type Variant = 'primary' | 'ghost' | 'ok' | 'no'
const variants: Record<Variant, string> = {
  primary: 'bg-accent px-4 py-2 text-white hover:opacity-90 active:scale-[0.99]',
  ghost: 'border border-line px-3.5 py-2 text-ink hover:bg-black/5 active:scale-[0.99]',
  ok: 'bg-ok px-3.5 py-2 text-white hover:opacity-90 active:scale-[0.99]',
  no: 'border border-no px-3.5 py-1.5 text-no hover:bg-noBg/50 active:scale-[0.99]',
}
export const btn = (v: Variant = 'primary') =>
  `inline-flex items-center justify-center cursor-pointer rounded-lg text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${variants[v]}`

export function Btn({ variant = 'primary', ...p }: { variant?: Variant } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...p} className={btn(variant)} />
}

export const inputCls =
  'w-full rounded-lg border border-line bg-bg px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-accent'

export const Field = ({ label, id, full, children }: { label: string; id: string; full?: boolean; children: ReactNode }) => (
  <div className={full ? 'sm:col-span-2' : ''}>
    <label htmlFor={id} className="mb-1 block text-sm font-semibold">{label}</label>
    {children}
  </div>
)

export const Stats = ({ children }: { children: ReactNode }) => (
  <div className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3.5">{children}</div>
)
export const Stat = ({ value, label, progress }: { value: string; label: string; progress?: number }) => (
  <div className="rounded-xl border border-line bg-surface p-4">
    <div className="text-4xl font-bold leading-tight">{value}</div>
    <div className="text-sm text-muted">{label}</div>
    {progress !== undefined && (
      <div className="mt-2.5 h-1.5 overflow-hidden rounded bg-line">
        <div className="h-full bg-accent" style={{ width: `${progress}%` }} />
      </div>
    )}
  </div>
)

export const Card = ({ title, children }: { title?: string; children: ReactNode }) => (
  <section className="mb-4 rounded-xl border border-line bg-surface p-4">
    {title && <h2 className="mb-3 text-[17px] font-semibold">{title}</h2>}
    {children}
  </section>
)

export const Table = ({ head, children }: { head: string[]; children: ReactNode }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-120 text-left text-sm">
      <thead>
        <tr>{head.map((h, i) => <th key={i} className="border-b border-line p-2.5 font-medium text-muted">{h}</th>)}</tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
)
export const Td = ({ children }: { children?: ReactNode }) => <td className="border-b border-line p-2.5">{children}</td>

export function Page({ title, children }: { title: string; children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return null
  return (
    <>
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center gap-2.5 text-muted">
          <span>{user.name}</span>
          <span className="rounded-full bg-accentSoft px-2.5 py-0.5 text-[13px] font-semibold text-accent">{roleLabel[user.role]}</span>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-avatar font-bold text-white">{initials(user.name)}</div>
        </div>
      </header>
      {children}
    </>
  )
}
