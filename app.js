// ============================================================
// StudDoc — Логіка веб-сервісу автоматизованого формування
// студентської документації та нормоконтролю
// Без обмежень, з підтримкою довільних користувацьких розділів
// ============================================================

// Змінні стану
let поточнийМасштаб = 1;
let контрольніЗапитання = [];
let списокДжерел = [];
let власніПоляТитулки = []; // [{ назва: "Рецензент", значення: "проф. Коваль В. І." }]
let власніРозділиЗвіту = []; // [{ назва: "Вступ", текст: "..." }]

// ============================================================
// 1. СИСТЕМА СПОВІЩЕНЬ (TOAST)
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
// 2. НАВІГАЦІЯ МІЖ ВКЛАДКАМИ ТА ІСТОРІЯ (СТРІЛОЧКИ НАЗАД / ВПЕРЕД)
// ============================================================

var історіяНавігації = ["головна"];
var індексІсторії = 0;
var списокСторінок = ["головна", "титулка", "конструктор", "нормоконтроль", "джерела", "про-сервіс"];

function оновитиСтрілочкиНавігації() {
    var btnBack = document.getElementById("btn-nav-back");
    var btnForward = document.getElementById("btn-nav-forward");
    if (btnBack) {
        btnBack.disabled = (індексІсторії <= 0);
    }
    if (btnForward) {
        btnForward.disabled = (індексІсторії >= історіяНавігації.length - 1);
    }
}

