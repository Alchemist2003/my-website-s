const nameButton = document.getElementById("nameButton");
const secretText = document.getElementById("secretText");
const card = document.querySelector(".card");
const cardOutput = document.getElementById("cardOutput");
const vault = document.getElementById("vault");
const vaultInput = document.getElementById("vaultInput");
const vaultMessage = document.getElementById("vaultMessage");
const d = (v) => atob(v);
const sideLoveLayerId = "sideLoveLayer";

let clickCount = 0;
let resetTimer;
let outsideCount = 0;
let outsideTimer;

const revealLines = [
  "U2VjcmV0IHVubG9ja2VkOiBrZWVwIGV4cGxvcmluZywgS2VlcCBidWlsZGluZy4=",
  "RWdnc+KAmXMgaGVyZTogY3VyaW9zaXR5IGlzIHlvdXIgYmVzdCBzdXBlcnBvd2VyLg==",
  "Q2xhc3N5IG1vZGU6IHRpbnkgc3RlcHMsIGNvbnNpc3RlbnQgbW9tZW50dW0u",
].map((v) => d(v));

const rules = [
  {
    keys: ["aGVidQ=="].map((v) => d(v)),
    msg: d("SSBsb3ZlIHlvdXV1IGFuZCBraXNzZXMu"),
    burst: ["💖", "💕", "😘", "💋"],
    mood: "love",
  },
  {
    keys: [
      "YWJoaXJhbWk=",
      "cnVmdXM=",
      "ZGFu",
      "YWZzYWw=",
      "aGFyZWVzaA==",
      "YXN3YWppdGg=",
      "dmlnbmVzaA==",
    ].map((v) => d(v)),
    msg: d(
      "WW91IGFyZSBhIHZlcnkgZ29vZCBmcmllbmQgYW5kIEkgYW0gaGFwcHkgeW91IGV4aXN0Lg==",
    ),
    burst: ["🤝", "✨", "🎉", "🙂"],
    mood: "friends",
  },
  {
    keys: ["YWJpbmVldGg=", "c2lkZGhhcnRo", "c2lkZGhhZGV2"].map((v) => d(v)),
    msg: d(
      "RmFtaWx5IGxpa2UgeW91IG1ha2VzIGxpZmUgd2FybWVyLCBzdHJvbmdlciwgYW5kIGJyaWdodGVyIGV2ZXJ5IGRheS4=",
    ),
    burst: ["🫂", "🌟", "💙", "🏡"],
    mood: "family",
  },
  {
    keys: ["amFsYWph", "c2FqaXRo"].map((v) => d(v)),
    msg: d(
      "Rm9yIG15IHBhcmVudHM6IHRoYW5rIHlvdSBmb3IgZXZlcnkgc2FjcmlmaWNlLCBwcmF5ZXIsIGFuZCBxdWlldCBzdHJlbmd0aC4=",
    ),
    burst: ["🙏", "❤️", "🌸", "✨"],
    mood: "parents",
  },
  {
    keys: ["c2liaQ==", "c2F0aGVlc2g=", "c3Rhbmx5", "YXJ1bg=="].map((v) => d(v)),
    msg: d(
      "VG8gdGhlIG1lbnRvcnMgd2hvIHNoYXBlZCBtZTogeW91ciBndWlkYW5jZSBzdGlsbCBkcml2ZXMgbXkgcGF0aC4=",
    ),
    burst: ["📚", "🌟", "🙏", "🧠"],
    mood: "mentors",
  },
];

function dropSpark(pool) {
  const spark = document.createElement("span");
  spark.className = "spark";
  spark.textContent = pool[Math.floor(Math.random() * pool.length)];
  spark.style.left = `${Math.random() * 100}vw`;
  document.body.appendChild(spark);
  setTimeout(() => spark.remove(), 5000);
}

function popSpark(pool, x, y) {
  const spark = document.createElement("span");
  const angle = Math.random() * Math.PI * 2;
  const distance = 60 + Math.random() * 170;
  spark.className = "spark spark-pop";
  spark.textContent = pool[Math.floor(Math.random() * pool.length)];
  spark.style.setProperty("--sx", `${x}px`);
  spark.style.setProperty("--sy", `${y}px`);
  spark.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
  spark.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
  document.body.appendChild(spark);
  setTimeout(() => spark.remove(), 3400);
}

function burst(pool, count = 16, pace = 65) {
  for (let i = 0; i < count; i += 1) {
    setTimeout(() => dropSpark(pool), i * pace);
  }
}

function popBurst(pool, count = 20, pace = 52) {
  const rect = card.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  for (let i = 0; i < count; i += 1) {
    setTimeout(() => popSpark(pool, centerX, centerY), i * pace);
  }
}

function applyMood(mood) {
  const moodClasses = [
    "mood-love",
    "mood-friends",
    "mood-family",
    "mood-parents",
    "mood-mentors",
  ];
  const ambientClasses = [
    "ambient-love",
    "ambient-friends",
    "ambient-family",
    "ambient-parents",
    "ambient-mentors",
  ];

  card.classList.remove(...moodClasses);
  document.body.classList.remove(...ambientClasses);

  card.classList.add(`mood-${mood}`);
  document.body.classList.add(`ambient-${mood}`);
}

