// The ONE zero-state treatment for stat cards, app-wide: muted em-dash +
// muted caption. Never restyle per page — use this component (or the class
// constants when dash and caption can't be colocated).
export const ZERO_VALUE_CLASS = 'text-text-muted text-2xl font-semibold tabular-nums';
export const ZERO_CAPTION_CLASS = 'text-text-muted mt-1.5 text-sm font-medium';

const StatZeroState = ({ caption }: { caption: string }) => (
  <>
    <p className={ZERO_VALUE_CLASS}>—</p>
    <p className={ZERO_CAPTION_CLASS}>{caption}</p>
  </>
);

export default StatZeroState;