function перейтиДо(ідСторінки, безДодаванняВІсторію) {
    if (!безДодаванняВІсторію) {
        if (індексІсторії < історіяНавігації.length - 1) {
            історіяНавігації = історіяНавігації.slice(0, індексІсторії + 1);
        }
        if (історіяНавігації[індексІсторії] !== ідСторінки) {
            історіяНавігації.push(ідСторінки);
            індексІсторії = історіяНавігації.length - 1;
        }
    }
    оновитиСтрілочкиНавігації();

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

function навігаціяНазад() {
    if (індексІсторії > 0) {
        індексІсторії--;
        перейтиДо(історіяНавігації[індексІсторії], true);
    } else {
        var поточна = історіяНавігації[індексІсторії];
        var idx = списокСторінок.indexOf(поточна);
        if (idx > 0) {
            перейтиДо(списокСторінок[idx - 1]);
        }
    }
}

function навігаціяВперед() {
    if (індексІсторії < історіяНавігації.length - 1) {
        індексІсторії++;
        перейтиДо(історіяНавігації[індексІсторії], true);
    } else {
        var поточна = історіяНавігації[індексІсторії];
        var idx = списокСторінок.indexOf(поточна);
        if (idx >= 0 && idx < списокСторінок.length - 1) {
            перейтиДо(списокСторінок[idx + 1]);
        }
    }
}

// ============================================================
// 3. ПРОФІЛЬ СТУДЕНТА (LOCALSTORAGE)
// ============================================================

function завантажитиПрофіль() {
    var збережене = localStorage.getItem("studdoc_profile");
    if (!збережене) return;

    try {
        var дані = JSON.parse(збережене);

        if (дані.піб) document.getElementById("студент-піб").value = дані.піб;
        if (дані.група) document.getElementById("група").value = дані.група;
        if (дані.курс) document.getElementById("курс").value = дані.курс;
        if (дані.заклад) document.getElementById("заклад").value = дані.заклад;
        if (дані.спеціальність) document.getElementById("спеціальність").value = дані.спеціальність;
        if (дані.викладач) document.getElementById("викладач-піб").value = дані.викладач;

        if (дані.піб) document.getElementById("проф-піб").value = дані.піб;
        if (дані.група) document.getElementById("проф-група").value = дані.група;
        if (дані.курс) document.getElementById("проф-курс").value = дані.курс;
        if (дані.заклад) document.getElementById("проф-заклад").value = дані.заклад;
        if (дані.спеціальність) document.getElementById("проф-спец").value = дані.спеціальність;
        if (дані.викладач) document.getElementById("проф-викладач").value = дані.викладач;
    } catch (e) {}
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
// 4. ВЛАСНІ ДОДАТКОВІ ПОЛЯ ТИТУЛЬНОЇ СТОРІНКИ
// ============================================================

function додатиВласнеПолеТитулки(назваЗамовч, значЗамовч) {
    власніПоляТитулки.push({
        назва: назваЗамовч || "Посада / Статус",
        значення: значЗамовч || ""
    });
    перемалюватиВласніПоляТитулки();
    оновитиПрев();
}

function видалитиВласнеПолеТитулки(idx) {
    власніПоляТитулки.splice(idx, 1);
    перемалюватиВласніПоляТитулки();
    оновитиПрев();
}

function оновитиЗначенняВласногоПоля(idx, поле, вал) {
    if (власніПоляТитулки[idx]) {
        власніПоляТитулки[idx][поле] = вал;
        оновитиПрев();
    }
}

function перемалюватиВласніПоляТитулки() {
    var конт = document.getElementById("список-власних-полів-титулки");
    if (!конт) return;
    конт.innerHTML = "";

    власніПоляТитулки.forEach(function(item, idx) {
        var row = document.createElement("div");
        row.className = "custom-field-row";
        row.innerHTML = 
            "<input type='text' class='form-control' style='flex:1;' placeholder='Назва (напр. Рецензент)' value='" + escapeHtml(item.назва) + "' oninput='оновитиЗначенняВласногоПоля(" + idx + ", \"назва\", this.value)'>" +
            "<input type='text' class='form-control' style='flex:1.5;' placeholder='Значення (напр. доц. Коваль І. В.)' value='" + escapeHtml(item.значення) + "' oninput='оновитиЗначенняВласногоПоля(" + idx + ", \"значення\", this.value)'>" +
            "<button class='qa-del-btn' style='position:static;' onclick='видалитиВласнеПолеТитулки(" + idx + ")'>&times;</button>";
        конт.appendChild(row);
    });
}

// ============================================================
// 5. ОНОВЛЕННЯ ПОПЕРЕДНЬОГО ПЕРЕГЛЯДУ А4
// ============================================================

function чиУвімкнено(idЧекбокса) {
    var chk = document.getElementById(idЧекбокса);
    return chk ? chk.checked : true;
}

function перемкнутиПоле(idПоля, увімк) {
    var el = document.getElementById(idПоля);
    if (el) {
        if (!увімк) {
            el.classList.add("input-disabled");
            el.disabled = true;
        } else {
            el.classList.remove("input-disabled");
            el.disabled = false;
        }
    }
    оновитиПрев();
}

function оновитиПрев() {
    var тип = (чиУвімкнено("чек-тип") ? (document.getElementById("тип-роботи").value || "") : "").toUpperCase();
    var номер = чиУвімкнено("чек-номер") ? document.getElementById("номер-роботи").value.trim() : "";
    var дисципліна = чиУвімкнено("чек-дисципліна") ? document.getElementById("дисципліна").value.trim() : "";
    var тема = чиУвімкнено("чек-тема") ? document.getElementById("тема-роботи").value.trim() : "";
    var заклад = чиУвімкнено("чек-заклад") ? document.getElementById("заклад").value.trim() : "";
    var відділення = чиУвімкнено("чек-відділення") ? document.getElementById("відділення").value.trim() : "";
    var кафедра = чиУвімкнено("чек-кафедра") ? document.getElementById("кафедра").value.trim() : "";
    var студент = чиУвімкнено("чек-студент") ? document.getElementById("студент-піб").value.trim() : "";
    var група = чиУвімкнено("чек-група") ? document.getElementById("група").value.trim() : "";
    var спеціальність = чиУвімкнено("чек-спец") ? document.getElementById("спеціальність").value.trim() : "";
    var курс = чиУвімкнено("чек-курс") ? document.getElementById("курс").value.trim() : "";
    var викладач = чиУвімкнено("чек-викладач") ? document.getElementById("викладач-піб").value.trim() : "";
    var викладачПосада = чиУвімкнено("чек-посада") ? document.getElementById("викладач-посада").value.trim() : "";
    var варіант = чиУвімкнено("чек-варіант") ? document.getElementById("варіант").value.trim() : "";
    var місто = чиУвімкнено("чек-місто") ? document.getElementById("місто").value.trim() : "";
    var рік = чиУвімкнено("чек-рік") ? document.getElementById("рік").value.trim() : "";

    // Заклад та підрозділи
    var elЗаклад = document.getElementById("прев-заклад");
    if (заклад) {
        elЗаклад.textContent = заклад.toUpperCase();
        elЗаклад.style.display = "block";
    } else {
        elЗаклад.textContent = "";
        elЗаклад.style.display = "none";
    }
    
    var subOrg = "";
    if (відділення) subOrg += відділення;
    if (кафедра) subOrg += (subOrg ? " • " : "") + кафедра;
    var elSubOrg = document.getElementById("прев-відділення-кафедра");
    if (subOrg) {
        elSubOrg.textContent = subOrg;
        elSubOrg.style.display = "block";
    } else {
        elSubOrg.textContent = "";
        elSubOrg.style.display = "none";
    }

    // Тип і номер
    var elТип = document.getElementById("прев-тип");
    if (тип) {
        var текстТипу = тип;
        if (номер) текстТипу += " № " + номер;
        elТип.textContent = текстТипу;
        elТип.style.display = "block";
    } else {
        elТип.style.display = "none";
    }

    // Дисципліна, тема, варіант
    var elДисципліна = document.getElementById("прев-дисципліна");
    if (дисципліна) {
        elДисципліна.textContent = "з дисципліни «" + дисципліна + "»";
        elДисципліна.style.display = "block";
    } else {
        elДисципліна.style.display = "none";
    }

    var elТема = document.getElementById("прев-тема");
    if (тема) {
        elТема.textContent = "Тема: " + тема;
        elТема.style.display = "block";
    } else {
        elТема.style.display = "none";
    }

    var elВаріант = document.getElementById("прев-варіант");
    if (варіант) {
        elВаріант.textContent = "Варіант № " + варіант;
        elВаріант.style.display = "block";
    } else {
        elВаріант.style.display = "none";
    }

    // Мета-дані: студент
    var elСтудент = document.getElementById("прев-студент");
    if (студент) {
        elСтудент.innerHTML = "<strong>Виконав(ла):</strong> " + студент;
        elСтудент.style.display = "block";
    } else {
        elСтудент.style.display = "none";
    }
    
    // Група та курс
    var рядГрупи = "";
    if (група) рядГрупи += "групи " + група;
    if (курс) рядГрупи += (рядГрупи ? ", " : "") + курс + " курсу";
    var elГрупа = document.getElementById("прев-група");
    if (рядГрупи) {
        elГрупа.textContent = рядГрупи;
        elГрупа.style.display = "block";
    } else {
        elГрупа.style.display = "none";
    }

    // Спеціальність
    var elСпец = document.getElementById("прев-спец");
    if (спеціальність) {
        elСпец.textContent = "спеціальності " + спеціальність;
        elСпец.style.display = "block";
    } else {
        elСпец.style.display = "none";
    }
    
    // Викладач / керівник
    var elВикладач = document.getElementById("прев-викладач");
    if (викладач) {
        var виклТекст = "<strong>Перевірив(ла):</strong> ";
        if (викладачПосада) виклТекст += викладачПосада + " ";
        виклТекст += викладач;
        elВикладач.innerHTML = виклТекст;
        elВикладач.style.display = "block";
    } else {
        elВикладач.style.display = "none";
    }

    // Власні довільні поля
    var превВласні = document.getElementById("прев-власні-поля");
    превВласні.innerHTML = "";
    власніПоляТитулки.forEach(function(item) {
        if (item.назва || item.значення) {
            var row = document.createElement("div");
            row.className = "a4-meta-line";
            row.innerHTML = "<strong>" + escapeHtml(item.назва) + ":</strong> " + escapeHtml(item.значення);
            превВласні.appendChild(row);
        }
    });

    // Місто та рік
    var elНиз = document.getElementById("прев-місто-рік");
    if (elНиз) {
        var рядокНиз = "";
        if (місто && рік) рядокНиз = місто + " — " + рік;
        else if (місто) рядокНиз = місто;
        else if (рік) рядокНиз = рік;
        elНиз.textContent = рядокНиз;
        elНиз.style.display = рядокНиз ? "block" : "none";
    }

    оновитиЧекліст();
}

function очиститиФормуТитулки() {
    ["номер-роботи", "варіант", "дисципліна", "тема-роботи", "заклад", "відділення", "кафедра", "студент-піб", "група", "спеціальність", "курс", "викладач-піб", "викладач-посада", "місто", "рік"].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = "";
    });
    власніПоляТитулки = [];
    перемалюватиВласніПоляТитулки();
    оновитиПрев();
    показатиСповіщення("Форму очищено! Відображатимуться лише обрані вами поля.", "інфо");
}

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
// 6. ГЕНЕРАЦІЯ WORD (.DOCX) ДЛЯ ТИТУЛКИ
// ============================================================

