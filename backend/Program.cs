using DocLab.Backend.Middlewares;
using DocLab.Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Додавання контролерів та Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Реєстрація бізнес-сервісів платформи DocLab
builder.Services.AddScoped<IDocumentGeneratorService, DocumentGeneratorService>();
builder.Services.AddScoped<INormoControlService, NormoControlService>();
builder.Services.AddSingleton<IRabbitMqService, RabbitMqService>();

// Налаштування CORS для безпечної взаємодії з клієнтським застосунком
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClientApp", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Глобальний обробник винятків (Exception Handling Middleware)
app.UseMiddleware<GlobalExceptionMiddleware>();

app.UseCors("AllowClientApp");
app.UseRouting();
app.MapControllers();

app.Run();