function revealMessage(text) {
  setCardOutput(text);
  if (vaultMessage) {
    vaultMessage.textContent = "";
    vaultMessage.classList.remove("reveal");
  }
}

function setCardOutput(text) {
  if (!cardOutput) {
    return;
  }

  const clean = (text || "").trim();
  cardOutput.textContent = clean;
  card.classList.toggle("has-output", clean.length > 0);
}

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findRule(value) {
  const cleaned = normalize(value);
  if (!cleaned) {
    return null;
  }

  return (
    rules.find((rule) => rule.keys.some((key) => cleaned.includes(key))) || null
  );
}

function hasAbhiLoveCombo(value) {
  const cleaned = normalize(value);
  return (
    cleaned.includes("abhi") &&
    (cleaned.includes("hebu") || cleaned.includes("heba"))
  );
}

function getOrCreateSideLoveLayer() {
  let layer = document.getElementById(sideLoveLayerId);
  if (layer) {
    return layer;
  }

  layer = document.createElement("div");
  layer.id = sideLoveLayerId;
  layer.className = "side-love-layer";
  layer.innerHTML = `
    <span class="side-love-emoji left a">💖</span>
    <span class="side-love-emoji left b">💕</span>
    <span class="side-love-emoji right a">💘</span>
    <span class="side-love-emoji right b">💗</span>
  `;
  document.body.appendChild(layer);
  return layer;
}

function showSideLove() {
  const layer = getOrCreateSideLoveLayer();
  layer.classList.add("active");
}

function hideSideLove() {
  const layer = document.getElementById(sideLoveLayerId);
  if (layer) {
    layer.classList.remove("active");
  }
}

function isCalcInput(raw) {
  return raw.includes("=");
}

function tokenizeExpression(source) {
  const tokens = [];
  const text = source.replace(/\*\*/g, "^").trim();
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    if (/\s/.test(ch)) {
      i += 1;
      continue;
    }

    if (/[0-9.]/.test(ch)) {
      let start = i;
      let dotCount = 0;
      while (i < text.length && /[0-9.]/.test(text[i])) {
        if (text[i] === ".") {
          dotCount += 1;
        }
        i += 1;
      }
      const rawNum = text.slice(start, i);
      if (dotCount > 1 || rawNum === ".") {
        throw new Error("Invalid number format");
      }
      tokens.push({ type: "number", value: Number(rawNum) });
      continue;
    }

    if (/[a-zA-Z_]/.test(ch)) {
      let start = i;
      while (i < text.length && /[a-zA-Z_]/.test(text[i])) {
        i += 1;
      }
      tokens.push({ type: "ident", value: text.slice(start, i).toLowerCase() });
      continue;
    }

    if ("+-*/%^(),!".includes(ch)) {
      tokens.push({ type: "op", value: ch });
      i += 1;
      continue;
    }

    throw new Error(`Unsupported character: ${ch}`);
  }

  return tokens;
}