function завантажитиТитулку() {
    var D = window.docx;
    if (!D) {
        показатиСповіщення("Завантаження бібліотеки Word...", "інфо");
        return;
    }

    var тип = (чиУвімкнено("чек-тип") ? (document.getElementById("тип-роботи").value || "Практична робота") : "").toUpperCase();
    var номер = чиУвімкнено("чек-номер") ? document.getElementById("номер-роботи").value.trim() : "";
    var дисципліна = чиУвімкнено("чек-дисципліна") ? document.getElementById("дисципліна").value.trim() : "";
    var тема = чиУвімкнено("чек-тема") ? document.getElementById("тема-роботи").value.trim() : "";
    var заклад = чиУвімкнено("чек-заклад") ? document.getElementById("заклад").value.trim() : "";
    var відділення = чиУвімкнено("чек-відділення") ? document.getElementById("відділення").value.trim() : "";
    var кафедра = чиУвімкнено("чек-кафедра") ? document.getElementById("кафедра").value.trim() : "";
    var студент = чиУвімкнено("чек-студент") ? document.getElementById("студент-піб").value.trim() : "";
    var група = чиУвімкнено("чек-група") ? document.getElementById("група").value.trim() : "";
    var спеціальність = чиУвімкнено("чек-спец") ? document.getElementById("спеціальність").value.trim() : "";
    var курс = чиУвімкнено("чек-курс") ? document.getElementById("курс").value.trim() : "";
    var викладач = чиУвімкнено("чек-викладач") ? document.getElementById("викладач-піб").value.trim() : "";
    var викладачПосада = чиУвімкнено("чек-посада") ? document.getElementById("викладач-посада").value.trim() : "";
    var варіант = чиУвімкнено("чек-варіант") ? document.getElementById("варіант").value.trim() : "";
    var місто = чиУвімкнено("чек-місто") ? document.getElementById("місто").value.trim() : "";
    var рік = чиУвімкнено("чек-рік") ? document.getElementById("рік").value.trim() : "";

    var шрифтОсновний = { font: "Times New Roman", size: 28 }; // 14pt
    var шрифтМалий = { font: "Times New Roman", size: 24 }; // 12pt
    var шрифтЖирний = { font: "Times New Roman", size: 28, bold: true };
    var шрифтЗаголовок = { font: "Times New Roman", size: 32, bold: true }; // 16pt

    var абзаци = [];

    // Заклад (якщо увімкнено і є)
    if (заклад) {
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: заклад.toUpperCase(), ...шрифтОсновний })],
            alignment: D.AlignmentType.CENTER,
            spacing: { after: 80 }
        }));
    }

    if (відділення || кафедра) {
        var sub = (відділення ? відділення : "") + (відділення && кафедра ? " • " : "") + (кафедра ? кафедра : "");
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: sub, ...шрифтМалий })],
            alignment: D.AlignmentType.CENTER,
            spacing: { after: 140 }
        }));
    }

    for (var i = 0; i < 6; i++) {
        абзаци.push(new D.Paragraph({ children: [], spacing: { after: 200 } }));
    }

    // Тип роботи
    if (тип) {
        var назваТипу = тип;
        if (номер) назваТипу += " № " + номер;
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: назваТипу, ...шрифтЗаголовок })],
            alignment: D.AlignmentType.CENTER,
            spacing: { after: 120 }
        }));
    }

    if (дисципліна) {
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: "з дисципліни «" + дисципліна + "»", ...шрифтОсновний })],
            alignment: D.AlignmentType.CENTER,
            spacing: { after: 100 }
        }));
    }

    if (тема) {
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: "Тема: " + тема, ...шрифтЖирний, italics: true })],
            alignment: D.AlignmentType.CENTER,
            spacing: { after: 100 }
        }));
    }

    if (варіант) {
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: "Варіант " + варіант, ...шрифтОсновний })],
            alignment: D.AlignmentType.CENTER,
            spacing: { after: 160 }
        }));
    }

    for (var j = 0; j < 5; j++) {
        абзаци.push(new D.Paragraph({ children: [], spacing: { after: 200 } }));
    }

    // Блок студента (тільки якщо увімкнено і введено)
    if (студент) {
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: "Виконав(ла): " + студент, ...шрифтОсновний })],
            alignment: D.AlignmentType.RIGHT,
            spacing: { after: 60 }
        }));
    }

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

    // Викладач (тільки якщо увімкнено і введено)
    if (викладач) {
        var виклWord = "Перевірив(ла): ";
        if (викладачПосада) виклWord += викладачПосада + " ";
        виклWord += викладач;
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: виклWord, ...шрифтОсновний })],
            alignment: D.AlignmentType.RIGHT,
            spacing: { after: 60 }
        }));
    }

    // Власні додані поля
    власніПоляТитулки.forEach(function(item) {
        if (item.назва || item.значення) {
            абзаци.push(new D.Paragraph({
                children: [new D.TextRun({ text: item.назва + ": " + item.значення, ...шрифтОсновний })],
                alignment: D.AlignmentType.RIGHT,
                spacing: { after: 60 }
            }));
        }
    });

    // Місто та рік
    var рядокНиз = "";
    if (місто && рік) рядокНиз = місто + " — " + рік;
    else if (місто) рядокНиз = місто;
    else if (рік) рядокНиз = рік;

    if (рядокНиз) {
        for (var k = 0; k < 4; k++) {
            абзаци.push(new D.Paragraph({ children: [], spacing: { after: 200 } }));
        }
        абзаци.push(new D.Paragraph({
            children: [new D.TextRun({ text: рядокНиз, ...шрифтОсновний })],
            alignment: D.AlignmentType.CENTER
        }));
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
        var назваФайлу = "Титульна_" + (тип.replace(/ /g, "_"));
        if (номер) назваФайлу += "_" + номер;
        назваФайлу += ".docx";

        saveAs(blob, назваФайлу);
        оновитиЛічильникДокументів();
        показатиСповіщення("Титульну сторінку завантажено: " + назваФайлу, "успіх");
    });
}

