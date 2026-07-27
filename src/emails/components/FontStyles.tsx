import * as React from 'react';

import { VAZIRMATN_FONT_CSS } from '../fonts';
import type { EmailLocale } from '../i18n';

/**
 * Webfont declarations for the <Head> of every template. Only the Persian
 * locale needs one — the English stack is all system fonts.
 */
export const FontStyles = ({ locale }: { locale: EmailLocale }) => {
  if (locale !== 'fa') return null;
  return <style dangerouslySetInnerHTML={{ __html: VAZIRMATN_FONT_CSS }} />;
};

export default FontStyles;
