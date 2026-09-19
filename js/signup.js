const signupBtn = document.querySelector("#signupBtn");
const signupForm = document.querySelector("#signupForm");
const firstName = document.querySelector("#firstName");
const lastName = document.querySelector("#lastName");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const inputs = document.querySelectorAll("input");

signupBtn.addEventListener("click", async (event) => {
  event.preventDefault();
  
  try {
    console.log("signup");
    
    // show empty input error

    let emptyField = false;
    
    inputs.forEach((input) => {
      if (input.value.trim() === "") {
        input.classList.add("emptyInput");
        emptyField = true;
      }
    });

    if(emptyField) return

    // signup user
    const { data, error: signupError } = await client.auth.signUp({
      email: email.value,
      password: password.value,
    });

    // Agar signup mein error ho
    if (signupError) {
      console.log(signupError.message);

      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text: error.message,
      });

      return;
    }

    // ================== Get User ID ==================

    const id = data.user?.id;

    console.log("User ID:", id);

    if (!id) {
      console.log("User ID not found");
      return;
    }

    const { error } = await client.from("user_data").insert({
      user_id: id,
      first_name: firstName.value,
      last_name: lastName.value,
    });

    if (error) {
      console.log(`Insert Error: ${error.message}`);
      Swal.fire({
        icon: "error",
        title: "Signup Failed",
        text: error.message,
      });

      return;
    }

    window.location.href = "../pages/home.html";
  } catch (error) {
    console.log(error);
  }
});


inputs.forEach(input => {
  input.addEventListener("input", () => {
    input.classList.remove("emptyInput")
  })
});