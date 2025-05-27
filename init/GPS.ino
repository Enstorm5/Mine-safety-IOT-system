#include <SoftwareSerial.h>
#include <TinyGPSPlus.h>


#define GPS_RX_PIN D5
SoftwareSerial gpsSerial(GPS_RX_PIN, -1);  // RX only
TinyGPSPlus gps;  // GPS 

  

void setup() {
  Serial.begin(115200);       // USB debug
  gpsSerial.begin(9600);      // Sensor max rate is 9600 baud
  Serial.println("\nGPS Active");

}

  

void loop() {
  while (gpsSerial.available()) {
    char c = gpsSerial.read();
    gps.encode(c); // Parse GPS data

    if (gps.location.isUpdated()) {
      Serial.print("Latitude: ");
      Serial.println(gps.location.lat(), 6);  
      Serial.print("Longitude: ");
      Serial.println(gps.location.lng(), 6);
    }

  }

}