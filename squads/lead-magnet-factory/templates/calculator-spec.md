# Template: Especificação de Calculadora

## Informações Gerais

```yaml
nome: "[Nome da Calculadora]"
versao: "1.0"
tempo_estimado: "[X] minutos"
total_inputs: [N]
output_principal: "[Métrica]"
```

---

## Inputs

### Input 1: [Nome]

```yaml
id: "input-1"
label: "[Label visível]"
tipo: "numero" | "selecao" | "range"
unidade: "R$" | "%" | "pessoas" | "meses"
placeholder: "[Texto de exemplo]"
default: [valor]
validacao:
  min: [valor]
  max: [valor]
  required: true
helper_text: "[Texto de ajuda]"
por_que: "[Por que este dado é necessário]"
```

### Input 2: [Nome]

```yaml
id: "input-2"
label: "[Label]"
tipo: "selecao"
opcoes:
  - valor: "a"
    label: "[Opção A]"
    multiplicador: 1.0
  - valor: "b"
    label: "[Opção B]"
    multiplicador: 0.8
  - valor: "c"
    label: "[Opção C]"
    multiplicador: 0.6
default: "a"
helper_text: "[...]"
```

### Input 3: [Nome]

```yaml
id: "input-3"
label: "[Label]"
tipo: "range"
min: 0
max: 100
step: 5
default: 50
unit_label: "%"
helper_text: "[...]"
```

---

## Premissas

| ID | Nome | Valor | Fonte/Justificativa |
|----|------|-------|---------------------|
| P1 | [Nome] | [valor] | [fonte] |
| P2 | [Nome] | [valor] | [fonte] |
| P3 | [Nome] | [valor] | [fonte] |

**Nota:** Premissas são conservadoras para evitar resultados irrealistas.

---

## Fórmulas

### Cálculo Intermediário 1

```
var1 = input1 * P1
```

**Descrição:** [O que este cálculo representa]

### Cálculo Intermediário 2

```
var2 = input2_multiplicador * input3 / 100
```

### Resultado Principal

```
resultado_principal = var1 * var2
```

**Unidade:** R$/mês

### Resultados Secundários

```
resultado_anual = resultado_principal * 12
gap = resultado_principal - input_faturamento_atual
roi = (resultado_principal - input_investimento) / input_investimento * 100
```

---

## Outputs

### Tela de Resultado

```
┌────────────────────────────────────────────────────┐
│                                                    │
│          [TÍTULO DO RESULTADO PRINCIPAL]           │
│                                                    │
│              R$ [VALOR FORMATADO]                  │
│                  por mês                           │
│                                                    │
│   ┌──────────────────────────────────────────┐    │
│   │     ATUAL          POTENCIAL             │    │
│   │   R$ XXk             R$ YYYk             │    │
│   │   ████               ████████████        │    │
│   └──────────────────────────────────────────┘    │
│                                                    │
│   Você pode estar deixando R$ [GAP] na mesa        │
│                                                    │
│          [ CTA: DESCOBRIR COMO CHEGAR ]            │
│                                                    │
└────────────────────────────────────────────────────┘
```

### Resultados Secundários

| Métrica | Valor | Contexto |
|---------|-------|----------|
| [Nome] | [fórmula] | [explicação] |
| [Nome] | [fórmula] | [explicação] |

---

## Narrativas por Faixa

### Faixa 1: R$ 0 - 50k

```yaml
headline: "[Mensagem para este range]"
mensagem: "[Explicação]"
cta_texto: "[Texto do botão]"
cta_link: "[URL]"
```

### Faixa 2: R$ 50k - 150k

```yaml
headline: "[...]"
mensagem: "[...]"
cta_texto: "[...]"
cta_link: "[...]"
```

### Faixa 3: R$ 150k+

```yaml
headline: "[...]"
mensagem: "[...]"
cta_texto: "[...]"
cta_link: "[...]"
```

---

## Validações

### Inputs
- [ ] Todos os campos obrigatórios preenchidos
- [ ] Valores dentro dos ranges permitidos
- [ ] Formatos corretos (números onde esperado)

### Cálculos
- [ ] Nenhuma divisão por zero
- [ ] Resultados positivos (ou tratamento de negativos)
- [ ] Arredondamento apropriado

---

## Specs para Dev

### Tecnologia Sugerida
- React component
- State management local
- Formatação de moeda: Intl.NumberFormat('pt-BR')

### Responsividade
- Mobile-first
- Inputs empilhados em mobile
- Gráfico adaptativo

### Analytics
- Evento: calculator_started
- Evento: calculator_completed
- Propriedade: resultado_valor
- Propriedade: faixa_resultado
