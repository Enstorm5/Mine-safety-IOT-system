#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;

void setup() {
  Serial.begin(115200);
  if (!bmp.begin(0x76)) {
    Serial.println("Could not find BMP280 sensor!");
    while (1);
  }
  Serial.println("BMP280 sensor initialized.");
}

void loop() {
  Serial.print("Temperature = ");
  Serial.print(bmp.readTemperature());
  Serial.println(" °C");

  Serial.print("Pressure = ");
  Serial.print(bmp.readPressure() / 100.0);
  Serial.println(" hPa");

  Serial.print("Approx. Altitude = ");
  Serial.print(bmp.readAltitude(1013.25));
  Serial.println(" m");

  Serial.println("----------------------");
  delay(2000);
}