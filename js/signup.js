const signupBtn = document.querySelector("#signupBtn")
const signupForm = document.querySelector("#signupForm")
const firstName = document.querySelector("#firstName")
const lastName = document.querySelector("#lastName")
const email = document.querySelector("#email")
const password = document.querySelector("#password")
const confirmPassword = document.querySelector("#confirmPassword")

signupBtn.addEventListener("click", async (event) => {
    event.preventDefault()

    try {

        if(confirmPassword === password){

        }

        console.log("signup");

        // signup user
        const { data, error: signupError } = await client.auth.signUp({
            email: email.value,
            password: password.value,
        })

        // Agar signup mein error ho
        if (signupError) {
            console.log(error.message);

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


        const { error } = await client
            .from('user_data')
            .insert({ id: 1, first_name: firstName, last_name: lastName })

    } catch (error) {
        console.log(error);
    }

})