function друкуватиТитулку() {
    window.print();
}

// ============================================================
// 7. КОНСТРУКТОР ЗВІТУ (З ВЛАСНИМИ РОЗДІЛАМИ)
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

// Додавання власного довільного розділу звіту
function додатиВласнийРозділЗвіту() {
    var назва = prompt("Введіть назву нового розділу:", "Вступ");
    if (!назва || !назва.trim()) return;

    var новийІндекс = власніРозділиЗвіту.length;
    власніРозділиЗвіту.push({
        назва: назва.trim(),
        текст: ""
    });

    перемалюватиВласніРозділиЗвіту();
    показатиСповіщення("Розділ «" + назва + "» успішно додано!", "успіх");
    оновитиЧекліст();
}

function видалитиВласнийРозділЗвіту(idx) {
    власніРозділиЗвіту.splice(idx, 1);
    перемалюватиВласніРозділиЗвіту();
    оновитиЧекліст();
}

function оновитиТекстВласногоРозділу(idx, val) {
    if (власніРозділиЗвіту[idx]) {
        власніРозділиЗвіту[idx].текст = val;
        оновитиЧекліст();
    }
}

function перемалюватиВласніРозділиЗвіту() {
    var конт = document.getElementById("користувацькі-розділи-список");
    if (!конт) return;
    конт.innerHTML = "";

    власніРозділиЗвіту.forEach(function(item, idx) {
        var card = document.createElement("div");
        card.className = "accordion-section";
        card.innerHTML = 
            "<div style='display:flex; justify-content:space-between; align-items:center; background:#ffffff;'>" +
            "  <button class='accordion-trigger' style='flex:1;' onclick='переключитиРозділ(this)'>" +
            "    <div class='acc-title-left'>" +
            "      <span class='acc-index' style='background:#ecfdf5; color:#059669;'>" + (8 + idx) + "</span>" +
            "      <span class='acc-name'>" + escapeHtml(item.назва) + "</span>" +
            "      <span class='acc-badge'>Власний розділ</span>" +
            "    </div>" +
            "    <span class='acc-toggle-icon'>&plus;</span>" +
            "  </button>" +
            "  <button class='qa-del-btn' style='position:static; margin-right:16px;' onclick='видалитиВласнийРозділЗвіту(" + idx + ")' title='Видалити цей розділ'>&times;</button>" +
            "</div>" +
            "<div class='accordion-content' style='display:none; padding-top:16px;'>" +
            "  <textarea class='form-control' rows='5' placeholder='Введіть зміст розділу «" + escapeHtml(item.назва) + "»...' oninput='оновитиТекстВласногоРозділу(" + idx + ", this.value)'>" + escapeHtml(item.текст) + "</textarea>" +
            "</div>";
        конт.appendChild(card);
    });
}

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
                img.style.borderRadius = "8px";
                img.style.border = "1px solid #cbd5e1";
                img.style.boxShadow = "0 2px 6px rgba(0,0,0,0.08)";
                прев.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
        показатиСповіщення("Зображення завантажено", "інфо");
    }
}

