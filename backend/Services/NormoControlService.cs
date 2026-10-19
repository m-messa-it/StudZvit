using System.Text.RegularExpressions;

namespace DocLab.Backend.Services
{
    public interface INormoControlService
    {
        NormoReport CheckText(string text);
        PlagiarismReport FastPlagiarismCheck(string text);
    }

    public class NormoIssue
    {
        public string Type { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public int Count { get; set; }
        public string Recommendation { get; set; } = string.Empty;
    }

    public class NormoReport
    {
        public int TotalCharacters { get; set; }
        public int WordCount { get; set; }
        public int ParagraphCount { get; set; }
        public bool IsCompliant { get; set; }
        public List<NormoIssue> Issues { get; set; } = new();
        public string SanitizedText { get; set; } = string.Empty;
    }

    public class PlagiarismReport
    {
        public double OriginalityPercentage { get; set; }
        public double DuplicateTextPercentage { get; set; } // ДТП
        public string Status { get; set; } = string.Empty;
        public List<string> MatchedPhrases { get; set; } = new();
    }

    public class NormoControlService : INormoControlService
    {
        public NormoReport CheckText(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                return new NormoReport
                {
                    IsCompliant = false,
                    Issues = new List<NormoIssue>
                    {
                        new() { Type = "Порожній текст", Message = "Введений текст відсутній", Count = 1, Recommendation = "Введіть або завантажте текст для аналізу." }
                    }
                };
            }

            var report = new NormoReport
            {
                TotalCharacters = text.Length,
                WordCount = Regex.Matches(text, @"[\p{L}\p{Nd}]+").Count,
                ParagraphCount = text.Split(new[] { "\r\n", "\r", "\n" }, StringSplitOptions.RemoveEmptyEntries).Length
            };

            // 1. Перевірка лапок
            var straightQuotesCount = Regex.Matches(text, "[\"']").Count;
            if (straightQuotesCount > 0)
            {
                report.Issues.Add(new NormoIssue
                {
                    Type = "Лапки",
                    Message = $"Виявлено прямі лапки (\" \") замість кутових (« »).",
                    Count = straightQuotesCount,
                    Recommendation = "Використовуйте типографські лапки-ялинки « »."
                });
            }

            // 2. Перевірка дефісів замість тире між словами
            var hyphenAsDashCount = Regex.Matches(text, @"\s-\s").Count;
            if (hyphenAsDashCount > 0)
            {
                report.Issues.Add(new NormoIssue
                {
                    Type = "Тире та дефіси",
                    Message = $"Виявлено дефіси з пробілами (' - ') замість тире (' — ').",
                    Count = hyphenAsDashCount,
                    Recommendation = "Замініть дефіси з пробілами на довге тире (Alt+0151)."
                });
            }

            // 3. Подвійні пробіли
            var doubleSpacesCount = Regex.Matches(text, @" {2,}").Count;
            if (doubleSpacesCount > 0)
            {
                report.Issues.Add(new NormoIssue
                {
                    Type = "Пробіли",
                    Message = $"Виявлено зайві подвійні або потрійні пробіли.",
                    Count = doubleSpacesCount,
                    Recommendation = "Видаліть подвійні пробіли, залишивши один."
                });
            }

            // Автоматичне виправлення (санітизація)
            var fixedText = Regex.Replace(text, @"\s-\s", " — ");
            fixedText = Regex.Replace(fixedText, @" {2,}", " ");
            fixedText = Regex.Replace(fixedText, @"""([^""]+)""", "«$1»");

            report.SanitizedText = fixedText;
            report.IsCompliant = report.Issues.Count == 0;

            return report;
        }

        public PlagiarismReport FastPlagiarismCheck(string text)
        {
            if (string.IsNullOrWhiteSpace(text))
            {
                return new PlagiarismReport
                {
                    OriginalityPercentage = 0,
                    DuplicateTextPercentage = 0,
                    Status = "Текст не надано"
                };
            }

            var words = Regex.Matches(text, @"[\p{L}\p{Nd}]+").Select(m => m.Value.ToLower()).ToList();
            if (words.Count < 10)
            {
                return new PlagiarismReport
                {
                    OriginalityPercentage = 100,
                    DuplicateTextPercentage = 0,
                    Status = "Занадто короткий фрагмент для аналізу шинглів (менше 10 слів)."
                };
            }

            // Алгоритм шинглів (shingle size = 3)
            var shingles = new HashSet<string>();
            var duplicateCount = 0;
            var matched = new List<string>();

            for (int i = 0; i < words.Count - 2; i++)
            {
                var shingle = $"{words[i]} {words[i + 1]} {words[i + 2]}";
                if (!shingles.Add(shingle))
                {
                    duplicateCount++;
                    if (matched.Count < 5)
                    {
                        matched.Add(shingle);
                    }
                }
            }

            var totalShingles = Math.Max(1, words.Count - 2);
            var dtp = Math.Round((double)duplicateCount / totalShingles * 100, 1);
            var originality = Math.Max(0, 100 - dtp);

            return new PlagiarismReport
            {
                OriginalityPercentage = originality,
                DuplicateTextPercentage = dtp,
                Status = originality >= 75 ? "Висока унікальність (Норма)" : (originality >= 50 ? "Задовільна унікальність" : "Високий відсоток збігів (ДТП)"),
                MatchedPhrases = matched
            };
        }
    }
}
