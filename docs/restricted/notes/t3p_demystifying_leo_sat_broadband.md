# T3P: Demystifying Low-Earth Orbit Satellite Broadband

See [Paper](../papers/t3p_demystifying_leo_sat_broadband.pdf).

## Goals

- Development of LEO latency predictor
- Look into how to improve transport protocols by using the developed predictor

## Latency Analysis

- Analysis for orientation of Starlink dish
    - orientation is defined by azimuth and elevation (given in degrees)
- in parallel measuring the latency
- plotting both on heatmap ⇒ correlation between orientation and latency
- results:
    - latency and orientation are correlated
    - HOWEVER: no clear pattern that predicts a good latency, but bad latency might be predictable
- still, we have to keep in mind that the latency is a complex mix of factors (e.g., orientation, GS availability, network congestion, etc.)
- also, good latencies of 30-50 ms were observed, but very long tails with very high latencies

## Latency Prediction

- apply ML on the recorded data to predict (1) latency and (2) throughput
- ML models used:
    - XGBoost, LSTM, and ARIMA
- Results:
    - Latency prediction: LSTM achieve ~96 % accuracy
    - Throughput prediction: XGBoost achieve ~73.92 % accuracy
⇒ Predictors can give useful data about the network for lower transport layer protocols
- optimization of QoE by adopting the T3P stack

## T3P Stack

- Between the transport and physical layer, add a predictor layer, that uses triggers and telemetry data to predict the network state
- the physical layer is the Starlink dish, while the transport layer is TCP/UDP stack
