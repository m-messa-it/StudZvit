using Microsoft.AspNetCore.Mvc;
using DocLab.Backend.Services;

namespace DocLab.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DocumentController : ControllerBase
    {
        private readonly IDocumentGeneratorService _documentService;
        private readonly IRabbitMqService _rabbitMqService;
        private readonly ILogger<DocumentController> _logger;

        public DocumentController(
            IDocumentGeneratorService documentService,
            IRabbitMqService rabbitMqService,
            ILogger<DocumentController> logger)
        {
            _documentService = documentService;
            _rabbitMqService = rabbitMqService;
            _logger = logger;
        }

        /// <summary>
        /// Генерація титульної сторінки за стандартами коледжу
        /// </summary>
        [HttpPost("title-page")]
        public async Task<IActionResult> GenerateTitlePage([FromBody] TitlePageModel model)
        {
            if (model == null)
                return BadRequest(new { Message = "Дані моделі відсутні." });

            _logger.LogInformation("Генерація титульного аркуша для студента: {Student}, група {Group}", model.StudentName, model.Group);
            var fileBytes = await _documentService.GenerateTitlePageAsync(model);

            return File(fileBytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", $"Титулка_{model.StudentName}_{model.Discipline}.docx");
        }

        /// <summary>
        /// Генерація повного комплексного звіту
        /// </summary>
        [HttpPost("full-report")]
        public async Task<IActionResult> GenerateFullReport([FromBody] FullReportModel model)
        {
            if (model == null)
                return BadRequest(new { Message = "Дані звіту відсутні." });

            _logger.LogInformation("Генерація повного звіту з теми '{Topic}', студент {Student}", model.Topic, model.StudentName);
            var fileBytes = await _documentService.GenerateFullReportAsync(model);

            return File(fileBytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", $"Звіт_{model.WorkType}_{model.StudentName}.docx");
        }

        /// <summary>
        /// Постановка у чергу RabbitMQ для асинхронної генерації об'ємних робіт
        /// </summary>
        [HttpPost("queue-report")]
        public async Task<IActionResult> QueueReport([FromBody] FullReportModel model)
        {
            var jobId = Guid.NewGuid().ToString("N");
            await _rabbitMqService.EnqueueDocumentGenerationAsync(jobId, model);

            return Accepted(new
            {
                JobId = jobId,
                Status = "В черзі RabbitMQ",
                CheckStatusUrl = $"/api/document/queue-status/{jobId}"
            });
        }

        /// <summary>
        /// Перевірка статусу виконання фонового завдання RabbitMQ
        /// </summary>
        [HttpGet("queue-status/{jobId}")]
        public IActionResult GetQueueStatus(string jobId)
        {
            var status = _rabbitMqService.GetJobStatus(jobId);
            return Ok(new { JobId = jobId, Status = status });
        }
    }
}
