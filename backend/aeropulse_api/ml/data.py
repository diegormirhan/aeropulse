from pathlib import Path

import pandas as pd

IDENTIFIER_COLUMNS = ["engine_id", "cycle"]
SETTING_COLUMNS = [f"setting_{index}" for index in range(1, 4)]
SENSOR_COLUMNS = [f"sensor_{index}" for index in range(1, 22)]
CMAPSS_COLUMNS = IDENTIFIER_COLUMNS + SETTING_COLUMNS + SENSOR_COLUMNS

SENSOR_METADATA = {
    "sensor_2": ("LPC outlet temperature", "°R"),
    "sensor_3": ("HPC outlet temperature", "°R"),
    "sensor_4": ("LPT outlet temperature", "°R"),
    "sensor_7": ("HPC outlet pressure", "psia"),
    "sensor_8": ("Physical fan speed", "rpm"),
    "sensor_9": ("Physical core speed", "rpm"),
    "sensor_11": ("HPC outlet static pressure", "psia"),
    "sensor_12": ("Fuel-flow pressure ratio", "pps/psi"),
    "sensor_13": ("Corrected fan speed", "rpm"),
    "sensor_14": ("Corrected core speed", "rpm"),
    "sensor_15": ("Bypass ratio", "—"),
    "sensor_17": ("Bleed enthalpy", "—"),
    "sensor_20": ("HPT coolant bleed", "lbm/s"),
    "sensor_21": ("LPT coolant bleed", "lbm/s"),
}


def read_trajectories(path: Path) -> pd.DataFrame:
    frame = pd.read_csv(path, sep=r"\s+", header=None, names=CMAPSS_COLUMNS)
    frame["engine_id"] = frame["engine_id"].astype(int)
    frame["cycle"] = frame["cycle"].astype(int)
    return frame


def read_rul_targets(path: Path) -> pd.Series:
    targets = pd.read_csv(path, sep=r"\s+", header=None, names=["rul"])["rul"]
    targets.index = targets.index + 1
    targets.index.name = "engine_id"
    return targets.astype(float)


def find_informative_sensors(frame: pd.DataFrame, minimum_variance: float = 1e-10) -> list[str]:
    available_sensors = [column for column in SENSOR_METADATA if column in frame]
    variances = frame[available_sensors].var()
    return [column for column in available_sensors if variances[column] > minimum_variance]
