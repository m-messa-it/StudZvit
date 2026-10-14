// ============================================================
// StudDoc — Логіка веб-сервісу автоматизованого формування
// студентської документації та нормоконтролю
// Без обмежень, без обов'язкових блокувань
// ============================================================

// Змінні стану
let поточнийМасштаб = 1;
let контрольніЗапитання = [];
let списокДжерел = [];

// ============================================================
// 1. СИСТЕМА СПОВІЩЕНЬ (TOAST ЗАМІСТЬ ALERT)
// ============================================================

function показатиСповіщення(повідомлення, тип) {
    var конт = document.getElementById("toast-box");
    if (!конт) return;

    var toast = document.createElement("div");
    toast.className = "toast " + (тип === "інфо" ? "toast-info" : "toast-success");
    toast.innerHTML = "<span>" + повідомлення + "</span>";

    конт.appendChild(toast);

    setTimeout(function() {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(20px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(function() {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3200);
}

// ============================================================
// 2. НАВІГАЦІЯ МІЖ ВКЛАДКАМИ
// ============================================================

function перейтиДо(ідСторінки) {
    document.querySelectorAll(".page-view").forEach(function(el) {
        el.style.display = "none";
    });

    var цільова = document.getElementById(ідСторінки);
    if (цільова) {
        цільова.style.display = "block";
    }

    document.querySelectorAll(".nav-tab").forEach(function(btn) {
        btn.classList.remove("active");
        if (btn.getAttribute("data-page") === ідСторінки) {
            btn.classList.add("active");
        }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
    оновитиПрев();
    оновитиЧекліст();
}

// ============================================================
// 3. ПРОФІЛЬ СТУДЕНТА (НЕ БЛОКУЄ, МОЖНА ОЧИСТИТИ)
// ============================================================

function завантажитиПрофіль() {
    var збережене = localStorage.getItem("studdoc_profile");
    if (!збережене) return;

    try {
        var дані = JSON.parse(збережене);

        // Поля титулки
        if (дані.піб) document.getElementById("студент-піб").value = дані.піб;
        if (дані.група) document.getElementById("група").value = дані.група;
        if (дані.курс) document.getElementById("курс").value = дані.курс;
        if (дані.заклад) document.getElementById("заклад").value = дані.заклад;
        if (дані.спеціальність) document.getElementById("спеціальність").value = дані.спеціальність;
        if (дані.викладач) document.getElementById("викладач-піб").value = дані.викладач;

        // Поля модалки
        if (дані.піб) document.getElementById("проф-піб").value = дані.піб;
        if (дані.група) document.getElementById("проф-група").value = дані.група;
        if (дані.курс) document.getElementById("проф-курс").value = дані.курс;
        if (дані.заклад) document.getElementById("проф-заклад").value = дані.заклад;
        if (дані.спеціальність) document.getElementById("проф-спец").value = дані.спеціальність;
        if (дані.викладач) document.getElementById("проф-викладач").value = дані.викладач;
    } catch (e) {
        // ігноруємо помилки читання
    }
}

function зберегтиПрофіль() {
    var дані = {
        піб: (document.getElementById("проф-піб").value || document.getElementById("студент-піб").value).trim(),
        група: (document.getElementById("проф-група").value || document.getElementById("група").value).trim(),
        курс: (document.getElementById("проф-курс").value || document.getElementById("курс").value).trim(),
        заклад: (document.getElementById("проф-заклад").value || document.getElementById("заклад").value).trim(),
        спеціальність: (document.getElementById("проф-спец").value || document.getElementById("спеціальність").value).trim(),
        викладач: (document.getElementById("проф-викладач").value || document.getElementById("викладач-піб").value).trim()
    };

    localStorage.setItem("studdoc_profile", JSON.stringify(дані));
    закритиПрофіль();
    завантажитиПрофіль();
    оновитиПрев();
    показатиСповіщення("Профіль успішно оновлено!", "успіх");
}

function очиститиПрофіль() {
    localStorage.removeItem("studdoc_profile");
    ["проф-піб", "проф-група", "проф-курс", "проф-заклад", "проф-спец", "проф-викладач"].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = "";
    });
    показатиСповіщення("Дані профілю очищено", "інфо");
}

function відкритиПрофіль() {
    document.getElementById("модальне-профіль").style.display = "flex";
}

function закритиПрофіль() {
    document.getElementById("модальне-профіль").style.display = "none";
}

// ============================================================
// 4. ОНОВЛЕННЯ ПОПЕРЕДНЬОГО ПЕРЕГЛЯДУ А4 В РЕАЛЬНОМУ ЧАСІ
// (Працює навіть якщо заповнено лише одне будь-яке поле)
// ============================================================

function оновитиПрев() {
    var тип = (document.getElementById("тип-роботи").value || "РОБОТА").toUpperCase();
    var номер = document.getElementById("номер-роботи").value.trim();
    var дисципліна = document.getElementById("дисципліна").value.trim();
    var тема = document.getElementById("тема-роботи").value.trim();
    var заклад = document.getElementById("заклад").value.trim();
    var студент = document.getElementById("студент-піб").value.trim();
    var група = document.getElementById("група").value.trim();
    var спеціальність = document.getElementById("спеціальність").value.trim();
    var курс = document.getElementById("курс").value.trim();
    var викладач = document.getElementById("викладач-піб").value.trim();
    var варіант = document.getElementById("варіант").value.trim();
    var місто = document.getElementById("місто").value.trim() || "Київ";
    var рік = document.getElementById("рік").value.trim() || String(new Date().getFullYear());

    // Заклад
    document.getElementById("прев-заклад").textContent = заклад ? заклад.toUpperCase() : "НАЗВА НАВЧАЛЬНОГО ЗАКЛАДУ";

    // Тип і номер
    var текстТипу = тип;
    if (номер) текстТипу += " № " + номер;
    document.getElementById("прев-тип").textContent = текстТипу;

    // Дисципліна
    document.getElementById("прев-дисципліна").textContent = дисципліна ? "з дисципліни «" + дисципліна + "»" : "";

    // Тема
    document.getElementById("прев-тема").textContent = тема ? "Тема: " + тема : "";

    // Варіант
    document.getElementById("прев-варіант").textContent = варіант ? "Варіант № " + варіант : "";

    // Мета-дані (студент, група, викладач)
    document.getElementById("прев-студент").innerHTML = "<strong>Виконав(ла):</strong> " + (студент || "студент(ка)");
    
    var рядГрупи = "";
    if (група) рядГрупи += "групи " + група;
    if (курс) рядГрупи += (рядГрупи ? ", " : "") + курс + " курсу";
    document.getElementById("прев-група").textContent = рядГрупи;

    document.getElementById("прев-спец").textContent = спеціальність ? "спеціальності " + спеціальність : "";
    document.getElementById("прев-викладач").innerHTML = "<strong>Перевірив(ла):</strong> " + (викладач || "викладач");

    // Футер
    document.getElementById("прев-місто").textContent = місто;
    document.getElementById("прев-рік").textContent = рік;

    оновитиЧекліст();
}

// Масштаб бланка
function масштабуватиПрев(множник) {
    if (множник === 1) {
        поточнийМасштаб = 1;
    } else {
        поточнийМасштаб = Math.max(0.6, Math.min(1.4, поточнийМасштаб * (множник > 1 ? 1.1 : 0.9)));
    }
    var папір = document.getElementById("прев-титулка");
    if (папір) {
        папір.style.transform = "scale(" + поточнийМасштаб + ")";
    }
}

// ============================================================
// 5. ГЕНЕРАЦІЯ WORD (.DOCX) ДЛЯ ТИТУЛКИ
// (ЖОДНИХ БЛОКУВАНЬ — СКАЧУЄ ЗАВЖДИ!)
// ============================================================

function завантажитиТитулку() {
    var D = window.docx;
    if (!D) {
        показатиСповіщення("Завантаження бібліотеки Word...", "інфо");
        return;
    }

    var тип = (document.getElementById("тип-роботи").value || "Практична робота").toUpperCase();
    var номер = document.getElementById("номер-роботи").value.trim();
    var дисципліна = document.getElementById("дисципліна").value.trim();
    var тема = document.getElementById("тема-роботи").value.trim();
    var заклад = document.getElementById("заклад").value.trim();
    var студент = document.getElementById("студент-піб").value.trim();
    var група = document.getElementById("група").value.trim();
    var спеціальність = document.getElementById("спеціальність").value.trim();
    var курс = document.getElementById("курс").value.trim();
    var викладач = document.getElementById("викладач-піб").value.trim();
    var варіант = document.getElementById("варіант").value.trim();
    var місто = document.getElementById("місто").value.trim() || "Київ";
    var рік = document.getElementById("рік").value.trim() || String(new Date().getFullYear());

    var шрифтОсновний = { font: "Times New Roman", size: 28 }; // 14pt
    var шрифтЖирний = { font: "Times New Roman", size: 28, bold: true };
    var шрифтЗаголовок = { font: "Times New Roman", size: 32, bold: true }; // 16pt

    var абзаци = [];

    // Заклад
    if (заклад) {
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: заклад.toUpperCase(), ...шрифтОсновний })],
            alignment: D.AlignmentType.CENTER,
            spacing: { after: 200 }
        }));
    }

    // Пропуски
    for (var i = 0; i < 7; i++) {
        абзаци.push(new D.Paragraph({ children: [], spacing: { after: 200 } }));
    }

    // Тип роботи
    var назваТипу = тип;
    if (номер) назваТипу += " № " + номер;
    абзаци.push(new D.Paragraph({
        children: [new D.TextRun({ text: назваТипу, ...шрифтЗаголовок })],
        alignment: D.AlignmentType.CENTER,
        spacing: { after: 120 }
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
            children: [new D.TextRun({ text: "Тема: " + тема, ...шрифтЖирний, italics: true })],
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

    for (var j = 0; j < 5; j++) {
        абзаци.push(new D.Paragraph({ children: [], spacing: { after: 200 } }));
    }

    // Блок студента
    абзаци.push(new D.Paragraph({
        children: [new D.TextRun({ text: "Виконав(ла): " + (студент || "студент(ка)"), ...шрифтОсновний })],
        alignment: D.AlignmentType.RIGHT,
        spacing: { after: 60 }
    }));

    var рядокГрупи = "";
    if (група) рядокГрупи += "групи " + група;
    if (курс) рядокГрупи += (рядокГрупи ? ", " : "") + курс + " курсу";
    if (рядокГрупи) {
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: рядокГрупи, ...шрифтОсновний })],
            alignment: D.AlignmentType.RIGHT,
            spacing: { after: 60 }
        }));
    }

    if (спеціальність) {
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: "спеціальності " + спеціальність, ...шрифтОсновний })],
            alignment: D.AlignmentType.RIGHT,
            spacing: { after: 60 }
        }));
    }

    абзаци.push(new D.Paragraph({
        children: [new D.TextRun({ text: "Перевірив(ла): " + (викладач || "викладач"), ...шрифтОсновний })],
        alignment: D.AlignmentType.RIGHT,
        spacing: { after: 200 }
    }));

    for (var k = 0; k < 4; k++) {
        абзаци.push(new D.Paragraph({ children: [], spacing: { after: 200 } }));
    }

    // Місто та рік
    абзаци.push(new D.Paragraph({
        children: [new D.TextRun({ text: місто + " — " + рік, ...шрифтОсновний })],
        alignment: D.AlignmentType.CENTER
    }));

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
        var назваФайлу = "Титульна_" + (тип.replace(/ /g, "_"));
        if (номер) назваФайлу += "_" + номер;
        назваФайлу += ".docx";

        saveAs(blob, назваФайлу);
        оновитиЛічильникДокументів();
        показатиСповіщення("Титульну сторінку завантажено: " + назваФайлу, "успіх");
    }).catch(function(err) {
        показатиСповіщення("Помилка генерації документа Word", "інфо");
    });
}

