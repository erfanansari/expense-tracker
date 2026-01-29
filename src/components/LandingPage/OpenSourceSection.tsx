import { Github, Heart } from 'lucide-react';

export default function OpenSourceSection() {
  return (
    <section className="bg-background-secondary py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          <div className="border-border-subtle bg-background mb-5 flex h-12 w-12 items-center justify-center rounded-xl border">
            <Heart className="text-text-primary h-5 w-5" />
          </div>

          <h2 className="text-text-primary mb-2 text-xl font-bold sm:text-2xl">Proudly Open Source</h2>
          <p className="text-text-muted mb-1 text-xs font-medium" dir="rtl">
            متن‌باز و آزاد
          </p>

          <p className="text-text-secondary mt-3 mb-6 max-w-md text-sm leading-relaxed sm:text-base">
            Kharji is open source and free to use. Inspect the code, self-host it, or contribute to make it better.
          </p>

          <a
            href="https://github.com/erfanansari/kharji"
            target="_blank"
            rel="noopener noreferrer"
            className="border-border-subtle bg-background text-text-primary hover:bg-background-elevated inline-flex items-center gap-2 rounded-lg border px-5 py-2.5 text-sm font-semibold transition-colors"
          >
            <Github className="h-4 w-4" />
            View on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
