#define MQ9_DO_PIN 5      // MQ9_DO_PIN is the digital output pin of the MQ-9 sensor, connected to NodeMCU D1 (GPIO5).
#define MQ9_AO_PIN A0     // MQ9_AO_PIN is the analog output pin of the sensor, connected to the A0 (analog input) of NodeMCU.


void setup() {
  Serial.begin(115200); // Initializes the Serial monitor at 115200 baud for communication.
  pinMode(MQ9_DO_PIN, INPUT); // Sets the digital pin as input.
  Serial.println("MQ-9 Sensor (LPG/CH₄) Initialized"); // Prints an initialization message.
}

void loop() {
  int analogVal = analogRead(MQ9_AO_PIN);     // Reads the analog value from the sensor (0–1023). Higher values mean more gas.
  int digitalVal = digitalRead(MQ9_DO_PIN);   // 1 = clean, 0 = gas detected

  Serial.print("Analog Value (CH₄/LPG): ");
  Serial.print(analogVal);
  Serial.print(" | Digital: ");
  Serial.print(digitalVal == 1 ? "Clean" : "Gas Detected");
  Serial.print(" (Raw: ");
  Serial.print(digitalVal);
  Serial.println(")");

  delay(1000); // Waits for 1 second and repeats.
}