function друкуватиТитулку() {
    window.print();
}

// ============================================================
// 6. КОНСТРУКТОР ЗВІТУ
// ============================================================

function переключитиРозділ(кнопка) {
    var блок = кнопка.nextElementSibling;
    var іконка = кнопка.querySelector(".acc-toggle-icon");
    if (блок.style.display === "none" || !блок.style.display) {
        блок.style.display = "block";
        if (іконка) іконка.innerHTML = "&minus;";
    } else {
        блок.style.display = "none";
        if (іконка) іконка.innerHTML = "&plus;";
    }
}

// Сформувати висновок за метою
function згенеруватиВисновокЗаМетою() {
    var мета = document.getElementById("мета-роботи").value.trim();
    var тема = document.getElementById("тема-роботи").value.trim();
    var полеВисновків = document.getElementById("висновки");

    var текст = "У процесі виконання даної практичної роботи було детально опрацьовано ";
    if (тема) {
        текст += "тему «" + тема + "». ";
    } else {
        текст += "поставлене навчальне завдання. ";
    }

    if (мета) {
        текст += "Було досягнуто поставлену мету, а саме: " + мета.charAt(0).toLowerCase() + мета.slice(1) + " ";
    }

    текст += "Набуто практичних навичок проектування, налагодження та аналізу результатів роботи програми. Усі поставлені завдання виконано в повному обсязі.";

    полеВисновків.value = текст;
    показатиСповіщення("Шаблон висновку сформовано!", "успіх");
    оновитиЧекліст();
}

