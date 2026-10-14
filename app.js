// ============================================================
// StudDoc — Веб-сервіс автоматизованого формування
// студентської звітної документації
// ============================================================

// Лічильники для статистики
let лічильникДокументів = parseInt(localStorage.getItem("studdoc_docs") || "0");
let лічильникЗбережень = parseInt(localStorage.getItem("studdoc_saves") || "0");

// Масив контрольних запитань
let контрольніЗапитання = [];

// ============================================================
// 1. НАВІГАЦІЯ МІЖ СТОРІНКАМИ
// ============================================================

function перейтиДо(ідСторінки) {
    // Ховаємо всі сторінки
    document.querySelectorAll(".page").forEach(function(el) {
        el.style.display = "none";
    });

    // Показуємо потрібну
    var сторінка = document.getElementById(ідСторінки);
    if (сторінка) {
        сторінка.style.display = "block";
    }

    // Оновлюємо активну кнопку в навігації
    document.querySelectorAll(".nav-btn").forEach(function(btn) {
        btn.classList.remove("active");
        if (btn.getAttribute("data-page") === ідСторінки) {
            btn.classList.add("active");
        }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ============================================================
// 2. ПРОФІЛЬ КОРИСТУВАЧА (LocalStorage)
// ============================================================

function завантажитиПрофіль() {
    var профіль = localStorage.getItem("studdoc_profile");
    if (!профіль) return;

    try {
        var дані = JSON.parse(профіль);
        // Заповнюємо поля генератора
        if (дані.піб) document.getElementById("студент-піб").value = дані.піб;
        if (дані.група) document.getElementById("група").value = дані.група;
        if (дані.курс) document.getElementById("курс").value = дані.курс;
        if (дані.заклад) document.getElementById("заклад").value = дані.заклад;
        if (дані.спеціальність) document.getElementById("спеціальність").value = дані.спеціальність;

        // Заповнюємо модальне вікно
        if (дані.піб) document.getElementById("проф-піб").value = дані.піб;
        if (дані.група) document.getElementById("проф-група").value = дані.група;
        if (дані.курс) document.getElementById("проф-курс").value = дані.курс;
        if (дані.заклад) document.getElementById("проф-заклад").value = дані.заклад;
        if (дані.спеціальність) document.getElementById("проф-спец").value = дані.спеціальність;
    } catch (e) {
        // Якщо дані пошкоджені, ігноруємо
    }
}

function зберегтиПрофіль() {
    var дані = {
        піб: document.getElementById("проф-піб").value.trim() || document.getElementById("студент-піб").value.trim(),
        група: document.getElementById("проф-група").value.trim() || document.getElementById("група").value.trim(),
        курс: document.getElementById("проф-курс").value.trim() || document.getElementById("курс").value.trim(),
        заклад: document.getElementById("проф-заклад").value.trim() || document.getElementById("заклад").value.trim(),
        спеціальність: document.getElementById("проф-спец").value.trim() || document.getElementById("спеціальність").value.trim()
    };

    localStorage.setItem("studdoc_profile", JSON.stringify(дані));
    збільшитиЛічильник("saves");
    закритиНалаштування();

    // Оновлюємо поля генератора зі збережених даних
    завантажитиПрофіль();
    оновитиПрев();

    alert("Профіль збережено!");
}

function відкритиНалаштування() {
    document.getElementById("модальне-налаштування").style.display = "flex";
}

function закритиНалаштування() {
    document.getElementById("модальне-налаштування").style.display = "none";
}

// ============================================================
// 3. ПОПЕРЕДНІЙ ПЕРЕГЛЯД ТИТУЛЬНОЇ СТОРІНКИ
// ============================================================

function оновитиПрев() {
    var тип = document.getElementById("тип-роботи").value;
    var номер = document.getElementById("номер-роботи").value.trim();
    var варіант = document.getElementById("варіант").value.trim();
    var дисципліна = document.getElementById("дисципліна").value.trim();
    var тема = document.getElementById("тема-роботи").value.trim();
    var заклад = document.getElementById("заклад").value.trim();
    var студент = document.getElementById("студент-піб").value.trim();
    var група = document.getElementById("група").value.trim();
    var спеціальність = document.getElementById("спеціальність").value.trim();
    var курс = document.getElementById("курс").value.trim();
    var викладач = document.getElementById("викладач-піб").value.trim();
    var рік = document.getElementById("рік").value.trim();

    // Заклад
    document.getElementById("прев-заклад").textContent = заклад || "Навчальний заклад";

    // Тип та номер
    document.getElementById("прев-тип").textContent = тип.toUpperCase();
    document.getElementById("прев-номер").textContent = номер ? ("№ " + номер) : "";

    // Дисципліна та тема
    document.getElementById("прев-дисципліна").textContent = дисципліна ? ("з дисципліни «" + дисципліна + "»") : "";
    document.getElementById("прев-тема").textContent = тема ? ("Тема: " + тема) : "";

    // Варіант
    document.getElementById("прев-варіант").textContent = варіант ? ("Варіант " + варіант) : "";

    // Інформація про студента
    var рядокСтудента = студент ? ("Виконав(ла): " + студент) : "Виконав(ла):";
    document.getElementById("прев-студент").textContent = рядокСтудента;

    var рядокГрупи = "";
    if (група) рядокГрупи += "група " + група;
    if (курс) рядокГрупи += ", " + курс + " курс";
    document.getElementById("прев-група").textContent = рядокГрупи;

    document.getElementById("прев-спец").textContent = спеціальність ? ("спец. " + спеціальність) : "";

    // Викладач
    document.getElementById("прев-викладач").textContent = викладач ? ("Перевірив(ла): " + викладач) : "";

    // Місто та рік
    document.getElementById("прев-рік").textContent = рік || new Date().getFullYear();
}

// ============================================================
// 4. ГЕНЕРАЦІЯ ДОКУМЕНТА WORD (.DOCX) — ТИТУЛЬНА СТОРІНКА
// ============================================================

function завантажитиТитулку() {
    var тип = document.getElementById("тип-роботи").value;
    var номер = document.getElementById("номер-роботи").value.trim();
    var варіант = document.getElementById("варіант").value.trim();
    var дисципліна = document.getElementById("дисципліна").value.trim();
    var тема = document.getElementById("тема-роботи").value.trim();
    var заклад = document.getElementById("заклад").value.trim();
    var студент = document.getElementById("студент-піб").value.trim();
    var група = document.getElementById("група").value.trim();
    var спеціальність = document.getElementById("спеціальність").value.trim();
    var курс = document.getElementById("курс").value.trim();
    var викладач = document.getElementById("викладач-піб").value.trim();
    var рік = document.getElementById("рік").value.trim() || String(new Date().getFullYear());

    // Перевірка обов'язкових полів
    if (!дисципліна || !студент) {
        alert("Будь ласка, заповніть принаймні дисципліну та ПІБ студента.");
        return;
    }

    // Бібліотека docx
    var D = window.docx;

    // Стиль тексту: Times New Roman 14pt
    var шрифтОсновний = { font: "Times New Roman", size: 28 }; // 28 = 14pt * 2
    var шрифтЗаголовок = { font: "Times New Roman", size: 32, bold: true }; // 16pt
    var шрифтМалий = { font: "Times New Roman", size: 24 }; // 12pt

    // Збираємо абзаци титулки
    var абзаци = [];

    // Заклад (вгорі по центру)
    if (заклад) {
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: заклад.toUpperCase(), ...шрифтОсновний })],
            alignment: D.AlignmentType.CENTER,
            spacing: { after: 200 }
        }));
    }

    // Відступи зверху (щоб тип роботи був по центру сторінки)
    for (var i = 0; i < 8; i++) {
        абзаци.push(new D.Paragraph({ children: [], spacing: { after: 200 } }));
    }

    // Тип роботи
    var текстТипу = тип.toUpperCase();
    if (номер) текстТипу += " № " + номер;
    абзаци.push(new D.Paragraph({
        children: [new D.TextRun({ text: текстТипу, ...шрифтЗаголовок })],
        alignment: D.AlignmentType.CENTER,
        spacing: { after: 100 }
    }));

    // Дисципліна
    if (дисципліна) {
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: "з дисципліни «" + дисципліна + "»", ...шрифтОсновний })],
            alignment: D.AlignmentType.CENTER,
            spacing: { after: 100 }
        }));
    }

    // Тема
    if (тема) {
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: "Тема: " + тема, ...шрифтОсновний, bold: true, italics: true })],
            alignment: D.AlignmentType.CENTER,
            spacing: { after: 100 }
        }));
    }

    // Варіант
    if (варіант) {
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: "Варіант " + варіант, ...шрифтОсновний })],
            alignment: D.AlignmentType.CENTER,
            spacing: { after: 200 }
        }));
    }

    // Відступи перед блоком студента
    for (var j = 0; j < 5; j++) {
        абзаци.push(new D.Paragraph({ children: [], spacing: { after: 200 } }));
    }

    // Студент (праворуч)
    абзаци.push(new D.Paragraph({
        children: [new D.TextRun({ text: "Виконав(ла): " + студент, ...шрифтОсновний })],
        alignment: D.AlignmentType.RIGHT,
        spacing: { after: 60 }
    }));

    var рядокГрупи = "";
    if (група) рядокГрупи += "група " + група;
    if (курс) рядокГрупи += ", " + курс + " курс";
    if (рядокГрупи) {
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: рядокГрупи, ...шрифтОсновний })],
            alignment: D.AlignmentType.RIGHT,
            spacing: { after: 60 }
        }));
    }

    if (спеціальність) {
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: "спец. " + спеціальність, ...шрифтМалий })],
            alignment: D.AlignmentType.RIGHT,
            spacing: { after: 100 }
        }));
    }

    // Викладач
    if (викладач) {
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: "Перевірив(ла): " + викладач, ...шрифтОсновний })],
            alignment: D.AlignmentType.RIGHT,
            spacing: { after: 200 }
        }));
    }

    // Відступи перед містом
    for (var k = 0; k < 4; k++) {
        абзаци.push(new D.Paragraph({ children: [], spacing: { after: 200 } }));
    }

    // Місто та рік (внизу)
    абзаци.push(new D.Paragraph({
        children: [new D.TextRun({ text: "Рівне — " + рік, ...шрифтОсновний })],
        alignment: D.AlignmentType.CENTER
    }));

    // Створюємо документ із правильними полями
    var doc = new D.Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: D.convertMillimetersToTwip(20),
                        bottom: D.convertMillimetersToTwip(20),
                        left: D.convertMillimetersToTwip(30),
                        right: D.convertMillimetersToTwip(10)
                    }
                }
            },
            children: абзаци
        }]
    });

    // Зберігаємо файл
    D.Packer.toBlob(doc).then(function(blob) {
        var назваФайлу = "Титульна_" + тип.replace(/ /g, "_");
        if (номер) назваФайлу += "_" + номер;
        назваФайлу += ".docx";
        saveAs(blob, назваФайлу);
        збільшитиЛічильник("docs");
        alert("Документ збережено: " + назваФайлу);
    });
}

