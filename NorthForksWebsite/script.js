// ================= HEADER SCROLL =================

let lastScroll = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
  let currentScroll = window.scrollY;

  if (currentScroll > lastScroll && currentScroll > 60) {
    header.classList.add('hide');
  } else {
    header.classList.remove('hide');
  }

  lastScroll = currentScroll;
});

window.addEventListener("scroll", () => {
  if (!header) return;

  if (window.scrollY > 50) {
    header.classList.add("shrink");
  } else {
    header.classList.remove("shrink");
  }
});


// ================= HERO PARALLAX =================
const hero = document.querySelector(".hero");

window.addEventListener("scroll", () => {
  if (!hero) return;
  hero.style.backgroundPositionY = `${window.scrollY * 0.4}px`;
});


// ================= FADE IN OBSERVER =================
const faders = document.querySelectorAll(".fade-in");

const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.2 });

faders.forEach(el => fadeObserver.observe(el));


// ================= REVEAL OBSERVER =================
const reveals = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
    }
  });
}, { threshold: 0.2 });

reveals.forEach(el => revealObserver.observe(el));


// ================= INFO SECTION SAFE EFFECTS =================
const infoSection = document.querySelector(".info-section");
const infoContent = document.querySelector(".info-content");

window.addEventListener("scroll", () => {
 if (infoSection && infoContent) {
   const rect = infoSection.getBoundingClientRect();
   const offset = rect.top * 0.08;
   infoContent.style.transform = `translateY(${offset}px)`;
}
});



const items = document.querySelectorAll(".equipment-list li");
const image = document.getElementById("feature-image");

if (items.length && image) {
  items.forEach(item => {
    item.addEventListener("mouseover", () => {
      const newSrc = item.dataset.image;
      if (!newSrc) return;

      image.src = newSrc;
image.style.transform = "scale(1.05)";
image.style.transform = "scale(1.6)";
      // active state
      items.forEach(i => i.classList.remove("active"));
      item.classList.add("active");
    });
  });

  // set default
  items[0].classList.add("active");
}
const scrollElements = document.querySelectorAll(
  ".scroll-fade, .scroll-left, .scroll-right"
);

const scrollObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, {
  threshold: 0.2
});

scrollElements.forEach(el => scrollObserver.observe(el));
const titles = document.querySelectorAll(".rental-title");

const titleObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
}, { threshold: 0.4 });

titles.forEach(t => titleObserver.observe(t));

const supabaseClient = supabase.createClient(
  "https://rkdoyhlmhbolgrsvndxs.supabase.co",
  "sb_publishable_qfrO8rAjYHll2HNGVRxfzw_h7j2I2kP"
);

let inventory = [];

async function loadInventory() {
  const { data, error } = await supabaseClient
    .from("inventory")
    .select("*")


  if (error) {
    console.error(error);
    return;
  }

  inventory = data;
  displayItems(data);
}

function displayItems(items) {
  const grid = document.getElementById("inventoryGrid");
  if (!grid) return;

  grid.innerHTML = "";

 items.forEach((item, index) => {
    grid.innerHTML += `
      <div class="card" onclick="openItem('${item.id}', ${index})">
        <img src="${item.image_url}">
        <h3>${item.title}</h3>
        <p>$${item.price ? item.price.toLocaleString() : "Call for price"}</p>
      </div>
    `;
  });
}

function filterItems() {
  const search = document.getElementById("search").value.toLowerCase();
  const type = document.getElementById("typeFilter").value;
  const brand = document.getElementById("brandFilter").value;
  const fuel = document.getElementById("fuelFilter").value;
  const capacity = document.getElementById("capacityFilter").value;

  const filtered = inventory.filter(item => {
    return (
      item.title.toLowerCase().includes(search) &&
      (type === "" || item.type === type) &&
      (brand === "" || item.brand === brand) &&
      (fuel === "" || item.fuel === fuel) &&
      (capacity === "" || item.capacity == capacity)
    );
  });

  displayItems(filtered);
}

function openItem(id, index) {
  window.location.href = `item.html?id=${id}&index=${index}`;
}


// ===============================
// LOAD ITEM PAGE
// ===============================
async function loadItemPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  let index = parseInt(params.get("index"));

  if (!id) return;

  const { data, error } = await supabaseClient
    .from("inventory")
    .select("*")
    .order("id", { ascending: false });

  if (error || !data) {
    console.error(error);
    return;
  }

  inventory = data;

  // fallback if index missing
  if (isNaN(index)) {
    index = inventory.findIndex(item => item.id == id);
  }

  const item = inventory[index];
  if (!item) return;

  // ===============================
  // RENDER ITEM
  // ===============================
  document.getElementById("title").textContent = item.title;
  document.getElementById("price").textContent =
    item.price ? `$${item.price.toLocaleString()}` : "Call for price";
  document.getElementById("image").src = item.image_url;
  document.getElementById("desc").textContent =
    item.description || "";

  // ===============================
  // NEXT / PREV
  // ===============================
  const nextIndex = (index + 1) % inventory.length;
  const prevIndex = (index - 1 + inventory.length) % inventory.length;

  document.getElementById("nextBtn").onclick = () => {
    const nextItem = inventory[nextIndex];
    window.location.href = `item.html?id=${nextItem.id}&index=${nextIndex}`;
  };

  document.getElementById("prevBtn").onclick = () => {
    const prevItem = inventory[prevIndex];
    window.location.href = `item.html?id=${prevItem.id}&index=${prevIndex}`;
  };

  // keyboard nav
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") document.getElementById("nextBtn").click();
    if (e.key === "ArrowLeft") document.getElementById("prevBtn").click();
  });
}

// ===============================
// INIT
// ===============================
window.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("inventoryGrid")) {
    loadInventory();
  }

  if (document.getElementById("title")) {
    loadItemPage();
  }
});
/// login admin
async function login(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    alert("Login failed: " + error.message);
  } else {
    alert("Logged in!");
    window.location.href = "admin.html";
  }
}
const { data: { session } } = await supabaseClient.auth.getSession();

if (session) {
  // User came from reset link
  const newPassword = prompt("Enter new password:");

  await supabaseClient.auth.updateUser({
    password: newPassword
  });

  alert("Password updated!");
}
