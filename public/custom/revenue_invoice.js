if (document.getElementById("form-upload-new-record")) {
  $(".spinner-border").hide();
  const dt = document.getElementById("form-upload-new-record");
  dt.addEventListener("submit", async function (e) {
    e.preventDefault();
    $(".spinner-border").show();
    const data = new FormData(dt);
    const payload = {
      base64url: data.get("base64url"),
    };

    console.log(payload);

    try {
      const request = await fetch("/admin/revenue_upload", {
        method: "post",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const response = await request.json();
      $(".spinner-border").hide();
      if (response.status == true) {
        toastr.success(response.message);
        setTimeout(() => {
          location.reload();
        }, "3000");
      } else {
        // for errors - red box
        toastr.error(response.message);
      }
    } catch (error) {
      $(".spinner-border").hide();
      // for errors - red box
      toastr.error(error.message);
    }
  });
}

const fileInput = document.getElementById("upload_excel");
//  console.log(fileInput)
fileInput.addEventListener("change", async (e) => {
  // console.log("Hi")
  try {
    $("#cover-spin").show(0);
    const file = fileInput.files[0];

    const reader = new FileReader();
    reader.addEventListener("load", async () => {
      // console.log(reader.result)
      $("#cover-spin").hide(0);
      $("#base64url").val(reader.result);
    });

    reader.readAsDataURL(file);
  } catch (error) {
    $("#cover-spin").hide(0);
    toastr.error(error.message);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const headerCheckbox = document.getElementById("all");
  const bodyCheckboxes = document.querySelectorAll("tbody #single");
  const actionDropdown = document.getElementById("action-dropdown"); // Dropdown for actions

  // Function to update the visibility of the dropdown
  function updateDropdownVisibility() {
    const anyChecked = Array.from(bodyCheckboxes).some(
      (checkbox) => checkbox.checked
    );
    actionDropdown.style.display = anyChecked ? "block" : "none";
  }

  // Handle "select all" checkbox in the header
  headerCheckbox.addEventListener("change", function () {
    const isChecked = headerCheckbox.checked;
    bodyCheckboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
    updateDropdownVisibility();
  });

  // Handle individual checkboxes in the body
  bodyCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const allChecked = Array.from(bodyCheckboxes).every(
        (checkbox) => checkbox.checked
      );
      const anyUnchecked = Array.from(bodyCheckboxes).some(
        (checkbox) => !checkbox.checked
      );

      // Update the header checkbox state
      headerCheckbox.checked = allChecked;
      headerCheckbox.indeterminate = !allChecked && !anyUnchecked;

      // Update dropdown visibility
      updateDropdownVisibility();
    });
  });

  // Initial check for dropdown visibility
  updateDropdownVisibility();
});

document.addEventListener("DOMContentLoaded", function () {
  const headerCheckbox = document.getElementById("all");
  const bodyCheckboxes = document.querySelectorAll("tbody #single");

  // Handle "select all" checkbox in the header
  headerCheckbox.addEventListener("change", function () {
    const isChecked = headerCheckbox.checked;
    bodyCheckboxes.forEach((checkbox) => {
      checkbox.checked = isChecked;
    });
  });

  // Handle individual checkboxes in the body
  bodyCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const allChecked = Array.from(bodyCheckboxes).every(
        (checkbox) => checkbox.checked
      );
      const anyUnchecked = Array.from(bodyCheckboxes).some(
        (checkbox) => !checkbox.checked
      );

      // Update the header checkbox state
      headerCheckbox.checked = allChecked;
      headerCheckbox.indeterminate = !allChecked && !anyUnchecked;
    });
  });
});

if(document.getElementById("staff")) {
     // Initialize Select2 on your select element
     $(document).ready(function () {
        // const actionDropdown = $('#action-dropdown');
        
        // // Initialize Select2
        // $('.custom-select').select2({
        //   placeholder: "Search for a product...",
        //   allowClear: true,
        //   minimumInputLength: 3,
        //   ajax: {
        //     url: '/search_product',
        //     dataType: 'json',
        //     delay: 250,
        //     data: function (params) {
        //       return {
        //         q: params.term // Search term
        //       };
        //     },
        //     processResults: function (data) {
        //       return {
        //         results: data.map(function (product) {
        //           return {
        //             id: product.prod_id,  // Value for select option
        //             text: `${product.pro_name} ${product.unit_price}` // Display text for option
        //           };
        //         })
        //       };
        //     },
        //     cache: true
        //   }
        // });
      

        fetch(`/admin/all_users`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Process the response data if needed
        })
        .then(data => {
            console.log(data)
            populateFaculty(data)
        })
        .catch(error => {
            console.log(error)
            toastr.error(error.message);
        });
        
      });
      
}

const populateFaculty = (data) => {
    // console.log(id)
    if(data.length > 0) {
        const selection = document.getElementById("staff");
        selection.innerHTML = "";
        const option1 = document.createElement("option");
        option1.value = "";
        option1.textContent = "Select option";
        selection.appendChild(option1);
        data.forEach(dt => {
          const option = document.createElement("option");
          option.value = dt.id;
          option.textContent = dt.name;
          selection.appendChild(option);
        });
        
    }
}
