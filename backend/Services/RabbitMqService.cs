using System.Collections.Concurrent;

namespace DocLab.Backend.Services
{
    public interface IRabbitMqService
    {
        Task EnqueueDocumentGenerationAsync(string jobId, object payload);
        string GetJobStatus(string jobId);
    }

    /// <summary>
    /// Сервіс взаємодії з брокером черг повідомлень (RabbitMQ / Background Queue)
    /// для асинхронної обробки великих звітів та конвертації у фоновому режимі.
    /// </summary>
    public class RabbitMqService : IRabbitMqService
    {
        private readonly ILogger<RabbitMqService> _logger;
        private readonly ConcurrentDictionary<string, string> _jobStatuses = new();

        public RabbitMqService(ILogger<RabbitMqService> logger)
        {
            _logger = logger;
        }

        public async Task EnqueueDocumentGenerationAsync(string jobId, object payload)
        {
            _logger.LogInformation("[RabbitMQ Publisher] Відправка повідомлення в чергу 'document.generation.queue' для завдання {JobId}", jobId);
            _jobStatuses[jobId] = "В черзі обробки (Queued)";

            // Симуляція асинхронного воркера споживача черги RabbitMQ
            _ = Task.Run(async () =>
            {
                try
                {
                    await Task.Delay(1500);
                    _jobStatuses[jobId] = "Генерація шаблону та рендеринг (Processing)";
                    await Task.Delay(1500);
                    _jobStatuses[jobId] = "Завершено успішно (Completed)";
                    _logger.LogInformation("[RabbitMQ Consumer] Завдання {JobId} успішно виконано", jobId);
                }
                catch (Exception ex)
                {
                    _jobStatuses[jobId] = "Помилка обробки черги: " + ex.Message;
                    _logger.LogError(ex, "[RabbitMQ Consumer] Помилка обробки завдання {JobId}", jobId);
                }
            });

            await Task.CompletedTask;
        }

        public string GetJobStatus(string jobId)
        {
            return _jobStatuses.TryGetValue(jobId, out var status) ? status : "Завдання не знайдено";
        }
    }
}