// ============================================================
// 5. ГЕНЕРАЦІЯ ЗВІТУ (.DOCX)
// ============================================================

function завантажитиЗвіт() {
    var D = window.docx;

    var шрифт = { font: "Times New Roman", size: 28 }; // 14pt
    var шрифтЖирний = { font: "Times New Roman", size: 28, bold: true };
    var шрифтКод = { font: "Consolas", size: 22 }; // 11pt

    var абзаци = [];

    // Функція для створення заголовка розділу
    function додатиЗаголовок(текст) {
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: текст, ...шрифтЖирний })],
            spacing: { before: 300, after: 150 }
        }));
    }

    // Функція для створення абзацу тексту
    function додатиТекст(текст) {
        if (!текст) return;
        var рядки = текст.split("\n");
        рядки.forEach(function(рядок) {
            абзаци.push(new D.Paragraph({
                children: [new D.TextRun({ text: рядок, ...шрифт })],
                alignment: D.AlignmentType.JUSTIFIED,
                spacing: { line: 360 }, // 1.5 інтервал
                indent: { firstLine: D.convertMillimetersToTwip(12.5) }
            }));
        });
    }

    // Мета
    var мета = document.getElementById("мета-роботи").value.trim();
    if (мета) {
        додатиЗаголовок("Мета роботи");
        додатиТекст(мета);
    }

    // Теорія
    var теорія = document.getElementById("теорія").value.trim();
    if (теорія) {
        додатиЗаголовок("Теоретичні відомості");
        додатиТекст(теорія);
    }

    // Хід роботи
    var хід = document.getElementById("хід-роботи").value.trim();
    if (хід) {
        додатиЗаголовок("Хід роботи");
        додатиТекст(хід);
    }

    // Код програми
    var код = document.getElementById("код-програми").value.trim();
    var мова = document.getElementById("мова-коду").value.trim();
    var файл = document.getElementById("назва-файлу").value.trim();
    if (код) {
        var заголовокКоду = "Лістинг програми";
        if (файл) заголовокКоду += " (" + файл + ")";
        if (мова) заголовокКоду += " — " + мова;

        додатиЗаголовок(заголовокКоду);
        код.split("\n").forEach(function(рядок) {
            абзаци.push(new D.Paragraph({
                children: [new D.TextRun({ text: рядок || " ", ...шрифтКод })],
                spacing: { line: 280 }
            }));
        });
    }

    // Результати
    var результати = document.getElementById("результати").value.trim();
    if (результати) {
        додатиЗаголовок("Результати виконання");
        додатиТекст(результати);
    }

    // Висновки
    var висновки = document.getElementById("висновки").value.trim();
    if (висновки) {
        додатиЗаголовок("Висновки");
        додатиТекст(висновки);
    }

    // Контрольні запитання
    if (контрольніЗапитання.length > 0) {
        додатиЗаголовок("Контрольні запитання");
        контрольніЗапитання.forEach(function(зп, індекс) {
            абзаци.push(new D.Paragraph({
                children: [new D.TextRun({ text: (індекс + 1) + ". " + зп.запитання, ...шрифтЖирний })],
                spacing: { before: 100 },
                indent: { firstLine: D.convertMillimetersToTwip(12.5) }
            }));
            абзаци.push(new D.Paragraph({
                children: [new D.TextRun({ text: зп.відповідь, ...шрифт })],
                alignment: D.AlignmentType.JUSTIFIED,
                spacing: { line: 360, after: 80 },
                indent: { firstLine: D.convertMillimetersToTwip(12.5) }
            }));
        });
    }

    if (абзаци.length === 0) {
        alert("Звіт порожній! Заповніть хоча б один розділ.");
        return;
    }

    // Створюємо документ
    var doc = new D.Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: D.convertMillimetersToTwip(20),
                        bottom: D.convertMillimetersToTwip(20),
                        left: D.convertMillimetersToTwip(30),
                        right: D.convertMillimetersToTwip(10)
                    }
                }
            },
            children: абзаци
        }]
    });

    D.Packer.toBlob(doc).then(function(blob) {
        var назва = "Звіт";
        var тип = document.getElementById("тип-роботи").value;
        var номер = document.getElementById("номер-роботи").value.trim();
        if (тип) назва += "_" + тип.replace(/ /g, "_");
        if (номер) назва += "_" + номер;
        назва += ".docx";
        saveAs(blob, назва);
        збільшитиЛічильник("docs");
        alert("Звіт збережено: " + назва);
    });
}

