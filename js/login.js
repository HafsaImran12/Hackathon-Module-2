const loginBtn = document.querySelector("#loginBtn");
const email = document.querySelector("#email");
const password = document.querySelector("#password");
const inputs = document.querySelectorAll("input");

loginBtn.addEventListener("click", async (event) => {
  event.preventDefault();

  try {
    // show empty input error

    let emptyField = false;

    inputs.forEach((input) => {
      if (input.value.trim() === "") {
        input.classList.add("emptyInput");
        emptyField = true;
      }
    });

    if (emptyField) return;

    const { data, error } = await client.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    console.log(data);
    if (error) {
    console.log(error.message);
     Swal.fire({
          icon: "error",
          title: "Login Failed",
        text: error.message,
      });
      return;
    }
    
    window.location.href = "../pages/home.html"
    
  } catch (error) {
    console.log(error);
  }
});

inputs.forEach((input) => {
  input.addEventListener("input", () => {
    input.classList.remove("emptyInput");
  });
});
