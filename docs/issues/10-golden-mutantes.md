**Nível:** Avançado  
**Validação automática:** `scripts/validate-module.sh 10` (o mesmo que o GitHub Actions roda no seu PR)

## Por que importa para avaliar agentes

Quem testa os testes? Se um mutante tira nota alta, seu benchmark deixa passar erros: ele mede mal.

## Leia antes

- docs/CONCEITOS.md seção 5
- tasks/001-rate-limiter/mutants/

## Tarefas

- [ ] `validateBenchmark`: golden >= 95 e todo mutante < 95, com os nomes dos culpados; exige mutantes
- [ ] `detectFlaky`: espalhamento maior que a tolerância
- [ ] `validateTask`: avaliar golden e cada mutante com um `evaluate` injetado

## Arquivos

- `src/validation/golden.ts`

## Critério de pronto

- [ ] `scripts/validate-module.sh 10` termina com "✔ Módulo 10 concluído."
- [ ] Nenhum `todo('M10', ...)` restante
- [ ] PR aberto com `Closes #<número desta issue>` e check **Validar módulo** verde

## Desafio extra (opcional)

- Crie um quarto mutante para a tarefa 001 que o benchmark NÃO pega e melhore os testes de aceitação (em arquivos seus, sem editar os existentes) até pegar.

## Como entregar

```bash
git switch -c modulo/10-golden-mutantes
npx vitest run tests/m10-*.test.ts   # um teste por vez, leia a falha inteira
scripts/validate-module.sh 10
git push -u origin modulo/10-golden-mutantes
# abra o PR para a main com Closes #N
```

> Travou? `docs/FLUXO.md`. A solução completa está na branch `reference` (consulte só depois de tentar).
