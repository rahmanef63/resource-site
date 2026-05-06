#!/usr/bin/env bash
# Per-feature inventory: frontend file presence + convex coverage + layout template
# Usage: bash scripts/features/inventory.sh [--md]
# Default mode prints human table to stdout. --md emits Markdown to stdout.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SLICES="$ROOT/frontend/slices"
CONVEX="$ROOT/convex/features"

MODE="${1:-human}"

# kebab → camelCase
to_camel() {
  echo "$1" | awk -F'-' '{
    out=$1
    for (i=2; i<=NF; i++) out = out toupper(substr($i,1,1)) substr($i,2)
    print out
  }'
}

# Detect layout template from views/*.tsx + page.tsx (recursive 3-deep).
# Priority order matches first match wins.
detect_layout() {
  local slug="$1"
  local dir="$SLICES/$slug"
  [ ! -d "$dir" ] && { echo "n/a"; return; }

  local has_left has_inspector has_wizard has_tabs has_shell has_page
  has_left=$(grep -rlE 'leftPanel\s*=' --include='*.tsx' --include='*.ts' "$dir" 2>/dev/null | head -1)
  has_inspector=$(grep -rlE 'inspector\s*=' --include='*.tsx' --include='*.ts' "$dir" 2>/dev/null | head -1)
  has_wizard=$(grep -rlE '<Wizard|StepIndicator|currentStep' --include='*.tsx' --include='*.ts' "$dir" 2>/dev/null | head -1)
  has_tabs=$(grep -rlE '<Tabs[^a-zA-Z]|<TabsList|<TabsContent' --include='*.tsx' --include='*.ts' "$dir" 2>/dev/null | head -1)
  has_shell=$(grep -rlE 'FeatureShell' --include='*.tsx' --include='*.ts' "$dir" 2>/dev/null | head -1)
  has_page=$(grep -rlE 'PageContainer|<main\b' --include='*.tsx' --include='*.ts' "$dir" 2>/dev/null | head -1)

  if   [ -n "$has_left" ] && [ -n "$has_inspector" ]; then echo "3-col (left+main+inspector)"
  elif [ -n "$has_left" ];                             then echo "2-col (left+main)"
  elif [ -n "$has_inspector" ];                        then echo "2-col (main+inspector)"
  elif [ -n "$has_wizard" ];                           then echo "wizard"
  elif [ -n "$has_tabs" ];                             then echo "tabs"
  elif [ -n "$has_shell" ];                            then echo "1-col (FeatureShell)"
  elif [ -n "$has_page" ];                             then echo "1-col (custom shell)"
  else                                                      echo "scaffold/placeholder"
  fi
}

# Check presence of file in slice dir
has_file() {
  [ -e "$SLICES/$1/$2" ] && echo "✓" || echo "·"
}

# Check presence in convex dir
has_convex_file() {
  local cdir="$1"; local f="$2"
  [ -e "$CONVEX/$cdir/$f" ] && echo "✓" || echo "·"
}

# Detect preview quality: A (imports real ../components|views) | B (bespoke shadow LOC>60) | C (stub LOC<=60) | M (missing)
detect_preview_grade() {
  local slug="$1"
  local f
  for ext in tsx ts; do
    if [ -f "$SLICES/$slug/features-preview/index.$ext" ]; then f="$SLICES/$slug/features-preview/index.$ext"; break; fi
  done
  [ -z "$f" ] && { echo "M"; return; }
  local imports loc
  imports=$({ grep -cE "from\s+['\"]\.\./(components|views|hooks|page)" "$f" 2>/dev/null; true; } | head -1)
  loc=$({ wc -l < "$f" 2>/dev/null; true; } | head -1)
  imports=${imports:-0}
  loc=${loc:-0}
  if [ "$imports" -ge 1 ] 2>/dev/null; then echo "A"
  elif [ "$loc" -gt 60 ] 2>/dev/null; then echo "B"
  else echo "C"
  fi
}

# Count exports of given type in convex dir (recursive 2-deep)
count_convex_exports() {
  local cdir="$1"; local kind="$2"  # query|mutation|action|internalMutation|internalQuery|internalAction
  local d="$CONVEX/$cdir"
  [ ! -d "$d" ] && { echo 0; return; }
  local n
  n=$(grep -rhE "export\s+const\s+\w+\s*=\s*${kind}\(" "$d" 2>/dev/null | wc -l | tr -d ' ')
  echo "${n:-0}"
}

# Header
print_header() {
  if [ "$MODE" = "--md" ]; then
    cat <<EOF
| # | Slice | Convex | Layout | Prev | F:cfg | F:init | F:page | F:agent | F:settings | F:preview | F:views | F:components | F:hooks | C:dir | C:schema | C:queries | C:mutations | C:agents | Q | M | A |
|---|-------|--------|--------|------|------|------|------|------|------|------|------|------|------|------|------|------|------|------|------|------|------|
EOF
  else
    printf "%-3s %-26s %-12s %-32s %-5s %-7s %-6s %-6s %-6s %-8s %-6s %-6s %-12s %-7s %-6s %-7s %-8s %-9s %-6s %3s %3s %3s\n" \
      "#" "slice" "convex" "layout" "prev" "cfg" "init" "page" "agent" "settings" "prev" "views" "components" "hooks" "dir" "schema" "queries" "mutations" "agents" "Q" "M" "A"
    printf '%.0s-' {1..230}; echo
  fi
}

