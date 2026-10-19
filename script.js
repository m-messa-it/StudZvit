// StudZvit — Логіка веб-сервісу автоматизованого формування
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
var списокСторінок = ["головна", "титулка", "конструктор", "нормоконтроль", "чернетки"];

function назваСторінки(ід) {
    var names = {
        "головна": "Головна",
        "титулка": "Титульна сторінка",
        "конструктор": "Конструктор звіту",
        "нормоконтроль": "Перевірка тексту",
        "чернетки": "Збережені чернетки"
    };
    return names[ід] || ід;
}

function оновитиСтрілочкиНавігації() {
    var canGoBack = (індексІсторії > 0);
    var canGoForward = (індексІсторії < історіяНавігації.length - 1);
    try {
        if (window.mermaid) mermaid.run();
    } catch(e) {}

    document.querySelectorAll(".btn-nav-back").forEach(function(btn) {
        if (canGoBack) {
            var prev = історіяНавігації[індексІсторії - 1];
            btn.title = "Повернутися назад: " + назваСторінки(prev);
        } else {
            var поточна = історіяНавігації[індексІсторії] || "головна";
            var idx = списокСторінок.indexOf(поточна);
            if (idx > 0) {
                btn.title = "До попереднього розділу: " + назваСторінки(списокСторінок[idx - 1]);
            } else {
                btn.title = "Головна сторінка";
            }
        }
    });

    document.querySelectorAll(".btn-nav-forward").forEach(function(btn) {
        if (canGoForward) {
            var next = історіяНавігації[індексІсторії + 1];
            btn.title = "Перейти вперед: " + назваСторінки(next);
        } else {
            var поточна = історіяНавігації[індексІсторії] || "головна";
            var idx = списокСторінок.indexOf(поточна);
            if (idx >= 0 && idx < списокСторінок.length - 1) {
                btn.title = "До наступного розділу: " + назваСторінки(списокСторінок[idx + 1]);
            } else {
                btn.title = "Кінець розділів";
            }
        }
    });
}

