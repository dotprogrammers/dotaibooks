export function AppFooter() {
  return (
    <footer className="mt-auto border-t bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-5">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-bold text-[10px]">
              IT5
            </div>
            <span className="font-medium">ITIL 5 Trainer</span>
            <span className="hidden sm:inline">· AI-Powered Study System</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Powered by Z.ai LLM & Image Generation</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
