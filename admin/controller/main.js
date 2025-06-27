import phoneServices from "../services/phoneServices.js";
import Validate from "./validate.js";

// Create an instance of phoneServices
const phoneService = new phoneServices();
const validate = new Validate();

const getEle = (id) => document.getElementById(id);
const resetForm = (formId) => getEle(formId).reset();

let originalModalContent = "";
let phoneList = []; // Tạo danh sách để validation
let filteredPhoneList = []; // Tạo ra danh sách để lưu điện thoại được tìm và loc
let modalInstance = null; // Store single modal instance

// Phone Management System
document.addEventListener("DOMContentLoaded", function () {
  // Initialize modal functionality
  const addPhoneBtn = getEle("addPhoneForm");
  const modal = getEle("actionModal");
  const closeBtn = getEle("btnClose");
  const addBtn = getEle("btnAddPhone");
  const updateBtn = getEle("btnUpdate");
  const form = getEle("formPhone");
  const modalContent = document.querySelector(".modal-content");

  // Store the original modal content
  originalModalContent = modalContent.innerHTML;

  // Initialize modal instance
  modalInstance = new bootstrap.Modal(modal);

  // Add event listeners for modal events to ensure proper cleanup
  modal.addEventListener("hidden.bs.modal", function () {
    // Ensure overlay is completely removed
    const backdrop = document.querySelector(".modal-backdrop");
    if (backdrop) {
      backdrop.remove();
    }
    // Remove modal-open class from body
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  });

  addPhoneBtn.addEventListener("click", function () {
    handleActions("Add");
  });

  // Attach event listeners for add and update buttons
  attachModalEventListeners();

  // Initialize search and filter functionality
  initializeSearchAndFilter();

  function handleActions(mode, id = -1) {
    let content = "";
    if (mode === "Add") {
      handleAddMode();
    } else if (mode === "Edit") {
      handleEditMode(id);
    } else {
      handleDeleteMode(id);
    }

    // Show the modal after handling the action
    modalInstance.show();
  }

  function handleAddMode() {
    restoreModalForm();

    // Get fresh references to buttons after restoring modal content
    const addBtn = getEle("btnAddPhone");
    const updateBtn = getEle("btnUpdate");

    getEle("header-title").textContent = "Add New Phone";
    form.reset();
    clearValidationMessages();
    addBtn.style.display = "inline-block";
    updateBtn.style.display = "none";
    addBtn.textContent = "Add Phone";
  }

  function restoreModalForm() {
    if (!modalContent.querySelector("#formPhone")) {
      modalContent.innerHTML = originalModalContent;
      attachModalEventListeners();
    }
  }

  // Function to attach event listeners to modal buttons
  function attachModalEventListeners() {
    const addBtn = getEle("btnAddPhone");
    const updateBtn = getEle("btnUpdate");

    if (addBtn) {
      addBtn.replaceWith(addBtn.cloneNode(true));
      const newAddBtn = getEle("btnAddPhone");
      newAddBtn.addEventListener("click", handleAddPhone);
    }

    if (updateBtn) {
      updateBtn.replaceWith(updateBtn.cloneNode(true));
      const newUpdateBtn = getEle("btnUpdate");
      newUpdateBtn.addEventListener("click", handleUpdatePhone);
    }
  }

  // Add phone functionality
  async function handleAddPhone() {
    if (validateForm()) {
      const phoneData = getFormData();
      console.log("Adding phone:", phoneData);

      try {
        await phoneService.addPhone(phoneData);
        console.log("Phone added successfully!");

        // Close modal and reload phones
        closeModal();
        await loadPhones(); // Refresh the list
        applyFilters(); // Reapply current filters

        // Show success message (you can implement a toast notification here)
        alert("Phone added successfully!");
      } catch (error) {
        console.error("Error adding phone:", error);
        alert("Error adding phone. Please try again.");
      }
    }
  }

  // Update phone functionality
  async function handleUpdatePhone() {
    if (validateForm(true)) {
      // Pass true for update mode
      const updateBtn = getEle("btnUpdate");
      const phoneId = updateBtn.getAttribute("data-id");
      const phoneData = {
        id: phoneId,
        ...getFormData(),
      };

      try {
        await phoneService.updatePhone(phoneData);
        console.log("Phone updated successfully!");

        // Close modal and reload phones
        closeModal();
        await loadPhones(); // Refresh the list
        applyFilters(); // Reapply current filters

        // Show success message
        alert("Phone updated successfully!");
      } catch (error) {
        console.error("Error updating phone:", error);
        alert("Error updating phone. Please try again.");
      }
    }
  }

  async function handleEditMode(id) {
    // First, ensure the modal has the correct form structure
    restoreModalForm();

    try {
      const phoneDetails = await phoneService.getPhoneById(id);
      console.log(phoneDetails);
      if (phoneDetails) {
        // Get fresh references to buttons after restoring modal content
        const addBtn = getEle("btnAddPhone");
        const updateBtn = getEle("btnUpdate");

        getEle("header-title").textContent = "Edit Phone";
        addBtn.style.display = "none";
        updateBtn.style.display = "inline-block";
        updateBtn.setAttribute("data-id", id);

        // Fill form with phone details
        getEle("name").value = phoneDetails.name || "";
        getEle("price").value = phoneDetails.price || "";
        getEle("screen").value = phoneDetails.screen || "";
        getEle("backCam").value = phoneDetails.backCamera || "";
        getEle("frontCam").value = phoneDetails.frontCamera || "";
        getEle("img").value = phoneDetails.img || "";
        getEle("desc").value = phoneDetails.desc || "";
        getEle("type").value = phoneDetails.type || "";

        clearValidationMessages();
      }
    } catch (error) {
      console.error("Error fetching phone details:", error);
      alert("Failed to load phone details.");
    }
  }

  function handleDeleteMode(id) {
    modalContent.innerHTML = `
        <div class="modal-header">
            <h5 class="modal-title">Delete Phone</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <p>Are you sure you want to delete this phone?</p>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete</button>
        </div>
    `;

    // Attach event listener for confirm delete
    setTimeout(() => {
      const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
      if (confirmDeleteBtn) {
        confirmDeleteBtn.onclick = async function () {
          try {
            await phoneService.deletePhone(id);
            closeModal();
            await loadPhones();
            applyFilters(); // Reapply current filters
            alert("Phone deleted successfully!");
          } catch (error) {
            console.error("Error deleting phone:", error);
            alert("Failed to delete phone.");
          }
        };
      }
    }, 0);
  }

  // Clear validation messages
  function clearValidationMessages() {
    const messages = document.querySelectorAll(".sp-thongbao");
    messages.forEach((msg) => {
      msg.innerHTML = "&#8205;"; // Zero-width joiner (invisible character)
      msg.style.display = "none"; // Hide the message
    });
  }

  // Get form data
  function getFormData() {
    return {
      name: document.getElementById("name").value,
      price: document.getElementById("price").value,
      screen: document.getElementById("screen").value,
      backCamera: document.getElementById("backCam").value,
      frontCamera: document.getElementById("frontCam").value,
      img: document.getElementById("img").value,
      desc: document.getElementById("desc").value,
      type: document.getElementById("type").value,
    };
  }

  // Form validation using Validate class
  function validateForm(isUpdate = false) {
    return validate.isValid(phoneList, isUpdate);
  }

  // Load phones data
  async function loadPhones() {
    try {
      phoneList = await phoneService.getPhonesDetails(); // Store globally for validation
      filteredPhoneList = [...phoneList]; // Initialize filtered list
      console.log(phoneList);
      // Render the phones to the table
      renderPhones(filteredPhoneList);
      updateResultsCount();
    } catch (error) {
      console.error("Error loading phones:", error);
    }
  }

  // Render phones to table (placeholder)
  function renderPhones(phones) {
    let content = "";
    phones.map((phone) => {
      content += `
        <tr>
            <td>${phone.id}</td>
            <td>${phone.name}</td>
            <td>${phone.price}</td>
            <td>
              <img src="${phone.img}" width="100" height="100"/>
            </td>
            <td>${phone.desc}</td>
            <td>
              <button class="btn btn-primary btn-sm me-2 edit-btn" data-id="${phone.id}">
                <i class="bi bi-pencil-square"></i> Edit
              </button>
              <button class="btn btn-danger btn-sm delete-btn" data-id="${phone.id}">
                <i class="bi bi-trash"></i> Delete
              </button>
            </td>
        </tr>
      `;
    });

    getEle("tablePhone").innerHTML = content;

    // Attach event listeners for edit and delete buttons
    const editButtons = document.querySelectorAll(".edit-btn");
    editButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        handleActions("Edit", this.getAttribute("data-id"));
      });
    });

    const deleteButtons = document.querySelectorAll(".delete-btn");
    deleteButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        handleActions("Delete", this.getAttribute("data-id"));
      });
    });
  }

  // Helper function to properly close modal
  function closeModal() {
    try {
      modalInstance.hide();
      // Force cleanup if needed
      setTimeout(() => {
        const backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) {
          backdrop.remove();
        }
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
      }, 300); // Wait for animation to complete
    } catch (error) {
      console.error("Error closing modal:", error);
      // Force cleanup
      const backdrop = document.querySelector(".modal-backdrop");
      if (backdrop) {
        backdrop.remove();
      }
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
  }

  // Initialize search and filter functionality
  function initializeSearchAndFilter() {
    const searchInput = getEle("searchInput");
    const priceFilter = getEle("priceFilter");
    const clearFiltersBtn = getEle("clearFilters");

    // Search functionality
    if (searchInput) {
      searchInput.addEventListener("input", function () {
        applyFilters();
      });
    }

    // Price filter functionality
    if (priceFilter) {
      priceFilter.addEventListener("change", function () {
        applyFilters();
      });
    }

    // Clear filters functionality
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener("click", function () {
        searchInput.value = "";
        priceFilter.value = "";
        applyFilters();
      });
    }
  }

  // Apply search and filter criteria
  function applyFilters() {
    const searchTerm = getEle("searchInput").value.toLowerCase().trim();
    const priceFilterValue = getEle("priceFilter").value;

    // Start with the full phone list
    filteredPhoneList = [...phoneList];

    // Apply search filter
    if (searchTerm) {
      filteredPhoneList = filteredPhoneList.filter((phone) =>
        phone.name.toLowerCase().includes(searchTerm)
      );
    }

    // Apply price filter
    if (priceFilterValue) {
      filteredPhoneList.sort((a, b) => {
        const priceA = parseFloat(a.price) || 0;
        const priceB = parseFloat(b.price) || 0;

        if (priceFilterValue === "asc") {
          return priceA - priceB; // Low to High
        } else if (priceFilterValue === "desc") {
          return priceB - priceA; // High to Low
        }
        return 0;
      });
    }

    // Render the filtered results
    renderPhones(filteredPhoneList);

    // Update results count
    updateResultsCount();
  }

  // Update results count display
  function updateResultsCount() {
    const totalCount = phoneList.length;
    const filteredCount = filteredPhoneList.length;
    const resultsCountElement = getEle("resultsCount");

    if (resultsCountElement) {
      if (filteredCount === totalCount) {
        resultsCountElement.textContent = `Showing all ${totalCount} phones`;
      } else {
        resultsCountElement.textContent = `Showing ${filteredCount} of ${totalCount} phones`;
      }
    }

    console.log(`Showing ${filteredCount} of ${totalCount} phones`);
  }

  // Initialize the page
  loadPhones();
});
