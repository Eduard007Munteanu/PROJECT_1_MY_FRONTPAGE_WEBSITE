FROM gradle:8.7-jdk21-alpine AS build
WORKDIR /workspace

COPY build.gradle settings.gradle gradlew gradlew.bat ./
COPY gradle gradle
COPY src src

RUN gradle bootJar --no-daemon

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

ENV FILE_UPLOAD_DIR=/app/upload

COPY --from=build /workspace/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
