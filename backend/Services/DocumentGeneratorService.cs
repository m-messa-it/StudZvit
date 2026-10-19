using System;
using System.IO;
using System.Threading.Tasks;

namespace DocLab.Backend.Services
{
    /// <summary>
    /// Сервіс генерації документів на основі стандартизованих шаблонів коледжу (ДСТУ 3008:2015)
    /// </summary>
    public interface IDocumentGeneratorService
    {
        Task<byte[]> GenerateTitlePageAsync(TitlePageModel model);
        Task<byte[]> GenerateFullReportAsync(FullReportModel model);
    }

    public class TitlePageModel
    {
        public string College { get; set; } = "Рівненський кооперативний економіко-правовий фаховий коледж";
        public string Department { get; set; } = "Відділення комп'ютерних технологій";
        public string Committee { get; set; } = "Циклова комісія інженерії програмного забезпечення";
        public string Discipline { get; set; } = string.Empty;
        public string WorkType { get; set; } = "Практична робота";
        public string WorkNumber { get; set; } = "1";
        public string Topic { get; set; } = string.Empty;
        public string StudentName { get; set; } = string.Empty;
        public string Group { get; set; } = "ІТ-32";
        public string TeacherName { get; set; } = string.Empty;
        public string City { get; set; } = "Рівне";
        public string Year { get; set; } = "2026";
    }

    public class FullReportModel : TitlePageModel
    {
        public string Aim { get; set; } = string.Empty;
        public string Task { get; set; } = string.Empty;
        public string WorkProgress { get; set; } = string.Empty;
        public string CodeSnippet { get; set; } = string.Empty;
        public string Conclusions { get; set; } = string.Empty;
        public string Bibliography { get; set; } = string.Empty;
    }

    public class DocumentGeneratorService : IDocumentGeneratorService
    {
        public async Task<byte[]> GenerateTitlePageAsync(TitlePageModel model)
        {
            if (string.IsNullOrWhiteSpace(model.StudentName))
                throw new ArgumentException("ПІБ студента є обов'язковим для генерації титульного аркуша.");

            return await Task.Run(() =>
            {
                using (var ms = new MemoryStream())
                using (var writer = new StreamWriter(ms))
                {
                    writer.WriteLine($"[DOCX_TEMPLATE_PROCESSED]");
                    writer.WriteLine($"ORG: {model.College}");
                    writer.WriteLine($"DEPT: {model.Department} / {model.Committee}");
                    writer.WriteLine($"TITLE: {model.WorkType} №{model.WorkNumber}");
                    writer.WriteLine($"DISCIPLINE: {model.Discipline}");
                    writer.WriteLine($"TOPIC: {model.Topic}");
                    writer.WriteLine($"STUDENT: {model.StudentName}, {model.Group}");
                    writer.WriteLine($"TEACHER: {model.TeacherName}");
                    writer.WriteLine($"DSTU_MARGINS: 30mm x 10mm x 20mm x 20mm");
                    writer.Flush();
                    return ms.ToArray();
                }
            });
        }

        public async Task<byte[]> GenerateFullReportAsync(FullReportModel model)
        {
            return await Task.Run(() =>
            {
                using (var ms = new MemoryStream())
                using (var writer = new StreamWriter(ms))
                {
                    writer.WriteLine($"[FULL_REPORT_TEMPLATE_PROCESSED]");
                    writer.WriteLine($"TITLE_PAGE: {model.WorkType} - {model.Topic}");
                    writer.WriteLine($"AIM: {model.Aim}");
                    writer.WriteLine($"PROGRESS: {model.WorkProgress}");
                    writer.WriteLine($"CONCLUSIONS: {model.Conclusions}");
                    writer.WriteLine($"SOURCES: {model.Bibliography}");
                    writer.Flush();
                    return ms.ToArray();
                }
            });
        }
    }
}