// ============================================================
// 6. НОРМОКОНТРОЛЬ ТЕКСТУ
// ============================================================

function виконатиНормоконтроль() {
    var вхідний = document.getElementById("вхідний-текст").value;
    if (!вхідний.trim()) {
        alert("Вставте текст для перевірки!");
        return;
    }

    var виправлення = [];
    var результат = вхідний;

    // 1. Видалення невидимих Unicode-символів
    var безЮнікод = результат.replace(/[\u200B-\u200F\u2028\u2029\uFEFF]/g, "");
    if (безЮнікод !== результат) {
        виправлення.push("Видалено невидимі Unicode-символи");
        результат = безЮнікод;
    }

    // 2. Заміна нерозривних пробілів на звичайні
    var безНерозривних = результат.replace(/\u00A0/g, " ");
    if (безНерозривних !== результат) {
        виправлення.push("Замінено нерозривні пробіли на звичайні");
        результат = безНерозривних;
    }

    // 3. Видалення подвійних пробілів
    var безПодвійних = результат.replace(/ {2,}/g, " ");
    if (безПодвійних !== результат) {
        виправлення.push("Видалено подвійні та зайві пробіли");
        результат = безПодвійних;
    }

    // 4. Видалення пробілів перед розділовими знаками
    var безПробілівПередЗнаками = результат.replace(/ +([.,;:!?])/g, "$1");
    if (безПробілівПередЗнаками !== результат) {
        виправлення.push("Видалено пробіли перед розділовими знаками");
        результат = безПробілівПередЗнаками;
    }

    // 5. Додавання пробілу після розділових знаків (якщо бракує)
    var зПробіломПісля = результат.replace(/([.,;:!?])([А-Яа-яЇїЄєІіҐґA-Za-z])/g, "$1 $2");
    if (зПробіломПісля !== результат) {
        виправлення.push("Додано пробіл після розділових знаків");
        результат = зПробіломПісля;
    }

    // 6. Заміна прямих лапок на типографічні
    var зЛапками = результат.replace(/"([^"]+)"/g, "«$1»");
    if (зЛапками !== результат) {
        виправлення.push("Замінено прямі лапки (\"...\") на українські («...»)");
        результат = зЛапками;
    }

    // 7. Заміна дефісів на тире (між словами)
    var зТире = результат.replace(/(\s)-(\s)/g, "$1—$2");
    if (зТире !== результат) {
        виправлення.push("Замінено дефіси на тире у реченнях");
        результат = зТире;
    }

    // 8. Видалення зайвих порожніх рядків
    var безЗайвихРядків = результат.replace(/\n{3,}/g, "\n\n");
    if (безЗайвихРядків !== результат) {
        виправлення.push("Видалено зайві порожні рядки (більше двох поспіль)");
        результат = безЗайвихРядків;
    }

    // 9. Велика літера на початку речення (після крапки)
    var зВеликоюЛітерою = результат.replace(/([.!?]\s+)([а-яїєіґ])/g, function(збіг, знак, літера) {
        return знак + літера.toUpperCase();
    });
    if (зВеликоюЛітерою !== результат) {
        виправлення.push("Виправлено малі літери на початку речень");
        результат = зВеликоюЛітерою;
    }

    // 10. Видалення пробілів на початку та в кінці рядків
    var рядкиОчищені = результат.split("\n").map(function(р) { return р.trim(); }).join("\n");
    if (рядкиОчищені !== результат) {
        виправлення.push("Видалено зайві пробіли на початку та в кінці рядків");
        результат = рядкиОчищені;
    }

    // Виводимо результат
    document.getElementById("вихідний-текст").value = результат;

    // Звіт перевірки
    var блокЗвіту = document.getElementById("звіт-перевірки");
    var списокВиправлень = document.getElementById("список-виправлень");
    списокВиправлень.innerHTML = "";

    if (виправлення.length === 0) {
        списокВиправлень.innerHTML = "<li>Помилок оформлення не знайдено. Текст відповідає стандартам.</li>";
    } else {
        виправлення.forEach(function(в) {
            var li = document.createElement("li");
            li.className = "fixed";
            li.textContent = "Виправлено: " + в;
            списокВиправлень.appendChild(li);
        });
    }

    блокЗвіту.style.display = "block";
}

