#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BMP280.h>

Adafruit_BMP280 bmp;

const float correctPressure = 1004.3;

void setup() {
  Serial.begin(115200);
  if (!bmp.begin(0x76)) {
    Serial.println("Could not find BMP280 sensor!");
    while (1);
  }
  Serial.println("BMP280 sensor initialized.");
}

void loop() {
  
  //Saving the values read from the sensor in variables.
  float temperature = bmp.readTemperature();
  float measuredPressure = bmp.readPressure() / 100.0;

  // Calculate error percentage
  float errorPercent = (correctPressure - measuredPressure) / measuredPressure * 100.0;

  // Adjust the measured pressure using the error percentage
  float correctedPressure = measuredPressure + (measuredPressure * errorPercent / 100.0);

  Serial.print("Temperature = ");
  Serial.print(temperature);
  Serial.println(" °C");

  Serial.print("Raw Pressure = ");
  Serial.print(measuredPressure);
  Serial.println(" hPa");

  Serial.print("Corrected Pressure = ");
  Serial.print(correctedPressure);
  Serial.println(" hPa");

  Serial.print("Error % = ");
  Serial.print(errorPercent);
  Serial.println(" %");

  Serial.print("Approx. Altitude = ");
  Serial.print(bmp.readAltitude(correctPressure));
  Serial.println(" m");

  Serial.println("----------------------");
  delay(2000);
}