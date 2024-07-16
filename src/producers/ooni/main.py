import subprocess

subprocess.run([
    "oonidata", "sync",
    "--test-name", "web_connectivity",
    "--start-day", "2022-01-01",
    "--end-day", "2024-06-30",
    "--output-dir", "ooni-results"
])
