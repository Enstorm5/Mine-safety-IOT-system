#include <DHT.h>

#define DHTPIN 2        // GPIO2 = D4 on NodeMCU
#define DHTTYPE DHT22

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  delay(2000); 
  dht.begin();
  Serial.println("DHT22 Initialized");
}

void loop() {
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();

  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("❌ Sensor read failed!");
  } else {
    Serial.print("🌡 Temp: ");
    Serial.print(temperature);
    Serial.print(" °C | 💧 Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");
  }

  delay(2000);
}