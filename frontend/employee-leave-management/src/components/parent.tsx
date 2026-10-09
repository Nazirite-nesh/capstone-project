import { type ReactNode } from 'react'

export default function Parent({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen place-items-center p-5">
      <div className="w-full max-w-105 rounded-2xl border border-line bg-surface p-7">
        <div className="pb-3.5 text-lg font-bold">Leave<span className="text-accent">App</span></div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="mb-5 mt-1 text-muted">{intro}</p>
        {children}
      </div>
    </div>
  )
}