// Експорт повного звіту у Word (.docx)
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

    // 3. Хід роботи та лістинги коду (будь-яка мова)
    var хід = document.getElementById("хід-роботи").value.trim();
    var код = document.getElementById("код-програми").value;
    var маєКод = (код && код.trim()) || (додатковіБлокиКоду.some(function(b) { return b.код && b.код.trim(); }));

    if (хід || маєКод) {
        додатиЗаголовок("3. ХІД ВИКОНАННЯ РОБОТИ");
        if (хід) додатиТекст(хід);

        if (код && код.trim()) {
            var мова = (document.getElementById("мова-коду") ? document.getElementById("мова-коду").value.trim() : "");
            var файл = (document.getElementById("назва-файлу") ? document.getElementById("назва-файлу").value.trim() : "");
            var заголовокКоду = "Лістинг коду програми";
            if (файл || мова) {
                заголовокКоду += " (" + (файл ? файл + ", " : "") + (мова ? "мова " + мова : "") + "):";
            } else {
                заголовокКоду += ":";
            }

            абзаци.push(new D.Paragraph({
                children: [new D.TextRun({ text: заголовокКоду, ...шрифтЖирний })],
                spacing: { before: 140, after: 80 },
                indent: відступ
            }));

            var рядкиКоду = код.split("\n");
            рядкиКоду.forEach(function(k) {
                абзаци.push(new D.Paragraph({
                    children: [new D.TextRun({ text: k, font: "Consolas", size: 20 })],
                    spacing: { line: 240, after: 0 }
                }));
            });
        }

        // Додаткові блоки коду
        додатковіБлокиКоду.forEach(function(b, idx) {
            if (b.код && b.код.trim()) {
                var підпис = "Лістинг коду № " + (idx + 2);
                if (b.файл || b.мова) {
                    підпис += " (" + (b.файл ? b.файл + ", " : "") + (b.мова ? "мова " + b.мова : "") + "):";
                } else {
                    підпис += ":";
                }

                абзаци.push(new D.Paragraph({
                    children: [new D.TextRun({ text: підпис, ...шрифтЖирний })],
                    spacing: { before: 140, after: 80 },
                    indent: відступ
                }));

                var рядкиДод = b.код.split("\n");
                рядкиДод.forEach(function(k) {
                    абзаци.push(new D.Paragraph({
                        children: [new D.TextRun({ text: k, font: "Consolas", size: 20 })],
                        spacing: { line: 240, after: 0 }
                    }));
                });
            }
        });
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

    // 7. Власні користувацькі розділи
    власніРозділиЗвіту.forEach(function(r, i) {
        if (r.назва && r.текст) {
            додатиЗаголовок((7 + i) + ". " + r.назва.toUpperCase());
            додатиТекст(r.текст);
        }
    });

    // 8. Список джерел (ДСТУ)
    if (списокДжерел.length > 0) {
        додатиЗаголовок("СПИСОК ВИКОРИСТАНИХ ДЖЕРЕЛ");
        списокДжерел.forEach(function(item, idx) {
            абзаци.push(new D.Paragraph({
                children: [new D.TextRun({ text: (idx + 1) + ". " + item, ...шрифт })],
                alignment: D.AlignmentType.JUSTIFIED,
                spacing: { line: 360, after: 80 },
                indent: відступ
            }));
        });
    }

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

function зберегтиЧернеткуФайлом() {
    var чернетка = {
        мета: document.getElementById("мета-роботи").value,
        теорія: document.getElementById("теорія").value,
        хід: document.getElementById("хід-роботи").value,
        код: document.getElementById("код-програми").value,
        результати: document.getElementById("результати").value,
        висновки: document.getElementById("висновки").value,
        запитання: контрольніЗапитання,
        власніРозділи: власніРозділиЗвіту,
        джерела: списокДжерел,
        дата: new Date().toISOString()
    };
    
    // Зберігаємо також у браузері
    localStorage.setItem("studdoc_draft", JSON.stringify(чернетка));
    
    // Одразу віддаємо справжній файл для завантаження на комп'ютер!
    var jsonStr = JSON.stringify(чернетка, null, 2);
    var blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
    saveAs(blob, "Чернетка_звіту_StudDoc.json");
    
    показатиСповіщення("Файл чернетки успішно завантажено на ваш пристрій!", "успіх");
}

function зберегтиЧернетку() {
    зберегтиЧернеткуФайлом();
}

function завантажитиЧернеткуЗФайлу(input) {
    if (!input.files || input.files.length === 0) return;
    var file = input.files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        try {
            var d = JSON.parse(e.target.result);
            if (d.мета !== undefined) document.getElementById("мета-роботи").value = d.мета;
            if (d.теорія !== undefined) document.getElementById("теорія").value = d.теорія;
            if (d.хід !== undefined) document.getElementById("хід-роботи").value = d.хід;
            if (d.код !== undefined) document.getElementById("код-програми").value = d.код;
            if (d.результати !== undefined) document.getElementById("результати").value = d.результати;
            if (d.висновки !== undefined) document.getElementById("висновки").value = d.висновки;
            if (d.запитання) {
                контрольніЗапитання = d.запитання;
                перемалюватиЗапитання();
            }
            if (d.власніРозділи) {
                власніРозділиЗвіту = d.власніРозділи;
                перемалюватиВласніРозділиЗвіту();
            }
            if (d.джерела) {
                списокДжерел = d.джерела;
                перемалюватиДжерела();
            }
            оновитиЧекліст();
            показатиСповіщення("Чернетку з файлу «" + file.name + "» успішно відновлено!", "успіх");
        } catch (err) {
            показатиСповіщення("Не вдалося прочитати файл чернетки", "інфо");
        }
    };
    reader.readAsText(file);
    input.value = "";
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
        if (d.власніРозділи) {
            власніРозділиЗвіту = d.власніРозділи;
            перемалюватиВласніРозділиЗвіту();
        }
    } catch (e) {}
}

function очиститиЗвіт() {
    ["мета-роботи", "теорія", "хід-роботи", "код-програми", "результати", "висновки"].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.value = "";
    });
    контрольніЗапитання = [];
    власніРозділиЗвіту = [];
    перемалюватиЗапитання();
    перемалюватиВласніРозділиЗвіту();
    localStorage.removeItem("studdoc_draft");
    показатиСповіщення("Поля звіту очищено", "інфо");
    оновитиЧекліст();
}

// ============================================================
// 8. НОРМОКОНТРОЛЬ ТЕКСТУ
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

    // 3. Пробіли перед знаками пунктуації
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

    // 6. Тире між словами
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

    var кстьСлів = (результат.match(/\S+/g) || []).length;
    var поточніСлова = parseInt(localStorage.getItem("studdoc_words") || "340") + кстьСлів;
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
// 9. СПИСОК ДЖЕРЕЛ (ДСТУ 8302:2015)
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

function перенестиДжерелаУЗвіт() {
    if (списокДжерел.length === 0) {
        показатиСповіщення("Спочатку додайте хоча б одне джерело", "інфо");
        return;
    }
    перейтиДо("конструктор");
    показатиСповіщення("Джерела підключено до звіту та експорту Word!", "успіх");
}

// ============================================================
// 10. АНАЛІТИКА, ПРОГРЕС ТА ЧЕК-ЛІСТ
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

    // Розрахунок відсотка прогресу
    var балів = 0;
    if (ст) балів += 25;
    if (мета) балів += 25;
    if (хід) балів += 25;
    if (висн) балів += 25;

    var elPercent = document.getElementById("progress-percent");
    var elFill = document.getElementById("progress-fill");
    if (elPercent) elPercent.textContent = балів + "%";
    if (elFill) elFill.style.width = балів + "%";

    // Підрахунок обсягу
    var повнийТекст = (мета + " " + хід + " " + висн).trim();
    власніРозділиЗвіту.forEach(function(r) {
        if (r.текст) повнийТекст += " " + r.текст;
    });

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
// 11. ЗАПОВНЕННЯ ЗРАЗКА (ДЕМО)
// ============================================================

