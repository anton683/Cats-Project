let modals = document.querySelectorAll(".modal");
let actions = document.querySelectorAll("[data-action]");
let container = document.querySelector(".cats-container");
let addForm = document.forms.add;
let updForm = document.forms.upd;
let author = "anton683";

let cats = localStorage.getItem("anton-cats");
cats = cats ? JSON.parse(cats) : [];
actions.forEach(btn => {
    btn.addEventListener("click", () => {
        if (btn.dataset.action === "reload") {
            localStorage.removeItem("anton-cats");
            fetch(`https://cats.petiteweb.dev/api/single/${author}/show`)
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                    if (!data.message) {
                        cats = [...data];
                        localStorage.setItem("anton-cats", JSON.stringify(cats));
                        container.innerHTML = "";
                        data.forEach(cat => {
                            container.innerHTML += createCard(cat);
                        })
                    }
                })
        } else {
            Array.from(modals).find(m => m.dataset.type === btn.dataset.action).classList.add("active");
        }
    })
})
modals.forEach(m => {
    let close = m.querySelector(".modal-close");
    close.addEventListener("click", () => {
        m.classList.remove("active");
        addForm.reset();
        updForm.reset();
    })
})
function setLike(id, el) {
    console.log(id);
    el.classList.toggle("fa-solid");
    el.classList.toggle("fa-regular");
    fetch(`https://cats.petiteweb.dev/api/single/${author}/update/${id}`, {
        method: "put",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({favorite: el.classList.contains("fa-solid")})
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.message.includes("успешно")) {
                cats = cats.map(cat => {
                    if (cat.id === id) {
                        cat.favorite = el.classList.contains("fa-solid")
                    }
                    return cat;
                });
                localStorage.setItem("anton-cats", JSON.stringify(cats));
            }
        })
}
function setRate(n) {
    let html = "";
    for (let i = 0; i < n ; i++) {
        html += "<i class=\"fa-solid fa-star\"></i>"
    }
    for (let i = n; i < 5; i++) {
        html += "<i class=\"fa-regular fa-star\"></i>"
    }
    return html;
}
function setAge(n) {
    if (n % 100 < 11 || n % 100 > 14) {
        if (n % 10 === 1) {
            return n + " год";
        } else if (n % 10 >= 2 && n % 10 <= 4) {
            return n + " года";
        }
        return n + " лет";
    }
    return n + " лет";
}
function showModal(id, el) {
    let m = Array.from(modals).find(m => m.dataset.type === el.dataset.action);
    m.classList.add("active");
    let content = m.querySelector(".modal-cat")
    let cat = cats.find(cat => cat.id === id);
    content.innerHTML = `
        <div class="cat-text">
            <h2>${cat.name}</h2>
            <div>${setAge(cat.age)}</div>
            <div>${cat.description || "Информации о котике пока нет..."}</div>
        </div>
        <img src=${cat.image || "images/default.png"} alt="${cat.name}">
    `
    // <div>${typeof cat.age === "number" ? setAge(cat.age) : "Возраст не указан"}</div>
}
function setUpd(id, el) {
    Array.from(modals).find(m => m.dataset.type === el.dataset.action).classList.add("active");
    let cat = cats.find(cat => cat.id === id);
    console.log(cat);
    for (let i = 0; i < updForm.elements.length; i++) {
        let inp = updForm.elements[i];
        if (inp.name && cat[inp.name]) {
            if (inp.type === "checkbox") {
                inp.checked = cat[inp.name]
            } else {
                inp.value = cat[inp.name];
            }
        }
    }
}
function setDel(id, el) {
    let card = el.parentElement.parentElement;
    fetch(`https://cats.petiteweb.dev/api/single/${author}/delete/${id}`, {
        method: "delete"
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.message.includes("успешно")) {
                cats = cats.filter(cat =>  cat.id !== id);
                localStorage.setItem("anton-cats", JSON.stringify(cats));
                card.remove();
            } else {
                alert(data.message);
            }
        })
}
function createCard(obj) {
    return `
        <div class="cat" data-id="${obj.id}">
            <i class="${obj.favorite ? "fa-solid" : "fa-regular"} fa-heart cat-like" onclick="setLike(${obj.id},this)"></i>
            <div class="cat-pic" style="background-image: url('${obj.image || "images/default.png"}')"></div>
            <h2 class="cat-name">${obj.name}</h2>
            <div class="cat-rate">
                ${setRate(obj.rate || 0)}
            </div>
            <div class="cat-info">
                <button class="btn-text" onclick="showModal(${obj.id}, this)" data-action="show">Посмотреть</button>
                <button class="btn">
                    <i class="fa-solid fa-pen" onclick="setUpd(${obj.id}, this)" data-action="upd"></i>
                </button>
                <button class="btn" onclick="setDel(${obj.id}, this)">
                    <i class="fa-solid fa-trash"></i>
                </button>
            </div>
        </div>
    `;
}


if (!cats.length) {
    fetch(`https://cats.petiteweb.dev/api/single/${author}/show`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (!data.message) {
                cats = [...data];
                localStorage.setItem("anton-cats", JSON.stringify(cats));
                container.innerHTML = "";
                data.forEach(cat => {
                    container.innerHTML += createCard(cat);
                })
            }
        })
} else {
    container.innerHTML = "";
    cats.forEach(cat => {
        container.innerHTML += createCard(cat);
    })
}

updForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let body = {};
    for (let i = 0; i < updForm.elements.length; i++) {
        let inp = updForm.elements[i];
        if (inp.name) {
            if (inp.type === "checkbox") {
                body[inp.name] = inp.checked;
            } else {
                body[inp.name] = inp.value;
            }
        }
    }
    body.id = +body.id;
    console.log("upd", body);
    fetch(`https://cats.petiteweb.dev/api/single/${author}/update/${body.id}`, {
        method: "put",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.message.includes("успешно")) {
                cats = cats.map(cat => {
                    if (cat.id === body.id) {
                        return body;
                    }
                    return cat;
                })
                console.log(cats);
                container.innerHTML = "";
                cats.forEach(cat => {
                    container.innerHTML += createCard(cat);
                })
                updForm.reset()
                localStorage.setItem("anton-cats", JSON.stringify(cats));
                Array.from(modals).find(m => m.dataset.type === "upd").classList.remove("active");
            } else {
                alert(data.message);
            }
        })
})

addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let body = {};
    for (let i = 0; i < addForm.elements.length; i++) {
        let inp = addForm.elements[i];
        if (inp.name) {
            if (inp.type === "checkbox") {
                body[inp.name] = inp.checked;
            } else {
                body[inp.name] = inp.value;
            }
        }
    }
    body.id = +body.id;
    console.log("add", body);
    fetch(`https://cats.petiteweb.dev/api/single/${author}/add`, {
        method: "post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.message.includes("успешно")) {
                cats.push(body);
                container.innerHTML = "";
                cats.forEach(cat => {
                    container.innerHTML += createCard(cat);
                })
                addForm.reset()
                localStorage.setItem("anton-cats", JSON.stringify(cats));
                Array.from(modals).find(m => m.dataset.type === "add").classList.remove("active");
            } else {
                alert(data.message);
            }
        })
})