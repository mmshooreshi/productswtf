let fileMap = {}; // id → { name, path }
let currentItem = null;

// بارگذاری فایل‌های YAML و ساخت گزینه‌ها
async function loadFileList() {
  try {
    const res = await fetch("files.yaml");
    const yamlText = await res.text();
    const data = jsyaml.load(yamlText);

    const customSelect = document.getElementById("customSelect");
    const selectedDiv = customSelect.querySelector(".selected");
    const optionsList = customSelect.querySelector(".options");

    const params = new URLSearchParams(window.location.search);
    const datasetId = params.get("dataset");

    // اضافه کردن گزینه‌ها
    data.files.forEach(file => {
      fileMap[file.id] = { name: file.name, path: file.path };

      const li = document.createElement("li");
      li.textContent = file.name;
      li.dataset.id = file.id;
      optionsList.appendChild(li);

      // کلیک روی هر گزینه
      li.addEventListener("click", () => {
        selectedDiv.textContent = file.name;
        customSelect.classList.remove("open");
        buildTree(file.path, file.name, file.id);
      });
    });

    // اگر URL پارامتر داشت → همونو انتخاب کن
    if (datasetId && fileMap[datasetId]) {
      selectedDiv.textContent = fileMap[datasetId].name;
      buildTree(fileMap[datasetId].path, fileMap[datasetId].name, datasetId);
    }
  } catch (err) {
    console.error("Error loading YAML:", err);
    showToast("❌ فایل‌ها بارگذاری نشدند");
  }
}

// ساخت درخت
async function buildTree(filename, displayName, id) {
  console.log("Fetching:", filename);
  const res = await fetch(filename);
  const data = await res.json();
  const container = document.getElementById("tree");
  container.innerHTML = "";

  // تغییر عنوان
//   document.querySelector("h1").textContent = `🖨 چاپ و 📦 ${displayName}`;

  // تغییر querystring
  const params = new URLSearchParams(window.location.search);
  params.set("dataset", id);
  history.replaceState(null, "", "?" + params.toString());

  // ساختار درخت
  function createNode(title, children, level = 1) {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.innerHTML = `
      <span>
        <span class="iconify node-icon" data-icon="${level === 1 ? "mdi:folder" : "mdi:file-document"}"></span>
        ${title}
      </span>
      <span class="edit-icon" data-value="${title}">
        <span class="iconify" data-icon="mdi:pencil"></span>
      </span>
    `;
    details.appendChild(summary);

    if (Array.isArray(children)) {
      const ul = document.createElement("ul");
      ul.classList.add(`level-${level}`);
      children.forEach(v => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>
            <span class="iconify node-icon" data-icon="mdi:subdirectory-arrow-right"></span>
            ${v}
          </span>
          <span class="edit-icon" data-value="${v}">
            <span class="iconify" data-icon="mdi:pencil"></span>
          </span>
        `;
        ul.appendChild(li);
      });
      details.appendChild(ul);
    } else if (typeof children === "object") {
      const ul = document.createElement("ul");
      ul.classList.add(`level-${level}`);
      for (const [subTitle, subChildren] of Object.entries(children)) {
        ul.appendChild(createNode(subTitle, subChildren, level + 1));
      }
      details.appendChild(ul);
    }
    return details;
  }

  Object.entries(data).forEach(([group, sub]) => {
    container.appendChild(createNode(group, sub, 1));
  });
}

// مودال و Toast
function openModal(item) {
  currentItem = item;
  document.getElementById("editInput").value = item;
  document.getElementById("editModal").style.display = "flex";
}
function closeModal() {
  document.getElementById("editModal").style.display = "none";
}
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.className = "toast show";
  setTimeout(() => (toast.className = "toast"), 3000);
}

// event delegation برای آیکون ویرایش
document.addEventListener("click", e => {
  const icon = e.target.closest(".edit-icon");
  if (icon) {
    e.stopPropagation();
    const val = icon.getAttribute("data-value");
    openModal(val);
  }
});

// کلیک بیرون → بستن منو
document.addEventListener("click", e => {
  const customSelect = document.getElementById("customSelect");
  if (customSelect.contains(e.target)) {
    customSelect.classList.toggle("open");
  } else {
    customSelect.classList.remove("open");
  }
});

// شروع
loadFileList();