function заповнитиДемо() {
    document.getElementById("тип-роботи").value = "Практична робота";
    document.getElementById("номер-роботи").value = "4";
    document.getElementById("варіант").value = "3";
    document.getElementById("дисципліна").value = "Об'єктно-орієнтоване програмування";
    document.getElementById("тема-роботи").value = "Побудова трирівневої архітектури програмного комплексу";
    document.getElementById("заклад").value = "Відокремлений структурний підрозділ «Фаховий коледж»";
    document.getElementById("відділення").value = "Відділення комп'ютерних технологій";
    document.getElementById("кафедра").value = "Циклова комісія інженерії ПЗ";
    document.getElementById("студент-піб").value = "Шевченко Т. Г.";
    document.getElementById("група").value = "ІПЗ-21";
    document.getElementById("спеціальність").value = "121 Інженерія програмного забезпечення";
    document.getElementById("курс").value = "3";
    document.getElementById("викладач-піб").value = "Петренко П. П.";
    document.getElementById("викладач-посада").value = "доцент, к.т.н.";
    document.getElementById("місто").value = "Київ";
    document.getElementById("рік").value = "2026";

    // Додаємо зразок власного поля титулки
    власніПоляТитулки = [
        { назва: "Рецензент", значення: "проф. Коваль В. І." },
        { назва: "Оцінка", значення: "«Зараховано»" }
    ];
    перемалюватиВласніПоляТитулки();

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

    // Додаємо зразок власного розділу звіту
    власніРозділиЗвіту = [
        { назва: "Вступ", текст: "Сучасна розробка програмного забезпечення вимагає чіткого структурування коду та дотримання стандартів інженерії." }
    ];
    перемалюватиВласніРозділиЗвіту();

    оновитиПрев();
    показатиСповіщення("Зразок даних завантажено!", "успіх");
}