function скопіюватиРезультат() {
    var текст = document.getElementById("вихідний-текст").value;
    if (!текст) {
        alert("Нема що копіювати!");
        return;
    }
    navigator.clipboard.writeText(текст).then(function() {
        alert("Текст скопійовано в буфер обміну!");
    }).catch(function() {
        // Запасний варіант
        document.getElementById("вихідний-текст").select();
        document.execCommand("copy");
        alert("Текст скопійовано!");
    });
}

// ============================================================
// 7. ДОПОМІЖНІ ФУНКЦІЇ
// ============================================================

// Розгортання / згортання розділів звіту
function переключитиРозділ(header) {
    var body = header.nextElementSibling;
    var arrow = header.querySelector(".report-arrow");
    if (body.style.display === "none") {
        body.style.display = "block";
        arrow.textContent = "−";
    } else {
        body.style.display = "none";
        arrow.textContent = "+";
    }
}

// Контрольні запитання
function додатиЗапитання() {
    var запитання = document.getElementById("нове-запитання").value.trim();
    var відповідь = document.getElementById("нова-відповідь").value.trim();

    if (!запитання || !відповідь) {
        alert("Заповніть і запитання, і відповідь!");
        return;
    }

    контрольніЗапитання.push({ запитання: запитання, відповідь: відповідь });
    document.getElementById("нове-запитання").value = "";
    document.getElementById("нова-відповідь").value = "";
    оновитиСписокЗапитань();
}

