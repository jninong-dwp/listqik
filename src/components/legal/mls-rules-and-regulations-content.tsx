import { readFileSync } from "node:fs";
import path from "node:path";

const fullRulesText = readFileSync(
  path.join(process.cwd(), "src/data/legal/mls-rules-and-regulations.txt"),
  "utf8",
);

export function MlsRulesAndRegulationsContent() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-white/85">
      <p className="text-muted">
        Full extracted text from the source PDF: Texas REALTORS Multiple Listing Service Rules and
        Regulations, as amended by Texas REALTORS Executive Board on 02/14/22.
      </p>
      <pre className="overflow-x-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/25 p-4 font-mono text-xs leading-6 text-white/85">
        {fullRulesText}
      </pre>
    </div>
  );
}
