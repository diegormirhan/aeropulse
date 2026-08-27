from pathlib import Path

from aeropulse_api.ml.training import train_project

PROJECT_ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    report = train_project(PROJECT_ROOT)
    selected_model = report["selected_model"]
    comparisons = report["comparisons"]
    selected_test = next(
        comparison["test"] for comparison in comparisons if comparison["name"] == selected_model
    )
    print(f"Selected model: {selected_model}")
    print(f"Test RMSE: {selected_test['rmse']}")
    print(f"Test MAE: {selected_test['mae']}")
    print(f"Artifacts written to {PROJECT_ROOT / 'artifacts'}")


if __name__ == "__main__":
    main()