print_header

i=0
total_q=0; total_m=0; total_a=0
miss_convex=()
no_views=()
scaffold=()

for slug_path in "$SLICES"/*/; do
  slug=$(basename "$slug_path")
  case "$slug" in _*|*.tsx|*.ts) continue ;; esac
  i=$((i+1))

  cdir=$(to_camel "$slug")
  # Check convex dir presence (try camelCase, then exact slug, then kebab fallback)
  convex_status="✗"
  convex_actual=""
  if [ -d "$CONVEX/$cdir" ]; then
    convex_status="✓"; convex_actual="$cdir"
  elif [ -d "$CONVEX/$slug" ]; then
    convex_status="✓"; convex_actual="$slug"
  fi

  layout=$(detect_layout "$slug")
  prev_grade=$(detect_preview_grade "$slug")

  cfg=$(has_file "$slug" "config.ts")
  init=$(has_file "$slug" "init.ts")
  page=$(has_file "$slug" "page.tsx")
  agent=$([ -d "$SLICES/$slug/agent" ] || [ -d "$SLICES/$slug/agents" ] && echo "✓" || echo "·")
  settings=$([ -d "$SLICES/$slug/settings" ] && echo "✓" || echo "·")
  preview=$([ -d "$SLICES/$slug/features-preview" ] && echo "✓" || echo "·")
  views=$([ -d "$SLICES/$slug/views" ] && echo "✓" || echo "·")
  comps=$([ -d "$SLICES/$slug/components" ] && echo "✓" || echo "·")
  hooks=$([ -d "$SLICES/$slug/hooks" ] && echo "✓" || echo "·")

  if [ -n "$convex_actual" ]; then
    schema=$(has_convex_file "$convex_actual" "schema.ts")
    queries=$(has_convex_file "$convex_actual" "queries.ts")
    muts=$(has_convex_file "$convex_actual" "mutations.ts")
    agents_dir=$([ -d "$CONVEX/$convex_actual/agents" ] && echo "✓" || echo "·")
    nq=$(count_convex_exports "$convex_actual" "query")
    nq2=$(count_convex_exports "$convex_actual" "internalQuery")
    nm=$(count_convex_exports "$convex_actual" "mutation")
    nm2=$(count_convex_exports "$convex_actual" "internalMutation")
    na=$(count_convex_exports "$convex_actual" "action")
    na2=$(count_convex_exports "$convex_actual" "internalAction")
    nq=$((nq + nq2)); nm=$((nm + nm2)); na=$((na + na2))
  else
    schema="-"; queries="-"; muts="-"; agents_dir="-"; nq=0; nm=0; na=0
    miss_convex+=("$slug")
  fi

  total_q=$((total_q + nq))
  total_m=$((total_m + nm))
  total_a=$((total_a + na))

  [ "$views" = "·" ] && no_views+=("$slug")
  [ "$layout" = "scaffold/placeholder" ] && scaffold+=("$slug")

  if [ "$MODE" = "--md" ]; then
    printf "| %d | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %s | %d | %d | %d |\n" \
      "$i" "$slug" "$convex_status" "$layout" "$prev_grade" \
      "$cfg" "$init" "$page" "$agent" "$settings" "$preview" "$views" "$comps" "$hooks" \
      "$convex_status" "$schema" "$queries" "$muts" "$agents_dir" "$nq" "$nm" "$na"
  else
    printf "%-3d %-26s %-12s %-32s %-5s %-7s %-6s %-6s %-6s %-8s %-6s %-6s %-12s %-7s %-6s %-7s %-8s %-9s %-6s %3d %3d %3d\n" \
      "$i" "$slug" "$convex_status" "$layout" "$prev_grade" \
      "$cfg" "$init" "$page" "$agent" "$settings" "$preview" "$views" "$comps" "$hooks" \
      "$convex_status" "$schema" "$queries" "$muts" "$agents_dir" "$nq" "$nm" "$na"
  fi
done

if [ "$MODE" = "--md" ]; then
  echo ""
  echo "## Totals"
  echo ""
  echo "- Slices scanned: **$i**"
  echo "- Total Convex queries (incl. internal): **$total_q**"
  echo "- Total Convex mutations (incl. internal): **$total_m**"
  echo "- Total Convex actions (incl. internal): **$total_a**"
  echo ""
  if [ ${#miss_convex[@]} -gt 0 ]; then
    echo "## Slices with no Convex backend (${#miss_convex[@]})"
    echo ""
    for s in "${miss_convex[@]}"; do echo "- \`$s\`"; done
    echo ""
  fi
  if [ ${#no_views[@]} -gt 0 ]; then
    echo "## Slices missing \`views/\` dir (${#no_views[@]})"
    echo ""
    for s in "${no_views[@]}"; do echo "- \`$s\`"; done
    echo ""
  fi
  if [ ${#scaffold[@]} -gt 0 ]; then
    echo "## Slices still on scaffold/placeholder UI (${#scaffold[@]})"
    echo ""
    for s in "${scaffold[@]}"; do echo "- \`$s\`"; done
    echo ""
  fi
else
  echo ""
  echo "Totals: $i slices | Q=$total_q M=$total_m A=$total_a"
  echo "No-convex: ${#miss_convex[@]} | No-views: ${#no_views[@]} | Scaffold: ${#scaffold[@]}"
fi
