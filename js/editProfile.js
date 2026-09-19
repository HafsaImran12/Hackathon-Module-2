const firstNameInput = document.querySelector("#firstName");
const lastNameInput = document.querySelector("#lastName");
const emailInput = document.querySelector("#email");

const profileName = document.querySelector("#profileName");
const profileInitials = document.querySelector("#profileInitials");

const updateProfileForm =
  document.querySelector("#updateProfileForm");

const saveBtn =
  document.querySelector("#saveBtn");


async function loadProfile() {

  const {
    data: { user },
    error: authError
  } = await client.auth.getUser();

  if (authError) {
    console.log(authError.message);
    return;
  }

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  // Email from Supabase Auth
  emailInput.value = user.email || "";


  // Get user data
  const { data, error } = await client
    .from("user_data")
    .select("first_name, last_name")
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.log(error.message);
    return;
  }

  if (data) {

    firstNameInput.value = data.first_name || "";
    lastNameInput.value = data.last_name || "";

    const firstName = data.first_name || "";
    const lastName = data.last_name || "";

    const fullName = `${firstName} ${lastName}`.trim();

    profileName.textContent = fullName || "User";


    // Initials
    const initials =
      `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

    profileInitials.textContent = initials || "U";
  }
}


// Update Profile
updateProfileForm.addEventListener("submit", async (e) => {

  e.preventDefault();

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();

  if (!firstName || !lastName) {
    alert("Please enter first name and last name.");
    return;
  }


  const {
    data: { user }
  } = await client.auth.getUser();

  if (!user) {
    window.location.href = "login.html";
    return;
  }


  saveBtn.disabled = true;

  saveBtn.innerHTML = `
    <i class="fa-solid fa-spinner fa-spin me-1"></i>
    Saving...
  `;


  const { error } = await client
    .from("user_data")
    .update({
      first_name: firstName,
      last_name: lastName
    })
    .eq("user_id", user.id);


  if (error) {

    console.log(error.message);
Swal.fire({
  icon: "error",
  title: "Oops...",
  text: `${error.message}`
});

    saveBtn.disabled = false;

    saveBtn.innerHTML = `
      <i class="fa-solid fa-check me-1"></i>
      Save Changes
    `;

    return;
  }


Swal.fire({
  title: "Profile Updated",
  icon: "success",
  draggable: true
});

  window.location.href = "profile.html";
});


loadProfile();