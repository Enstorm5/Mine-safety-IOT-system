#include <DHT.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>
#include <SoftwareSerial.h>
#include <TinyGPSPlus.h>

#define DHTPIN 2          // GPIO2 = D4 on NodeMCU
#define DHTTYPE DHT22
#define SW420_PIN 14      // GPIO14 = D5 on NodeMCU

#define GPS_RX_PIN D6
SoftwareSerial gpsSerial(GPS_RX_PIN, -1); // RX-only
TinyGPSPlus gps;

DHT dht(DHTPIN, DHTTYPE);
Adafruit_BMP280 bmp; // I2C
const float correctPressure = 1004.3; // hPa, known correct value

unsigned long lastSensorRead = 0;
const unsigned long sensorInterval = 2000;
float pressureErrorPercent = 0;

void setup() {
  Serial.begin(115200);
  delay(2000);

  dht.begin();
  Serial.println("DHT22 Initialized");

  pinMode(SW420_PIN, INPUT);
  Serial.println("Vibration Sensor Initialized");

  if (!bmp.begin(0x76)) {
    Serial.println("Could not find BMP280 sensor!");
    while (1);
  }
  Serial.println("BMP280 sensor initialized.");

  float initialPressure = bmp.readPressure() / 100.0;
  pressureErrorPercent = (correctPressure - initialPressure) / initialPressure * 100.0;

  gpsSerial.begin(9600);
  Serial.println("GPS Active");
}

void loop() {

  while (gpsSerial.available()) {
    char c = gpsSerial.read();
    gps.encode(c); 
  }

  
  if (gps.location.isUpdated()) {
    Serial.print(" Latitude: ");
    Serial.println(gps.location.lat(), 6);
    Serial.print(" Longitude: ");
    Serial.println(gps.location.lng(), 6);
    
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Sensor read failed!");
  } else {
    Serial.print("🌡 Temp: ");
    Serial.print(temperature);
    Serial.print(" °C | Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");
  }

  int vibration = digitalRead(SW420_PIN);
  Serial.print("SW-420: ");
  Serial.println(vibration == LOW ? "Vibration not Detected!" : "Vibration");

  float measuredPressure = bmp.readPressure() / 100.0; // hPa
  float errorPercent = (correctPressure - measuredPressure) / measuredPressure * 100.0;
  float correctedPressure = measuredPressure + (measuredPressure * errorPercent / 100.0);

  Serial.print("Corrected Pressure: ");
  Serial.print(correctedPressure);
  Serial.println(" hPa");

  Serial.println("----------------------");

  delay(2000);
}
}
