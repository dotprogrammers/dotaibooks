import { useAppStore } from '@/lib/store'

export function AppFooter() {
  const setView = useAppStore((s) => s.setView)
  return (
    <footer className="mt-auto border-t bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold text-[10px]">DOT</div>
              <span className="font-bold text-white">DOTAIBOOKS</span>
            </div>
            <p className="text-xs text-slate-400">AI-powered ITIL & DevOps certification training platform.</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Platform</h4>
            <ul className="space-y-1 text-xs">
              <li><button onClick={() => setView('landing')} className="hover:text-teal-400">Home</button></li>
              <li><button onClick={() => setView('pricing')} className="hover:text-teal-400">Pricing</button></li>
              <li><button onClick={() => setView('blog')} className="hover:text-teal-400">Blog</button></li>
              <li><button onClick={() => setView('register')} className="hover:text-teal-400">Get Started</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Certifications</h4>
            <ul className="space-y-1 text-xs text-slate-400">
              <li>ITIL Product (v5)</li>
              <li>DevOps Foundation</li>
              <li>DevOps Leader</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Powered by</h4>
            <p className="text-xs text-slate-400">Z.ai LLM & Image/Video Generation for AI-powered study materials.</p>
          </div>
        </div>
        <div className="border-t border-slate-700 pt-4 text-center text-xs text-slate-400">
          © 2025 DOTAIBOOKS. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
