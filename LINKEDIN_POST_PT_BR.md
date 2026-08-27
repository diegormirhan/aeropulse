# Post para LinkedIn — AeroPulse

Acabei de concluir o **AeroPulse**, um projeto end-to-end de Machine Learning para manutenção preditiva de motores aeronáuticos.

A ideia foi sair do formato tradicional de notebook e construir um produto de dados completo: do download e validação dos dados até uma aplicação web moderna para investigar cada previsão.

O AeroPulse utiliza o dataset **NASA C-MAPSS FD001** para estimar a vida útil remanescente — Remaining Useful Life, ou RUL — de 100 motores turbofan ainda não vistos pelo modelo.

O sistema permite:

- priorizar a frota por risco de manutenção;
- acompanhar a previsão de RUL ao longo dos ciclos de operação;
- visualizar sensores físicos e sinais de degradação;
- analisar o intervalo de incerteza de cada estimativa;
- entender quais features mais influenciaram uma previsão específica;
- comparar o modelo selecionado com um baseline linear.

No conjunto oficial de teste, o modelo XGBoost com features temporais alcançou:

- **RMSE: 17,15 ciclos**
- **MAE: 12,49 ciclos**
- **NASA Score: 424,1**

Um ponto importante: o intervalo calibrado cobriu 82% dos resultados de teste, abaixo do alvo nominal de 90%. Preferi mostrar essa limitação na própria aplicação. Para mim, um bom projeto de ML não é apenas o que apresenta uma métrica forte — é o que deixa claro onde o modelo ainda pode falhar.

Stack utilizada:

**Python, pandas, scikit-learn, XGBoost, FastAPI, React, TypeScript, Vite, Recharts, pytest, Vitest e Docker.**

Também implementei separação de validação por motor para evitar leakage, checksums para os dados, testes de API e frontend, explicabilidade local e uma interface responsiva sem Streamlit.

Esse projeto reforçou algo que considero essencial em Data Science: o valor do modelo aparece quando conseguimos transformá-lo em uma decisão compreensível, rastreável e utilizável.

Código e documentação: [adicione aqui o link do repositório]

Demo em vídeo: [adicione aqui o link]

#MachineLearning #DataScience #ArtificialIntelligence #PredictiveMaintenance #MLOps #FastAPI #React #XGBoost #Portfolio #NASA
