export function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k.startsWith("on")) e.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(k, v);
  }
  for (const c of kids.flat()) e.append(c instanceof Node ? c : document.createTextNode(String(c)));
  return e;
}
export const $ = (s, r = document) => r.querySelector(s);
export const money = n => "$" + Number(n).toFixed(2);
export function say(msg, type = "ok") {
  const b = $("#msg");
  if (!b) return;
  b.className = msg ? "alert " + type : "";
  b.textContent = msg || "";
}