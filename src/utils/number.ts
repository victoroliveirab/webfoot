/**
 * Formats a number-like by adding a space every other 3 characters
 * @example formatNumber(1_234_567) === "1 234 567"
 */
export function formatNumber(value: string | number) {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Converts a number-like to its extensive description
 */
export function describeNumberMoney(value: string | number, complete: boolean = false) {
  let number = +value;
  if (number <= 0) return `${number} reais`;
  if (number === 1) return "1 real";
  if (number < 1_000) return `${number} reais`;
  if (number > 1_000_000_000) throw new Error("Hacked the matrix");
  const describers = [];
  if (number >= 1_000_000) {
    const qty = Math.floor(number / 1_000_000);
    describers.push(`${qty} milh${qty === 1 ? "ão" : "ões"}`);
    number -= 1_000_000 * qty;
  }
  if (number >= 1_000) {
    const qty = Math.floor(number / 1_000);
    describers.push(`${qty} mil`);
    number -= 1_000 * qty;
  }

  if (!complete || number === 0) {
    return `${describers.join(" e ")} ${describers.length === 1 && !describers[0].endsWith("mil") ? "de reais" : "reais"}`;
  }
  return `${describers.join(", ")} e ${number} reais`;
}
