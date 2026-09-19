const signupBtn = document.querySelector("#signupBtn")
const signupForm = document.querySelector("#signupForm")
const firstName = document.querySelector("#firstName")
const lastName = document.querySelector("#lastName")
const email = document.querySelector("#email")
const password = document.querySelector("#password")

signupBtn.addEventListener("click", async (event) => {
    event.preventDefault()

    try {

        console.log("signup");

        // signup user
        const { data, error: signupError } = await client.auth.signUp({
            email: email.value,
            password: password.value,
        })

        if (signupError) {
            console.log(signupError);
        }

        console.log(data.id);

      
    } catch (error) {
        console.log(error);
    }

})