import en from '../../messages/en.json';

// next-intl's `t` is typed with a literal union of valid message keys, which is
// narrower than `string` — typing this as `(key: string) => string` would reject
// it (contravariant parameter check). `any` here accepts both next-intl's `t`
// and this module's own fallbackT.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Translator = (key: any) => string;

/**
 * Static English translator for schema instances used outside React (module-scope
 * mutation configs in src/api/*.ts, wired as `requestDataSchema` — a client-side
 * defensive re-check before the network call, since the form itself already
 * validates via a properly localized zodResolver). This path essentially never
 * surfaces to users through normal UI flows, so it isn't worth threading a live
 * locale through non-component code for it.
 */
export function fallbackT(key: string): string {
  const value = key.split('.').reduce<unknown>((obj, part) => (obj as Record<string, unknown> | undefined)?.[part], en);
  return typeof value === 'string' ? value : key;
}
