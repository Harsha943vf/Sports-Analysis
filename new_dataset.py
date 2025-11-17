import pandas as pd
import numpy as np
from datetime import datetime

# Load the datasets
matches_df = pd.read_csv('datasets/processed/matches.csv')
deliveries_df = pd.read_csv('datasets/processed/deliveries.csv')

# Convert date column to datetime and filter for 2023 matches
matches_df['date'] = pd.to_datetime(matches_df['date'], format='%d-%m-%Y')
matches_2023 = matches_df[matches_df['date'].dt.year == 2023]

# Create the base merged dataset
new_dataset = deliveries_df.merge(
    matches_2023,  # Using filtered 2023 matches
    left_on='match_id',
    right_on='id',
    how='left'
)

# Calculate boundaries
new_dataset['is_six'] = (new_dataset['batsman_runs'] == 6).astype(int)
new_dataset['is_four'] = (new_dataset['batsman_runs'] == 4).astype(int)

# Calculate dismissal types
new_dataset['is_stumping'] = (new_dataset['dismissal_kind'] == 'stumped').astype(int)
new_dataset['is_runout'] = (new_dataset['dismissal_kind'] == 'run out').astype(int)

# Group by match and bowler to calculate bowling figures
bowling_figures = new_dataset.groupby(['match_id', 'bowler']).agg({
    'player_dismissed': lambda x: sum(x.notna()),  # wickets
    'total_runs': 'sum'  # runs conceded
}).reset_index()

# Format best figures as 'wickets/runs'
bowling_figures['figures'] = bowling_figures['player_dismissed'].astype(str) + '/' + bowling_figures['total_runs'].astype(str)

# Get best figures for each bowler (most wickets, then least runs)
best_figures = bowling_figures.sort_values(['player_dismissed', 'total_runs'], ascending=[False, True]).groupby('bowler').first()

# Calculate player statistics
player_stats = new_dataset.groupby(['batsman']).agg({
    'batsman_runs': 'sum',
    'is_six': 'sum',
    'is_four': 'sum',
    'match_id': 'nunique'
}).reset_index()

bowler_stats = new_dataset.groupby(['bowler']).agg({
    'player_dismissed': lambda x: sum(x.notna()),  # total wickets
    'total_runs': 'sum',  # runs conceded
    'match_id': 'nunique'
}).reset_index()

fielding_stats = new_dataset.groupby(['fielder']).agg({
    'is_stumping': 'sum',
    'is_runout': 'sum'
}).reset_index()

# Merge all stats
player_stats = player_stats.merge(bowler_stats, left_on='batsman', right_on='bowler', how='outer')
player_stats = player_stats.merge(fielding_stats, left_on='batsman', right_on='fielder', how='outer')
player_stats = player_stats.merge(best_figures[['figures']], left_on='batsman', right_index=True, how='left')

# Clean up the merged data
player_stats['batsman'] = player_stats['batsman'].fillna(player_stats['bowler']).fillna(player_stats['fielder'])
player_stats = player_stats.drop(['bowler', 'fielder'], axis=1)
player_stats = player_stats.fillna(0)

# Filter significant fielding contributions
player_stats['significant_fielding'] = (player_stats['is_stumping'] > 1) | (player_stats['is_runout'] > 0)

# Format the final dataset
final_stats = pd.DataFrame({
    'player_name': player_stats['batsman'],
    'matches': player_stats['match_id_x'].fillna(player_stats['match_id_y']),
    'runs': player_stats['batsman_runs'],
    'sixes': player_stats['is_six'],
    'fours': player_stats['is_four'],
    'wickets': player_stats['player_dismissed'],
    'best_bowling': player_stats['figures'],
    'stumpings': player_stats[player_stats['is_stumping'] > 1]['is_stumping'],
    'runouts': player_stats[player_stats['is_runout'] > 0]['is_runout']
})

# Clean up and format
final_stats = final_stats.fillna(0)
final_stats['best_bowling'] = final_stats['best_bowling'].replace(0, '0/0')
final_stats = final_stats.round(0).astype({
    'matches': int,
    'runs': int,
    'sixes': int,
    'fours': int,
    'wickets': int,
    'stumpings': int,
    'runouts': int
})

# Sort by total contribution (runs + wickets)
final_stats = final_stats.sort_values(by=['runs', 'wickets'], ascending=[False, False])

# Save the enhanced dataset
final_stats.to_csv('player_complete_stats.csv', index=False)

# Display the top players
print("\nTop Players by Overall Contribution:")
print(final_stats.head(10))

# Display some summary statistics
print("\nSummary Statistics:")
print(f"Total Players: {len(final_stats)}")
print(f"Players with 50+ runs: {len(final_stats[final_stats['runs'] >= 50])}")
print(f"Players with 10+ wickets: {len(final_stats[final_stats['wickets'] >= 10])}")
print(f"Players with both runs and wickets: {len(final_stats[(final_stats['runs'] > 0) & (final_stats['wickets'] > 0)])}")