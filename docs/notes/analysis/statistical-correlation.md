# Statistical Correlation

Here: how to correlate the packet loss and latency.

Can we observe any correlation between the two?

## Variables to correlate

For correlation, we need points in the form (x, y) which does not easily work as there are none of these tuples.
Therefore, we use the results from latency and packet loss analysis for each month.

We use:
- the median latency in each month from 01/2022 to 06/2024
- the packet loss in percent over the whole month

## Methods

Statistical methods:
1. Pearson's Correlation
2. Kendall Correlation
3. Spearman Correlation

Those are built-in for Python dataframes.


