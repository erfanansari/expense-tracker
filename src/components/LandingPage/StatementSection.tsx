const StatementSection = () => {
  return (
    <section className="border-border-subtle border-t">
      <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
        <p className="text-text-muted text-xs font-medium tracking-widest uppercase">Why Kharji</p>
        <p className="text-text-primary mt-6 text-2xl leading-snug font-medium tracking-tight sm:text-3xl">
          Most finance apps assume your money lives in one stable currency.{' '}
          <span className="text-text-muted">Kharji doesn&apos;t.</span>
        </p>
        <p className="text-text-secondary mt-6 text-base leading-relaxed sm:text-lg">
          It&apos;s built for paychecks in dollars, groceries in toman, savings in gold. Every amount is converted at
          the exchange rate of the day it happened — so when rates move, your history stays honest and your net worth
          stays real.
        </p>
      </div>
    </section>
  );
};

export default StatementSection;
