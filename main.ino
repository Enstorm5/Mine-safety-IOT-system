#include <DHT.h>

#define DHTPIN 2        // GPIO2 = D4 on NodeMCU
#define DHTTYPE DHT22
#define SW420_PIN 14

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  delay(2000); 
  dht.begin();
  Serial.println("DHT22 Initialized");
  pinMode(SW420_PIN, INPUT);
  Serial.println("Vibration Sensor Initialized");
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
  int vibration = digitalRead(SW420_PIN);
  Serial.print("SW-420: ");
  Serial.println(vibration == LOW ? "Vibration not Detected!" : "Vibration");

  delay(2000); // Delay between readings

}