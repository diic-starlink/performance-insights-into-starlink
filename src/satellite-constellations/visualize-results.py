import matplotlib.pyplot as plt
import pandas as pd

# Read the data from CSV file
df = pd.read_csv('satellite-dev.csv', index_col='name')

# Plot
plt.figure(figsize=(12, 6))
for satellite in df.index:
    plt.plot(df.columns, df.loc[satellite], marker='o', label=satellite)

plt.title('Satellite Systems Growth')
plt.xlabel('Year')
plt.ylabel('Number of Satellites')
plt.legend()
plt.grid(True)
plt.xticks(rotation=45)
plt.yscale('log')  # Set y-axis to logarithmic scale
plt.tight_layout()
plt.show()