function видалитиЗапитання(індекс) {
    контрольніЗапитання.splice(індекс, 1);
    оновитиСписокЗапитань();
}

function оновитиСписокЗапитань() {
    var список = document.getElementById("контрольні-список");
    список.innerHTML = "";

    контрольніЗапитання.forEach(function(зп, і) {
        var div = document.createElement("div");
        div.className = "qa-item";
        div.innerHTML =
            '<div class="qa-text">' +
                '<strong>' + (і + 1) + '. ' + зп.запитання + '</strong><br>' +
                зп.відповідь +
            '</div>' +
            '<button class="btn-remove" onclick="видалитиЗапитання(' + і + ')" title="Видалити">&times;</button>';
        список.appendChild(div);
    });
}

// Попередній перегляд скріншотів
function попереднійПерегляд(input) {
    var контейнер = document.getElementById("превю-скріншотів");
    контейнер.innerHTML = "";

    if (!input.files) return;

    Array.from(input.files).forEach(function(файл) {
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = document.createElement("img");
            img.src = e.target.result;
            img.alt = файл.name;
            контейнер.appendChild(img);
        };
        reader.readAsDataURL(файл);
    });
}

// Друк титульної сторінки
function друкуватиТитулку() {
    window.print();
}

// Збереження чернетки звіту
function зберегтиЧернетку() {
    var чернетка = {
        мета: document.getElementById("мета-роботи").value,
        теорія: document.getElementById("теорія").value,
        хід: document.getElementById("хід-роботи").value,
        код: document.getElementById("код-програми").value,
        мова: document.getElementById("мова-коду").value,
        файл: document.getElementById("назва-файлу").value,
        результати: document.getElementById("результати").value,
        висновки: document.getElementById("висновки").value,
        запитання: контрольніЗапитання
    };

    localStorage.setItem("studdoc_draft", JSON.stringify(чернетка));
    збільшитиЛічильник("saves");
    alert("Чернетку звіту збережено!");
}