// Контрольні запитання
function додатиЗапитання() {
    var п = document.getElementById("нове-запитання").value.trim();
    var в = document.getElementById("нова-відповідь").value.trim();

    if (!п) {
        показатиСповіщення("Введіть хоча б текст запитання", "інфо");
        return;
    }

    контрольніЗапитання.push({ запитання: п, відповідь: в });
    document.getElementById("нове-запитання").value = "";
    document.getElementById("нова-відповідь").value = "";

    перемалюватиЗапитання();
    показатиСповіщення("Запитання додано", "успіх");
}

function видалитиЗапитання(індекс) {
    контрольніЗапитання.splice(індекс, 1);
    перемалюватиЗапитання();
}

function перемалюватиЗапитання() {
    var конт = document.getElementById("контрольні-список");
    if (!конт) return;
    конт.innerHTML = "";

    контрольніЗапитання.forEach(function(item, idx) {
        var card = document.createElement("div");
        card.className = "qa-card";
        card.innerHTML = 
            "<button class='qa-del-btn' onclick='видалитиЗапитання(" + idx + ")'>&times;</button>" +
            "<div class='qa-q'>" + (idx + 1) + ". " + escapeHtml(item.запитання) + "</div>" +
            "<div class='qa-a'>" + escapeHtml(item.відповідь || "—") + "</div>";
        конт.appendChild(card);
    });
}

