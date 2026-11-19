**Nível:** Avançado  
**Validação automática:** `scripts/validate-module.sh 12` (o mesmo que o GitHub Actions roda no seu PR)

## Por que importa para avaliar agentes

Uma rodada não prova nada. Estatística simples separa melhora real de sorte.

## Leia antes

- docs/CONCEITOS.md seção 7

## Tarefas

- [ ] `summarize`: n, média, desvio padrão amostral (n-1), mín e máx
- [ ] `compareConditions`: delta, d de Cohen com desvio combinado e veredito (`better`/`worse`/`inconclusive`)
- [ ] Casos de borda: menos de 3 rodadas, variação zero

## Arquivos

- `src/stats/experiment.ts`

## Critério de pronto

- [ ] `scripts/validate-module.sh 12` termina com "✔ Módulo 12 concluído."
- [ ] Nenhum `todo('M12', ...)` restante
- [ ] PR aberto com `Closes #<número desta issue>` e check **Validar módulo** verde

## Desafio extra (opcional)

- Escreva em 5 linhas quantas rodadas você precisaria para detectar uma melhora de 5 pontos com desvio de 10.

## Como entregar

```bash
git switch -c modulo/12-experimentos
npx vitest run tests/m12-*.test.ts   # um teste por vez, leia a falha inteira
scripts/validate-module.sh 12
git push -u origin modulo/12-experimentos
# abra o PR para a main com Closes #N
```

> Travou? `docs/FLUXO.md`. A solução completa está na branch `reference` (consulte só depois de tentar).