function завантажитиЧернетку() {
    var дані = localStorage.getItem("studdoc_draft");
    if (!дані) return;

    try {
        var чернетка = JSON.parse(дані);
        if (чернетка.мета) document.getElementById("мета-роботи").value = чернетка.мета;
        if (чернетка.теорія) document.getElementById("теорія").value = чернетка.теорія;
        if (чернетка.хід) document.getElementById("хід-роботи").value = чернетка.хід;
        if (чернетка.код) document.getElementById("код-програми").value = чернетка.код;
        if (чернетка.мова) document.getElementById("мова-коду").value = чернетка.мова;
        if (чернетка.файл) document.getElementById("назва-файлу").value = чернетка.файл;
        if (чернетка.результати) document.getElementById("результати").value = чернетка.результати;
        if (чернетка.висновки) document.getElementById("висновки").value = чернетка.висновки;
        if (чернетка.запитання) {
            контрольніЗапитання = чернетка.запитання;
            оновитиСписокЗапитань();
        }
    } catch (e) {
        // Ігноруємо пошкоджені дані
    }
}

function очиститиЗвіт() {
    if (!confirm("Очистити всі поля звіту? Цю дію не можна скасувати.")) return;

    document.getElementById("мета-роботи").value = "";
    document.getElementById("теорія").value = "";
    document.getElementById("хід-роботи").value = "";
    document.getElementById("код-програми").value = "";
    document.getElementById("мова-коду").value = "C#";
    document.getElementById("назва-файлу").value = "";
    document.getElementById("результати").value = "";
    document.getElementById("висновки").value = "";
    контрольніЗапитання = [];
    оновитиСписокЗапитань();
    document.getElementById("превю-скріншотів").innerHTML = "";
}

// Лічильники статистики
function збільшитиЛічильник(тип) {
    if (тип === "docs") {
        лічильникДокументів++;
        localStorage.setItem("studdoc_docs", String(лічильникДокументів));
    } else if (тип === "saves") {
        лічильникЗбережень++;
        localStorage.setItem("studdoc_saves", String(лічильникЗбережень));
    }
    оновитиСтатистику();
}

function оновитиСтатистику() {
    var elDocs = document.getElementById("stat-docs");
    var elSaves = document.getElementById("stat-saves");
    if (elDocs) elDocs.textContent = лічильникДокументів;
    if (elSaves) elSaves.textContent = лічильникЗбережень;
}

// ============================================================
// ІНІЦІАЛІЗАЦІЯ ПРИ ЗАВАНТАЖЕННІ СТОРІНКИ
// ============================================================

document.addEventListener("DOMContentLoaded", function() {
    // Завантажуємо збережений профіль
    завантажитиПрофіль();

    // Завантажуємо чернетку звіту
    завантажитиЧернетку();

    // Встановлюємо поточний рік
    var полеРіку = document.getElementById("рік");
    if (полеРіку && !полеРіку.value) {
        полеРіку.value = new Date().getFullYear();
    }

    // Оновлюємо попередній перегляд
    оновитиПрев();

    // Оновлюємо лічильники
    оновитиСтатистику();
});
