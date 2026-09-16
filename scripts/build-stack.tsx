/* @jsxRuntime automatic @jsxImportSource react */
// Regenerates assets/stack-{light,dark}.svg with uipack. GitHub shows the
// README on white and on its dark theme, so both palettes are GitHub's own
// greys with the teal the profile already uses. Run: npm run stack
import { writeFileSync } from "node:fs";
import { Connector, Defs, Label, Node, Packet } from "uipack";
import { renderStatic, type StaticOptions } from "uipack/static";

const CLAIM =
  "How I build agent systems: data and tools feed an agent runtime, whose output passes a deterministic boundary before reaching an interface.";

const THEMES: Record<"light" | "dark", NonNullable<StaticOptions["theme"]>> = {
  light: { base: "light", fg: "#1f2328", muted: "#59636e", bg: "#ffffff", surface: "#f6f8fa", "surface-raised": "#eef1f4", border: "#d1d9e0", grid: "#d1d9e0", accent: "#0f766e", "token-request": "#0969da", "token-response": "#0f766e", "token-change": "#bf8700", mono: 'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, monospace', sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif" },
  dark: { base: "dark", fg: "#e6edf3", muted: "#8b949e", bg: "#0d1117", surface: "#161b22", "surface-raised": "#1c2129", border: "#30363d", grid: "#30363d", accent: "#2dd4bf", "token-request": "#58a6ff", "token-response": "#2dd4bf", "token-change": "#d29922", mono: 'ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, monospace', sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif" },
};

// 860 wide like the file it replaces; boxes on the 8px grid.
const y = 64;
const h = 72;
const cy = y + h / 2;
const boxes = [
  { x: 24, w: 168, label: "Tools & data", sub: "MCP · gRPC · OLAP" },
  { x: 224, w: 168, label: "Agent runtime", sub: "A2A · LangGraph" },
  { x: 424, w: 224, label: "Groundplane", sub: "claims resolve, or it raises", accent: true },
  { x: 680, w: 156, label: "Interface", sub: "React · streaming" },
];
const edge = (i: number): [number, number][] => [[boxes[i].x + boxes[i].w, cy], [boxes[i + 1].x, cy]];

const figure = {
  alt: CLAIM,
  viewBox: "0 0 860 230",
  children: (
    <>
      <Defs id="stack" />
      <Label x={24} y={34} text="how i build agent systems" accent size={12} />
      {boxes.map((b) => (
        <Node key={b.label} x={b.x} y={y} w={b.w} h={h} label={b.label} sub={b.sub} accent={b.accent} align="center" size={13} subSize={10} />
      ))}
      {[0, 1].map((i) => (
        <g key={i}>
          <Connector points={edge(i)} defs="stack" kind="request" />
          <Packet points={edge(i)} kind="request" dur={1.6} delay={-i * 0.6} r={4} />
        </g>
      ))}
      <Connector points={edge(2)} defs="stack" kind="response" />
      <Packet points={edge(2)} kind="response" dur={1.6} delay={-1.2} r={4} />
      <Label x={536} y={y + h + 20} text="← the part I care about" anchor="middle" accent size={11} font="sans" />
      <Label x={24} y={180} text="Rankings are computed deterministically in code. The model is constrained to phrasing them," size={11.5} font="sans" />
      <Label x={24} y={199} text="so a summary can never name the wrong winner." size={11.5} font="sans" />
      <Label x={24} y={218} text="correctness over fluency" accent size={11.5} font="sans" />
    </>
  ),
};

for (const mode of ["light", "dark"] as const) {
  const svg = renderStatic(figure, { theme: THEMES[mode], motion: true, frame: false, background: true, width: 860 });
  writeFileSync(`assets/stack-${mode}.svg`, svg);
  console.log(`assets/stack-${mode}.svg`, svg.length, "bytes");
}
