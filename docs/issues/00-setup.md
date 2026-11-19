**Nível:** Básico  
**Validação automática:** `scripts/validate-module.sh 00` (o mesmo que o GitHub Actions roda no seu PR)

## Por que importa para avaliar agentes

Antes de medir, diga o que você espera ver. Hipóteses escritas evitam enxergar o que você queria no resultado.

## Leia antes

- docs/CONCEITOS.md (inteiro)
- README.md

## Tarefas

- [ ] Instalar Node 22+ e rodar `npm ci`
- [ ] Rodar `npm test` e ver os testes falhando (é o ponto de partida)
- [ ] Escrever `docs/HIPOTESES.md` com as seções `## H1`, `## H2`, `## H3` (25+ palavras cada): três hipóteses SUAS sobre o que faz um agente seguir specs, regras e escopo, e como você mediria cada uma
- [ ] Rodar `scripts/validate-module.sh 00`

## Arquivos

- `docs/HIPOTESES.md`

## Critério de pronto

- [ ] `scripts/validate-module.sh 00` termina com "✔ Módulo 00 concluído."
- [ ] Nenhum `todo('M00', ...)` restante
- [ ] PR aberto com `Closes #<número desta issue>` e check **Validar módulo** verde

## Desafio extra (opcional)

- Anote 2 situações reais em que um agente de código ignorou uma regra do seu projeto.

## Como entregar

```bash
git switch -c modulo/00-setup
npx vitest run tests/m00-*.test.ts   # um teste por vez, leia a falha inteira
scripts/validate-module.sh 00
git push -u origin modulo/00-setup
# abra o PR para a main com Closes #N
```

> Travou? `docs/FLUXO.md`. A solução completa está na branch `reference` (consulte só depois de tentar).
