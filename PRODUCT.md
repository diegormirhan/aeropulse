# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Delegated by the user: React and TypeScript with Vite for the web client, FastAPI for the API, and Python ML tooling for local training and inference. The application must not use Streamlit.

## Users

Primary users are technical recruiters, machine-learning engineers, and data-science interviewers evaluating an end-to-end portfolio project. The operating persona inside the product is a reliability engineer who needs to identify engines at risk and inspect the evidence behind a maintenance priority.

## Product Purpose

AeroPulse turns multivariate turbofan sensor histories into remaining-useful-life estimates, risk bands, and a transparent fleet maintenance queue. Success means a viewer can understand the prediction target, inspect one engine's degradation, and evaluate the model's evidence without opening a notebook.

## Positioning

The product connects fleet-level triage, cycle-by-cycle degradation playback, uncertainty-aware RUL estimation, and model evaluation in one local application. It presents prognostics as an auditable operational workflow rather than a static model demo.

## Operating Context

The application runs locally from the repository. It ships with processed demonstration data derived from the public NASA C-MAPSS dataset, trained model artifacts, a reproducible training pipeline, a FastAPI service, and a responsive browser interface suitable for a recorded portfolio walkthrough.

## Capabilities and Constraints

- Predict remaining useful life for engines in the C-MAPSS test fleet.
- Rank engines by maintenance urgency using deterministic risk bands.
- Replay sensor history and prediction changes across cycles.
- Compare model performance against an explicit baseline.
- Explain predictions with feature contributions and disclose uncertainty and limitations.
- Keep all inference local and require no paid API or cloud service.
- Clearly label C-MAPSS as high-fidelity simulated data, not live commercial aircraft telemetry.
- Do not fabricate operational, safety, commercial, or deployment claims.

## Brand Commitments

The product name is AeroPulse. The product voice is concise, technical, calm, and evidence-led. It avoids aviation theatrics, alarmist language, and claims that the model is suitable for real-world flight-safety decisions.

## Evidence on Hand

- NASA C-MAPSS provides multivariate run-to-failure trajectories, operational settings, sensor noise, and official remaining-useful-life targets.
- The project will produce its own measured validation and test metrics during training.
- There are no customers, production deployments, testimonials, or real aircraft integrations; the interface and documentation must not imply otherwise.

## Product Principles

1. Show the evidence behind every maintenance priority.
2. Separate measured model output from deterministic business rules.
3. Prefer honest uncertainty and baselines over impressive-looking claims.
4. Make the primary operational task legible within one viewport.
5. Keep the entire demonstration reproducible and local.

## Accessibility & Inclusion

The web interface should target WCAG 2.2 AA, support keyboard navigation and visible focus, avoid color-only status communication, respect reduced-motion preferences, and remain usable at mobile and desktop widths.
