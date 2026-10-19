using Microsoft.AspNetCore.Mvc;
using DocLab.Backend.Services;

namespace DocLab.Backend.Controllers
{
    public class ValidationRequest
    {
        public string Text { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/[controller]")]
    public class ValidationController : ControllerBase
    {
        private readonly INormoControlService _normoService;
        private readonly ILogger<ValidationController> _logger;

        public ValidationController(INormoControlService normoService, ILogger<ValidationController> logger)
        {
            _normoService = normoService;
            _logger = logger;
        }

        /// <summary>
        /// Модуль автоматичного нормоконтролю: перевірка лапок, тире, пробілів та форматування
        /// </summary>
        [HttpPost("normocontrol")]
        public IActionResult CheckNormoControl([FromBody] ValidationRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Text))
            {
                return BadRequest(new { Message = "Текст для нормоконтролю не може бути порожнім." });
            }

            _logger.LogInformation("Запит на нормоконтроль тексту, довжина: {Length} симв.", request.Text.Length);
            var result = _normoService.CheckText(request.Text);
            return Ok(result);
        }

        /// <summary>
        /// Швидкий тест на плагіат та ДТП (відсоток дубльованого тексту за алгоритмом шинглів)
        /// </summary>
        [HttpPost("plagiarism-fast")]
        public IActionResult FastPlagiarismCheck([FromBody] ValidationRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Text))
            {
                return BadRequest(new { Message = "Текст для перевірки на плагіат не може бути порожнім." });
            }

            _logger.LogInformation("Запит на швидкий тест плагіату/ДТП, довжина: {Length} симв.", request.Text.Length);
            var result = _normoService.FastPlagiarismCheck(request.Text);
            return Ok(result);
        }
    }
}
