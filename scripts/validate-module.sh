#!/usr/bin/env bash
# Valida UM módulo: roda os testes dele e confere que não sobrou todo('MNN', ...) no código.
# Uso: scripts/validate-module.sh 03
# É o mesmo comando do GitHub Actions (.github/workflows/modules.yml).
set -euo pipefail
cd "$(dirname "$0")/.."

module="${1:?uso: scripts/validate-module.sh NN (00 a 16)}"

case "$module" in
  00) tests=(tests/m00-setup.test.ts) ;;
  01) tests=(tests/m01-spec.test.ts) ;;
  02) tests=(tests/m02-rules.test.ts) ;;
  03) tests=(tests/m03-coverage.test.ts) ;;
  04) tests=(tests/m04-glob-check.test.ts) ;;
  05) tests=(tests/m05-scope.test.ts) ;;
  06) tests=(tests/m06-score.test.ts) ;;
  07) tests=(tests/m07-sandbox.test.ts) ;;
  08) tests=(tests/m08-adapters.test.ts) ;;
  09) tests=(tests/m09-report.test.ts) ;;
  10) tests=(tests/m10-golden.test.ts) ;;
  11) tests=(tests/m11-tasks.test.ts) ;;
  12) tests=(tests/m12-experiment.test.ts) ;;
  13) tests=(tests/m13-gate.test.ts) ;;
  14) tests=(tests/m14-safety.test.ts) ;;
  15) tests=(tests/m15-pipeline.test.ts) ;;
  16) tests=() ;; # todos os testes + relatório (abaixo)
  *) echo "módulo desconhecido: $module (use 00 a 16)" >&2; exit 2 ;;
esac

echo "▶ Módulo $module"
npm run --silent typecheck
if [ "$module" = "16" ]; then
  npx vitest run
else
  npx vitest run "${tests[@]}"
fi

# Gate extra: o módulo só vale se ninguém deixou todo('MNN', ...) no lugar. O módulo 16 exige ZERO em todo o projeto.
if [ "$module" = "16" ]; then pattern="todo\\('M[0-9][0-9]'"; else pattern="todo\\('M$module'"; fi
if grep -rnE "$pattern" --include='*.ts' src; then
  echo "✘ Módulo $module: ainda há todo('M…') nos arquivos acima. Implemente-os." >&2
  exit 1
fi

if [ "$module" = "16" ]; then
  words=$( [ -f docs/FINDINGS.md ] && wc -w < docs/FINDINGS.md || echo 0 )
  if [ "$words" -lt 300 ]; then
    echo "✘ Módulo 16: escreva docs/FINDINGS.md (300+ palavras; você tem $words)." >&2
    exit 1
  fi
fi

echo "✔ Módulo $module concluído."