function попереднійПерегляд(input) {
    var прев = document.getElementById("превю-скріншотів");
    прев.innerHTML = "";
    if (input.files) {
        Array.from(input.files).forEach(function(file) {
            var reader = new FileReader();
            reader.onload = function(e) {
                var img = document.createElement("img");
                img.src = e.target.result;
                img.style.maxHeight = "90px";
                img.style.borderRadius = "6px";
                img.style.border = "1px solid #cbd5e1";
                прев.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
        показатиСповіщення("Зображення завантажено", "інфо");
    }
}

// Експорт повного звіту у Word
function завантажитиЗвіт() {
    var D = window.docx;
    if (!D) {
        показатиСповіщення("Зачекайте завантаження бібліотеки...", "інфо");
        return;
    }

    var шрифт = { font: "Times New Roman", size: 28 }; // 14pt
    var шрифтЖирний = { font: "Times New Roman", size: 28, bold: true };
    var шрифтЗаголовок = { font: "Times New Roman", size: 30, bold: true };
    var відступ = { firstLine: D.convertMillimetersToTwip(12.5) };

    var абзаци = [];

    function додатиЗаголовок(текст) {
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: текст, ...шрифтЗаголовок })],
            alignment: D.AlignmentType.CENTER,
            spacing: { before: 240, after: 140 }
        }));
    }

    function додатиТекст(текст) {
        if (!текст) return;
        var рядки = текст.split("\n");
        рядки.forEach(function(ряд) {
            var t = ряд.trim();
            if (t) {
                абзаци.push(new D.Paragraph({
                    children: [new D.TextRun({ text: t, ...шрифт })],
                    alignment: D.AlignmentType.JUSTIFIED,
                    spacing: { line: 360, after: 80 },
                    indent: відступ
                }));
            }
        });
    }

    // 1. Мета
    var мета = document.getElementById("мета-роботи").value.trim();
    if (мета) {
        додатиЗаголовок("1. МЕТА РОБОТИ ТА ЗАВДАННЯ");
        додатиТекст(мета);
    }

    // 2. Теорія
    var теорія = document.getElementById("теорія").value.trim();
    if (теорія) {
        додатиЗаголовок("2. КОРОТКІ ТЕОРЕТИЧНІ ВІДОМОСТІ");
        додатиТекст(теорія);
    }

    // 3. Хід роботи
    var хід = document.getElementById("хід-роботи").value.trim();
    var код = document.getElementById("код-програми").value;
    if (хід || код) {
        додатиЗаголовок("3. ХІД ВИКОНАННЯ РОБОТИ");
        if (хід) додатиТекст(хід);

        if (код && код.trim()) {
            абзаци.push(new D.Paragraph({
                children: [new D.TextRun({ text: "Лістинг програмного коду:", ...шрифтЖирний })],
                spacing: { before: 140, after: 80 },
                indent: відступ
            }));

            var рядкиКоду = код.split("\n");
            рядкиКоду.forEach(function(k) {
                абзаци.push(new D.Paragraph({
                    children: [new D.TextRun({ text: k, font: "Consolas", size: 22 })],
                    spacing: { line: 240, after: 0 }
                }));
            });
        }
    }

    // 4. Результати
    var результати = document.getElementById("результати").value.trim();
    if (результати) {
        додатиЗаголовок("4. РЕЗУЛЬТАТИ РОБОТИ");
        додатиТекст(результати);
    }

    // 5. Висновки
    var висновки = document.getElementById("висновки").value.trim();
    if (висновки) {
        додатиЗаголовок("5. ВИСНОВКИ");
        додатиТекст(висновки);
    }

    // 6. Контрольні запитання
    if (контрольніЗапитання.length > 0) {
        додатиЗаголовок("6. ВІДПОВІДІ НА КОНТРОЛЬНІ ЗАПИТАННЯ");
        контрольніЗапитання.forEach(function(item, idx) {
            абзаци.push(new D.Paragraph({
                children: [new D.TextRun({ text: (idx + 1) + ". " + item.запитання, ...шрифтЖирний })],
                spacing: { before: 120, after: 60 },
                indent: відступ
            }));
            if (item.відповідь) {
                абзаци.push(new D.Paragraph({
                    children: [new D.TextRun({ text: item.відповідь, ...шрифт })],
                    alignment: D.AlignmentType.JUSTIFIED,
                    spacing: { line: 360, after: 80 },
                    indent: відступ
                }));
            }
        });
    }

    // Якщо все порожнє — все одно даємо зберегти заготовку
    if (абзаци.length === 0) {
        додатиЗаголовок("ЗВІТ З НАВЧАЛЬНОЇ РОБОТИ");
        додатиТекст("Шаблон сформовано за стандартами ДСТУ 3008:2015.");
    }

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
        var назва = "Звіт_роботи.docx";
        saveAs(blob, назва);
        оновитиЛічильникДокументів();
        показатиСповіщення("Звіт успішно збережено: " + назва, "успіх");
    });
}