function оновитиЛічильникДокументів() {
    var п = parseInt(localStorage.getItem("studdoc_docs") || "1") + 1;
    localStorage.setItem("studdoc_docs", String(п));
    var el = document.getElementById("stat-docs");
    if (el) el.textContent = п;
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ============================================================
// 12. ПІДТРИМКА БУДЬ-ЯКИХ МОВ ПРОГРАМУВАННЯ ТА БЛОКІВ КОДУ
// ============================================================

var додатковіБлокиКоду = [];

function обратиМовуКоду(новаМова, ім'яФайлу) {
    var elМова = document.getElementById("мова-коду");
    var elФайл = document.getElementById("назва-файлу");
    if (elМова) elМова.value = новаМова;
    if (elФайл && ім'яФайлу) elФайл.value = ім'яФайлу;

    document.querySelectorAll(".lang-pill").forEach(function(pill) {
        if (pill.textContent.indexOf(новаМова) !== -1 || (новаМова === 'Інша' && pill.textContent.indexOf('Будь-яка') !== -1)) {
            pill.classList.add("active");
        } else {
            pill.classList.remove("active");
        }
    });
    показатиСповіщення("Обрано мову: " + новаМова, "інфо");
}

function додатиБлокКоду() {
    var id = "code_" + Date.now();
    додатковіБлокиКоду.push({
        id: id,
        мова: "C++",
        файл: "module.cpp",
        код: ""
    });
    ререндеритиДодатковіБлокиКоду();
    показатиСповіщення("Додано додатковий блок коду", "успіх");
}

function видалитиБлокКоду(id) {
    додатковіБлокиКоду = додатковіБлокиКоду.filter(function(b) { return b.id !== id; });
    ререндеритиДодатковіБлокиКоду();
}

function оновитиДаніБлокуКоду(id, поле, значення) {
    var block = додатковіБлокиКоду.find(function(b) { return b.id === id; });
    if (block) {
        block[поле] = значення;
    }
}

function ререндеритиДодатковіБлокиКоду() {
    var box = document.getElementById("список-додаткових-блоків-коду");
    if (!box) return;
    box.innerHTML = "";

    додатковіБлокиКоду.forEach(function(item, idx) {
        var card = document.createElement("div");
        card.className = "code-block-card";
        card.innerHTML = 
            '<div class="code-header">' +
                '<strong>Блок коду № ' + (idx + 2) + ' (Будь-яка мова)</strong>' +
                '<button type="button" class="btn btn-sm" style="color:#ef4444; background:transparent; padding:2px 6px;" onclick="видалитиБлокКоду(\'' + item.id + '\')">✕ Вилучити</button>' +
            '</div>' +
            '<div class="grid-2" style="margin-bottom:8px;">' +
                '<input type="text" class="form-control" style="background:#020617; color:#f8fafc; border-color:#334155;" placeholder="Мова (Python, JS, C++, SQL...)" value="' + escapeHtml(item.мова) + '" oninput="оновитиДаніБлокуКоду(\'' + item.id + '\', \'мова\', this.value)">' +
                '<input type="text" class="form-control" style="background:#020617; color:#f8fafc; border-color:#334155;" placeholder="Назва файлу" value="' + escapeHtml(item.файл) + '" oninput="оновитиДаніБлокуКоду(\'' + item.id + '\', \'файл\', this.value)">' +
            '</div>' +
            '<textarea rows="5" placeholder="// Код програми на будь-якій мові..." oninput="оновитиДаніБлокуКоду(\'' + item.id + '\', \'код\', this.value)">' + escapeHtml(item.код) + '</textarea>';
        box.appendChild(card);
    });
}

// ============================================================
// 13. ПОПЕРЕДНІЙ ПЕРЕГЛЯД ТА ПЕРЕВІРКА ПЕРЕД ЗАВАНТАЖЕННЯМ
// ============================================================

var поточнийТипЗавантаження = "титулка";

function переглянутиПередЗавантаженням(тип) {
    поточнийТипЗавантаження = тип;
    var reviewBox = document.getElementById("вміст-перевірки-документа");
    var modal = document.getElementById("модальне-перегляд-перед-завантаженням");
    if (!reviewBox || !modal) return;

    var html = "";

    if (тип === "титулка") {
        var типРоботи = (чиУвімкнено("чек-тип") ? (document.getElementById("тип-роботи").value || "") : "");
        var номер = чиУвімкнено("чек-номер") ? document.getElementById("номер-роботи").value.trim() : "";
        var дисципліна = чиУвімкнено("чек-дисципліна") ? document.getElementById("дисципліна").value.trim() : "";
        var тема = чиУвімкнено("чек-тема") ? document.getElementById("тема-роботи").value.trim() : "";
        var заклад = чиУвімкнено("чек-заклад") ? document.getElementById("заклад").value.trim() : "";
        var студент = чиУвімкнено("чек-студент") ? document.getElementById("студент-піб").value.trim() : "";
        var група = чиУвімкнено("чек-група") ? document.getElementById("група").value.trim() : "";
        var курс = чиУвімкнено("чек-курс") ? document.getElementById("курс").value.trim() : "";
        var спец = чиУвімкнено("чек-спец") ? document.getElementById("спеціальність").value.trim() : "";
        var викладач = чиУвімкнено("чек-викладач") ? document.getElementById("викладач-піб").value.trim() : "";
        var посада = чиУвімкнено("чек-посада") ? document.getElementById("викладач-посада").value.trim() : "";
        var місто = чиУвімкнено("чек-місто") ? document.getElementById("місто").value.trim() : "";
        var рік = чиУвімкнено("чек-рік") ? document.getElementById("рік").value.trim() : "";

        html += "<h4>ЗВЕДЕННЯ ТИТУЛЬНОЇ СТОРІНКИ (ДСТУ 3008:2015)</h4>";
        html += "<div class='doc-review-line'><strong>Навчальний заклад:</strong> " + (заклад || "<em>Не вказано (буде вилучено з бланка)</em>") + "</div>";
        html += "<div class='doc-review-line'><strong>Вид роботи:</strong> " + (типРоботи || "РОБОТА") + (номер ? " № " + номер : "") + "</div>";
        html += "<div class='doc-review-line'><strong>Дисципліна:</strong> " + (дисципліна ? "«" + дисципліна + "»" : "<em>Не вказано</em>") + "</div>";
        html += "<div class='doc-review-line'><strong>Тема роботи:</strong> " + (тема || "<em>Не вказано</em>") + "</div>";
        html += "<div class='doc-review-line'><strong>Виконавець:</strong> " + (студент || "<em>Студент(ка)</em>") + (група ? ", група " + група : "") + (курс ? ", " + курс + " курс" : "") + (спец ? ", спец. " + спец : "") + "</div>";
        html += "<div class='doc-review-line'><strong>Перевірив:</strong> " + (посада ? посада + " " : "") + (викладач || "<em>Не вказано</em>") + "</div>";
        
        if (власніПоляТитулки.length > 0) {
            html += "<div class='doc-review-line'><strong>Додаткові поля:</strong> " + 
                власніПоляТитулки.map(function(f){ return escapeHtml(f.назва) + ": " + escapeHtml(f.значення); }).join("; ") + "</div>";
        }
        
        html += "<div class='doc-review-line'><strong>Вихідні дані:</strong> " + (місто || "Київ") + " — " + (рік || "2026") + "</div>";
    } else {
        var мета = document.getElementById("мета-роботи").value.trim();
        var теорія = document.getElementById("теорія").value.trim();
        var хід = document.getElementById("хід-роботи").value.trim();
        var код = document.getElementById("код-програми").value.trim();
        var моваКоду = document.getElementById("мова-коду").value.trim() || "Код";
        var файлКоду = document.getElementById("назва-файлу").value.trim();
        var результати = document.getElementById("результати").value.trim();
        var висновки = document.getElementById("висновки").value.trim();

        html += "<h4>ЗВЕДЕННЯ РОЗДІЛІВ ЗВІТУ (ДСТУ 3008:2015)</h4>";
        html += "<div class='doc-review-line'><strong>1. Мета роботи:</strong> " + (мета ? "✓ Заповнено (" + мета.length + " знаків)" : "<em>Не заповнено (буде пропущено)</em>") + "</div>";
        html += "<div class='doc-review-line'><strong>2. Теоретичні відомості:</strong> " + (теорія ? "✓ Заповнено (" + теорія.length + " знаків)" : "<em>Пропущено</em>") + "</div>";
        html += "<div class='doc-review-line'><strong>3. Хід виконання роботи:</strong> " + (хід ? "✓ Заповнено (" + хід.length + " знаків)" : "<em>Пропущено</em>") + "</div>";

        var всьогоКоду = 0;
        if (код) всьогоКоду++;
        всьогоКоду += додатковіБлокиКоду.filter(function(b){ return b.код && b.код.trim().length > 0; }).length;

        html += "<div class='doc-review-line'><strong>4. Програмний код:</strong> " + (всьогоКоду > 0 ? "✓ Включено " + всьогоКоду + " блок(ів) коду (" + (файлКоду ? файлКоду + ", " : "") + моваКоду + ")" : "<em>Без лістингу</em>") + "</div>";
        html += "<div class='doc-review-line'><strong>5. Результати роботи:</strong> " + (результати ? "✓ Заповнено" : "<em>Пропущено</em>") + "</div>";
        html += "<div class='doc-review-line'><strong>6. Висновки:</strong> " + (висновки ? "✓ Заповнено (" + висновки.length + " знаків)" : "<em>Пропущено</em>") + "</div>";
        html += "<div class='doc-review-line'><strong>7. Контрольні запитання:</strong> " + (контрольніЗапитання.length > 0 ? "✓ " + контрольніЗапитання.length + " запитань з відповідями" : "<em>Не додано</em>") + "</div>";
        if (власніРозділиЗвіту.length > 0) {
            html += "<div class='doc-review-line'><strong>8. Додаткові розділи:</strong> ✓ " + власніРозділиЗвіту.length + " розд.</div>";
        }
        html += "<div class='doc-review-line'><strong>9. Список використаних джерел:</strong> " + (списокДжерел.length > 0 ? "✓ " + списокДжерел.length + " джерел (ДСТУ 8302)" : "<em>Не додано</em>") + "</div>";
    }

    reviewBox.innerHTML = html;
    modal.style.display = "flex";
}

function закритиПереглядПередЗавантаженням() {
    var modal = document.getElementById("модальне-перегляд-перед-завантаженням");
    if (modal) modal.style.display = "none";
}

function підтвердитиЗавантаження() {
    закритиПереглядПередЗавантаженням();
    if (поточнийТипЗавантаження === "титулка") {
        завантажитиТитулку();
    } else {
        завантажитиЗвіт();
    }
}

// ============================================================
// 14. МОБІЛЬНИЙ ДОДАТОК (PWA) ТА СТОР-ГІДИ
// ============================================================

var deferredPrompt = null;
window.addEventListener("beforeinstallprompt", function(e) {
    e.preventDefault();
    deferredPrompt = e;
    var btn = document.getElementById("btn-pwa-install");
    if (btn) btn.style.display = "inline-flex";
});

function встановитиДодаток() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function(choiceResult) {
            if (choiceResult.outcome === "accepted") {
                показатиСповіщення("StudDoc встановлено на пристрій!", "успіх");
            }
            deferredPrompt = null;
        });
    } else {
        показатиГідСтору("all");
    }
}

