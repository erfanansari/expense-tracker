import type { ReactNode } from 'react';

import { NextIntlClientProvider } from 'next-intl';

import ChartTooltip from '..';
import { render, screen } from '@testing-library/react';

import en from '../../../../messages/en.json';
import fa from '../../../../messages/fa.json';

// Every chart body is wrapped in dir="ltr" because Recharts positions its axes
// along that direction. The tooltip is a text panel inside that wrapper, so it
// has to opt back into RTL itself under Farsi — inheriting `ltr` is what left
// the amount stranded on the wrong edge of the panel.
const renderInChart = (locale: 'en' | 'fa', children: ReactNode) =>
  render(
    <NextIntlClientProvider locale={locale} messages={locale === 'fa' ? fa : en}>
      <div dir="ltr" data-testid="chart-body">
        {children}
      </div>
    </NextIntlClientProvider>
  );

const panelOf = (text: string) => screen.getByText(text).closest('div') as HTMLElement;

describe('ChartTooltip direction', () => {
  it('renders right-to-left under Farsi even inside an ltr chart body', () => {
    renderInChart('fa', <ChartTooltip primary="۱۸۹٬۴۰۰ تومان" />);

    expect(screen.getByTestId('chart-body')).toHaveAttribute('dir', 'ltr');
    expect(panelOf('۱۸۹٬۴۰۰ تومان')).toHaveAttribute('dir', 'rtl');
  });

  it('stays left-to-right under English', () => {
    renderInChart('en', <ChartTooltip primary="$1,234" />);

    expect(panelOf('$1,234')).toHaveAttribute('dir', 'ltr');
  });

  it('aligns text to the reading edge rather than hard-coding left', () => {
    renderInChart('fa', <ChartTooltip primary="۱۲۳" secondary="$4.56" />);

    // `text-start` follows `dir`; `text-left` would pin Farsi to the wrong side.
    const panel = panelOf('۱۲۳');
    expect(panel.className).toContain('text-start');
    expect(panel.className).not.toContain('text-left');
  });

  it('renders the secondary and accent lines when given', () => {
    renderInChart('en', <ChartTooltip primary="$100" secondary="£80" accent={{ text: 'Mar 2026', tone: 'success' }} />);

    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('£80')).toBeInTheDocument();
    expect(screen.getByText('Mar 2026')).toBeInTheDocument();
  });
});