function evaluateExpression(source) {
  const constants = {
    pi: Math.PI,
    e: Math.E,
  };

  const functions = {
    sqrt: (a) => Math.sqrt(a),
    cbrt: (a) => Math.cbrt(a),
    abs: (a) => Math.abs(a),
    floor: (a) => Math.floor(a),
    ceil: (a) => Math.ceil(a),
    round: (a) => Math.round(a),
    sin: (a) => Math.sin(a),
    cos: (a) => Math.cos(a),
    tan: (a) => Math.tan(a),
    asin: (a) => Math.asin(a),
    acos: (a) => Math.acos(a),
    atan: (a) => Math.atan(a),
    log: (a) => Math.log10(a),
    ln: (a) => Math.log(a),
    exp: (a) => Math.exp(a),
    pow: (a, b) => Math.pow(a, b),
    min: (...values) => Math.min(...values),
    max: (...values) => Math.max(...values),
  };

  const tokens = tokenizeExpression(source);
  let index = 0;

  const peek = () => tokens[index] || null;
  const consume = () => {
    const token = tokens[index];
    index += 1;
    return token;
  };

  const consumeIf = (value) => {
    const token = peek();
    if (token && token.type === "op" && token.value === value) {
      consume();
      return true;
    }
    return false;
  };

  const expectOp = (value) => {
    if (!consumeIf(value)) {
      throw new Error(`Expected '${value}'`);
    }
  };

  const factorial = (n) => {
    if (!Number.isFinite(n) || n < 0 || !Number.isInteger(n)) {
      throw new Error("Factorial needs a non-negative integer");
    }
    if (n > 170) {
      throw new Error("Factorial too large");
    }
    let out = 1;
    for (let k = 2; k <= n; k += 1) {
      out *= k;
    }
    return out;
  };

  const parseExpression = () => {
    let value = parseTerm();
    while (true) {
      if (consumeIf("+")) {
        value += parseTerm();
      } else if (consumeIf("-")) {
        value -= parseTerm();
      } else {
        break;
      }
    }
    return value;
  };

  const parseTerm = () => {
    let value = parsePower();
    while (true) {
      if (consumeIf("*")) {
        value *= parsePower();
      } else if (consumeIf("/")) {
        const right = parsePower();
        if (right === 0) {
          throw new Error("Division by zero");
        }
        value /= right;
      } else if (consumeIf("%")) {
        const right = parsePower();
        if (right === 0) {
          throw new Error("Modulo by zero");
        }
        value %= right;
      } else {
        break;
      }
    }
    return value;
  };

  const parsePower = () => {
    let value = parseUnary();
    if (consumeIf("^")) {
      const right = parsePower();
      value = Math.pow(value, right);
    }
    return value;
  };

  const parseUnary = () => {
    if (consumeIf("+")) {
      return parseUnary();
    }
    if (consumeIf("-")) {
      return -parseUnary();
    }
    return parsePostfix();
  };

  const parsePostfix = () => {
    let value = parsePrimary();
    while (consumeIf("!")) {
      value = factorial(value);
    }
    return value;
  };

  const parseArgs = () => {
    const args = [];
    if (consumeIf(")")) {
      return args;
    }

    while (true) {
      args.push(parseExpression());
      if (consumeIf(")")) {
        break;
      }
      expectOp(",");
    }
    return args;
  };

  const parsePrimary = () => {
    const token = peek();
    if (!token) {
      throw new Error("Incomplete expression");
    }

    if (token.type === "number") {
      consume();
      return token.value;
    }

    if (token.type === "ident") {
      consume();
      const name = token.value;
      if (consumeIf("(")) {
        const fn = functions[name];
        if (!fn) {
          throw new Error(`Unknown function: ${name}`);
        }
        const args = parseArgs();
        const value = fn(...args);
        if (!Number.isFinite(value)) {
          throw new Error("Invalid math result");
        }
        return value;
      }

      if (Object.prototype.hasOwnProperty.call(constants, name)) {
        return constants[name];
      }

      throw new Error(`Unknown symbol: ${name}`);
    }

    if (consumeIf("(")) {
      const value = parseExpression();
      expectOp(")");
      return value;
    }

    throw new Error("Unexpected token");
  };

  const result = parseExpression();
  if (index !== tokens.length) {
    throw new Error("Unexpected trailing input");
  }
  if (!Number.isFinite(result)) {
    throw new Error("Invalid result");
  }
  return result;
}

function formatCalcResult(value) {
  if (Number.isInteger(value)) {
    return String(value);
  }
  return String(Number(value.toFixed(10)));
}

function extractExpression(raw) {
  const parts = raw.split("=");
  const first = (parts[0] || "").trim();
  const last = (parts[parts.length - 1] || "").trim();
  return first || last;
}

nameButton.addEventListener("click", () => {
  clickCount += 1;
  clearTimeout(resetTimer);

  if (clickCount >= 5) {
    clickCount = 0;
    card.classList.remove("party");
    void card.offsetWidth;
    card.classList.add("party");

    burst(["✨", "⚙️", "🚗", "🧠"], 22, 95);

    if (secretText) {
      secretText.hidden = false;
      secretText.textContent =
        revealLines[Math.floor(Math.random() * revealLines.length)];
    }
    nameButton.setAttribute("aria-label", "Easter egg unlocked");
  }

  resetTimer = setTimeout(() => {
    clickCount = 0;
  }, 1400);
});

document.addEventListener("click", (event) => {
  if (card.contains(event.target)) {
    return;
  }

  outsideCount += 1;
  clearTimeout(outsideTimer);

  if (outsideCount >= 5) {
    outsideCount = 0;
    vault.hidden = false;
    vaultInput.focus();
    if (vaultMessage) {
      vaultMessage.textContent = "";
    }
  }

  outsideTimer = setTimeout(() => {
    outsideCount = 0;
  }, 1500);
});

vaultInput.addEventListener("input", () => {
  const current = vaultInput.value;

  if (hasAbhiLoveCombo(current)) {
    revealMessage("Abhi + Hebu = love mode unlocked.");
    applyMood("love");
    showSideLove();
    burst(["💖", "💕", "💘", "💗", "❤️"], 46, 80);
    popBurst(["💖", "💘", "💝", "💞"], 36, 62);
    return;
  }

  hideSideLove();

  if (isCalcInput(current)) {
    const expr = extractExpression(current);
    if (!expr) {
      setCardOutput("");
      return;
    }

    try {
      const answer = evaluateExpression(expr);
      setCardOutput(`${expr} = ${formatCalcResult(answer)}`);
    } catch (_error) {
      setCardOutput("Invalid calculation");
    }
    return;
  }

  const rule = findRule(vaultInput.value);
  if (!rule) {
    setCardOutput("");
    if (vaultMessage) {
      vaultMessage.textContent = "";
      vaultMessage.classList.remove("reveal");
    }
    return;
  }

  revealMessage(rule.msg);
  burst(rule.burst, 40, 85);
  popBurst(rule.burst, 38, 58);
  setTimeout(() => {
    burst(rule.burst, 24, 90);
    popBurst(rule.burst, 20, 65);
  }, 1700);
  applyMood(rule.mood);
});