function зберегтиЧернетку() {
    var чернетка = {
        мета: document.getElementById("мета-роботи").value,
        теорія: document.getElementById("теорія").value,
        хід: document.getElementById("хід-роботи").value,
        код: document.getElementById("код-програми").value,
        результати: document.getElementById("результати").value,
        висновки: document.getElementById("висновки").value,
        запитання: контрольніЗапитання
    };
    localStorage.setItem("studdoc_draft", JSON.stringify(чернетка));
    показатиСповіщення("Чернетку збережено локально!", "успіх");
}

function завантажитиЧернетку() {
    var raw = localStorage.getItem("studdoc_draft");
    if (!raw) return;
    try {
        var d = JSON.parse(raw);
        if (d.мета) document.getElementById("мета-роботи").value = d.мета;
        if (d.теорія) document.getElementById("теорія").value = d.теорія;
        if (d.хід) document.getElementById("хід-роботи").value = d.хід;
        if (d.код) document.getElementById("код-програми").value = d.код;
        if (d.результати) document.getElementById("результати").value = d.результати;
        if (d.висновки) document.getElementById("висновки").value = d.висновки;
        if (d.запитання) {
            контрольніЗапитання = d.запитання;
            перемалюватиЗапитання();
        }
    } catch (e) {}
}

