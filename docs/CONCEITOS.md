# Conceitos: como medir um agente de código

## 1. O que significa "fez a tarefa corretamente"

Quatro perguntas independentes. Misturá-las esconde o problema.

| Pergunta | Evidência | Peso padrão |
|----------|-----------|-------------|
| Entregou o que foi pedido? | Testes de aceitação ligados a requisitos (`[R1]`) | 60% |
| Seguiu as regras e padrões do projeto? | Verificadores estáticos de `RULES.md` | 20% |
| Ficou dentro do escopo? | Diff dos arquivos: permitidos, protegidos, quantidade | 10% |
| O código é saudável? | Typecheck sem erros | 10% |

Pesos são **decisão sua**: mude e observe como o ranking dos agentes muda.

## 2. Spec que dá para medir

- **IDs estáveis** (`R1`, `R2`): cada requisito vira uma linha de checklist e um alvo de teste.
- **MUST / SHOULD / MAY** (RFC 2119): o que é obrigatório, desejável, opcional. Falhar um MUST pesa mais.
- **Comportamento observável**, não implementação: "retorna `allowed: false`", não "usa um Map".
- **Casos de borda explícitos**: o agente não adivinha o que a spec não diz.

## 3. Regras e padrões como dados

Convenções em prosa ("seja limpo") não são verificáveis. Converta o que for possível em regras de máquina:

| Tipo | Exemplo | Verificação |
|------|---------|-------------|
| `forbidden-pattern` | proibir `console.log` e `any` em `src/**` | regex por linha |
| `required-file` | `README.md` obrigatório | existência |
| `import-boundary` | o domínio não importa `node:*` | análise de imports |

O que não dá para checar com regra (nomes bons, arquitetura) vira revisão humana ou um juiz de LLM: mais caro e mais ruidoso.
Arquivos de contexto como `AGENTS.md` / `CLAUDE.md` dizem ao agente as regras; o harness mede se ele as cumpriu.

## 4. Testes de aceitação: a régua

- **Ficam fora do alcance do agente** (protegidos). Se ele os edita, a nota é limitada.
- **Marcados por requisito**: `it('[R3] keys are independent', ...)`. Requisito sem teste não pode ser avaliado.
- **Determinísticos**: relógio injetado, sem rede, sem aleatoriedade. Teste instável gera nota instável.

## 5. Quem testa os testes? (golden e mutantes)

- **Golden**: uma solução correta conhecida. Deve tirar ~100.
- **Mutantes**: a solução golden com UM bug cada. Todos devem ficar abaixo da zona golden; se um mutante tira nota alta,
  os testes não pegam aquele erro e o benchmark está **fraco**.
- Rode a mesma entrada várias vezes: se a nota varia, o benchmark é **instável** (flaky).

## 6. Escopo e trapaça

Agentes otimizam o que é medido. Se a régua pode ser contornada, ela será (às vezes sem "má intenção"):
editar os testes, `it.skip`, `process.exit(0)`, `@ts-ignore`, ler variáveis de ambiente, chamar a rede.
Defesas: arquivos **protegidos**, **tetos** de nota, **varredura** de padrões suspeitos, sandbox sem segredos.
Texto de tarefa também é entrada não confiável: instruções escondidas ("ignore as instruções anteriores") podem atacar o agente.

## 7. Experimentos: uma rodada não prova nada

Agentes são estocásticos. Para comparar duas condições (com e sem arquivo de regras, prompt A vs B, agente X vs Y):

1. Mude **uma** variável por vez.
2. Rode **3 ou mais** vezes por condição, nas **mesmas** tarefas.
3. Compare médias **e** variação (tamanho do efeito, Cohen's d). Diferença pequena perto do ruído é **inconclusiva**.
4. Guarde os resultados (`results/runs.json`) e a configuração exata do agente.

## 8. Portão de regressão

Depois de ter uma linha de base, o CI pode barrar mudanças que pioram o resultado: média abaixo do mínimo, queda grande
versus a base, tarefa individual regredindo. Rodar agentes reais custa dinheiro: dispare **manualmente** e nunca em PR de fork
(segredos!).

## 9. Limites honestos

- Poucas tarefas = pouca confiança. Prefira 5+ tarefas variadas antes de concluir qualquer coisa.
- Nota alta em tarefa pequena não prova qualidade em projeto grande.
- Os testes medem o que você pensou em testar. Revise as falhas à mão de vez em quando.
