import React, { useState, useEffect } from 'react';

function GeolocationInput({ onLocationUpdate }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const getCurrentLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        setLocation(newLocation);
        onLocationUpdate(newLocation);
        setLoading(false);
      },
      (error) => {
        let errorMessage = '';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied by user.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = "An unknown error occurred.";
            break;
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  useEffect(() => {
    // Auto-get location on component mount
    getCurrentLocation();
  }, []);

  return (
    <div className="geolocation-input">
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <span>Getting your location...</span>
        </div>
      )}

      {error && (
        <div className="error-state">
          <span className="error-text">{error}</span>
          <button onClick={getCurrentLocation} className="button secondary">
            Try Again
          </button>
        </div>
      )}

      {location && (
        <div className="location-display">
          <div className="location-info">
            <strong>Current Location:</strong><br />
            Latitude: {location.lat.toFixed(6)}<br />
            Longitude: {location.lng.toFixed(6)}<br />
            Accuracy: {location.accuracy.toFixed(0)} meters
          </div>
          <button onClick={getCurrentLocation} className="button secondary">
            Update Location
          </button>
        </div>
      )}

      <style jsx>{`
        .geolocation-input {
          border: 2px solid #e1e5e9;
          border-radius: 8px;
          padding: 16px;
          background: rgba(248, 249, 250, 0.8);
        }

        .loading-state {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #495057;
        }

        .error-state {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .error-text {
          color: #dc3545;
          font-size: 14px;
        }

        .location-display {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .location-info {
          flex: 1;
          font-size: 14px;
          color: #495057;
        }

        @media (max-width: 768px) {
          .location-display {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}

export default GeolocationInput;