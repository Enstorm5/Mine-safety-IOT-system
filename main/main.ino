#include <DHT.h>
#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>

#define DHTPIN 2        // GPIO2 = D4 on NodeMCU
#define DHTTYPE DHT22
#define SW420_PIN 14  // GPIO14 = D5 on NodeMCU

DHT dht(DHTPIN, DHTTYPE);

Adafruit_BMP280 bmp; // I2C
const float correctPressure = 1004.3; // hPa, known correct value

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
}

void loop() {
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

  delay(2000); // Delay between readings

}