const API_URL = "http://localhost:8000/contacts";
const showContactFormButton = document.querySelector("#showContactFormButton");
const saveContactButton = document.querySelector("#saveContactButton");
const contactList = document.querySelector("#contactList");

const mainNameInput = document.querySelector("#mainNameInput");
const firstNameInput = document.querySelector("#firstName");
const lastNameInput = document.querySelector("#lastName");
const phoneInput = document.querySelector("#phone");
const photoInput = document.querySelector("#photoUrl");

let contacts = [];
let editIndex = -1;

showContactFormButton.addEventListener("click", () => {
  const name = mainNameInput.value.trim();
  if (name) {
    firstNameInput.value = name;
    document.querySelector(".form-container").style.display = "flex";
  } else {
    alert("Введите имя");
  }
});

function displayContacts() {
  contactList.innerHTML = "";
  contacts.forEach((contact, index) => {
    const contactDiv = document.createElement("div");
    contactDiv.className = "contact";
    contactDiv.innerHTML = `
      ${
        contact.photo
          ? `<img src="${contact.photo}" alt="Contact Photo" style="max-width: 100px; max-height: 100px;">`
          : ""
      }
      <h3>${contact.firstName} ${contact.lastName}</h3>
      <p>Phone: ${contact.phone}</p>
      <button class="editButton" data-index="${index}">Edit</button>
      <button class="deleteButton" data-index="${index}">Delete</button>
    `;
    contactList.appendChild(contactDiv);
  });

  document.querySelectorAll(".editButton").forEach((button) => {
    button.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      editContact(index);
    });
  });

  document.querySelectorAll(".deleteButton").forEach((button) => {
    button.addEventListener("click", (e) => {
      const index = e.target.getAttribute("data-index");
      deleteContact(index);
    });
  });
}

function addContact() {
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const phone = phoneInput.value.trim();
  const photo = photoInput.value.trim();

  if (firstName && lastName && phone) {
    const newContact = { firstName, lastName, phone, photo };

    if (editIndex === -1) {
      fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContact),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Не удалось добавить контакт");
          }
          return res.json();
        })
        .then((data) => {
          contacts.push(data);
          displayContacts();
          clearForm();
        })
        .catch((error) => {
          console.error("Ошибка при добавлении контакта:", error);
          alert("Не удалось добавить контакт. Пожалуйста, попробуйте еще раз.");
        });
    } else {
      // Update existing contact
      const id = contacts[editIndex].id;
      fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newContact),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error("Не удалось обновить контакт");
          }
          return res.json();
        })
        .then((data) => {
          contacts[editIndex] = data;
          displayContacts();
          clearForm();
          editIndex = -1;
        })
        .catch((error) => {
          console.error("Ошибка обновления контакта:", error);
          alert("Не удалось обновить контакт. Пожалуйста, попробуйте еще раз.");
        });
    }
  } else {
    alert("Пожалуйста, заполните все поля.");
  }
}

function editContact(index) {
  const contact = contacts[index];
  firstNameInput.value = contact.firstName;
  lastNameInput.value = contact.lastName;
  phoneInput.value = contact.phone;
  photoInput.value = contact.photo;
  document.querySelector(".form-container").style.display = "flex";
  editIndex = index;
}

function deleteContact(index) {
  const id = contacts[index].id;
  fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Не удалось удалить контакт");
      }
      contacts.splice(index, 1);
      displayContacts();
    })
    .catch((error) => {
      console.error("Ошибка удаления контакта:", error);
      alert("Не удалось удалить контакт. Пожалуйста, попробуйте еще раз.");
    });
}

function clearForm() {
  firstNameInput.value = "";
  lastNameInput.value = "";
  phoneInput.value = "";
  photoInput.value = "";
  document.querySelector(".form-container").style.display = "none";
  mainNameInput.value = "";
  editIndex = -1;
}

saveContactButton.addEventListener("click", addContact);

document.addEventListener("DOMContentLoaded", () => {
  fetch(API_URL)
    .then((res) => res.json())
    .then((data) => {
      contacts = data.contact || [];
      displayContacts();
    });
});
