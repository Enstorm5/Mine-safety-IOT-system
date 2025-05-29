#include <DHT.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>
#include <SoftwareSerial.h>
#include <TinyGPSPlus.h>
#include <ESP8266WiFi.h>
#include <Firebase_ESP_Client.h>


#define WIFI_SSID "bruh"
#define WIFI_PASSWORD "password"
#define API_KEY "api key"
#define DATABASE_URL "database url"

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

#define DHTPIN 2          // GPIO2 = D4 on NodeMCU
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

#define SW420_PIN 14      // GPIO14 = D5 on NodeMCU

Adafruit_BMP280 bmp;
const float knownCorrectPressure = 1004.3;
float pressureErrorPercent = 0.0;

#define GPS_RX_PIN D6
SoftwareSerial gpsSerial(GPS_RX_PIN, -1);// RX-only
TinyGPSPlus gps;

#define MQ9_AO_PIN A0//MQ-9 Gas sensor setup

unsigned long lastSensorRead = 0;
const unsigned long sensorInterval = 2000;

void setup() {
  Serial.begin(115200);
  delay(2000);

  WiFi.setSleepMode(WIFI_NONE_SLEEP);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
  }
  Serial.println("\nConnected to Wi-Fi!");

  config.api_key = API_KEY;
  config.database_url = DATABASE_URL;
  auth.user.email = "";
  auth.user.password = "";

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);

  Serial.println("Authenticating with Firebase...");
  unsigned long startTime = millis();
  while (!Firebase.ready()) {
    delay(100);
    if (millis() - startTime > 15000) {
      Serial.println(" Firebase auth timeout!");
      return;
    }
  }
  Serial.println(" Firebase ready!");

  dht.begin();
  pinMode(SW420_PIN, INPUT);

  if (!bmp.begin(0x76)) {
    if (!bmp.begin(0x77)) {
      Serial.println("Could not find BMP280 sensor!");
      while (1);
    }
  }

  float initialPressure = bmp.readPressure() / 100.0;
  pressureErrorPercent = (knownCorrectPressure - initialPressure) / initialPressure * 100.0;

  gpsSerial.begin(9600);
  Serial.println("All sensors initialized.");
}

void loop() {
  while (gpsSerial.available()) {
    gps.encode(gpsSerial.read());
  }

  if (millis() - lastSensorRead >= sensorInterval) {
    lastSensorRead = millis();

    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();
    int vibration = digitalRead(SW420_PIN);
    float measuredPressure = bmp.readPressure() / 100.0;
    float correctedPressure = measuredPressure + (measuredPressure * pressureErrorPercent / 100.0);
    int gasAnalog = analogRead(MQ9_AO_PIN);

    double lat = gps.location.isValid() ? gps.location.lat() : 0.0;
    double lng = gps.location.isValid() ? gps.location.lng() : 0.0;
    double alt = gps.altitude.isValid() ? gps.altitude.meters() : 0.0;

    if (!isnan(temperature)) {
      if (Firebase.RTDB.setFloat(&fbdo, "/sensors/temperature", temperature)) {
        Serial.print(" Temp sent: ");
        Serial.println(temperature);
      } else {
        Serial.print(" Temp send failed: ");
        Serial.println(fbdo.errorReason());
      }
    }

    if (!isnan(humidity)) {
      if (Firebase.RTDB.setFloat(&fbdo, "/sensors/humidity", humidity)) {
        Serial.print(" Humidity sent: ");
        Serial.println(humidity);
      } else {
        Serial.print("Humidity send failed: ");
        Serial.println(fbdo.errorReason());
      }
    }

    if (Firebase.RTDB.setInt(&fbdo, "/sensors/vibration", vibration == HIGH ? 1 : 0)) {
      Serial.print(" Vibration sent: ");
      Serial.println(vibration == HIGH ? "Detected" : "Not detected");
    } else {
      Serial.print(" Vibration send failed: ");
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.setFloat(&fbdo, "/sensors/pressure", correctedPressure)) {
      Serial.print(" Pressure sent: ");
      Serial.println(correctedPressure);
    } else {
      Serial.print(" Pressure send failed: ");
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.setInt(&fbdo, "/sensors/gas_analog", gasAnalog)) {
      Serial.print(" Gas analog sent: ");
      Serial.println(gasAnalog);
    } else {
      Serial.print(" Gas analog send failed: ");
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.setDouble(&fbdo, "/sensors/gps/latitude", lat)) {
      Serial.print(" GPS Latitude sent: ");
      Serial.println(lat, 6);
    } else {
      Serial.print(" GPS Latitude send failed: ");
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.setDouble(&fbdo, "/sensors/gps/longitude", lng)) {
      Serial.print(" GPS Longitude sent: ");
      Serial.println(lng, 6);
    } else {
      Serial.print(" GPS Longitude send failed: ");
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.setDouble(&fbdo, "/sensors/gps/altitude", alt)) {
      Serial.print(" GPS Altitude sent: ");
      Serial.println(alt);
    } else {
      Serial.print(" GPS Altitude send failed: ");
      Serial.println(fbdo.errorReason());
    }

    Serial.println("------------------------");
  }
}
