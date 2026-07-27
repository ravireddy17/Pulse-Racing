FROM node:24.15.0-alpine AS frontend-build
WORKDIR /workspace/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM maven:3.9.11-eclipse-temurin-21-alpine AS backend-build
WORKDIR /workspace/backend
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B
COPY backend/src ./src
COPY --from=frontend-build /workspace/frontend/dist/frontend/browser ./src/main/resources/static
RUN mvn package -B -DskipTests

FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S pulse && adduser -S pulse -G pulse
WORKDIR /app
COPY --from=backend-build /workspace/backend/target/backend-0.1.0-SNAPSHOT.jar app.jar
USER pulse
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/app.jar"]
