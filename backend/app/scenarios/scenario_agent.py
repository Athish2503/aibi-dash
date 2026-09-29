import re
from typing import Any, Optional
import pandas as pd
from pydantic import BaseModel, Field
from backend.app.scenarios.simulation_engine import ScenarioSimulationEngine, ScenarioSimulationResult


class ScenarioAgent:
    """
    Scenario / What-If Agent:
    Parses what-if natural language queries and runs deterministic elasticity simulations.
    Example: 'What happens if Meta spend increases 20%?'
    """

    def parse_and_simulate(self, df: pd.DataFrame, query: str) -> ScenarioSimulationResult:
        # Extract percentage change (default +20%)
        pct_match = re.search(r"([+-]?\d+(?:\.\d+)?)\s*%", query)
        spend_pct = float(pct_match.group(1)) if pct_match else 20.0
        if any(w in query.lower() for w in ("decrease", "cut", "reduce", "lower", "drop")) and spend_pct > 0:
            spend_pct = -spend_pct

        # Extract target channel
        channel = "Meta"
        for ch in ["Google Ads", "Meta", "YouTube", "LinkedIn", "TikTok", "Instagram"]:
            if ch.lower() in query.lower():
                channel = ch
                break

        return ScenarioSimulationEngine.simulate_spend_shift(
            df=df,
            channel=channel,
            spend_change_pct=spend_pct,
        )
