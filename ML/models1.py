#####---------------------------------Testing---------------------------------#####

import pandas as pd
from io import StringIO
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
import numpy as np
import matplotlib.pyplot as plt
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense

# Data
data_str = """
id,DRN,user,state,processed,reason,date_time
1,'0260152877924','Admin','0','1','test','2023-12-06 08:46:15'
2,'0260152877924','Admin','0','0','test','2023-12-06 09:46:15'
3,'0260152877924','Admin','0','1','test','2023-12-06 08:46:15'
4,'0260152877924','Admin','0','1','test','2023-12-06 08:46:15'
5,'0260152877924','Admin','0','1','test','2023-12-06 10:46:15'
6,'0260152877924','Admin','0','1','test','2023-12-06 10:48:15'
7,'0260152877924','Admin','0','1','test','2023-12-06 11:46:15'
8,'0260152877924','Admin','0','1','test','2023-12-06 11:50:15'
9,'0260152877924','Admin','0','1','test','2023-12-06 11:59:15'
10,'0260152877924','Admin','0','1','test','2023-12-06 08:46:15'
11,'0260152877924','Admin','0','1','test','2023-12-06 08:46:15'
12,'0260152877924','Admin','0','1','test','2023-12-06 08:46:15'
13,'0260152877924','Admin','0','0','test','2023-12-06 08:46:15'
14,'0260152877924','Admin','0','1','test','2023-12-12 08:46:15'
15,'0260152877924','Admin','0','1','test','2023-12-06 08:46:15'
16,'0260152877924','Admin','0','1','test','2023-12-06 08:46:15'
17,'0260152877924','Admin','0','1','test','2023-12-14 10:46:15'
18,'0260152877924','Admin','0','1','test','2023-12-06 08:46:15'
19,'0260152877924','Admin','0','1','test','2023-12-15 08:46:15'
20,'0260152877924','Admin','0','1','test','2023-12-16 08:46:15'
21,'0260152877924','Admin','0','1','test','2023-12-17 09:46:15'
22,'0260152877924','Admin','0','1','test','2023-12-20 08:46:15'
"""

# Load data into a DataFrame
df = pd.read_csv(StringIO(data_str))

# Convert date_time column to datetime type, coerce errors to NaT (Not a Time)
df['date_time'] = pd.to_datetime(df['date_time'], errors='coerce')

# Filter out rows with invalid dates (NaT)
df = df.dropna(subset=['date_time'])

# Display the cleaned DataFrame
print(df)

# Remove quotes from string columns
df['DRN'] = df['DRN'].str.replace("'", "")
df['user'] = df['user'].str.replace("'", "")
df['state'] = df['state'].str.replace("'", "").astype(int)
df['processed'] = df['processed'].str.replace("'", "").astype(int)
df['reason'] = df['reason'].str.replace("'", "")

# Sort the data by date_time
df = df.sort_values(by='date_time')

# Calculate time differences between consecutive entries
df['time_diff'] = df['date_time'].diff().dt.total_seconds().fillna(0)

# Calculate the cumulative count of state changes
df['state_change'] = (df['state'] != df['state'].shift(1)).cumsum()

# Calculate the frequency of state changes
df['state_change_freq'] = df.groupby('state_change').cumcount() + 1

# Calculate the processed state ratio
df['processed_ratio'] = df['processed'].expanding().mean()

# Fill NaN values only for numeric columns
numeric_cols = df.select_dtypes(include=np.number).columns
df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())

# Select relevant features for predictive modeling
features = ['state', 'time_diff', 'state_change', 'state_change_freq', 'processed_ratio']

# Create lagged features for time series forecasting
def create_lagged_features(df, features, n_lags=1):
    for feature in features:
        for lag in range(1, n_lags + 1):
            df[f'{feature}_lag{lag}'] = df[feature].shift(lag)
    df.dropna(inplace=True)
    return df

# Create lagged features
n_lags = 3
df = create_lagged_features(df, features, n_lags)

# Select features and target
X = df[[f'{feature}_lag{lag}' for feature in features for lag in range(1, n_lags + 1)]]
y = df['state']

# Scale the features
scaler = MinMaxScaler()
X_scaled = scaler.fit_transform(X)

# Reshape the data for LSTM [samples, timesteps, features]
X_reshaped = X_scaled.reshape((X_scaled.shape[0], n_lags, len(features)))

# Split the data into training and testing sets
# We can tweak the test_size
X_train, X_test, y_train, y_test = train_test_split(X_reshaped, y, test_size=0.3, random_state=42)

# Define the LSTM model
model = Sequential()
model.add(LSTM(50, activation='relu', input_shape=(n_lags, len(features))))
model.add(Dense(1))
model.compile(optimizer='adam', loss='mse')

# Train the model
history = model.fit(X_train, y_train, epochs=50, validation_data=(X_test, y_test), batch_size=32, verbose=1)

# Evaluate the model
loss = model.evaluate(X_test, y_test, verbose=0)
print(f'Test Loss: {loss}')

# Make predictions
y_pred = model.predict(X_test)

# Plot the actual vs predicted values
plt.figure(figsize=(12, 6))
plt.plot(y_test.values, label='Actual')
plt.plot(y_pred, label='Predicted')
plt.xlabel('Time')
plt.ylabel('State')
plt.legend()
plt.show()





#####---------------------------------Testing---------------------------------#####