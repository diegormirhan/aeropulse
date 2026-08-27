# Roteiro curto para vídeo — AeroPulse

## Duração sugerida: 2–3 minutos

### 1. Abertura — 15 segundos

“Este é o AeroPulse, um sistema de manutenção preditiva que estima a vida útil remanescente de motores turbofan usando o dataset NASA C-MAPSS.”

Mostre a tela **Fleet Command** e destaque que o projeto roda localmente, sem Streamlit e sem APIs externas.

### 2. Visão da frota — 35 segundos

“A primeira tela transforma as previsões em uma decisão operacional. Os 100 motores de teste são classificados por urgência, e o motor com menor vida prevista aparece em destaque.”

Mostre:

- os totais de motores críticos, em observação e estáveis;
- a previsão de 3 ciclos para o ENG-081;
- o intervalo de incerteza;
- o MAE medido no teste;
- os filtros da tabela.

### 3. Perfil do motor — 50 segundos

Clique em **Inspect ENG-081**.

“No perfil do motor eu consigo reproduzir o histórico ciclo a ciclo. O gráfico mostra como a previsão de RUL cai ao longo da operação, junto com o intervalo calibrado.”

Mova o slider e alterne entre sensores.

“Também apresento as contribuições locais do XGBoost. Elas mostram quais features aumentaram ou reduziram a estimativa, sem tratar correlação do modelo como causalidade física.”

### 4. Laboratório do modelo — 40 segundos

Abra **Model Lab**.

“Aqui ficam as evidências do modelo: comparação com o baseline Ridge, métricas de validação e teste, importância global das features e as limitações do sistema.”

Destaque:

- Test RMSE de 17,15;
- Test MAE de 12,49;
- NASA Score de 424,1;
- cobertura de intervalo de 82%.

### 5. Arquitetura e encerramento — 25 segundos

“O projeto inclui ingestão reproduzível dos dados oficiais da NASA, validação por checksum, separação por motor para evitar leakage, FastAPI, React com TypeScript, testes automatizados e Docker.”

“O AeroPulse não é um sistema certificado para aviação. É um projeto de portfólio que demonstra como levar um modelo de Machine Learning do dataset até uma aplicação explicável e utilizável.”

Encerre mostrando o README e o repositório.
