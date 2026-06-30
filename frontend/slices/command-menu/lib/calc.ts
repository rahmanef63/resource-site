// SAFE arithmetic evaluator for the palette's "= 42" result row.
// SECURITY: NEVER eval()/new Function() on user input — we tokenize, run
// shunting-yard to RPN, then fold. Returns null for anything that is not a
// valid pure-arithmetic expression, so plain search text ("files") stays a
// normal search instead of surfacing as "= NaN".
//
// ponytail: ceiling is the four binary ops (+ - * /, incl. the × ÷ glyphs) and
// parentheses. No unary minus, no exponent, no functions — a command palette
// calculator, not a CAS. Bump only when someone actually types "-5" and complains.

type Tok =
  | { t: "num"; v: number }
  | { t: "op"; v: "+" | "-" | "*" | "/" }
  | { t: "(" }
  | { t: ")" };

const PREC: Record<string, number> = { "+": 1, "-": 1, "*": 2, "/": 2 };

function tokenize(input: string): Tok[] | null {
  // Normalise the unicode math glyphs to their ASCII operators first.
  const s = input.replace(/×/g, "*").replace(/÷/g, "/");
  const toks: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === " " || c === "\t") {
      i++;
      continue;
    }
    if ((c >= "0" && c <= "9") || c === ".") {
      let j = i;
      let dots = 0;
      while (j < s.length && ((s[j] >= "0" && s[j] <= "9") || s[j] === ".")) {
        if (s[j] === ".") dots++;
        j++;
      }
      if (dots > 1) return null; // "1.2.3" is not a number
      const v = Number(s.slice(i, j));
      if (!Number.isFinite(v)) return null; // a lone "." etc.
      toks.push({ t: "num", v });
      i = j;
      continue;
    }
    if (c === "+" || c === "-" || c === "*" || c === "/") {
      toks.push({ t: "op", v: c });
      i++;
      continue;
    }
    if (c === "(" || c === ")") {
      toks.push({ t: c });
      i++;
      continue;
    }
    return null; // any other char → not arithmetic
  }
  return toks;
}

function toRpn(toks: Tok[]): Tok[] | null {
  const out: Tok[] = [];
  const stack: Tok[] = [];
  for (const tk of toks) {
    if (tk.t === "num") {
      out.push(tk);
    } else if (tk.t === "op") {
      let top = stack[stack.length - 1];
      while (top && top.t === "op" && PREC[top.v] >= PREC[tk.v]) {
        out.push(stack.pop()!);
        top = stack[stack.length - 1];
      }
      stack.push(tk);
    } else if (tk.t === "(") {
      stack.push(tk);
    } else {
      let matched = false;
      while (stack.length) {
        const top = stack.pop()!;
        if (top.t === "(") {
          matched = true;
          break;
        }
        out.push(top);
      }
      if (!matched) return null; // unbalanced ")"
    }
  }
  while (stack.length) {
    const top = stack.pop()!;
    if (top.t === "(") return null; // unbalanced "("
    out.push(top);
  }
  return out;
}

function evalRpn(rpn: Tok[]): number | null {
  const st: number[] = [];
  for (const tk of rpn) {
    if (tk.t === "num") {
      st.push(tk.v);
      continue;
    }
    if (tk.t !== "op") return null;
    const b = st.pop();
    const a = st.pop();
    if (a === undefined || b === undefined) return null; // not enough operands
    let r: number;
    if (tk.v === "+") r = a + b;
    else if (tk.v === "-") r = a - b;
    else if (tk.v === "*") r = a * b;
    else {
      if (b === 0) return null; // guard divide-by-zero
      r = a / b;
    }
    st.push(r);
  }
  if (st.length !== 1) return null; // dangling operands / empty input
  return Number.isFinite(st[0]) ? st[0] : null;
}

/** Evaluate a pure-arithmetic string, or null if it is not one. */
export function evaluate(input: string): number | null {
  const toks = tokenize(input);
  if (!toks || toks.length === 0) return null;
  // Require at least one operator so a bare number ("5") stays a search, not a result.
  if (!toks.some((t) => t.t === "op")) return null;
  // Reject juxtaposed values ("2 3 *", "10 5*", "(1)(2)") — no valid infix reading;
  // without this the RPN fold returns a confidently-wrong "=" row.
  for (let i = 1; i < toks.length; i++) {
    const aEndsValue = toks[i - 1].t === "num" || toks[i - 1].t === ")";
    const bStartsValue = toks[i].t === "num" || toks[i].t === "(";
    if (aEndsValue && bStartsValue) return null;
  }
  const rpn = toRpn(toks);
  if (!rpn) return null;
  return evalRpn(rpn);
}
