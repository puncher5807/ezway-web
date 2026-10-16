// Minimální šablonovací funkce bez závislostí.
// Hodnoty vložené do html`...` se ve výchozím stavu escapují, takže obsah z JSON nemůže rozbít stránku.
// Hotové HTML (výsledek html`` nebo raw()) se vkládá beze změny. Pole se spojují bez oddělovače.
// false, true, null a undefined se nevypisují, takže jde psát ${podmínka && html`...`}.
// Hodnota atributu musí být řetězec: aria-pressed="${String(true)}".

export class Safe {
  constructor(value) {
    this.value = value;
  }
  toString() {
    return this.value;
  }
}

export const raw = (value) => new Safe(String(value));

export const esc = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

function render(value) {
  if (value === null || value === undefined || value === false || value === true) return '';
  if (value instanceof Safe) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  return esc(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i += 1) {
    out += render(values[i]) + strings[i + 1];
  }
  return new Safe(out);
}
