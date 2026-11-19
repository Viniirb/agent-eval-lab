**Nível:** Básico  
**Validação automática:** `scripts/validate-module.sh 01` (o mesmo que o GitHub Actions roda no seu PR)

## Por que importa para avaliar agentes

Sem requisitos numerados e classificados você não consegue dizer QUAL parte o agente falhou. IDs viram alvos de teste.

## Leia antes

- docs/CONCEITOS.md seção 2
- tasks/001-rate-limiter/SPEC.md (formato real)

## Tarefas

- [ ] `parseSpec`: ler `- **R1 [MUST]** texto` (aceita `-` e `*`, ids com vários dígitos, linhas de continuação indentadas)
- [ ] `weightOf`: MUST 3, SHOULD 2, MAY 1
- [ ] `validateSpec`: ids duplicados, texto vazio e ausência de MUST (devolva TODOS os problemas)

## Arquivos

- `src/spec/spec.ts`

## Critério de pronto

- [ ] `scripts/validate-module.sh 01` termina com "✔ Módulo 01 concluído."
- [ ] Nenhum `todo('M01', ...)` restante
- [ ] PR aberto com `Closes #<número desta issue>` e check **Validar módulo** verde

## Desafio extra (opcional)

- Aceite também `**R1 [MUST]**` sem o marcador de lista e explique por que NÃO fez isso (ambiguidade).

## Como entregar

```bash
git switch -c modulo/01-specs
npx vitest run tests/m01-*.test.ts   # um teste por vez, leia a falha inteira
scripts/validate-module.sh 01
git push -u origin modulo/01-specs
# abra o PR para a main com Closes #N
```

> Travou? `docs/FLUXO.md`. A solução completa está na branch `reference` (consulte só depois de tentar).
