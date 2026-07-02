import pkg from '../../../package.json';

const LandingFooter = () => {
  const year = new Date().getFullYear();
  const commitSha = process.env.NEXT_PUBLIC_COMMIT_SHA || 'dev';

  return (
    <footer className="border-border-subtle border-t">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm sm:flex-row sm:px-6 lg:px-8">
        <span className="text-text-muted">© {year} Kharji</span>

        <span className="text-text-muted font-mono text-xs">
          v{pkg.version} · {commitSha}
        </span>
      </div>
    </footer>
  );
};

export default LandingFooter;
