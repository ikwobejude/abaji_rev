/**
 * Add Permission Modal JS
 */

'use strict';

// Add permission form validation
document.addEventListener('DOMContentLoaded', function (e) {


  const form = document.getElementById("addPermissionForm");
  form.addEventListener("submit", async function(e) {
    e.preventDefault();
    const formData = new FormData(form);
    const payload = {
      permission: formData.get("modalPermissionName")
    }

    console.log(payload)

    try {
      const req = await fetch('/admin/permission', {
        method: "post",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json"
        }
      })

      if(req.ok) {
        const res = await req.json();
        if(res.status == true) {
          toastr.success(res.message);
          setTimeout(() => {
            location.reload()
          }, "2000")
        } else {
          toastr.error(res.message);
        }
      } else {
        throw Error("Something happened")
      }
    } catch (error) {
      toastr.error(error.message);
    }
  })


  const edit_record = document.getElementById("editPermissionForm");
  edit_record.addEventListener("submit", async function(e) {
    e.preventDefault();
    const formData = new FormData(edit_record);
    const payload = {
      permission: formData.get("editPermissionName"),
      id: formData.get("id")
    }

    console.log(payload)

    try {
      const req = await fetch('/admin/permission', {
        method: "put",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json"
        }
      })

      if(req.ok) {
        const res = await req.json();
        if(res.status == true) {
          toastr.success(res.message);
          setTimeout(() => {
            location.reload()
          }, "2000")
        } else {
          toastr.error(res.message);
        }
      } else {
        throw Error("Something happened")
      }
    } catch (error) {
      toastr.error(error.message);
    }
  })


 


});

function edit(permission, id) {
  if(confirm("Are you sure you want to make this changes?")) {
    document.getElementById("editPermissionName").value = permission
    document.getElementById("id").value = id
  }
}


async function deleteRecords(id) {
  // console.log(year)
  if(confirm('Do you want to delete?')) {
    try {
      const response = await fetch(`/admin/permission?id=${id}`, {
          method: 'DELETE',
          headers: {
              'Content-Type': 'application/json',
              // Add any other headers if necessary, e.g., Authorization
          }
      })
      // console.log(response)
      if (response.ok) {
          const d = await response.json(); // or response.text() if expecting plain text
          if(d.status == true) {
            toastr.success(d.message);
            setTimeout(() => {
              location.reload()
            }, "3000");
          } else {
            toastr.error(d.message);
          }
        
      } else {
        toastr.error('Failed to delete the resource.');
          // throw new Error();
      }
    } catch (error) {
      toastr.error(error.message);
    }
  }
  
}


