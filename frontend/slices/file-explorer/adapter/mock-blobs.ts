// Seed bytes for the in-memory mock. Keyed by absolute path (norm-ed). `url` is
// a self-contained data URL (image/audio/pdf render with zero backend); `text`
// is the editable body for text files (read + Properties editor). Keeps the
// mock demoable — preview, download, and audio/pdf widgets all work offline.

// `url` is a self-contained data: URL (seeds) or an object URL minted from
// `blob` (uploaded binaries — no base64 inflation, revocable). `text` is the
// editable body for text files. A file has EITHER url/blob (binary) OR text.
export type MockBlob = { url?: string; blob?: Blob; text?: string; mime?: string };
export type MockBlobs = Record<string, MockBlob>;

// A crisp little logo (SVG is text, so it's cheap and scales in <img>).
const LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">' +
  '<rect width="64" height="64" rx="12" fill="#0ea5e9"/>' +
  '<path d="M14 22h16l4 5h16v19a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3z" fill="#fff"/>' +
  '<circle cx="32" cy="38" r="6" fill="#0ea5e9"/></svg>';
const LOGO_URL = "data:image/svg+xml," + encodeURIComponent(LOGO_SVG);

// tiny 0.12s 440Hz sine (8kHz 8-bit mono) — proves the audio widget plays.
const BEEP_WAV =
  "data:audio/wav;base64,UklGRuQDAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YcADAACAnrnN2NnPvKGDZEk0KCcwQlx6mbXK19rRwKaIak03KiYtPld1lLDH1trUxKuOb1I7KyYrO1JvjqvE1NrWx7CUdVc+LSYqN01qiKbA0drXyrWZelxCMCcoNElkg6G8z9nYzbmegGJHMygnMURffZy3zNjZ0L6khmdLNikmL0BaeJazydba08Kpi2xQOSomLDxVcpGuxdXa1cWukXJVPCwmKjlQbIupwtPa1smzlnhaQC8mKTZLZ4akvtDZ2My3nH1fRDEnKDNHYoCeuc3Y2c+8oYNkSTQoJzBCXHqZtcrX2tHApohqTTcqJi0+V3WUsMfW2tTEq45vUjsrJis7Um+Oq8TU2tbHsJR1Vz4tJio3TWqIpsDR2tfKtZl6XEIwJyg0SWSDobzP2djNuZ6AYkczKCcxRF99nLfM2NnQvqSGZ0s2KSYvQFp4lrPJ1trTwqmLbFA5KiYsPFVyka7F1drVxa6RclU8LCYqOVBsi6nC09rWybOWeFpALyYpNktnhqS+0NnYzLecfV9EMScoM0digJ65zdjZz7yhg2RJNCgnMEJcepm1ytfa0cCmiGpNNyomLT5XdZSwx9ba1MSrjm9SOysmKztSb46rxNTa1sewlHVXPi0mKjdNaoimwNHa18q1mXpcQjAnKDRJZIOhvM/Z2M25noBiRzMoJzFEX32ct8zY2dC+pIZnSzYpJi9AWniWs8nW2tPCqYtsUDkqJiw8VXKRrsXV2tXFrpFyVTwsJio5UGyLqcLT2tbJs5Z4WkAvJik2S2eGpL7Q2djMt5x9X0QxJygzR2KAnrnN2NnPvKGDZEk0KCcwQlx6mbXK19rRwKaIak03KiYtPld1lLDH1trUxKuOb1I7KyYrO1JvjqvE1NrWx7CUdVc+LSYqN01qiKbA0drXyrWZelxCMCcoNElkg6G8z9nYzbmegGJHMygnMURffZy3zNjZ0L6khmdLNikmL0BaeJazydba08Kpi2xQOSomLDxVcpGuxdXa1cWukXJVPCwmKjlQbIupwtPa1smzlnhaQC8mKTZLZ4akvtDZ2My3nH1fRDEnKDNHYoCeuc3Y2c+8oYNkSTQoJzBCXHqZtcrX2tHApohqTTcqJi0+V3WUsMfW2tTEq45vUjsrJis7Um+Oq8TU2tbHsJR1Vz4tJio3TWqIpsDR2tfKtZl6XEIwJyg0SWSDobzP2djNuZ6AYkczKCcxRF99nLfM2NnQvqSGZ0s2KSYvQFp4lrPJ1trTwqmLbFA5KiYsPFVyka7F1drVxa6RclU8LCY=";

// minimal one-page PDF.
const HELLO_PDF =
  "data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iajw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+ZW5kb2JqCjIgMCBvYmo8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PmVuZG9iagozIDAgb2JqPDwvVHlwZS9QYWdlL1BhcmVudCAyIDAgUi9NZWRpYUJveFswIDAgMzAwIDE0NF0vUmVzb3VyY2VzPDwvRm9udDw8L0YxIDQgMCBSPj4+Pi9Db250ZW50cyA1IDAgUj4+ZW5kb2JqCjQgMCBvYmo8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+PmVuZG9iago1IDAgb2JqPDwvTGVuZ3RoIDY4Pj5zdHJlYW0KQlQgL0YxIDIwIFRmIDQwIDgwIFRkIChGaWxlcyBFeHBsb3JlciBQREYpIFRqIEVUCmVuZHN0cmVhbSBlbmRvYmoKdHJhaWxlcjw8L1Jvb3QgMSAwIFI+PgolJUVPRg==";

const README = `# Files Explorer

A backend-agnostic file manager. This copy runs on the in-memory **mock**, so
everything here is real and editable — rename, move, upload, download, preview.

- Right-click a file → **Properties** to edit its content, icon, and endpoint.
- Open an image / audio / pdf / text file to preview it inline.
- Upload your own files; they get real bytes and preview + download.
`;

const INDEX_HTML = `<!doctype html>
<html>
  <head><title>Hello</title></head>
  <body>
    <h1>Hello from the Files Explorer</h1>
    <p>Edit me in Properties. Set an icon + endpoint.</p>
  </body>
</html>
`;

const DATA_JSON = JSON.stringify(
  { name: "sample", items: [1, 2, 3], nested: { ok: true } },
  null,
  2,
);

export function seedBlobs(): MockBlobs {
  return {
    "/Pictures/logo.svg": { url: LOGO_URL, mime: "image/svg+xml" },
    "/Music/beep.wav": { url: BEEP_WAV, mime: "audio/wav" },
    "/Documents/hello.pdf": { url: HELLO_PDF, mime: "application/pdf" },
    "/readme.md": { text: README, mime: "text/markdown" },
    "/Projects/website/index.html": { text: INDEX_HTML, mime: "text/html" },
    "/Projects/file-explorer/data.json": { text: DATA_JSON, mime: "application/json" },
  };
}
