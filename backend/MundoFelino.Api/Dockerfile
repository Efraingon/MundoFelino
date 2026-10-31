# Etapa de compilación
FROM mcr.microsoft.com/dotnet/sdk:10.0-preview AS build
WORKDIR /src
COPY ["MundoFelino.Api.csproj", "./"]
RUN dotnet restore "MundoFelino.Api.csproj"
COPY . .
RUN dotnet publish "MundoFelino.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Etapa final de ejecución
FROM mcr.microsoft.com/dotnet/aspnet:10.0-preview AS final
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_HTTP_PORTS=8080
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "MundoFelino.Api.dll"]

