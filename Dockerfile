# Build stage: use .NET 9 SDK (Railway/Nixpacks defaults to .NET 6)
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files first for better layer caching
COPY ["MocSolution.sln", "./"]
COPY ["backend/src/Moc.Api/Moc.Api.csproj", "backend/src/Moc.Api/"]
COPY ["backend/src/Moc.Application/Moc.Application.csproj", "backend/src/Moc.Application/"]
COPY ["backend/src/Moc.Domain/Moc.Domain.csproj", "backend/src/Moc.Domain/"]
COPY ["backend/src/Moc.Infrastructure/Moc.Infrastructure.csproj", "backend/src/Moc.Infrastructure/"]

# Restore dependencies
RUN dotnet restore "backend/src/Moc.Api/Moc.Api.csproj"

# Copy remaining source code and publish
COPY backend/ backend/
RUN dotnet publish "backend/src/Moc.Api/Moc.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Railway sets PORT; Program.cs reads it. Expose for documentation.
EXPOSE 8080
ENTRYPOINT ["dotnet", "Moc.Api.dll"]
