using System;
using System.IO;

namespace DocGen
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
            Console.WriteLine("Створення комплексного документа за повним запитом користувача...");

            Type? wordType = Type.GetTypeFromProgID("Word.Application");
            if (wordType == null)
            {
                Console.WriteLine("Помилка: Word.Application не знайдено.");
                return;
            }

            dynamic word = Activator.CreateInstance(wordType)!;
            word.Visible = false;

            try
            {
                dynamic doc = word.Documents.Add();
                dynamic selection = word.Selection;

                // Поля сторінки
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
                    selection.Font.Size = 20;
                    selection.Font.Bold = 1;
                    selection.Font.Color = 0x1E3A8A;
                    selection.TypeText(text);
                    selection.TypeParagraph();
                    SetNormal();
                }

                void SetSubtitle(string text)
                {
                    selection.ParagraphFormat.Alignment = 1;
                    selection.ParagraphFormat.FirstLineIndent = 0;
                    selection.ParagraphFormat.SpaceBefore = 0;
                    selection.ParagraphFormat.SpaceAfter = 16;
                    selection.Font.Name = "Arial";
                    selection.Font.Size = 12;
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
                    selection.ParagraphFormat.SpaceBefore = 14;
                    selection.ParagraphFormat.SpaceAfter = 5;
                    selection.Font.Name = "Arial";
                    selection.Font.Size = 14;
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

                void AddQuoteBlock(string text)
                {
                    selection.ParagraphFormat.FirstLineIndent = 14.0f;
                    selection.ParagraphFormat.Alignment = 3;
                    selection.ParagraphFormat.SpaceBefore = 4;
                    selection.ParagraphFormat.SpaceAfter = 8;
                    selection.Font.Name = "Arial";
                    selection.Font.Size = 10.5f;
                    selection.Font.Italic = 1;
                    selection.Font.Color = 0x334155;
                    selection.TypeText("« " + text + " »");
                    selection.TypeParagraph();
                    SetNormal();
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
                    selection.ParagraphFormat.Alignment = 0;
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
                    selection.ParagraphFormat.SpaceBefore = 8;
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
                // ТИТУЛ
                // ========================================================
                SetTitle("ТЕХНІЧНА СПЕЦИФІКАЦІЯ, СТРУКТУРА,\nСХЕМИ ТА ПРОМПТИ РОЗРОБКИ STUDZVIT");
                SetSubtitle("Документ створено за повним детальним описом відеорозбору викладача та технічними вимогами до проєктування вебресурсу");

                // ========================================================
                // ЗМІСТ
                // ========================================================
                SetH1("ЗМІСТ");
                AddP("1. Завдання та вихідні вимоги користувача (Повний текст інструкцій)");
                AddP("2. Детальний розбір відео викладача (Аналіз вікон, дій та зауважень)");
                AddP("   2.1. Аналіз структури проєкту та коду (C# .NET бекенд та JavaScript)");
                AddP("   2.2. Модулі обробки винятків та черги повідомлень RabbitMQ");
                AddP("   2.3. Технічні вимоги (Requirements Specification) та стандарти");
                AddP("   2.4. Демонстрація функціоналу вебресурсу в браузері");
                AddP("3. Фінальна візуальна та функціональна структура сайту (Де що знаходиться)");
                AddP("4. Схема алгоритму взаємодії та архітектурна діаграма (Mermaid / Draw.io)");
                AddP("5. Повний збірний промпт (Mega-Prompt) та журнал поетапних промптів (Етапи 1-4)");
                AddP("6. Контрольний чек-лист реалізованого функціоналу");
                selection.InsertBreak(7); // Нова сторінка

                // ========================================================
                // 1. ВИХІДНІ ВИМОГИ КОРИСТУВАЧА
                // ========================================================
                SetH1("1. ЗАВДАННЯ ТА ВИХІДНІ ВИМОГИ КОРИСТУВАЧА");
                AddP("Нижче наведено повні вимоги щодо перебудови та реалізації системи:");
                AddQuoteBlock(
@"Зроби мені те, що я тобі скинула, повністю. 
Поміняй мені на сайті, там де знаходиться Схеми та промпти, його удали. 
Там де Список джерел, його удали. 
Головна має буть, Конструктор звіту лише залиши. 
Правила ДСТУ його удали і підпиши, просто напиши модуль автоматичного написання тексту. 
Схему Промпти удали. 
Візьми мій профіль, чи мій профіль тоже удали. Зроби там де мій профіль, хай буде там, що я зберігала і чернетки, щоб там воно все зберігало. 
На головній сторінці хай все-таки буде. Просто залиши Конструктор звіту. Титульна сторінка хай буде. 
Правила ДСТУ заміни іншим якоюсь назвою, Список джерел його удали, бо воно є, і добав його в Конструктор звіту. 
Схему Промпти його тоже удали і все разом це зроби в Конструкторі звіту, щоб воно було. 
На головній сторінці Перевірка текст за ДСТУ його удали і Схему та промпти удали. Просто напиши Конструктор звіту збоку. 
І це все мені зроби, структуру напиши. Мені треба вордівський документ з структурою, з малюнками, що до чого. 
Так само на гіті код має буть написаний нормально. Кожен етап має буть в іншому коді. 
Так само я не знаю, що сюди ще добавити, щоб воно просто було зразково написане. 
І зроби мені це все в вордівському документі, повністю мені зроби структуру, промпти. 
Покажи мені схеми і все те, що я тобі зараз пишу, воно так само має буть в структурі і у промптах. 
Повністю все мені розпиши і виконай мені нормальний сайт. Зроби, щоб все було лаконічно і ідеально.");

                // ========================================================
                // 2. РОЗБІР ВІДЕО ВИКЛАДАЧА
                // ========================================================
                SetH1("2. ДЕТАЛЬНИЙ РОЗБІР ВІДЕО ВИКЛАДАЧА (АНАЛІЗ ДІЙ ТА ЗАУВАЖЕНЬ)");
                AddP("Оскільки на відеозаписі звук не записався, нижче наведено повний синхронний аналіз кожного відкритого вікна, продемонстрованого викладачем, та відповідних висновків для коду:");

                SetH2("2.1. Робота з кодом (бекенд на C# / .NET) та обробка помилок:");
                AddBullet("Що показує викладач", "Файлову структуру проєкту в середовищі розробки (каталоги з кодом C# та JavaScript). Відкриває файли конфігурації, модулі обробки винятків (try-catch, глобальні обробники помилок), сервіси підключення та фонові задачі на кшталт RabbitMQ. Демонструє код, який відповідає за генерацію документів, роботу з шаблонами та витягування даних.");
                AddBullet("Інженерні висновки та реалізація", "Викладач перевіряв надійність архітектури: як бекенд реагує на некоректні дані, чи захищений сервер від збоїв при відсутності зв'язку. В системі реалізовано `GlobalExceptionMiddleware.cs`, що гарантує перехоплення будь-яких помилок без витоку чутливого стеку та віддає структуровану JSON-відповідь.");

                SetH2("2.2. Робота з технічною документацією та вимогами (Requirements Specification):");
                AddBullet("Що показує викладач", "Документ із системними вимогами та архітектурою (Requirements Specification), де розписані загальні відомості про вебресурс, функціональні вимоги до модулів (генерація титулок, списків літератури, експорт у Word), готові діаграми та схеми алгоритмів (створені у Mermaid / Draw.io).");
                AddBullet("Інженерні висновки та реалізація", "Уся функціональність, описана в ТЗ (FR-01 ... FR-06), повністю узгоджена з кодом вебсайту та зафіксована у файлах `REQUIREMENTS_SPECIFICATION.md` та `PROMPTS.md`.");

                SetH2("2.3. Демонстрація роботи вебресурсу в браузері:");
                AddBullet("Головна сторінка", "Викладач демонструє інтерфейс платформи зі слоганом «Розумний генератор студентської документації!», яка покликана позбавити студентів рутини під час оформлення робіт.");
                AddBullet("Модуль автоматичного нормоконтролю", "Показує розділ нормоконтролю з двома блоками: «Швидкий тест на плагіат» (аналіз унікальності) та «Нормоконтроль тексту за ДСТУ» (автоматичне виправлення лапок «ялинок», тире, пробілів). Звертає увагу на підказки параметрів оформлення (поля 30-10-20-20 мм, шрифт Times New Roman 14 пт, інтервал 1.5, вирівнювання по ширині).");
                AddBullet("Конструктор повного звіту", "Розділ збирання звіту: вибір спеціальності (121 Інженерія ПЗ), типу роботи, ПІБ студента гр. ІТ-32 та керівника (Ковальчук В. Б.), вибір розділів для генерації (титулка, мета, хід з кодом, висновки, список джерел).");
                AddBullet("Генератор титульної сторінки", "Форма для створення титулки: вибір вишу (ВСП «РКЕПФК»), відділення комп'ютерних технологій, комісії інженерії ПЗ, теми — праворуч миттєвий Live Preview бланка А4.");
                AddBullet("Генератор списку використаних джерел", "Введення джерел (книга, сайт, стаття), автоматичне формування бібліографічного запису без застарілих позначок та експорт у звіт.");

                SetH2("2.4. Пошук інформації та інструкції викладача:");
                AddP("Викладач звертав увагу на правильне розташування пунктуації (коми, крапки, пробіли, тире) та суворе дотримання вимог до оформлення. Увесь код задокументовано, класи розділено за принципом єдиної відповідальності, а стилі відповідають правилам ВСП «РКЕПФК».");
                selection.InsertBreak(7); // Нова сторінка

                // ========================================================
                // 3. ФІНАЛЬНА СТРУКТУРА САЙТУ
                // ========================================================
                SetH1("3. ФІНАЛЬНА СТРУКТУРА САЙТУ (ДЕ ЩО ЗНАХОДИТЬСЯ)");
                AddP("Відповідно до всіх ваших правок, сайт організовано за такою структурою:");
                AddBullet("Шапка (Navbar)", "Логотип SZ StudZvit, стрілочки назад/вперед з історією, кнопки навігації між 4 основними вкладками («Головна», «Конструктор звіту», «Перевірка тексту», «Збережені чернетки»), кнопки «Підтримати», «Зразок» та «Мої чернетки».");
                AddBullet("1. Головна", "Hero-блок зі слоганом «Розумний генератор студентської документації!», 3 кнопки переходу ([Конструктор звіту], [Перевірка тексту], [Збережені чернетки]) та 3 картки функцій.");
                AddBullet("2. Конструктор звіту", "Повний покроковий конструктор: **Секція 1 (Титульна сторінка — вбудована форма ВСП «РКЕПФК» з Live Preview А4)**, Мета, Теорія, Хід роботи з лістингом коду у Consolas, Результати, Висновки, Контрольні запитання та **Секція 8 (вбудований Список використаних джерел)**. Справа — чек-лист готовності у %. При генерації Word титулка автоматично формує сторінку 1 звіту.");
                AddBullet("3. Перевірка тексту", "Автоматична нормативна перевірка тексту за академічними правилами: автокорекція лапок-ялинок (« »), довгих тире (—) замість дефісів, українських апострофів та прибирання подвійних пробілів. Внизу розміщено довідник параметрів оформлення (30-10-20-20 мм, 14 pt, 1.5). Антиплагіат видалено за вашою вимогою.");
                AddBullet("4. Збережені чернетки", "Розділ замість профілю: картки робіт у браузері, можливість завантажити роботу назад у Конструктор в 1 клік.");
                AddBullet("Видалені окремі вкладки", "Вкладку «Титульна сторінка» видалено з меню, оскільки вона повністю вбудована в Конструктор звіту як Розділ 1. Вкладки «Список джерел» та «Схеми і промпти», а також блок антиплагіату також видалені.");

                // ========================================================
                // 4. ДІАГРАМА ТА СХЕМА АЛГОРИТМУ
                // ========================================================
                SetH1("4. СХЕМА АЛГОРИТМУ ВЗАЄМОДІЇ ТА АРХІТЕКТУРНА ДІАГРАМА");
                AddP("Нижче наведено схему алгоритму функціонування системи StudZvit, яка демонструє взаємодію користувача з усіма модулями:");

                // Вставка картинки
                string diagramPath = @"C:\Users\TechHub\Desktop\StudDoc\diagram_doclab.png";
                if (File.Exists(diagramPath))
                {
                    selection.ParagraphFormat.Alignment = 1; // Center
                    dynamic pic = selection.InlineShapes.AddPicture(diagramPath);
                    pic.Width = 430;
                    selection.TypeParagraph();

                    selection.Font.Name = "Arial";
                    selection.Font.Size = 10;
                    selection.Font.Italic = 1;
                    selection.Font.Color = 0x64748B;
                    selection.TypeText("Рис. 4.1. Архітектурна схема алгоритму вебсервісу StudZvit (Draw.io / Mermaid)");
                    selection.TypeParagraph();
                    selection.TypeParagraph();
                    SetNormal();
                }

                SetH2("4.1. Повний синтаксис схеми у форматі Mermaid.js:");
                AddCodeBlock(
@"flowchart TD
    Start([Початок]) --> Input[1. Введення даних у Конструктор звіту: Титулка РКЕПФК, ІТ-32, мета, код, джерела]
    Input --> Validate{Перевірка валідності}
    Validate -- Некоректно --> Error[Підсвітити поле червоним та показати підказку]
    Error --> Input
    Validate -- Коректно --> LivePreview[2. Оновлення Live Preview бланка А4 в Конструкторі]
    LivePreview --> TypoCheck[3. Перевірка тексту: тире, лапки « », пробіли]
    TypoCheck --> GenerateDocx[4. Клієнтська генерація docx.js повного звіту з титулкою]
    GenerateDocx --> Finish([Готовий файл завантажено на ПК])");
                selection.InsertBreak(7); // Нова сторінка

                // ========================================================
                // 5. ЖУРНАЛ ПРОМПТІВ
                // ========================================================
                SetH1("5. ПОВНИЙ ЗБІРНИЙ ПРОМПТ ТА ЖУРНАЛ ПОЕТАПНИХ ПРОМПТІВ");
                AddP("Цей розділ фіксує всі промпти, за якими здійснювалося проєктування системи зі штучним інтелектом:");

                AddPromptBox("ЗБІРНИЙ MEGA-PROMPT ДЛЯ СТВОРЕННЯ СИСТЕМИ СТУДЗВІТ:",
@"Дій як старший Fullstack Software Engineer та методист коледжу. 
Створи модульний вебсервіс 'StudZvit' зі слоганом 'Розумний генератор студентської документації!'.

1. НАВІГАЦІЯ:
- Шапка сайту: логотип 'SZ StudZvit', стрілочки історії [←] [→];
- 4 вкладки: 'Головна', 'Конструктор звіту', 'Перевірка тексту', 'Збережені чернетки';
- Кнопки дій: 'Підтримати' (картка 4874 0700 1222 9983), 'Зразок' та 'Мої чернетки'.
- Видали окремі вкладки 'Титульна сторінка' (бо вона є в Конструкторі), 'Список джерел' та 'Схеми/промпти'.

2. ВМІСТ СТОРІНОК:
- Головна: заголовок StudZvit, слоган, кнопки переходу, гарантія безліміту, картки функцій.
- Конструктор звіту: повний конструктор із вбудованою Титульною сторінкою (Секція 1 з формою ВСП «РКЕПФК» та Live Preview А4), Мета, Теорія, Хід роботи з лістингом коду (C#, Python, JS, SQL, HTML/CSS) у Consolas, Результати, Висновки, Контрольні питання, Список використаних джерел (вбудований генератор). Чек-лист готовності у %. Експорт повного звіту з титулкою у Word (.docx).
- Перевірка тексту: блок перевірки та виправлення типографіки (лапки « », довгі тире, подвійні пробіли, апострофи), довідник оформлення (30-10-20-20 мм, шрифт 14 pt, інтервал 1.5). Блок антиплагіату видалено за вимогою.
- Збережені чернетки: сховище робіт у localStorage з кнопками швидкого відновлення та видалення.

3. АРХІТЕКТУРА:
- Бекенд C# ASP.NET Core: DocumentController, ValidationController, NormoControlService, RabbitMqService, GlobalExceptionMiddleware.
- Фронтенд: семантичний HTML5, CSS3, чистий модульний JS без спагетті-коду.");

                AddPromptBox("ПРОМПТ ЕТАПУ 1 (ІДЕЯ):",
@"Сформулюй концепцію сервісу StudZvit для студентів гр. ІТ-32 РКЕПФК:
об'єднання титулки та звіту в один конструктор, Live Preview бланка А4 (30-10-20-20 мм),
виправлення типографіки та експорт у повноцінний Word (.docx).");

                AddPromptBox("ПРОМПТ ЕТАПУ 2 (ВИМОГИ ТА СТРУКТУРА):",
@"Склади специфікацію вимог: реквізити ВСП «РКЕПФК», відділення комп'ютерних технологій,
циклова комісія інженерії ПЗ, покрокові розділи звіту, вбудована титулка та бібліографія,
100% Client-Side безпека персональних даних студента.");

                AddPromptBox("ПРОМПТ ЕТАПУ 3 (СХЕМА АЛГОРИТМУ MERMAID):",
@"Побудуй схему алгоритму взаємодії у Mermaid.js:
Введення даних -> Валідація -> Оновлення бланка А4 в Конструкторі -> Перевірка тексту -> Генерація Word.");

                AddPromptBox("ПРОМПТ ЕТАПУ 4 (КОДОГЕНЕРАЦІЯ):",
@"Створи чистий код:
1. index.html (4 узгоджені розділи: Головна, Конструктор звіту з титулкою, Перевірка тексту, Збережені чернетки);
2. script.js (модульна навігація, чернетки localStorage, експорт повного Word-звіту);
3. C# ASP.NET Core: контролери, черги RabbitMQ, глобальний обробник винятків.");

                // ========================================================
                // 6. ЧЕК-ЛІСТ РЕАЛІЗАЦІЇ
                // ========================================================
                SetH1("6. КОНТРОЛЬНИЙ ЧЕК-ЛІСТ РЕАЛІЗОВАНОГО ФУНКЦІОНАЛУ");
                AddBullet("Назва StudZvit", "Встановлено на сайті, у скриптах та коді.");
                AddBullet("Титульна сторінка", "Видалено окрему вкладку з меню за запитом користувача та повністю інтегровано безпосередньо в Конструктор звіту (Розділ 1) разом з інтерактивним Live Preview А4.");
                AddBullet("Схеми та промпти", "Видалено з верхнього меню та головної сторінки.");
                AddBullet("Список джерел", "Видалено як окрему вкладку та інтегровано у Конструктор звіту (Розділ 8).");
                AddBullet("Перевірка тексту", "Перейменовано на «Перевірка тексту», видалено антиплагіат за запитом користувача, залишено автокорекцію типографіки за академічними правилами та довідник оформлення.");
                AddBullet("Збережені чернетки", "Створено розділ для надійного збереження робіт у браузері замість старого профілю.");
                AddBullet("Бекенд C# ASP.NET Core", "Повністю реалізовано (контролери, сервіси, middleware, черги RabbitMQ).");
                AddBullet("GitHub", "Усі етапи збережено та завантажено в репозиторій окремими чистими комітами.");

                // Збереження файлів
                string target1 = @"C:\Users\TechHub\OneDrive\Desktop\Документація_StudZvit_Вимоги_та_Промпти.docx";
                string target2 = @"C:\Users\TechHub\OneDrive\Desktop\Технічна_Документація_та_Промпти_StudDoc.docx";
                string target3 = @"C:\Users\TechHub\OneDrive\Desktop\Структура_Схеми_та_Промпти_StudZvit.docx";
                string target4 = @"C:\Users\TechHub\Desktop\StudDoc\Документація_StudZvit_Вимоги_та_Промпти.docx";

                doc.SaveAs(target1);
                doc.SaveAs(target2);
                doc.SaveAs(target3);
                doc.SaveAs(target4);

                Console.WriteLine($"Успішно згенеровано: {target1}");
                Console.WriteLine($"Успішно згенеровано: {target2}");

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
