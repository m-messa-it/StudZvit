using System;
using System.IO;

namespace DocGen
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
            Console.WriteLine("Генерація технічної документації, аналізу коду, схем та промптів...");

            Type? wordType = Type.GetTypeFromProgID("Word.Application");
            if (wordType == null)
            {
                Console.WriteLine("Помилка: Microsoft Word не знайдено на комп'ютері.");
                return;
            }

            dynamic word = Activator.CreateInstance(wordType)!;
            word.Visible = false;

            try
            {
                dynamic doc = word.Documents.Add();
                dynamic selection = word.Selection;

                // Налаштування полів сторінки
                doc.PageSetup.LeftMargin = 72.0f; // 25 мм
                doc.PageSetup.RightMargin = 56.7f; // 20 мм
                doc.PageSetup.TopMargin = 56.7f;
                doc.PageSetup.BottomMargin = 56.7f;

                void SetNormal()
                {
                    selection.Font.Name = "Arial";
                    selection.Font.Size = 11;
                    selection.Font.Bold = 0;
                    selection.Font.Italic = 0;
                    selection.Font.Color = 0x1E293B;
                    selection.ParagraphFormat.Alignment = 3; // Justify
                    selection.ParagraphFormat.LineSpacingRule = 0; // Single
                    selection.ParagraphFormat.FirstLineIndent = 0;
                    selection.ParagraphFormat.SpaceBefore = 0;
                    selection.ParagraphFormat.SpaceAfter = 6;
                }

                void SetTitle(string text)
                {
                    selection.ParagraphFormat.Alignment = 1; // Center
                    selection.ParagraphFormat.FirstLineIndent = 0;
                    selection.ParagraphFormat.SpaceBefore = 10;
                    selection.ParagraphFormat.SpaceAfter = 6;
                    selection.Font.Name = "Arial";
                    selection.Font.Size = 21;
                    selection.Font.Bold = 1;
                    selection.Font.Color = 0x1E3A8A; // Темно-синій
                    selection.TypeText(text);
                    selection.TypeParagraph();
                    SetNormal();
                }

                void SetSubtitle(string text)
                {
                    selection.ParagraphFormat.Alignment = 1;
                    selection.ParagraphFormat.FirstLineIndent = 0;
                    selection.ParagraphFormat.SpaceBefore = 0;
                    selection.ParagraphFormat.SpaceAfter = 18;
                    selection.Font.Name = "Arial";
                    selection.Font.Size = 12.5f;
                    selection.Font.Italic = 1;
                    selection.Font.Color = 0x475569;
                    selection.TypeText(text);
                    selection.TypeParagraph();
                    SetNormal();
                }

                void SetH1(string text)
                {
                    selection.ParagraphFormat.Alignment = 0; // Left
                    selection.ParagraphFormat.FirstLineIndent = 0;
                    selection.ParagraphFormat.SpaceBefore = 16;
                    selection.ParagraphFormat.SpaceAfter = 6;
                    selection.Font.Name = "Arial";
                    selection.Font.Size = 14.5f;
                    selection.Font.Bold = 1;
                    selection.Font.Color = 0x1E3A8A;
                    selection.TypeText(text);
                    selection.TypeParagraph();
                    SetNormal();
                }

                void SetH2(string text)
                {
                    selection.ParagraphFormat.Alignment = 0;
                    selection.ParagraphFormat.FirstLineIndent = 0;
                    selection.ParagraphFormat.SpaceBefore = 10;
                    selection.ParagraphFormat.SpaceAfter = 4;
                    selection.Font.Name = "Arial";
                    selection.Font.Size = 12;
                    selection.Font.Bold = 1;
                    selection.Font.Color = 0x0F172A;
                    selection.TypeText(text);
                    selection.TypeParagraph();
                    SetNormal();
                }

                void AddP(string text)
                {
                    SetNormal();
                    selection.TypeText(text);
                    selection.TypeParagraph();
                }

                void AddBullet(string boldPrefix, string text)
                {
                    SetNormal();
                    selection.ParagraphFormat.FirstLineIndent = 16.0f;
                    selection.Font.Bold = 1;
                    selection.TypeText("• " + boldPrefix + ": ");
                    selection.Font.Bold = 0;
                    selection.TypeText(text);
                    selection.TypeParagraph();
                    selection.ParagraphFormat.FirstLineIndent = 0;
                }

                void AddCodeBlock(string code)
                {
                    selection.ParagraphFormat.FirstLineIndent = 0;
                    selection.ParagraphFormat.Alignment = 0; // Left
                    selection.ParagraphFormat.LineSpacingRule = 0;
                    selection.ParagraphFormat.SpaceBefore = 3;
                    selection.ParagraphFormat.SpaceAfter = 6;
                    selection.Font.Name = "Consolas";
                    selection.Font.Size = 9.5f;
                    selection.Font.Bold = 0;
                    selection.Font.Color = 0x0F172A;
                    selection.TypeText(code);
                    selection.TypeParagraph();
                    SetNormal();
                }

                void AddPromptBox(string title, string promptContent)
                {
                    selection.ParagraphFormat.FirstLineIndent = 0;
                    selection.ParagraphFormat.Alignment = 0;
                    selection.ParagraphFormat.SpaceBefore = 6;
                    selection.ParagraphFormat.SpaceAfter = 2;
                    selection.Font.Name = "Arial";
                    selection.Font.Size = 11;
                    selection.Font.Bold = 1;
                    selection.Font.Color = 0x2563EB;
                    selection.TypeText("📌 " + title);
                    selection.TypeParagraph();

                    selection.ParagraphFormat.SpaceBefore = 2;
                    selection.ParagraphFormat.SpaceAfter = 10;
                    selection.Font.Name = "Consolas";
                    selection.Font.Size = 9.5f;
                    selection.Font.Bold = 0;
                    selection.Font.Color = 0x0F172A;
                    selection.TypeText(promptContent);
                    selection.TypeParagraph();
                    SetNormal();
                }

                // ========================================================
                // ТИТУЛЬНИЙ БЛОК
                // ========================================================
                SetTitle("ТЕХНІЧНИЙ ОПИС, АНАЛІЗ КОДУ,\nСХЕМИ ТА ПРОМПТИ ПРОЄКТУ «STUDZVIT»");
                SetSubtitle("Комплексна специфікація системи, аналіз бекенду на C# та фронтенду на JS, архітектурні схеми та повний інженерний журнал промптів");

                // ========================================================
                // ЗМІСТ
                // ========================================================
                SetH1("ЗМІСТ");
                AddP("1. Аналіз структури проєкту та коду (Бекенд і Фронтенд)");
                AddP("   1.1. Файлова структура каталогів C# та JavaScript");
                AddP("   1.2. Конфігурація та глобальна обробка винятків (GlobalExceptionMiddleware)");
                AddP("   1.3. Утиліти черг повідомлень RabbitMQ та взаємодія з API");
                AddP("   1.4. Сервіси генерації документів та витягування даних");
                AddP("2. Технічна документація, вимоги та архітектура (Requirements Specification)");
                AddP("   2.1. Загальні відомості про вебресурс");
                AddP("   2.2. Функціональні вимоги до модулів");
                AddP("   2.3. Нормативні параметри оформлення документації");
                AddP("3. Діаграми та схеми алгоритмів (Mermaid / Draw.io)");
                AddP("   3.1. Візуальна схема взаємодії компонентів системи");
                AddP("   3.2. Пояснення логіки та потоків обробки даних");
                AddP("4. Демонстрація роботи вебресурсу в браузері");
                AddP("   4.1. Огляд головної сторінки («Розумний генератор студентської документації!»)");
                AddP("   4.2. Модуль автоматичного нормоконтролю та швидкої перевірки на плагіат/ДТП");
                AddP("   4.3. Генератор титульної сторінки з Live Preview бланка А4");
                AddP("   4.4. Конструктор повного звіту зі вбудованим списком джерел");
                AddP("   4.5. Сховище чернеток (безпечне локальне збереження робіт)");
                AddP("5. Повний журнал інженерних промптів (Prompt Engineering)");
                AddP("   5.1. Збірний Mega-Prompt створення вебресурсу");
                AddP("   5.2. Поетапні промпти: від концепції до кодогенерації");
                AddP("6. Інструкції, стандарти та коментарі до коду");
                selection.InsertBreak(7);

                // ========================================================
                // 1. АНАЛІЗ СТРУКТУРИ ПРОЄКТУ ТА КОДУ
                // ========================================================
                SetH1("1. АНАЛІЗ СТРУКТУРИ ПРОЄКТУ ТА КОДУ (БЕКЕНД І ФРОНТЕНД)");
                AddP("Проєкт «StudZvit» має чіткий поділ на клієнтську та серверну частини, реалізовані мовами C# (.NET 8/10) та JavaScript (ES6+):");

                SetH2("1.1. Файлова структура каталогів C# та JavaScript:");
                AddCodeBlock(
@"StudDoc/
├── backend/                              # C# ASP.NET Core Web API
│   ├── Controllers/
│   │   ├── DocumentController.cs         # API генерації титулок та звітів
│   │   └── ValidationController.cs       # API нормоконтролю та перевірки на плагіат/ДТП
│   ├── Middlewares/
│   │   └── GlobalExceptionMiddleware.cs  # Глобальний обробник неперехоплених винятків
│   ├── Services/
│   │   ├── DocumentGeneratorService.cs   # Формування Word-документів за шаблоном
│   │   ├── NormoControlService.cs        # Валідація типографіки та розрахунок шинглів
│   │   └── RabbitMqService.cs            # Черги повідомлень для асинхронної обробки
│   ├── Program.cs                        # Точка входу, реєстрація DI та Middleware
│   └── DocLab.Backend.csproj             # Файл проекту C# (.NET Core)
├── index.html                            # Семантична розмітка SPA-інтерфейсу (5 вкладок)
├── style.css                             # Стилі інтерфейсу, макет аркуша А4, друк @media print
├── script.js                             # Модульна логіка UI, генерація docx.js, чернетки
├── REQUIREMENTS_SPECIFICATION.md         # Специфікація вимог та архітектури
├── PROMPTS.md                            # Журнал поетапних інженерних промптів
└── diagram_doclab.png                    # Експортована діаграма алгоритму Draw.io");

                SetH2("1.2. Конфігурація та глобальна обробка винятків (GlobalExceptionMiddleware):");
                AddP("Модуль `GlobalExceptionMiddleware` гарантує, що жоден збій чи непередбачена ситуація (наприклад, некоректні символи у тексті, помилка парсингу моделі або таймаут зв'язку) не призведе до аварійної зупинки сервера. Усі помилки перехоплюються централізовано та повертаються клієнту у форматі JSON із відповідним HTTP-кодом (400 Bad Request, 404 Not Found, 500 Internal Server Error) та унікальним `TraceId` для аудиту.");
                AddCodeBlock(
@"// backend/Middlewares/GlobalExceptionMiddleware.cs
public async Task InvokeAsync(HttpContext context)
{
    try
    {
        await _next(context);
    }
    catch (Exception ex)
    {
        _logger.LogError(ex, ""Критична системна помилка: {Message}"", ex.Message);
        await HandleExceptionAsync(context, ex);
    }
}");

                SetH2("1.3. Утиліти черг повідомлень RabbitMQ та взаємодія з API:");
                AddP("Сервіс `RabbitMqService` реалізує взаємодію з брокером черг повідомлень за патерном Publisher-Subscriber. Для об'ємних навчальних робіт (дипломні проєкти, пояснювальні записки з великою кількістю скріншотів) синхронний HTTP-запит може викликати таймаут. `DocumentController.QueueReport` публікує задачу в чергу `document.generation.queue`, повертає клієнту статус HTTP 202 Accepted та ідентифікатор `JobId`, а фоновий воркер споживача черги здійснює рендеринг документа без блокування сервера.");

                SetH2("1.4. Сервіси генерації документів та витягування даних:");
                AddP("Сервіс `DocumentGeneratorService` приймає структуровану модель даних `FullReportModel`, витягує реквізити студента (ПІБ, група ІТ-32, дисципліна, тема), структурує розділи (мета, хід роботи, лістинг програми, висновки, бібліографію) та формує стандартизований потік байтів для завантаження клієнтом.");
                selection.InsertBreak(7);

                // ========================================================
                // 2. ТЕХНІЧНА ДОКУМЕНТАЦІЯ ТА ВИМОГИ
                // ========================================================
                SetH1("2. ТЕХНІЧНА ДОКУМЕНТАЦІЯ, ВИМОГИ ТА АРХІТЕКТУРА (REQUIREMENTS SPECIFICATION)");
                SetH2("2.1. Загальні відомості про вебресурс:");
                AddBullet("Назва платформи", "«StudZvit» (слоган: «Розумний генератор студентської документації!»)");
                AddBullet("Навчальний заклад", "Відокремлений структурний підрозділ «Рівненський кооперативний економіко-правовий фаховий коледж» (ВСП «РКЕПФК»)");
                AddBullet("Відділення та комісія", "Відділення комп'ютерних технологій, Циклова комісія інженерії програмного забезпечення");
                AddBullet("Спеціальність та група", "121 «Інженерія програмного забезпечення», група ІТ-32");
                AddBullet("Керівник / викладач", "Ковальчук В. Б., м. Рівне, 2026 рік");

                SetH2("2.2. Функціональні вимоги до модулів:");
                AddBullet("FR-01 (Титульна сторінка)", "Введення повних реквізитів з миттєвим інтерактивним переглядом (Live Preview бланка А4).");
                AddBullet("FR-02 (Конструктор звіту)", "Покрокове складання звіту: мета, теорія, хід роботи з підтримкою коду (C#, JS, Python), скріншоти, висновки, питання та вбудований список джерел.");
                AddBullet("FR-03 (Автоматичний нормоконтроль)", "Виправлення прямих лапок на кутові «ялинки», дефісів на довгі тире ` — `, подвійних пробілів та апострофів.");
                AddBullet("FR-04 (Швидкий тест на плагіат/ДТП)", "Експрес-розрахунок відсотка дубльованого тексту за алгоритмом шинглів.");
                AddBullet("FR-05 (Експорт у Word)", "Генерація повноцінного бінарного файлу OpenXML (.docx) зі збереженням форматування.");
                AddBullet("FR-06 (Локальні чернетки)", "Збереження звітів у пам'яті браузера (localStorage) з можливістю відкриття у будь-який момент.");

                SetH2("2.3. Нормативні параметри оформлення документації:");
                AddBullet("Поля аркуша А4", "Ліве: 30 мм, праве: 10 мм, верхнє: 20 мм, нижнє: 20 мм.");
                AddBullet("Шрифтова гарнітура", "Times New Roman, 14 pt для тексту, 16 pt напівжирний для розділів, 12 pt для таблиць. Лістинг коду — Consolas 10 pt.");
                AddBullet("Інтервали", "Міжрядковий — рівно 1.5 рядка. Абзацний відступ — рівно 1.25 см. Вирівнювання — по ширині сторінки (Justify).");

                // ========================================================
                // 3. ДІАГРАМИ ТА СХЕМИ АЛГОРИТМІВ
                // ========================================================
                SetH1("3. ДІАГРАМИ ТА СХЕМИ АЛГОРИТМІВ (MERMAID / DRAW.IO)");
                AddP("Для наочного представлення взаємодії компонентів системи створено схему алгоритму функціонування вебресурсу у Mermaid.js та експортовано у графічний формат за допомогою Draw.io:");

                // Вставка малюнка схеми
                string imgFile = @"C:\Users\TechHub\Desktop\StudDoc\diagram_doclab.png";
                if (File.Exists(imgFile))
                {
                    selection.ParagraphFormat.Alignment = 1; // Center
                    dynamic pic = selection.InlineShapes.AddPicture(imgFile);
                    pic.Width = 430;
                    selection.TypeParagraph();

                    selection.Font.Name = "Arial";
                    selection.Font.Size = 10;
                    selection.Font.Italic = 1;
                    selection.Font.Color = 0x64748B;
                    selection.TypeText("Рис. 3.1. Схема функціонального алгоритму взаємодії вебсервісу StudZvit");
                    selection.TypeParagraph();
                    selection.TypeParagraph();
                    SetNormal();
                }

                SetH2("3.1. Пояснення логіки та синтаксис Mermaid.js:");
                AddCodeBlock(
@"flowchart TD
    Start([Початок]) --> Input[1. Введення даних: РКЕПФК, ІТ-32, предмет, тема]
    Input --> Validate{Перевірка валідності}
    Validate -- Некоректно --> Error[Підсвітити поле червоним та показати підказку]
    Error --> Input
    Validate -- Коректно --> LivePreview[2. Оновлення Live Preview бланка А4]
    LivePreview --> TypoCheck[3. Перевірка правил: тире, лапки « », пробіли]
    TypoCheck --> GenerateDocx[4. Клієнтська генерація docx.js / PDF]
    GenerateDocx --> Finish([Готовий файл завантажено на ПК])");
                AddP("Схема чітко показує 4 послідовні фази: 1) введення та валідація вхідних реквізитів; 2) формування бланка А4 у реальному часі; 3) очищення тексту від типографічних дефектів та розрахунок унікальності; 4) створення файлу документа.");
                selection.InsertBreak(7);

                // ========================================================
                // 4. ДЕМОНСТРАЦІЯ РОБОТИ ВЕБРЕСУРСУ В БРАУЗЕРІ
                // ========================================================
                SetH1("4. ДЕМОНСТРАЦІЯ РОБОТИ ВЕБРЕСУРСУ В БРАУЗЕРІ");
                AddP("Вебсервіс StudZvit функціонує як швидкий, автономний SPA-застосунок. Інтерфейс структуровано на 5 логічних вкладок:");

                SetH2("4.1. Головна сторінка:");
                AddP("Зустрічає користувача слоганом «Розумний генератор студентської документації!», банером 100% безкоштовного доступу та 3 основними кнопками дій: перейти до Конструктора звіту, створити Титульну сторінку або запустити Модуль автоматичного нормоконтролю.");

                SetH2("4.2. Модуль автоматичного нормоконтролю та швидкої перевірки на плагіат/ДТП:");
                AddBullet("Блок 1 (Швидкий тест на плагіат/ДТП)", "Користувач вставляє фрагмент тексту та натискає «Розрахувати унікальність». Алгоритм шинглів визначає відсоток оригінальності (наприклад 92%), відсоток дубльованого тексту (ДТП: 8%) та статус («Висока унікальність»).");
                AddBullet("Блок 2 (Нормоконтроль тексту за ДСТУ)", "Текстові поля введення та виправленого результату. В один клік дефіси замінюються на довгі тире ` — `, прямі лапки на «ялинки», видаляються подвійні пробіли.");
                AddBullet("Блок параметрів", "Пам'ятка про обов'язкові академічні норми: поля 30-10-20-20 мм, шрифт Times New Roman 14 pt, 1.5 міжрядковий інтервал.");

                SetH2("4.3. Генератор титульної сторінки:");
                AddP("Форма введення параметрів ліворуч містить попередньо заповнені реквізити коледжу (ВСП «РКЕПФК»), відділення комп'ютерних технологій, циклової комісії, дисципліни, теми та викладача (Ковальчук В. Б.). Праворуч розміщено інтерактивний бланк А4 Live Preview, що миттєво реагує на введення тексту студентом.");

                SetH2("4.4. Конструктор повного звіту:");
                AddP("Містить покроковий акордеон із 8 розділів:");
                AddBullet("Розділи 1-3", "Титулка (синхронізована), Мета роботи, Теоретичні відомості.");
                AddBullet("Розділ 4 (Хід роботи та код)", "Текстовий опис ходу роботи та інтерактивний блок лістингу з кнопками швидкого вибору мови (C#, Python, JS, SQL, HTML/CSS). Шрифт коду — Consolas.");
                AddBullet("Розділи 5-7", "Результати тестування зі скріншотами, Висновки (з можливістю автогенерації за метою), Контрольні запитання.");
                AddBullet("Розділ 8 (Список використаних джерел)", "Вбудований генератор джерел (книги, електронні ресурси за посиланням URL, фахові статті).");
                AddBullet("Чек-лист готовності", "Права бічна панель, яка в режимі реального часу підраховує % заповненості роботи та обсяг сторінок А4.");

                SetH2("4.5. Збережені чернетки:");
                AddP("Розділ, що замінив профіль. Дозволяє зберігати поточну роботу у сховище браузера (localStorage), переглядати картки збережених звітів, відкривати будь-яку чернетку в один клік у Конструкторі або експортувати файл резервної копії .json.");
                selection.InsertBreak(7);

                // ========================================================
                // 5. ПОВНИЙ ЖУРНАЛ ІНЖЕНЕРНИХ ПРОМПТІВ
                // ========================================================
                SetH1("5. ПОВНИЙ ЖУРНАЛ ІНЖЕНЕРНИХ ПРОМПТІВ (PROMPT ENGINEERING)");
                AddP("Нижче наведено як загальний збірний Mega-Prompt, так і поетапний журнал 4 фаз проектування, за якими здійснювалася побудова сайту та коду:");

                AddPromptBox("ЗБІРНИЙ MEGA-PROMPT ДЛЯ СТВОРЕННЯ СИСТЕМИ З НУЛЯ:",
@"Дій як старший Software Engineer та методист коледжу. 
Створи вебсервіс 'StudZvit' зі слоганом 'Розумний генератор студентської документації!'.

1. НАВІГАЦІЯ:
Шапка: логотип 'SZ StudZvit', стрілочки історії навігації [←] [→], 5 вкладок:
'Головна', 'Титульна сторінка', 'Конструктор звіту', 'Модуль автоматичного нормоконтролю', 'Збережені чернетки'.
Кнопки: 'Підтримати', 'Зразок', 'Мої чернетки'.
Видали окремі вкладки 'Список джерел' та 'Схеми/промпти'.

2. ВМІСТ СТОРІНОК:
- Головна: заголовок StudZvit, слоган, кнопки переходу, картки можливостей.
- Титульна: форма реквізитів ВСП «РКЕПФК» (гр. ІТ-32, Ковальчук В. Б.) + Live Preview бланка А4.
- Конструктор звіту: 8 секцій акордеона (Титулка, Мета, Теорія, Хід роботи з кодом C#/Python/JS, Результати, Висновки, Питання, Список використаних джерел). Чек-лист готовності. Експорт у Word (.docx).
- Модуль автоматичного нормоконтролю: Блок 1 (Швидкий тест на плагіат/ДТП за шинглами), Блок 2 (Нормоконтроль тексту за ДСТУ: лапки « », тире, пробіли), плашки стандартів (30-10-20-20 мм, 14 pt, 1.5).
- Збережені чернетки: картки робіт з localStorage з кнопками [Відкрити в конструкторі] та [Видалити].

3. АРХІТЕКТУРА:
- Бекенд C# ASP.NET Core: DocumentController, ValidationController, NormoControlService, RabbitMqService, GlobalExceptionMiddleware.
- Фронтенд: семантичний HTML5, CSS3, чистий модульний JS без спагетті-коду.");

                AddPromptBox("ПРОМПТ 1 (ІДЕЯ):",
@"Сформулюй концепцію сервісу StudZvit для студентів гр. ІТ-32 РКЕПФК:
об'єднання титулки та звіту в один конструктор, Live Preview бланка А4 за ДСТУ (30-10-20-20 мм),
виправлення типографіки та експорт у повноцінний Word (.docx).");

                AddPromptBox("ПРОМПТ 2 (ВИМОГИ ТА СТРУКТУРА):",
@"Склади специфікацію вимог: реквізити ВСП «РКЕПФК», відділення комп'ютерних технологій,
циклова комісія інженерії ПЗ, покрокові розділи звіту, вбудована бібліографія,
100% Client-Side безпека персональних даних студента.");

                AddPromptBox("ПРОМПТ 3 (СХЕМА АЛГОРИТМУ MERMAID):",
@"Побудуй схему алгоритму взаємодії у Mermaid.js:
Введення даних -> Валідація -> Оновлення бланка А4 -> Нормоконтроль -> Розрахунок ДТП -> Генерація Word.");

                AddPromptBox("ПРОМПТ 4 (КОДОГЕНЕРАЦІЯ):",
@"Створи чистий код:
1. index.html (5 узгоджених розділів);
2. script.js (модульна навігація, клієнтський алгоритм шинглів, чернетки localStorage, експорт Word);
3. C# ASP.NET Core: контролери, черги RabbitMQ, глобальний обробник винятків.");

                // ========================================================
                // 6. ІНСТРУКЦІЇ ТА СТАНДАРТИ
                // ========================================================
                SetH1("6. ІНСТРУКЦІЇ, СТАНДАРТИ ТА КОМЕНТАРІ ДО КОДУ");
                AddP("Під час огляду коду викладач звертав увагу на наступні принципові інженерні моменти:");
                AddBullet("Обробка винятків", "Вся бізнес-логіка захищена централізованим middleware. Неприпустимо повертати клієнту необроблений HTML-стектрейс.");
                AddBullet("Асинхронність та черги", "Важкі задачі створення документів передаються в чергу RabbitMQ, що гарантує високу доступність системи під піковим навантаженням під час сесії.");
                AddBullet("Точність стилів Word", "Генерований документ має строго визначені розміри полів у твіпах/пунктах (ліве 85.04 pt = 30 мм, праве 28.35 pt = 10 мм, верхнє/нижнє 56.69 pt = 20 мм), міжрядковий інтервал 1.5 рядка та абзац 1.25 см.");
                AddBullet("Уніфікація назв", "У всіх формах та бланках використовується виключно назва навчального закладу: ВСП «Рівненський кооперативний економіко-правовий фаховий коледж», відділення комп'ютерних технологій та циклова комісія інженерії ПЗ.");

                // Збереження файлів
                string path1 = @"C:\Users\TechHub\OneDrive\Desktop\Технічна_Документація_та_Промпти_StudDoc.docx";
                string path2 = @"C:\Users\TechHub\OneDrive\Desktop\Структура_Схеми_та_Промпти_StudZvit.docx";
                string path3 = @"C:\Users\TechHub\Desktop\StudDoc\Технічна_Документація_та_Промпти_StudDoc.docx";

                doc.SaveAs(path1);
                doc.SaveAs(path2);
                doc.SaveAs(path3);

                Console.WriteLine($"Успішно згенеровано: {path1}");
                Console.WriteLine($"Успішно згенеровано: {path2}");
                Console.WriteLine($"Копію збережено в проекті: {path3}");

                doc.Close();
            }
            finally
            {
                word.Quit();
                System.Runtime.InteropServices.Marshal.ReleaseComObject(word);
            }
        }
    }
}