function показатиГідСтору(платформа) {
    var modal = document.getElementById("модальне-стор");
    var title = document.getElementById("заголовок-стору");
    var body = document.getElementById("тіло-гіда-стору");
    if (!modal || !title || !body) return;

    if (платформа === "apple") {
        title.innerHTML = "🍏 Встановлення на iPhone та iPad (Apple)";
        body.innerHTML = 
            "<p><strong>Як зберегти StudDoc як додаток iOS (працює як з App Store):</strong></p>" +
            "<ol style='margin-left:20px; margin-top:8px; line-height:1.7;'>" +
                "<li>Відкрийте StudDoc у стандартному браузері <strong>Safari</strong>.</li>" +
                "<li>Натисніть кнопку <strong>«Поділитися»</strong> (іконка квадрата зі стрілкою вгору внизу екрана).</li>" +
                "<li>Прокрутіть меню та оберіть <strong>«На початковий екран» (Add to Home Screen)</strong>.</li>" +
                "<li>Натисніть <strong>«Додати»</strong>. Додаток з'явиться на робочому столі з фірмовою іконкою!</li>" +
            "</ol>";
    } else if (платформа === "google") {
        title.innerHTML = "🤖 Встановлення на Android (Google Play / PWA)";
        body.innerHTML = 
            "<p><strong>Як встановити StudDoc на телефон Android:</strong></p>" +
            "<ol style='margin-left:20px; margin-top:8px; line-height:1.7;'>" +
                "<li>Відкрийте StudDoc у браузері <strong>Google Chrome</strong>.</li>" +
                "<li>Натисніть на три крапки в правому верхньому кутку браузера.</li>" +
                "<li>Оберіть пункт <strong>«Встановити додаток»</strong> або <strong>«Додати на головний екран»</strong>.</li>" +
                "<li>StudDoc працюватиме як повноцінний автономний мобільний додаток!</li>" +
            "</ol>";
    } else if (платформа === "microsoft") {
        title.innerHTML = "💻 Встановлення на комп'ютер Windows (ПК / Ноутбук)";
        body.innerHTML = 
            "<p><strong>Як встановити додаток на Windows 10/11:</strong></p>" +
            "<ol style='margin-left:20px; margin-top:8px; line-height:1.7;'>" +
                "<li>Відкрийте StudDoc у браузері <strong>Microsoft Edge</strong> або <strong>Google Chrome</strong>.</li>" +
                "<li>В адресному рядку праворуч натисніть значок <strong>«Встановити додаток StudDoc»</strong>.</li>" +
                "<li>Додаток додасться у меню Пуск Windows та працюватиме офлайн!</li>" +
            "</ol>";
    } else {
        title.innerHTML = "📲 Встановлення додатку StudDoc";
        body.innerHTML = 
            "<p>StudDoc працює на всіх смартфонах та ПК безкоштовно та без лімітів:</p>" +
            "<ul style='margin-left:20px; margin-top:8px; line-height:1.7;'>" +
                "<li><strong>iPhone / iPad:</strong> Safari ➔ «Поділитися» ➔ «На початковий екран».</li>" +
                "<li><strong>Android:</strong> Chrome ➔ Меню ➔ «Встановити додаток».</li>" +
                "<li><strong>Windows PC:</strong> Edge / Chrome ➔ Іконка в адресному рядку «Встановити».</li>" +
            "</ul>";
    }

    modal.style.display = "flex";
}

function закритиГідСтору() {
    var modal = document.getElementById("модальне-стор");
    if (modal) modal.style.display = "none";
}

// Реєстрація Service Worker для підтримки PWA офлайн (тільки для http/https)
if ("serviceWorker" in navigator && (window.location.protocol === "http:" || window.location.protocol === "https:")) {
    window.addEventListener("load", function() {
        navigator.serviceWorker.register("./sw.js").catch(function() {});
    });
}

// Підтримка гарячих клавіш стрілочок навігації (Alt + Left / Alt + Right)
window.addEventListener("keydown", function(e) {
    if (e.altKey && e.key === "ArrowLeft") {
        навігаціяНазад();
    } else if (e.altKey && e.key === "ArrowRight") {
        навігаціяВперед();
    }
});

window.addEventListener("DOMContentLoaded", function() {
    var docs = localStorage.getItem("studdoc_docs") || "1";
    var words = localStorage.getItem("studdoc_words") || "340";
    if (document.getElementById("stat-docs")) document.getElementById("stat-docs").textContent = docs;
    if (document.getElementById("stat-words")) document.getElementById("stat-words").textContent = words;

    завантажитиПрофіль();
    завантажитиЧернетку();
    оновитиПрев();
    оновитиСтрілочкиНавігації();
});
