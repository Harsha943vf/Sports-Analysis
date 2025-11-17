# train_models.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
import xgboost as xgb
import joblib
import os

# Load datasets
processed_data_path = 'datasets/processed'
batting_stats = pd.read_csv(os.path.join(processed_data_path, 'batting_stats.csv'))
bowling_stats = pd.read_csv(os.path.join(processed_data_path, 'bowling_stats.csv'))

# Merge stats with explicit column renaming to avoid conflicts
merged_stats = pd.merge(
    batting_stats.rename(columns={'runs': 'runs_bat', 'average': 'average_bat', 'strike_rate': 'strike_rate_bat'}),
    bowling_stats.rename(columns={'wickets': 'wickets_bowl', 'economy': 'economy_bowl'}),
    on=['player_name', 'team'],
    how='outer',
    suffixes=('_bat', '_bowl')
)

# Fill NaN values and create combined columns
merged_stats['runs'] = merged_stats['runs_bat'].fillna(0)
merged_stats['wickets'] = merged_stats['wickets_bowl'].fillna(0)
merged_stats['average_bat'] = merged_stats['average_bat'].fillna(0)
merged_stats['economy_bowl'] = merged_stats['economy_bowl'].fillna(0)
merged_stats['strike_rate_bat'] = merged_stats['strike_rate_bat'].fillna(0)

# Prepare features and targets
def prepare_data():
    # Match prediction features (team-level)
    team_stats = batting_stats.groupby('team').mean(numeric_only=True).reset_index()
    X_match = team_stats[['runs', 'average']]
    # Dummy target: 1 if runs > 500, 0 otherwise
    y_match = [1 if r > 500 else 0 for r in team_stats['runs']]
    
    # Player prediction features (individual-level)
    X_player = merged_stats[['runs', 'wickets', 'average_bat', 'economy_bowl', 'strike_rate_bat']].fillna(0)
    # Dummy target: combined performance score
    y_player = [r + w for r, w in zip(merged_stats['runs'].fillna(0), merged_stats['wickets'].fillna(0))]
    
    return X_match, y_match, X_player, y_player

# Train basic RandomForestClassifier models
def train_basic_models():
    X_match, y_match, X_player, y_player = prepare_data()
    
    match_model = RandomForestClassifier(n_estimators=100, random_state=42)
    match_model.fit(X_match, y_match)
    joblib.dump(match_model, 'models/match_prediction_model.joblib')
    print("Saved match prediction model")
    
    player_model = RandomForestClassifier(n_estimators=100, random_state=42)
    player_model.fit(X_player, y_player)
    joblib.dump(player_model, 'models/player_prediction_model.joblib')
    print("Saved player prediction model")

if __name__ == '__main__':
    if not os.path.exists('models'):
        os.makedirs('models')
    print("Training models...")
    train_basic_models()