function перейтиДо(ідСторінки, безІсторії) {
    if (!ідСторінки) ідСторінки = "головна";

    if (!безІсторії) {
        if (індексІсторії < історіяНавігації.length - 1) {
            історіяНавігації = історіяНавігації.slice(0, індексІсторії + 1);
        }
        if (історіяНавігації[індексІсторії] !== ідСторінки) {
            історіяНавігації.push(ідСторінки);
            індексІсторії = історіяНавігації.length - 1;
        }
        try {
            if (window.location.hash !== "#" + ідСторінки) {
                history.pushState({ page: ідСторінки, idx: індексІсторії }, "", "#" + ідСторінки);
            }
        } catch(e) {}
    }

    оновитиСтрілочкиНавігації();

    document.querySelectorAll(".page-view").forEach(function(el) {
        el.style.display = "none";
    });

    if (ідСторінки === "джерела") ідСторінки = "конструктор";
    if (ідСторінки === "про-сервіс") ідСторінки = "головна";

    var цільова = document.getElementById(ідСторінки);
    if (цільова) {
        цільова.style.display = "block";
    }

    if (ідСторінки === "чернетки") {
        відобразитиЧернетки();
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

window.addEventListener("popstate", function(e) {
    if (e.state && e.state.page) {
        if (typeof e.state.idx === "number") індексІсторії = e.state.idx;
        перейтиДо(e.state.page, true);
        показатиСповіщення("⬅️ Перейшли до: " + назваСторінки(e.state.page), "інфо");
    } else {
        var hashPage = window.location.hash.replace("#", "");
        if (hashPage && document.getElementById(hashPage)) {
            перейтиДо(hashPage, true);
        } else {
            навігаціяНазад();
        }
    }
});

function навігаціяНазад() {
    if (індексІсторії > 0) {
        індексІсторії--;
        var targetPage = історіяНавігації[індексІсторії];
        перейтиДо(targetPage, true);
        try { history.replaceState({ page: targetPage, idx: індексІсторії }, "", "#" + targetPage); } catch(e) {}
        показатиСповіщення("⬅️ Повернулися: " + назваСторінки(targetPage), "інфо");
    } else {
        var поточна = історіяНавігації[індексІсторії] || "головна";
        var idx = списокСторінок.indexOf(поточна);
        if (idx > 0) {
            var target = списокСторінок[idx - 1];
            історіяНавігації.unshift(target);
            перейтиДо(target, true);
            try { history.replaceState({ page: target, idx: 0 }, "", "#" + target); } catch(e) {}
            показатиСповіщення("⬅️ Перейшли до: " + назваСторінки(target), "інфо");
        } else {
            показатиСповіщення("Ви на головній сторінці", "інфо");
        }
    }
}

function навігаціяВперед() {
    if (індексІсторії < історіяНавігації.length - 1) {
        індексІсторії++;
        var targetPage = історіяНавігації[індексІсторії];
        перейтиДо(targetPage, true);
        try { history.replaceState({ page: targetPage, idx: індексІсторії }, "", "#" + targetPage); } catch(e) {}
        показатиСповіщення("➡️ Перейшли вперед: " + назваСторінки(targetPage), "інфо");
    } else {
        var поточна = історіяНавігації[індексІсторії] || "головна";
        var idx = списокСторінок.indexOf(поточна);
        if (idx >= 0 && idx < списокСторінок.length - 1) {
            var target = списокСторінок[idx + 1];
            історіяНавігації.push(target);
            індексІсторії = історіяНавігації.length - 1;
            перейтиДо(target, true);
            try { history.replaceState({ page: target, idx: індексІсторії }, "", "#" + target); } catch(e) {}
            показатиСповіщення("➡️ Перейшли до: " + назваСторінки(target), "інфо");
        } else {
            показатиСповіщення("Останній розділ сервісу", "інфо");
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
    saveAs(blob, "Чернетка_звіту_StudZvit.json");
    
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

function вставитиЗразокДляПлагіату() {
    var txt = "Автоматизація процесів створення студентської навчальної документації є ключовим завданням сучасної цифрової освіти. Розробка вебсервісу дозволяє оптимізувати оформлення звітів, зменшити рутинні витрати часу та забезпечити повну відповідність стандартам коледжу.";
    var input = document.getElementById("плагіат-вхід");
    if (input) input.value = txt;
    показатиСповіщення("Зразок фрагмента тексту вставлено", "інфо");
}

function запуститиШвидкийТестПлагіату() {
    var input = document.getElementById("плагіат-вхід");
    var text = input ? input.value.trim() : "";
    if (!text) {
        показатиСповіщення("Введіть фрагмент тексту для перевірки на плагіат", "інфо");
        return;
    }

    var words = text.toLowerCase().match(/[\p{L}\p{Nd}]+/gu) || [];
    if (words.length < 8) {
        показатиСповіщення("Фрагмент занадто короткий (менше 8 слів)", "інфо");
        return;
    }

    var shingles = new Set();
    var duplicateCount = 0;
    for (var i = 0; i < words.length - 2; i++) {
        var shingle = words[i] + " " + words[i+1] + " " + words[i+2];
        if (shingles.has(shingle)) {
            duplicateCount++;
        } else {
            shingles.add(shingle);
        }
    }

    var totalShingles = Math.max(1, words.length - 2);
    var dtp = Math.round((duplicateCount / totalShingles) * 100);
    var originality = Math.max(0, 100 - dtp);

    var resBlock = document.getElementById("плагіат-результат-блок");
    var elOrig = document.getElementById("плагіат-відсоток");
    var elDtp = document.getElementById("плагіат-дтп");
    var elStatus = document.getElementById("плагіат-статус");

    if (resBlock) resBlock.style.display = "block";
    if (elOrig) {
        elOrig.textContent = originality + "%";
        elOrig.style.color = originality >= 75 ? "var(--accent-emerald)" : (originality >= 50 ? "#eab308" : "#ef4444");
    }
    if (elDtp) {
        elDtp.textContent = dtp + "%";
    }
    if (elStatus) {
        if (originality >= 80) {
            elStatus.textContent = "Висока унікальність (Норма)";
            elStatus.style.color = "var(--accent-emerald)";
        } else if (originality >= 55) {
            elStatus.textContent = "Задовільна унікальність";
            elStatus.style.color = "#eab308";
        } else {
            elStatus.textContent = "Високий відсоток збігів (ДТП)";
            elStatus.style.color = "#ef4444";
        }
    }

    показатиСповіщення("Швидкий тест унікальності завершено: " + originality + "%", "успіх");
}

function отриматиВсіЧернетки() {
    var raw = localStorage.getItem("studzvit_drafts_v2");
    if (!raw) return [];
    try {
        return JSON.parse(raw) || [];
    } catch(e) {
        return [];
    }
}

function зберегтиПоточнийЗвітУЧернетки() {
    var студ = document.getElementById("студент-піб") ? document.getElementById("студент-піб").value.trim() : "";
    var тема = document.getElementById("титулка-тема") ? document.getElementById("титулка-тема").value.trim() : "";
    var предм = document.getElementById("титулка-дисципліна") ? document.getElementById("титулка-дисципліна").value.trim() : "";
    var тип = document.getElementById("тип-роботи") ? document.getElementById("тип-роботи").value : "Практична робота";

    var чернетка = {
        id: "draft_" + Date.now(),
        назва: (тип + ": " + (тема || предм || "Звіт без назви")),
        студент: студ || "Студент(ка)",
        дисципліна: предм || "Спеціальність 121",
        дата: new Date().toLocaleString("uk-UA"),
        payload: {
            студент: студ,
            тема: тема,
            дисципліна: предм,
            тип: тип,
            номер: document.getElementById("титулка-номер") ? document.getElementById("титулка-номер").value : "1",
            група: document.getElementById("студент-група") ? document.getElementById("студент-група").value : "ІТ-32",
            викладач: document.getElementById("викладач-піб") ? document.getElementById("викладач-піб").value : "Ковальчук В. Б.",
            мета: document.getElementById("мета-роботи") ? document.getElementById("мета-роботи").value : "",
            теорія: document.getElementById("теорія") ? document.getElementById("теорія").value : "",
            хід: document.getElementById("хід-роботи") ? document.getElementById("хід-роботи").value : "",
            код: document.getElementById("код-програми") ? document.getElementById("код-програми").value : "",
            мова: document.getElementById("мова-коду") ? document.getElementById("мова-коду").value : "C#",
            файл: document.getElementById("назва-файлу") ? document.getElementById("назва-файлу").value : "Program.cs",
            результати: document.getElementById("результати") ? document.getElementById("результати").value : "",
            висновки: document.getElementById("висновки") ? document.getElementById("висновки").value : "",
            запитання: контрольніЗапитання,
            власніРозділи: власніРозділиЗвіту,
            джерела: списокДжерел
        }
    };

    var drafts = отриматиВсіЧернетки();
    drafts.unshift(чернетка);
    localStorage.setItem("studzvit_drafts_v2", JSON.stringify(drafts));
    відобразитиЧернетки();
    показатиСповіщення("Чернетку «" + чернетка.назва + "» успішно збережено!", "успіх");
}

function відобразитиЧернетки() {
    var container = document.getElementById("список-чернеток-контейнер");
    var badge = document.getElementById("кількість-чернеток-значок");
    if (!container) return;

    var drafts = отриматиВсіЧернетки();
    if (badge) badge.textContent = drafts.length + " чернеток";

    if (drafts.length === 0) {
        container.innerHTML = 
            "<div style='text-align:center; padding:32px; color:var(--text-muted);'>" +
            "<div style='font-size:36px; margin-bottom:8px;'>📁</div>" +
            "<p style='font-size:14px;'>У вас ще немає збережених чернеток.</p>" +
            "<p style='font-size:12.5px;'>Заповніть титульну сторінку або розділи звіту та натисніть «Зберегти».</p>" +
            "</div>";
        return;
    }

    var html = "";
    drafts.forEach(function(d, idx) {
        html += 
            "<div class='panel-card' style='background:#ffffff; border:1px solid #e2e8f0; border-radius:10px; padding:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:10px;'>" +
                "<div>" +
                    "<div style='font-size:15px; font-weight:800; color:var(--text-primary); margin-bottom:4px;'>" + escapeHtml(d.назва) + "</div>" +
                    "<div style='font-size:12.5px; color:var(--text-muted);'>" +
                        "👤 " + escapeHtml(d.студент) + " • 📅 " + escapeHtml(d.дата) + " • 📚 " + escapeHtml(d.дисципліна) +
                    "</div>" +
                "</div>" +
                "<div style='display:flex; gap:8px;'>" +
                    "<button class='btn btn-sm btn-primary' onclick='відкритиЧернетку(" + idx + ")'>📂 Відкрити</button>" +
                    "<button class='btn btn-sm btn-secondary' style='color:#ef4444;' onclick='видалитиЧернетку(" + idx + ")'>🗑️ Видалити</button>" +
                "</div>" +
            "</div>";
    });
    container.innerHTML = html;
}

function відкритиЧернетку(idx) {
    var drafts = отриматиВсіЧернетки();
    if (!drafts[idx]) return;
    var d = drafts[idx].payload;

    if (d.студент && document.getElementById("студент-піб")) document.getElementById("студент-піб").value = d.студент;
    if (d.тема && document.getElementById("титулка-тема")) document.getElementById("титулка-тема").value = d.тема;
    if (d.дисципліна && document.getElementById("титулка-дисципліна")) document.getElementById("титулка-дисципліна").value = d.дисципліна;
    if (d.номер && document.getElementById("титулка-номер")) document.getElementById("титулка-номер").value = d.номер;
    if (d.група && document.getElementById("студент-група")) document.getElementById("студент-група").value = d.група;
    if (d.викладач && document.getElementById("викладач-піб")) document.getElementById("викладач-піб").value = d.викладач;
    if (d.мета && document.getElementById("мета-роботи")) document.getElementById("мета-роботи").value = d.мета;
    if (d.теорія && document.getElementById("теорія")) document.getElementById("теорія").value = d.теорія;
    if (d.хід && document.getElementById("хід-роботи")) document.getElementById("хід-роботи").value = d.хід;
    if (d.код && document.getElementById("код-програми")) document.getElementById("код-програми").value = d.код;
    if (d.мова && document.getElementById("мова-коду")) document.getElementById("мова-коду").value = d.мова;
    if (d.файл && document.getElementById("назва-файлу")) document.getElementById("назва-файлу").value = d.файл;
    if (d.результати && document.getElementById("результати")) document.getElementById("результати").value = d.результати;
    if (d.висновки && document.getElementById("висновки")) document.getElementById("висновки").value = d.висновки;
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

    оновитиПрев();
    оновитиЧекліст();
    перейтиДо("конструктор");
    показатиСповіщення("Чернетку успішно завантажено в Конструктор!", "успіх");
}

function видалитиЧернетку(idx) {
    var drafts = отриматиВсіЧернетки();
    drafts.splice(idx, 1);
    localStorage.setItem("studzvit_drafts_v2", JSON.stringify(drafts));
    відобразитиЧернетки();
    показатиСповіщення("Чернетку видалено", "інфо");
}

function очиститиВсіЧернетки() {
    if (!confirm("Ви впевнені, що бажаєте видалити всі збережені чернетки?")) return;
    localStorage.removeItem("studzvit_drafts_v2");
    відобразитиЧернетки();
    показатиСповіщення("Усі чернетки очищено", "інфо");
}

// ============================================================
// 9. СПИСОК ВИКОРИСТАНИХ ДЖЕРЕЛ
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
    document.getElementById("тема-роботи").value = "Побудова трьохрівневої архітектури програмного комплексу";
    document.getElementById("заклад").value = "Рівненський кооперативний економіко-правовий фаховий коледж";
    document.getElementById("відділення").value = "Відділення комп'ютерних технологій";
    document.getElementById("кафедра").value = "Циклова комісія інженерії програмного забезпечення";
    document.getElementById("студент-піб").value = "Месса А.";
    document.getElementById("група").value = "ІТ-32";
    document.getElementById("спеціальність").value = "121 Інженерія програмного забезпечення";
    document.getElementById("курс").value = "3";
    document.getElementById("викладач-піб").value = "Ковальчук В. Б.";
    document.getElementById("викладач-посада").value = "викладач";
    document.getElementById("місто").value = "Рівне";
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

function обратиМовуКоду(новаМова, назваФайлу) {
    var elМова = document.getElementById("мова-коду");
    var elФайл = document.getElementById("назва-файлу");
    if (elМова) elМова.value = новаМова;
    if (elФайл && назваФайлу) elФайл.value = назваФайлу;

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
        html += "<div class='doc-review-line'><strong>9. Список використаних джерел:</strong> " + (списокДжерел.length > 0 ? "✓ " + списокДжерел.length + " джерел" : "<em>Не додано</em>") + "</div>";
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

function підтвердитиЗавантаженняPDF() {
    закритиПереглядПередЗавантаженням();
    if (поточнийТипЗавантаження === "титулка") {
        завантажитиТитулкуPDF();
    } else {
        завантажитиЗвітPDF();
    }
}

function завантажитиТитулкуPDF() {
    var element = document.getElementById("бланк-а4");
    if (!element) {
        показатиСповіщення("Не знайдено бланка титульної сторінки", "інфо");
        return;
    }

    показатиСповіщення("⏳ Формування файлу PDF...", "інфо");

    var назва = "Титульна_сторінка";
    var студ = document.getElementById("студент") ? document.getElementById("студент").value.trim() : "";
    var тема = document.getElementById("тема-роботи") ? document.getElementById("тема-роботи").value.trim() : "";
    if (тема) назва += "_" + тема.slice(0, 20).replace(/[^a-zA-Zа-яА-Я0-9]/g, "_");
    else if (студ) назва += "_" + студ.split(" ")[0];
    назва += ".pdf";

    var клон = element.cloneNode(true);
    клон.style.margin = "0";
    клон.style.boxShadow = "none";
    клон.style.width = "210mm";
    клон.style.minHeight = "297mm";
    клон.style.boxSizing = "border-box";
    клон.style.background = "#ffffff";
    клон.style.position = "fixed";
    клон.style.left = "-9999px";
    клон.style.top = "0";
    document.body.appendChild(клон);

    if (window.html2pdf) {
        var opt = {
            margin:       [0, 0, 0, 0],
            filename:     назва,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true, logging: false },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        window.html2pdf().set(opt).from(клон).save().then(function() {
            if (клон.parentNode) клон.parentNode.removeChild(клон);
            показатиСповіщення("✅ Файл PDF успішно завантажено!", "успіх");
            var п = parseInt(localStorage.getItem("studdoc_docs") || "1") + 1;
            localStorage.setItem("studdoc_docs", String(п));
            if (document.getElementById("stat-docs")) document.getElementById("stat-docs").textContent = п;
        }).catch(function() {
            if (клон.parentNode) клон.parentNode.removeChild(клон);
            window.print();
        });
    } else {
        if (клон.parentNode) клон.parentNode.removeChild(клон);
        window.print();
    }
}

function завантажитиЗвітPDF() {
    показатиСповіщення("⏳ Формування PDF-звіту...", "інфо");

    var container = document.createElement("div");
    container.style.width = "210mm";
    container.style.padding = "20mm 10mm 20mm 30mm";
    container.style.background = "#ffffff";
    container.style.color = "#000000";
    container.style.fontFamily = "'Times New Roman', Times, serif";
    container.style.fontSize = "14pt";
    container.style.lineHeight = "1.5";
    container.style.boxSizing = "border-box";
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";

    var html = "";

    var incTitulka = document.getElementById("включити-титулку") ? document.getElementById("включити-титулку").checked : true;
    if (incTitulka) {
        var blank = document.getElementById("бланк-а4");
        if (blank) {
            html += "<div style='page-break-after: always; padding: 0; margin-bottom: 20mm;'>" + blank.innerHTML + "</div>";
        }
    }

    function додатиРозділPDF(заголовок, вміст) {
        if (!вміст) return "";
        var res = "<div style='margin-bottom: 22px;'>";
        res += "<h3 style='text-align: center; font-size: 15pt; font-weight: bold; margin: 18px 0 10px; text-transform: uppercase;'>" + заголовок + "</h3>";
        var paragraphs = вміст.split("\n");
        paragraphs.forEach(function(p) {
            var t = p.trim();
            if (t) {
                res += "<p style='text-align: justify; text-indent: 12.5mm; margin: 0 0 8px;'>" + escapeHtml(t) + "</p>";
            }
        });
        res += "</div>";
        return res;
    }

    var мета = document.getElementById("мета-роботи") ? document.getElementById("мета-роботи").value.trim() : "";
    html += додатиРозділPDF("1. МЕТА РОБОТИ ТА ЗАВДАННЯ", мета);

    var теорія = document.getElementById("теорія") ? document.getElementById("теорія").value.trim() : "";
    html += додатиРозділPDF("2. КОРОТКІ ТЕОРЕТИЧНІ ВІДОМОСТІ", теорія);

    var хід = document.getElementById("хід-роботи") ? document.getElementById("хід-роботи").value.trim() : "";
    html += додатиРозділPDF("3. ХІД ВИКОНАННЯ РОБОТИ", хід);

    var код = document.getElementById("код-програми") ? document.getElementById("код-програми").value.trim() : "";
    if (код) {
        html += "<div style='margin-bottom: 22px;'>";
        html += "<h3 style='text-align: center; font-size: 15pt; font-weight: bold; margin: 18px 0 10px;'>4. ЛІСТИНГ ПРОГРАМНОГО КОДУ</h3>";
        html += "<pre style='background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; font-family: Consolas, monospace; font-size: 10.5pt; line-height: 1.4; border-radius: 6px; white-space: pre-wrap;'>" + escapeHtml(код) + "</pre>";
        html += "</div>";
    }

    if (typeof власніРозділиЗвіту !== "undefined" && власніРозділиЗвіту.length > 0) {
        власніРозділиЗвіту.forEach(function(sec, i) {
            html += додатиРозділPDF((5 + i) + ". " + sec.назва.toUpperCase(), sec.текст);
        });
    }

    var висновки = document.getElementById("висновки") ? document.getElementById("висновки").value.trim() : "";
    html += додатиРозділPDF("ВИСНОВКИ", висновки);

    if (typeof списокДжерел !== "undefined" && списокДжерел.length > 0) {
        html += "<div style='margin-bottom: 22px; page-break-before: always;'>";
        html += "<h3 style='text-align: center; font-size: 15pt; font-weight: bold; margin: 18px 0 10px;'>СПИСОК ВИКОРИСТАНИХ ДЖЕРЕЛ</h3>";
        html += "<ol style='padding-left: 25px; text-align: justify;'>";
        списокДжерел.forEach(function(d) {
            html += "<li style='margin-bottom: 8px;'>" + escapeHtml(d) + "</li>";
        });
        html += "</ol></div>";
    }

    container.innerHTML = html;
    document.body.appendChild(container);

    var opt = {
        margin:       [10, 10, 10, 10],
        filename:     'Звіт_роботи_StudZvit.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    if (window.html2pdf) {
        window.html2pdf().set(opt).from(container).save().then(function() {
            if (container.parentNode) container.parentNode.removeChild(container);
            показатиСповіщення("✅ Звіт PDF успішно завантажено!", "успіх");
            var п = parseInt(localStorage.getItem("studdoc_docs") || "1") + 1;
            localStorage.setItem("studdoc_docs", String(п));
            if (document.getElementById("stat-docs")) document.getElementById("stat-docs").textContent = п;
        }).catch(function() {
            if (container.parentNode) container.parentNode.removeChild(container);
            window.print();
        });
    } else {
        if (container.parentNode) container.parentNode.removeChild(container);
        window.print();
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
                показатиСповіщення("StudZvit встановлено на пристрій!", "успіх");
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
            "<p><strong>Як зберегти StudZvit як додаток iOS (працює як з App Store):</strong></p>" +
            "<ol style='margin-left:20px; margin-top:8px; line-height:1.7;'>" +
                "<li>Відкрийте StudZvit у стандартному браузері <strong>Safari</strong>.</li>" +
                "<li>Натисніть кнопку <strong>«Поділитися»</strong> (іконка квадрата зі стрілкою вгору внизу екрана).</li>" +
                "<li>Прокрутіть меню та оберіть <strong>«На початковий екран» (Add to Home Screen)</strong>.</li>" +
                "<li>Натисніть <strong>«Додати»</strong>. Додаток з'явиться на робочому столі з фірмовою іконкою!</li>" +
            "</ol>";
    } else if (платформа === "google") {
        title.innerHTML = "🤖 Встановлення на Android (Google Play / PWA)";
        body.innerHTML = 
            "<p><strong>Як встановити StudZvit на телефон Android:</strong></p>" +
            "<ol style='margin-left:20px; margin-top:8px; line-height:1.7;'>" +
                "<li>Відкрийте StudZvit у браузері <strong>Google Chrome</strong>.</li>" +
                "<li>Натисніть на три крапки в правому верхньому кутку браузера.</li>" +
                "<li>Оберіть пункт <strong>«Встановити додаток»</strong> або <strong>«Додати на головний екран»</strong>.</li>" +
                "<li>StudZvit працюватиме як повноцінний автономний мобільний додаток!</li>" +
            "</ol>";
    } else if (платформа === "microsoft") {
        title.innerHTML = "💻 Встановлення на комп'ютер Windows (ПК / Ноутбук)";
        body.innerHTML = 
            "<p><strong>Як встановити додаток на Windows 10/11:</strong></p>" +
            "<ol style='margin-left:20px; margin-top:8px; line-height:1.7;'>" +
                "<li>Відкрийте StudZvit у браузері <strong>Microsoft Edge</strong> або <strong>Google Chrome</strong>.</li>" +
                "<li>В адресному рядку праворуч натисніть значок <strong>«Встановити додаток StudZvit»</strong>.</li>" +
                "<li>Додаток додасться у меню Пуск Windows та працюватиме офлайн!</li>" +
            "</ol>";
    } else {
        title.innerHTML = "📲 Встановлення додатку StudZvit";
        body.innerHTML = 
            "<p>StudZvit працює на всіх смартфонах та ПК безкоштовно та без лімітів:</p>" +
            "<ul style='margin-left:20px; margin-top:8px; line-height:1.7;'>" +
                "<li><strong>iPhone / iPad:</strong> Safari ➔ «Поділитися» ➔ «На початковий екран».</li>" +
                "<li><strong>Android:</strong> Chrome ➔ Меню ➔ «Встановити додаток».</li>" +
                "<li><strong>Windows PC:</strong> Edge / Chrome ➔ Іконка в адресному рядку «Встановити».</li>" +
            "</ul>";
    }

    modal.style.display = "flex";
}

function відкритиДонат() {
    var modal = document.getElementById("модальне-донат");
    if (modal) modal.style.display = "flex";
}

function закритиДонат() {
    var modal = document.getElementById("модальне-донат");
    if (modal) modal.style.display = "none";
}

function скопіюватиКартку() {
    var номер = "4874070012229983";
    var btn = document.getElementById("btn-copy-card");
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(номер).then(function() {
            if (btn) btn.textContent = "✅ Скопійовано! Дякуємо!";
            показатиСповіщення("✅ Номер картки скопійовано в буфер обміну!", "успіх");
            setTimeout(function() {
                if (btn) btn.textContent = "📋 Скопіювати номер картки";
            }, 3000);
        }).catch(function() {
            старийКопіювати(номер);
        });
    } else {
        старийКопіювати(номер);
    }
}

function старийКопіювати(текст) {
    var ta = document.createElement("textarea");
    ta.value = текст;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    var btn = document.getElementById("btn-copy-card");
    try {
        document.execCommand("copy");
        if (btn) btn.textContent = "✅ Скопійовано! Дякуємо!";
        показатиСповіщення("✅ Номер картки скопійовано в буфер обміну!", "успіх");
        setTimeout(function() {
            if (btn) btn.textContent = "📋 Скопіювати номер картки";
        }, 3000);
    } catch(e) {
        показатиСповіщення("Не вдалося скопіювати автоматично", "інфо");
    }
    document.body.removeChild(ta);
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

    var hash = window.location.hash.replace("#", "");
    if (hash && document.getElementById(hash) && hash !== "головна") {
        історіяНавігації = ["головна", hash];
        індексІсторії = 1;
        перейтиДо(hash, true);
    } else {
        оновитиПрев();
        оновитиСтрілочкиНавігації();
    }
});

// Автоматичне приховування сторонніх водяних плашок хостингу (ship.page)
function видалитиПлашкуХостингу() {
    try {
        var all = document.querySelectorAll("*");
        for (var i = 0; i < all.length; i++) {
            var el = all[i];
            if (!el) continue;
            var tag = (el.tagName || "").toLowerCase();
            if (tag.indexOf("ship") !== -1 || (el.id && el.id.indexOf("ship") !== -1) || (el.className && typeof el.className === "string" && el.className.indexOf("ship") !== -1)) {
                el.style.display = "none !important";
                el.remove();
                continue;
            }
            if (el.shadowRoot) {
                var sText = el.shadowRoot.textContent || "";
                if (sText.indexOf("ship.page") !== -1 || sText.indexOf("Hide this") !== -1 || sText.indexOf("Hosted on") !== -1) {
                    el.style.display = "none !important";
                    el.remove();
                    continue;
                }
            }
            var text = el.textContent || "";
            if (text.indexOf("Hosted on ship.page") !== -1 || text.indexOf("Hide this on my drops") !== -1) {
                var target = el;
                while (target.parentElement && target.parentElement !== document.body && target.parentElement !== document.documentElement) {
                    target = target.parentElement;
                }
                if (target && target !== document.body && target !== document.documentElement) {
                    target.style.display = "none !important";
                    target.remove();
                }
            }
        }
    } catch(e) {}
}
setInterval(видалитиПлашкуХостингу, 150);
window.addEventListener("load", видалитиПлашкуХостингу);
document.addEventListener("DOMContentLoaded", видалитиПлашкуХостингу);
