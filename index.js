// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2510-CPU-RM-WEB-PT"; // Make sure to change this!
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API + "/events");
    const result = await response.json();
    parties = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(API + "/events/" + id);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch(API + "/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch(API + "/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (e) {
    console.error(e);
  }
}

/** Creates a new party via POST request to the API */
async function createParty(event) {
  event.preventDefault();
  
  try {
    const form = event.target;
    const name = form.name.value;
    const description = form.description.value;
    const date = form.date.value;
    const location = form.location.value;
    
    const isoDate = new Date(date).toISOString();
    
    const response = await fetch(API + "/events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
        description: description,
        date: isoDate,
        location: location
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      form.reset();
      await getParties();
    }
  } catch (e) {
    console.error(e);
  }
}

async function deleteParty(id) {
  try {
    const response = await fetch(API + "/events/" + id, {
      method: "DELETE"
    });
    
    if (response.ok) {
      selectedParty = null;
      await getParties();
    }
  } catch (e) {
    console.error(e);
  }
}

// === Components ===

function AddPartyForm() {
  const $form = document.createElement("form");
  $form.classList.add("add-party-form");
  
  $form.innerHTML = `
    <h3>Add a new party</h3>
    <label>
      Name
      <input type="text" name="name" required />
    </label>
    <label>
      Description
      <input type="text" name="description" required />
    </label>
    <label>
      Date
      <input type="date" name="date" required />
    </label>
    <label>
      Location
      <input type="text" name="location" required />
    </label>
    <button type="submit">Add party</button>
  `;
  
  $form.addEventListener("submit", createParty);
  
  return $form;
}

function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <button class="delete-btn">Delete Party</button>
    <GuestList></GuestList>
  `;

  const deleteBtn = $party.querySelector(".delete-btn");
  deleteBtn.addEventListener("click", () => deleteParty(selectedParty.id));
  
  $party.querySelector("GuestList").replaceWith(GuestList());

  return $party;
}

function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <AddPartyForm></AddPartyForm>
      </section>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;

  $app.querySelector("AddPartyForm").replaceWith(AddPartyForm());
  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
