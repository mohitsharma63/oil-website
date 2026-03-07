@echo off
echo Starting Spring Boot application...
cd target\classes
java -cp "..\..\..\target\lib\*;." com.oli.oli.App
