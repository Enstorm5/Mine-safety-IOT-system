
#define SW420_PIN 0  // D2

void setup() {
  Serial.begin(115200);
  pinMode(SW420_PIN, INPUT);
  Serial.println("Initialized");
}

void loop() {
  int digitalVal = digitalRead(SW420_PIN);  
  Serial.print("Digital Value: ");
  Serial.print(digitalVal);
  Serial.print(" -> ");
  Serial.println(digitalVal == LOW ?  "Vibration not Detected!" : "Vibration");

  delay(500);
}