function очиститиЗвіт() {
    ["мета-роботи", "теорія", "хід-роботи", "код-програми", "результати", "висновки"].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = "";
    });
    контрольніЗапитання = [];
    перемалюватиЗапитання();
    localStorage.removeItem("studdoc_draft");
    показатиСповіщення("Поля звіту очищено", "інфо");
    оновитиЧекліст();
}

// ============================================================
// 7. НОРМОКОНТРОЛЬ ТЕКСТУ
// ============================================================

function виконатиНормоконтроль() {
    var вхідний = document.getElementById("вхідний-текст").value;
    if (!вхідний.trim()) {
        показатиСповіщення("Вставте текст у поле для перевірки", "інфо");
        return;
    }

    var виправлення = [];
    var результат = вхідний;

    // 1. Прибирання невидимих символів
    var безЮнікод = результат.replace(/[\u200B-\u200F\u2028\u2029\uFEFF]/g, "");
    if (безЮнікод !== результат) {
        виправлення.push("Видалено невидимі службові символи");
        результат = безЮнікод;
    }

    // 2. Подвійні пробіли
    var безПодвійних = результат.replace(/ {2,}/g, " ");
    if (безПодвійних !== результат) {
        виправлення.push("Прибрано зайві подвійні пробіли");
        результат = безПодвійних;
    }

    // 3. Пробіли перед знаками пунктцації
    var безПробілівПеред = результат.replace(/ +([,.:;?!])/g, "$1");
    if (безПробілівПеред !== результат) {
        виправлення.push("Виправлено пробіли перед знаками пунктуації");
        результат = безПробілівПеред;
    }

    // 4. Пробіл після розділових знаків (якщо немає)
    var зПробіломПісля = результат.replace(/([,.:;?!])(?=[А-Яа-яЄєІіЇїҐґA-Za-z])/g, "$1 ");
    if (зПробіломПісля !== результат) {
        виправлення.push("Додано обов'язкові пробіли після розділових знаків");
        результат = зПробіломПісля;
    }

    // 5. Лапки «ялинки»
    var зЯлинками = результат.replace(/"([^"]+)"/g, "«$1»");
    if (зЯлинками !== результат) {
        виправлення.push("Замінено прямі лапки на типографічні «ялинки»");
        результат = зЯлинками;
    }

    // 6. Тире між словами (довге тире замість дефісу)
    var зТире = результат.replace(/ - /g, " — ");
    if (зТире !== результат) {
        виправлення.push("Замінено дефіси між словами на довге тире (—)");
        результат = зТире;
    }

    // 7. Правильний апостроф
    var зАпострофом = результат.replace(/([А-Яа-яЄєІіЇїҐґ])['`’]([А-Яа-яЄєІіЇїҐґ])/g, "$1’$2");
    if (зАпострофом !== результат) {
        виправлення.push("Стандартизовано українські апострофи (буквений знак ’)");
        результат = зАпострофом;
    }

    document.getElementById("вихідний-текст").value = результат;

    // Звіт виправлень
    var звітБлок = document.getElementById("звіт-перевірки");
    var списокТегів = document.getElementById("список-виправлень");
    списокТегів.innerHTML = "";

    if (виправлення.length === 0) {
        списокТегів.innerHTML = "<span class='nc-tag' style='background:#ecfdf5; color:#065f46;'>Текст бездоганний! Помилок оформлення не знайдено.</span>";
    } else {
        виправлення.forEach(function(v) {
            var tag = document.createElement("span");
            tag.className = "nc-tag";
            tag.textContent = v;
            списокТегів.appendChild(tag);
        });
    }
    звітБлок.style.display = "block";

    // Оновлення лічильника слів
    var кстьСлів = (результат.match(/\S+/g) || []).length;
    var поточніСлова = parseInt(localStorage.getItem("studdoc_words") || "0") + кстьСлів;
    localStorage.setItem("studdoc_words", String(поточніСлова));
    document.getElementById("stat-words").textContent = поточніСлова;

    показатиСповіщення("Нормоконтроль успішно виконано!", "успіх");
}

function скопіюватиРезультат() {
    var txt = document.getElementById("вихідний-текст").value;
    if (!txt) {
        показатиСповіщення("Немає тексту для копіювання", "інфо");
        return;
    }
    navigator.clipboard.writeText(txt).then(function() {
        показатиСповіщення("Текст скопійовано в буфер обміну!", "успіх");
    });
}

function перенестиУЗвіт() {
    var txt = document.getElementById("вихідний-текст").value;
    if (!txt) {
        показатиСповіщення("Спочатку виконайте нормоконтроль", "інфо");
        return;
    }
    document.getElementById("хід-роботи").value = txt;
    перейтиДо("конструктор");
    показатиСповіщення("Текст перенесено у розділ «Хід роботи»!", "успіх");
}

function вставитиПрикладПомилок() {
    document.getElementById("вхідний-текст").value = 
        "Дана практична робота   присвячена розробці клієнтської частини  додатку. " +
        "В процесі роботи було використано:мову C# ,середовище Visual Studio та бібліотеку \"StudDoc\". " +
        "Користувач - це головний клієнт системи. В зв`язку з цим,інтерфейс має бути зручним .";
    показатиСповіщення("Зразок тексту з помилками вставлено", "інфо");
}

// ============================================================
// 8. ГЕНЕРАТОР СПИСКУ ДЖЕРЕЛ (ДСТУ 8302:2015)
// ============================================================

function перемкнутиПоляДжерела() {
    var тип = document.getElementById("тип-джерела").value;
    var блокКнига = document.getElementById("блок-книга");
    var блокСайт = document.getElementById("блок-сайт");

    if (тип === "сайт") {
        блокКнига.style.display = "none";
        блокСайт.style.display = "block";
    } else {
        блокКнига.style.display = "grid";
        блокСайт.style.display = "none";
    }
}

function додатиДжерелоВСписок() {
    var тип = document.getElementById("тип-джерела").value;
    var автор = document.getElementById("джерело-автор").value.trim();
    var назва = document.getElementById("джерело-назва").value.trim();
    var містоВид = document.getElementById("джерело-місто-вид").value.trim();
    var рік = document.getElementById("джерело-рік").value.trim();
    var сторінки = document.getElementById("джерело-сторінки").value.trim();
    var url = document.getElementById("джерело-url").value.trim();

    if (!назва) {
        показатиСповіщення("Вкажіть принаймні назву джерела", "інфо");
        return;
    }

    var запис = "";
    if (автор) запис += автор + " ";
    запис += назва + ". ";

    if (тип === "сайт") {
        if (url) запис += "URL: " + url;
    } else {
        if (містоВид) запис += містоВид + ", ";
        if (рік) запис += рік + ". ";
        if (сторінки) запис += сторінки;
    }

    списокДжерел.push(запис.trim());

    // Очищення полів вводу
    document.getElementById("джерело-назва").value = "";
    document.getElementById("джерело-автор").value = "";
    document.getElementById("джерело-url").value = "";

    перемалюватиДжерела();
    показатиСповіщення("Джерело додано до списку!", "успіх");
}

function видалитиДжерело(idx) {
    списокДжерел.splice(idx, 1);
    перемалюватиДжерела();
}

function перемалюватиДжерела() {
    var конт = document.getElementById("список-джерел-результат");
    if (!конт) return;

    if (списокДжерел.length === 0) {
        конт.innerHTML = "<p style='font-size:13.5px; color:var(--text-muted);'>Джерела ще не додані. Заповніть форму вище.</p>";
        return;
    }

    конт.innerHTML = "";
    списокДжерел.forEach(function(item, idx) {
        var row = document.createElement("div");
        row.className = "source-entry";
        row.innerHTML = "<span>" + (idx + 1) + ". " + escapeHtml(item) + "</span>" +
                        "<button class='qa-del-btn' style='position:static;' onclick='видалитиДжерело(" + idx + ")'>&times;</button>";
        конт.appendChild(row);
    });
}

function скопіюватиСписокДжерел() {
    if (списокДжерел.length === 0) {
        показатиСповіщення("Список джерел порожній", "інфо");
        return;
    }
    var текст = списокДжерел.map(function(item, idx) {
        return (idx + 1) + ". " + item;
    }).join("\n");

    navigator.clipboard.writeText(текст).then(function() {
        показатиСповіщення("Весь список джерел скопійовано!", "успіх");
    });
}

// ============================================================
// 9. АНАЛІТИКА ТА ЧЕК-ЛІСТ ДСТУ
// ============================================================

function оновитиЧекліст() {
    var ст = document.getElementById("студент-піб") ? document.getElementById("студент-піб").value.trim() : "";
    var мета = document.getElementById("мета-роботи") ? document.getElementById("мета-роботи").value.trim() : "";
    var хід = document.getElementById("хід-роботи") ? document.getElementById("хід-роботи").value.trim() : "";
    var висн = document.getElementById("висновки") ? document.getElementById("висновки").value.trim() : "";

    встановитиСтатусЧек("chk-title", !!ст);
    встановитиСтатусЧек("chk-goal", !!мета);
    встановитиСтатусЧек("chk-body", !!хід);
    встановитиСтатусЧек("chk-conc", !!висн);

    // Підрахунок обсягу
    var повнийТекст = (мета + " " + хід + " " + висн).trim();
    var кстьЗнаків = повнийТекст.length;
    var сторінок = кстьЗнаків > 0 ? (кстьЗнаків / 1800).toFixed(1) : "0";

    var elPages = document.getElementById("calc-pages");
    var elChars = document.getElementById("calc-chars");
    if (elPages) elPages.textContent = сторінок;
    if (elChars) elChars.textContent = кстьЗнаків;
}

function встановитиСтатусЧек(id, виконано) {
    var el = document.getElementById(id);
    if (!el) return;
    if (виконано) {
        el.classList.add("done");
    } else {
        el.classList.remove("done");
    }
}

// ============================================================
// 10. ЗАПОВНЕННЯ ДЕМО-ПРИКЛАДОМ В ОДИН КЛІК
// ============================================================

function заповнитиДемо() {
    document.getElementById("тип-роботи").value = "Практична робота";
    document.getElementById("номер-роботи").value = "4";
    document.getElementById("варіант").value = "3";
    document.getElementById("дисципліна").value = "Об'єктно-орієнтоване програмування";
    document.getElementById("тема-роботи").value = "Побудова трирівневої архітектури інформаційної системи";
    document.getElementById("заклад").value = "Відокремлений структурний підрозділ «Фаховий коледж»";
    document.getElementById("студент-піб").value = "Шевченко Т. Г.";
    document.getElementById("група").value = "ІПЗ-21";
    document.getElementById("спеціальність").value = "121 Інженерія програмного забезпечення";
    document.getElementById("курс").value = "3";
    document.getElementById("викладач-піб").value = "доц. Петренко П. П.";
    document.getElementById("місто").value = "Київ";
    document.getElementById("рік").value = "2026";

    // Дані для конструктора
    document.getElementById("мета-роботи").value = 
        "Закріпити практичні навички проектування архітектури програмних систем з розділенням шарів даних, бізнес-логіки та користувацького інтерфейсу.";
    document.getElementById("хід-роботи").value = 
        "1. Проведено аналіз предметної області та розроблено модель сутності.\n" +
        "2. Створено шар доступу до даних та реалізовано методи вибірки.\n" +
        "3. Розроблено користувацький інтерфейс для відображення інформації.";
    document.getElementById("код-програми").value = 
        "public class DocumentService\n{\n    public void GenerateReport()\n    {\n        // Реалізація логіки генератора\n    }\n}";
    document.getElementById("висновки").value = 
        "У ході виконання роботи було успішно освоєно принципи побудови багатошарових додатків. Розроблено діючий прототип системи та протестовано основні модулі.";

    оновитиПрев();
    показатиСповіщення("Зразок даних завантажено!", "успіх");
}

function оновитиЛічильникДокументів() {
    var п = parseInt(localStorage.getItem("studdoc_docs") || "0") + 1;
    localStorage.setItem("studdoc_docs", String(п));
    var el = document.getElementById("stat-docs");
    if (el) el.textContent = п;
}

// Допоміжні функції
function escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// Ініціалізація при завантаженні сторінки
window.addEventListener("DOMContentLoaded", function() {
    // Лічильники
    var docs = localStorage.getItem("studdoc_docs") || "1";
    var words = localStorage.getItem("studdoc_words") || "340";
    if (document.getElementById("stat-docs")) document.getElementById("stat-docs").textContent = docs;
    if (document.getElementById("stat-words")) document.getElementById("stat-words").textContent = words;

    завантажитиПрофіль();
    завантажитиЧернетку();
    оновитиПрев();
});
